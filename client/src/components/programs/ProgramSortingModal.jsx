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

const ProgramSortingModal = ({ onSortChange }) => {
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
        <MenuItem onClick={() => onSortChange("title", "asc")}>
          <Flex
            align="center"
            gap={2}
          >
            <ChevronUpIcon />
            <Box>A‑Z</Box>
          </Flex>
        </MenuItem>
        <MenuItem onClick={() => onSortChange("title", "desc")}>
          <Flex
            align="center"
            gap={2}
          >
            <ChevronDownIcon />
            <Box>Z‑A</Box>
          </Flex>
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default ProgramSortingModal;
