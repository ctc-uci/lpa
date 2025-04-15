import React, { useEffect } from "react";
import { Box, Button, Flex } from "@chakra-ui/react";
import Navbar from "../navbar/Navbar";

export const Test = () => {
  const handleAuthClick = () => {
    console.log("clicked sign in with google")
  };

  const createEvent = () => {
    console.log("clicked create test event")
  };


  return (
    <Flex p={5} gap={5}>
      <Button onClick={handleAuthClick}>
        Sign in with Google
      </Button>

      <Button onClick={createEvent}>
        Create Test Event
      </Button>

    </Flex>
  );
};
