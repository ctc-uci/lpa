import React from "react";

import { Box } from "@chakra-ui/react";

import Navbar from "../navbar/Navbar";
import { HeaderRowComponent } from "./HeaderRowComponent";
import { ProgramsTable } from "./HomeComponents";

import "./Home.css";

export const Home = () => {
  return (
    <Navbar>
      <Box className="home-inner">
        <HeaderRowComponent />
        <ProgramsTable />
      </Box>
    </Navbar>
  );
};
