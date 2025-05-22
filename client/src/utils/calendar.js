import { gapi } from "gapi-script";

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
    event.date,
    event.startTime,
    event.endTime,
    event.roomId,
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
 * Extract the backend event ID from a Google Calendar event ID
 * NOT USED
 * 
 * @param {string} googleEventId - The Google Calendar event ID
 * @returns {number|null} The backend event ID if valid, null if invalid
 */
export const extractBackendId = (googleEventId) => {
  if (!googleEventId?.startsWith(EVENT_ID_PREFIX)) {
    return null;
  }

  const parts = googleEventId.split(EVENT_ID_SEPARATOR);
  if (parts.length !== 2) {
    return null;
  }

  // Remove prefix and get the backend ID
  const backendId = parseInt(parts[0].slice(EVENT_ID_PREFIX.length));
  return isNaN(backendId) ? null : backendId;
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
  return gapi.auth2.getAuthInstance()?.signIn();
};

/**
 * Handle Google sign out
 * @returns {Promise<void>}
 */
export const signOut = async () => {
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
 * Generate recurring sessions based on a template
 * @param {Object} recurringSession - Template session with session ids, weekday, startTime, endTime, location, description
 * @param {string} startDate - Start date in ISO format
 * @param {string} endDate - End date in ISO format
 * @returns {Array} Array of generated sessions
 */

/** 
export const generateRecurringSessions = (recurringSession, startDate, endDate) => {
  const sessions = [];
  const currentTimezoneDate = new Date(startDate.replace(/-/g, '/').replace(/T.+/, ''));
  const currentDate = new Date(startDate);
  const endDateObj = new Date(endDate);
  const weekdays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const weekdayIndex = weekdays.indexOf(recurringSession.weekday.toLowerCase());
  const startDayOfWeek = currentTimezoneDate.getDay();
  const daysUntilFirst = (weekdayIndex - startDayOfWeek + 7) % 7;

  if (daysUntilFirst > 0) {
    currentDate.setDate(currentDate.getDate() + daysUntilFirst);
  }

  while (currentDate <= endDateObj) {
    sessions.push({
      date: currentDate.toISOString(),
      startTime: recurringSession.startTime,
      endTime: recurringSession.endTime,
      roomId: recurringSession.roomId,
      eventId: 383, // This should probably be configurable
      archived: false,
    });
    currentDate.setDate(currentDate.getDate() + 7);
  }

  return sessions;
};
*/

/**
 * Batch insert multiple bookings into Google Calendar
 * @param {BookingEvent[]} bookings - Array of booking objects to insert
 * @returns {Promise<BatchOperationResult>} Result of batch operation
 */
export const batchInsertBookings = async (bookings) => {
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
  });

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
        // Include the full response map in case we need to process individual results
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
  const calendarId = getSelectedCalendarId();
  if (!calendarId) {
    throw new Error('No calendar selected');
  }

  const batch = gapi.client.newBatch();

  bookings.forEach((booking, index) => {
    const eventId = generateEventId(booking, booking.backendId);
    
    batch.add(
      gapi.client.calendar.events.delete({
        calendarId,
        eventId: eventId
      }), 
      { id: `delete_${index}` }
    );
  });

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
        // Include the full response map in case we need to process individual results
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
 * Get all available calendars for the authenticated user
 * @returns {Promise<Array<{id: string, summary: string, description?: string, primary?: boolean}>>} 
 * Array of calendar objects containing id, name (summary), and optional description and primary status
 */
export const getAvailableCalendars = async () => {
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
