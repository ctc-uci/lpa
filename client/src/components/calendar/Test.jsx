// lpa/client/src/components/calendar/Test.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  SimpleGrid,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { gapi } from "gapi-script";
import CalendarModal from "./CalendarModal";

/* Load environment variables from .env file
 * Ensure you have the following variables in your .env file:
 *    VITE_GOOGLE_CLIENT_ID
 *    VITE_GOOGLE_API_KEY
 *    VITE_GOOGLE_CALENDAR_ID
 */
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const CALENDAR_ID = "primary";


export const Test = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // State variables
  const [isSignedIn, setIsSignedIn] = useState(false); // whether or not the user is signed in
  const [events, setEvents] = useState([]); // list of event the user has upcoming
  const [newEvent, setNewEvent] = useState({ summary: "", start: "", end: "" }); // current event being edited
  const [editingEventId, setEditingEventId] = useState(null); // id of the current event being edited (null if new event)

  /**
   * Initialize the Google API client
   *
   * This function is called on component mount to set up the
   * Google API clientand load the calendar API
   */
  useEffect(() => {
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
            setIsSignedIn(auth2.isSignedIn.get());
            auth2.isSignedIn.listen(setIsSignedIn);
          }
        });
    }
    gapi.load("client:auth2", start);
  }, []);

  /**
   * Fetch and list all events when the user is signed in.
   *
   * This effect runs whenever the sign-in status (`isSignedIn`) changes.
   * If the user is signed in, it queries the Google Calendar API to fetch upcoming events
   * The events are then stored in the `events` state
   *
   * If the API call fails, an error toast is shown to the user with the error message.
   */
  useEffect(() => {
    if (!isSignedIn) return;
    gapi.client.calendar.events
      .list({
        calendarId: CALENDAR_ID,
        timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        orderBy: "startTime",
      })
      .then(({ result }) => setEvents(result.items || []))
      .catch((err) => {
        toast({
          title: "Could not load events",
          description: err.result?.error?.message || err.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      });
  }, [isSignedIn, toast]);

  /**
   * Handle the sign-in process with Google OAuth2.
   */
  const handleAuthClick = () => {
    gapi.auth2
      .getAuthInstance()
      ?.signIn()
      .catch((err) => {
        toast({
          title: "Sign-in failed",
          description: err.error,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      });
  };

  /**
   * Handle the sign-out process with Google OAuth2.
   */
  const handleSignOut = () =>
    gapi.auth2
      .getAuthInstance()
      ?.signOut()
      .then(() => setIsSignedIn(false));

  /**
   * Handle saving the event (create or update).
   *
   * If an existing event is being edited, the event is updated.
   * If a new event is being created, it is added to Google Calendar.
   *
   * Checks that all required fields (summary, start, end) are filled before proceeding.
   * @returns {void}
   */
  const handleSaveEvent = () => {
    if (!newEvent.summary || !newEvent.start || !newEvent.end) {
      toast({
        title: "Missing fields",
        description: "Please fill in all event details",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Build the event resource object
    const resource = {
      summary: newEvent.summary,
      start: {
        dateTime: new Date(newEvent.start).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: new Date(newEvent.end).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      // Add other optional fields as needed (e.g. attendees, reminders)
    };

    // If editing, update the event; otherwise, create a new one
    if (editingEventId) {
      updateEvent(editingEventId, resource);
    } else {
      addEvent(CALENDAR_ID, resource);
    }
  };

  /**
   * Adds a new event to the user's Google Calendar.
   *
   * This function sends a POST request to the Google Calendar API to create a new event
   * in the specified calendar. On success, it updates the local events state to include
   * the newly created event, shows a success toast notification, closes the modal, and
   * resets the new event form state. On failure, it displays an error toast.
   *
   * @param {string} calendarID - The ID of the calendar to add the event to.
   * @param {object} event - The event object containing details such as summary, start, end, etc.
   *   Example:
   *     {
   *       summary: "Meeting with Team",
   *       start: { dateTime: "2024-06-01T10:00:00Z", timeZone: "America/New_York" },
   *       end:   { dateTime: "2024-06-01T11:00:00Z", timeZone: "America/New_York" },
   *       ...other (optional) Google Calendar event fields
   *     }
   * @returns {void}
   */
  const addEvent = (calendarID, event) => {
    gapi.client.calendar.events
      .insert({
        calendarId: calendarID,
        resource: event,
      })
      // Handle the response and update the state
      .then(
        (response) => {
          const createdEvent = response.result;
          toast({
            title: "Event Created",
            description: "Your event has been successfully created.",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          setEvents((prev) => [...prev, createdEvent]);
          onClose();
          setNewEvent({ summary: "", start: "", end: "" });
        },
        (err) => {
          console.error("Error creating event:", err);
          toast({
            title: "Error",
            description:
              err.result?.error?.message || "Failed to create the event.",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      );
  };

  /**
   * Updates an existing event on the user's Google Calendar.
   *
   * This function sends a PATCH request to the Google Calendar API to update
   * the details of a specific event, identified by its event ID. After a successful
   * update, it updates the local events state to reflect the changes, shows a success
   * toast notification, resets the editing state, and closes the modal.
   *
   * @param {string} eventId - The unique identifier of the event to update.
   * @param {object} updatedEvent - The updated event object containing new values for fields such as summary, start, and end.
   *   Example:
   *     {
   *       summary: "Updated Event Title",
   *       start: { dateTime: "2024-06-01T10:00:00Z", timeZone: "America/New_York" },
   *       end:   { dateTime: "2024-06-01T11:00:00Z", timeZone: "America/New_York" },
   *       ...other (optional) Google Calendar event fields
   *     }
   * @returns {void}
   */
  const updateEvent = (eventId, updatedEvent) => {
    gapi.client.calendar.events
      .patch({
        calendarId: CALENDAR_ID,
        eventId,
        resource: updatedEvent,
      })
      .then(
        (response) => {
          const updated = response.result;
          setEvents((prevEvents) =>
            prevEvents.map((event) => (event.id === eventId ? updated : event))
          );
          toast({
            title: "Event Updated",
            description: "The event was successfully updated.",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          setEditingEventId(null);
          onClose();
          setNewEvent({ summary: "", start: "", end: "" });
        },
        (err) => {
          console.error("Error updating event:", err);
        }
      );
  };

  /**
   * Delete an event from Google Calendar
   * @param {string} eventId - ID of the event to delete
   * @returns {void}
   */
  const deleteEvent = (eventId) => {
    gapi.client.calendar.events
      .delete({ calendarId: CALENDAR_ID, eventId })
      .then(() => {
        setEvents((prev) => prev.filter((e) => e.id !== eventId));
        toast({ title: "Event Deleted", status: "info", duration: 3000 });
      });
  };

  return (
    <Flex
      p={5}
      direction="column"
      align="center"
    >
      <Flex
        gap={5}
        mb={5}
      >
        {!isSignedIn ? (
          <Button onClick={handleAuthClick}>Sign in with Google</Button>
        ) : (
          <>
            <Button onClick={handleSignOut}>Sign Out</Button>
            <Button
              onClick={() => {
                setEditingEventId(null);
                setNewEvent({ summary: "", start: "", end: "" });
                onOpen();
              }}
            >
              Create New Event
            </Button>
          </>
        )}
      </Flex>

      {/* Events Grid */}
      {isSignedIn && (
        <SimpleGrid
          columns={{ base: 1, md: 4 }}
          spacing={5}
        >
          {events.map((event) => (
            <Box
              key={event.id}
              p={5}
              shadow="md"
              borderWidth="1px"
              borderRadius="md"
            >
              <Text fontWeight="bold">{event.summary || "(No Title)"}</Text>
              <Text fontSize="sm">
                {new Date(
                  event.start?.dateTime || event.start?.date
                ).toLocaleString()}
              </Text>
              <Flex
                mt={3}
                gap={2}
              >
                <Button onClick={() => deleteEvent(event.id)}>Delete</Button>
                <Button
                  colorScheme="blue"
                  onClick={() => {
                    // Fill modal with current event values to edit
                    setNewEvent({
                      summary: event.summary,
                      start: new Date(event.start.dateTime)
                        .toISOString()
                        .slice(0, 16),
                      end: new Date(event.end.dateTime)
                        .toISOString()
                        .slice(0, 16),
                    });
                    setEditingEventId(event.id);
                    onOpen();
                  }}
                >
                  Edit
                </Button>
              </Flex>
            </Box>
          ))}
        </SimpleGrid>
      )}

      <CalendarModal
        isOpen={isOpen}
        onClose={onClose}
        newEvent={newEvent}
        setNewEvent={setNewEvent}
        editingEventId={editingEventId}
        handleSaveEvent={handleSaveEvent}
      />
    </Flex>
  );
};

export default Test;
