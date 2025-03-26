import React from 'react'

import { useNavigate } from 'react-router-dom';

import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    useDisclosure,
    ModalCloseButton,
  } from "@chakra-ui/react";

  

export const DiscardEmailModal = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

  return (
    <>
      <Button onClick={onOpen}>Discard Modal</Button>

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
                onClick={() => navigate(-1)}
              >
                Confirm
              </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
