import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalBody,
} from "@chakra-ui/react";

export const DeleteRowModal = ({isOpen, onClose, pendingNavigation, setHasUnsavedChanges, programName}) => {
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
          Delete Row?
        </ModalHeader>
        <ModalBody p="0">
            All content from this row will be deleted.
        </ModalBody>
        <ModalFooter
          style={{ display: "flex", justifyContent: "flex-end" }}
          gap={3}
          p="0"
        >
          <Button
            onClick={() => {
              onClose();
              if (pendingNavigation) {
                pendingNavigation();
                setHasUnsavedChanges(false);
              }
            }}
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
            onClick={onClose}
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
  )
};
