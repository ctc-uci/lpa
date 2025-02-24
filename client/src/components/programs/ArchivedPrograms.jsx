import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import Navbar from "../navbar/Navbar";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Card,
  CardBody,
  Container,
  Flex,
  FormControl,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Stack,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import {
  filterButton,
  filterDateCalendar,
  sessionsDownArrow,
  sessionsEllipsis,
  sessionsFilterClock,
  sessionsFilterMapPin,
  sessionsMapPin,
  sessionsUpArrow,
  archiveBox,
  archiveCalendar,
  archiveClock,
  archiveMapPin,
  archivePerson,
  archiveMagnifyingGlass,
  duplicateIcon,
  reactivateIcon,
  deleteIcon
} from "../../assets/icons/ProgramIcons";

import {
  Info,
} from "lucide-react";

export const ArchivedPrograms = () => {
  const { backend } = useBackendContext();
  const [program, setPrograms] = useState([]);
  const [archived, setArchived] = useState([]);
  // const [sessions, setSessions] = useState(null);
  const [uniqueRooms, setUniqueRooms] = useState(null);
  const [roomNames, setRoomNames] = useState(null);
  const [archivedSessions, setArchivedProgramSessions]= useState([]);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [timeRange, setTimeRange] = useState({ start: "", end: "" });
  const [selectedRoom, setSelectedRoom] = useState("All");
  const [searchQuery, setSearchQuery] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [programToDelete, setProgramToDelete] = useState(null);

  const getArchivedPrograms = async () => {
    try {
      const programResponse = await backend.get(`events`);
      const programData = programResponse.data;

      setPrograms(programData);

      const archivedSessions = programData.filter(program => program.archived === true);

      setArchived(archivedSessions);

      await getArchivedProgramSessions(archivedSessions);
    } catch (error) {
      console.log("From getArchivedSessions: ", error);
    }
  }

  const getArchivedProgramSessions = async (archivedPrograms) => {
    try {
      const info = [];
      const allRoomIds = new Set();

      for (const program of archivedPrograms) {
        let mostRecentSession = {
          date: "N/A",
          startTime: "N/A",
          endTime: "N/A",
          recentSession: "N/A"
        };
        let sessions = [];
        const thisAssignments = {
          instructors: [],
          payees: []
        };
        let roomName = "N/A";

        try {
          const sessionsResponse = await backend.get(`bookings/byEvent/${program.id}`);
          sessions = sessionsResponse.data;

          if (sessions.length > 0) {
            // get unique roomIds
            sessions.forEach(session => allRoomIds.add(session.roomId));

            // get most recent session
            mostRecentSession = sessions.reduce((latest, current) => {
              return new Date(current.date) > new Date(latest.date) ? current : latest;
            }, sessions[0]);

            // get room name
            const roomsResponse = await backend.get(`rooms/${mostRecentSession.roomId}`);
            const room = roomsResponse.data;
            roomName = room[0]?.name || "N/A";

            // get artists and payees
            const assignmentsResponse = await backend.get(`/assignments/event/${program.id}`);
            for (const assignment of assignmentsResponse.data) {
              if (assignment.role === "instructor") {
                thisAssignments.instructors.push(assignment);
              } else if (assignment.role === "payee") {
                thisAssignments.payees.push(assignment);
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching data for program ${program.id}:`, error);
        }

        const thisSession = {
          programId: program.id,
          programName: program.name,
          sessionDate: mostRecentSession.date,
          sessionStart: mostRecentSession.startTime,
          sessionEnd: mostRecentSession.endTime,
          room: roomName,
          recentSession: mostRecentSession,
          instructors: thisAssignments.instructors,
          payees: thisAssignments.payees
        };
        console.log("THIS SESSION", thisSession);
        info.push(thisSession);
      }

      // Store this data in state
      setArchivedProgramSessions(info);
      setUniqueRooms([...allRoomIds]);
      console.log("here");
      console.log(archivedSessions);
    } catch (error) {
      console.log("From getArchivedProgramSessions: ", error);
    }
  };

  const getRoomNames = async (roomIds) => {
    try {
      const roomMap = new Map();
      for (const roomId of roomIds) {
        const roomResponse = await backend.get(`rooms/${roomId}`);
        const roomData = roomResponse.data;
        roomMap.set(roomId, roomData[0].name);
      }
      setRoomNames(roomMap);
    } catch (error) {
      console.log("From getRoomNames: ", error);
    }
  };

  useEffect(() => {
    getArchivedPrograms();
  }, []);

  useEffect(() => {
    // Runs whenever searchQuery, dateRange, or timeRange changes
  }, [searchQuery, dateRange, timeRange]);

  useEffect(() => {
    if (uniqueRooms) {
      getRoomNames(uniqueRooms);
    }
  }, [uniqueRooms]);

  const formatDate = (isoString) => {
    const date = new Date(isoString);

    // Format the date to "Mon 01/17/2025"
    const options = {
      weekday: "short", // "Mon"
      year: "numeric", // "2025"
      month: "2-digit", // "01"
      day: "2-digit",
    };
    let formattedDate = new Intl.DateTimeFormat("en-US", options).format(date);
    formattedDate = formattedDate.replace(",", ".");
    return formattedDate;
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":").map(Number);

    // Determine AM or PM suffix
    const period = hours >= 12 ? "p.m." : "a.m.";

    // Convert to 12-hour format
    const formattedHours = hours % 12 || 12; // Convert 0 to 12 for midnight

    // Return formatted time
    return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  const handleDateChange = (field, value) => {
    setDateRange((prev) => ({ ...prev, [field]: value }));
  };

  const handleTimeChange = (field, value) => {
    setTimeRange((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = (query) => {
    // Sets query for filterSessions
    setSearchQuery(query);
  };

  const filterSessions = () => {
    return archivedSessions.filter((program) => {
      const sessionDate = new Date(program.sessionDate);
      const sessionStartTime = program.sessionStart;
      const sessionEndTime = program.sessionEnd;

      const isDateInRange =
        (!dateRange.start || new Date(dateRange.start) <= sessionDate) &&
        (!dateRange.end || sessionDate <= new Date(dateRange.end));
      const isTimeInRange =
        (!timeRange.start || timeRange.start <= sessionStartTime) &&
        (!timeRange.end || sessionEndTime <= timeRange.end);
      const searchLower = searchQuery.toLowerCase();
      const isRoomMatch =
        selectedRoom === "All" || program.room === selectedRoom;
      const matchesSearch =
        program.programName.toLowerCase().includes(searchLower) ||
        program.room.toLowerCase().includes(searchLower) ||
        (program.instructors && program.instructors.some(instructor =>
          instructor.clientName.toLowerCase().includes(searchLower)
        )) ||
        (program.payees && program.payees.some(payee =>
          payee.clientName.toLowerCase().includes(searchLower)
        )) ||
        program.sessionDate.includes(searchQuery) ||
        program.sessionStart.includes(searchQuery) ||
        program.sessionEnd.includes(searchQuery);
      return isDateInRange && isTimeInRange && isRoomMatch && matchesSearch;
    });
  };

  const deleteArchivedProgram = async (programId) => {
    try {
      await backend.delete(`/events/${programId}`);
    } catch (error) {
      console.log("Couldn't delete", error);
    }
  };

  const reactivateArchivedProgram = async (programId) => {
    try {
      await backend.put(`/events/${programId}`, {
        archived: false
    });
    } catch (error) {
      console.log("Couldn't reactivate", error);
    }
  };

  const duplicateArchivedProgram = async (programId) => {
    try {
      // Get original program data
      const originalEvent = await backend.get(`/events/${programId}`);
      const originalSessions = await backend.get(`/bookings/byEvent/${programId}`);
      const originalAssignments = await backend.get(`/assignments/event/${programId}`);

      // Create a new program
      const newEventData = { ...originalEvent.data[0] };
      delete newEventData.id; // Remove the original ID
      newEventData.name = `${originalEvent.data[0].name}`;
      newEventData.description = `${originalEvent.data[0].description}`;
      newEventData.archived = false; // Ensure the new event is not archived
      const newEvent = await backend.post('/events', newEventData);
      console.log("New event created:", newEvent.data);
      console.log(newEventData);

      // Create copies of sessions for the new program
      for (const session of originalSessions.data) {
        const newSessionData = {
          event_id: newEvent.data.id,
          room_id: session.roomId,
          start_time: session.startTime,
          end_time: session.endTime,
          date: session.date,
          archived: false
        };
        const newBooking = await backend.post('/bookings', newSessionData);
        console.log("New booking", newSessionData);
        console.log(newBooking);
      }

      // Create copies of assignments for the new program
      for (const assignment of originalAssignments.data) {
        const newAssignmentData = {
          event_id: newEvent.data.id, // Set the new event ID
          client_id: assignment.clientId, // Ensure clientId is a number
          role: assignment.role
        };
        const newAssignment = await backend.post('/assignments', newAssignmentData);
      }

      // Return the new program data
      return newEvent.data;
    } catch (error) {
      console.log("Couldn't duplicate event", error);
    }
  };

  const handleDuplicate = async (programId) => {
    try {
      await duplicateArchivedProgram(programId);
    } catch (error) {
      console.log("Couldn't duplicate program", error);
    }
  };

  const handleReactivate = async (programId) => {
    try {
      await reactivateArchivedProgram(programId);
      // Update local state
      setArchivedProgramSessions(prevSessions =>
        prevSessions.filter(session => session.programId !== programId)
      );
    } catch (error) {
      console.log("Couldn't reactivate program", error);
    }
  };

  const handleConfirmDelete = (programId) => {
    onOpen();
    setProgramToDelete(programId);
  };

  const handleDelete = async (programId) => {
    try {
      await deleteArchivedProgram(programId);

      // Update local state
      setArchivedProgramSessions(prevSessions =>
        prevSessions.filter(session => session.programId !== programId)
      );
      onClose();
    } catch (error) {
      console.log("Couldn't delete program", error);
    }
  };

  return (
    <Navbar>
      <Box margin="40px">
        <Card shadow="md" border="1px" borderColor="gray.300" borderRadius="15px">
          <CardBody margin="6px">
            <Flex direction="column" justify="space-between">
              <Flex align="center" mb="15px">
                <Icon as={archiveBox} />
                <Text fontSize="25px" fontWeight="semibold" color="#474849" ml="8px">
                  Archived
                </Text>
              </Flex>
              <Box display="flex" justify-content="space-between" align-items="flex-start" align-self="stretch" marginTop="5px" marginBottom="15px">
                <Flex marginRight="auto">
                  <Popover>
                    <PopoverTrigger>
                      <Button
                        backgroundColor="#F0F1F4"
                        variant="subtle"
                        minWidth="auto"
                        height="40px"
                        borderRadius="30px"
                      >
                        <Box
                          display="flex"
                          flexDirection="row"
                          alignItems="center"
                          gap="5px"
                        >
                          <Icon as={filterButton} />
                          <Text
                            fontSize="sm"
                            color="#767778"
                          >
                            Filters
                          </Text>
                        </Box>
                      </Button>
                    </PopoverTrigger>
                    <Portal>
                      <PopoverContent>
                        <Box margin="16px">
                          <PopoverBody>
                            <Box
                              display="flex"
                              flexDirection="column"
                              alignItems="flex-start"
                              gap="24px"
                              alignSelf="stretch"
                            >
                              <FormControl id="date">
                                <Box
                                  display="flex"
                                  flexDirection="column"
                                  justifyContent="center"
                                  alignItems="flex-start"
                                  gap="16px"
                                  alignSelf="stretch"
                                >
                                  <Box
                                    display="flex"
                                    alignItems="center"
                                    gap="5px"
                                    alignSelf="stretch"
                                  >
                                    <Icon as={filterDateCalendar} />
                                    <Text
                                      fontWeight="bold"
                                      color="#767778"
                                    >
                                      Date
                                    </Text>
                                  </Box>
                                  <Box
                                    display="flex"
                                    alignItems="center"
                                    gap="8px"
                                  >
                                    <Input
                                      size="sm"
                                      borderRadius="5px"
                                      borderColor="#D2D2D2"
                                      backgroundColor="#F6F6F6"
                                      width="35%"
                                      height="20%"
                                      type="date"
                                      placeholder="MM/DD/YYYY"
                                      onChange={(e) =>
                                        handleDateChange("start", e.target.value)
                                      }
                                    />
                                    <Text> to </Text>
                                    <Input
                                      size="sm"
                                      borderRadius="5px"
                                      borderColor="#D2D2D2"
                                      backgroundColor="#F6F6F6"
                                      width="35%"
                                      height="20%"
                                      type="date"
                                      placeholder="MM/DD/YYYY"
                                      onChange={(e) =>
                                        handleDateChange("end", e.target.value)
                                      }
                                    />
                                  </Box>
                                </Box>
                              </FormControl>
                              <FormControl id="time">
                                <Box
                                  display="flex"
                                  flexDirection="column"
                                  justifyContent="center"
                                  alignItems="flex-start"
                                  gap="16px"
                                  alignSelf="stretch"
                                >
                                  <Box
                                    display="flex"
                                    alignItems="center"
                                    gap="5px"
                                    alignSelf="stretch"
                                  >
                                    <Icon as={sessionsFilterClock} />
                                    <Text
                                      fontWeight="bold"
                                      color="#767778"
                                    >
                                      Time
                                    </Text>
                                  </Box>
                                  <Box
                                    display="flex"
                                    alignItems="center"
                                    gap="8px"
                                  >
                                    <Input
                                      size="xs"
                                      borderRadius="5px"
                                      borderColor="#D2D2D2"
                                      backgroundColor="#F6F6F6"
                                      width="30%"
                                      height="20%"
                                      type="time"
                                      placeholder="00:00 am"
                                      onChange={(e) =>
                                        handleTimeChange("start", e.target.value)
                                      }
                                    />
                                    <Text> to </Text>
                                    <Input
                                      size="xs"
                                      borderRadius="5px"
                                      borderColor="#D2D2D2"
                                      backgroundColor="#F6F6F6"
                                      width="30%"
                                      height="20%"
                                      type="time"
                                      placeholder="00:00 pm"
                                      onChange={(e) =>
                                        handleTimeChange("end", e.target.value)
                                      }
                                    />
                                  </Box>
                                </Box>
                              </FormControl>
                              <FormControl id="room">
                                <Box
                                  display="flex"
                                  flexDirection="column"
                                  justifyContent="center"
                                  alignItems="flex-start"
                                  gap="16px"
                                  alignSelf="stretch"
                                >
                                  <Box
                                    display="flex"
                                    alignItems="center"
                                    gap="5px"
                                    alignSelf="stretch"
                                  >
                                    <Icon as={sessionsFilterMapPin} />
                                    <Text
                                      fontWeight="bold"
                                      color="#767778"
                                    >
                                      Room
                                    </Text>
                                  </Box>
                                  <Wrap spacing={2}>
                                    <WrapItem>
                                      <Button
                                        borderRadius="30px"
                                        borderWidth="1px"
                                        width="auto"
                                        height="20px"
                                        onClick={() => setSelectedRoom("All")}
                                        backgroundColor={
                                          selectedRoom === "All"
                                            ? "#EDEDFD"
                                            : "#F6F6F6"
                                        }
                                        borderColor={
                                          selectedRoom === "All"
                                            ? "#4E4AE7"
                                            : "#767778"
                                        }
                                      >
                                        All
                                      </Button>
                                    </WrapItem>
                                    {roomNames && Array.from(roomNames.values()).map(
                                      (room, index) => (
                                        <WrapItem>
                                          <Button
                                            key={index}
                                            borderRadius="30px"
                                            borderWidth="1px"
                                            minWidth="auto"
                                            height="20px"
                                            onClick={() => setSelectedRoom(room)}
                                            backgroundColor={
                                              selectedRoom === room
                                                ? "#EDEDFD"
                                                : "#F6F6F6"
                                            }
                                            borderColor={
                                              selectedRoom === room
                                                ? "#4E4AE7"
                                                : "#767778"
                                            }
                                          >
                                            {room}
                                          </Button>
                                        </WrapItem>
                                      )
                                    )}
                                  </Wrap>
                                </Box>
                              </FormControl>
                            </Box>
                          </PopoverBody>
                        </Box>
                      </PopoverContent>
                    </Portal>
                  </Popover>
                </Flex>
                <Flex>
                  <InputGroup size="md" width="300px" variant="outline" borderColor="#D2D2D2" background="white" type="text">
                    <Input placeholder="Search..." borderRadius="15px"
                      onChange={(e) => handleSearch(e.target.value)}/>
                    <InputRightElement marginRight="4px">
                      <Button size="sm" borderRadius="15px" background="#F0F1F4"
                        onClick={() => handleSearch(searchQuery)}>
                        <Icon as={archiveMagnifyingGlass} />
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                </Flex>
              </Box>
              <TableContainer>
                <Table variant="unstyled">
                  <Thead borderBottom="1px" color="#D2D2D2">
                    <Tr>
                      <Th>
                        <Box display="flex" padding="8px" justifyContent="center" alignItems="center" gap="8px">
                          <Text textTransform="none" color="#767778" fontSize="16px" fontStyle="normal">
                            Program
                          </Text>
                          <Box display="flex" flexDirection="column" alignItems="flex-start" gap="2px">
                            <Icon as={sessionsUpArrow} />
                            <Icon as={sessionsDownArrow} />
                          </Box>
                        </Box>
                      </Th>
                      <Th>
                        <Box display="flex" padding="8px" justifyContent="center" alignItems="center" gap="8px">
                          <Icon as={archiveCalendar} />
                          <Text textTransform="none" color="#767778" fontSize="16px" fontStyle="normal">
                            Date
                          </Text>
                          <Box display="flex" flexDirection="column" alignItems="flex-start" gap="2px">
                            <Icon as={sessionsUpArrow} />
                            <Icon as={sessionsDownArrow} />
                          </Box>
                        </Box>
                      </Th>
                      <Th>
                        <Box display="flex" padding="8px" justifyContent="center" alignItems="center" gap="8px">
                          <Icon as={archiveClock} />
                          <Text textTransform="none" color="#767778" fontSize="16px" fontStyle="normal">
                            Time
                          </Text>
                        </Box>
                      </Th>
                      <Th>
                        <Box display="flex" padding="8px" justifyContent="center" alignItems="center" gap="8px">
                          <Icon as={archiveMapPin} />
                          <Text textTransform="none" color="#767778" fontSize="16px" fontStyle="normal">
                            Room
                          </Text>
                        </Box>
                      </Th>
                      <Th>
                        <Box display="flex" padding="8px" justifyContent="center" alignItems="center" gap="8px">
                          <Icon as={archivePerson} />
                          <Text textTransform="none" color="#767778" fontSize="16px" fontStyle="normal">
                            Lead Artist(s)
                          </Text>
                        </Box>
                      </Th>
                      <Th>
                        <Box display="flex" padding="8px" justifyContent="center" alignItems="center" gap="8px">
                          <Icon as={archivePerson} />
                          <Text textTransform="none" color="#767778" fontSize="16px" fontStyle="normal">
                            Payer(s)
                          </Text>
                        </Box>
                      </Th>
                      <Th>
                        {/* Empty column for ellipsis button */}
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filterSessions().length > 0 ? (
                      filterSessions().map((programSession) => (
                      <Tr key={programSession.programId}>
                        <Td>
                          {programSession.programName}
                        </Td>
                        <Td>
                          {programSession.sessionDate !== "N/A"
                          ? formatDate(programSession.sessionDate)
                          : "N/A"}
                        </Td>
                        <Td>
                          {programSession.sessionStart !== "N/A" ?
                          `${formatTime(programSession.sessionStart)} - ${formatTime(programSession.sessionEnd)}`
                            : "N/A"}
                        </Td>
                        <Td>
                          {programSession.room !== "N/A" ? programSession.room : "N/A"}
                        </Td>
                        <Td>
                          {programSession.instructors && programSession.instructors.length > 0
                            ? programSession.instructors.map(instructor => instructor.clientName).join(', ')
                            : 'N/A'}
                        </Td>
                        <Td>
                          {programSession.payees && programSession.payees.length > 0
                            ? programSession.payees.map(payee => payee.clientName).join(', ')
                            : 'N/A'}
                        </Td>
                        <Td>
                          <Menu>
                            <MenuButton
                              as={IconButton}
                              height="30px"
                              width="30px"
                              rounded="full"
                              variant="ghost"
                              icon={<Icon as={sessionsEllipsis} />}/>
                            <MenuList>
                              <MenuItem onClick={() => handleDuplicate(programSession.programId)}>
                                <Box display="flex" padding="12px 16px" alignItems="center" gap="8px" alignSelf="stretch">
                                  <Icon as={duplicateIcon} />
                                  <Text color="#767778">Duplicate</Text>
                                </Box>
                              </MenuItem>
                              <MenuItem onClick={() => handleReactivate(programSession.programId)}>
                                <Box display="flex" padding="12px 16px" alignItems="center" gap="8px" alignSelf="stretch">
                                  <Icon as={reactivateIcon} />
                                  <Text color="#767778">Reactivate</Text>
                                </Box>
                              </MenuItem>
                              <MenuItem onClick={() => handleConfirmDelete(programSession.programId)}>
                                <Box display="flex" padding="12px 16px" alignItems="center" gap="8px" alignSelf="stretch">
                                  <Icon as={deleteIcon} />
                                  <Text color="#90080F">Delete</Text>
                                </Box>
                              </MenuItem>
                            </MenuList>
                          </Menu>

                        </Td>
                      </Tr>
                    ))
                    ) : (
                      <Tr>
                        <Td colSpan={7}>
                          <Box
                            justifyContent="center"
                            py={6}
                            color="gray.500"
                            fontSize="md"
                            width="300px"
                            margin="auto"
                          >
                            <Text>No archived program or session data to display.</Text>
                          </Box>
                        </Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>
              </TableContainer>
            </Flex>
          </CardBody>
        </Card>
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader fontStyle = "normal" fontWeight = "400" color="#474849">Delete Program?</ModalHeader>
            <ModalBody>
              <Alert status="error" borderRadius="md" p={4} display="flex" flexDirection="column">
                <Box color="#90080F">
                  <Flex alignitems="center">
                    <Box color="#90080F0" mr={2} display="flex" alignItems = "center">
                      <Info />
                    </Box>
                    <AlertTitle color="#90080F" fontStyle = "normal" fontWeight = "500">Program will be permanently deleted from Archives.</AlertTitle>
                  </Flex>
                </Box>
              </Alert>
            </ModalBody>
            <ModalFooter>
              <Button bg ="transparent" onClick={onClose} color="#767778" borderRadius="30px" mr={3}>Exit</Button>
              <Button onClick={() => handleDelete(programToDelete)} style={{backgroundColor: "#90080F"}} colorScheme = "white" borderRadius="30px">Confirm</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </Navbar>
  );
};
