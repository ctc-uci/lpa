import React, { useCallback, useEffect, useMemo, useState } from "react";

import { CancelIcon } from "../../assets/CancelIcon";
import { EmailIcon } from "../../assets/EmailIcon";
import { EyeIcon } from "../../assets/EyeIcon";
import { InfoIconRed } from "../../assets/InfoIconRed";
import { LocationIcon } from "../../assets/LocationIcon";
import { PaintPaletteIcons } from "../../assets/PaintPaletteIcon";
import { ProfileIcon } from "../../assets/ProfileIcon";
import { RepeatIcon } from "../../assets/RepeatIcon";

import "./Program.css";

import { ChevronLeftIcon } from "@chakra-ui/icons";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Box,
  Button,
  Card,
  CardBody,
  Checkbox,
  Container,
  Flex,
  FormControl,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
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
  Textarea,
  Th,
  Thead,
  Tr,
  useDisclosure,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";

import {
  Document,
  Page,
  PDFDownloadLink,
  Text as PDFText,
  View as PDFView,
  StyleSheet,
} from "@react-pdf/renderer";
import { EllipsisIcon, Info, UserIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { ArchiveIcon } from "../../assets/ArchiveIcon";
import { CalendarIcon } from "../../assets/CalendarIcon";
import { EditIcon } from "../../assets/EditIcon";
import clockSvg from "../../assets/icons/clock.svg";
import personSvg from "../../assets/icons/person.svg";
import {
  archiveCalendar,
  archiveClock,
  archiveMapPin,
  DollarIcon,
  DownloadIcon,
  filterButton,
  filterDateCalendar,
  sessionsCalendar,
  sessionsEllipsis,
  sessionsFilterClock,
  sessionsFilterMapPin,
  summaryIcon,
} from "../../assets/icons/ProgramIcons";
import { ReactivateIcon } from "../../assets/ReactivateIcon";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { ArchivedDropdown } from "../archivedDropdown/ArchivedDropdown";
import { CancelProgram } from "../cancelModal/CancelProgramComponent";
import { EditCancelPopup } from "../cancelModal/EditCancelPopup";
import DateSortingModal from "../filters/DateFilter";
import { SearchBar } from "../searchBar/SearchBar";

const ClockIcon = React.memo(() => (
  <img
    src={clockSvg}
    alt="Clock"
  />
));

const PersonIcon = React.memo(() => (
  <img
    src={personSvg}
    alt="Person"
  />
));

export const ProgramSummary = ({
  program,
  sessions,
  bookingInfo,
  isArchived,
  setIsArchived,
  eventId,
}) => {
  const { backend } = useBackendContext();
  const navigate = useNavigate();
  const {
    isOpen: modalIsOpen,
    onOpen: modalOnOpen,
    onClose: modalOnClose,
  } = useDisclosure();
  const [repeatChoice, setRepeatChoice] = useState();
  const [lastBooking, setLastBooking] = useState();
  const [startDay, setStartDay] = useState();
  const [lastDay, setLastDay] = useState();
  const [dayTimePattern, setDayTimePattern] = useState();

  const {
    isOpen: popoverIsOpen,
    onOpen: popoverOnOpen,
    onClose: popoverOnClose,
  } = useDisclosure();

  const exit = () => {
    navigate("/programs");
  };

  const toEditProgram = () => {
    navigate("/programs/edit/" + eventId);
  };
  const [selectedAction, setSelectedAction] = useState("Archive");
  const [selectedIcon, setSelectedIcon] = useState(ArchiveIcon);

  const handleSelect = (action, iconSrc) => {
    setSelectedAction(action);
    setSelectedIcon(iconSrc);
  };
  //const [loading, setLoading] = useState(false);

  const formatTimeString = (timeString) => {
    if (!timeString) return "";
    if (timeString.includes(":")) {
      const [hours, minutes] = timeString.split(":");
      const hour = parseInt(hours, 10);
      const period = hour >= 12 ? "pm" : "am";
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${displayHour}:${minutes} ${period}`;
    }
    return timeString;
  };

  const handleEdit = () => {
    navigate(`/programs/edit/${program[0].id}`);
  };

  const setArchived = async (boolean) => {
    await backend.put(`/programs/` + eventId, { archived: boolean });
  };

  const duplicateProgram = async () => {
    const eventResponse = await backend.get("/events/allInfo/" + eventId);
    console.log(eventResponse);
    const eventName = eventResponse.data[0].eventname;
    const generalInformation = eventResponse.data[0].eventdescription;

    const dates = [...new Set(eventResponse.data.map((item) => item.date))];
    const locationId = eventResponse.data[0].roomId;
    const startTime = eventResponse.data[0].startTime
      .split(":")
      .slice(0, 2)
      .join(":");
    const endTime = eventResponse.data[0].endTime
      .split(":")
      .slice(0, 2)
      .join(":");

    const instructors = Array.from(
      new Map(
        eventResponse.data
          .filter((instructor) => instructor.clientrole === "instructor")
          .map((instructor) => [
            instructor.email,
            {
              id: instructor.clientId,
              name: instructor.clientname,
              email: instructor.email,
            },
          ])
      ).values()
    );

    const payees = Array.from(
      new Map(
        eventResponse.data
          .filter((client) => client.clientrole === "payee")
          .map((client) => [
            client.email,
            {
              id: client.clientId,
              name: client.clientname,
              email: client.email,
            },
          ])
      ).values()
    );

    const eventInfo = {
      name: "[Unarchived] " + eventName,
      description: generalInformation,
    };

    const response = await backend.post("/events", eventInfo);
    const newEventId = response.data.id;
    for (const date of dates) {
      const bookingInfo = {
        event_id: newEventId,
        room_id: locationId,
        start_time: startTime,
        end_time: endTime,
        date: date,
        archived: false,
      };
      await backend.post("/bookings", bookingInfo);
    }
    console.log("bookingInfo ", bookingInfo.date);
    if (bookingInfo) {
      setLastBooking(bookingInfo);
    }

    console.log("event response ", response.data.id);
    const duplicateId = response.data.id;

    for (const instructor of instructors) {
      const instructorInfo = {
        eventId: newEventId,
        clientId: instructor.id,
        role: "instructor",
      };
      await backend.post("/assignments", instructorInfo);
    }

    for (const payee of payees) {
      const payeeInfo = {
        eventId: newEventId,
        clientId: payee.id,
        role: "payee",
      };
      await backend.post("/assignments", payeeInfo);
    }

    navigate("/programs/" + duplicateId);
  };

  function findDateTimePattern(bookings) {
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const pattern = {};
    let lastDate = null;

    bookings.forEach((booking) => {
      const dateObj = new Date(booking.date);
      const day = dayNames[dateObj.getUTCDay()];
      const formattedStartTime = formatTime(booking.startTime);
      const formattedEndTime = formatTime(booking.endTime);

      // Initialize array if not exists
      if (!pattern[day]) {
        pattern[day] = new Set();
      }

      // Record time slot
      pattern[day].add(`${formattedStartTime} - ${formattedEndTime}`);

      // Update last date
      if (!lastDate || dateObj > new Date(lastDate)) {
        lastDate = booking.date;
      }
    });

    // Convert Sets to Arrays for readability
    const readablePattern = {};
    for (const [day, times] of Object.entries(pattern)) {
      readablePattern[day] = Array.from(times);
    }

    return {
      pattern: readablePattern,
      lastDate: lastDate
        ? new Date(lastDate).toISOString().split("T")[0]
        : null,
    };
  }

  function getDayOfWeek(date) {
    const daysMap = ["Sun.", "Mon.", "Tues.", "Wed.", "Thurs.", "Fri.", "Sat."];
    return daysMap[new Date(date).getDay()];
  }

  function shortenDayOfWeek(day) {
    const daysMap = {
      Sunday: "Sun.",
      Monday: "Mon.",
      Tuesday: "Tues.",
      Wednesday: "Wed.",
      Thursday: "Thurs.",
      Friday: "Fri.",
      Saturday: "Sat.",
    };
    return daysMap[day];
  }

  useEffect(() => {
    console.log("sessions: ", sessions);
    if (sessions) {
      const result = findDateTimePattern(sessions);
      setLastBooking(result.lastDate);
      setLastDay(getDayOfWeek(result.lastDate));

      setDayTimePattern(Object.entries(result.pattern));
      setDayTimePattern(Object.entries(result.pattern));
      if (!sessions || sessions.length < 2) setRepeatChoice("Does not repeat");

      const dates = sessions
        .map((session) => new Date(session.date))
        .sort((a, b) => a - b);

      // Calculate gaps in days
      const gaps = dates.slice(1).map((date, i) => {
        const prevDate = dates[i];
        return Math.round((date - prevDate) / (1000 * 60 * 60 * 24)); // in days
      });

      const allSameGap = gaps.every((gap) => gap === gaps[0]);

      if (allSameGap) {
        const gap = gaps[0];
        if (gap === 7) setRepeatChoice("Every week");
        if (gap >= 28 && gap <= 31) setRepeatChoice("Every month");
        if (gap >= 364 && gap <= 366) setRepeatChoice("Every year");
      }

      setRepeatChoice("Custom");
    } else {
      console.log("no sessions");
    }
  }, [sessions]);

  // Helper function to format time like "00:00:00+00" -> "00:00"
  function formatTime(timeString) {
    // Extract HH:MM from "HH:MM:SS+00"
    return timeString.split(":").slice(0, 2).join(":");
  }

  const handleDeactivate = () => {
    modalOnOpen();
  };

  const handleArchive = async () => {
    try {
      await backend.put(`/events/${program[0].id}`, {
        archived: true,
      });
      onClose();
      window.location.reload();
    } catch (error) {
      console.log("Couldn't deactivate", error);
    }
  };

  const handleConfirm = async () => {
    if (selectedAction === "Archive") {
      await handleArchive();
    } else if (selectedAction === "Delete") {
      await handleDelete();
    }
  };

  const handleDelete = async () => {
    console.log("Starting delete process...");
    console.log("Program data:", program[0]);

    if (!program[0]?.id) {
      console.error("No event ID found in program data");
      return;
    }

    try {
      await backend.delete(`/events/${program[0].id}`);
      console.log("Successfully deleted event and all related records");
      onClose();
      navigate("/programs");
    } catch (error) {
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      if (error.response?.data) {
        console.error("Server error message:", error.response.data);
      }
    }
  };

  // Default empty booking info structure
  const defaultBookingInfo = {
    nextSession: null,
    nextRoom: null,
    instructors: [],
    payees: [],
  };

  const safeBookingInfo = {
    ...defaultBookingInfo,
    ...(bookingInfo || {}),
  };

  const { nextSession, nextRoom, instructors, payees } = safeBookingInfo;

  useEffect(() => {
    setStartDay(getDayOfWeek(nextSession.date));
  }, [nextSession]);

  // Make sure program data is fetched before rendering
  if (!program || program.length === 0) {
    return (
      <Box
        minH="10vh"
        width="100%"
        py={8}
      >
        <Container
          maxW="90%"
          p={0}
        >
          <Card
            shadow="none"
            border="1px"
            borderColor="gray.300"
            borderRadius="15px"
            width="98%"
          >
            <CardBody
              m={6}
              textAlign="center"
            >
              <Heading
                size="md"
                textColor="gray.600"
              >
                No Program Available
              </Heading>
              <Text color="gray.500">
                Please select a program to view details.
              </Text>
            </CardBody>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box className="componentContainer">
      <Flex
        align="center"
        gap={2}
        id="titleContainer"
      >
        <Flex
          align="center"
          gap={2}
          width="20%"
        >
          <Icon as={summaryIcon} />
          <Text className="componentTitleText">Summary</Text>
        </Flex>
        {isArchived ? (
          <div id="archivedBlurb">
            <EyeIcon id="infoIcon" />
            <p>Viewing Archived Program</p>
          </div>
        ) : (
          <div></div>
        )}
        <Flex width="20%"></Flex>
      </Flex>
      <Container
        minW="100%"
        p={0}
      >
        <Flex>
          <Card
            shadow="none"
            border="1px"
            borderColor="gray.300"
            borderRadius="15px"
            minW="100%"
            padding={"10px"}
          >
            <CardBody>
              <Flex
                mb={6}
                justify="space-between"
                align="center"
              >
                <Flex
                  id="backProgramButton"
                  onClick={() => {
                    navigate("/programs");
                  }}
                >
                  <Flex align="center">
                    <Icon
                      as={ChevronLeftIcon}
                      boxSize={6}
                    />
                    <Text
                      fontSize="14px"
                      fontWeight="700"
                    >
                      Programs
                    </Text>
                  </Flex>
                </Flex>

                <Flex
                  align="center"
                  gap={2}
                >
                  <PDFButton leftIcon={<Icon as={DownloadIcon} />}>
                    Invoice
                  </PDFButton>
                  {!isArchived ? (
                    <EditCancelPopup
                      handleEdit={handleEdit}
                      handleDeactivate={handleDeactivate}
                      id={program[0].id}
                    />
                  ) : (
                    <ArchivedDropdown
                      programId={program[0].id}
                      programName={program[0].name}
                      onOpen={modalOnOpen}
                      setIsArchived={setIsArchived}
                    />
                  )}

                  <Modal
                    isOpen={modalIsOpen}
                    onClose={modalOnClose}
                  >
                    <ModalOverlay />
                    <ModalContent>
                      <ModalHeader>Delete Program?</ModalHeader>
                      <ModalCloseButton />
                      <ModalBody>
                        <div id="deactivateDeadlineBox">
                          <Box
                            backgroundColor="#F4E6E7"
                            borderRadius="15px"
                            id="deactivateDeadlineInnerBox"
                          >
                            <InfoIconRed
                              fontSize="2xl"
                              id="infoIcon"
                            />
                            <p id="deactivateDeadlineText">
                              Program will be permanently deleted from Archives.
                            </p>
                          </Box>
                        </div>
                      </ModalBody>

                      <ModalFooter
                        style={{ display: "flex", justifyContent: "flex-end" }}
                      >
                        <Button
                          variant="ghost"
                          onClick={modalOnClose}
                        >
                          Exit
                        </Button>
                        <Button
                          colorScheme="red"
                          mr={3}
                          id="deactivateConfirm"
                          onClick={() => {
                            handleDelete();
                            exit();
                          }}
                        >
                          Confirm
                        </Button>
                      </ModalFooter>
                    </ModalContent>
                  </Modal>
                </Flex>
              </Flex>

              <Stack spacing={6}>
                <Heading
                  as="h2"
                  fontSize="24px"
                >
                  {program[0]?.name || "Untitled Program"}
                </Heading>
                <Flex
                  align="center"
                  gap={2}
                >
                  <Icon
                    as={RepeatIcon}
                    size="md"
                  />
                  {repeatChoice}
                </Flex>

                <Flex
                  align="center"
                  gap={2}
                >
                  <Icon as={ClockIcon} />
                  <Stack>
                    {/* {nextSession
                      ? `${formatTimeString(nextSession.startTime)} - ${formatTimeString(nextSession.endTime)}`
                      : "No session scheduled"} */}
                    {dayTimePattern
                      ? dayTimePattern.map(([day, times]) => (
                          <Flex
                            key={day}
                            width="25rem"
                          >
                            <Text width="10rem">
                              {formatTimeString(times[0].split(" - ")[0])} -{" "}
                              {formatTimeString(times[0].split(" - ")[1])}
                            </Text>
                            <Text
                              key={day}
                              width="12rem"
                            >
                              {" "}
                              on {shortenDayOfWeek(day)}
                            </Text>
                          </Flex>
                        ))
                      : "No session scheduled"}
                  </Stack>
                </Flex>
                <Flex
                  align="center"
                  gap={2}
                >
                  <Icon as={CalendarIcon} />
                  <HStack spacing=".5rem">
                    <Text>Starts on</Text>
                    <Text
                      as="span"
                      fontWeight="500"
                    >
                      {startDay}
                    </Text>
                    <Text
                      as="span"
                      fontWeight="500"
                    >
                      {nextSession?.date
                        ? new Date(nextSession.date).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                            }
                          )
                        : "No date available"}
                    </Text>
                    <Text>and ends on</Text>
                    <Text
                      as="span"
                      fontWeight="500"
                    >
                      {lastDay}
                    </Text>
                    <Text
                      as="span"
                      fontWeight="500"
                    >
                      {lastBooking
                        ? new Date(lastBooking).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          })
                        : "No date available"}
                    </Text>
                  </HStack>
                </Flex>
                <Flex
                  align="center"
                  gap={2}
                >
                  <Icon as={PaintPaletteIcons} />
                  <Text>
                    {payees?.length > 0
                      ? payees.map((payee) => payee.clientName).join(", ")
                      : "No payees"}
                  </Text>
                </Flex>
                <Flex
                  align="center"
                  gap={2}
                >
                  <Icon as={ProfileIcon} />
                  <Text>
                    {instructors?.length > 0
                      ? instructors
                          .map((instructor) => instructor.clientName)
                          .join(", ")
                      : "No instructors"}
                  </Text>
                </Flex>

                <Flex
                  spacing={2}
                  gap={6}
                >
                  <Flex
                    align="center"
                    gap={2}
                  >
                    <Icon as={EmailIcon} />
                    <Text>
                      {payees?.length > 0
                        ? [...(payees || [])]
                            .map((person) => person?.clientEmail)
                            .filter(Boolean)
                            .join(", ")
                        : "No emails available"}
                    </Text>
                  </Flex>
                </Flex>

                <Flex
                  align="center"
                  gap={8}
                >
                  <Flex
                    align="center"
                    gap={2}
                  >
                    <Icon as={LocationIcon} />
                    <Text>{nextRoom?.name || "-"}</Text>
                  </Flex>
                  <Flex
                    align="center"
                    gap={2}
                  >
                    <DollarIcon />
                    <Text>{nextRoom?.rate || "-.--"}</Text>
                    <Text>/ hour</Text>
                  </Flex>
                </Flex>

                <Stack spacing={6}>
                  <Box spacing={2}>
                    <Heading size="md">Room Description</Heading>
                    <Text
                      text="xs"
                      mt={4}
                    >
                      {nextRoom?.description || "No description available"}
                    </Text>
                  </Box>

                  <Box>
                    <Heading size="md">Class Description</Heading>
                    <Text
                      text="xs"
                      mt={4}
                    >
                      {program[0]?.description || "No description available"}
                    </Text>
                  </Box>
                </Stack>
              </Stack>
            </CardBody>
          </Card>
        </Flex>
      </Container>
      <CancelProgram
        id={program[0].id}
        setPrograms={null}
        onOpen={modalOnOpen}
        isOpen={modalIsOpen}
        onClose={modalOnClose}
        type={"Program"}
      />
    </Box>
  );
};

export const Sessions = ({
  programName,
  sessions,
  rooms,
  instructors,
  payees,
  isArchived,
  setIsArchived,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const [programToDelete, setProgramToDelete] = useState(null);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [timeRange, setTimeRange] = useState({ start: "", end: "" });
  const [status, setStatus] = useState("All");
  const [selectedRoom, setSelectedRoom] = useState("All");
  const [programs, setPrograms] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState("date"); // Default to sorting by date
  const [sortOrder, setSortOrder] = useState("asc"); // Default to ascending order
  // At the top of your Sessions component where other state variables are defined

  const roomsMap = useMemo(() => {
    return rooms ?? new Map();
  }, [rooms]);

  const handleEdit = useCallback(
    (id, e) => {
      e.stopPropagation();
      navigate(`/bookings/edit/${id}`);
    },
    [navigate]
  );

  const handleDeactivate = useCallback(
    (id) => {
      setProgramToDelete(id);
      onOpen();
    },
    [onOpen]
  );

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

  // Add this effect to handle both filtering and sorting whenever relevant dependencies change
  const filterSessions = () => {
    // Step 1: Filter the sessions
    return sessions.filter((session) => {
      const sessionDate = new Date(session.date);
      const sessionStartTime = session.startTime;
      const sessionEndTime = session.endTime;

      const isDateInRange =
        (!dateRange.start || new Date(dateRange.start) <= sessionDate) &&
        (!dateRange.end || sessionDate <= new Date(dateRange.end));
      const isTimeInRange =
        (!timeRange.start || timeRange.start <= sessionStartTime) &&
        (!timeRange.end || sessionEndTime <= timeRange.end);
      const isStatusMatch =
        status === "All" ||
        (status === "Active" && !hasTimePassed(session.date)) ||
        (status === "Past" && hasTimePassed(session.date));
      const isRoomMatch =
        selectedRoom === "All" || roomsMap.get(session.roomId) === selectedRoom;

      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        programName.toLowerCase().includes(searchLower) ||
        roomsMap.get(session.roomId).toLowerCase().includes(searchLower) ||
        (instructors &&
          instructors.some((instructor) =>
            instructor.clientName.toLowerCase().includes(searchLower)
          )) ||
        (payees &&
          payees.some((payee) =>
            payee.clientName.toLowerCase().includes(searchLower)
          )) ||
        session.date.includes(searchQuery) ||
        formatDate(session.date).includes(searchQuery) ||
        formatTime(sessionStartTime).includes(searchQuery) ||
        sessionStartTime.includes(searchQuery) ||
        sessionEndTime.includes(searchQuery);
      return (
        isDateInRange &&
        isTimeInRange &&
        isStatusMatch &&
        isRoomMatch &&
        matchesSearch
      );
    });
  };

  const filteredAndSortedSessions = useMemo(() => {
    if (
      !programName ||
      !sessions ||
      !roomsMap ||
      !programName ||
      !instructors ||
      !payees
    )
      return;
    // Step 2: Sort the filtered sessions
    const filtered = filterSessions();
    const sorted = [...filtered];

    if (sortKey === "title") {
      sorted.sort((a, b) =>
        sortOrder === "asc"
          ? a.programName.localeCompare(b.programName)
          : b.programName.localeCompare(a.programName)
      );
    } else if (sortKey === "date") {
      sorted.sort((a, b) => {
        const aInvalid = !a.date || a.date === "N/A";
        const bInvalid = !b.date || b.date === "N/A";

        if (aInvalid && bInvalid) return 0;
        if (aInvalid) return 1; // Push invalid dates to the end
        if (bInvalid) return -1;

        const dateA = new Date(a.date);
        const dateB = new Date(b.date);

        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      });
    }

    // Step 3: Set the filtered and sorted sessions
    // setFilteredAndSortedSessions(sorted);
    return sorted;
  }, [
    dateRange,
    timeRange,
    status,
    selectedRoom,
    sessions,
    instructors,
    payees,
    rooms,
    sortKey,
    sortOrder,
    searchQuery,
  ]);

  // Function to update sorting
  const handleSortChange = (key, order) => {
    setSortKey(key);
    setSortOrder(order);
  };

  const hasTimePassed = (dateTimeString) => {
    // Function to determine color of status circle
    const givenTime = new Date(dateTimeString);
    const currentTime = new Date();
    return currentTime > givenTime;
  };

  // Make sure sessions data is fetched before rendering
  // if (!sessions || sessions.length === 0) {
  //   return <div>Loading...</div>; // Possibly change loading indicator
  // }
  // Make sure rooms is fetched before rendering
  if (!rooms || roomsMap.length === 0) {
    return <div>Loading...</div>; // Possibly change loading indicator
  }

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

  return (
    <>
      <CancelProgram
        id={programToDelete}
        setPrograms={setPrograms}
        onOpen={onOpen}
        isOpen={isOpen}
        onClose={onClose}
        type={"Booking"}
      />
      <Box className="componentContainer">
        <Flex
          align="center"
          gap={2}
          mb={4}
        >
          <Icon as={sessionsCalendar} />
          <Text className="componentTitleText">Sessions</Text>
        </Flex>
        <Card
          shadow="none"
          border="1px"
          borderColor="gray.300"
          borderRadius="15px"
        >
          <CardBody
            m={0}
            p={6}
          >
            <Flex direction="column">
              <Flex
                gap="12px"
                height="auto"
                justifyContent="space-between"
              >
                <Flex gap="12px">
                  <Button
                    fontWeight="bold"
                    fontSize="14px"
                    borderRadius="6px"
                    backgroundColor="#EDF2F7"
                    height="38px"
                    px="20px"
                    _hover={{ bg: "#e0e6ed" }}
                  >
                    Select
                  </Button>
                  <Popover>
                    <PopoverTrigger>
                      <Button
                        color="#1e293b"
                        fontWeight="bold"
                        backgroundColor="#EDF2F7"
                        variant="outline"
                        minWidth="auto"
                        height="38px"
                        border="none"
                      >
                        <Box
                          display="flex"
                          flexDirection="row"
                          alignItems="center"
                          gap="5px"
                        >
                          <Icon as={filterButton} />
                          <Text fontSize="sm"> Filters </Text>
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
                                      onClick={() => setStatus("All")}
                                      backgroundColor={
                                        status === "All" ? "#EDEDFD" : "#F6F6F6"
                                      }
                                      borderColor={
                                        status === "All" ? "#4E4AE7" : "#767778"
                                      }
                                    >
                                      All
                                    </Button>
                                    <Button
                                      borderRadius="30px"
                                      borderWidth="1px"
                                      minWidth="auto"
                                      height="20%"
                                      onClick={() => setStatus("Active")}
                                      backgroundColor={
                                        status === "Active"
                                          ? "#EDEDFD"
                                          : "#F6F6F6"
                                      }
                                      borderColor={
                                        status === "Active"
                                          ? "#4E4AE7"
                                          : "#767778"
                                      }
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
                                      onClick={() => setStatus("Past")}
                                      backgroundColor={
                                        status === "Past"
                                          ? "#EDEDFD"
                                          : "#F6F6F6"
                                      }
                                      borderColor={
                                        status === "Past"
                                          ? "#4E4AE7"
                                          : "#767778"
                                      }
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
                                    {Array.from(roomsMap.values()).map(
                                      (room, index) => (
                                        <WrapItem key={index}>
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
                </Flex>
                <SearchBar
                  handleSearch={handleSearch}
                  searchQuery={searchQuery}
                />
              </Flex>
              <TableContainer>
                <Table variant="unstyled">
                  <Thead
                    borderBottom="1px"
                    color="#D2D2D2"
                  >
                    <Tr>
                      <Th pl={0}>
                        <Box
                          className="sessionsColumnContainer"
                          justifyContent="left"
                        >
                          <Text className="sessionsColumnTitle">STATUS</Text>
                        </Box>
                      </Th>
                      <Th>
                        <Box className="sessionsColumnContainer">
                          <Flex
                            justifyContent="space-between"
                            width="9rem"
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
                                  className="sessionsColumnTitle"
                                  textTransform="none"
                                >
                                  DATE
                                </Text>
                              </Box>
                            </Flex>
                            <Box>
                              <DateSortingModal
                                onSortChange={handleSortChange}
                              />
                            </Box>
                          </Flex>
                        </Box>
                      </Th>
                      <Th>
                        <Box className="sessionsColumnContainer">
                          <Icon as={archiveClock} />
                          <Text
                            className="sessionsColumnTitle"
                            textTransform="none"
                          >
                            UPCOMING TIME
                          </Text>
                        </Box>
                      </Th>
                      <Th>
                        <Box className="sessionsColumnContainer">
                          <Icon as={archiveMapPin} />
                          <Text
                            className="sessionsColumnTitle"
                            textTransform="none"
                          >
                            ROOM
                          </Text>
                        </Box>
                      </Th>
                      <Th>
                        <HStack>
                          <PaintPaletteIcons />
                          <Text
                            className="sessionsColumnTitle"
                            textTransform="none"
                          >
                            LEAD ARTIST(S)
                          </Text>
                        </HStack>
                      </Th>
                      <Th>
                        <HStack>
                          <PersonIcon />
                          <Text
                            className="sessionsColumnTitle"
                            textTransform="none"
                          >
                            PAYER(S)
                          </Text>
                        </HStack>
                      </Th>
                      <Th> </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredAndSortedSessions !== undefined &&
                    filteredAndSortedSessions.length > 0 ? (
                      filteredAndSortedSessions.map((session) => (
                        <Tr key={session.id}>
                          <Td pl={0}>
                            <Box
                              display="flex"
                              justifyContent="left"
                              ml="1.5rem"
                            >
                              <Box
                                height="14px"
                                width="14px"
                                borderRadius="50%"
                                bg={
                                  hasTimePassed(session.date)
                                    ? "#DAB434"
                                    : "#0C824D"
                                }
                              ></Box>
                            </Box>
                          </Td>
                          <Td>
                            <Box className="sessionData">
                              {formatDate(session.date)}
                            </Box>
                          </Td>
                          <Td>
                            <Box className="sessionData">
                              {formatTime(session.startTime)} -{" "}
                              {formatTime(session.endTime)}
                            </Box>
                          </Td>
                          <Td>
                            <Box className="sessionData">
                              {roomsMap.get(session.roomId)}
                            </Box>
                          </Td>
                          <Td>
                            <Box className="sessionData ellipsis-box">
                              {instructors?.length > 0
                                ? instructors
                                    .map((i) => i.clientName)
                                    .join(", ")
                                : "No instructors"}
                            </Box>
                          </Td>
                          <Td>
                            <Box className="sessionData ellipsis-box">
                              {payees?.length > 0 ? payees.map((p) => p.clientName).join(", "): "No payees"}
                            </Box>
                          </Td>
                          <Td>
                            <EditCancelPopup
                              handleEdit={handleEdit}
                              handleDeactivate={handleDeactivate}
                              id={session.id}
                            />
                          </Td>
                        </Tr>
                      ))
                    ) : (
                      <Tr>
                        <Td>
                          <Box
                            textAlign="center"
                            py={6}
                            color="gray.500"
                            fontSize="md"
                            width={"300px"}
                          >
                            No sessions available
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
    </>
  );
};

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: "#ffffff",
  },
  section: {
    margin: 10,
    padding: 20,
    borderRadius: 5,
    backgroundColor: "#f8f9fa",
    borderBottom: "1px solid #eee",
  },
  header: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2c3e50",
  },
  row: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "center",
  },
  label: {
    width: 100,
    fontSize: 12,
    color: "#666",
    marginRight: 10,
  },
  value: {
    flex: 1,
    fontSize: 12,
    color: "#333",
  },
  dateTime: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  timeBlock: {
    flex: 1,
  },
});

const MyDocument = ({ bookingData }) => {
  return (
    <Document>
      <Page
        size="A4"
        style={styles.page}
      >
        {bookingData &&
          bookingData.map((element) => (
            <PDFView
              style={styles.section}
              key={element.id}
            >
              <PDFText>Archived: {element.archived}</PDFText>
              <PDFText>Date: {element.date}</PDFText>
              <PDFText>Event ID: {element.eventId}</PDFText>
              <PDFText>DB ID: {element.id}</PDFText>
              <PDFText>Room ID: {element.roomId}</PDFText>
              <PDFText>Start Time: {element.startTime}</PDFText>
              <PDFText>End Time: {element.endTime}</PDFText>
            </PDFView>
          ))}
      </Page>
    </Document>
  );
};

const PDFButton = () => {
  const { backend } = useBackendContext();
  const [bookingData, setBookingData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await backend.get("/bookings");
        setBookingData(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [backend]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <PDFDownloadLink
      className="invoiceButton"
      document={<MyDocument bookingData={bookingData} />}
      fileName="bookingdata.pdf"
    >
      <DownloadIcon />
      Invoice
    </PDFDownloadLink>
  );
};
