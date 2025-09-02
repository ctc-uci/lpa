import React, { useCallback } from "react";

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast,
} from "@chakra-ui/react";

import { useBackendContext } from "../../contexts/hooks/useBackendContext";

export const DeleteSessionConfirmationModal = ({
  isOpen,
  onClose,
  date,
  isNewSession,
  id,
  setPrograms,
  programs
}) => {
  const toast = useToast();
  const { backend } = useBackendContext();

  const onDelete = useCallback(async () => {
    try {
      if (setPrograms) {
        console.log("ID is: " + id);
        setPrograms((prev) => prev.map((p) => p.id === id ? { ...p, isDeleted: true } : p));
      }
      toast({
        title: "Booking deleted",
        description:
          "The booking and all related records have been successfully deleted.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
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
  }, [backend, toast, id, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalOverlay />
      <ModalContent
        padding="26px"
        width="464px"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        gap="26px"
        borderRadius="6px"
      >
        <ModalHeader
          textAlign="left"
          color="#4A5568"
          fontSize="16px"
          fontWeight="700"
          p="0"
        >
          Delete {date} session?
        </ModalHeader>
        <ModalBody p="0">This session will be permanently deleted.</ModalBody>
        <ModalFooter
          style={{ display: "flex", justifyContent: "flex-end" }}
          gap={3}
          p="0"
        >
          <Button
            onClick={onClose}
            backgroundColor="#EDF2F7"
            color="#2D3748"
            fontSize="14px"
            fontWeight="500"
            borderRadius="6px"
            height="40px"
            width="58px"
          >
            Exit
          </Button>
          <Button
            onClick={() => {
              onDelete();
            }}
            backgroundColor="#90080F"
            color="#EDF2F7"
            fontSize="14px"
            fontWeight="500"
            borderRadius="6px"
            height="40px"
            width="86px"
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
