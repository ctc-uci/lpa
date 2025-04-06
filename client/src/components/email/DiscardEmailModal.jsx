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

  

export const DiscardEmailModal = ({ isOpen, onClose, emptyInputs, setisDrawerOpen }) => {

  return (
    <>
      <Modal isCentered isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Discard Email Draft</ModalHeader>
          <ModalBody>
            Would you like to discard email?
          </ModalBody>

          <ModalFooter>
            <Button
             colorScheme='gray' 
             mr={3} 
             onClick={() => {
              setisDrawerOpen(true);
              onClose();
             }}
            
            >
                Cancel
            </Button>
            <Button 
              background='#90080F' 
              color="white" 
              onClick={() => {
                setisDrawerOpen(false);
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
