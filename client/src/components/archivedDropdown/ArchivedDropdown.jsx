import React from "react";

import { useBackendContext } from "../../contexts/hooks/useBackendContext";

import "./ArchivedDropdown.css";

import {
  Box,
  Flex,
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

import { GreenCheckIcon } from "../../assets/GreenCheckIcon";
import {
  deleteIcon,
  duplicateIcon,
  reactivateIcon,
  TooltipIcon,
} from "../../assets/icons/ProgramIcons";
import { MenuOptionsIcon } from "../../assets/MenuOptionsIcon";

const ActionsIcon = React.memo(() => (
  <Icon
    as={MenuOptionsIcon}
    alt="Actions"
    boxSize="16px"
  />
));

export const ArchivedDropdown = ({
  programId,
  programName,
  setProgramToDelete,
  onOpen,
  setArchivedProgramSessions,
  setIsArchived,
}) => {
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
      console.log("New event created:", newEvent.data.id);

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
          eventId: newEvent.data.id, // Set the new event ID
          clientId: assignment.clientId, // Ensure clientId is a number
          role: assignment.role,
        };
        console.log(newAssignmentData);
        const newAssignment = await backend.post(
          "/assignments",
          newAssignmentData
        );
      }

      console.log("new event data (new id): ", newEvent.data.id);
      // Return the new program data
      return newEvent.data.id;
    } catch (error) {
      console.log("Couldn't duplicate event", error);
    }
  };

  const handleDuplicate = async (programId, programName) => {
    try {
      const newProgramId = await duplicateArchivedProgram(programId);
      console.log("newProgramId: ", newProgramId);
      navigate(`/programs/edit/${newProgramId}`, {
        state: { duplicated: true, programName },
      });
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
      } else if (setIsArchived) {
        setIsArchived(false);
      }

      const maxLength = 35;
      const displayName =
        programName.length > maxLength
          ? `"${programName.substring(0, maxLength)}..."`
          : `"${programName}"`;

      reactivationToast({
        title: "Program Reactivated",
        description: displayName,
        status: "success",
        duration: 5000,
        variant: "subtle",
        render: ({ title, description }) => (
          <Box
            p={4}
            display="flex"
            alignItems="center"
            borderLeft="4px solid var(--green-500, #38A169)"
            background="#C6F6D5"
            width="400px"
            height="4rem"
          >
            <Flex mr={3}>
              <GreenCheckIcon />
            </Flex>
            <Box flex="1">
              <Text
                fontWeight="700"
                fontSize="16px"
                color="#2D3748"
                fontFamily="Inter"
                lineHeight="24px"
              >
                {title}
              </Text>
              <Text
                fontWeight="400"
                fontSize="14px"
                color="2#D3748"
                fontFamily="Inter"
              >
                {description}
              </Text>
            </Box>
          </Box>
        ),
      });
      navigate("/programs");
    } catch (error) {
      console.log("Couldn't reactivate program", error);
    }
  };

  const handleConfirmDelete = (programId) => {
    onOpen();
    if (setProgramToDelete) setProgramToDelete(programId);
  };

  return (
    <>
      <Menu autoSelect={false}>
        <MenuButton
          as={IconButton}
          aria-label="Options"
          icon={<ActionsIcon />}
          variant="ghost"
          className="actions-container"
          _hover={{ bg: "var(--Secondary-3, #E2E8F0)" }}
          _active={{ bg: "var(--Secondary-3, #E2E8F0)" }}
          _focus={{ boxShadow: "none", bg: "var(--Secondary-3, #E2E8F0)" }}
          minW="24px"
          h="24px"
          w="24px"
          p="0"
        />
        <MenuList className="menu-list">
          <MenuItem
            onClick={() => handleDuplicate(programId, programName)}
            className="menu-item menu-item--edit"
          >
            <Box className="menuItemBox">
              <div className="horizontal">
                <Icon as={duplicateIcon} />
                <Text className="dropdownText">Duplicate</Text>
              </div>
              <Tooltip
                label="For applying changes to program/session"
                textAlign={"center"}
                maxWidth={"136px"}
                bgColor={"#718096"}
                borderRadius={"4px"}
                placement="top-end"
              >
                <Box display="flex" alignItems="center" boxSize="16px">
                  <TooltipIcon boxSize="16px" />
                </Box>
              </Tooltip>
            </Box>
          </MenuItem>
          <MenuItem
            onClick={() => handleReactivate(programId, programName)}
            className="menu-item menu-item--edit"
          >
            <Box className="menuItemBox">
              <div className="horizontal">
                <Icon as={reactivateIcon} />
                <Text className="dropdownText">Reactivate</Text>
              </div>
              <Tooltip
                textAlign={"center"}
                label="No changes will be applied to program/session"
                maxWidth={"136px"}
                bgColor={"#718096"}
                borderRadius={"4px"}
                placement="top-end"
              >
                <Box display="flex" alignItems="center" boxSize="16px">
                  <TooltipIcon boxSize="16px" />
                </Box>
              </Tooltip>
            </Box>
          </MenuItem>
          <MenuItem
            onClick={() => handleConfirmDelete(programId)}
            className="menu-item menu-item--edit"
          >
            <Box className="menuItemBox">
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
