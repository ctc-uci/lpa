import React from "react";

import { ChevronDownIcon } from "@chakra-ui/icons";
import { Box, Button, Flex, Icon, Menu, MenuButton, MenuItem, MenuList, Text } from "@chakra-ui/react";

import { IoCloseOutline } from "react-icons/io5";

import { RecurringRowFrequency } from "./recurringRowFrequency";
import { RecurringSessionRowDetails } from "./RecurringSessionRowDetails";

const NTH_OPTIONS = ["1st", "2nd", "3rd", "4th", "Last"];
const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const dropdownStyle = {
  background: "transparent",
  border: "1px solid #E2E8F0",
  borderRadius: "4px",
  fontWeight: "400",
  fontSize: "14px",
  padding: "0px 12px",
  height: "32px",
  minWidth: "fit-content",
};

export const RecurringSessionRow = ({
  session,
  index,
  allRooms,
  handleChangeSessionField,
  onDeleteRowModalOpen,
  setRowToDelete,
  handleDeleteRow,
  isRecurring,
  recurringFrequency,
  handleAddException,
  handleChangeException,
  handleRemoveException,
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
            const isEmpty = !session.weekday && !session.startTime && !session.endTime && !session.roomId;
            if (isEmpty) {
              handleDeleteRow("recurring", index);
            } else {
              onDeleteRowModalOpen();
              setRowToDelete({ type: "recurring", index });
            }
          }}
        />
      </Flex>

      {/* Exception rows */}
      {(session.exceptions || []).map((exc, excIndex) => (
        <Flex
          key={excIndex}
          align="center"
          gap="8px"
          mt="8px"
          ml="48px"
        >
          <Text
            fontSize="14px"
            color="#767778"
            minW="fit-content"
          >
            Except
          </Text>

          <Menu autoSelect={false}>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              {...dropdownStyle}
              color={exc.nth ? "#2D3748" : "#CBD5E0"}
              _hover={{ bgColor: "#EDF2F7" }}
              _active={{ bgColor: "#EDF2F7" }}
            >
              {exc.nth || "1st"}
            </MenuButton>
            <MenuList minWidth="100px" padding="4px">
              {NTH_OPTIONS.map((n) => (
                <MenuItem
                  key={n}
                  fontSize="14px"
                  bg={exc.nth === n ? "#EDF2F7" : "transparent"}
                  onClick={() => handleChangeException(index, excIndex, "nth", n)}
                >
                  {n}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>

          <Menu autoSelect={false}>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              {...dropdownStyle}
              color={exc.weekday ? "#2D3748" : "#CBD5E0"}
              _hover={{ bgColor: "#EDF2F7" }}
              _active={{ bgColor: "#EDF2F7" }}
            >
              {exc.weekday || "Weekday"}
            </MenuButton>
            <MenuList minWidth="140px" padding="4px">
              {WEEKDAYS.map((day) => (
                <MenuItem
                  key={day}
                  fontSize="14px"
                  bg={exc.weekday === day ? "#EDF2F7" : "transparent"}
                  onClick={() => handleChangeException(index, excIndex, "weekday", day)}
                >
                  {day}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>

          <Icon
            as={IoCloseOutline}
            boxSize="5"
            color="#718096"
            cursor="pointer"
            onClick={() => handleRemoveException(index, excIndex)}
          />
        </Flex>
      ))}

      {/* Add exception link */}
      <Button
        variant="link"
        size="sm"
        mt="6px"
        ml="48px"
        color="#718096"
        fontWeight="400"
        fontSize="13px"
        onClick={() => handleAddException(index)}
      >
        + Add Exception
      </Button>
    </Box>
  );
};
