import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
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
import { InfoIconRed } from "../../assets/InfoIconRed";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { ArchivedDropdown } from "../archivedDropdown/ArchivedDropdown";
import { ArchivedFilter } from "../filters/ArchivedFilter";
import Navbar from "../navbar/Navbar";
import { SearchBar } from "../searchBar/SearchBar";
import DateSortingModal from "../sorting/DateFilter";
import ProgramSortingModal from "../sorting/ProgramFilter";

export const ArchivedPrograms = () => {
  const { backend } = useBackendContext();
  const toast = useToast();
  const [program, setPrograms] = useState([]);
  // Complete dataset of archived programs
  const [allArchivedSessions, setAllArchivedSessions] = useState([]);
  // Filtered dataset (after applying filters)
  const [filteredArchived, setFilteredArchived] = useState([]);
  const [uniqueRooms, setUniqueRooms] = useState(null);
  const [roomNames, setRoomNames] = useState(null);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [timeRange, setTimeRange] = useState({ start: "", end: "" });
  const [selectedRoom, setSelectedRoom] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [sortKey, setSortKey] = useState("title"); // can be "title" or "date"
  const [sortOrder, setSortOrder] = useState("asc"); // "asc" or "desc"
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const dataFetchedRef = useRef(false);
  const [programtoDelete, setProgramToDelete] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const calculateRowsPerPage = () => {
      // Use 10 rows per page for archives - slightly less than other pages
      return 10;
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

  const handleSortChange = (key, order) => {
    setSortKey(key);
    setSortOrder(order);
  };

  const getArchivedPrograms = async () => {
    if (dataFetchedRef.current) return;
    setLoading(true);

    try {
      const programResponse = await backend.get(`events`);
      const programData = programResponse.data;

      setPrograms(programData);

      const archivedSessions = programData.filter(
        (program) => program.archived === true
      );

      await getArchivedProgramSessions(archivedSessions);
    } catch (error) {
      console.log("From getArchivedSessions: ", error);
    } finally {
      setLoading(false);
      dataFetchedRef.current = true;
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
        info.push(thisSession);
      }

      setAllArchivedSessions(info);
      setFilteredArchived(info);
      setUniqueRooms([...allRoomIds]);
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

  // Load data only once when component mounts
  useEffect(() => {
    getArchivedPrograms();
  }, []);

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

  // Apply search on the current filtered results
  const handleSearch = (query) => {
    setSearchQuery(query);

    if (!query) {
      // If query is empty, use the complete original dataset
      setFilteredArchived(allArchivedSessions);
      return;
    }

    const lowerCaseQuery = query.toLowerCase();
    const filtered = allArchivedSessions.filter((session) => {
      return (
        // Search by program name
        (session.programName &&
          session.programName.toLowerCase().includes(lowerCaseQuery)) ||
        // Search by room
        (session.room && session.room.toLowerCase().includes(lowerCaseQuery)) ||
        // Search by instructors
        (session.instructors &&
          session.instructors.some(
            (instructor) =>
              instructor.clientName &&
              instructor.clientName.toLowerCase().includes(lowerCaseQuery)
          )) ||
        // Search by payees
        (session.payees &&
          session.payees.some(
            (payee) =>
              payee.clientName &&
              payee.clientName.toLowerCase().includes(lowerCaseQuery)
          ))
      );
    });

    setFilteredArchived(filtered);
    // Reset to first page when searching
    setCurrentPage(1);
  };

  const handleRowClick = useCallback(
    (id) => {
      navigate(`/programs/${id}`);
    },
    [navigate]
  );

  const sortedArchivedSessions = useMemo(() => {
    // Use filtered data
    const filtered = filteredArchived;

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
        // Compare dates
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      });
    }
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
    console.log(programId);
    try {
      await deleteArchivedProgram(programId);

      // Update local state by removing the deleted program from all state variables
      const updatedAllArchivedSessions = allArchivedSessions.filter(
        (session) => session.programId !== programId
      );
      setAllArchivedSessions(updatedAllArchivedSessions);

      setFilteredArchived((prevSessions) =>
        prevSessions.filter((session) => session.programId !== programId)
      );

      onClose();
      toast({
        title: "Archived Program Deleted.",
        description: "We've deleted the archived program.",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
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
          <Icon
            as={archiveBox}
            width="24px"
            height="24px"
          />
          <Text
            fontSize="24px"
            fontWeight="600"
            fontFamily="Inter"
            fontStyle="normal"
            lineHeight="32px"
            color="#2D3748"
            ml="8px"
          >
            Archived
          </Text>
        </Flex>
        <Box
          className="programs-table"
          width="100%"
          margin="0"
          border="1px solid var(--Secondary-3, #e2e8f0)"
          borderRadius="15px"
          padding="20px"
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          gap="16px"
          alignSelf="stretch"
          background="white"
          position="relative"
          zIndex={3}
          // minHeight="500px" // Add minimum height to prevent collapsing (should it collapse?)
        >
          <Flex
            direction="column"
            justify="space-between"
            width="100%" // Ensure flex container takes full width
          >
            <Flex
              className="programs-table__filter-row"
              height="40px"
              width="100%"
              margin="0"
              marginBottom="15px"
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Flex
                gap="16px"
                alignItems="center"
              >
                <Button
                  id="programButton"
                  display="flex"
                  gap="0.25rem"
                  onClick={() => {
                    navigate("/programs");
                  }}
                  width="119px"
                  height="40px"
                  borderRadius="6px"
                  background="#EDF2F7"
                  _hover={{ background: "#E2E8F0" }}
                >
                  <Icon
                    as={BackIcon}
                    width="16px"
                    height="16px"
                  />
                  <Text
                    color="#2D3748"
                    fontFamily="Inter"
                    fontSize="14px"
                    fontStyle="normal"
                    fontWeight="700"
                    lineHeight="normal"
                    letterSpacing="0.07px"
                  >
                    Programs
                  </Text>
                </Button>
                <ArchivedFilter
                  archived={allArchivedSessions}
                  setArchivedPrograms={setFilteredArchived}
                  roomMap={roomNames}
                />
              </Flex>
              <Box flex="1" />
              <SearchBar
                handleSearch={handleSearch}
                searchQuery={searchQuery}
              />
            </Flex>
            <TableContainer>
              <Table
                variant="unstyled"
                position="relative"
                zIndex={3}
                bg="white"
              >
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
                        <ProgramSortingModal onSortChange={handleSortChange} />
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
                            <Icon
                              as={archiveCalendar}
                              width="16px"
                              height="16px"
                            />
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
                        <Icon
                          as={archiveClock}
                          width="20px"
                          height="20px"
                        />
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
                        <Icon
                          as={archiveMapPin}
                          width="20px"
                          height="20px"
                        />
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
                        <Icon
                          as={archivePaintPalette}
                          width="20px"
                          height="20px"
                        />
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
                        <Icon
                          as={archivePerson}
                          width="20px"
                          height="20px"
                        />
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
                  {loading ? (
                    <Tr>
                      <Td
                        colSpan={7}
                        textAlign="center"
                        className="td"
                      >
                        <Box
                          justifyContent="center"
                          color="gray.500"
                          fontSize="md"
                          width="100%"
                          margin="auto"
                        >
                          <Text textAlign={"center"}>
                            Loading archived programs...
                          </Text>
                        </Box>
                      </Td>
                    </Tr>
                  ) : sortedArchivedSessions.length > 0 ? (
                    currentPagePrograms.map((programSession) => (
                      <Tr
                        key={programSession.programId}
                        onClick={() => handleRowClick(programSession.programId)}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            // console.log(programSession);
                          }}
                        >
                          <ArchivedDropdown
                            programId={programSession.programId}
                            programName={programSession.programName}
                            setProgramToDelete={setProgramToDelete}
                            onOpen={onOpen}
                            setArchivedProgramSessions={setAllArchivedSessions}
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
                          color="gray.500"
                          fontSize="md"
                        >
                          <Text textAlign={"center"}>
                            {allArchivedSessions.length > 0
                              ? "No matching programs found. Try adjusting your search."
                              : "No archived program or session data to display."}
                          </Text>
                        </Box>
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </TableContainer>
          </Flex>
        </Box>
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
      <Modal
        isOpen={isOpen}
        onClose={onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize={"16px"}
            fontFamily={"Inter"}
            fontWeight={"700"}
          >
            Delete Program?
          </ModalHeader>
          <ModalCloseButton _hover={{ bg: "#EDF2F7" }} />
          <ModalBody>
            <Text
              fontSize={"14px"}
              fontWeight={"500"}
              fontFamily={"Inter"}
            >
              This program will be permanently deleted from Archives.
            </Text>
          </ModalBody>

          <ModalFooter
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
            }}
          >
            <Button
              variant="ghost"
              onClick={onClose}
              backgroundColor={"#EDF2F7"}
              _hover={{ bg: "#E2E8F0" }}
              borderRadius={"6px"}
              padding={"0px 16px"}
              gap={"4px"}
            >
              <Text
                fontSize={"14px"}
                fontFamily={"Inter"}
                fontWeight={"500"}
              >
                Exit
              </Text>
            </Button>
            <Button
              colorScheme="red"
              backgroundColor={"#90080F"}
              gap={"4px"}
              _hover={{ bg: "#71060C" }}
              onClick={() => {
                handleDelete(programtoDelete);
              }}
            >
              <Text
                fontSize={"14px"}
                fontFamily={"Inter"}
                fontWeight={"500"}
              >
                Confirm
              </Text>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Navbar>
  );
};
