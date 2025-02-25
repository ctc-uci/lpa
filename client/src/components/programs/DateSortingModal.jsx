import React from "react";

import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";

const DateSortingModal = ({ onSortChange }) => {
  return (
    <Menu>
      <MenuButton
        as={Button}
        variant="ghost"
        size="sm"
      >
        <Flex
          direction="column"
          align="center"
          gap={1}
        >
          <ChevronUpIcon />
          <ChevronDownIcon />
        </Flex>
      </MenuButton>
      <MenuList>
        <MenuItem onClick={() => onSortChange("date", "asc")}>
          <Flex
            align="center"
            gap={2}
          >
            <ChevronUpIcon />
            <Box>Soonest - Latest</Box>
          </Flex>
        </MenuItem>
        <MenuItem onClick={() => onSortChange("date", "desc")}>
          <Flex
            align="center"
            gap={2}
          >
            <ChevronDownIcon />
            <Box>Latest - Soonest</Box>
          </Flex>
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default DateSortingModal;
