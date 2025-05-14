import React, { useCallback, useEffect, useState } from "react";

import {
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Td,
  Text,
} from "@chakra-ui/react";

import CancelIconRed from "../../assets/CancelIconRed";
import { EditIcon } from "../../assets/EditIcon";
import { MenuOptionsIcon } from "../../assets/MenuOptionsIcon";

const ActionsIcon = React.memo(() => (
  <Icon
    as={MenuOptionsIcon}
    alt="Actions"
  />
));

const CancelXIcon = React.memo(() => (
  <Icon
    as={CancelIconRed}
    alt="Cancel"
  />
));

const EditPencilIcon = React.memo(() => (
  <Icon
    as={EditIcon}
    alt="Edit"
  />
));

export const EditCancelPopup = ({ handleEdit, handleDeactivate, id }) => {
  return (
    <Menu>
      <MenuButton
        as={IconButton}
        aria-label="Options"
        icon={<ActionsIcon />}
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
        <MenuItem
          onClick={() => handleDeactivate(id)}
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
          <CancelXIcon style={{ marginRight: "0" }} />
          <Text
            fontWeight={"400"}
            color={"#90080F"}
          >
            Cancel
          </Text>
        </MenuItem>
      </MenuList>
    </Menu>
  );
};
