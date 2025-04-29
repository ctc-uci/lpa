import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import { useNavigate } from 'react-router-dom';


export const UnsavedChangesModal = ({isOpen, onClose, pendingNavigation, setHasUnsavedChanges, noSave, save, isFormValid = () => true}) => {
  const navigate = useNavigate();

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
          Leave without saving changes?
        </ModalHeader>
        <ModalFooter
          style={{ display: "flex", justifyContent: "flex-end" }}
          gap={3}
          p="0"
        >
          <Button
            onClick={() => {noSave()}}
            backgroundColor="#EDF2F7"
            color="#2D3748"
            fontSize="14px"
            fontWeight="500"
            borderRadius="6px"
            height="40px"
            width="105px"
          >
            Don't Save
          </Button>
          <Button
            onClick={save}
            isDisabled={!isFormValid()}
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
