import React, { useCallback, useEffect, useMemo, useState } from "react";

import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import {
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

import { ArchiveIcon } from "../../assets/ArchiveIcon";
import { ArtistIcon } from "../../assets/ArtistsIcon";
import { CancelIcon } from "../../assets/CancelIcon";
import { ClockFilled } from "../../assets/ClockFilled";
import { CustomOption } from "../../assets/CustomOption";
import { DollarBill } from "../../assets/DollarBill";
import { EmailIcon } from "../../assets/EmailIcon";
import { EyeIcon } from "../../assets/EyeIcon";
import { FilledOutCalendar } from "../../assets/FilledOutCalendar";
import clockSvg from "../../assets/icons/clock.svg";
import {
  archiveCalendar,
  archiveClock,
  archiveMapPin,
  DollarIcon,
  DownloadIcon,
  filterButton,
  filterDateCalendar,
  sessionsCalendar,
  sessionsClock,
  sessionsEllipsis,
  sessionsFilterClock,
  sessionsFilterMapPin,
  sessionsMapPin,
  summaryIcon,
} from "../../assets/icons/ProgramIcons";
import { InfoIconRed } from "../../assets/InfoIconRed";
import { LocationIcon } from "../../assets/LocationIcon";
import { LocationPin } from "../../assets/LocationPin";
import { PaintPaletteIcons } from "../../assets/PaintPaletteIcon";
import { PersonIcon } from "../../assets/PersonIcon";
import { ProfileIcon } from "../../assets/ProfileIcon";
import { ProgramEmailIcon } from "../../assets/ProgramEmailIcon";
import { ProgramsCalendarIcon } from "../../assets/ProgramsCalendarIcon";
import { ReactivateIcon } from "../../assets/ReactivateIcon";
import { RepeatIcon } from "../../assets/RepeatIcon";
import { SessionsBookmark } from "../../assets/SessionsBookmark";

import "./Program.css";

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

import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { ArchivedDropdown } from "../archivedDropdown/ArchivedDropdown";
import { CancelProgram } from "../cancelModal/CancelProgramComponent";
import { EditCancelPopup } from "../cancelModal/EditCancelPopup";
import DateSortingModal from "../filters/DateFilter";
import { ProgramFilter } from "../filters/ProgramsFilter";
import { SessionFilter } from "../filters/SessionsFilter";
import { SearchBar } from "../searchBar/SearchBar";
import { CancelSessionModal } from "./CancelSessionModal";
import { DateRange } from "./DateRange";
import { WeeklyRepeatingSchedule } from "./WeeklyRepeatingSchedule";

const ClockIcon = React.memo(() => (
  <img
    src={clockSvg}
    alt="Clock"
  />
));

const truncateNames = (name, maxLength = 30) => {
  if (!name) return "N/A";
  return name.length > maxLength ? `${name.substring(0, maxLength)}...` : name;
};

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

  const getFilteredAndSortedSessions = () => {
    if (!sessions || sessions.length === 0) return [];

    const filteredSessions = sessions.filter((session) => !session.archived);

    const sortedSessions = [...filteredSessions].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA - dateB;
    });

    return sortedSessions;
  };

  const filteredAndSortedSessions = getFilteredAndSortedSessions();
  const {
    isOpen: popoverIsOpen,
    onOpen: popoverOnOpen,
    onClose: popoverOnClose,
  } = useDisclosure();

  const exit = () => {
    if (isArchived) {
      navigate("/programs/archived");
    }
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
    await backend.put(`/programs/updateSessionArchive/` + eventId, {
      archived: boolean,
    });
  };

  const duplicateProgram = async () => {
    const eventResponse = await backend.get("/events/allInfo/" + eventId);
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
                <Button
                  display="flex"
                  height="40px"
                  padding="0px 16px"
                  justifyContent="center"
                  alignItems="center"
                  gap="4px"
                  fontSize="14px"
                  fontWeight="700"
                  borderRadius="6px"
                  onClick={exit}
                >
                  <Icon
                    as={ChevronLeftIcon}
                    boxSize={5}
                  />{" "}
                  {isArchived ? "Archives" : "Programs"}
                </Button>
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
                  size="md"
                  textColor="gray.600"
                  fontFamily="Inter"
                  fontSize="24px"
                  fontStyle="normal"
                  fontWeight="700"
                  lineHeight="normal"
                  coilor="#2D3748"
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
                  align="flex-start"
                  gap={4}
                  color="gray.700"
                  direction="column"
                  alignSelf="stretch"
                >
                  <Flex
                    gap={2}
                    textAlign={"center"}
                    alignContent={"center"}
                    direction={"row"}
                  >
                    <CustomOption />
                    <Text>Custom</Text>
                  </Flex>
                  <Flex
                    alignItems="center"
                    gap="2"
                  >
                    <ClockFilled />
                    <Flex direction="column">
                      <WeeklyRepeatingSchedule
                        sessions={filteredAndSortedSessions}
                      />
                    </Flex>
                  </Flex>
                  <Flex
                    direction="row"
                    alignItems="center"
                    gap="2"
                  >
                    <ProgramsCalendarIcon />
                    <DateRange sessions={filteredAndSortedSessions} />
                  </Flex>
                  <Flex
                    align="center"
                    gap={2}
                  >
                    <ArtistIcon />
                    <Text
                      color="#2D3748"
                      fontWeight="500"
                    >
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

                  <Flex
                    spacing={2}
                    gap={6}
                  >
                    <Flex
                      align="center"
                      gap={2}
                    >
                      <ProgramEmailIcon />
                      <Text
                        color="#2D3748"
                        fontWeight="500"
                      >
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
                    gap={12}
                  >
                    <Flex
                      align="center"
                      gap={2}
                    >
                      <LocationPin />
                      <Text
                        color="#2D3748"
                        fontWeight="500"
                      >
                        {nextRoom?.name || "-"}
                      </Text>
                    </Flex>
                    <Flex
                      align="center"
                      gap={2}
                    >
                      <DollarBill />
                      <Text
                        color="#2D3748"
                        fontWeight="500"
                      >
                        {nextRoom?.rate || "-.--"}
                      </Text>
                      <Text color="gray.600">/ hour</Text>
                    </Flex>
                  </Flex>
                  <Stack spacing={6}>
                    <Box spacing={2}>
                      <Heading
                        size="md"
                        textColor="gray.600"
                        fontFamily="Inter"
                        fontSize="16px"
                        fontWeight="700"
                        lineHeight="normal"
                      >
                        Room Description
                      </Heading>
                      <Text
                        color="#2D3748"
                        fontWeight="500"
                        mt={4}
                        fontSize={14}
                      >
                        {nextRoom?.description || "No description available"}
                      </Text>
                    </Box>

                    <Box>
                      <Heading
                        size="md"
                        textColor="gray.600"
                        fontSize="16px"
                        fontStyle="normal"
                        fontWeight="700"
                      >
                        Program Description
                      </Heading>
                      <Text
                        color="#2D3748"
                        fontWeight="500"
                        mt={4}
                        fontSize={14}
                      >
                        {program[0]?.description || "No description available"}
                      </Text>
                    </Box>
                  </Stack>
                </Flex>
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
  refreshSessions,
}) => {
  const { backend } = useBackendContext();
  const navigate = useNavigate();
  const [programToDelete, setProgramToDelete] = useState(null);
  const {
    isOpen: cancelModalIsOpen,
    onOpen: openCancelModal,
    onClose: closeCancelModal,
  } = useDisclosure();

  const handleConfirmCancel = async (action, reason, waivedFees) => {
    // Create an array of session IDs
    const sessionIds = selectedSessions;

    // Close the modal first to improve perceived performance
    closeCancelModal();

    try {
      if (action === "Archive") {
        // Call the batch archive endpoint
        await batchArchiveSessions(sessionIds, reason, waivedFees);
      } else if (action === "Delete") {
        // Call the batch delete endpoint
        await batchDeleteSessions(sessionIds, reason);
      }

      // Reset selected sessions
      setSelectedSessions([]);
      setIsSelected(false);

      // Refresh the sessions data
      refreshSessions();
    } catch (error) {
      console.error("Error handling session action:", error);
    }
  };
  const batchArchiveSessions = async (sessionIds, reason, waivedFees) => {
    try {
      const response = await backend.post("/bookings/batch/archive", {
        sessionIds,
        reason,
        waivedFees,
      });

      if (response.data.result === "success") {
        console.log(`Successfully archived ${sessionIds.length} sessions`);
        setSelectedSessions([]);
        setIsSelected(false);
      } else {
        console.error("Error archiving sessions:", response.data.message);
      }
    } catch (error) {
      console.error("Failed to archive sessions:", error);
    }
  };

  const batchDeleteSessions = async (sessionIds, reason) => {
    try {
      const response = await backend.delete("/bookings/batch/delete", {
        data: { sessionIds, reason }, // For DELETE requests, axios requires data in a 'data' property
      });

      if (response.data.result === "success") {
        console.log(`Successfully deleted ${sessionIds.length} sessions`);
        setSelectedSessions([]);
        setIsSelected(false);
      } else {
        console.error("Error deleting sessions:", response.data.message);
      }
    } catch (error) {
      console.error("Failed to delete sessions:", error);
    }
  };

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isSelected, setIsSelected] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [timeRange, setTimeRange] = useState({ start: "", end: "" });
  const [status, setStatus] = useState("All");
  const [selectedRoom, setSelectedRoom] = useState("All");
  const [programs, setPrograms] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState("date"); // Default to sorting by date
  const [sortOrder, setSortOrder] = useState("asc"); // Default to ascending order
  // At the top of your Sessions component where other state variables are defined
  const [filteredAndSortedSessions, setFilteredAndSortedSessions] = useState(
    []
  );

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

  const [filteredSessions, setFilteredSessions] = useState([]);

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
  };

  console.log(filteredAndSortedSessions);
  const [sessionMap, setSessionMap] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalSessions = filteredAndSortedSessions?.length || 0;
  const totalPages = Math.ceil(totalSessions / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalSessions);

  const currentPageSessions =
    filteredAndSortedSessions?.slice(startIndex, endIndex) || [];

  const [selectMenuOpen, setSelectMenuOpen] = useState(false);
  const [selectOption, setSelectOption] = useState("Select");
  const [selectedSessions, setSelectedSessions] = useState([]);

  console.log("Selected Sessions:", selectedSessions);

  const handleSessionSelection = (sessionId) => {
    setSelectedSessions((prev) => {
      if (prev.includes(sessionId)) {
        return prev.filter((id) => id !== sessionId);
      } else {
        return [...prev, sessionId];
      }
    });
  };

  const handleSelectOption = (option) => {
    const originalOption = option;
    setSelectOption(option);
    setSelectMenuOpen(false);

    if (option === "Select all") {
      setSelectedSessions(currentPageSessions.map((session) => session.id));
    } else if (originalOption === "Deselect") {
      // Deselect all sessions
      setSelectedSessions([]);
      setSelectOption("Select");
    }
  };

  const handleSelectAll = () => {
    if (selectedSessions.length === currentPageSessions.length) {
      setSelectedSessions([]);
    } else {
      setSelectedSessions(currentPageSessions.map((session) => session.id));
    }
  };

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

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    if (!sessions || !rooms) return;

    const newSessionMap = {};

    const filtered = sessions.filter((session) => {
      const sessionDate = new Date(session.date);
      const sessionStartTime = session.startTime;
      const sessionEndTime = session.endTime;
      newSessionMap[session.id] = session;

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
    setSessionMap(newSessionMap); // set sessionMap

    console.log(newSessionMap);
    const sorted = [...filtered];

    if (sortKey === "date") {
      sorted.sort((a, b) => {
        const aInvalid = !a.date || a.date === "N/A";
        const bInvalid = !b.date || b.date === "N/A";

        if (aInvalid && bInvalid) return 0;
        if (aInvalid) return 1;
        if (bInvalid) return -1;

        const dateA = new Date(a.date);
        const dateB = new Date(b.date);

        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      });
    }
    setFilteredAndSortedSessions(sorted);

    setCurrentPage(1);
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

  useEffect(() => {
    if (sessions && sessions.length > 0) {
      setFilteredSessions(sessions);
    }
  }, [sessions]);

  // Function to update sorting
  const handleSortChange = (key, order) => {
    setSortKey(key);
    setSortOrder(order);
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);

    const options = {
      weekday: "short",
      year: "numeric",
      month: "2-digit",
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
    const formattedHours = hours % 12 || 12;

    // Return formatted time
    return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  const hasTimePassed = (dateTimeString) => {
    // Function to determine color of status circle
    const givenTime = new Date(dateTimeString);
    const currentTime = new Date();
    return currentTime > givenTime;
  };
  if (!rooms || rooms.length === 0) {
    return <div>Loading...</div>;
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
          <SessionsBookmark />
          <Text className="componentTitleText">Sessions</Text>
        </Flex>
        <Card
          shadow="none"
          border="1px"
          borderColor="gray.300"
          borderRadius="15px"
        >
          <CardBody
            m={6}
            display="flex"
            flexDirection="column"
            // justifyContent="start"
          >
            <Flex
              direction="row"
              justify="start"
              gap={"12px"}
            >
              <Box position="relative">
                <Button
                  style={{
                    display: "flex",
                    height: "40px",
                    padding: "0px 16px",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "4px",
                    flex: "1 0 0",
                    borderRadius: "6px",
                    backgroundColor: "var(--Secondary-2-Default, #EDF2F7)",
                    color: isSelected ? "#4441C8" : "#000000", // Move the color inside the style object
                    fontFamily: "Inter",
                    fontSize: "14px",
                    fontStyle: "normal",
                    fontWeight: "700",
                    lineHeight: "normal",
                    letterSpacing: "0.07px",
                  }}
                  onClick={() => {
                    setSelectMenuOpen(!selectMenuOpen);
                    setIsSelected(true);
                  }}
                  data-select-menu="true"
                >
                  {selectOption}
                </Button>
                {selectMenuOpen && (
                  <Box
                    position="absolute"
                    top="45px"
                    left="0"
                    display="flex"
                    width="85px"
                    padding="4px"
                    flexDirection="column"
                    alignItems="flex-start"
                    gap="10px"
                    borderRadius="4px"
                    border="1px solid var(--Secondary-3, #E2E8F0)"
                    background="#FFF"
                    boxShadow="0px 1px 2px 0px rgba(0, 0, 0, 0.05)"
                    zIndex="10"
                  >
                    <Stack
                      spacing="0"
                      width="100%"
                    >
                      <Button
                        justifyContent="flex-start"
                        fontWeight="normal"
                        bg="white"
                        _hover={{ bg: "#f2f6fb" }}
                        onClick={() => handleSelectOption("Select")}
                        borderRadius="2px"
                        height="30px"
                        width="100%"
                        padding="4px 8px"
                        fontSize="14px"
                      >
                        Select
                      </Button>
                      <Button
                        justifyContent="flex-start"
                        fontWeight="normal"
                        bg="white"
                        _hover={{ bg: "#f2f6fb" }}
                        onClick={() => handleSelectOption("Select all")}
                        borderRadius="2px"
                        height="30px"
                        width="100%"
                        padding="4px 8px"
                        fontSize="14px"
                        letterSpacing={
                          selectOption === "Select all" ? "0.07px" : "normal"
                        }
                      >
                        Select all
                      </Button>
                      <Button
                        justifyContent="flex-start"
                        fontWeight="normal"
                        bg="white"
                        _hover={{ bg: "#f2f6fb" }}
                        onClick={() => {
                          setSelectOption(false);
                          handleSelectOption("Deselect");
                          setIsSelected(false);
                        }}
                        borderRadius="2px"
                        height="30px"
                        width="100%"
                        padding="4px 8px"
                        fontSize="14px"
                        color={
                          selectOption === "Deselect"
                            ? "var(--Primary-5-Default, #4441C8)"
                            : "inherit"
                        }
                        letterSpacing={
                          selectOption === "Deselect" ? "0.07px" : "normal"
                        }
                      >
                        Deselect
                      </Button>
                    </Stack>
                  </Box>
                )}
              </Box>

              {/* Cancel button - only shows when isSelected is true */}
              {isSelected && (
                <button
                  style={{
                    display: "flex",
                    height: "40px",
                    padding: "0px 16px",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "4px",
                    borderRadius: "6px",
                    background: "var(--destructive, #90080F)",
                    color: "white",
                    fontFamily: "Inter",
                    fontSize: "14px",
                    fontStyle: "normal",
                    fontWeight: "700",
                    lineHeight: "normal",
                    letterSpacing: "0.07px",
                    border: "none",
                    cursor:
                      selectedSessions.length > 0 ? "pointer" : "not-allowed",
                    opacity: selectedSessions.length > 0 ? 1 : 0.6,
                  }}
                  onClick={() => {
                    if (selectedSessions.length > 0) {
                      openCancelModal();
                    }
                  }}
                  disabled={selectedSessions.length === 0}
                >
                  <CancelIcon />{" "}
                  {selectOption === "Select all"
                    ? "All"
                    : `Cancel${selectedSessions.length > 0 ? ` ${selectedSessions.length}` : ""}`}
                </button>
              )}

              <Popover onClose={onClose}>
                <PopoverTrigger>
                  <Box
                    display="flex"
                    flexDirection="row"
                    alignItems="center"
                    gap="5px"
                  >
                    <SessionFilter
                      sessions={sessions}
                      setFilteredSessions={setFilteredSessions}
                      rooms={rooms}
                    />
                  </Box>
                </PopoverTrigger>
              </Popover>
            </Flex>

            <Flex
              gap="12px"
              alignItems="center"
            >
              {/* HERE */}
              <TableContainer>
                <Table variant="unstyled">
                  <Thead
                    borderBottom="1px"
                    color="#D2D2D2"
                  >
                    <Tr>
                      {isSelected && <Th />}
                      {!isArchived ? (
                        <Th>
                          <Text
                            textTransform="none"
                            color="#767778"
                            fontSize="16px"
                            fontStyle="normal"
                          >
                            Status
                          </Text>
                        </Th>
                      ) : null}
                      <Th>
                        <Box
                          display="flex"
                          padding="8px"
                          justifyContent="center"
                          alignItems="center"
                          gap="8px"
                        >
                          <FilledOutCalendar />
                          <Text
                            textTransform="none"
                            color="#767778"
                            fontSize="16px"
                            fontStyle="normal"
                          >
                            DATE
                          </Text>
                        </Box>
                      </Th>
                      <Th>
                        <Box
                          display="flex"
                          padding="8px"
                          justifyContent="center"
                          alignItems="center"
                          gap="8px"
                        >
                          <Icon as={sessionsClock} />
                          <Text
                            textTransform="none"
                            color="#767778"
                            fontSize="16px"
                            fontStyle="normal"
                          >
                            TIME
                          </Text>
                        </Box>
                      </Th>
                      <Th>
                        <Box
                          display="flex"
                          padding="8px"
                          justifyContent="center"
                          alignItems="center"
                          gap="8px"
                        >
                          <Icon
                            as={sessionsMapPin}
                            boxSize={4}
                            mr={1}
                          />
                          <Text
                            textTransform="none"
                            color="#767778"
                            fontSize="16px"
                            fontStyle="normal"
                          >
                            ROOM
                          </Text>
                        </Box>
                      </Th>
                      {/* Add Lead Artist column */}
                      <Th>
                        <Box
                          display="flex"
                          padding="8px"
                          justifyContent="center"
                          alignItems="center"
                          gap="8px"
                        >
                          <ArtistIcon />
                          <Text
                            textTransform="none"
                            color="#767778"
                            fontSize="16px"
                            fontStyle="normal"
                          >
                            LEAD ARTIST(S)
                          </Text>
                        </Box>
                      </Th>
                      {/* Add Payees column */}
                      <Th>
                        <Box
                          display="flex"
                          padding="8px"
                          justifyContent="center"
                          alignItems="center"
                          gap="8px"
                        >
                          <PersonIcon />
                          <Text
                            textTransform="none"
                            color="#767778"
                            fontSize="16px"
                            fontStyle="normal"
                          >
                            PAYEE(S)
                          </Text>
                        </Box>
                      </Th>
                      <Th></Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {currentPageSessions.length > 0 ? (
                      currentPageSessions.map((session) => (
                        <Tr key={session.id}>
                          {isSelected && (
                            <Td width="50px">
                              <Checkbox
                                isChecked={selectedSessions.includes(
                                  session.id
                                )}
                                onChange={() =>
                                  handleSessionSelection(session.id)
                                }
                                sx={{
                                  "& .chakra-checkbox__control[data-checked]": {
                                    backgroundColor: "#90080F",
                                    borderColor: "#90080F",
                                  },
                                  "&:hover .chakra-checkbox__control[data-checked]":
                                    {
                                      backgroundColor: "#90080F",
                                      borderColor: "#90080F",
                                    },
                                  "& .chakra-checkbox__control[data-checked]:hover":
                                    {
                                      backgroundColor: "#90080F",
                                      borderColor: "#90080F",
                                    },
                                }}
                              />
                            </Td>
                          )}

                          {!isArchived ? (
                            <Td>
                              <Box
                                display="flex"
                                justifyContent="center"
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
                          ) : null}
                          <Td>
                            <Box
                              display="flex"
                              justifyContent="center"
                              alignItems="center"
                            >
                              {formatDate(session.date)}
                            </Box>
                          </Td>
                          <Td>
                            <Box
                              display="flex"
                              justifyContent="center"
                              alignItems="center"
                            >
                              {formatTime(session.startTime)} -{" "}
                              {formatTime(session.endTime)}
                            </Box>
                          </Td>
                          <Td>
                            <Box
                              display="flex"
                              justifyContent="center"
                              alignItems="center"
                            >
                              {rooms.get(session.roomId)}
                            </Box>
                          </Td>
                          {/* Add Lead Artist data */}
                          <Td>
                            <Box
                              display="flex"
                              justifyContent="center"
                              alignItems="center"
                            >
                              {session.instructor
                                ? truncateNames(session.instructor)
                                : "N/A"}
                            </Box>
                          </Td>
                          {/* Add Payees data */}
                          <Td>
                            <Box
                              display="flex"
                              justifyContent="center"
                              alignItems="center"
                            >
                              {session.payee
                                ? truncateNames(session.payee)
                                : "N/A"}
                            </Box>
                          </Td>
                          <Td>
                            <EditCancelPopup
                              handleEdit={(e) => handleEdit(session.id, e)}
                              handleDeactivate={() =>
                                handleDeactivate(session.id)
                              }
                              id={session.id}
                            />
                          </Td>
                        </Tr>
                      ))
                    ) : (
                      <Tr>
                        <Td colSpan={isArchived ? 6 : 7}>
                          <Box
                            textAlign="center"
                            py={6}
                            color="gray.500"
                            fontSize="md"
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
            <CancelSessionModal
              isOpen={cancelModalIsOpen}
              onClose={closeCancelModal}
              selectedSessions={selectedSessions
                .map((id) => sessionMap[id])
                .filter(Boolean)}
              setSelectedSessions={setSelectedSessions}
              onConfirm={handleConfirmCancel}
              eventType={
                selectedSessions.length === 1 ? "Workshops" : "Sessions"
              }
              refreshSessions={refreshSessions}
            />
          </CardBody>
        </Card>
      </Box>
      {/* Pagination Controls - moved to bottom right */}
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
              size="md"
              variant="ghost"
              minWidth="auto"
              color="gray.500"
            >
              <ChevronLeftIcon />
            </Button>
            <Button
              onClick={goToNextPage}
              isDisabled={currentPage === totalPages}
              size="md"
              variant="ghost"
              minWidth="auto"
              color="gray.500"
            >
              <ChevronRightIcon />
            </Button>
          </Flex>
        )}
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

console.log();

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
