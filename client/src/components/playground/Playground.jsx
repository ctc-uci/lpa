import React from 'react';

import {
    VStack,
  } from "@chakra-ui/react";

import Navbar from "../navbar/Navbar";

import { Test } from "../calendar/Test";


export const Playground = () => {
  return (
    <Navbar>
    <VStack
      spacing={8}
      width={"100%"}
    >
        <Test></Test>
    </VStack>
    </Navbar>
  );
};
