import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Input,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { gapi } from "gapi-script";

// Load environment variables from .env file
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;


// Set the calendar ID to "primary" for the user's primary calendar (can change later)
const CALENDAR_ID = "primary"

export const Test = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Form state for new event
  const [newEvent, setNewEvent] = useState({
    summary: "",
    start: "",
    end: "",
  });
  
  // Load and initialize gapi
  useEffect(() => {
    function start() {
      gapi.client.init({
        apiKey: GOOGLE_API_KEY,
        clientId: GOOGLE_CLIENT_ID,
        // Load the Calendar API
        scope: "https://www.googleapis.com/auth/calendar.events",
        
      }).then(() => gapi.client.load("calendar", "v3")) // <-- load the Calendar API
      .then(() => {
        const auth2 = gapi.auth2.getAuthInstance();
        if (auth2) {
          setIsSignedIn(auth2.isSignedIn.get());
          auth2.isSignedIn.listen((signedIn) => {
            setIsSignedIn(signedIn);
          });
        }
      });
    }
    gapi.load("client:auth2", start);
  }, []);

  // Google sign-In handler
  const handleAuthClick = () => {
    const auth2 = gapi.auth2.getAuthInstance();
    if (auth2) {
      auth2.signIn({
        scope: "https://www.googleapis.com/auth/calendar.events",
      }).then(
        (user) => {
          console.log("Signed in as:", user.getBasicProfile().getEmail());
        },
        (err) => {
          console.error("Sign-in error:", err);
          toast({
            title: "Sign-in failed",
            description: err.error,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      );
    } else {
      console.error("Google Auth instance not initialized");
    }
  };

  // Google sign out handler
  const handleSignOut = () => {
    const auth2 = gapi.auth2.getAuthInstance();
    if (auth2) {
      auth2.signOut().then(() => {
        setIsSignedIn(false);
      });
    }
  };

  // Add event handler
  const addEvent = (calendarID, event) => {
    gapi.client.calendar.events
      .insert({
        calendarId: calendarID,
        resource: event,
      })
      .then(
        (response) => {
          toast({
            title: "Event Created",
            description: "Your event has been successfully created.",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          onClose();
          setNewEvent({ summary: "", start: "", end: "" });
        },
        (err) => {
          console.error("Error creating event:", err);
          toast({
            title: "Error",
            description: err.result?.error?.message || "Failed to create the event.",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      );
  };


  // Create a new event
  const createEvent = () => {
    // check if fields are filled
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

    // Create event variable
    const event = {
      summary: newEvent.summary,
      location: "",
      start: {
        dateTime: new Date(newEvent.start).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: new Date(newEvent.end).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      attendees: [],
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 },
          { method: "popup", minutes: 10 },
        ],
      },
    };

    addEvent(CALENDAR_ID, event);
  };

  return (
    <Box p={5}>
      <Flex gap={5} mb={5}>
        {/* If user is not signed in, show sign in button */}
        {!isSignedIn ? (
          <Button onClick={handleAuthClick}>Sign in with Google</Button>
        ) : (
          <>
            {/* If user is signed in, show sign out and create new event button */}
            <Button onClick={handleSignOut}>Sign Out</Button>
            <Button onClick={onOpen}>Create New Event</Button>
          </>
        )}
      </Flex>
      

      {/* Create Event Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Event</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Input
                placeholder="Event Title"
                value={newEvent.summary}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, summary: e.target.value })
                }
              />
              <Input
                type="datetime-local"
                value={newEvent.start}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, start: e.target.value })
                }
              />
              <Input
                type="datetime-local"
                value={newEvent.end}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, end: e.target.value })
                }
              />

              {/* Create event button */}
              <Button colorScheme="blue" onClick={createEvent}>
                Create Event
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};
