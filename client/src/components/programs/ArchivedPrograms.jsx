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
  const [sessions, setSessions] = useState([]);
  const [archived, setArchived] = useState([]);

  const getArchivedSessions = async () => {
    try {
      const sessionsResponse = await backend.get(`events`);
      const sessionsData = sessionsResponse.data;

      setSessions(sessionsData);

      const archivedSessions = sessionsData.filter(session => session.archived === true);

      setArchived(archivedSessions);
    } catch (error) {  // Add error parameter here
      console.log("From getArchivedSessions: ", error);
    }
  }

  useEffect(() => {
    getArchivedSessions();
  }, []);

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';

    const date = new Date(isoString);

    if (isNaN(date.getTime())) {
      console.error('Invalid date:', isoString);
      return 'Invalid Date';
    }

    const options = {
      weekday: "short",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };

    const parts = new Intl.DateTimeFormat("en-US", options).formatToParts(date);
    const weekday = parts.find(part => part.type === 'weekday').value;
    const month = parts.find(part => part.type === 'month').value;
    const day = parts.find(part => part.type === 'day').value;
    const year = parts.find(part => part.type === 'year').value;

    return `${weekday}. ${month}/${day}/${year}`;
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
                        // mt="10px"
                        // mb="15px"
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
                                      // onChange={(e) =>
                                      //   handleTimeChange("start", e.target.value)
                                      // }
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
                                      // onChange={(e) =>
                                      //   handleTimeChange("end", e.target.value)
                                      // }
                                    />
                                  </Box>
                                </Box>
                              </FormControl>
                              <FormControl id="status">
                                <Box
                                  display="flex"
                                  flexDirection="column"
                                  justifyContent="center"
                                  alignItems="flex-start"
                                  gap="16px"
                                  alignSelf="stretch"
                                >
                                  <Text
                                    fontWeight="bold"
                                    color="#767778"
                                  >
                                    Status
                                  </Text>
                                  <Box
                                    display="flex"
                                    alignItems="center"
                                    gap="8px"
                                  >
                                    <Button
                                      borderRadius="30px"
                                      borderWidth="1px"
                                      minWidth="auto"
                                      height="20%"
                                      // onClick={() => setStatus("All")}
                                      // backgroundColor={
                                      //   status === "All" ? "#EDEDFD" : "#F6F6F6"
                                      // }
                                      // borderColor={
                                      //   status === "All" ? "#4E4AE7" : "#767778"
                                      // }
                                    >
                                      All
                                    </Button>
                                    <Button
                                      borderRadius="30px"
                                      borderWidth="1px"
                                      minWidth="auto"
                                      height="20%"
                                      // onClick={() => setStatus("Active")}
                                      // backgroundColor={
                                      //   status === "Active" ? "#EDEDFD" : "#F6F6F6"
                                      // }
                                      // borderColor={
                                      //   status === "Active" ? "#4E4AE7" : "#767778"
                                      // }
                                    >
                                      <Box
                                        display="flex"
                                        justifyContent="center"
                                        alignItems="center"
                                        gap="4px"
                                      >
                                        <Box
                                          width="10px"
                                          height="10px"
                                          borderRadius="50%"
                                          bg="#0C824D"
                                        />
                                        Active
                                      </Box>
                                    </Button>
                                    <Button
                                      borderRadius="30px"
                                      borderWidth="1px"
                                      minWidth="auto"
                                      height="20%"
                                      // onClick={() => setStatus("Past")}
                                      // backgroundColor={
                                      //   status === "Past" ? "#EDEDFD" : "#F6F6F6"
                                      // }
                                      // borderColor={
                                      //   status === "Past" ? "#4E4AE7" : "#767778"
                                      // }
                                    >
                                      <Box
                                        display="flex"
                                        justifyContent="center"
                                        alignItems="center"
                                        gap="4px"
                                      >
                                        <Box
                                          width="10px"
                                          height="10px"
                                          borderRadius="50%"
                                          bg="#DAB434"
                                        />
                                        Past
                                      </Box>
                                    </Button>
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
                    {archived.length > 0 ? (
                      archived.map((session) => (
                      <Tr key={session.id}>
                        <Td>
                          {session.name}
                        </Td>
                        <Td>
                          Date
                        </Td>
                        <Td>
                          Time
                        </Td>
                        <Td>
                          {session.room}
                        </Td>
                        <Td>
                          Lead Artist Name
                        </Td>
                        <Td>
                          Payers Name
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
                        <Td>
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
      </Box>
    </Navbar>
  );
};
