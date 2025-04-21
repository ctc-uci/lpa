import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

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
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Text,
    Textarea,
    VStack,
} from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/react"

import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { EllipsisIcon } from "../../assets/EllipsisIcon";
import { GoogleCalendarIcon } from "../../assets/GoogleCalendarIcon";
import { LocationPinIcon } from "../../assets/LocationPinIcon";
import { PlusIcon } from "../../assets/PlusIcon";
import { UserIcon } from "../../assets/UserIcon";
import { UpDownArrowIcon, PersonIcon, EmailIcon } from "../../assets/AdminSettingsIcons";


const GeneralSettings = ({ selectedComponent, setSelectedComponent }) => {
    const componentMap = {
        "general": <GeneralSettingsMenu setSelectedComponent={setSelectedComponent}></GeneralSettingsMenu>,
        "rooms": <RoomsSettings></RoomsSettings>,
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
                onClick={() => setSelectedComponent("rooms")}
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


const ConfirmationModal = ({ isOpen, onClose, title, body, onConfirm, primaryButtonBackgroundColor }) => (
    <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent gap="1.5rem">
            <ModalHeader>{title}</ModalHeader>
            <ModalBody>
                <Text>{body}</Text>
            </ModalBody>
            <ModalFooter>
                <Button onClick={onClose}>Cancel</Button>
                <Button marginLeft="0.75rem" backgroundColor={primaryButtonBackgroundColor} onClick={onConfirm}>
                    <Text color="white">Confirm</Text>
                </Button>
            </ModalFooter>
        </ModalContent>
    </Modal>
);


const RoomSettings = ({ room, isInitiallyEditing = false, onSave, onCancel }) => {
    const { backend } = useBackendContext();

    const [isEditing, setIsEditing] = useState(isInitiallyEditing);

    const isInitiallyInvalid = room.id ? false : true;
    const [isInvalidRoomName, setInvalidRoomName] = useState(isInitiallyInvalid);
    const [isInvalidNumericInput, setInvalidNumericInput] = useState(isInitiallyInvalid);
    const [isInvalidDescription, setInvalidDescription] = useState(isInitiallyInvalid);

    const [roomName, setRoomName] = useState(room.name);
    const [roomRate, setRoomRate] = useState(parseFloat(room.rate).toFixed(2));
    const [roomDescription, setRoomDescription] = useState(room.description);

    const [originalRoomName, setOriginalRoomName] = useState(room.name);

    const { isOpen: isCancelModalOpen, onOpen: onCancelModalOpen, onClose: onCancelModalClose } = useDisclosure()
    const { isOpen: isSaveModalOpen, onOpen: onSaveModalOpen, onClose: onSaveModalClose } = useDisclosure()

    const handleRoomNameEdit = (e) => {
        if (e.target.value === "") {
            setInvalidRoomName(true);
        }
        else {
            setInvalidRoomName(false);
        }
        setRoomName(e.target.value);
    }

    const handleNumericInputEdit = (value) => {
        if (value[0] === "e" || value === "") {
            setInvalidNumericInput(true);
        } else {
            setInvalidNumericInput(false);
        }
        setRoomRate(value);
    }

    const handleDescription = (e) => {
        if (e.target.value === "") {
            setInvalidDescription(true);
        } else {
            setInvalidDescription(false);
        }
        setRoomDescription(e.target.value);
    }

    const handleCancel = () => {
        if (!room.id) {
            onCancel();
        } else {
            setRoomName(originalRoomName);
            // setRoomName(room.name);
            setRoomRate(parseFloat(room.rate).toFixed(2));
            setRoomDescription(room.description);
            setInvalidRoomName(false);
            setInvalidNumericInput(false);
            setInvalidDescription(false);
            setIsEditing(false);
        }
        onCancelModalClose();
    }

    const handleSave = async () => {
        const updatedRoom = {
            name: roomName,
            rate: roomRate,
            description: roomDescription
        };

        if (room.id) {
            await backend.put("/rooms/" + room.id, updatedRoom);
            if (onSave) {
                onSave({ id: room.id, ...updatedRoom });
            }
            setOriginalRoomName(roomName);
        } else {
            const newRoomResponse = await backend.post("/rooms", updatedRoom);
            const savedRoom = { id: newRoomResponse.data[0].id, ...updatedRoom };
            onSave(savedRoom);
        }
        onSaveModalClose();
        setIsEditing(false);
    };

    useEffect(() => {
        setRoomName(room.name);
        setRoomRate(parseFloat(room.rate).toFixed(2));
        setRoomDescription(room.description);
    }, [room]);

    return (
        <VStack
            divider={<StackDivider style={{ margin: "0px" }} />}
            border="1px solid #E2E8F0"
            borderRadius="15px"
            padding="1.5rem"
            gap="1.5rem"
            alignItems="start"
        >
            <Flex width="100%" alignItems="center">
                <LocationPinIcon></LocationPinIcon>
                {
                    isEditing ? (
                        <Input
                            maxW="18rem"
                            marginLeft="0.75rem"
                            value={roomName}
                            onChange={handleRoomNameEdit}
                            placeholder="Add room name here..."
                            style={{ fontWeight: "bold" }}
                            isInvalid={isInvalidRoomName}
                        >
                        </Input>
                    ) : (
                        <Text marginLeft="0.75rem" as="b">
                            {roomName}
                        </Text>
                    )
                }
                {
                    isEditing ? (
                        <>
                            <Text marginLeft="3rem" as="b">
                                $
                            </Text>
                            <NumberInput
                                w="10rem"
                                marginLeft="0.25rem"
                                precision={2}
                                value={roomRate}
                                onChange={handleNumericInputEdit}
                                isInvalid={isInvalidNumericInput}
                            >
                                <NumberInputField fontWeight="bold" />
                            </NumberInput>
                        </>
                    ) : (
                        <Text marginLeft="3rem" as="b">${roomRate}</Text>
                    )
                }
                <Text marginLeft="0.25rem" as="b">
                    / hour
                </Text>
                {
                    isEditing ? (
                        <>
                            <Button marginLeft="auto" padding="0rem 1.25rem" onClick={() => { onCancelModalOpen() }}>
                                <Text color="#2D3748">
                                    Cancel
                                </Text>
                            </Button>
                            <Button
                                marginLeft="0.75rem"
                                padding="0rem 1.25rem"
                                backgroundColor="#4441C8"
                                onClick={() => {
                                    if (room.id) {
                                        onSaveModalOpen();
                                    } else {
                                        handleSave();
                                    }
                                }}
                                isDisabled={isInvalidRoomName || isInvalidNumericInput || isInvalidDescription}>
                                <Text color="#FFFFFF">
                                    Save
                                </Text>
                            </Button>
                        </>
                    ) : (
                        <Button marginLeft="auto" onClick={() => { setIsEditing(true) }}>
                            <EllipsisIcon></EllipsisIcon>
                        </Button>
                    )

                }
                <ConfirmationModal
                    isOpen={isCancelModalOpen}
                    onClose={onCancelModalClose}
                    title="Discard changes?"
                    // body={`Your edits to the ${roomName || "new"} room will not be saved.`}
                    body={`Your edits to the ${room.id ? originalRoomName : roomName || "new"} room will not be saved.`}
                    onConfirm={handleCancel}
                    primaryButtonBackgroundColor="#90080F"
                />
                {
                    room.id && (
                        <ConfirmationModal
                            isOpen={isSaveModalOpen}
                            onClose={onSaveModalClose}
                            title={`Save changes to ${roomName || "new"} room?`}
                            body="Editing this room will affect all upcoming sessions, programs, and invoices that have not been generated yet."
                            onConfirm={handleSave}
                            primaryButtonBackgroundColor="#4441C8"
                        />
                    )
                }
            </Flex>
            {
                isEditing ? (
                    <Textarea value={roomDescription} onChange={handleDescription} isInvalid={isInvalidDescription} />
                ) : (
                    <Text>{roomDescription}</Text>
                )
            }
        </VStack>
    );
};


const RoomsSettings = () => {
    const { backend } = useBackendContext();
    const [rooms, setRooms] = useState([]);
    const [newRoom, setNewRoom] = useState(null);

    useEffect(() => {
        const fetchRoomsData = async () => {
            try {
                const roomsResponse = await backend.get("/rooms");
                setRooms(roomsResponse.data);
            }
            catch (err) {
                console.log(err);
            }
        };
        fetchRoomsData();
    }, [backend]);

    const handleAddNewRoom = () => {
        setNewRoom({ name: "", rate: "0.00", description: "" });
    }

    const handleCancelNewRoom = () => {
        setNewRoom(null);
    }

    const handleSaveOrUpdateRoom = (updatedRoom) => {
        setRooms(prevRooms => {
            const roomIndex = prevRooms.findIndex(r => r.id === updatedRoom.id);
            if (roomIndex >= 0) {
                return prevRooms.map(r => r.id === updatedRoom.id ? updatedRoom : r);
            }
            return [...prevRooms, updatedRoom];
        });
        setNewRoom(null);
    };


    return (
        <Flex direction="column">
            <Flex alignItems="center">
                <Text as="b" fontSize="1.75rem">
                    Rooms
                </Text>
                <Button
                    backgroundColor="#4441C8"
                    marginLeft="auto"
                    gap="0.75rem"
                    padding="1.75rem"
                    onClick={() => { handleAddNewRoom() }}
                >
                    <PlusIcon></PlusIcon>
                    <Text as="b" fontSize="1.5rem" color="#FFF">
                        New Room
                    </Text>
                </Button>
            </Flex>
            <Flex
                direction="column"
                marginTop="2.5rem"
                gap="1.25rem"
                color="#718096"
            >
                {
                    rooms.map(room => (
                        <RoomSettings
                            key={room.id}
                            room={room}
                            onSave={handleSaveOrUpdateRoom}
                        />
                    ))
                }
                {
                    newRoom && (
                        <RoomSettings
                            room={newRoom}
                            isInitiallyEditing={true}
                            onSave={handleSaveOrUpdateRoom}
                            onCancel={handleCancelNewRoom} />
                    )
                }
            </Flex>
        </Flex >
    )
}

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
        editPerms: true
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

  const removeAdminAccess = async(userId) => {
    try {
      const userResponse = await backend.get(`/users/${userId}`);
      const userData = userResponse.data;

      await backend.put(`/users/${userId}`, {
        ...userData,
        editPerms: false
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
      <Flex direction="column" justifyContent="space-between" padding="0px 16px" align="left">
        <Heading size="sm"> Requests </Heading>
        <Flex borderRadius="15px" border="1px solid #E2E8F0" marginTop="40px">
          <TableContainer
            margin="20px"
            height="200px"
            overflowY="auto"
            width="full"
          >
            <Table width="full" layout="fixed">
              <Thead
                position="sticky"
                top="0"
                bg="white"
                zIndex="1"
              >
                <Tr>
                  <Th>
                    <Flex direction="row" justifyContent="space-between">
                      <Flex direction="row">
                        <Icon as={PersonIcon} />
                        <Text fontSize="14px" textTransform="none" marginLeft="8px" color="#718096"> Name </Text>
                      </Flex>
                      <Box>
                        <Icon as={UpDownArrowIcon} />
                      </Box>
                    </Flex>
                  </Th>
                  <Th>
                    <Flex direction="row" justifyContent="space-between">
                      <Flex direction="row">
                        <Icon as={EmailIcon} />
                        <Text fontSize="14px" textTransform="none" marginLeft="8px" color="#718096"> Email </Text>
                      </Flex>
                      <Box>
                        <Icon as={UpDownArrowIcon} />
                      </Box>
                    </Flex>
                  </Th>
                  <Th>
                    <Flex direction="row" justifyContent="right">
                      <Text fontSize="14px" textTransform="none" marginLeft="8px" color="#718096"> Status </Text>
                    </Flex>
                  </Th>
                </Tr>
              </Thead>
              <Tbody sx={{'& tr:last-child td': {borderBottom: 'none'}, height: '70px !important',
                minHeight: '70px !important'}}>
                {generalUsers && generalUsers.length > 0 ? (
                  generalUsers.map((gen) => (
                    <Tr key={gen.id}>
                      <Td width="35%">
                        {gen.firstName} {gen.lastName}
                      </Td>
                      <Td width="35%">
                        {gen.email}
                      </Td>
                      <Td width="30%">
                        <Flex direction="row" justifyContent="right" gap="10px">
                          <Button borderRadius="6px" onClick={() => declineUser(gen.id)}>
                            Decline
                          </Button>
                          <Button borderRadius="6px" background="#4441C8" color="#FFFFFF" onClick={() => approveUser(gen.id)}>
                            Approve
                          </Button>
                        </Flex>
                      </Td>
                    </Tr>
                  ))
                ) : "No admin requests"}
              </Tbody>
            </Table>
          </TableContainer>
        </Flex>
      </Flex>
      <Flex direction="column" justifyContent="space-between" padding="0px 16px" align="left" marginTop="40px">
        <Heading size="sm"> Accounts </Heading>
        <Flex borderRadius="15px" border="1px solid #E2E8F0" marginTop="40px">
          <TableContainer
            margin="20px"
            height="200px"
            overflowY="auto"
            width="full"
          >
            <Table width="full" layout="fixed">
              <Thead
                position="sticky"
                top="0"
                bg="white"
                zIndex="1"
              >
                <Tr>
                <Th>
                    <Flex direction="row" justifyContent="space-between">
                      <Flex direction="row">
                        <Icon as={PersonIcon} />
                        <Text fontSize="14px" textTransform="none" marginLeft="8px" color="#718096"> Name </Text>
                      </Flex>
                      <Box>
                        <Icon as={UpDownArrowIcon} />
                      </Box>
                    </Flex>
                  </Th>
                  <Th>
                    <Flex direction="row" justifyContent="space-between">
                      <Flex direction="row">
                        <Icon as={EmailIcon} />
                        <Text fontSize="14px" textTransform="none" marginLeft="8px" color="#718096"> Email </Text>
                      </Flex>
                      <Box>
                        <Icon as={UpDownArrowIcon} />
                      </Box>
                    </Flex>
                  </Th>
                  <Th>
                    <Flex direction="row" justifyContent="right">
                      <Text fontSize="14px" textTransform="none" marginLeft="8px" color="#718096"> Remove </Text>
                    </Flex>
                  </Th>
                </Tr>
              </Thead>
              <Tbody sx={{'& tr:last-child td': {borderBottom: 'none'}}}>
                {adminUsers && adminUsers.length > 0 ? (
                  adminUsers.map((admin) => (
                    <Tr key={admin.id} sx={{
                      height: '70px !important',
                      minHeight: '70px !important'
                    }}>
                      <Td width="35%">
                        {admin.firstName} {admin.lastName}
                      </Td>
                      <Td width="35%">
                        {admin.email}
                      </Td>
                      <Td width="30%">
                        <Flex justifyContent="right" marginRight="4px">
                          <Checkbox
                            isChecked={false}
                            onChange={() => removeAdminAccess(admin.id)}
                          />
                        </Flex>
                      </Td>
                    </Tr>
                  ))
                ) : "No admin"}
              </Tbody>
            </Table>
          </TableContainer>
        </Flex>
      </Flex>
    </Flex>
  )
}

export { GeneralSettings, AdminSettings };
