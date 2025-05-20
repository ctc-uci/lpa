import React from "react";

import { Box, Flex, Icon, Text } from "@chakra-ui/react";

import { IoCloseOutline } from "react-icons/io5";

import { RecurringRowFrequency } from "./recurringRowFrequency";
import { RecurringSessionRowDetails } from "./RecurringSessionRowDetails";

export const RecurringSessionRow = ({
  session,
  index,
  allRooms,
  handleChangeSessionField,
  onDeleteRowModalOpen,
  setRowToDelete,
  isRecurring,
  recurringFrequency,
}) => {
  return (
    <Box
      key={index}
      mb={4}
    >
      <Flex
        align="center"
        gap="10px"
      >
        <Text>Every</Text>

        <RecurringRowFrequency
          session={session}
          index={index}
          handleChangeSessionField={handleChangeSessionField}
          recurrenceType={recurringFrequency}
        />

        <RecurringSessionRowDetails
          session={session}
          index={index}
          allRooms={allRooms}
          handleChangeSessionField={handleChangeSessionField}
        />

        <Icon
          as={IoCloseOutline}
          boxSize="6"
          color="#2D3748"
          cursor="pointer"
          onClick={() => {
            onDeleteRowModalOpen();
            setRowToDelete({
              type: isRecurring ? "recurring" : "single",
              index,
            });
          }}
        />
      </Flex>
    </Box>
  );
};
