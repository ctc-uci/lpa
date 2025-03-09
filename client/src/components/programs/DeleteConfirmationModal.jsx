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

      <Modal isCentered isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Discard Changes?</ModalHeader>
          {/* <ModalCloseButton /> */}
          <ModalBody>
            
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='gray' mr={3} onClick={onClose}>
                Exit
              </Button>
              <Button background='#90080F' color="white" onClick={onConfirm}>
                Confirm
              </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
