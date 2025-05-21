import { gapi } from "gapi-script";

// Environment variables
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const CALENDAR_ID = "c_73d12ba30232f814ea46ab35ee3905da76ab7a17d21f7db0db928faf90c95675@group.calendar.google.com";

// Constants for ID generation
const EVENT_ID_PREFIX = "lpa_"; // Prefix to identify our events
const EVENT_ID_SEPARATOR = "_";

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
          scope: "https://www.googleapis.com/auth/calendar.events",
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
 * Fetch all events from Google Calendar
 * @returns {Promise<Array>} Array of calendar events
 */
export const fetchEvents = async () => {
  const response = await gapi.client.calendar.events.list({
    calendarId: CALENDAR_ID,
    timeMin: new Date().toISOString(),
    showDeleted: false,
    singleEvents: true,
    orderBy: "startTime",
  });
  return response.result.items || [];
};

/**
 * Generate a unique Google Calendar event ID from backend event data
 * Format: lpa_[backendId]_[hash]
 * The hash is generated from event properties to ensure uniqueness
 * 
 * @param {Object} event - Event object containing backend event data
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
 * Create a new event in Google Calendar
 * @param {Object} event - Event object containing summary, start, end, etc.
 * @returns {Promise<Object>} Created event
 */
export const createEvent = async (event) => {
  const eventId = generateEventId(event, event.backendId);
  const response = await gapi.client.calendar.events.insert({
    calendarId: CALENDAR_ID,
    resource: {
      id: eventId, // Set our custom ID
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
 * @param {Object} updatedEvent - Updated event object
 * @returns {Promise<Object>} Updated event
 */
export const updateEvent = async (updatedEvent) => {
  const eventId = generateEventId(updatedEvent, updatedEvent.backendId);
  const response = await gapi.client.calendar.events.patch({
    calendarId: CALENDAR_ID,
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
 * @param {Object} event - Event object containing backend event data
 * @returns {Promise<void>}
 */
export const deleteEvent = async (event) => {
  const eventId = generateEventId(event, event.backendId);
  await gapi.client.calendar.events.delete({
    calendarId: CALENDAR_ID,
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
 * @param {Array} bookings - Array of booking objects
 * @returns {Promise<Object>} Result of batch operation
 */
export const batchInsertBookings = async (bookings) => {
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

    batch.add(gapi.client.calendar.events.insert({ calendarId: CALENDAR_ID, resource }), { id: `req${index}` });
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
