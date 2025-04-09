import React from 'react';
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
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
    useToast,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

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

export const ArchivedDropdown = ({programId, programName, setProgramToDelete, onOpen, setArchivedProgramSessions, setIsArchived}) => {
  const reactivationToast = useToast();
  const { backend } = useBackendContext();
  const navigate = useNavigate();

  const duplicateArchivedProgram = async (programId) => {
      try {
          // Get original program data
          const originalEvent = await backend.get(`/events/${programId}`);
          const originalSessions = await backend.get(
              `/bookings/byEvent/${programId}`
          );
          const originalAssignments = await backend.get(
              `/assignments/event/${programId}`
          );

          // Create a new program
          const newEventData = { ...originalEvent.data[0] };
          delete newEventData.id; // Remove the original ID
          newEventData.name = `${originalEvent.data[0].name}`;
          newEventData.description = `${originalEvent.data[0].description}`;
          newEventData.archived = false; // Ensure the new event is not archived
          const newEvent = await backend.post("/events", newEventData);
          console.log("New event created:", newEvent.data);
          console.log(newEventData);

          // Create copies of sessions for the new program
          for (const session of originalSessions.data) {
              const newSessionData = {
                  event_id: newEvent.data.id,
                  room_id: session.roomId,
                  start_time: session.startTime,
                  end_time: session.endTime,
                  date: session.date,
                  archived: false,
              };
              const newBooking = await backend.post("/bookings", newSessionData);
              console.log("New booking", newSessionData);
              console.log(newBooking);
          }

          // Create copies of assignments for the new program
          for (const assignment of originalAssignments.data) {
              const newAssignmentData = {
                  event_id: newEvent.data.id, // Set the new event ID
                  client_id: assignment.clientId, // Ensure clientId is a number
                  role: assignment.role,
              };
              console.log(newAssignmentData)
              const newAssignment = await backend.post(
                  "/assignments",
                  newAssignmentData
              );
          }

          // Return the new program data
          return newEvent.data;
      } catch (error) {
          console.log("Couldn't duplicate event", error);
      }
  };

  const handleDuplicate = async (programId, programName) => {
      try {
          await duplicateArchivedProgram(programId);
          navigate(`/programs/edit/${programId}`, { state: { duplicated: true, programName } })
      } catch (error) {
          console.log("Couldn't duplicate program", error);
      }
  };

  const reactivateArchivedProgram = async (programId) => {
      try {
          await backend.put(`/events/${programId}`, {
              archived: false,
          });
      } catch (error) {
          console.log("Couldn't reactivate", error);
      }
  };

  const handleReactivate = async (programId, programName) => {
      try {
          await reactivateArchivedProgram(programId);
          // Update local state
          if (setArchivedProgramSessions) {
            setArchivedProgramSessions((prevSessions) =>
                prevSessions.filter((session) => session.programId !== programId)
            );
          }
          else if (setIsArchived) {
            setIsArchived(false);
          }
          reactivationToast({
              title: "Program Reactivated",
              description: programName,
              status: "success",
              duration: 5000,
              isClosable: true
          })
          navigate("/programs");
      } catch (error) {
          console.log("Couldn't reactivate program", error);
      }
  };

  const handleConfirmDelete = (programId) => {
      onOpen();
      if (setProgramToDelete)
        setProgramToDelete(programId);
  };

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
            <MenuList className="menu-list">
                <MenuItem
                    onClick={() =>
                        handleDuplicate(
                            programId,
                            programName
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
                        <TooltipIcon/>
                    </Tooltip>
                  </Box>
                </MenuItem>
                <MenuItem
                    onClick={() =>
                      handleReactivate(
                        programId,
                        programName
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
                            programId
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
