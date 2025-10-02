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
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Select,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useDisclosure,
} from "@chakra-ui/react";

import { AiOutlinePlus } from "react-icons/ai";
import { IoCloseOutline } from "react-icons/io5";
import { TbRepeat } from "react-icons/tb";
import { useParams } from "react-router";
import { useNavigate } from "react-router-dom";

import { CalendarIcon } from "../../../assets/CalendarIcon";
import { SessionsBookmark } from "../../../assets/SessionsBookmark";
import { useBackendContext } from "../../../contexts/hooks/useBackendContext";
import { CancelProgram } from "../../cancelModal/CancelProgramComponent";
import Navbar from "../../navbar/Navbar";
import { DeleteRowModal } from "../../popups/DeleteRowModal";
import { DeleteSessionConfirmationModal } from "../../popups/DeleteSessionConfirmationModal";
import { SaveSessionModal } from "../../popups/SaveSessionModal";
import { UnsavedChangesModal } from "../../popups/UnsavedChangesModal";
import { PreviewSession } from "./PreviewSession";
import { RecurringSessionRow } from "./RecurringSessionRow";
import { generateRecurringSessions, createNewSessions, updateSessions, deleteSessions } from "../utils";

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
    isOpen: isDeleteSessionModalOpen,
    onOpen: onDeleteSessionModalOpen,
    onClose: onDeleteSessionClose,
  } = useDisclosure();

  const {
    isOpen: isDeleteRowModalOpen,
    onOpen: onDeleteRowModalOpen,
    onClose: onDeleteRowModalClose,
  } = useDisclosure();

  // States for general information
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [isRecurring, setIsRecurring] = useState(true);
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

  const onSortChange = (_, order) => {
    setSortOrder(order);
  }
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
    setNewSessions((prev) => {
      const updatedNewSessions = {
        ...prev,
        [type]: prev[type]?.map((session, i) =>
          i === index ? { ...session, [field]: value } : session
        ),
      };

      // Update allSessions immediately with the updated state
      setAllSessions((allPrev) => {
        let updatedSessions = [...allPrev];

        if (type === "recurring") {
          const recurringSession = {
            ...updatedNewSessions.recurring[index], // Use the updated state
            [field]: value,
          };

          // Remove all sessions with this recurringId
          updatedSessions = updatedSessions.filter(
            (s) => s.recurringId !== recurringSession.id
          );

          if (Object.values(recurringSession).every((val) => val !== "")) {
            const currentTimezoneDate = new Date(
              startDate.replace(/-/g, "/").replace(/T.+/, "")
            );
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
            ...updatedNewSessions.single[index], // Use the updated state
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

      return updatedNewSessions;
    });
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
      handleDeleteSession(recurringId);
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
      handleDeleteSession(sessionToDelete.id);
    }
  };

  const handleResetSessions = () => {
    // Clear all sessions
    setAllSessions((prevSessions) =>
      prevSessions.map((session) => 
        session.id ? { ...session, isDeleted: true } : null
      )
    );

    // Remove all null values
    setAllSessions((prevSessions) =>
      prevSessions.filter((session) => session !== null)
    );

    // setAllSessions([]);
    setNewSessions({
      single: [],
      recurring: [],
    });
    // Reset any other relevant state
    handleAddSingleRow();
    handleAddRecurringRow();
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
      // console.log("sessionToDelete TEST", sessionToDelete);
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
      // await backend.delete("bookings/event/" + id);
      // console.log("allSessions: ", allSessions);

      // Handle new sessions
      const newSessions = allSessions.filter((s) => s.isNew);
      const updatedSessions = allSessions.filter((s) => s.isUpdated);
      const deletedSessions = allSessions.filter((s) => s.isDeleted);

      // console.log("newSessions: ", newSessions);
      // console.log("updatedSessions: ", updatedSessions);
      // console.log("deletedSessions: ", deletedSessions);

      // Create new sessions
      await createNewSessions(newSessions, id, backend);

      // Update existing sessions
      await updateSessions(updatedSessions, id, backend);

      // Delete sessions
      await deleteSessions(deletedSessions, backend);
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

  const frequencyOptions = [
    { value: "week", label: "Every Week" },
    { value: "monthDate", label: "Every Month (Same Day)" },
    { value: "monthWeekday", label: "Every Month (Same Weekday)" },
    { value: "year", label: "Every Year" },
  ];

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
          onChange={(e) => setStartDate(e.target.value)}
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
          onChange={(e) => setEndDate(e.target.value)}
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
            display="flex"
            alignItems="center"
            padding="0px 16px"
            justifyContent="flex-start"
            gap="4px"
            textAlign="left"
          >
            {
              frequencyOptions.find((opt) => opt.value === recurringFrequency)
                ?.label
            }
          </MenuButton>

          <MenuList
            minWidth="200px"
            padding="4px"
          >
            {frequencyOptions.map((option) => (
              <MenuItem
                key={option.value}
                onClick={() => {
                  setRecurringFrequency(option.value);
                  setIsChanged(true);
                  setAllSessions((prevSessions) =>
                    prevSessions.filter((session) => !session.isNew)
                  );
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

      {newSessions.recurring?.map((session, index) => (
        <RecurringSessionRow
          key={session.id}
          session={session}
          index={index}
          allRooms={allRooms}
          handleChangeSessionField={handleChangeSessionField}
          onDeleteRowModalOpen={onDeleteRowModalOpen}
          setRowToDelete={setRowToDelete}
          isRecurring={isRecurring}
          recurringFrequency={recurringFrequency}
        />
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

  return (
    <Navbar>
      {/* <CancelProgram
        id={id}
        sessionId={deleteSessionId}
        setPrograms={setAllSessions} // deletes from sessions instead of programs
        onOpen={onCancelProgramModalOpen}
        isOpen={isCancelProgramModalOpen}
        onClose={onCancelProgramModalClose}
        handleArchiveSession={handleArchiveSession}
        type={"Session"}
      /> */}
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

        <PreviewSession
          allSessions={allSessions}
          sortOrder={sortOrder}
          setSortOrder={onSortChange}
          allRooms={allRooms}
          onSaveSessionModalOpen={onSaveSessionModalOpen}
          handleArchiveSession={handleArchiveSession}
          handleDeleteSession={handleDeleteSession}
          setIsChanged={setIsChanged}
          onDeleteSessionModalOpen={onDeleteSessionModalOpen}
          setDeleteSessionDate={setDeleteSessionDate}
          setDeleteSessionId={setDeleteSessionId}
        />

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
              navigate(`/programs/${id}`);
            }}
            save={handleGoBack}
            isFormValid={isFormValid()}
          />
        )}
      </Box>
    </Navbar>
  );
};
