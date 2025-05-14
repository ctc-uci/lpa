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
        className="actions-container"
      />
      <MenuList className="menu-list-custom">
        <MenuItem
          onClick={(e) => handleEdit(id, e)}
          className="menu-item menu-item--edit"
        >
          <EditPencilIcon style={{ marginRight: "6px" }} />
          <Text
            color="#2D3748"
            fontWeight={"400"}
          >
            Edit
          </Text>
        </MenuItem>
        <MenuItem
          onClick={() => handleDeactivate(id)}
        >
          <CancelXIcon style={{ marginRight: "6px" }} />
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
