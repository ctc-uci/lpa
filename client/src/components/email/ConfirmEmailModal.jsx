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
export const ConfirmEmailModal = ({ isOpen, onClose, title, emails, ccEmails, bccEmails, closeDrawer }) => {
  const combinedArray = [...emails, ...ccEmails, ...bccEmails];
  const uniqueEmails = [... new Set(combinedArray)];

  console.log(title);
  
  return (
    <>
      <Modal isCentered isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Email Confirmation Sent!</ModalHeader>
          <ModalBody>
            [{title}] has been sent to {uniqueEmails.join(", ")}
          </ModalBody>

          <ModalFooter>
            {/*TODO: Make sure that when person confirms, it closes the whole drawer */}
            <Button 
              opacity={"none"}
              bg='#4441C8' 
              colorScheme='white'
              height={"45px"}
              borderRadius={"6px"}
              mr={3} 
              onClick={() => {
                onClose();
                closeDrawer();
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
