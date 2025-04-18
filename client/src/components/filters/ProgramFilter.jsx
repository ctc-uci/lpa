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
      <MenuList
        sx={{
          display: "flex",
          width: "176px",
          padding: "4px",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "10px",
          borderRadius: "4px",
          border: "1px solid var(--Secondary-3, #E2E8F0)",
          background: "#FFF",
          boxShadow: "0px 1px 2px 0px rgba(0, 0, 0, 0.05)"
        }}
      >
        <MenuItem
          onClick={() => onSortChange("title", "asc")}
          width="100%"
        >
          <Box className="icon-filter-style">A ‑ Z</Box>
        </MenuItem>
        <MenuItem
          onClick={() => onSortChange("title", "desc")}
          width="100%"
        >
          <Box className="icon-filter-style">Z ‑ A</Box>
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default ProgramSortingModal;