import React from 'react';
import "./ArchivedDropdown.css";

import {
    Box,
    Icon,
    IconButton,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Text,
    Tooltip,
} from "@chakra-ui/react";

import {
    deleteIcon,
    duplicateIcon,
    reactivateIcon,
    TooltipIcon
} from "../../assets/icons/ProgramIcons";
import { MenuOptionsIcon } from "../../assets/MenuOptionsIcon";

const ActionsIcon = React.memo(() => (
  <Icon
    as={MenuOptionsIcon}
    alt="Actions"
  />
));

export const ArchivedDropdown = ({programSession, handleDuplicate, handleReactivate, handleConfirmDelete}) => {

  return (
      <>
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
                    onClick={() =>
                        handleDuplicate(
                            programSession.programId,
                            programSession.programName
                        )
                    }
                    className="menu-item menu-item--edit"
                >
                  <Box
                    className="menuItemBox"
                  >
                    <div className="horizontal">
                      <Icon as={duplicateIcon} />
                      <Text className="dropdownText">Duplicate</Text>
                    </div>
                    <Tooltip label="For applying changes to program/session">
                        <TooltipIcon>
                        </TooltipIcon>
                    </Tooltip>
                  </Box>
                </MenuItem>
                <MenuItem
                    onClick={() =>
                      handleReactivate(
                        programSession.programId,
                        programSession.programName
                      )
                    }
                    className="menu-item menu-item--edit"
                >
                  <Box
                    className="menuItemBox"
                  >
                    <div className="horizontal">
                      <Icon as={reactivateIcon} />
                      <Text className="dropdownText">Reactivate</Text>
                    </div>
                    <Tooltip label="No changes will be applied to program/session">
                        <TooltipIcon></TooltipIcon>
                    </Tooltip>
                  </Box>
                </MenuItem>
                <MenuItem
                    onClick={() =>
                        handleConfirmDelete(
                            programSession.programId
                        )
                    }
                    className="menu-item menu-item--edit"
                >
                  <Box
                    className="menuItemBox"
                  >
                    <div className="horizontal">
                      <Icon as={deleteIcon} />
                      <Text className="dropdownTextRed">Delete</Text>
                    </div>
                  </Box>
                </MenuItem>
            </MenuList>
        </Menu>
      </>
);
};
