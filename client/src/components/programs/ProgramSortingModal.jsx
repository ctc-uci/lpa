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

const ProgramSortingModal = ({ onSortChange }) => {
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
      <MenuList className="program-sorting-popup">
        <MenuItem onClick={() => onSortChange("title", "asc")}>
          <Flex
            align="center"
            gap={2}
            className="sort-menu-item"
          >
            <TriangleUpIcon className="triangle-icon icon-style" />
            <Box className="icon-style">A‑Z</Box>
          </Flex>
        </MenuItem>
        <MenuItem onClick={() => onSortChange("title", "desc")}>
          <Flex
            align="center"
            gap={2}
            className="sort-menu-item"
          >
            <TriangleDownIcon className="triangle-icon icon-style" />
            <Box className="icon-style">Z‑A</Box>
          </Flex>
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default ProgramSortingModal;
