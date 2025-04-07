import { CancelIcon } from "../../assets/CancelIcon";
import { EditIcon } from "../../assets/EditIcon";
import React, { useCallback, useEffect, useState } from "react";
import { MenuOptionsIcon } from "../../assets/MenuOptionsIcon";

import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  Td,
  Icon,
  IconButton,
} from "@chakra-ui/react";

const ActionsIcon = React.memo(() => (
  <Icon
    as={MenuOptionsIcon}
    alt="Actions"
  />
));

const CancelXIcon = React.memo(() => (
  <Icon
    as={CancelIcon}
    alt="Cancel"
  />
));

const EditPencilIcon = React.memo(() => (
  <Icon
    as={EditIcon}
    alt="Edit"
  />
));

export const EditCancelPopup = ({handleEdit, handleDeactivate, id}) => {

  return (
    <Td
      borderRightRadius="12px"
      onClick={(e) => e.stopPropagation()}
    >
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label="Options"
          icon={<ActionsIcon />}
          variant="ghost"
          className="actions-container"
        />
        <MenuList className="menu-list-custom"
          width="10rem"
          minWidth="10rem">
          <MenuItem
            onClick={(e) => handleEdit(id, e)}
            className="menu-item menu-item--edit"
          >
            <EditPencilIcon style={{ marginRight: "6px" }} />
            <Text color="#2D3748">Edit</Text>
          </MenuItem>
          <MenuItem
            onClick={() => handleDeactivate(id)}
            color="#90080F!important"
          >
            <CancelXIcon style={{ marginRight: "6px" }} />
            Cancel
          </MenuItem>
        </MenuList>
      </Menu>
    </Td>
  );
};
