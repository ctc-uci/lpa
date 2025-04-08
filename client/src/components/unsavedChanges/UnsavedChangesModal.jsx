import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  Button,
} from "@chakra-ui/react";

import './UnsavedChangesModal.css';
import { CalendarIcon } from '../../assets/CalendarIcon';

export const UnsavedChangesModal = ( { isOpen, onOpen, onClose, exit } ) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      id="deactivateModal"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader
          paddingBottom="0"
        >
          Leave without saving changes?
        </ModalHeader>
        <ModalFooter id="deactivateFooter"
        >
          <Button
            variant="ghost"
            id="deactivateCancel"
            onClick={onClose}
          >
            Don't Save
          </Button>
          <Button
            id="deactivateConfirm"
            onClick={exit}
          >
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
