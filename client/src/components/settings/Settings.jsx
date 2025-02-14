import { useEffect, useState } from "react";

import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Stack
} from "@chakra-ui/react";

import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import Navbar from "../navbar/Navbar";

export const Settings = () => {
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [newRate, setNewRate] = useState("");
  const { backend } = useBackendContext();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await backend.get("/users");
        const pendingUsers = response.data.filter(
          (user) => user.editPerms === false
        );
        setUsers(pendingUsers);
        console.log(pendingUsers);
      } catch (error) {
        console.log("Error fetching users:", error);
      }
    };

    const fetchRoomsData = async () => {
      try {
        const response = await backend.get("/rooms");
        setRooms(response.data);
        console.log(response.data);
      } catch (error) {
        console.log("Error fetching rooms: ", error);
      }
    };
    fetchUserData();
    fetchRoomsData();
  }, [backend]);

  // Approve users function: set edit_perms = True and update the rendering of the table
  const handleApprove = async (user) => {
    try {
      await backend.put(`/users/${user.id}`, {
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        editPerms: true,
      });
      // Remove approved user from the list
      setUsers(users.filter((u) => u.id !== user.id));
    } catch (error) {
      console.log("Error approving user:", error);
    }
  };

  // Remove a user and delete from DB and Firebase
  const handleRemove = async (user) => {
    try {
      //   await backend.delete(`/users/${user.id}`);
      await backend.delete(`/users/${user.firebaseUid}`);
      setUsers(users.filter((u) => u.id !== user.id));
    } catch (error) {
      console.log("Error removing user:", error);
    }
  };

  // Open the edit panel for a room
  const handleEditRoom = (room) => {
    setSelectedRoom(room);
    setNewRate(room.rate);
  };

  // Save the updated room rate
  const handleSaveRate = async () => {
    try {
      await backend.put(`/rooms/${selectedRoom.id}`, {
        ...selectedRoom,
        rate: newRate,
      });
      setRooms(
        rooms.map((room) =>
          room.id === selectedRoom.id ? { ...room, rate: newRate } : room
        )
      );
      setSelectedRoom(null);
      setNewRate("");
    } catch (error) {
      console.log("Error updating room rate:", error);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setSelectedRoom(null);
    setNewRate("");
  };

  return (
    <Navbar>
      <TableContainer mb="40px">
        <Table variant="striped">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Created</Th>
              <Th>Approve</Th>
              <Th>Deny</Th>
              <Th>Make Admin</Th>
            </Tr>
          </Thead>
          <Tbody>
            {users.map((user) => (
              <Tr key={user.id}>
                <Td>{`${user.firstName} ${user.lastName}`}</Td>
                <Td>January 20, 2025</Td>
                <Td>
                  <Button
                    onClick={() => handleApprove(user)}
                    colorScheme="green"
                  >
                    Approve
                  </Button>
                </Td>
                <Td>
                  <Button
                    onClick={() => handleRemove(user)}
                    colorScheme="red"
                  >
                    Deny
                  </Button>
                </Td>
                <Td>
                  <Button
                    colorScheme="blackAlpha"
                    variant="outline"
                  >
                    Admin
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      <TableContainer mb="40px">
        <Table variant="striped">
          <Thead>
            <Tr>
              <Th>Room</Th>
              <Th>Rate</Th>
              <Th>Edit</Th>
            </Tr>
          </Thead>
          <Tbody>
            {rooms.map((room) => (
              <Tr key={room.id}>
                <Td>{room.name}</Td>
                <Td>{room.rate}</Td>
                <Td>
                  <Popover>
                    {({ onClose }) => (
                      <>
                        <PopoverTrigger>
                          <Button
                            onClick={() => {
                              setSelectedRoom(room);
                              setNewRate(room.rate);
                            }}
                          >
                            Edit
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent>
                          <PopoverHeader>Edit Room Rate</PopoverHeader>
                          <PopoverBody>
                            <Stack>
                            <Text as="b">Room:</Text> 
                            <Text>{room.name}</Text>
                            <Input
                              mt="2"
                              type="number"
                              value={newRate}
                              onChange={(e) => setNewRate(e.target.value)}
                              />
                              </Stack>
                          </PopoverBody>
                          <PopoverFooter
                            display="flex"
                            justifyContent="flex-end"
                          >
                            <Button
                              colorScheme="green"
                              mr="3"
                              onClick={() => {
                                handleSaveRate();
                                onClose();
                              }}
                            >
                              Save
                            </Button>
                            <Button
                              colorScheme="red"
                              onClick={() => {
                                handleCancelEdit();
                                onClose();
                              }}
                            >
                              Cancel
                            </Button>
                          </PopoverFooter>
                        </PopoverContent>
                      </>
                    )}
                  </Popover>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      {selectedRoom && (
        <Box
          p="20px"
          border="1px solid #ccc"
          borderRadius="md"
          maxW="300px"
          mb="40px"
        >
          <Heading
            as="h3"
            size="md"
            mb="4"
          >
            Edit Room Rate
          </Heading>
          <Box mb="3">
            <Text as="b">Room:</Text> {selectedRoom.name}
          </Box>
          <Box mb="3">
            <Input
              type="number"
              value={newRate}
              onChange={(e) => setNewRate(e.target.value)}
            />
          </Box>
          <Flex gap="10px">
            <Button
              colorScheme="green"
              onClick={handleSaveRate}
            >
              Save
            </Button>
            <Button
              colorScheme="red"
              onClick={handleCancelEdit}
            >
              Cancel
            </Button>
          </Flex>
        </Box>
      )}
    </Navbar>
  );
};
