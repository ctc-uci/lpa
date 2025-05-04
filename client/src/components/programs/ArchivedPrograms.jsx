import { useCallback, useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import "./ArchivedPrograms.css";

import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  FormControl,
  Icon,
  Input,
  Popover,
  PopoverBody,
  PopoverContent,
  Portal,
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
  archiveBox,
  archiveCalendar,
  archiveClock,
  archiveMapPin,
  archivePaintPalette,
  archivePerson,
  BackIcon,
  filterDateCalendar,
  sessionsFilterClock,
  sessionsFilterMapPin,
} from "../../assets/icons/ProgramIcons";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { ArchivedDropdown } from "../archivedDropdown/ArchivedDropdown";
import { ArchivedFilter } from "../filters/ArchivedFilter";
import DateSortingModal from "../filters/DateFilter";
import ProgramSortingModal from "../filters/ProgramFilter";
import Navbar from "../navbar/Navbar";
import { SearchBar } from "../searchBar/SearchBar";

export const ArchivedPrograms = () => {
  const { backend } = useBackendContext();
  const [program, setPrograms] = useState([]);
  const [archived, setArchived] = useState([]);
  const [uniqueRooms, setUniqueRooms] = useState(null);
  const [roomNames, setRoomNames] = useState(null);
  const [archivedSessions, setArchivedProgramSessions] = useState([]);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [timeRange, setTimeRange] = useState({ start: "", end: "" });
  const [selectedRoom, setSelectedRoom] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [programToDelete, setProgramToDelete] = useState(null);
  const [sortKey, setSortKey] = useState("title"); // can be "title" or "date"
  const [sortOrder, setSortOrder] = useState("asc"); // "asc" or "desc"
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const calculateRowsPerPage = () => {
      const viewportHeight = window.innerHeight;
      const rowHeight = 56;

      const availableHeight = viewportHeight * 0.48;

      console.log(availableHeight / rowHeight);
      return Math.max(5, Math.floor(availableHeight / rowHeight));
    };

    setItemsPerPage(calculateRowsPerPage());

    const handleResize = () => {
      setItemsPerPage(calculateRowsPerPage());
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  const [filteredArchived, setFilteredArchived] = useState([]);

  const handleSortChange = (key, order) => {
    setSortKey(key);
    setSortOrder(order);
  };

  const getArchivedPrograms = async () => {
    try {
      const programResponse = await backend.get(`events`);
      const programData = programResponse.data;

      setPrograms(programData);

      const archivedSessions = programData.filter(
        (program) => program.archived === true
      );

      setArchived(archivedSessions);

      await getArchivedProgramSessions(archivedSessions);
    } catch (error) {
      console.log("From getArchivedSessions: ", error);
    }
  };

  const getArchivedProgramSessions = async (archivedPrograms) => {
    try {
      const info = [];
      const allRoomIds = new Set();

      for (const program of archivedPrograms) {
        let mostRecentSession = {
          date: "N/A",
          startTime: "N/A",
          endTime: "N/A",
          recentSession: "N/A",
        };
        let sessions = [];
        const thisAssignments = {
          instructors: [],
          payees: [],
        };
        let roomName = "N/A";

        try {
          const sessionsResponse = await backend.get(
            `bookings/byEvent/${program.id}`
          );
          sessions = sessionsResponse.data;

          if (sessions.length > 0) {
            // get unique roomIds
            sessions.forEach((session) => allRoomIds.add(session.roomId));

            mostRecentSession = sessions.reduce((latest, current) => {
              return new Date(current.date) > new Date(latest.date)
                ? current
                : latest;
            }, sessions[0]);

            // get room name
            const roomsResponse = await backend.get(
              `rooms/${mostRecentSession.roomId}`
            );
            const room = roomsResponse.data;
            roomName = room[0]?.name || "N/A";

            // get artists and payees
            const assignmentsResponse = await backend.get(
              `/assignments/event/${program.id}`
            );
            for (const assignment of assignmentsResponse.data) {
              if (assignment.role === "instructor") {
                thisAssignments.instructors.push(assignment);
              } else if (assignment.role === "payee") {
                thisAssignments.payees.push(assignment);
              }
            }
          }
        } catch (error) {
          console.error(
            `Error fetching data for program ${program.id}:`,
            error
          );
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
          payees: thisAssignments.payees,
        };
        // console.log("THIS SESSION", thisSession);
        info.push(thisSession);
      }

      setArchivedProgramSessions(info);
      setFilteredArchived(info);
      setUniqueRooms([...allRoomIds]);
      // console.log("here");
      // console.log(archivedSessions);
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
  }, [archivedSessions]);

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

  const handleRowClick = useCallback(
    (id) => {
      navigate(`/programs/${id}`);
    },
    [navigate]
  );


  const sortedArchivedSessions = useMemo(() => {
    // Filtered should be the results of the archivedfilter update
    const filtered = filteredArchived;
    console.log(
      "Filtered session dates:",
      filtered.map((s) => s.sessionDate)
    );

    const sorted = [...filtered];
    if (sortKey === "title") {
      sorted.sort((a, b) =>
        sortOrder === "asc"
          ? a.programName.localeCompare(b.programName)
          : b.programName.localeCompare(a.programName)
      );
    } else if (sortKey === "date") {
      sorted.sort((a, b) => {
        const dateA = a.sessionDate !== "N/A" ? new Date(a.sessionDate) : null;
        const dateB = b.sessionDate !== "N/A" ? new Date(b.sessionDate) : null;
        // If both are null, they are equal.
        if (!dateA && !dateB) return 0;
        // If one is null, push it to the end.
        if (!dateA) return 1;
        if (!dateB) return -1;
        console.log(
          "Comparing:",
          a.sessionDate,
          "->",
          dateA,
          "vs",
          b.sessionDate,
          "->",
          dateB
        );
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      });
    }
    console.log(
      "Sorted session dates:",
      sorted.map((s) => s.sessionDate)
    );
    return sorted;
  }, [filteredArchived, sortKey, sortOrder]);

  const totalPrograms = sortedArchivedSessions?.length || 0;
  const totalPages = Math.ceil(totalPrograms / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalPrograms);

  // Get current page data
  const currentPagePrograms = sortedArchivedSessions.slice(
    startIndex,
    endIndex
  );

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const deleteArchivedProgram = async (programId) => {
    try {
      await backend.delete(`/events/${programId}`);
    } catch (error) {
      console.log("Couldn't delete", error);
    }
  };

  const handleDelete = async (programId) => {
    try {
      await deleteArchivedProgram(programId);

      // Update local state
      setArchivedProgramSessions((prevSessions) =>
        prevSessions.filter((session) => session.programId !== programId)
      );
      onClose();
    } catch (error) {
      console.log("Couldn't delete program", error);
    }
  };

  return (
    <Navbar>
      <Box margin="40px">
        <Flex
          align="center"
          mb="24px"
        >
          <Icon as={archiveBox} />
          <Text
            fontSize="24px"
            fontWeight="semibold"
            color="#2D3748"
            ml="8px"
          >
            Archived
          </Text>
        </Flex>
        <Card
          shadow="none"
          border="1px"
          borderColor="#E2E8F0"
          borderRadius="15px"
        >
          <CardBody margin="6px">
            <Flex
              direction="column"
              justify="space-between"
            >
              <Box
                display="flex"
                justify-content="space-between"
                align-items="flex-start"
                align-self="stretch"
                marginTop="5px"
                marginBottom="15px"
              >
                <Flex
                  marginRight="auto"
                  gap="1.25rem"
                  alignItems="center"
                >
                  <Button
                    id="programButton"
                    display="flex"
                    gap="0.25rem"
                    onClick={() => {
                      navigate("/programs");
                    }}
                  >
                    <BackIcon />
                    <Text
                      fontSize="sm"
                      color="#2D3748"
                    >
                      Programs
                    </Text>
                  </Button>
                  <Popover>
                    {/* <PopoverTrigger>
                      <Button
                        backgroundColor="#EDF2F7"
                        midWidth="auto"
                        borderRadius="6px"
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
                            color="#2D3748"
                          >
                            Filters
                          </Text>
                        </Box>
                      </Button>
                    </PopoverTrigger> */}
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
                                        handleDateChange(
                                          "start",
                                          e.target.value
                                        )
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
                                        handleTimeChange(
                                          "start",
                                          e.target.value
                                        )
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
                                    {roomNames &&
                                      Array.from(roomNames.values()).map(
                                        (room, index) => (
                                          <WrapItem>
                                            <Button
                                              key={index}
                                              borderRadius="30px"
                                              borderWidth="1px"
                                              minWidth="auto"
                                              height="20px"
                                              onClick={() =>
                                                setSelectedRoom(room)
                                              }
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
                  <Flex marginRight="auto">
                    <ArchivedFilter
                      archived={archivedSessions}
                      setArchivedPrograms={setFilteredArchived}
                      roomMap={roomNames}
                    />
                  </Flex>
                  <SearchBar
                    handleSearch={handleSearch}
                    searchQuery={searchQuery}
                  />
                </Flex>
              </Box>
              <TableContainer>
                <Table variant="unstyled">
                  <Thead
                    borderBottom="1px"
                    color="#D2D2D2"
                  >
                    <Tr>
                      <Th
                        className="th"
                        minWidth="20rem"
                      >
                        <Box
                          className="columnContainer"
                          width="100%"
                        >
                          <Text
                            className="archiveHeaderText"
                            textTransform="none"
                          >
                            PROGRAM
                          </Text>
                          <ProgramSortingModal
                            onSortChange={handleSortChange}
                          />
                        </Box>
                      </Th>
                      <Th className="th">
                        <Box
                          className="columnContainer"
                          justifyContent="space-between"
                        >
                          <Flex
                            align="center"
                            gap="8px"
                          >
                            <Box>
                              <Icon as={archiveCalendar} />
                            </Box>
                            <Box>
                              <Text
                                className="archiveHeaderText"
                                textTransform="none"
                              >
                                DATE
                              </Text>
                            </Box>
                          </Flex>
                          <Box>
                            <DateSortingModal onSortChange={handleSortChange} />
                          </Box>
                        </Box>
                      </Th>
                      <Th className="th">
                        <Box className="columnContainer">
                          <Icon as={archiveClock} />
                          <Text
                            className="archiveHeaderText"
                            textTransform="none"
                          >
                            UPCOMING TIME
                          </Text>
                        </Box>
                      </Th>
                      <Th
                        className="th"
                        maxWidth="6rem"
                      >
                        <Box className="columnContainer">
                          <Icon as={archiveMapPin} />
                          <Text
                            className="archiveHeaderText"
                            textTransform="none"
                          >
                            ROOM
                          </Text>
                        </Box>
                      </Th>
                      <Th className="th">
                        <Box className="columnContainer">
                          <Icon as={archivePaintPalette} />
                          <Text
                            className="archiveHeaderText"
                            textTransform="none"
                          >
                            LEAD ARTIST(S)
                          </Text>
                        </Box>
                      </Th>
                      <Th className="th">
                        <Box className="columnContainer">
                          <Icon as={archivePerson} />
                          <Text
                            className="archiveHeaderText"
                            textTransform="none"
                          >
                            PAYER(S)
                          </Text>
                        </Box>
                      </Th>
                      <Th className="th">
                        {/* Empty column for ellipsis button */}
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {sortedArchivedSessions.length > 0 ? (
                      sortedArchivedSessions.map((programSession) => (
                        <Tr
                          key={programSession.programId}
                          onClick={() =>
                            handleRowClick(programSession.programId)
                          }
                          cursor="pointer"
                        >
                          <Td
                            className="td"
                            minWidth="20rem"
                          >
                            {programSession.programName}
                          </Td>
                          <Td className="td">
                            {programSession.sessionDate !== "N/A"
                              ? formatDate(programSession.sessionDate)
                              : "N/A"}
                          </Td>
                          <Td className="td">
                            {programSession.sessionStart !== "N/A"
                              ? `${formatTime(programSession.sessionStart)} - ${formatTime(programSession.sessionEnd)}`
                              : "N/A"}
                          </Td>
                          <Td
                            className="td"
                            maxWidth="6rem"
                          >
                            {programSession.room !== "N/A"
                              ? programSession.room
                              : "N/A"}
                          </Td>
                          <Td className="td">
                            {programSession.instructors &&
                            programSession.instructors.length > 0
                              ? programSession.instructors
                                  .map((instructor) => instructor.clientName)
                                  .join(", ")
                              : "N/A"}
                          </Td>
                          <Td className="td">
                            {programSession.payees &&
                            programSession.payees.length > 0
                              ? programSession.payees
                                  .map((payee) => payee.clientName)
                                  .join(", ")
                              : "N/A"}
                          </Td>
                          <Td
                            className="td"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ArchivedDropdown
                              programId={programSession.programId}
                              programName={programSession.programName}
                              setProgramToDelete={setProgramToDelete}
                              onOpen={onOpen}
                              setArchivedProgramSessions={
                                setArchivedProgramSessions
                              }
                            />
                          </Td>
                        </Tr>
                      ))
                    ) : (
                      <Tr>
                        <Td
                          colSpan={7}
                          textAlign="center"
                          className="td"
                        >
                          <Box
                            justifyContent="center"
                            py={6}
                            color="gray.500"
                            fontSize="md"
                            width="300px"
                            margin="auto"
                          >
                            <Text textAlign={"center"}>
                              No archived program or session data to display.
                            </Text>
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
        {/* <CancelProgram
          id={programToDelete}
          setPrograms={setPrograms}
          onOpen={onOpen}
          isOpen={isOpen}
          onClose={onClose}
          type="Program"
        />*/}

        <Box
          width="100%"
          display="flex"
          justifyContent="flex-end"
          mt="auto"
          pt={4}
        >
          {totalPages > 1 && (
            <Flex
              alignItems="center"
              justifyContent="center"
              mb={2}
            >
              <Text
                mr={2}
                fontSize="sm"
                color="#474849"
                fontFamily="Inter, sans-serif"
              >
                {currentPage} of {totalPages}
              </Text>
              <Button
                onClick={goToPreviousPage}
                isDisabled={currentPage === 1}
                size="sm"
                variant="ghost"
                padding={0}
                minWidth="auto"
                color="gray.500"
                mr="16px"
              >
                <ChevronLeftIcon />
              </Button>
              <Button
                onClick={goToNextPage}
                isDisabled={currentPage === totalPages}
                size="sm"
                variant="ghost"
                padding={0}
                minWidth="auto"
                color="gray.500"
              >
                <ChevronRightIcon />
              </Button>
            </Flex>
          )}
        </Box>
      </Box>
    </Navbar>
  );
};
