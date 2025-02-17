import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import Navbar from "../navbar/Navbar";
import {
  Box,
  Button,
  Card,
  CardBody,
  Container,
  Flex,
  FormControl,
  Heading,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  InputRightAddon,
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
  archiveMagnifyingGlass
} from "../../assets/icons/ProgramIcons";


export const ArchivedPrograms = () => {
  const { backend } = useBackendContext();
  const [program, setPrograms] = useState([]);
  const [archived, setArchived] = useState([]);
  const [sessions, setSessions] = useState(null);
  const [uniqueRooms, setRoomIds] = useState(null);
  const [archivedSessions, setArchivedProgramSessions]= useState([]);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [timeRange, setTimeRange] = useState({ start: "", end: "" });

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
      for (const program of archivedPrograms) {
        console.log(program.id);
        const sessionsResponse = await backend.get(`bookings/event/${program.id}`);
        const sessions = sessionsResponse.data;
        console.log(sessions);

        // get most recent session
        const mostRecentSession = sessions.reduce((latest, current) => {
          return new Date(current.date) > new Date(latest.date) ? current : latest;
        }, sessions[0]);
        console.log(mostRecentSession);

        // get artists and payees
        const assignmentsResponse = await backend.get(
          `/assignments/event/${program.id}`
        );
        const thisAssignments = {
          instructors: [],
          payees: []
        }
        for (const assignment of assignmentsResponse.data) {
          if (assignment.role === "instructor") {
            thisAssignments.instructors.push(assignment);
          } else if (assignment.role === "payee") {
            thisAssignments.payees.push(assignment);
          }
        }
        console.log("assignments");
        console.log(thisAssignments.instructors);

        const roomsResponse = await backend.get(`rooms/${mostRecentSession.roomId}`);
        const room = roomsResponse.data;
        const roomName = room[0].name;
        console.log("r");
        console.log(roomName);

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
        }

        info.push(thisSession);
        console.log("here is info");
        console.log(info);
      }

      // Store this data in state
      setArchivedProgramSessions(info);
      console.log("here");
      console.log(archivedSessions);
    } catch (error) {
      console.log("From getArchivedProgramSessions: ", error);
    }
  };

  useEffect(() => {
    getArchivedPrograms();
  }, []);

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
      // const isRoomMatch =
      //   selectedRoom === "All" || rooms.get(session.roomId) === selectedRoom;
      return isDateInRange && isTimeInRange;
    });
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
                        // onClick={onOpen}
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
                            </Box>
                          </PopoverBody>
                        </Box>
                      </PopoverContent>
                    </Portal>
                  </Popover>
                </Flex>
                <Flex>
                  <InputGroup size="md" width="300px" variant="outline" borderColor="#D2D2D2" background="white" type="text">
                    <Input placeholder="Search..." borderRadius="15px" />
                    <InputRightElement marginRight="4px">
                      <Button size="sm" borderRadius="15px" background="#F0F1F4" onClick={() => console.log("Search clicked")}>
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
                          {formatDate(programSession.sessionDate)}
                        </Td>
                        <Td>
                          {formatTime(programSession.sessionStart)} - {formatTime(programSession.sessionEnd)}
                        </Td>
                        <Td>
                          {programSession.room}
                        </Td>
                        <Td>
                          {programSession.instructors && programSession.instructors.length > 0
                            ? programSession.instructors[0].clientName
                            : 'N/A'}
                        </Td>
                        <Td>
                          {programSession.payees && programSession.payees.length > 0
                            ? programSession.payees[0].clientName
                            : 'N/A'}
                        </Td>
                        <Td>
                          <IconButton
                            height="30px"
                            width="30px"
                            rounded="full"
                            variant="ghost"
                            icon={<Icon as={sessionsEllipsis} />}
                          />
                        </Td>
                      </Tr>
                    ))
                    ) : (
                      <Tr>
                        {/* <Td> */}
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
                        {/* </Td> */}
                      </Tr>
                    )}
                  </Tbody>
                </Table>
              </TableContainer>
            </Flex>
          </CardBody>
        </Card>
      </Box>
    </Navbar>
  );
};
