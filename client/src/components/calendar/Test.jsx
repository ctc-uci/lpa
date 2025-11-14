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
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import CalendarModal from "./CalendarModal";
import {
  initializeGoogleCalendar,
  signIn,
  signOut,
  fetchEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  // generateRecurringSessions,
  batchInsertBookings,
  batchUpdateBookings,
  batchDeleteBookings,
  getAvailableCalendars,
  isSignedIn as checkIsSignedIn,
  onSignInStatusChange
} from "../../utils/calendar";

export const Test = () => {
  const { backend } = useBackendContext();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // State variables
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ summary: "", start: "", end: "" });
  const [editingEventId, setEditingEventId] = useState(null);
  const [bookingsBatch, setBookingsBatch] = useState([]);

  // Initialize Google Calendar on component mount
  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeGoogleCalendar();
        setIsSignedIn(checkIsSignedIn());
      } catch (error) {
        console.error("Failed to initialize Google Calendar:", error);
        toast({
          title: "Initialization Error",
          description: "Failed to initialize Google Calendar",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    initialize();

    // Listen for sign-in status changes
    const unsubscribe = onSignInStatusChange((isSignedInStatus) => {
      setIsSignedIn(isSignedInStatus);
    });

    return () => {
      unsubscribe();
    };
  }, [toast]);

  // Load events when signed in
  useEffect(() => {
    if (!isSignedIn) return;
    loadEvents();
  }, [isSignedIn]);

  const loadEvents = async () => {
    try {
      const fetchedEvents = await fetchEvents();
      setEvents(fetchedEvents);
    } catch (error) {
      toast({
        title: "Could not load events",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleAuthClick = async () => {
    try {
      await signIn();
    } catch (error) {
      toast({
        title: "Sign-in failed",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsSignedIn(false);
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Sign out failed",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const fetchNewBookings = async () => {
    const recurringSession = {
      weekday: 'Wednesday',
      startTime: '10:00',
      endTime: '11:00',
      roomId: 3
    };

    const startDate = '2025-05-14';
    const endDate = '2025-05-28';

    // const sessions = generateRecurringSessions(recurringSession, startDate, endDate);
    // const namedSessions = sessions.map(session => ({ ...session, name: 'fake session' }));
    // setBookingsBatch(namedSessions);
  };

  const fetchOldBookings = async () => {
    try {
      const response = await backend.get("/bookings/bookingEventNames", {
        params: {
          start: new Date().toISOString()
        }
      });
      setBookingsBatch(response.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const handleBatchInsertBookings = async (mode = "new") => {
    try {
      if (mode === "old") {
        await fetchOldBookings();
        // Each booking in the batch should already have a backend ID
        const result = await batchInsertBookings(bookingsBatch);
        if (result.failCount) {
          toast({
            title: "Batch Upload Completed with Errors",
            description: `${result.successCount}/${result.total} added, ${result.failCount} failed.`,
            status: "warning",
            duration: 5000,
            isClosable: true
          });
        } else {
          toast({
            title: "Batch Upload Successful",
            description: `${result.total} events added.`,
            status: "success",
            duration: 5000,
            isClosable: true
          });
        }
      } else {
        // For new bookings, we need to assign temporary IDs
        await fetchNewBookings();
        const bookingsWithIds = bookingsBatch.map((booking, index) => ({
          ...booking,
          backendId: Date.now() + index // Temporary IDs until synced with backend
        }));
        const result = await batchInsertBookings(bookingsWithIds);
        if (result.failCount) {
          toast({
            title: "Batch Upload Completed with Errors",
            description: `${result.successCount}/${result.total} added, ${result.failCount} failed.`,
            status: "warning",
            duration: 5000,
            isClosable: true
          });
        } else {
          toast({
            title: "Batch Upload Successful",
            description: `${result.total} events added.`,
            status: "success",
            duration: 5000,
            isClosable: true
          });
        }
      }
      loadEvents();
    } catch (error) {
      toast({
        title: "Batch Upload Failed",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true
      });
    }
  };

  const handleBatchUpdate = async (bookingsToUpdate) => {
    try {
      const result = await batchUpdateBookings(bookingsToUpdate);
      
      if (result.failCount) {
        // If there were any errors, show them in the toast
        const errorMessages = result.errors
          .map(e => `Booking ${e.bookingIndex + 1}: ${e.error.message}`)
          .join('\n');
          
        toast({
          title: "Batch Update Completed with Errors",
          description: (
            <Box>
              <Text>{`${result.successCount}/${result.total} updated, ${result.failCount} failed.`}</Text>
              <Text mt={2} fontSize="sm" color="red.500">
                {errorMessages}
              </Text>
            </Box>
          ),
          status: "warning",
          duration: 8000,
          isClosable: true
        });
      } else {
        toast({
          title: "Batch Update Successful",
          description: `${result.total} events updated.`,
          status: "success",
          duration: 5000,
          isClosable: true
        });
      }
      
      // Refresh the events list
      loadEvents();
      
      return result;
    } catch (error) {
      toast({
        title: "Batch Update Failed",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true
      });
      throw error;
    }
  };

  const handleBatchDelete = async (bookingsToDelete) => {
    try {
      const result = await batchDeleteBookings(bookingsToDelete);
      
      if (result.failCount) {
        // If there were any errors, show them in the toast
        const errorMessages = result.errors
          .map(e => `Booking ${e.bookingIndex + 1}: ${e.error.message}`)
          .join('\n');
          
        toast({
          title: "Batch Delete Completed with Errors",
          description: (
            <Box>
              <Text>{`${result.successCount}/${result.total} deleted, ${result.failCount} failed.`}</Text>
              <Text mt={2} fontSize="sm" color="red.500">
                {errorMessages}
              </Text>
            </Box>
          ),
          status: "warning",
          duration: 8000,
          isClosable: true
        });
      } else {
        toast({
          title: "Batch Delete Successful",
          description: `${result.total} events deleted.`,
          status: "success",
          duration: 5000,
          isClosable: true
        });
      }
      
      // Refresh the events list
      loadEvents();
      
      return result;
    } catch (error) {
      toast({
        title: "Batch Delete Failed",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true
      });
      throw error;
    }
  };

  const handleSaveEvent = async () => {
    if (!newEvent.summary || !newEvent.start || !newEvent.end) {
      toast({
        title: "Missing fields",
        description: "Please fill in all event details",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      if (editingEventId) {
        // Extract backend ID from the Google Calendar event ID
        const updated = await updateEvent(editingEventId, newEvent);
        setEvents(prevEvents => prevEvents.map(event => event.id === editingEventId ? updated : event));
        toast({
          title: "Event Updated",
          description: "The event was successfully updated.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } else {
        // For new events, we need a backend ID
        // In a real implementation, you would get this from your backend
        // For now, we'll use a temporary ID that will be replaced when synced with backend
        const tempBackendId = Date.now(); // Temporary ID until synced with backend
        const created = await createEvent(newEvent, tempBackendId);
        setEvents(prev => [...prev, created]);
        toast({
          title: "Event Created",
          description: "Your event has been successfully created.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      }
      setEditingEventId(null);
      onClose();
      setNewEvent({ summary: "", start: "", end: "" });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to save the event.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await deleteEvent(eventId);
      setEvents(prev => prev.filter(e => e.id !== eventId));
      toast({ 
        title: "Event Deleted", 
        status: "info", 
        duration: 5000,
        isClosable: true 
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete the event.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const updateAllEvents = async () => {
    // Example: Update all events to add a prefix to their names
    const updatedBookings = events.map(event => ({
      ...event,
      name: `[Updated] ${event.summary}`,
      // backendId: extractBackendId(event.id) || Date.now(), // Use existing ID or generate new one
      date: event.start.dateTime.split('T')[0],
      startTime: event.start.dateTime.split('T')[1].slice(0, 5),
      endTime: event.end.dateTime.split('T')[1].slice(0, 5),
      location: event.location || "",
      description: event.description || ""
    }));

    try {
      await handleBatchUpdate(updatedBookings);
    } catch (error) {
      console.error("Failed to update events:", error);
    }
  };

  const deleteAllEvents = async () => {
    // Transform current events into the format needed for deletion
    const bookingsToDelete = events.map(event => ({
      backendId: extractBackendId(event.id) || Date.now(), // Use existing ID or generate new one
      date: event.start.dateTime.split('T')[0],
      startTime: event.start.dateTime.split('T')[1].slice(0, 5),
      endTime: event.end.dateTime.split('T')[1].slice(0, 5),
      name: event.summary,
      location: event.location || "",
      description: event.description || ""
    }));

    try {
      await handleBatchDelete(bookingsToDelete);
    } catch (error) {
      console.error("Failed to delete events:", error);
    }
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

            <Button
              onClick={() => handleBatchInsertBookings("old")}
            >
              Add Old Bookings
            </Button>

            <Button
              onClick={() => handleBatchInsertBookings("new")}
            >
              Add New (Fake) Bookings
            </Button>

            <Button
              onClick={updateAllEvents}
              colorScheme="purple"
            >
              Update All Events
            </Button>

            <Button
              onClick={deleteAllEvents}
              colorScheme="red"
            >
              Delete All Events
            </Button>
            <Button
              onClick={getAvailableCalendars}
            >
              Get Available Calendars
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
                <Button onClick={() => handleDeleteEvent(event.id)}>Delete</Button>
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
