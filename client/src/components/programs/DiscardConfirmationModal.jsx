import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@chakra-ui/react";

export const DeleteConfirmationModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
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
