import { gapi } from "gapi-script";
import { useState } from "react";

// Environment variables
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

// Local storage key for the selected calendar
export const SELECTED_CALENDAR_KEY = 'lpa_selected_calendar';

export const EVENT_ID_PREFIX = 'lpa';
export const EVENT_ID_SEPARATOR = '';

/**
 * @typedef {Object} BookingEvent
 * @property {number} backendId - The unique identifier
 * @property {string} name - The name/title of the event
 * @property {string} start - The start time in ISO 8601 format 
 * @property {string} end - The end time in ISO 8601 format
 * @property {string} [location] - Optional location/room of the event
 * @property {string} [description] - Optional description of the event
 * @property {number} [roomId] - Optional room ID from our backend
 */

/**
 * @typedef {Object} GoogleCalendarEvent
 * @property {string} id - The Google Calendar event ID
 * @property {string} summary - The name/title of the event
 * @property {Object} start - The start time of the event
 * @property {string} start.dateTime - ISO 8601 datetime string
 * @property {string} start.timeZone - IANA timezone string
 * @property {Object} end - The end time of the event
 * @property {string} end.dateTime - ISO 8601 datetime string
 * @property {string} end.timeZone - IANA timezone string
 * @property {string} [location] - Optional location of the event
 * @property {string} [description] - Optional description of the event
 */

/**
 * @typedef {Object} BatchOperationResult
 * @property {number} total - Total number of operations attempted
 * @property {number} successCount - Number of successful operations
 * @property {number} failCount - Number of failed operations
 * @property {Array<{bookingIndex: number, error: Object}>} errors - Details of any errors that occurred
 * @property {Object} responseMap - Raw response from Google Calendar API
 */

/**
 * IDs for events must be unique and between 5 - 1024 characters
 * Our session IDs do not meet this requirement, so we need to generate a new ID
 */

/**
 * Generate a unique Google Calendar event ID from backend event data
 * Format: lpa_[backendId]_[hash]
 * The hash is generated from event properties to ensure uniqueness
 * 
 * @param {BookingEvent} event - Event object containing backend event data
 * @param {number} backendId - The backend event ID
 * @returns {string} A unique Google Calendar event ID
 */
