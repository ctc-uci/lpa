import { useEffect, useState } from "react";

import { ChevronDownIcon, ChevronLeftIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  Heading,
  Icon,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Select,
  Tab,
  Table,
  TableContainer,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";

import { EllipsisIcon } from "lucide-react";
import { AiOutlinePlus } from "react-icons/ai";
import { IoCloseOutline } from "react-icons/io5";
import { TbRepeat } from "react-icons/tb";
import { useParams } from "react-router";
import { useNavigate } from "react-router-dom";

import { CalendarIcon } from "../../assets/CalendarIcon";
import { DeleteIconRed } from "../../assets/DeleteIconRed";
import { FilledOutCalendar } from "../../assets/FilledOutCalendar";
import { sessionsClock, sessionsMapPin } from "../../assets/icons/ProgramIcons";
import { MdFeaturedPlayList } from "../../assets/MdFeaturedPlayList";
import { ReactivateIcon } from "../../assets/ReactivateIcon";
import { SessionsBookmark } from "../../assets/SessionsBookmark";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { CancelProgram } from "../cancelModal/CancelProgramComponent";
import Navbar from "../navbar/Navbar";
import { DeleteRowModal } from "../popups/DeleteRowModal";
import { DeleteSessionConfirmationModal } from "../popups/DeleteSessionConfirmationModal";
import { SaveSessionModal } from "../popups/SaveSessionModal";
import { UnsavedChangesModal } from "../popups/UnsavedChangesModal";
import DateSortingModal from "../sorting/DateFilter";

export const EditRecurringSessions = () => {
  const { id } = useParams();
  const { backend } = useBackendContext();
  const navigate = useNavigate();
  const [sortOrder, setSortOrder] = useState("asc");
  const [deleteSessionDate, setDeleteSessionDate] = useState("");
  const [deleteSessionId, setDeleteSessionId] = useState("");

  const {
    isOpen: isSaveSessionModalOpen,
    onOpen: onSaveSessionModalOpen,
    onClose: onSaveSessionModalClose,
  } = useDisclosure();

  const {
    isOpen: isUnsavedSessionModalOpen,
    onOpen: onUnsavedSessionModalOpen,
    onClose: onUnsavedSessionModalClose,
  } = useDisclosure();

  const {
    isOpen: isCancelProgramModalOpen,
    onOpen: onCancelProgramModalOpen,
    onClose: onCancelProgramModalClose,
  } = useDisclosure();

  const {
    isOpen: isDeleteSessionModalOpen,
    onOpen: onDeleteSessionModalOpen,
    onClose: onDeleteSessionClose,
  } = useDisclosure();

  const {
    isOpen: isDeleteRowModalOpen,
    onOpen: onDeleteRowModalOpen,
    onClose: onDeleteRowModalClose,
  } = useDisclosure();

  // Function to format date
  // to "Mon. 01.01.2023"
  const formatDate = (isoString) => {
    const localDateString = isoString.includes("T")
      ? isoString
      : `${isoString}T12:00:00`;
    const date = new Date(localDateString);

    const options = {
      weekday: "short",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "UTC",
    };

    let formattedDate = new Intl.DateTimeFormat("en-US", options).format(date);
    formattedDate = formattedDate.replace(",", ".");
    return formattedDate;
  };

  // Function to format time
  // to "12:00 a.m." or "12:00 p.m."
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":").map(Number);
    const period = hours >= 12 ? "p.m." : "a.m.";
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  // States for general information
  const [startDate, setStartDate] = useState("");
  const [isRecurring, setIsRecurring] = useState(true);
  const [endDate, setEndDate] = useState("");
  const [isChanged, setIsChanged] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);

  // States for new sessions
  const [recurringFrequency, setRecurringFrequency] = useState("week");
  const [newSessions, setNewSessions] = useState({
    single: [
      { date: "", startTime: "", endTime: "", roomId: "", archived: false },
    ],
    recurring: [
      {
        id: Date.now(), // Just a unique id
        frequency: recurringFrequency,
        weekday: "",
        startTime: "",
        endTime: "",
        roomId: "",
        archived: false,
      },
    ],
  });

  // States for general information
  const [allRooms, setAllRooms] = useState([]);
  const [allSessions, setAllSessions] = useState([]);
  const [programName, setProgramName] = useState("");
  const [changeMade, setChangeMade] = useState(false);

  // TODO: allow duplicate sessions? what if a single session is added on a recurring day?
  const handleAddSingleRow = () => {
    setNewSessions((prev) => ({
      ...prev,
      single: [
        ...prev.single,
        { date: "", startTime: "", endTime: "", roomId: "", archived: false },
      ],
    }));
    setChangeMade(true);
  };

  const handleAddRecurringRow = () => {
    setNewSessions((prev) => ({
      ...prev,
      recurring: [
        ...prev.recurring,
        {
          id: Date.now(), // Just a unique id
          frequency: recurringFrequency,
          weekday: "",
          startTime: "",
          endTime: "",
          roomId: "",
          archived: false,
        },
      ],
    }));
    setChangeMade(true);
  };

  const handleChangeSessionField = (type, index, field, value) => {
    setNewSessions((prev) => ({
      ...prev,
      [type]: prev[type].map((session, i) =>
        i === index ? { ...session, [field]: value } : session
      ),
    }));
    setAllSessions((prev) => {
      let updatedSessions = [...prev];

      if (type === "recurring") {
        const recurringSession = {
          ...newSessions.recurring[index],
          [field]: value,
        };

        // Remove all sessions with this recurringId
        updatedSessions = updatedSessions.filter(
          (s) => s.recurringId !== recurringSession.id
        );

        if (Object.values(recurringSession).every((val) => val !== "")) {
          const generatedSessions = generateRecurringSessions(
            {
              ...recurringSession,
            },
            startDate,
            endDate
          );
          updatedSessions = [
            ...updatedSessions,
            ...generatedSessions.map((s) => ({
              ...s,
              recurringId: recurringSession.id,
              isNew: true,
            })),
          ];
        }
      } else if (type === "single") {
        const singleSession = {
          ...newSessions.single[index],
          [field]: value,
          id: index,
        };

        // Find and update the existing session or add a new one
        const existingIndex = updatedSessions.findIndex(
          (s) =>
            s.id === singleSession.id ||
            (s.date === singleSession.date &&
              s.startTime === singleSession.startTime)
        );

        if (existingIndex !== -1) {
          updatedSessions[existingIndex] = {
            ...updatedSessions[existingIndex],
            ...singleSession,
            isNew: true,
          };
        } else if (Object.values(singleSession).every((val) => val !== "")) {
          updatedSessions.push({
            ...singleSession,
            id: singleSession.id,
            isNew: true,
          });
        }
      }

      setIsChanged(true);
      return updatedSessions;
    });
  };

  const generateRecurringSessions = (recurringSession, startDate, endDate) => {
    const sessions = [];
    const currentTimezoneDate = new Date(
      startDate.replace(/-/g, "/").replace(/T.+/, "")
    );
    const currentDate = new Date(startDate);
    const endDateObj = new Date(endDate);
    const weekdays = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const weekdayIndex = weekdays.indexOf(
      recurringSession.weekday.toLowerCase()
    );
    const startDayOfWeek = currentTimezoneDate.getDay();
    const daysUntilFirst = (weekdayIndex - startDayOfWeek + 7) % 7;

    if (daysUntilFirst > 0) {
      currentDate.setDate(currentDate.getDate() + daysUntilFirst);
    }

    while (currentDate <= endDateObj) {
      sessions.push({
        date: currentDate.toISOString(),
        startTime: recurringSession.startTime,
        endTime: recurringSession.endTime,
        roomId: recurringSession.roomId,
        eventId: id,
        archived: false,
        id: Date.now() + Math.random(),
      });

      currentDate.setDate(currentDate.getDate() + 7);
    }

    return sessions;
  };

  const handleDeleteRow = (type, index) => {
    setNewSessions((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));

    if (type === "recurring") {
      // Remove all sessions associated with this recurring row
      const recurringId = newSessions.recurring[index].id;
      setAllSessions((prev) =>
        prev.filter((session) => session.recurringId !== recurringId)
      );
    } else if (type === "single") {
      // Remove the specific single session
      const sessionToDelete = newSessions.single[index];
      setAllSessions((prev) =>
        prev.filter(
          (session) =>
            !(
              session.date === sessionToDelete.date &&
              session.startTime === sessionToDelete.startTime &&
              session.endTime === sessionToDelete.endTime &&
              session.roomId === sessionToDelete.roomId
            )
        )
      );
    }
  };

  const handleResetSessions = () => {
    // Clear all sessions
    setAllSessions([]);
    setNewSessions({
      single: [],
      recurring: [],
    });
    // Reset any other relevant state
    setIsChanged(true);
  };

  const handleArchiveSession = (sessionId) => {
    setAllSessions((prevSessions) =>
      prevSessions.map((session) => {
        if (session.id === sessionId) {
          // If it's a new session, just toggle the archived status
          if (session.isNew) {
            return { ...session, archived: !session.archived };
          }
          // If it's an original session, mark it for update
          return {
            ...session,
            archived: !session.archived,
            isUpdated: true,
          };
        }
        return session;
      })
    );
  };

  const handleDeleteSession = (sessionId) => {
    setAllSessions((prevSessions) => {
      const sessionToDelete = prevSessions.find((s) => s.id === sessionId);
      if (sessionToDelete) {
        // If it's a new session, remove it entirely
        if (sessionToDelete.isNew) {
          return prevSessions.filter((s) => s.id !== sessionId);
        }
        // If it's an original session, mark it for deletion
        return prevSessions.map((s) =>
          s.id === sessionId ? { ...s, isDeleted: true } : s
        );
      }
      return prevSessions;
    });
  };

  const saveChanges = async () => {
    try {
      await backend.delete("bookings/event/" + id);

      // Handle new sessions
      await Promise.all(
        allSessions.map((s) =>
          backend.post("/bookings/", {
            event_id: id,
            room_id: s.roomId,
            start_time: s.startTime,
            end_time: s.endTime,
            date: s.date,
            archived: s.archived,
          })
        )
      );
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

  const handleGoBack = async () => {
    await saveChanges();
    navigate(`/programs/${id}`);
  };

  const fetchAllRooms = async () => {
    // TODO: only fetch rooms that are available at the given date/time?
    try {
      const response = await backend.get("/rooms/");
      const data = response.data;
      setAllRooms(data);
    } catch (error) {
      console.error("Error fetching all rooms:", error);
    }
  };

  const fetchAllInfo = async () => {
    try {
      const allSessionsResponse = await backend.get(`/bookings/byEvent/${id}`);
      const allSessionsData = allSessionsResponse.data;

      setAllSessions((prevSessions) => {
        const existingSessionIds = new Set(
          prevSessions.map((session) => session.id)
        );
        const newSessions = allSessionsData.filter(
          (session) => !existingSessionIds.has(session.id)
        );
        return [...prevSessions, ...newSessions];
      });
      // Fetch program name
      try {
        const programResponse = await backend.get(`/events/${id}`);
        const programData = programResponse.data;
        setProgramName(programData[0].name);
      } catch (programError) {
        console.error("Error fetching program name:", programError);
      }
    } catch (allSessionError) {
      console.error(
        "Error processing session data or fetching all sessions:",
        allSessionError
      );
    }
  };

  useEffect(() => {
    fetchAllRooms();
    fetchAllInfo();
  }, [id]);

  const isFormValid = () => {
    return allSessions.length !== 0 && isChanged === true;
  };

  useEffect(() => {
    newSessions.recurring.forEach((session, index) => {
      handleChangeSessionField("recurring", index, "weekday", session.weekday);
    });
  }, [startDate, endDate]);

  const addRecurring = (
    <>
      <Flex
        align="center"
        mb="20px"
        gap="10px"
      >
        <CalendarIcon />
        <Text
          fontSize="16px"
          fontWeight="500"
        >
          Starts on
        </Text>
        <Input
          type="date"
          value={startDate}
          onChange={(e) => {
            setStartDate(e.target.value);
          }}
          width="137px"
          color={startDate ? "#2D3748" : "#CBD5E0"}
        />
        <Text
          fontSize="16px"
          fontWeight="500"
        >
          and ends on
        </Text>
        <Input
          type="date"
          value={endDate}
          onChange={(e) => {
            setEndDate(e.target.value);
          }}
          width="137px"
          color={endDate ? "#2D3748" : "#CBD5E0"}
        />
      </Flex>
      <Flex
        align="center"
        gap="10px"
        mb={15}
      >
        <TbRepeat />
        <Menu autoSelect={false}>
          <MenuButton
            as={Button}
            rightIcon={<ChevronDownIcon />}
            _hover={{
              bgColor: "#EDF2F7",
              borderRadius: "4px",
            }}
            _active={{
              bgColor: "#EDF2F7",
              borderRadius: "4px",
            }}
            background="transparent"
            border="1px solid #E2E8F0"
            borderRadius="4px"
            fontWeight="400"
            fontSize="14px"
            width="200px"
            display="flex"
            alignItems="center"
            padding="0px 16px"
            justifyContent="flex-start"
            gap="4px"
            textAlign="left"
          >
            Every{" "}
            {recurringFrequency.charAt(0).toUpperCase() +
              recurringFrequency.slice(1)}
          </MenuButton>
          <MenuList
            minWidth="200px"
            padding="4px"
          >
            {[
              { value: "week", label: "Every Week" },
              { value: "month", label: "Every Month" },
              { value: "year", label: "Every Year" },
            ].map((option) => (
              <MenuItem
                key={option.value}
                onClick={() => {
                  setRecurringFrequency(option.value);
                  setIsChanged(true);
                }}
                bg={
                  recurringFrequency === option.value
                    ? "#EDF2F7"
                    : "transparent"
                }
              >
                {option.label}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
      </Flex>

      {newSessions.recurring.map((session, index) => (
        <Box
          key={index}
          mb={4}
        >
          <Flex
            align="center"
            gap="10px"
          >
            <Text>Every</Text>
            <Menu autoSelect={false}>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                background="transparent"
                border="1px solid #E2E8F0"
                borderRadius="4px"
                fontWeight="400"
                fontSize="14px"
                width="200px"
                display="flex"
                alignItems="center"
                padding="0px 16px"
                justifyContent="flex-start"
                gap="4px"
                textAlign="left"
                color={session.weekday ? "#2D3748" : "#CBD5E0"}
                _hover={{
                  bgColor: "#EDF2F7",
                  borderRadius: "4px",
                }}
                _active={{
                  bgColor: "#EDF2F7",
                  borderRadius: "4px",
                }}
              >
                {session.weekday || "Weekday"}
              </MenuButton>
              <MenuList
                minWidth="200px"
                padding="4px"
                borderRadius="4px"
                overflow="hidden"
              >
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((day) => (
                  <MenuItem
                    key={day}
                    onClick={() => {
                      handleChangeSessionField(
                        "recurring",
                        index,
                        "weekday",
                        day
                      );
                      setIsChanged(true);
                    }}
                    bg={session.weekday === day ? "#EDF2F7" : "transparent"}
                  >
                    {day}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
            <Text>from</Text>
            <Input
              width="96px"
              type="time"
              value={session.startTime || "00:00"}
              color={session.startTime ? "#2D3748" : "#CBD5E0"}
              onChange={(e) =>
                handleChangeSessionField(
                  "recurring",
                  index,
                  "startTime",
                  e.target.value
                )
              }
            />
            <Text>to</Text>
            <Input
              width="96px"
              type="time"
              value={session.endTime || "00:00"}
              color={session.endTime ? "#2D3748" : "#CBD5E0"}
              onChange={(e) =>
                handleChangeSessionField(
                  "recurring",
                  index,
                  "endTime",
                  e.target.value
                )
              }
            />
            <Text>in</Text>
            <Menu autoSelect={false}>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                background="transparent"
                border="1px solid #E2E8F0"
                borderRadius="4px"
                fontWeight="400"
                fontSize="14px"
                width="200px"
                display="flex"
                alignItems="center"
                padding="0px 16px"
                justifyContent="flex-start"
                gap="4px"
                textAlign="left"
                color={session.roomId ? "#2D3748" : "#CBD5E0"}
                _hover={{
                  bgColor: "#EDF2F7",
                  borderRadius: "4px",
                }}
                _active={{
                  bgColor: "#EDF2F7",
                  borderRadius: "4px",
                }}
              >
                {session.roomId
                  ? allRooms.find((room) => room.id === session.roomId)?.name
                  : "Room"}
              </MenuButton>
              <MenuList
                minWidth="200px"
                padding="4px"
                borderRadius="4px"
                overflow="hidden"
              >
                {allRooms.map((room) => (
                  <MenuItem
                    key={room.id}
                    value={room.id}
                    onClick={() =>
                      handleChangeSessionField(
                        "recurring",
                        index,
                        "roomId",
                        room.id
                      )
                    }
                    bg={session.roomId === room.id ? "#EDF2F7" : "transparent"}
                  >
                    {room.name}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
            <Icon
              as={IoCloseOutline}
              boxSize="6"
              color="#2D3748"
              cursor="pointer"
              onClick={() => {
                onDeleteRowModalOpen();
                setRowToDelete({
                  type: isRecurring ? "recurring" : "single",
                  index,
                });
              }}
            />
          </Flex>
        </Box>
      ))}
      <Button
        onClick={handleAddRecurringRow}
        leftIcon={<AiOutlinePlus />}
        bg="white"
        textColor="#718096"
      >
        Row
      </Button>
    </>
  );

  const addSingle = (
    <>
      {newSessions.single.map((session, index) => (
        <Box
          key={index}
          mb={4}
        >
          <Flex
            align="center"
            gap="10px"
          >
            <Text>On</Text>
            <Input
              width="137px"
              minWidth="137px"
              type="date"
              value={session.date}
              onChange={(e) =>
                handleChangeSessionField(
                  "single",
                  index,
                  "date",
                  e.target.value
                )
              }
              color={session.date ? "#2D3748" : "#CBD5E0"}
            />
            <Text>from</Text>
            <Input
              width="96px"
              minWidth="96px"
              type="time"
              value={session.startTime || "00:00"}
              color={session.startTime ? "#2D3748" : "#CBD5E0"}
              onChange={(e) =>
                handleChangeSessionField(
                  "single",
                  index,
                  "startTime",
                  e.target.value
                )
              }
            />
            <Text>to</Text>
            <Input
              width="96px"
              minWidth="96px"
              type="time"
              value={session.endTime || "00:00"}
              color={session.endTime ? "#2D3748" : "#CBD5E0"}
              onChange={(e) =>
                handleChangeSessionField(
                  "single",
                  index,
                  "endTime",
                  e.target.value
                )
              }
            />
            <Text>in</Text>
            <Select
              value={session.roomId}
              color={session.roomId ? "#2D3748" : "#CBD5E0"}
              width="200px"
              onChange={(e) =>
                handleChangeSessionField(
                  "single",
                  index,
                  "roomId",
                  e.target.value
                )
              }
            >
              <option
                value=""
                disabled
              >
                Room
              </option>
              {allRooms.map((room) => (
                <option
                  key={room.id}
                  value={room.id}
                >
                  {room.name}
                </option>
              ))}
            </Select>
            <Icon
              as={IoCloseOutline}
              boxSize="6"
              color="#2D3748"
              cursor="pointer"
              onClick={() => {
                onDeleteRowModalOpen();
                setRowToDelete({
                  type: isRecurring ? "recurring" : "single",
                  index,
                });
              }}
            />
          </Flex>
        </Box>
      ))}
      <Button
        onClick={handleAddSingleRow}
        bg="white"
        textColor="#718096"
        leftIcon={<AiOutlinePlus />}
      >
        Row
      </Button>
    </>
  );

  const sessionsComponent = (
    <Box
      minH="10vh"
      width="100%"
      minW="100%"
      py={8}
    >
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
            align="center"
            mb="20px"
            gap="10px"
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

          <Flex
            justify="space-between"
            align="center"
            mb={4}
          >
            <Tabs
              index={isRecurring ? 0 : 1}
              onChange={(index) => setIsRecurring(index === 0)}
              flex={1}
            >
              <Flex
                justify="space-between"
                align="center"
                width="100%"
              >
                <TabList color="#3834B6">
                  <Tab
                    fontWeight="bold"
                    color="#718096"
                    _selected={{
                      color: "#3834B6",
                      borderBottom: "2px solid #3834B6",
                    }}
                  >
                    Recurring
                  </Tab>
                  <Tab
                    fontWeight="bold"
                    color="#718096"
                    _selected={{
                      color: "#3834B6",
                      borderBottom: "2px solid #3834B6",
                    }}
                  >
                    Single
                  </Tab>
                </TabList>
                <Button
                  onClick={handleResetSessions}
                  color="#EDF2F7"
                  textColor="#2D3748"
                  fontSize={"14px"}
                >
                  Reset All Sessions
                </Button>
              </Flex>
              <TabPanels>
                <TabPanel padding={4}>{addRecurring}</TabPanel>
                <TabPanel padding={4}>{addSingle}</TabPanel>
              </TabPanels>
            </Tabs>
          </Flex>
        </CardBody>
      </Card>
    </Box>
  );

  const previewSession = (
    <Box
      minH="10vh"
      width="100%"
      minW="100%"
      py={8}
      paddingTop="1rem"
    >
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
          <Box
            display="flex"
            alignItems="center"
            padding="8px"
            justifyContent="space-between"
            gap="8px"
          >
            <Flex
              align="center"
              mb="15px"
              gap="10px"
            >
              <MdFeaturedPlayList />
              <Text
                fontSize="24px"
                fontWeight="700"
                color="#2D3748"
              >
                {" "}
                Preview{" "}
              </Text>
            </Flex>
            <Button
              backgroundColor="#4441C8"
              onClick={onSaveSessionModalOpen}
              isDisabled={allSessions.length === 0}
              _hover={{ bg: "#312E8A" }}
            >
              <Text
                color="#FFFFFF"
                fontSize={"14px"}
              >
                Save Changes
              </Text>
            </Button>
          </Box>

          <TableContainer>
            <Table variant="unstyled">
              <Thead
                borderBottom="1px"
                color="#D2D2D2"
              >
                <Tr>
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
                        <DateSortingModal onSortChange={setSortOrder} />
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
                        UPCOMING TIME
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
                </Tr>
              </Thead>
              <Tbody>
                {allSessions
                  .filter((session) => !session.isDeleted)
                  .sort((a, b) => {
                    return sortOrder === "asc"
                      ? new Date(a.date) - new Date(b.date)
                      : new Date(b.date) - new Date(a.date);
                  })
                  .map((session) => (
                    <Tr
                      key={session.id}
                      textColor={
                        session.archived === true ? "#A0AEC0" : "#2D3748"
                      }
                      backgroundColor={session.isNew ? "#F8F8FF" : "white"}
                    >
                      <Td>
                        <Box
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                        >
                          <Text
                            textTransform="none"
                            fontSize="16px"
                            fontStyle="normal"
                          >
                            {formatDate(session.date)}
                          </Text>
                        </Box>
                      </Td>
                      <Td>
                        <Box
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                        >
                          <Text
                            textTransform="none"
                            fontSize="16px"
                            fontStyle="normal"
                          >
                            {formatTime(session.startTime)} -{" "}
                            {formatTime(session.endTime)}
                          </Text>
                        </Box>
                      </Td>
                      <Td>
                        <Box
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                        >
                          <Text
                            textTransform="none"
                            fontSize="16px"
                            fontStyle="normal"
                          >
                            {allRooms.find(
                              (room) => room.id === Number(session.roomId)
                            )?.name || "N/A"}
                          </Text>
                        </Box>
                      </Td>
                      <Td>
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            boxSize="7"
                            icon={<EllipsisIcon />}
                            backgroundColor="#EDF2F7"
                            color="#2D3748"
                            textColor="#2D3748"
                            cursor="pointer"
                            minWidth="24px"
                            minHeight="24px"
                            borderRadius={6}
                          />
                          <MenuList
                            padding="4px"
                            minWidth="139px"
                          >
                            <MenuItem
                              onClick={() => {
                                setDeleteSessionDate(
                                  formatDate(session.date).split(" ")[1]
                                );
                                setDeleteSessionId(session.id);
                                if (session.isNew) {
                                  onDeleteSessionModalOpen();
                                } else {
                                  onCancelProgramModalOpen();
                                }
                                setIsChanged(true);
                              }}
                              display="flex"
                              padding="6px 8px"
                              alignItems="center"
                              gap="8px"
                              width="131px"
                              height="32px"
                              variant="ghost"
                            >
                              <Icon
                                as={DeleteIconRed}
                                boxSize="4"
                              />
                              <Text
                                color="#90080F"
                                fontSize="14px"
                              >
                                Cancel
                              </Text>
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Td>
                    </Tr>
                  ))}
              </Tbody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>
    </Box>
  );

  return (
    <Navbar>
      <CancelProgram
        id={id}
        sessionId={deleteSessionId}
        setPrograms={setAllSessions} // deletes from sessions instead of programs
        onOpen={onCancelProgramModalOpen}
        isOpen={isCancelProgramModalOpen}
        onClose={onCancelProgramModalClose}
        handleArchiveSession={handleArchiveSession}
        type={"Session"}
      />
      <DeleteSessionConfirmationModal
        setPrograms={setAllSessions}
        isOpen={isDeleteSessionModalOpen}
        onClose={onDeleteSessionClose}
        date={deleteSessionDate}
        id={deleteSessionId}
        programs={allSessions}
      />
      <Box style={{ width: "100%", padding: "20px 20px 20px 20px" }}>
        <Flex
          align="center"
          gap={2}
          padding="20px 0px 20px 0px"
        >
          <Button
            display="flex"
            height="40px"
            padding="0px 16px"
            justifyContent="center"
            alignItems="center"
            gap="4px"
            color="#2D3748"
            fontSize="14px"
            fontWeight="700"
            borderRadius="6px"
            background="#EDF2F7"
            onClick={() => {
              if (isChanged) {
                onUnsavedSessionModalOpen();
              } else {
                navigate(`/programs/edit/${id}`);
              }
            }}
          >
            <Icon
              as={ChevronLeftIcon}
              boxSize={5}
            />{" "}
            Program Summary
          </Button>
        </Flex>

        <Heading
          as="h2"
          size="md"
          color="#2D3748"
          fontFamily="Inter"
          fontSize="24px"
          fontStyle="normal"
          fontWeight="700"
          lineHeight="normal"
        >
          {programName}
        </Heading>

        {sessionsComponent}
        {previewSession}

        <DeleteRowModal
          isOpen={isDeleteRowModalOpen}
          onClose={onDeleteRowModalClose}
          onDelete={() => {
            if (rowToDelete) {
              handleDeleteRow(rowToDelete.type, rowToDelete.index);
              setRowToDelete(null);
            }
          }}
        />

        <SaveSessionModal
          isOpen={isSaveSessionModalOpen}
          onClose={onSaveSessionModalClose}
          noSave={onSaveSessionModalClose}
          save={handleGoBack}
          programName={programName}
        />

        {isChanged && (
          <UnsavedChangesModal
            isOpen={isUnsavedSessionModalOpen}
            onClose={onUnsavedSessionModalClose}
            noSave={() => {
              onUnsavedSessionModalClose();
              navigate(`/programs/edit/${id}`);
            }}
            save={handleGoBack}
            isFormValid={isFormValid()}
          />
        )}
      </Box>
    </Navbar>
  );
};
