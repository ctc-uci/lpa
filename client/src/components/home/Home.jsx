import React, { useState, useEffect } from "react";

import Navbar from "../navbar/Navbar";
import { HeaderRowComponent } from "./HeaderRowComponent";
import { ProgramsTable } from "./HomeComponents";
import GcalPrompt from "../calendar/GcalPrompt";
import { isSignedIn, isCalendarApiReady, initializeGoogleCalendar } from "../../utils/calendar";

import "./Home.css";

export const Home = () => {
  const [showGcalPrompt, setShowGcalPrompt] = useState(false);

  useEffect(() => {
    const checkApiAndSignIn = async () => {
      // Initialize Google Calendar API without triggering silent auth
      if (!isCalendarApiReady()) {
        try {
          await initializeGoogleCalendar({ skipSilentAuth: true });
        } catch (error) {
          console.error("Failed to initialize Google Calendar:", error);
          return;
        }
      }
      
      // Wait a bit for initialization to complete, then check sign-in status
      // Show the GcalPrompt modal if not signed in (user can choose to go to settings)
      setTimeout(() => {
        if (isCalendarApiReady() && !isSignedIn()) {
          // Show the existing GcalPrompt modal instead of auto-redirecting
          setShowGcalPrompt(true);
        }
      }, 500);
    };

    checkApiAndSignIn();
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
