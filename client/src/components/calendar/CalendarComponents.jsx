import React, { useState, useEffect } from "react";
import { Button, useToast } from "@chakra-ui/react";
import { signIn, signOut, initializeGoogleCalendar } from "../../utils/calendar";

export const GcalAuthButton = ({ signedIn, setSignedIn }) => {
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    initializeGoogleCalendar()
      .then(auth2 => {
        setSignedIn(auth2.isSignedIn.get());
        auth2.isSignedIn.listen(setSignedIn);
      })
      .catch(error => {
        console.error("Failed to initialize Google Calendar:", error);
        toast({
          title: "Initialization Error",
          description: "Failed to initialize Google Calendar",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      });
    setIsLoading(false);
  }, []);

  const handleAuthClick = async () => {
    if (signedIn) {
      await signOut();
    } else {
      await signIn();
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