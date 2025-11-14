import { useState, useCallback } from "react";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_CALENDAR_SCOPES = [
  "openid",
  "profile",
  "email",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.readonly",
].join(" ");

export const SELECTED_CALENDAR_KEY = "lpa_selected_calendar";
export const EVENT_ID_PREFIX = "lpa";
export const EVENT_ID_SEPARATOR = "";

const TOKEN_EXPIRY_SKEW_MS = 60_000; // refresh token one minute before expiry
const isBrowser = typeof window !== "undefined";

// LocalStorage keys for persisting auth state
const ACCESS_TOKEN_KEY = "lpa_google_calendar_access_token";
const TOKEN_EXPIRES_AT_KEY = "lpa_google_calendar_token_expires_at";

let tokenClient = null;
let accessToken = null;
let tokenExpiresAt = 0;
let initializationPromise = null;
let pendingTokenRequest = null;
const authListeners = new Set();

// Load token from localStorage on module initialization
const loadTokenFromStorage = () => {
  if (!isBrowser) return;
  try {
    const storedToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const storedExpiresAt = localStorage.getItem(TOKEN_EXPIRES_AT_KEY);
    
    if (storedToken && storedExpiresAt) {
      const expiresAt = Number(storedExpiresAt);
      // Only restore if token hasn't expired
      if (Date.now() < expiresAt) {
        accessToken = storedToken;
        tokenExpiresAt = expiresAt;
      } else {
        // Token expired, clear storage
        clearTokenStorage();
      }
    }
  } catch (error) {
    console.error("Failed to load token from storage:", error);
    clearTokenStorage();
  }
};

// Save token to localStorage
const saveTokenToStorage = (token, expiresAt) => {
  if (!isBrowser) return;
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    localStorage.setItem(TOKEN_EXPIRES_AT_KEY, expiresAt.toString());
  } catch (error) {
    console.error("Failed to save token to storage:", error);
  }
};

// Clear token from localStorage
const clearTokenStorage = () => {
  if (!isBrowser) return;
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRES_AT_KEY);
  } catch (error) {
    console.error("Failed to clear token from storage:", error);
  }
};

// Load token on module initialization
loadTokenFromStorage();

// Define isSignedIn early so it can be used in notifyAuthListeners
const isSignedInImpl = () =>
  Boolean(accessToken && tokenExpiresAt && Date.now() < tokenExpiresAt);

const notifyAuthListeners = () => {
  const signedIn = isSignedInImpl();
  authListeners.forEach((listener) => {
    try {
      listener(signedIn);
    } catch (error) {
      console.error("Auth listener failed", error);
    }
  });
};

const clearAccessToken = () => {
  accessToken = null;
  tokenExpiresAt = 0;
  clearTokenStorage();
};

const isAuthError = (error) => {
  if (!error) return false;
  if (error.__auth === true) return true;
  const message = typeof error === "string" ? error : error.message || "";
  return (
    message.includes("interaction") ||
    message.includes("prompt") ||
    message.includes("consent") ||
    message.includes("access_denied") ||
    message.includes("User closed the popup")
  );
};

const markAuthError = (error) => {
  if (error && typeof error === "object") {
    error.__auth = true;
  }
  return error;
};

const loadGoogleIdentityScript = () => {
  if (!isBrowser) {
    throw new Error("Google Identity Services requires a browser environment.");
  }

  if (window.google?.accounts?.oauth2) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    let script = document.querySelector(
      'script[data-google-identity="true"]'
    );

    if (!script) {
      script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.dataset.googleIdentity = "true";
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error("Failed to load Google Identity Services script"));
      document.head.appendChild(script);
    } else if (script.dataset.loaded === "true") {
      resolve();
    } else {
      script.addEventListener("load", resolve, { once: true });
      script.addEventListener(
        "error",
        () =>
          reject(new Error("Failed to load Google Identity Services script")),
        { once: true }
      );
    }
  });
};

