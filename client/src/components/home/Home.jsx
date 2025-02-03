import React from "react";

import { Box } from "@chakra-ui/react";

import { Navbar } from "../Navbar";
import { HeaderRowComponent } from "./HeaderRowComponent";
import { ProgramsTable } from "./HomeComponents";

export const Home = () => {
  return (
    <Box
      style={{
        display: "flex",
        padding: "32px 32px 0px 32px",
        alignItems: "flex-start",
        gap: "32px",
        alignSelf: "stretch",
      }}
    >
      <Navbar />

      <Box
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "24px",
          alignSelf: "stretch",
        }}
      >
        <HeaderRowComponent />
        <ProgramsTable />
      </Box>
    </Box>
  );
};
