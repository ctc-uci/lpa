import { Box, Flex, Stack, Input, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, useDisclosure, Icon, Text } from "@chakra-ui/react";
import { PersonIcon } from "../../assets/AdminSettingsIcons";
import { EmailIcon } from "../../assets/EmailIcon";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import React, { useState } from 'react';


export const AddClient = ({ isOpen, onClose, type }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const { backend } = useBackendContext();

  const addClient = async () => {
    try {
      const name = `${firstName.trim()} ${lastName.trim()}`.trim();

      const res = await backend.post("/clients", {
        name: name,
        email: email.trim(),
      });
      console.log("Client added:", res.data);
      setFirstName("");
      setLastName("");
      setEmail("");
      onClose();
    } catch (err) {
      setFirstName("");
      setLastName("");
      setEmail("");
      if (err.response.data) {
        setError("An error occurred while adding the client.");
        if (err.response.data.includes("unique_email")) {
          setError("Error: Email already exists");
        } else if (err.response.data.includes("name_unique")) {
          setError("Error: Name already exists");
        }
      }
    }
  };

  const handleCancel = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add {type}</ModalHeader>
        <ModalBody pb={6}>
          <Stack>
            <Flex>
              <Stack>
                  <Box height="2px" />
                  <PersonIcon width="20px" height="20px" />
                  <Box height="20px"></Box>
                  <EmailIcon width="20px" height="20px" />
              </Stack>
              <Stack>
                <Flex gap={2} marginLeft="15px">
                  <Input
                    placeholder="First"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  <Input
                    placeholder="Last"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </Flex>
                <Box height="3px"></Box>
                <Input
                  marginLeft="15px"
                  width="fill"
                  placeholder="email@address.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {error && <Text color="red" marginLeft="15px" marginTop="5px">{error}</Text>}
              </Stack>
            </Flex>
            <Flex justifyContent="flex-end" gap={2}>
              <Button onClick={handleCancel}>Cancel</Button>
              <Button onClick={addClient} bgColor="#4441C8" color="white">Save</Button>
            </Flex>
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
