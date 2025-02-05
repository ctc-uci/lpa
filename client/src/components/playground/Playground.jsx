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
      sx={{ width: 300, marginX: "auto" }}
    >
      <Heading>Playground</Heading>
      <AddClassModal></AddClassModal>
      <EventsTable />
      <PDFButton/>
    </VStack>
    </Navbar>
  );
};
