import { Box, Flex, Stack, Input, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, useDisclosure, Icon } from "@chakra-ui/react";
import { PersonIcon } from "../../assets/AdminSettingsIcons";
import { EmailIcon } from "../../assets/EmailIcon";


export const AddClient = ({ isOpen, onClose, type }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add New {type}</ModalHeader>
        <ModalBody pb={6}>
          <Stack>
            <Flex>
              <Stack>
                  <PersonIcon width="50" height="50" />
                <EmailIcon width="30" height="30" />
              </Stack>
              <Stack>
                <Flex gap={2}>
                  <Input placeholder="First" />
                  <Input placeholder="Last" />
                </Flex>
                <Input placeholder="email@address.com" />
              </Stack>
            </Flex>
            <Flex justifyContent="flex-end" gap={2}>
              <Button>Cancel</Button>
              <Button onClick={onClose}>Save</Button>
            </Flex>
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
