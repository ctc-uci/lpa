import {
    Heading,
    VStack,
  } from "@chakra-ui/react";
import { EventsTable } from "../EventsTable";
import React from 'react';
import PDFButton from "../PDFButton";
import Navbar from "../navbar/Navbar";
import { AddClassModal } from '../AddClassModal';

export const Playground = () => {
  return (
    <Navbar>
    <VStack
      spacing={8}
      width={"100%"}
    >
      <Heading>Playground</Heading>
      <AddClassModal></AddClassModal>
      <EventsTable />
      <PDFButton/>
    </VStack>
    </Navbar>
  );
};