const initTokenClient = () => {
  if (tokenClient) return;
  if (!isBrowser || !window.google?.accounts?.oauth2) {
    throw new Error("Google Identity Services is not available");
  }
  if (!GOOGLE_CLIENT_ID) {
    throw new Error(
      "Missing Google OAuth client ID. Set VITE_GOOGLE_CLIENT_ID in your environment."
    );
  }

  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: GOOGLE_CALENDAR_SCOPES,
    callback: () => {
      /* placeholder; real callback injected per request */
    },
  });
};

const requestAccessToken = (interactive) => {
  if (!tokenClient) {
    throw new Error("Token client not initialized");
  }

  if (pendingTokenRequest) {
    return pendingTokenRequest;
  }

  pendingTokenRequest = new Promise((resolve, reject) => {
    const options = interactive ? { prompt: "consent" } : {};

    tokenClient.callback = (response) => {
      pendingTokenRequest = null;
      if (response.error) {
        reject(markAuthError(new Error(response.error)));
        return;
      }

      accessToken = response.access_token;
      if (response.expires_in) {
        tokenExpiresAt =
          Date.now() + Number(response.expires_in) * 1000 - TOKEN_EXPIRY_SKEW_MS;
      } else {
        tokenExpiresAt = Date.now() + 55 * 60 * 1000;
      }
      // Persist token to localStorage
      saveTokenToStorage(accessToken, tokenExpiresAt);
      notifyAuthListeners();
      resolve(accessToken);
    };

    try {
      tokenClient.requestAccessToken(options);
    } catch (error) {
      pendingTokenRequest = null;
      reject(markAuthError(error));
    }
  });

  return pendingTokenRequest;
};

const ensureAccessToken = async ({ interactive = false } = {}) => {
  if (
    accessToken &&
    tokenExpiresAt &&
    Date.now() < tokenExpiresAt - TOKEN_EXPIRY_SKEW_MS / 2
  ) {
    return accessToken;
  }

  try {
    return await requestAccessToken(interactive);
  } catch (error) {
    if (isAuthError(error)) {
      markAuthError(error);
    }
    throw error;
  }
};

const googleApiRequest = async (
  input,
  {
    method = "GET",
    body,
    headers = {},
    interactiveFallback = true,
    retry = true,
  } = {}
) => {
  const makeRequest = async () => {
    const token = await ensureAccessToken({ interactive: false });

    const response = await fetch(input, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (response.status === 204) {
      return null;
    }

    const responseText = await response.text();
    const data = responseText ? JSON.parse(responseText) : null;

    if (!response.ok) {
      if (response.status === 401 && retry) {
        clearAccessToken();
        return makeRequest();
      }
      const error = new Error(
        data?.error?.message ||
          data?.error_description ||
          `Google API request failed with status ${response.status}`
      );
      error.status = response.status;
      error.details = data?.error || data;
      throw error;
    }

    return data;
  };

  try {
    return await makeRequest();
  } catch (error) {
    if (isAuthError(error) || error.status === 401) {
      clearAccessToken();
      if (!interactiveFallback) {
        throw markAuthError(
          new Error("Google authorization required for this action.")
        );
      }
      await ensureAccessToken({ interactive: true });
      return makeRequest();
    }
    throw error;
  }
};

export const initializeGoogleCalendar = async (options = {}) => {
  const { skipSilentAuth = false } = options;
  
  if (initializationPromise) {
    return initializationPromise;
  }

  if (!isBrowser) {
    throw new Error(
      "Google Calendar integration is only available in a browser environment."
    );
  }

  initializationPromise = (async () => {
    await loadGoogleIdentityScript();
    initTokenClient();

    // Only try silent auth if not explicitly skipped
    // This prevents auto-redirects when just initializing the API
    if (!skipSilentAuth) {
      try {
        await ensureAccessToken({ interactive: false });
      } catch (error) {
        if (!isAuthError(error)) {
          console.error("Silent Google sign-in failed", error);
        }
      }
    }
  })();

  await initializationPromise;
  return tokenClient;
};

export const signIn = async () => {
  await initializeGoogleCalendar();
  try {
    await ensureAccessToken({ interactive: true });
    return true;
  } catch (error) {
    if (isAuthError(error)) {
      throw new Error(
        "Google authorization was cancelled or denied. Please try again."
      );
    }
    throw error;
  }
};

export const signOut = async () => {
  if (!accessToken) {
    return;
  }

  try {
    await fetch("https://oauth2.googleapis.com/revoke", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `token=${accessToken}`,
    });
  } catch (error) {
    console.warn("Failed to revoke Google token", error);
  } finally {
    clearAccessToken();
    notifyAuthListeners();
  }
};

