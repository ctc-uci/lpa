import { useEffect, useState, useCallback } from "react";

import {
  Box,
  Button,
  Checkbox,
  Flex,
  Heading,
  Icon,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberInput,
  NumberInputField,
  StackDivider,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";

import { useNavigate } from "react-router-dom";
import {
  EmailIcon,
  PersonIcon,
  UpDownArrowIcon,
} from "../../assets/AdminSettingsIcons";
import { EllipsisIcon } from "../../assets/EllipsisIcon";
import { GoogleCalendarIcon } from "../../assets/GoogleCalendarIcon";
import { LocationPinIcon } from "../../assets/LocationPinIcon";
import { PlusIcon } from "../../assets/PlusIcon";
import { UserIcon } from "../../assets/UserIcon";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { SearchBar } from "../searchBar/SearchBar";
import { archiveMagnifyingGlass } from "../../assets/icons/ProgramIcons";
import SortingMenu from "../sorting/SortingMenu";

// Name sorting component
const NameSortingMenu = ({ onSortChange, currentOrder }) => {
  const nameSortOptions = [
    { label: "A ‑ Z", value: "name", order: "asc" },
    { label: "Z - A", value: "name", order: "desc" },
  ];

  return (
    <SortingMenu 
      options={nameSortOptions}
      onSortChange={(value, order) => {
        // Only change if different from current state
        if (!(value === "name" && order === currentOrder)) {
          onSortChange(value, order);
        }
      }}
    />
  );
};

// Email sorting component
const EmailSortingMenu = ({ onSortChange, currentOrder }) => {
  const emailSortOptions = [
    { label: "A ‑ Z", value: "email", order: "asc" },
    { label: "Z - A", value: "email", order: "desc" },
  ];

  return (
    <SortingMenu 
      options={emailSortOptions}
      onSortChange={(value, order) => {
        // Only change if different from current state
        if (!(value === "email" && order === currentOrder)) {
          onSortChange(value, order);
        }
      }}
    />
  );
};

const GeneralSettings = ({ selectedComponent, setSelectedComponent }) => {
    const componentMap = {
        "general": <GeneralSettingsMenu setSelectedComponent={setSelectedComponent}></GeneralSettingsMenu>,
        // "rooms": <RoomsSettings/>,
        "calendar": <h1> Calendar </h1>
    }

    return (
        <>
            {componentMap[selectedComponent]}
        </>
    )
}


const GeneralSettingsMenu = ({ setSelectedComponent }) => {
    const navigate = useNavigate();
    return (
        <VStack
            divider={<StackDivider style={{ margin: "0px" }} />}
            border="1px solid #E2E8F0"
            borderRadius="15px"
        >
            <Button
                width="100%"
                padding="3rem"
                backgroundColor="transparent"
                justifyContent="start"
                gap="0.75rem"
                onClick={() => navigate("/settings/myaccount")}
            >
                <UserIcon></UserIcon>
                <Text>
                    My Account
                </Text>
            </Button>
            <Button
                width="100%"
                padding="3rem"
                backgroundColor="transparent"
                justifyContent="start"
                gap="0.75rem"
                onClick={() => navigate("/settings/rooms")}
            >
                <LocationPinIcon></LocationPinIcon>
                <Text>
                    Rooms
                </Text>
            </Button>
            <Button
                width="100%"
                padding="3rem"
                backgroundColor="transparent"
                justifyContent="start"
                gap="0.75rem"
                onClick={() => setSelectedComponent("calendar")}
            >
                <GoogleCalendarIcon></GoogleCalendarIcon>
                <Text>
                    Google Calendar
                </Text>
            </Button>
        </VStack>
    );
}




const AdminSettings = () => {
  const { backend } = useBackendContext();
  const [generalUsers, setGeneralUsers] = useState(null);
  const [adminUsers, setAdminUsers] = useState(null);
  const [filteredGeneralUsers, setFilteredGeneralUsers] = useState([]);
  const [filteredAdminUsers, setFilteredAdminUsers] = useState([]);
  const [requestSearchQuery, setRequestSearchQuery] = useState("");
  const [accountSearchQuery, setAccountSearchQuery] = useState("");
  const [requestSortKey, setRequestSortKey] = useState("name");
  const [requestSortOrder, setRequestSortOrder] = useState("asc");
  const [accountSortKey, setAccountSortKey] = useState("name");
  const [accountSortOrder, setAccountSortOrder] = useState("asc");

  const getAllUsers = async () => {
    try {
      const general = [];
      const admin = [];

      const userResponse = await backend.get("/users");
      const userData = userResponse.data;

      for (const user of userData) {
        if (user.editPerms) {
          admin.push(user);
        } else {
          general.push(user);
        }
      }

      setGeneralUsers(general);
      setAdminUsers(admin);
      setFilteredGeneralUsers(general);
      setFilteredAdminUsers(admin);
    } catch (error) {
      console.log("Error in getAllUsers: ", error);
    }
  };

  const approveUser = async (userId) => {
    try {
      await backend.put(`/users/${userId}`, {
        editPerms: true,
      });
      await getAllUsers();
    } catch (error) {
      console.log("Error in approveUser", error);
    }
  };

  const declineUser = async (userId) => {
    try {
      await backend.delete(`/users/id/${userId}`);
      await getAllUsers();
    } catch (error) {
      console.log("Error in declineUser", error);
    }
  };

  const removeAdminAccess = async (userId) => {
    try {
      const userResponse = await backend.get(`/users/${userId}`);
      const userData = userResponse.data;

      await backend.put(`/users/${userId}`, {
        ...userData,
        editPerms: false,
      });

      await getAllUsers();
    } catch (error) {
      console.error("Error in removeAdminAccess:", error);
    }
  };

  const handleRequestSortChange = useCallback((key, order) => {
    setRequestSortKey(key);
    setRequestSortOrder(order);
  }, []);

  const handleAccountSortChange = useCallback((key, order) => {
    setAccountSortKey(key);
    setAccountSortOrder(order);
  }, []);

  const handleRequestSearch = useCallback((query) => {
    setRequestSearchQuery(query);
    if (!generalUsers) return;
    
    if (!query) {
      setFilteredGeneralUsers(generalUsers);
      return;
    }
    
    const lowerCaseQuery = query.toLowerCase();
    const filtered = generalUsers.filter(user => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      return fullName.includes(lowerCaseQuery);
    });
    
    setFilteredGeneralUsers(filtered);
  }, [generalUsers]);

  const handleAccountSearch = useCallback((query) => {
    setAccountSearchQuery(query);
    if (!adminUsers) return;
    
    if (!query) {
      setFilteredAdminUsers(adminUsers);
      return;
    }
    
    const lowerCaseQuery = query.toLowerCase();
    const filtered = adminUsers.filter(user => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      return fullName.includes(lowerCaseQuery);
    });
    
    setFilteredAdminUsers(filtered);
  }, [adminUsers]);

  // Sort filtered users based on sort key and order
  const sortedGeneralUsers = useCallback(() => {
    if (!filteredGeneralUsers) return [];
    
    const sorted = [...filteredGeneralUsers];
    if (requestSortKey === "name") {
      sorted.sort((a, b) => {
        const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
        const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
        return requestSortOrder === "asc" 
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      });
    } else if (requestSortKey === "email") {
      sorted.sort((a, b) => {
        return requestSortOrder === "asc"
          ? a.email.localeCompare(b.email)
          : b.email.localeCompare(a.email);
      });
    }
    return sorted;
  }, [filteredGeneralUsers, requestSortKey, requestSortOrder]);

  const sortedAdminUsers = useCallback(() => {
    if (!filteredAdminUsers) return [];
    
    const sorted = [...filteredAdminUsers];
    if (accountSortKey === "name") {
      sorted.sort((a, b) => {
        const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
        const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
        return accountSortOrder === "asc" 
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      });
    } else if (accountSortKey === "email") {
      sorted.sort((a, b) => {
        return accountSortOrder === "asc"
          ? a.email.localeCompare(b.email)
          : b.email.localeCompare(a.email);
      });
    }
    return sorted;
  }, [filteredAdminUsers, accountSortKey, accountSortOrder]);

  useEffect(() => {
    getAllUsers();
  }, []);

  useEffect(() => {
    if (generalUsers) {
      setFilteredGeneralUsers(generalUsers);
    }
    if (adminUsers) {
      setFilteredAdminUsers(adminUsers);
    }
  }, [generalUsers, adminUsers]);

  return (
    <Flex direction="column">
      <Flex
        direction="column"
        justifyContent="space-between"
        padding="0px 16px"
        align="left"
      >
        <Flex 
          direction="row" 
          justifyContent="space-between" 
          alignItems="center"
        >
          <Heading size="sm"> Requests </Heading>
          <Box width="311px">
            <SearchBar 
              handleSearch={handleRequestSearch} 
              searchQuery={requestSearchQuery} 
            />
          </Box>
        </Flex>
        <Flex
          borderRadius="15px"
          border="1px solid #E2E8F0"
          marginTop="40px"
        >
          <TableContainer
            margin="20px"
            height="200px"
            overflowY="auto"
            width="full"
          >
            <Table
              width="full"
              layout="fixed"
            >
              <Thead
                position="sticky"
                top="0"
                bg="white"
                zIndex="1"
              >
                <Tr>
                  <Th>
                    <Flex
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Flex direction="row">
                        <Icon as={PersonIcon} />
                        <Text
                          fontSize="14px"
                          textTransform="none"
                          marginLeft="8px"
                          color="#718096"
                        >
                          {" "}
                          Name{" "}
                        </Text>
                      </Flex>
                      <NameSortingMenu 
                        onSortChange={handleRequestSortChange} 
                        currentOrder={requestSortOrder}
                      />
                    </Flex>
                  </Th>
                  <Th>
                    <Flex
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Flex direction="row">
                        <Icon as={EmailIcon} />
                        <Text
                          fontSize="14px"
                          textTransform="none"
                          marginLeft="8px"
                          color="#718096"
                        >
                          {" "}
                          Email{" "}
                        </Text>
                      </Flex>
                      <EmailSortingMenu 
                        onSortChange={handleRequestSortChange}
                        currentOrder={requestSortOrder}
                      />
                    </Flex>
                  </Th>
                  <Th>
                    <Flex
                      direction="row"
                      justifyContent="flex-end"
                    >
                      <Text
                        fontSize="14px"
                        textTransform="none"
                        marginLeft="8px"
                        color="#718096"
                      >
                        {" "}
                        Status{" "}
                      </Text>
                    </Flex>
                  </Th>
                </Tr>
              </Thead>
              <Tbody
                sx={{
                  "& tr:last-child td": { borderBottom: "none" },
                  height: "70px !important",
                  minHeight: "70px !important",
                  "& td": {
                    color: "var(--Secondary-8, #2D3748)",
                    fontFamily: "Inter",
                    fontSize: "14px",
                    fontStyle: "normal",
                    fontWeight: "400",
                    lineHeight: "normal",
                    letterSpacing: "0.07px"
                  }
                }}
              >
                {filteredGeneralUsers && filteredGeneralUsers.length > 0
                  ? sortedGeneralUsers().map((gen) => (
                      <Tr key={gen.id}>
                        <Td width="35%">
                          {gen.firstName} {gen.lastName}
                        </Td>
                        <Td width="35%">{gen.email}</Td>
                        <Td width="30%">
                          <Flex
                            direction="row"
                            justifyContent="flex-end"
                            gap="10px"
                          >
                            <Button
                              borderRadius="6px"
                              onClick={() => declineUser(gen.id)}
                            >
                              Decline
                            </Button>
                            <Button
                              borderRadius="6px"
                              _hover={{ backgroundColor: "#312E8A" }}
                              background="#4441C8"
                              color="#FFFFFF"
                              onClick={() => approveUser(gen.id)}
                            >
                              Approve
                            </Button>
                          </Flex>
                        </Td>
                      </Tr>
                    ))
                  : <Tr>
                      <Td colSpan={3} textAlign="center">
                        <Text
                          color="var(--Secondary-6, #718096)"
                          fontFamily="Inter"
                          fontSize="14px"
                          lineHeight="1.5"
                          letterSpacing="-0.084px"
                        >
                          No requests to display.
                        </Text>
                      </Td>
                    </Tr>}
              </Tbody>
            </Table>
          </TableContainer>
        </Flex>
      </Flex>
      <Flex
        direction="column"
        justifyContent="space-between"
        padding="0px 16px"
        align="left"
        marginTop="40px"
      >
        <Flex 
          direction="row" 
          justifyContent="space-between"
          alignItems="center"
        >
          <Heading size="sm"> Accounts </Heading>
          <Box width="311px">
            <SearchBar 
              handleSearch={handleAccountSearch} 
              searchQuery={accountSearchQuery} 
            />
          </Box>
        </Flex>
        <Flex
          borderRadius="15px"
          border="1px solid #E2E8F0"
          marginTop="40px"
        >
          <TableContainer
            margin="20px"
            height="200px"
            overflowY="auto"
            width="full"
          >
            <Table
              width="full"
              layout="fixed"
            >
              <Thead
                position="sticky"
                top="0"
                bg="white"
                zIndex="1"
              >
                <Tr>
                  <Th>
                    <Flex
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Flex direction="row">
                        <Icon as={PersonIcon} />
                        <Text
                          fontSize="14px"
                          textTransform="none"
                          marginLeft="8px"
                          color="#718096"
                        >
                          {" "}
                          Name{" "}
                        </Text>
                      </Flex>
                      <NameSortingMenu 
                        onSortChange={handleAccountSortChange}
                        currentOrder={accountSortOrder}
                      />
                    </Flex>
                  </Th>
                  <Th>
                    <Flex
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Flex direction="row">
                        <Icon as={EmailIcon} />
                        <Text
                          fontSize="14px"
                          textTransform="none"
                          marginLeft="8px"
                          color="#718096"
                        >
                          {" "}
                          Email{" "}
                        </Text>
                      </Flex>
                      <EmailSortingMenu 
                        onSortChange={handleAccountSortChange}
                        currentOrder={accountSortOrder}
                      />
                    </Flex>
                  </Th>
                  <Th>
                    <Flex
                      direction="row"
                      justifyContent="flex-end"
                    >
                      <Text
                        fontSize="14px"
                        textTransform="none"
                        marginLeft="8px"
                        color="#718096"
                      >
                        {" "}
                        Remove{" "}
                      </Text>
                    </Flex>
                  </Th>
                </Tr>
              </Thead>
              <Tbody
                sx={{
                  "& tr:last-child td": { borderBottom: "none" },
                  "& td": {
                    color: "var(--Secondary-8, #2D3748)",
                    fontFamily: "Inter",
                    fontSize: "14px",
                    fontStyle: "normal",
                    fontWeight: "400",
                    lineHeight: "normal",
                    letterSpacing: "0.07px"
                  }
                }}
              >
                {filteredAdminUsers && filteredAdminUsers.length > 0
                  ? sortedAdminUsers().map((admin) => (
                      <Tr
                        key={admin.id}
                        sx={{
                          height: "70px !important",
                          minHeight: "70px !important",
                        }}
                      >
                        <Td width="35%">
                          {admin.firstName} {admin.lastName}
                        </Td>
                        <Td width="35%">{admin.email}</Td>
                        <Td width="30%">
                          <Flex
                            justifyContent="flex-end"
                            marginRight="4px"
                          >
                            <Checkbox
                              isChecked={false}
                              onChange={() => removeAdminAccess(admin.id)}
                            />
                          </Flex>
                        </Td>
                      </Tr>
                    ))
                  : <Tr>
                      <Td colSpan={3} textAlign="center">
                        <Text
                          color="var(--Secondary-6, #718096)"
                          fontFamily="Inter"
                          fontSize="14px"
                          lineHeight="1.5"
                          letterSpacing="-0.084px"
                        >
                          No account data to display.
                        </Text>
                      </Td>
                    </Tr>}
              </Tbody>
            </Table>
          </TableContainer>
        </Flex>
      </Flex>
    </Flex>
  );
};

export { GeneralSettings, AdminSettings };
