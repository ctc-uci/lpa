import React from "react";

import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";

import arrowsSvg from "../../assets/icons/right-icon.svg";

import "./Sorting.css";

const DateSortingModal = ({ onSortChange }) => {
  return (
    <Menu>
      <MenuButton
        as={Button}
        variant="ghost"
        size="sm"
        sx={{
          _hover: { background: "transparent" },
          _active: { background: "transparent" },
          _focus: { background: "transparent" },
        }}
      >
        <img
          src={arrowsSvg}
          alt="Arrows"
          className="menu-button-icon"
        />
      </MenuButton>
      <MenuList className="date-sorting-popup">
        <MenuItem onClick={() => onSortChange("date", "asc")}>
          <Flex
            align="center"
            gap={2}
            className="sort-menu-item"
          >
            <TriangleUpIcon className="triangle-icon icon-style" />
            <Box className="icon-style">Soonest - Latest</Box>
          </Flex>
        </MenuItem>
        <MenuItem onClick={() => onSortChange("date", "desc")}>
          <Flex
            align="center"
            gap={2}
            className="sort-menu-item"
          >
            <TriangleDownIcon className="triangle-icon icon-style" />
            <Box className="icon-style">Latest - Soonest</Box>
          </Flex>
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default DateSortingModal;
