import React from 'react';

import {
    VStack,
  } from "@chakra-ui/react";

import Navbar from "../navbar/Navbar";

import { SendEmailButton } from "../email/SendEmailButton";


export const Playground = () => {
  return (
    <Navbar>
    <VStack
      spacing={8}
      width={"100%"}
    >
        <SendEmailButton></SendEmailButton>
    </VStack>
    </Navbar>
  );
};
