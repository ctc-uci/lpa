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
    <Menu closeOnSelect={true}>
      <MenuButton
        as={Button}
        variant="ghost"
        size="sm"
        sx={{
          _hover: { background: "transparent" },
          _active: { background: "transparent" },
          _focus: { background: "transparent" },
          marginLeft: "auto",
          marginRight: "-16px",
        }}
      >
        <img
          src={arrowsSvg}
          alt="Arrows"
          className="menu-button-icon"
        />
      </MenuButton>
      <MenuList className="program-sorting-popup">
        <MenuItem
          onClick={() => onSortChange("title", "asc")}
          width="100%"
        >
          <Box className="icon-style">A ‑ Z</Box>
        </MenuItem>
        <MenuItem
          onClick={() => onSortChange("title", "desc")}
          width="100%"
        >
          <Box className="icon-style">Z ‑ A</Box>
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default ProgramSortingModal;
