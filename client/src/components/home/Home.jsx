import React, { useState, useEffect } from "react";

import { Box } from "@chakra-ui/react";

import Navbar from "../navbar/Navbar";
import { HeaderRowComponent } from "./HeaderRowComponent";
import { ProgramsTable } from "./HomeComponents";
import GcalPrompt from "../calendar/GcalPrompt";
import { isSignedIn, isCalendarApiReady, initializeGoogleCalendar } from "../../utils/calendar";

import "./Home.css";

export const Home = () => {
  const [showGcalPrompt, setShowGcalPrompt] = useState(false);

  useEffect(() => {

    const checkApiAndSignIn = () => {
      if (!isCalendarApiReady()) {
        initializeGoogleCalendar();
        return false; // Return false to continue polling
      }
      
      // Check after 1 second if the user is signed into GCal
      setTimeout(() => {
        if (!isSignedIn()) {
          setShowGcalPrompt(true);
        }
      }, 1000);
      
      return true; // Return true to stop polling
    };

    // Check if the API is ready and the user is signed in every second
    if (!checkApiAndSignIn()) {
      const interval = setInterval(() => {
        if (checkApiAndSignIn()) {
          // Stop polling once the API is ready
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, []);

  return (
    <Navbar>
      <HeaderRowComponent />
      <ProgramsTable />
      <GcalPrompt
        isOpen={showGcalPrompt}
        onClose={() => setShowGcalPrompt(false)}
      />
    </Navbar>
  );
};
