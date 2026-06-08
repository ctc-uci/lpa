import { useEffect, useState } from "react";

import {
  Flex,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
} from "@chakra-ui/react";

import { EmailDropdown } from "../clientsearch/EmailDropdown.jsx";

export const RecipientField = ({
  label,
  recipients,
  onRecipientsChange,
  onSearchClients,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchedUsers, setSearchedUsers] = useState([]);

  useEffect(() => {
    onSearchClients(searchTerm, setSearchedUsers, recipients);
  }, [searchTerm, recipients, onSearchClients]);

  const removeRecipient = (email) => {
    onRecipientsChange(
      recipients.filter((item) => item?.email !== email)
    );
  };

  return (
    <>
      <Flex
        justifyContent="space-between"
        alignItems="center"
        gap="4"
      >
        <Text
          color="#474849"
          fontSize="14px"
        >
          {label}:
        </Text>
        <EmailDropdown
          searchTerm={searchTerm}
          searchedUser={searchedUsers}
          selectedUsers={recipients}
          setSelectedUsers={onRecipientsChange}
          setSearchedUsers={setSearchedUsers}
          getUserResults={(term) => onSearchClients(term, setSearchedUsers, recipients)}
          setSearchTerm={setSearchTerm}
        />
      </Flex>
      <Flex
        gap="4"
        flexWrap="wrap"
      >
        {recipients.map(
          (user, index) =>
            user?.email && (
              <Tag
                key={`${label}-${user.email}-${index}`}
                size="lg"
                borderRadius="full"
                variant="solid"
                bg="white"
                border="1px solid"
                borderColor="#E2E8F0"
                textColor="#080A0E"
                fontWeight="normal"
                py={label === "To" ? 2 : undefined}
              >
                <TagLabel>{user.email}</TagLabel>
                <TagCloseButton
                  onClick={() => removeRecipient(user.email)}
                  bgColor="#718096"
                  opacity="none"
                  _hover={{ bg: "#4441C8" }}
                  textColor="white"
                />
              </Tag>
            )
        )}
      </Flex>
    </>
  );
};
