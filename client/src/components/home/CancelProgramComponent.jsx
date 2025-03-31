import React, { useCallback, useEffect, useState } from "react";

import {
  Modal,
  ModalOverlay,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Alert,
  Box,
  AlertTitle,
  Icon,
  Text,
  Textarea,
  Flex,
  AlertDescription,
  Checkbox,
  Menu,
  MenuItem,
  MenuList,
  MenuButton,
  Button,
  useToast,
} from "@chakra-ui/react";
import { Info } from "lucide-react";
import { ChevronDownIcon, DeleteIcon } from "@chakra-ui/icons";
import { ArchiveIcon } from "../../assets/ArchiveIcon";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";

export const CancelProgram = ( {id, setPrograms, onOpen, isOpen, onClose, type} ) => {
    const [selectedAction, setSelectedAction] = useState("Archive");
    const [selectedIcon, setSelectedIcon] = useState(<ArchiveIcon/>);
    const [cancelReason, setCancelReason] = useState("")
    const [eventDescription, setEventDescription] = useState("")
    const { backend } = useBackendContext();
    const toast = useToast();

    useEffect(() => { // get event description
      const fetchData = async () => {
        const request = await backend.get(`events/${id}`);
        setEventDescription(request.data[0].description);
        console.log("event description: ", request.data[0].description);
      }
      fetchData();
    }, [backend, id]);

    const handleSelect = useCallback((action, iconSrc) => {
        setSelectedAction(action);
        setSelectedIcon(iconSrc);
      }, []);

    const handleProgramArchive = useCallback(async () => {
      try {
        console.log("concat: ");
        console.log( eventDescription + '\n' + cancelReason);
        await backend.put(`/events/${id}`, {
          archived: true,
          description: eventDescription + '\n' + cancelReason,
        });
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
    }, [backend, id, onClose, toast, cancelReason]);

    const handleBookingArchive = useCallback(async () => {
      try {
        await backend.put(`/bookings/${id}`, {
          archived: true,
        });
        if (setPrograms) {
          setPrograms((prev) => prev.filter((p) => p.id !== id));
        }
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
    }, [backend, id, onClose, toast, cancelReason]);

    const handleProgramDelete = useCallback(async () => {
      try {
        const response = await backend.delete(`/events/${id}`);
        if (response.data.result === "success") {
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
        } else {
          throw new Error("Failed to delete program");
        }
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
    }, [backend, id, onClose, toast]);

    const handleBookingDelete = useCallback(async () => {
      try {
        const response = await backend.delete(`/bookings/${id}`);
        if (response.data.result === "success") {
          if (setPrograms) {
          setPrograms((prev) => prev.filter((p) => p.id !== id));
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
    }, [backend, id, onClose, toast]);

    const handleConfirm = useCallback(async () => {
      if (selectedAction === "Archive") {
        if (type === "Program") {
          await handleProgramArchive();
        }
        else if (type === "Booking") {
          await handleBookingArchive();
        }
      } else if (selectedAction === "Delete") {
        if (type === "Program") {
          await handleProgramDelete();
        }
        else if (type === "Booking") {
          await handleBookingDelete();
        }
      }
    }, [selectedAction, handleProgramArchive, handleBookingArchive, handleProgramDelete, handleBookingDelete]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Cancel {type}?</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
            <Box>
              <Flex alignitems="center">
                <Text>The cancellation fee deadline for this {type.toLowerCase()} is Thu. 1/2/2025.</Text>
              </Flex>
            </Box>
          <Box mt={4}>
            <Text
              fontWeight="medium"
              mb={2}
            >
              Reason for Cancellation:
            </Text>
            <Textarea
              bg="#F0F1F4"
              size="md"
              borderRadius="md"
              onChange={(e) => {setCancelReason(e.target.value);console.log(cancelReason);}}
            />
          </Box>
          <Box
            mt={4}
            display="flex"
            justifyContent="right"
          >
            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                bg="#F0F1F4"
                variant="outline"
                width="50%"
                justify="right"
              >
                <div id="actionChoice">
                  {selectedIcon} {selectedAction}
                </div>
              </MenuButton>
              <MenuList>
                <MenuItem
                  icon={<ArchiveIcon/>}
                  onClick={() => handleSelect("Archive", <ArchiveIcon />)}
                >
                  Archive
                </MenuItem>
                <MenuItem
                  icon={<DeleteIcon />}
                  onClick={() => handleSelect("Delete", <DeleteIcon />)}
                >
                  Delete
                </MenuItem>
              </MenuList>
            </Menu>
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button
            bg="transparent"
            onClick={onClose}
            color="#767778"
            borderRadius="30px"
            mr={3}
          >
            Exit
          </Button>
          <Button
            onClick={handleConfirm}
            style={{ backgroundColor: "#90080F" }}
            colorScheme="white"
            borderRadius="30px"
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
