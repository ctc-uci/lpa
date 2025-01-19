import {
    Heading,
    VStack,
  } from "@chakra-ui/react";
import { EventsTable } from "../EventsTable";

export const Playground = () => {
  return (
    <VStack
      spacing={8}
      sx={{ width: 300, marginX: "auto" }}
    >
      <Heading>Playground</Heading>
      <EventsTable />
    </VStack>
  );
};
