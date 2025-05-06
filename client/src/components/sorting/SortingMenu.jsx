// src/components/sorting/SortingMenu.jsx
import React from "react";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Button,
  Flex,
  Box
} from "@chakra-ui/react";
import arrowsSvg from "../../assets/icons/right-icon.svg";
import "./Sorting.css";

const SortingMenu = ({ options, onSortChange }) => {
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
          marginLeft: "auto",
          marginRight: "-16px",
        }}
      >
        <img src={arrowsSvg} alt="Arrows" className="menu-button-icon" />
      </MenuButton>
      <MenuList className="program-sorting-popup">
        {options.map(({ label, value, order }) => (
          <MenuItem key={label} onClick={() => onSortChange(value, order)}>
            <Flex align="center" className="sort-menu-item">
              <Box className="icon-style" >{label}</Box>
            </Flex>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default SortingMenu;
