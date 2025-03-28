import React from 'react'

import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
  } from "@chakra-ui/react";

  

export const DiscardEmailModal = ({ isOpen, onClose, emptyInputs }) => {

  return (
    <>
      <Modal isCentered isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Discard Changes?</ModalHeader>
          <ModalBody>
            Would you like to discard email?
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='gray' mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button 
                background='#90080F' 
                color="white" 
                onClick={() => {
                  emptyInputs();
                  onClose();
                }}
              >
                Confirm
              </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
