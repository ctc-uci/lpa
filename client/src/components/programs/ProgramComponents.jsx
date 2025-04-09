import React, { useCallback, useEffect, useState } from "react";

import { CancelIcon } from "../../assets/CancelIcon";
import { InfoIconRed } from "../../assets/InfoIconRed";
import {EyeIcon} from '../../assets/EyeIcon';

import "./Program.css";

import {
  CalendarIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  DeleteIcon,
  EmailIcon,
  InfoIcon,
  TimeIcon,
} from "@chakra-ui/icons";
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
import {
  EllipsisIcon,
  Info,
  UserIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ArchiveIcon } from "../../assets/ArchiveIcon";
import { EditIcon } from "../../assets/EditIcon";
import {
  filterButton,
  filterDateCalendar,
  sessionsCalendar,
  sessionsClock,
  sessionsEllipsis,
  sessionsFilterClock,
  sessionsFilterMapPin,
  sessionsMapPin,
  summaryIcon,
  DownloadIcon,
} from "../../assets/icons/ProgramIcons";
import { ArchivedDropdown } from "../archivedDropdown/ArchivedDropdown";
import { ReactivateIcon } from "../../assets/ReactivateIcon";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import DateSortingModal from "../filters/DateFilter";
import { CancelProgram } from  "../cancelModal/CancelProgramComponent";
import { EditCancelPopup } from  "../cancelModal/EditCancelPopup";