export const onSignInStatusChange = (listener) => {
  authListeners.add(listener);
  return () => authListeners.delete(listener);
};

export const isCalendarApiReady = () => tokenClient !== null;

export const isSignedIn = isSignedInImpl;

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

export const generateEventId = (event, backendId) => {
  const effectiveId = backendId ?? event?.backendId;
  if (!effectiveId) {
    throw new Error("A backendId is required to generate a Google event ID.");
  }

  const uniqueProps = [effectiveId.toString()].join("|");

  let hash = 0;
  for (let i = 0; i < uniqueProps.length; i += 1) {
    const char = uniqueProps.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }

  const hashStr = Math.abs(hash).toString(16).padStart(8, "0").slice(0, 8);
  return `${EVENT_ID_PREFIX}${effectiveId}${EVENT_ID_SEPARATOR}${hashStr}`;
};

const toDateTime = (value) => {
  if (!value) return new Date().toISOString();
  if (typeof value === "string") return new Date(value).toISOString();
  if (typeof value === "object" && value.dateTime) {
    return new Date(value.dateTime).toISOString();
  }
  return new Date(value).toISOString();
};

const buildEventResourceFromBooking = (booking, eventId) => {
  const summary = booking.summary || booking.name || "";
  if (!summary) {
    throw new Error("Event summary is required.");
  }

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const startDateTime = toDateTime(booking.start);
  const endDateTime = toDateTime(booking.end);

  return {
    id: eventId,
    summary,
    description: booking.description || "",
    location: booking.room || booking.location || "",
    start: {
      dateTime: startDateTime,
      timeZone: timezone,
    },
    end: {
      dateTime: endDateTime,
      timeZone: timezone,
    },
  };
};

const buildEventResourceFromSchedule = (booking, eventId) => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const summary = booking.summary || booking.name || "";
  if (!summary) {
    throw new Error("Event summary is required.");
  }

  const date = booking.date.split("T")[0];
  const startTime = booking.startTime.split("+")[0].trim();
  const endTime = booking.endTime.split("+")[0].trim();
  const startDateTime = new Date(`${date}T${startTime}`).toISOString();
  const endDateTime = new Date(`${date}T${endTime}`).toISOString();

  return {
    id: eventId,
    summary,
    description: booking.description || "",
    location: booking.location || "",
    start: {
      dateTime: startDateTime,
      timeZone: timezone,
    },
    end: {
      dateTime: endDateTime,
      timeZone: timezone,
    },
  };
};

const getCalendarBaseUrl = (calendarId) =>
  `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
    calendarId
  )}`;

export const fetchEvents = async () => {
  await initializeGoogleCalendar();
  const calendarId = getSelectedCalendarId();
  if (!calendarId) {
    throw new Error("No calendar selected");
  }

  const params = new URLSearchParams({
    timeMin: new Date().toISOString(),
    showDeleted: "false",
    singleEvents: "true",
    orderBy: "startTime",
  });

  const data = await googleApiRequest(
    `${getCalendarBaseUrl(calendarId)}/events?${params.toString()}`,
    { interactiveFallback: false }
  );

  return data?.items ?? [];
};

export const createEvent = async (event, backendIdOverride) => {
  await initializeGoogleCalendar();
  const calendarId = getSelectedCalendarId();
  if (!calendarId) {
    throw new Error("No calendar selected");
  }

  const eventId = generateEventId(event, backendIdOverride);
  const resource = buildEventResourceFromBooking(
    {
      ...event,
      room: event.room,
      location: event.location,
    },
    eventId
  );

  return googleApiRequest(`${getCalendarBaseUrl(calendarId)}/events`, {
    method: "POST",
    body: resource,
  });
};

