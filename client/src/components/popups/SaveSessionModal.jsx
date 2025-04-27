import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalBody,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";

export const SaveSessionModal = ({isOpen, onClose, pendingNavigation, setHasUnsavedChanges, programName}) => {
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
          pb={4}
          fontSize="16px"
          fontWeight="700"
          p="0"
        >
          Save changes to sessions?
        </ModalHeader>
        <ModalBody p="0">
            This preview of sessions table will be applied to the program: {programName}.
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
            width="79px"
          >
            Cancel
          </Button>
          <Button
            onClick={onClose}
            backgroundColor="#4441C8"
            color="#FFFFFF"
            fontSize="14px"
            fontWeight="500"
            borderRadius="6px"
            height="40px"
            width="65px"
          >
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
};
