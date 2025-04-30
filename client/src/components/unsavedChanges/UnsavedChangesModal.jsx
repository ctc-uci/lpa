import {
  Button,
  Icon,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";

import { IoCloseOutline } from "react-icons/io5";

import "./UnsavedChangesModal.css";

export const UnsavedChangesModal = ({ isOpen, onOpen, onClose, exit, save, isFormValid = () => true }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      id="deactivateModal"
    >
      <ModalOverlay />
      <ModalContent my="auto" fontFamily={"Inter"}>
        <ModalHeader
          paddingBottom="0"
          position="relative"
          paddingLeft="3rem"
          fontSize={"16px"}
          fontWeight={"700"}
        >
          <Icon
            fontSize="xl"
            onClick={onClose}
            id="leftCancel"
            position="absolute"
            left="1rem"
            top="35%"
            transform="translateY(-50%)"
            cursor="pointer"
          >
            <IoCloseOutline />
          </Icon>
          Leave without saving changes?
        </ModalHeader>
        <ModalFooter id="deactivateFooter">
          <Button
            variant="ghost"
            id="deactivateCancel"
            onClick={exit}
            fontSize={"14px"}
            padding={"0px 16px"}
            gap={"4px"}
            height={"40px"}
          >
            Don't Save
          </Button>
          <Button
            id="deactivateConfirm"
            onClick={save}
            isDisabled={!isFormValid()}
            fontSize={"14px"}
            padding={"0px 16px"}
            gap={"4px"}
            height={"40px"}
          >
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
