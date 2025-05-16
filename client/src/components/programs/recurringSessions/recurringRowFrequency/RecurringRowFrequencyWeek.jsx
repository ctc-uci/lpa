import React from "react";

import { ChevronDownIcon } from "@chakra-ui/icons";
import { Button, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";

export const RecurringRowFrequencyWeek = ({
  session,
  index,
  handleChangeSessionField,
}) => {
  return (
    <>
      <Menu autoSelect={false}>
        <MenuButton
          as={Button}
          rightIcon={<ChevronDownIcon />}
          background="transparent"
          border="1px solid #E2E8F0"
          borderRadius="4px"
          fontWeight="400"
          fontSize="14px"
          width="200px"
          display="flex"
          alignItems="center"
          padding="0px 16px"
          justifyContent="flex-start"
          gap="4px"
          textAlign="left"
          color={session.weekday ? "#2D3748" : "#CBD5E0"}
          _hover={{
            bgColor: "#EDF2F7",
            borderRadius: "4px",
          }}
          _active={{
            bgColor: "#EDF2F7",
            borderRadius: "4px",
          }}
        >
          {session.weekday || "Weekday"}
        </MenuButton>

        <MenuList
          padding="4px"
          borderRadius="4px"
          overflow="hidden"
        >
          {[
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ].map((day) => (
            <MenuItem
              key={day}
              onClick={() => {
                handleChangeSessionField("recurring", index, "weekday", day);
                handleChangeSessionField(
                  "recurring",
                  index,
                  "frequency",
                  "week"
                );
              }}
              bg={session.weekday === day ? "#EDF2F7" : "transparent"}
            >
              {day}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </>
  );
};