export const updateEvent = async (eventIdOrBooking, updatedEvent) => {
  await initializeGoogleCalendar();
  const calendarId = getSelectedCalendarId();
  if (!calendarId) {
    throw new Error("No calendar selected");
  }

  const isIdOnly = typeof eventIdOrBooking === "string";
  const eventId = isIdOnly
    ? eventIdOrBooking
    : generateEventId(eventIdOrBooking, eventIdOrBooking.backendId);
  const eventData = isIdOnly ? updatedEvent : eventIdOrBooking;

  const resource = buildEventResourceFromBooking(
    {
      ...eventData,
      start: eventData.start,
      end: eventData.end,
    },
    eventId
  );

  return googleApiRequest(`${getCalendarBaseUrl(calendarId)}/events/${eventId}`, {
    method: "PATCH",
    body: resource,
  });
};

export const deleteEvent = async (eventOrId, backendIdOverride) => {
  await initializeGoogleCalendar();
  const calendarId = getSelectedCalendarId();
  if (!calendarId) {
    throw new Error("No calendar selected");
  }

  const eventId =
    typeof eventOrId === "string"
      ? eventOrId
      : generateEventId(eventOrId, backendIdOverride);

  await googleApiRequest(`${getCalendarBaseUrl(calendarId)}/events/${eventId}`, {
    method: "DELETE",
  });
};

const ensureCalendarSelected = () => {
  const calendarId = getSelectedCalendarId();
  if (!calendarId) {
    throw new Error("No calendar selected");
  }
  return calendarId;
};

const executeBatch = async (items, operation) => {
  const results = await Promise.allSettled(
    items.map(async (item, index) => {
      await operation(item, index);
    })
  );

  let successCount = 0;
  const errors = [];

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      successCount += 1;
    } else {
      errors.push({
        bookingIndex: index,
        error: result.reason,
      });
    }
  });

  return {
    total: items.length,
    successCount,
    failCount: items.length - successCount,
    errors,
  };
};

export const batchInsertBookings = async (bookings) => {
  // Check if user is signed in before attempting sync
  if (!isSignedIn()) {
    return {
      total: bookings.length,
      successCount: 0,
      failCount: bookings.length,
      errors: bookings.map((_, index) => ({
        bookingIndex: index,
        error: new Error("Not signed in to Google Calendar"),
      })),
      syncSkipped: true, // Flag to indicate sync was skipped
    };
  }

  await initializeGoogleCalendar({ skipSilentAuth: true });
  const calendarId = ensureCalendarSelected();

  if (!Array.isArray(bookings) || bookings.length === 0) {
    return {
      total: 0,
      successCount: 0,
      failCount: 0,
      errors: [],
    };
  }

  const result = await executeBatch(bookings, async (booking) => {
    const eventId = generateEventId(booking, booking.backendId);
    const resource = buildEventResourceFromSchedule(booking, eventId);

    await googleApiRequest(`${getCalendarBaseUrl(calendarId)}/events`, {
      method: "POST",
      body: resource,
      interactiveFallback: false, // Don't trigger popup if not signed in
    });
  });

  return {
    ...result,
    syncSkipped: false, // Sync was attempted
  };
};

export const batchUpdateBookings = async (bookings) => {
  // Check if user is signed in before attempting sync
  if (!isSignedIn()) {
    return {
      total: bookings.length,
      successCount: 0,
      failCount: bookings.length,
      errors: bookings.map((_, index) => ({
        bookingIndex: index,
        error: new Error("Not signed in to Google Calendar"),
      })),
      addedCount: 0,
      syncSkipped: true, // Flag to indicate sync was skipped
    };
  }

  await initializeGoogleCalendar({ skipSilentAuth: true });
  const calendarId = ensureCalendarSelected();

  if (!Array.isArray(bookings) || bookings.length === 0) {
    return {
      total: 0,
      successCount: 0,
      failCount: 0,
      errors: [],
      addedCount: 0,
    };
  }

  const bookingsWithExistingEvents = [];

  for (const booking of bookings) {
    const eventId = generateEventId(booking, booking.backendId);

    try {
      await googleApiRequest(
        `${getCalendarBaseUrl(calendarId)}/events/${eventId}`,
        {
          interactiveFallback: false,
        }
      );
      bookingsWithExistingEvents.push({ booking, eventId });
    } catch (error) {
      if (error.status === 404) {
        console.warn("Event not found when updating:", eventId);
      } else {
        throw error;
      }
    }
  }

  if (bookingsWithExistingEvents.length === 0) {
    return {
      total: 0,
      successCount: 0,
      failCount: 0,
      errors: [],
      addedCount: 0,
    };
  }

  const result = await executeBatch(
    bookingsWithExistingEvents,
    async ({ booking, eventId }) => {
      const resource = buildEventResourceFromSchedule(booking, eventId);

      await googleApiRequest(`${getCalendarBaseUrl(calendarId)}/events/${eventId}`, {
        method: "PATCH",
        body: resource,
        interactiveFallback: false, // Don't trigger popup if not signed in
      });
    }
  );

  return {
    ...result,
    addedCount: bookingsWithExistingEvents.length,
    syncSkipped: false, // Sync was attempted
  };
};

