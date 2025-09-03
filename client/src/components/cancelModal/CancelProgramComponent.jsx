import React, { useCallback, useEffect, useState } from "react";

import "./CancelProgramComponent.css";

import { ChevronDownIcon } from "@chakra-ui/icons";
import { DeleteIconRed } from "../../assets/DeleteIconRed";
import {
  Box,
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
  useToast,
} from "@chakra-ui/react";

import { CancelArchiveIcon } from "../../assets/CancelArchiveIcon";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { getCurrentUser } from "../../utils/auth/firebase";
import { archiveProgram, deleteProgram } from "../../utils/programModifications";
import { useNavigate } from "react-router-dom";

export const CancelProgram = ({
  id,
  sessionId,
  setPrograms,
  onOpen,
  isOpen,
  onClose,
  type,
  handleArchiveSession,
  setIsArchived,
}) => {
  const [selectedAction, setSelectedAction] = useState("Archive");
  const [selectedIcon, setSelectedIcon] = useState(<CancelArchiveIcon />);
  const [cancelReason, setCancelReason] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const { backend } = useBackendContext();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // get event description
    console.log("id: ", id);
    if (!id) return;
    const fetchData = async () => {
      const request = await backend.get(`events/${id}`);
      setEventDescription(request.data[0].description);
      if (request.data[0].description) {
        setEventDescription(request.data[0].description);
        console.log("event description: ", request.data[0].description);
      }
    };
    try {
      fetchData();
    } catch (error) {
      console.log("Error fetching event description: ", error);
    }
  }, [backend, id]);

  const handleSelect = useCallback((action, iconSrc) => {
    setSelectedAction(action);
    setSelectedIcon(iconSrc);
  }, []);

  const handleProgramArchive = useCallback(async () => {
    try {
      await archiveProgram(backend, id, cancelReason);
      if (setPrograms) {
        setPrograms((prev) => prev.filter((p) => p.id !== id));
      }
      onClose();
      toast({
        title: "Program archived",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.log("Couldn't archive", error);
      toast({
        title: "Archive program failed",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [backend, id, cancelReason, setPrograms, onClose, toast]);

  const handleBookingArchive = useCallback(async () => {
    try {
      await backend.put(`/bookings/${sessionId}`, {
        archived: true,
      });
      // if (setPrograms) {
      //   setPrograms((prev) => prev.filter((p) => p.id !== sessionId));
      // }
      onClose();
      toast({
        title: "Booking archived",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.log("Couldn't archive", error);
      toast({
        title: "Archive booking failed",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [backend, sessionId, onClose, toast]);

  const handleProgramDelete = useCallback(async () => {
    try {
      await deleteProgram(backend, id);
      if (setPrograms) {
        setPrograms((prev) => prev.filter((p) => p.id !== id));
      }
      toast({
        title: "Program deleted",
        description:
          "The program and all related records have been successfully deleted.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      navigate(`/programs`);
    } catch (error) {
      console.error("Failed to delete program:", error);
      toast({
        title: "Delete failed",
        description:
          error.response?.data?.message ||
          "An error occurred while deleting the program.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    onClose();
  }, [backend, id, onClose, setPrograms, toast]);

  const handleBookingDelete = useCallback(async () => {
    try {
      const response = await backend.delete(`/bookings/${sessionId}`);
      if (response.data.result === "success") {
        if (setPrograms) {
          setPrograms((prev) => prev.filter((p) => p.id !== sessionId));
        }
        toast({
          title: "Booking deleted",
          description:
            "The booking and all related records have been successfully deleted.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error("Failed to delete booking");
      }
    } catch (error) {
      console.error("Failed to delete booking:", error);
      toast({
        title: "Delete failed",
        description:
          error.response?.data?.message ||
          "An error occurred while deleting the booking.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    onClose();
  }, [onClose, backend, sessionId, setPrograms, toast]);

  const handleConfirm = useCallback(async () => {
    setSubmissionLoading(true);
    if (selectedAction === "Archive") {
      if (type === "Program") {
        await handleProgramArchive();
      } else if (type === "Booking" || type === "Session") {
        await handleArchiveSession(sessionId);
        onClose();
      }
    } else if (selectedAction === "Delete") {
      if (type === "Program") {
        await handleProgramDelete();
      } else if (type === "Booking" || type === "Session") {
        await handleBookingDelete();
      }
    }
    setSubmissionLoading(false);
  }, [selectedAction, type, handleProgramArchive, handleArchiveSession, sessionId, onClose, handleProgramDelete, handleBookingDelete]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader className="cancelModalHeader">Cancel {type}?</ModalHeader>
        <ModalBody>
          <Box>
            <Flex className="cancelModalText">
              <Text>
                {selectedAction === "Archive" ? (
                  <>
                    {type.toLowerCase() === "program" ? (
                      <>
                        The total costs for all sessions within 2 weeks will be added as a fee to the current invoice. This invoice will not be shown until the program is unarchived.
                      </>
                    ) : (
                      <>
                        The cancellation fee deadline for this {type.toLowerCase()} is
                        Thu. 1/2/2025.
                      </>
                    )}
                  </>
                ) : (
                  <>
                    Are you sure you want to delete this {type.toLowerCase()}? {type.toLowerCase() === "program" && "All sessions, invoices, and comments will be deleted."}
                  </>
                )}
              </Text>
            </Flex>
          </Box>
          <Box mt={4}>
            {selectedAction === "Archive" && (
              <>
                <Text
                  fontWeight="medium"
                  className="cancelModalCancelReason"
                >
                  Reason for Cancellation:
                </Text>
                <Textarea
                  bg="transparent"
                  size="md"
                  borderRadius="md"
                  onChange={(e) => {
                    setCancelReason(e.target.value);
                    console.log(cancelReason);
                    }}
                />
              </>
            )}
          </Box>
          <Box
            mt={4}
            display="flex"
            justifyContent="right"
          >
            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon boxSize={5} />}
                variant="outline"
                justify="right"
                className="cancelActionsContainer"
                fontSize={"14px"}
              >
                {selectedIcon} {selectedAction}
              </MenuButton>
              <MenuList className="menu-list-custom">
                <MenuItem
                  onClick={() => handleSelect("Archive", <CancelArchiveIcon />)}
                  className="menu-item"
                  fontSize={"14px"}
                  style={{backgroundColor:"transparent"}}
                >
                  <CancelArchiveIcon />
                  Archive
                </MenuItem>
                <MenuItem
                  fontSize={"14px"}
                  onClick={() => handleSelect("Delete", <DeleteIconRed />)}
                  className="menu-item"
                  color="#90080F"
                >
                  <DeleteIconRed />
                  Delete
                </MenuItem>
              </MenuList>
            </Menu>
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button
            onClick={onClose}
            bg="#EDF2F7"
            color="#2D3748"
            borderRadius="6px"
            mr={3}
            fontWeight={"500"}
          >
            Exit
          </Button>
          <Button
            isLoading={submissionLoading}
            onClick={handleConfirm}
            bg="#90080F"
            color="white"
            borderRadius="6px"
            fontWeight={"500"}
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
