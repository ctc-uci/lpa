import React , { useRef } from "react";

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

const DateSortingModal = ({ sortOrder, setSortOrder }) => {
  const initialRef = useRef();

  return (
    <Menu initialFocusRef={initialRef}>
      <MenuButton
        as={Button}
        variant="ghost"
        size="sm"
        sx={{
          _hover: { background: "transparent" },
          _active: { background: "transparent" },
          _focus: { background: "transparent" },
          marginLeft: "auto",
          marginRight: "-14px",
        }}

      >
        <img
          src={arrowsSvg}
          alt="Arrows"
          className="menu-button-icon"
        />
      </MenuButton>
      <MenuList className="date-sorting-popup" ref={initialRef}>
        <MenuItem
          onClick={() => setSortOrder("asc")}
          backgroundColor={sortOrder === "asc" ? "#EDF2F7" : "transparent"}
        >
          <Box className="icon-style">Soonest - Latest</Box>
        </MenuItem>
        <MenuItem
          onClick={() => setSortOrder("desc")}
          backgroundColor={sortOrder === "desc" ? "#EDF2F7" : "transparent"}
        >
          <Box className="icon-style">Latest - Soonest</Box>
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default DateSortingModal;