export const generateEventId = (event, backendId) => {
  // Create a string of unique event properties that should make this event unique
  const uniqueProps = [
    backendId.toString()
  ].join('|');

  // Generate a simple hash of the unique properties
  // Using a simple hash function that will give us a consistent output
  let hash = 0;
  for (let i = 0; i < uniqueProps.length; i++) {
    const char = uniqueProps.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  // Convert to positive hex string and take first 8 chars
  const hashStr = Math.abs(hash).toString(16).padStart(8, '0').slice(0, 8);
  
  // Combine prefix, backend ID, and hash
  return `${EVENT_ID_PREFIX}${backendId}${EVENT_ID_SEPARATOR}${hashStr}`;
};

/**
 * Initialize the Google API client and load the calendar API
 * @returns {Promise<void>}
 */
export const initializeGoogleCalendar = async () => {
  return new Promise((resolve, reject) => {
    function start() {
      gapi.client
        .init({
          apiKey: GOOGLE_API_KEY,
          clientId: GOOGLE_CLIENT_ID,
          scope: "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly",
          prompt: 'select_account'  // This will force the account selector to appear every time
        })
        .then(() => gapi.client.load("calendar", "v3"))
        .then(() => {
          const auth2 = gapi.auth2.getAuthInstance();
          if (auth2) {
            resolve(auth2);
          } else {
            reject(new Error("Failed to initialize Google Auth"));
          }
        })
        .catch(reject);
    }
    gapi.load("client:auth2", start);
  });
};

/**
 * Handle Google sign in
 * @returns {Promise<void>}
 */
export const signIn = async () => {
  await initializeGoogleCalendar();
  return gapi.auth2.getAuthInstance()?.signIn({
    prompt: 'select_account'
  });
};

/**
 * Handle Google sign out
 * @returns {Promise<void>}
 */
export const signOut = async () => {
  await initializeGoogleCalendar();
  return gapi.auth2.getAuthInstance()?.signOut();
};

/**
 * Get the currently selected calendar ID
 * @returns {string} The selected calendar ID or null if none selected
 */
export const getSelectedCalendarId = () => {
  const saved = localStorage.getItem(SELECTED_CALENDAR_KEY);
  if (!saved) return null;
  try {
    const calendar = JSON.parse(saved);
    return calendar.id;
  } catch {
    return null;
  }
};

/**
 * Fetch all events from Google Calendar
 * @returns {Promise<GoogleCalendarEvent[]>} Array of calendar events
 */
export const fetchEvents = async () => {
  await initializeGoogleCalendar();
  const calendarId = getSelectedCalendarId();
  if (!calendarId) {
    throw new Error('No calendar selected');
  }

  const response = await gapi.client.calendar.events.list({
    calendarId,
    timeMin: new Date().toISOString(),
    showDeleted: false,
    singleEvents: true,
    orderBy: "startTime",
  });
  return response.result.items || [];
};

/**
 * Create a new event in Google Calendar
 * @param {BookingEvent} event - Event object containing summary, start, end, etc.
 * @returns {Promise<GoogleCalendarEvent>} Created event
 */
export const createEvent = async (event) => {
  await initializeGoogleCalendar();
  const calendarId = getSelectedCalendarId();
  if (!calendarId) {
    throw new Error('No calendar selected');
  }

  const eventId = generateEventId(event, event.backendId);
  const response = await gapi.client.calendar.events.insert({
    calendarId,
    resource: {
      id: eventId,
      ...event,
      start: {
        dateTime: new Date(event.start).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: new Date(event.end).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      description: event.description || "",
      location: event.room || "",
    },
  });
  return response.result;
};

/**
 * Update an existing event in Google Calendar
 * @param {BookingEvent} updatedEvent - Updated event object
 * @returns {Promise<GoogleCalendarEvent>} Updated event
 */
export const updateEvent = async (updatedEvent) => {
  await initializeGoogleCalendar();
  const calendarId = getSelectedCalendarId();
  if (!calendarId) {
    throw new Error('No calendar selected');
  }

  const eventId = generateEventId(updatedEvent, updatedEvent.backendId);
  const response = await gapi.client.calendar.events.patch({
    calendarId,
    eventId,
    resource: {
      ...updatedEvent,
      start: {
        dateTime: new Date(updatedEvent.start).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: new Date(updatedEvent.end).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      description: updatedEvent.description || "",
      location: updatedEvent.room || "",
    },
  });
  return response.result;
};

/**
 * Delete an event from Google Calendar
 * @param {BookingEvent} event - Event object containing backend event data
 * @returns {Promise<void>}
 */
export const deleteEvent = async (event) => {
  await initializeGoogleCalendar();
  const calendarId = getSelectedCalendarId();
  if (!calendarId) {
    throw new Error('No calendar selected');
  }

  const eventId = generateEventId(event, event.backendId);
  await gapi.client.calendar.events.delete({
    calendarId,
    eventId,
  });
};

/**
 * Batch insert multiple bookings into Google Calendar
 * @param {BookingEvent[]} bookings - Array of booking objects to insert
 * @returns {Promise<BatchOperationResult>} Result of batch operation
 */
export const batchInsertBookings = async (bookings) => {
  await initializeGoogleCalendar();
  const calendarId = getSelectedCalendarId();
  if (!calendarId) {
    throw new Error('No calendar selected');
  }

  const batch = gapi.client.newBatch();

  bookings.forEach((booking, index) => {
    const date = booking.date.split("T")[0];
    const start = booking.startTime.split('+')[0].trim();
    const end = booking.endTime.split('+')[0].trim();
    const startDateTime = new Date(`${date}T${start}`).toISOString();
    const endDateTime = new Date(`${date}T${end}`).toISOString();
    const eventId = generateEventId(booking, booking.backendId);
    const location = booking.location || "";
    const description = booking.description || "";

    // console.log("NEW EVENT ID: ", eventId);

    const resource = {
      summary: booking.name,
      id: eventId,
      start: {
        dateTime: startDateTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: endDateTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      location: location,
      description: description,
    };

    batch.add(gapi.client.calendar.events.insert({ calendarId, resource }), { id: `req${index}` });
  });

  return new Promise((resolve) => {
    batch.execute(responseMap => {
      const total = bookings.length;
      const successCount = Object.values(responseMap).filter(r => !r.error).length;
      const failCount = total - successCount;
      resolve({ total, successCount, failCount });
    });
  });
};

/**
 * Batch update multiple bookings in Google Calendar
 * @param {BookingEvent[]} bookings - Array of booking objects to update
 * @returns {Promise<BatchOperationResult>} Result of batch operation
 */
export const batchUpdateBookings = async (bookings) => {
  await initializeGoogleCalendar();
  const calendarId = getSelectedCalendarId();
  if (!calendarId) {
    throw new Error('No calendar selected');
  }

  const batch = gapi.client.newBatch();
  let addedCount = 0;

  for (const [index, booking] of bookings.entries()) {
    const date = booking.date.split("T")[0];
    const start = booking.startTime.split('+')[0].trim();
    const end = booking.endTime.split('+')[0].trim();
    const startDateTime = new Date(`${date}T${start}`).toISOString();
    const endDateTime = new Date(`${date}T${end}`).toISOString();
    const eventId = generateEventId(booking, booking.backendId);
    const location = booking.location || "";
    const description = booking.description || "";

    // Check if the event exists
    try {
      const eventExists = await gapi.client.calendar.events.get({
        calendarId,
        eventId: eventId
      });
      if (eventExists.result) {
        const resource = {
          summary: booking.name,
          start: {
            dateTime: startDateTime,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          end: {
            dateTime: endDateTime,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          location: location,
          description: description,
        };

        batch.add(
          gapi.client.calendar.events.patch({
            calendarId,
            eventId: eventId,
            resource: resource
          }), 
          { id: `update_${index}` }
        );
        addedCount++;
      }
    } catch (error) {
      console.log("EVENT DOES NOT EXIST: ", eventId);
      // Skip this booking if event doesn't exist
    }
  }

  if (addedCount === 0) {
    return {
      total: 0,
      successCount: 0,
      failCount: 0,
      addedCount: 0
    };
  }

  return new Promise((resolve) => {
    batch.execute(responseMap => {
      const total = bookings.length;
      const successCount = Object.values(responseMap).filter(r => !r.error).length;
      const failCount = total - successCount;
      
      // Collect any errors for reporting
      const errors = Object.entries(responseMap)
        .filter(([_, response]) => response.error)
        .map(([id, response]) => ({
          bookingIndex: parseInt(id.split('_')[1]),
          error: response.error
        }));

      resolve({ 
        total, 
        successCount, 
        failCount,
        errors,
        addedCount,
        responseMap 
      });
    });
  });
};

/**
 * Batch delete multiple bookings from Google Calendar
 * @param {BookingEvent[]} bookings - Array of booking objects to delete
 * @returns {Promise<BatchOperationResult>} Result of batch operation
 */
export const batchDeleteBookings = async (bookings) => {
  await initializeGoogleCalendar();
  const calendarId = getSelectedCalendarId();
  if (!calendarId) {
    throw new Error('No calendar selected');
  }

  const batch = gapi.client.newBatch();
  let addedCount = 0;

  for (const [index, booking] of bookings.entries()) {
    const eventId = generateEventId(booking, booking.backendId);
    
    // Check if the event exists
    try {
      const eventExists = await gapi.client.calendar.events.get({
        calendarId,
        eventId: eventId
      });
      if (eventExists.result) {
        batch.add(
          gapi.client.calendar.events.delete({
            calendarId,
            eventId: eventId
          }), 
          { id: `delete_${index}` }
        );
        addedCount++;
      }
    } catch (error) {
      // Skip this booking if event doesn't exist
    }
  }

  if (addedCount === 0) {
    return {
      total: 0,
      successCount: 0,
      failCount: 0,
      addedCount: 0
    };
  }

  return new Promise((resolve) => {
    batch.execute(responseMap => {
      const total = bookings.length;
      // For delete operations, a 204 status code means success
      // and no response body is returned, so we check for absence of error
      const successCount = Object.values(responseMap).filter(r => !r.error).length;
      const failCount = total - successCount;
      
      // Collect any errors for reporting
      const errors = Object.entries(responseMap)
        .filter(([_, response]) => response.error)
        .map(([id, response]) => ({
          bookingIndex: parseInt(id.split('_')[1]),
          error: response.error
        }));

      resolve({ 
        total, 
        successCount, 
        failCount,
        errors,
        addedCount,
        responseMap 
      });
    });
  });
};

/**
 * Check if the Google Calendar API is initialized and ready
 * @returns {boolean} True if the API is ready to use
 */
export const isCalendarApiReady = () => {
  return gapi.client?.calendar !== undefined;
};

/**
 * Check if the user is currently signed into their Google account
 * @returns {boolean} True if the user is signed in, false otherwise
 */
export const isSignedIn = () => {
  if (!isCalendarApiReady()) {
    return false;
  }

  const auth2 = gapi.auth2.getAuthInstance();
  if (!auth2) return false;
  return auth2.isSignedIn.get();
};

/**
 * Get the user's Google Calendar email address
 * @returns {Promise<string>} The user's Google Calendar email address
 */
export const getCalendarEmail = async () => {
  await initializeGoogleCalendar();
  const calendars = await getAvailableCalendars();
  const primaryCalendar = calendars.find(calendar => calendar.primary);
  return primaryCalendar.id;
};

/**
 * Hook to manage the selected calendar in local storage
 */
export const useSelectedCalendar = () => {
  const [selectedCalendar, setSelectedCalendar] = useState(() => {
    const saved = localStorage.getItem(SELECTED_CALENDAR_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const updateSelectedCalendar = (calendar) => {
    setSelectedCalendar(calendar);
    localStorage.setItem(SELECTED_CALENDAR_KEY, JSON.stringify(calendar));
  };

  return [selectedCalendar, updateSelectedCalendar];
};

/**
 * Get all available calendars for the authenticated user
 * @returns {Promise<Array<{id: string, summary: string, description?: string, primary?: boolean}>>} 
 * Array of calendar objects containing id, name (summary), and optional description and primary status
 */
export const getAvailableCalendars = async () => {
  await initializeGoogleCalendar();
  if (!isCalendarApiReady()) {
    throw new Error('Google Calendar API is not initialized. Please wait for initialization to complete.');
  }

  const response = await gapi.client.calendar.calendarList.list({
    showHidden: false,
    showDeleted: false,
  });

  const result = response.result.items.map(calendar => ({
    id: calendar.id,
    summary: calendar.summary,
    description: calendar.description,
    primary: calendar.primary,
  }));

  return result;
};
