import React, { useState, useEffect } from "react";

import { Box } from "@chakra-ui/react";

import Navbar from "../navbar/Navbar";
import { HeaderRowComponent } from "./HeaderRowComponent";
import { ProgramsTable } from "./HomeComponents";
import GcalPrompt from "../calendar/GcalPrompt";
import { isSignedIn, isCalendarApiReady } from "../../utils/calendar";

import "./Home.css";

export const Home = () => {
  const [showGcalPrompt, setShowGcalPrompt] = useState(false);

  useEffect(() => {
    if (!isCalendarApiReady()) {
      return;
    }

    setTimeout(() => {
      if (!isSignedIn()) {
        setShowGcalPrompt(true);
      }
    }, 1000);
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
