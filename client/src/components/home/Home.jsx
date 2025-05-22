import React, { useState, useEffect } from "react";

import { Box } from "@chakra-ui/react";

import Navbar from "../navbar/Navbar";
import { HeaderRowComponent } from "./HeaderRowComponent";
import { ProgramsTable } from "./HomeComponents";
import GcalPrompt from "../calendar/GcalPrompt";
import { isSignedIn } from "../../utils/calendar";

import "./Home.css";

export const Home = () => {
  const [showGcalPrompt, setShowGcalPrompt] = useState(false);

  useEffect(() => {
    if (!isSignedIn()) {
      setShowGcalPrompt(true);
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
