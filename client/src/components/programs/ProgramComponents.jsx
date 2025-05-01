import { React, useEffect, useState } from "react";
import { CancelIcon } from "../../assets/CancelIcon";
import { ClockFilled } from "../../assets/ClockFilled";
import { CustomOption } from "../../assets/CustomOption";
import { InfoIconRed } from "../../assets/InfoIconRed";
import { SessionFilter } from "../filters/SessionsFilter";
import { CancelSessionModal } from "./CancelSessionModal";

import "./Program.css";

import {
  CalendarIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DeleteIcon,
  DownloadIcon,
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { ArchiveIcon } from "../../assets/ArchiveIcon";
import { ArtistIcon } from "../../assets/ArtistsIcon";
import { DeleteIconRed } from "../../assets/DeleteIconRed";
import { DollarBill } from "../../assets/DollarBill";
import { DuplicateIcon } from "../../assets/DuplicateIcon";
import { EditIcon } from "../../assets/EditIcon";
import { FilledOutCalendar } from "../../assets/FilledOutCalendar";
import {
  filterButton,
  filterDateCalendar,
  sessionsCalendar,
  sessionsClock,
  sessionsEllipsis,
  sessionsFilterClock,
  sessionsFilterMapPin,
  sessionsMapPin,
} from "../../assets/icons/ProgramIcons";
import { LocationPin } from "../../assets/LocationPin";
import { PersonIcon } from "../../assets/PersonIcon";
import { ProgramEmailIcon } from "../../assets/ProgramEmailIcon";
import { ProgramsCalendarIcon } from "../../assets/ProgramsCalendarIcon";
import { ReactivateIcon } from "../../assets/ReactivateIcon";
import { SessionsBookmark } from "../../assets/SessionsBookmark";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import DateSortingModal from "../filters/DateFilter";
import { ProgramFilter } from "../filters/ProgramsFilter";
import { DateRange } from "./DateRange";
import { WeeklyRepeatingSchedule } from "./WeeklyRepeatingSchedule";

export const ProgramSummary = ({
  program,
  bookingInfo,
  isArchived,
  setIsArchived,
  eventId,
  sessions,
}) => {
  const { backend } = useBackendContext();
  const navigate = useNavigate();
  const {
    isOpen: modalIsOpen,
    onOpen: modalOnOpen,
    onClose: modalOnClose,
  } = useDisclosure();

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

    const rolesResponse = await backend.get(`/programs/${eventId}/roles`);
    const instructors = rolesResponse.data.instructors;
    const payees = rolesResponse.data.payees;

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
    onOpen();
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
    <Box
      minH="10vh"
      width="100%"
      minW="100%"
      py={8}
      paddingTop="1rem"
    >
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
                  align="center"
                  gap={2}
                >
                  <Button
                    display="flex"
                    height="40px"
                    padding="0px 16px"
                    justifyContent="center"
                    alignItems="center"
                    gap="4px"
                    fontSize="14px"
                    fontWeight="600"
                    borderRadius="6px"
                    onClick={exit}
                  >
                    <Icon
                      as={ChevronLeftIcon}
                      boxSize={5}
                    />{" "}
                    Programs
                  </Button>
                </Flex>

                <Flex
                  align="center"
                  gap={2}
                >
                  <PDFButton leftIcon={<Icon as={DownloadIcon} />}>
                    Invoice
                  </PDFButton>
                  <Popover
                    id="popTrigger"
                    placement="bottom-start"
                    isOpen={popoverIsOpen}
                    onOpen={popoverOnOpen}
                    onClose={popoverOnClose}
                  >
                    {({ isOpen, onClose }) => (
                      <>
                        <PopoverTrigger asChild>
                          <Icon
                            boxSize="7"
                            padding="5px"
                            borderRadius="6px"
                            backgroundColor="#EDF2F7"
                          >
                            <EllipsisIcon />
                          </Icon>
                        </PopoverTrigger>
                        <PopoverContent style={{ width: "100%" }}>
                          <PopoverBody>
                            {!isArchived ? (
                              <div>
                                <div
                                  id="popoverChoice"
                                  color="#767778"
                                >
                                  <EditIcon />
                                  <p onClick={toEditProgram}>Edit</p>
                                </div>
                                <div
                                  id="cancelBody"
                                  onClick={() => {
                                    onClose();
                                    setIsArchived(true);
                                    setArchived(true);
                                  }}
                                >
                                  <Icon fontSize="1xl">
                                    <CancelIcon id="cancelIcon" />
                                  </Icon>
                                  <p>Deactivate</p>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <Button
                                  id="popoverChoice"
                                  onClick={duplicateProgram}
                                >
                                  <DuplicateIcon />
                                  <p>Duplicate</p>
                                </Button>
                                <Button
                                  id="popoverChoice"
                                  onClick={() => {
                                    onClose();
                                    setIsArchived(false);
                                    setArchived(false);
                                  }}
                                >
                                  <ReactivateIcon />
                                  <p>Reactivate</p>
                                </Button>
                                <Button
                                  id="deleteBody"
                                  onClick={modalOnOpen}
                                >
                                  <DeleteIconRed />
                                  <p>Delete</p>
                                </Button>
                              </div>
                            )}
                          </PopoverBody>
                        </PopoverContent>
                      </>
                    )}
                  </Popover>
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
                    <Flex
                      align="center"
                      gap={2}
                    >
                      <PersonIcon />
                      <Text
                        color="#2D3748"
                        fontWeight="500"
                      >
                        {payees?.length > 0
                          ? payees.map((payee) => payee.clientName).join(", ")
                          : "No payees"}
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
      <Modal
        isOpen={modalIsOpen}
        onClose={modalOnClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Deactivate Program?</ModalHeader>
          <ModalBody>
            <Alert
              status="error"
              borderRadius="md"
              p={4}
              display="flex"
              flexDirection="column"
            >
              <Box color="#90080F">
                <Flex alignitems="center">
                  <Box
                    color="#90080F0"
                    mr={2}
                    display="flex"
                    alignItems="center"
                  >
                    <Info />
                  </Box>
                  <AlertTitle
                    color="#90080F"
                    fontSize="md"
                    fontWeight="500"
                  >
                    The deactivation fee deadline for this program is{" "}
                    <AlertDescription
                      fontSize="md"
                      fontWeight="bold"
                    >
                      Thu. 1/2/2025.
                    </AlertDescription>
                  </AlertTitle>
                </Flex>
                <Flex
                  mt={4}
                  align="center"
                  justify="center"
                  width="100%"
                >
                  <Checkbox
                    fontWeight="500"
                    sx={{
                      ".chakra-checkbox__control": {
                        bg: "white",
                        border: "#D2D2D2",
                      },
                    }}
                  >
                    Waive fee
                  </Checkbox>
                </Flex>
              </Box>
            </Alert>
            <Box mt={4}>
              <Text
                fontWeight="medium"
                mb={2}
              >
                Reason for Deactivation:
              </Text>
              <Textarea
                bg="#F0F1F4"
                placeholder="..."
                size="md"
                borderRadius="md"
              />
            </Box>
            <Box
              mt={4}
              display="flex"
              justifyContent="right"
            >
              <Menu>
                <MenuButton
                  as={Button}
                  rightIcon={<ChevronDownIcon />}
                  bg="#F0F1F4"
                  variant="outline"
                  width="50%"
                  justify="right"
                >
                  {selectedIcon} {selectedAction}
                </MenuButton>
                <MenuList>
                  <MenuItem
                    icon={
                      <Box
                        display="inline-flex"
                        alignItems="center"
                      >
                        <Icon
                          as={ArchiveIcon}
                          boxSize={4}
                        />
                      </Box>
                    }
                    onClick={() => handleSelect("Archive", ArchiveIcon)}
                    display="flex"
                    alignItems="center"
                  >
                    Archive
                  </MenuItem>
                  <MenuItem
                    icon={<DeleteIcon />}
                    onClick={() => handleSelect("Delete", <DeleteIcon />)}
                  >
                    Delete
                  </MenuItem>
                </MenuList>
              </Menu>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button
              bg="transparent"
              onClick={modalOnClose}
              color="#767778"
              borderRadius="30px"
              mr={3}
            >
              Exit
            </Button>
            <Button
              onClick={handleConfirm}
              style={{ backgroundColor: "#90080F" }}
              colorScheme="white"
              borderRadius="30px"
            >
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export const Sessions = ({
  sessions,
  rooms,
  isArchived,
  setIsArchived,
  refreshSessions,
}) => {
  const { backend } = useBackendContext();
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

  const [sortKey, setSortKey] = useState("date");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filteredAndSortedSessions, setFilteredAndSortedSessions] = useState(
    []
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
        selectedRoom === "All" || rooms.get(session.roomId) === selectedRoom;

      return isDateInRange && isTimeInRange && isStatusMatch && isRoomMatch;
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
    rooms,
    sortKey,
    sortOrder,
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

  return (
    <Box
      marginBottom="50px"
      width="100%"
    >
      <Flex
        align="center"
        mb="15px"
        gap="2px"
      >
        <SessionsBookmark />
        <Text
          fontSize="24px"
          fontWeight="700"
          color="#2D3748"
        >
          {" "}
          Sessions{" "}
        </Text>
      </Flex>
      <Card
        shadow="md"
        border="1px"
        borderColor="gray.300"
        borderRadius="15px"
      >
        <CardBody
          m={6}
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
        >
          <Flex
            direction="column"
            justify="space-between"
          >
            <Flex
              gap="12px"
              alignItems="center"
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
                  <Button
                    display="flex"
                    height="40px"
                    padding="0px 16px"
                    justifyContent="center"
                    alignItems="center"
                    gap="4px"
                    borderRadius="6px"
                    bg="var(--Secondary-2-Default, #EDF2F7)"
                    color="#2D3748"
                    fontFamily="Inter"
                    fontSize="14px"
                    onClick={onOpen}
                    border="none"
                  >
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
                                <CalendarIcon />
                                <Text
                                  fontWeight="bold"
                                  color="#767778"
                                >
                                  DATE
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
                                visibility={isSelected ? "visible" : "hidden"}
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
                                    <WrapItem key={index}>
                                      <Button
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
                    ) : (
                      <div></div>
                    )}
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
                  {filteredSessions.length > 0 ? (
                    filteredSessions.map((session) => (
                      <Tr key={session.id}>
                        {isSelected && (
                          <Td width="50px">
                            <Checkbox
                              isChecked={selectedSessions.includes(session.id)}
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
                        ) : (
                          <div></div>
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
                          <Icon
                            boxSize="7"
                            padding="5px"
                            borderRadius="6px"
                            backgroundColor="#EDF2F7"
                          >
                            <EllipsisIcon />
                          </Icon>
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
                  size="sm"
                  variant="ghost"
                  padding={0}
                  minWidth="auto"
                  color="gray.500"
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
          <CancelSessionModal
            isOpen={cancelModalIsOpen}
            onClose={closeCancelModal}
            selectedSessions={selectedSessions
              .map((id) => sessionMap[id])
              .filter(Boolean)}
            setSelectedSessions={setSelectedSessions}
            onConfirm={handleConfirmCancel}
            eventType={selectedSessions.length === 1 ? "Workshops" : "Sessions"}
            refreshSessions={refreshSessions}
          />
        </CardBody>
      </Card>
    </Box>
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
    <div>
      <PDFDownloadLink
        document={<MyDocument bookingData={bookingData} />}
        fileName="bookingdata.pdf"
      >
        <Button
          leftIcon={<Icon as={DownloadIcon} />}
          colorScheme="purple"
          size="sm"
          display="flex"
          height="40px"
          padding="0px 16px"
          borderRadius="6px"
          background={"var(--Primary-5-Default, #4441C8)"}
        >
          Invoice
        </Button>
      </PDFDownloadLink>
    </div>
  );
};