export const batchDeleteBookings = async (bookings) => {
  // Check if user is signed in before attempting sync
  if (!isSignedIn()) {
    return {
      total: bookings.length,
      successCount: 0,
      failCount: bookings.length,
      errors: bookings.map((_, index) => ({
        bookingIndex: index,
        error: new Error("Not signed in to Google Calendar"),
      })),
      addedCount: 0,
      syncSkipped: true, // Flag to indicate sync was skipped
    };
  }

  await initializeGoogleCalendar({ skipSilentAuth: true });
  const calendarId = ensureCalendarSelected();

  if (!Array.isArray(bookings) || bookings.length === 0) {
    return {
      total: 0,
      successCount: 0,
      failCount: 0,
      errors: [],
      addedCount: 0,
    };
  }

  const bookingsWithExistingEvents = [];

  for (const booking of bookings) {
    const eventId = generateEventId(booking, booking.backendId);
    try {
      await googleApiRequest(
        `${getCalendarBaseUrl(calendarId)}/events/${eventId}`,
        {
          interactiveFallback: false,
        }
      );
      bookingsWithExistingEvents.push({ booking, eventId });
    } catch (error) {
      if (error.status === 404) {
        console.warn("Event not found when deleting:", eventId);
      } else {
        throw error;
      }
    }
  }

  if (bookingsWithExistingEvents.length === 0) {
    return {
      total: 0,
      successCount: 0,
      failCount: 0,
      errors: [],
      addedCount: 0,
    };
  }

  const result = await executeBatch(
    bookingsWithExistingEvents,
    async ({ eventId }) => {
      await googleApiRequest(
        `${getCalendarBaseUrl(calendarId)}/events/${eventId}`,
        {
          method: "DELETE",
          interactiveFallback: false, // Don't trigger popup if not signed in
        }
      );
    }
  );

  return {
    ...result,
    addedCount: bookingsWithExistingEvents.length,
    syncSkipped: false, // Sync was attempted
  };
};

export const getCalendarEmail = async () => {
  const calendars = await getAvailableCalendars();
  const primaryCalendar = calendars.find((calendar) => calendar.primary);
  return primaryCalendar?.id;
};

export const useSelectedCalendar = () => {
  const [selectedCalendar, setSelectedCalendar] = useState(() => {
    const saved = localStorage.getItem(SELECTED_CALENDAR_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const updateSelectedCalendar = useCallback(
    (calendar) => {
      setSelectedCalendar(calendar);
      localStorage.setItem(SELECTED_CALENDAR_KEY, JSON.stringify(calendar));
    },
    [setSelectedCalendar]
  );

  return [selectedCalendar, updateSelectedCalendar];
};

export const getAvailableCalendars = async () => {
  await initializeGoogleCalendar();

  const data = await googleApiRequest(
    "https://www.googleapis.com/calendar/v3/users/me/calendarList",
    {
      interactiveFallback: false,
    }
  );

  if (!data?.items) {
    return [];
  }

  return data.items.map((calendar) => ({
    id: calendar.id,
    summary: calendar.summary,
    description: calendar.description,
    primary: calendar.primary,
  }));
};
