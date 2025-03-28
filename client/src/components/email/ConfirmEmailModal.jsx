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

// TODO:
// Must pass in the subject of the email and the recipients
export const ConfirmEmailModal = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  
  return (
    <>
      <Button onClick={onOpen}>Confirmation Modal</Button>

      <Modal isCentered isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Email Confirmation Sent!</ModalHeader>
          <ModalBody>
            [Subject of Email] has been sent to [Recipients]
          </ModalBody>

          <ModalFooter>
            {/*TODO: Make sure that when person confirms, it closes the whole drawer */}
            <Button colorScheme='purple' mr={3} onClick={onClose}>
                Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
