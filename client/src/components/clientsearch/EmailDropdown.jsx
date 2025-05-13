import { useEffect, useState } from "react";
import { Box, Flex, Icon, Input, Tag, TagLabel, InputGroup, InputRightElement } from "@chakra-ui/react";
import { CloseFilledIcon } from "../../assets/CloseFilledIcon";
import { PlusFilledIcon } from "../../assets/PlusFilledIcon";

export const EmailDropdown = ({
  searchTerm,
  searchedUser,
  selectedUsers,
  setSelectedUsers,
  setSearchedUsers,
  getUserResults,
  setSearchTerm,
}) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest("#emailContainer")) {
        setDropdownVisible(true);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <Box w="70%" id="emailContainer">
      <InputGroup size="md" justifyContent="center">
        <Input
          placeholder="Email(s)"
          onChange={(e) => {
            getUserResults(e.target.value);
            setSearchTerm(e.target.value);
            setDropdownVisible(true);
          }}
          value={searchTerm}
          id="emailInput"
          autoComplete="off"
          pr="2.5rem"
        />
        <InputRightElement width="3rem">
          <Box
            as="button"
            onClick={() => {
              if (searchTerm && searchTerm.trim() !== "") {
                const user = searchedUser && searchedUser.find(
                  (u) => u && u.email && u.email.toLowerCase() === searchTerm.toLowerCase()
                );
                if (user && selectedUsers && !selectedUsers.some((u) => u.id === user.id)) {
                  setSelectedUsers((prevItems) => [...(prevItems || []), user]);
                }
                setSearchTerm("");
                setSearchedUsers([]);
                getUserResults("");
              }
            }}
            disabled={
              !searchTerm || searchTerm.trim() === "" ||
              !searchedUser || !searchedUser.some(
                (u) => u && u.email && u.email.toLowerCase() === searchTerm.toLowerCase()
              )
            }
            cursor={
              !searchTerm || searchTerm.trim() === "" ||
              !searchedUser || !searchedUser.some(
                (u) => u && u.email && u.email.toLowerCase() === searchTerm.toLowerCase()
              )
                ? "not-allowed" : "pointer"
            }
          >
            <PlusFilledIcon
              color={
                searchTerm && searchTerm.trim() !== "" &&
                searchedUser && searchedUser.some(
                  (u) => u && u.email && u.email.toLowerCase() === searchTerm.toLowerCase()
                )
                  ? "#4441C8" : "#718096"
              }
            />
          </Box>
        </InputRightElement>
      </InputGroup>

      {dropdownVisible && searchedUser && searchedUser.length > 0 && searchTerm && searchTerm.length > 0 && (
        <Box
          id="emailDropdown"
          w="100%"
          position="absolute"
          zIndex="10"
          bg="white"
          boxShadow="md"
          borderRadius="md"
          mt="1"
        >
          {searchedUser.map(
            (user) => user && user.email && (
              <Box
                key={user.id}
                onClick={() => {
                  if (selectedUsers && !selectedUsers.some((u) => u.id === user.id)) {
                    setSelectedUsers((prevItems) => [...(prevItems || []), user]);
                  }
                  setSearchTerm("");
                  setDropdownVisible(false);
                  setSearchedUsers([]);
                }}
                p="10px"
                fontSize="16px"
                cursor="pointer"
                transition="0.2s"
                bg="#F6F6F6"
                _hover={{ bg: "#D9D9D9" }}
              >
                {user.email}
              </Box>
            )
          )}
        </Box>
      )}
    </Box>
  );
};