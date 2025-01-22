import {
    Heading,
    VStack,
  } from "@chakra-ui/react";
  import React from 'react';
  import PDFButton from "../PDFButton";

export const Playground = () => {
  return (
    <VStack
      spacing={8}
      sx={{ width: 300, marginX: "auto" }}
    >
      <Heading>Playground</Heading>
      <PDFButton/>
    </VStack>
  );
};
