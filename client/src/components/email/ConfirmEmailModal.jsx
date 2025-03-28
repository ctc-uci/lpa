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

// TODO:
// Must pass in the subject of the email and the recipients
export const ConfirmEmailModal = ({ isOpen, onClose, title, emails, ccEmails, bccEmails, emptyInputs }) => {
  const combinedArray = [...emails, ...ccEmails, ...bccEmails];
  const uniqueEmails = [... new Set(combinedArray)];
  
  return (
    <>
      <Modal isCentered isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Email Confirmation Sent!</ModalHeader>
          <ModalBody>
            {title} has been sent to {uniqueEmails.join(", ")}
          </ModalBody>

          <ModalFooter>
            {/*TODO: Make sure that when person confirms, it closes the whole drawer */}
            <Button 
              colorScheme='purple' 
              mr={3} 
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
