import React from "react";

import { Box } from "@chakra-ui/react";

import "./home.css";

import { Navbar } from "../Navbar";
import { HeaderRowComponent } from "./HeaderRowComponent";
import { ProgramsTable } from "./HomeComponents";

export const Home = () => {
  return (
    <Box className="home">
      <Navbar />
      <Box className="home-inner">
        <HeaderRowComponent />
        <ProgramsTable />
      </Box>
    </Box>
  );
};
