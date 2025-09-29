import { useEffect, useRef, useState } from "react";
import {
  Box,
  Input,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
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
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setDropdownVisible(false);
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside); // 👈 not "click"
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    console.log("selectedUsers", selectedUsers)
  }, [selectedUsers])

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return (
    <Box w="100%" position="relative" ref={containerRef}>
      <InputGroup size="md" justifyContent="center">
        <Input
          placeholder="Email(s)"
          onChange={(e) => {
            getUserResults(e.target.value);
            setSearchTerm(e.target.value);
            setDropdownVisible(true);
          }}
          onFocus={() => setDropdownVisible(true)}
          value={searchTerm}
          autoComplete="off"
          pr="2.5rem"
        />
        <InputRightElement width="3rem">
          <Box
            as="button"
            onClick={() => {
              if (searchTerm && searchTerm.trim() !== "") {
                const user =
                  searchedUser &&
                  searchedUser.find(
                    (u) =>
                      u &&
                      u.email &&
                      u.email.toLowerCase() === searchTerm.toLowerCase()
                  );
                if (
                  user &&
                  selectedUsers &&
                  !selectedUsers.some((u) => u.id === user.id)
                ) {
                  setSelectedUsers((prevItems) => [...(prevItems || []), user]);
                }
                else {
                  setSelectedUsers((prevItems) => [...(prevItems || []), {email: searchTerm}]);
                }
                setSearchTerm("");
                setSearchedUsers([]);
                getUserResults("");
              }
              
            }}
            disabled={
              !searchTerm || !emailRegex.test(searchTerm.trim())
            }
            cursor={
              !searchTerm ||
              searchTerm.trim() === "" 
              // !searchedUser ||
              // !searchedUser.some(
              //   (u) =>
              //     u &&
              //     u.email &&
              //     u.email.toLowerCase() === searchTerm.toLowerCase()
              // )
                ? "not-allowed"
                : "pointer"
            }
          >
            <PlusFilledIcon
              color={
                searchTerm &&
                searchTerm.trim() !== ""
                // searchedUser &&
                // searchedUser.some(
                //   (u) =>
                //     u &&
                //     u.email &&
                //     u.email.toLowerCase() === searchTerm.toLowerCase()
                // )
                  ? "#4441C8"
                  : "#718096"
              }
            />
          </Box>
        </InputRightElement>
      </InputGroup>

      {dropdownVisible && (
        <Box
          position="absolute"  // ✅ absolute positioning
          top="100%"            // ✅ directly below input
          left="0"
          w="100%"
          zIndex="20"
          bg="white"
          boxShadow="md"
          borderRadius="md"
          maxHeight="200px"
          overflowY="auto"
        >
          {searchedUser.filter(
              (user) =>
                user &&
                user.email &&
                !selectedUsers.some((u) => u.id === user.id) // 👈 filter here
            ).map(
            (user) =>
              user &&
              user.email && (
                <Box
                  key={user.id}
                  onClick={() => {
                    if (
                      selectedUsers &&
                      !selectedUsers.some((u) => u.id === user.id)
                    ) {
                      setSelectedUsers((prevItems) => [...(prevItems || []), user]);
                    }
                    setSearchTerm("");
                    // setSearchedUsers([]);   // clear dropdown instead of filtering
                    setDropdownVisible(false); // also close the dropdown
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
