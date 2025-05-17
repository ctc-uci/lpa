import React from "react";

import {
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from "@chakra-ui/react";

import { EditIcon } from "../../assets/EditIcon";
import { MenuOptionsIcon } from "../../assets/MenuOptionsIcon";
import { FiMoreHorizontal } from "react-icons/fi";

const ActionsIcon = React.memo(() => (
  <Icon
    as={MenuOptionsIcon}
    alt="Actions"
  />
));

const EditPencilIcon = React.memo(() => (
  <Icon
    as={EditIcon}
    alt="Edit"
    boxSize="20px"
  />
));

export const EditOnlyPopup = ({ handleEdit, id }) => {
  return (
    <Menu>
      <MenuButton
        as={IconButton}
        aria-label="Options"
        icon={<FiMoreHorizontal />}
        variant="ghost"
        className="ellipsis-action-button"
      />
      <MenuList
        style={{
          display: "flex",
          padding: "4px",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "10px",
          borderRadius: "6px",
          border: "1px solid var(--Secondary-3, #E2E8F0)",
          background: "#FFF",
          boxShadow: "0px 1px 2px 0px rgba(0, 0, 0, 0.05)",
          width: "139px",
          minWidth: "139px",
          maxWidth: "139px"
        }}
      >
        <MenuItem
          onClick={(e) => handleEdit(id, e)}
          style={{
            display: "flex",
            width: "131px",
            padding: "6px 8px",
            alignItems: "center",
            gap: "10px",
            borderRadius: "4px",
            background: "#FFF"
          }}
        >
          <EditPencilIcon style={{ marginRight: "0" }} />
          <Text
            color="#2D3748"
            fontWeight={"400"}
          >
            Edit
          </Text>
        </MenuItem>
      </MenuList>
    </Menu>
  );
}; 