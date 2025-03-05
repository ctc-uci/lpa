import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Text
} from "@chakra-ui/react";

export const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  return (
    <>
      {/* <Button onClick={onOpen}>Discard Changes?</Button> */}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Discard Changes</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='#EDF2F7' mr={3} onClick={onClose}>
              Exit
            </Button>
            <Button colorScheme='#90080F' onClick={onConfirm}>
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
