import { useEffect, useState } from "react";

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

const GeneralSettings = ({ selectedComponent, setSelectedComponent }) => {
  const componentMap = {
    general: (
      <GeneralSettingsMenu
        setSelectedComponent={setSelectedComponent}
      ></GeneralSettingsMenu>
    ),
    // "rooms": <RoomsSettings/>,
    calendar: <h1> Calendar </h1>,
  };

  return <>{componentMap[selectedComponent]}</>;
};

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
        <Text
          fontSize="14px"
          fontFamily={"Inter"}
          fontWeight={"500"}
          fontStyle={"normal"}
          lineHeight={"normal"}
          letterSpacing={"0.07px"}
        >
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
        <Text
          fontSize="14px"
          fontFamily={"Inter"}
          fontWeight={"500"}
          fontStyle={"normal"}
          lineHeight={"normal"}
          letterSpacing={"0.07px"}
        >
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
        <Text
          fontSize="14px"
          fontFamily={"Inter"}
          fontWeight={"500"}
          fontStyle={"normal"}
          lineHeight={"normal"}
          letterSpacing={"0.07px"}
        >
          Google Calendar
        </Text>
      </Button>
    </VStack>
  );
};

const AdminSettings = () => {
  const { backend } = useBackendContext();
  const [generalUsers, setGeneralUsers] = useState(null);
  const [adminUsers, setAdminUsers] = useState(null);

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

  useEffect(() => {
    getAllUsers();
  }, [generalUsers, adminUsers]);

  return (
    <Flex direction="column">
      <Flex
        direction="column"
        justifyContent="space-between"
        padding="0px 16px"
        align="left"
      >
        <Heading
          fontSize="20px"
          fontFamily={"Inter"}
          fontWeight={"700"}
          fontStyle={"normal"}
          lineHeight={"normal"}
          letterSpacing={"0.07px"}
        >
          {" "}
          Requests{" "}
        </Heading>
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
                      <Box>
                        <Icon as={UpDownArrowIcon} />
                      </Box>
                    </Flex>
                  </Th>
                  <Th>
                    <Flex
                      direction="row"
                      justifyContent="space-between"
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
                      <Box>
                        <Icon as={UpDownArrowIcon} />
                      </Box>
                    </Flex>
                  </Th>
                  <Th>
                    <Flex
                      direction="row"
                      justifyContent="right"
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
                }}
              >
                {generalUsers && generalUsers.length > 0
                  ? generalUsers.map((gen) => (
                      <Tr key={gen.id}>
                        <Td width="35%">
                          {gen.firstName} {gen.lastName}
                        </Td>
                        <Td width="35%">{gen.email}</Td>
                        <Td width="30%">
                          <Flex
                            direction="row"
                            justifyContent="right"
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
                  : "No admin requests"}
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
        <Heading
          fontSize="20px"
          fontFamily={"Inter"}
          fontWeight={"700"}
          fontStyle={"normal"}
          lineHeight={"normal"}
          letterSpacing={"0.07px"}
        >
          {" "}
          Accounts{" "}
        </Heading>
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
                      <Box>
                        <Icon as={UpDownArrowIcon} />
                      </Box>
                    </Flex>
                  </Th>
                  <Th>
                    <Flex
                      direction="row"
                      justifyContent="space-between"
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
                      <Box>
                        <Icon as={UpDownArrowIcon} />
                      </Box>
                    </Flex>
                  </Th>
                  <Th>
                    <Flex
                      direction="row"
                      justifyContent="right"
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
              <Tbody sx={{ "& tr:last-child td": { borderBottom: "none" } }}>
                {adminUsers && adminUsers.length > 0
                  ? adminUsers.map((admin) => (
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
                            justifyContent="right"
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
                  : "No admin"}
              </Tbody>
            </Table>
          </TableContainer>
        </Flex>
      </Flex>
    </Flex>
  );
};

export { GeneralSettings, AdminSettings };