export const ProgramSummary = ({
  program,
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

  const {
    isOpen: popoverIsOpen,
    onOpen: popoverOnOpen,
    onClose: popoverOnClose,
  } = useDisclosure();

  const exit = () => {
    navigate('/programs');
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

  const handleDeactivate = () => {
    modalOnOpen();
  };

  const handleArchive = async () => {
    console.log(program[0].id);
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
            shadow="md"
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

  const { nextSession, nextRoom, instructors, payees } = safeBookingInfo;

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
          <Icon as={summaryIcon}/>
          <Text className="text componentTitleText">
            Summary
          </Text>
        </Flex>
        { isArchived ?
          <div id="archivedBlurb" className="text">
            <EyeIcon id="infoIcon"/>
            <p>Viewing Archived Program</p>
          </div>: <div></div>
        }
        <Flex width="20%"></Flex>
      </Flex>
      <Container
        minW="100%"
        p={0}
      >
        <Flex>
          <Card
            shadow="md"
            border="1px"
            borderColor="gray.300"
            borderRadius="15px"
            minW="100%"
          >
            <CardBody>
              <Flex
                mb={6}
                justify="space-between"
                align="center"
              >
                <Flex
                  id="backProgramButton"
                  align="center"
                  bg="#EDF2F7"
                  onClick={() => {navigate("/programs")}}
                >
                  <Flex
                    align="center"
                    gap={2}
                  >
                    <Icon
                      as={ChevronLeftIcon}
                      boxSize={6}
                      color="gray.600"
                    />
                    <Text
                      fontSize="xl"
                      fontWeight="semibold"
                      color="gray.600"
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
                  size="md"
                  textColor="gray.600"
                >
                  {program[0]?.name || "Untitled Program"}
                </Heading>

                <Flex
                  align="center"
                  gap={2}
                  color="gray.700"
                >
                  <Icon as={TimeIcon} />
                  <Text>
                    {nextSession
                      ? `${formatTimeString(nextSession.startTime)} - ${formatTimeString(nextSession.endTime)}`
                      : "No session scheduled"}
                  </Text>
                  <Text color="gray.600">next up on</Text>
                  <Icon as={CalendarIcon} />
                  <Text>
                    {nextSession?.date
                      ? new Date(nextSession.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })
                      : "No date available"}
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
                    <Icon
                      as={UserIcon}
                      color="gray.600"
                    />
                    <Text color="gray.600">
                      {payees?.length > 0
                        ? payees.map((payee) => payee.clientName).join(", ")
                        : "No payees"}
                    </Text>
                  </Flex>
                  <Flex
                    align="center"
                    gap={2}
                  >
                    <Icon
                      as={UserIcon}
                      color="gray.600"
                    />
                    <Text color="gray.600">
                      {instructors?.length > 0
                        ? instructors
                            .map((instructor) => instructor.clientName)
                            .join(", ")
                        : "No instructors"}
                    </Text>
                  </Flex>
                </Flex>

                <Flex
                  spacing={2}
                  gap={6}
                >
                  <Flex
                    align="center"
                    gap={2}
                  >
                    <Icon
                      as={EmailIcon}
                      color="gray.600"
                    />
                    <Text color="gray.600">
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
                    <Icon
                      as={InfoIcon}
                      color="gray.600"
                    />
                    <Text color="gray.600">{nextRoom?.name || "-"}</Text>
                  </Flex>
                  <Flex
                    align="center"
                    gap={2}
                  >
                    <Text color="gray.600">$</Text>
                    <Text color="gray.600">{nextRoom?.rate || "-.--"}</Text>
                    <Text color="gray.600">/ hour</Text>
                  </Flex>
                </Flex>

                <Stack spacing={6}>
                  <Box spacing={2}>
                    <Heading
                      size="md"
                      textColor="gray.600"
                    >
                      Room Description
                    </Heading>
                    <Text
                      color="gray.600"
                      text="xs"
                      mt={4}
                    >
                      {nextRoom?.description || "No description available"}
                    </Text>
                  </Box>

                  <Box>
                    <Heading
                      size="md"
                      textColor="gray.600"
                    >
                      Class Description
                    </Heading>
                    <Text
                      color="gray.600"
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


export const Sessions = ({ sessions, rooms, isArchived, setIsArchived }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const [programToDelete, setProgramToDelete] = useState(null);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [timeRange, setTimeRange] = useState({ start: "", end: "" });
  const [status, setStatus] = useState("All");
  const [selectedRoom, setSelectedRoom] = useState("All");
  const [programs, setPrograms] = useState([]);
  const [sortKey, setSortKey] = useState("date"); // Default to sorting by date
  const [sortOrder, setSortOrder] = useState("asc"); // Default to ascending order
  // At the top of your Sessions component where other state variables are defined
  const [filteredAndSortedSessions, setFilteredAndSortedSessions] = useState(
    []
  );

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

  // Add this effect to handle both filtering and sorting whenever relevant dependencies change
  useEffect(() => {
    if (!sessions || !rooms) return;

    // Step 1: Filter the sessions
    const filtered = sessions.filter((session) => {
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
        selectedRoom === "All" || rooms.get(session.roomId) === selectedRoom;

      return isDateInRange && isTimeInRange && isStatusMatch && isRoomMatch;
    });

    // Step 2: Sort the filtered sessions
    const sorted = [...filtered];
    if (sortKey === "date") {
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
    setFilteredAndSortedSessions(sorted);
  }, [
    dateRange,
    timeRange,
    status,
    selectedRoom,
    sessions,
    rooms,
    sortKey,
    sortOrder,
  ]);

  // Function to update sorting
  const handleSortChange = (key, order) => {
    setSortKey(key);
    setSortOrder(order);
  };

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
  if (!rooms || rooms.length === 0) {
    return <div>Loading...</div>; // Possibly change loading indicator
  }

  const handleDateChange = (field, value) => {
    setDateRange((prev) => ({ ...prev, [field]: value }));
  };

  const handleTimeChange = (field, value) => {
    setTimeRange((prev) => ({ ...prev, [field]: value }));
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
          <Text className="text componentTitleText">
            Sessions
          </Text>
        </Flex>
        <Card
          shadow="md"
          border="1px"
          borderColor="gray.300"
          borderRadius="15px"
        >
          <CardBody m={6}>
            <Flex
              direction="column"
              justify="space-between"
            >
              <Flex
                gap="12px"
                alignItems="center"
              >
                <Button
                  bg="#f2f6fb"
                  color="#1e293b"
                  fontWeight="bold"
                  fontSize="16px"
                  borderRadius="8px"
                  backgroundColor="#F0F1F4"
                  height="45px"
                  mt="10px"
                  mb="15px"
                  px="20px"
                  _hover={{ bg: "#e0e6ed" }}
                >
                  Select
                </Button>
                <Popover onClose={onClose}>
                  <PopoverTrigger>
                    <Button
                      color="#1e293b"
                      fontWeight="bold"
                      backgroundColor="#F0F1F4"
                      variant="outline"
                      minWidth="auto"
                      height="45px"
                      mt="10px"
                      mb="15px"
                      onClick={onOpen}
                      border="none"
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
                          {" "}
                          Filters{" "}
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
                                      status === "Active" ? "#EDEDFD" : "#F6F6F6"
                                    }
                                    borderColor={
                                      status === "Active" ? "#4E4AE7" : "#767778"
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
                                      status === "Past" ? "#EDEDFD" : "#F6F6F6"
                                    }
                                    borderColor={
                                      status === "Past" ? "#4E4AE7" : "#767778"
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
                                  {Array.from(rooms.values()).map(
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
              <TableContainer>
                <Table variant="unstyled">
                  <Thead
                    borderBottom="1px"
                    color="#D2D2D2"
                  >
                    <Tr>
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
                      ) : (
                        <></>
                      )}
                      <Th>
                        <Box
                          display="flex"
                          padding="8px"
                          justifyContent="center"
                          alignItems="center"
                          gap="8px"
                        >
                          <Icon as={filterDateCalendar} />
                          <Text
                            textTransform="none"
                            color="#767778"
                            fontSize="16px"
                            fontStyle="normal"
                          >
                            Date
                          </Text>
                          <Box
                            display="flex"
                            flexDirection="column"
                            alignItems="flex-start"
                            gap="2px"
                          >
                            <DateSortingModal onSortChange={handleSortChange} />
                          </Box>
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
                            Time
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
                            Room
                          </Text>
                        </Box>
                      </Th>
                      {/* Empty headers as space for the menu ellipsis button */}
                      <Th> </Th>
                      <Th> </Th>
                      <Th> </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredAndSortedSessions.length > 0 ? (
                      filteredAndSortedSessions.map((session) => (
                        <Tr key={session.id}>
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
                          ) : (
                            <></>
                          )}
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
    <PDFDownloadLink className="invoiceButton"
      document={<MyDocument bookingData={bookingData} />}
      fileName="bookingdata.pdf"
    >
      <DownloadIcon/>
      Invoice
    </PDFDownloadLink>
  );
};
