import React, { useState, useEffect } from "react";
import { Button, useToast } from "@chakra-ui/react";
import { 
  signIn, 
  signOut, 
  initializeGoogleCalendar, 
  isSignedIn, 
  onSignInStatusChange 
} from "../../utils/calendar";

export const GcalAuthButton = ({ signedIn, setSignedIn }) => {
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize without triggering silent auth to prevent auto-redirect
        await initializeGoogleCalendar({ skipSilentAuth: true });
        setSignedIn(isSignedIn());
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to initialize Google Calendar:", error);
        toast({
          title: "Initialization Error",
          description: "Failed to initialize Google Calendar",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setIsLoading(false);
      }
    };

    initialize();

    // Listen for sign-in status changes
    const unsubscribe = onSignInStatusChange((isSignedInStatus) => {
      setSignedIn(isSignedInStatus);
    });

    return () => {
      unsubscribe();
    };
  }, [toast, setSignedIn]);

  const handleAuthClick = async () => {
    try {
      if (signedIn) {
        await signOut();
        setSignedIn(false);
      } else {
        await signIn();
        setSignedIn(true);
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast({
        title: "Authentication Error",
        description: error.message || "Failed to authenticate with Google",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Button 
      onClick={handleAuthClick} 
      isLoading={isLoading}
      width="fit-content"
      height="40px"
      backgroundColor="#EDF2F7"
      color="#2D3748"
      fontSize="14px"
      fontWeight="500"
      letterSpacing="0.07px"
    >
      {signedIn ? "Sign Out" : "Sign In with Google"}
    </Button>
  )
};