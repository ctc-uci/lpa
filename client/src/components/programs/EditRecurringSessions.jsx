import { useEffect, useState, useMemo } from "react";

import { useNavigate } from "react-router-dom";
import { useParams } from "react-router";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";

import { 
  Box, 
  Flex, 
  Button, 
  Text, 
  Card, 
  CardBody, 
  Icon, 
  Heading, 
  TableContainer, 
  Table, 
  Td, 
  Th, 
  Tr, 
  Thead,
  Input, 
  Select,
  Select,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useDisclosure, 
  Tbody} from "@chakra-ui/react";
import { ChevronLeftIcon } from "@chakra-ui/icons";
import { EllipsisIcon } from "lucide-react";

import Navbar from "../navbar/Navbar";
import { SessionsBookmark } from "../../assets/SessionsBookmark";
import { MdAddCircleOutline } from "react-icons/md";
import { MdFeaturedPlayList } from "../../assets/MdFeaturedPlayList";
import { FilledOutCalendar } from "../../assets/FilledOutCalendar";
import {
  sessionsClock,
  sessionsMapPin,
} from "../../assets/icons/ProgramIcons";

import DateSortingModal from "../filters/DateFilter";
import { SaveSessionModal } from "../popups/SaveSessionModal";
import { UnsavedChangesModal } from "../popups/UnsavedChangesModal";
import { DeleteRowModal } from "../popups/DeleteRowModal";


// TODO: does it also handle edit session?
export const EditRecurringSessions = () => {
  const { id } = useParams();
  const { backend } = useBackendContext();
  const navigate = useNavigate();

  const { isOpen: isSaveSessionModalOpen,
          onOpen: onSaveSessionModalOpen, 
          onClose: onSaveSessionModalClose } = useDisclosure();

  const { isOpen: isUnsavedSessionModalOpen,
          onOpen: onUnsavedSessionModalOpen, 
          onClose: onUnsavedSessionModalClose } = useDisclosure();

  const { isOpen: isDeleteRowModalOpen,
          onOpen: onDeleteRowModalOpen, 
          onClose: onDeleteRowModalClose } = useDisclosure();

  // Function to update sorting
  const handleSortChange = (key, order) => {
    setSortKey(key);
    setSortOrder(order);
  };

  // Function to format date
  // to "Mon. 01.01.2023"
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

  // Function to format time
  // to "12:00 a.m." or "12:00 p.m."
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":").map(Number);
    const period = hours >= 12 ? "p.m." : "a.m.";
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  // States for general information
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [isRecurring, setIsRecurring] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);

  const [deleteAll, setDeleteAll] = useState(false);

  // States for new sessions
  const [newSessions, setNewSessions] = useState({
    single: [],
    recurring: []
  });

  // States for general information
  const [allRooms, setAllRooms] = useState([]);
  const [allSessions, setAllSessions] = useState([]);
  const [programName, setProgramName] = useState("");

  // TODO: allow duplicate sessions? what if a single session is added on a recurring day?
  const handleAddSingleRow = () => {
    setNewSessions(prev => ({
      ...prev,
      single: [...prev.single, { date: "", startTime: "", endTime: "", roomId: "", archived: false }]
    }));
  };
  
  const handleAddRecurringRow = () => {
    setNewSessions(prev => ({
      ...prev,
      recurring: [...prev.recurring, { 
        id: Date.now(), // Just a unique id
        frequency: recurringFrequency, 
        weekday: weekdaySelection, 
        startTime: "", 
        endTime: "", 
        roomId: "" ,
        archived: false
      }]
    }));
  };

  const handleChangeSessionField = (type, index, field, value) => {
    setNewSessions(prev => ({
      ...prev,
      [type]: prev[type].map((session, i) => 
        i === index ? { ...session, [field]: value } : session
      )
    }));
  
    if (type === 'recurring') {
      const recurringSession = { ...newSessions.recurring[index], [field]: value };
      if (Object.values(recurringSession).every(val => val !== "")) {
        const generatedSessions = generateRecurringSessions(recurringSession, startDate, endDate);
        setIsChanged(true);
        setAllSessions(prev => {
          const filteredSessions = prev.filter(s => s.recurringId !== recurringSession.id);
          return [...filteredSessions, ...generatedSessions.map(s => ({ 
            ...s, 
            recurringId: recurringSession.id,
            isNew: true 
          }))];
        });
      }
    } else if (type === 'single') {
      const singleSession = { ...newSessions.single[index], [field]: value };
      if (Object.values(singleSession).every(val => val !== "")) {
        setIsChanged(true);
        setAllSessions(prev => {
          // Check for duplicates
          if (!prev.some(s => s.date === singleSession.date && s.startTime === singleSession.startTime)) {
            return [...prev, { ...singleSession, id: Date.now(), isNew: true }];
          }
          return prev;
        });
      }
    }
  };

  const generateRecurringSessions = (recurringSession, startDate, endDate) => {
    const sessions = [];
    let currentDate = new Date(startDate);
    const endDateObj = new Date(endDate);
  
    while (currentDate <= endDateObj) {
      if (currentDate.getDay() === ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"].indexOf(recurringSession.weekday.toLowerCase())) {
        sessions.push({
          date: currentDate.toISOString().split('T')[0],
          startTime: recurringSession.startTime,
          endTime: recurringSession.endTime,
          roomId: recurringSession.roomId,
          id: Date.now() + sessions.length // Unique ID
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
  
    return sessions;
  };

  const handleDeleteRow = (type, index) => {
    setNewSessions(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  
    if (type === 'recurring') {
      // Remove all sessions associated with this recurring row
      const recurringId = newSessions.recurring[index].id;
      setAllSessions(prev => prev.filter(session => session.recurringId !== recurringId));
    } else if (type === 'single') {
      // Remove the specific single session
      const sessionToDelete = newSessions.single[index];
      setAllSessions(prev => prev.filter(session => 
        !(session.date === sessionToDelete.date && 
          session.startTime === sessionToDelete.startTime && 
          session.endTime === sessionToDelete.endTime && 
          session.roomId === sessionToDelete.roomId)
      ));
    }
  };

  const handleResetSessions = () => {
    setDeleteIds(allSessions.filter(session => session.isNew === undefined).map(session => session.id));
    // Clear all sessions
    setAllSessions([]);
    setNewSessions({
      single: [],
      recurring: []
    });
    // Reset any other relevant state
    setDeleteAll(true);
    setIsChanged(true);
  };

  const saveChanges = async () => {
    try {
      const newSessions = allSessions.filter(session => session.isNew);
      const convertedSessions = newSessions.map(s => ({
        event_id: id,
        room_id: s.roomId,
        start_time: s.startTime,
        end_time: s.endTime,
        date: s.date,
        archived: s.archived
      }));
      const response = await backend.post(`/bookings/`, convertedSessions);
      console.log("Added sessions:", response.data);
    }
    catch (error) {
      console.error("Error adding sessions:", error);
    }

    // Delete all if deleteAll is true
    if (deleteAll) {
      try {
        const response = await backend.delete(`/bookings/event/${id}`);
        console.log("Deleted sessions:", response.data);
      } catch (error) {
        console.error("Error deleting sessions:", error);
      }
    }
  };

  const handleGoBack = () => {
      saveChanges();
      navigate(`/programs/${eventId}`);
  };

  const fetchAllRooms = async () => {
    // TODO: only fetch rooms that are available at the given date/time?
    try {
      const response = await backend.get('/rooms/');
      const data = response.data;
      console.log("All rooms:", data);
      setAllRooms(data);
    } catch (error) {
      console.error("Error fetching all rooms:", error);
    }
  };
  
  const fetchAllInfo = async () => {
    try {
      const allSessionsResponse = await backend.get(`/bookings/byEvent/${id}`);
      const allSessionsData = allSessionsResponse.data;
      console.log("All sessions:", allSessionsData);
      setAllSessions(allSessionsData);
      // Fetch program name
      try {
        const programResponse = await backend.get(`/events/${id}`);
        const programData = programResponse.data;
        console.log("Program:", programData);
        setProgramName(programData[0].name);
      } catch (programError) {
        console.error("Error fetching program name:", programError);
      }
    } catch (allSessionError) {
    console.error("Error processing session data or fetching all sessions:", allSessionError);
    }
  };
  
  useEffect(() => {
    fetchAllRooms();
    fetchAllInfo();
  }, [id]);

  const addSingle = (
    <TabPanel>
      {newSessions.single.map((session, index) => (
        <Box key={index} mb={4}>
          <Flex align="center" gap="10px">
            <Text>On</Text>
            <Input
              type="date"
              value={session.date}
              onChange={(e) => handleChangeSessionField('single', index, "date", e.target.value)}
            />
            <Text>from</Text>
            <Input
              type="time"
              value={session.startTime}
              onChange={(e) => handleChangeSessionField('single', index, "startTime", e.target.value)}
            />
            <Text>to</Text>
            <Input
              type="time"
              value={session.endTime}
              onChange={(e) => handleChangeSessionField('single', index, "endTime", e.target.value)}
            />
            <Text>in</Text>
            <Select
              value={session.roomId}
              onChange={(e) => handleChangeSessionField('single', index, "roomId", e.target.value)}
            >
              {allRooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </Select>
            <Icon
              as={MdAddCircleOutline}
              boxSize="6"
              color="#2D3748"
              cursor="pointer"
              onClick={() => {
                onDeleteRowModalOpen();
                setRowToDelete({ type: isRecurring ? 'recurring' : 'single', index });
              }}
            />
          </Flex>
        </Box>
      ))}
      <Button onClick={handleAddSingleRow} colorScheme="teal" leftIcon={<MdAddCircleOutline />}>
        Add Row
      </Button>
    </TabPanel>
  );

  const addRecurring = (
    <TabPanel>
      <Flex direction="column" gap="15px">
        <Select
          value={recurringFrequency}
          onChange={(e) => setRecurringFrequency(e.target.value)}
        >
          <option value="week">Every Week</option>
          <option value="month">Every Month</option>
          <option value="year">Every Year</option>
        </Select>
        <Text>Every</Text>
        <Select
          value={weekdaySelection}
          onChange={(e) => setWeekdaySelection(e.target.value)}
        >
          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </Select>

        {newSessions.recurring.map((session, index) => (
          <Box key={index} mb={4}>
            <Flex align="center" gap="10px">
              <Text>Every</Text>
              <Text fontWeight="bold">{session.weekday}</Text>
              <Text>from</Text>
              <Input
                type="time"
                value={session.startTime}
                onChange={(e) => handleChangeSessionField('recurring', index, "startTime", e.target.value)}
              />
              <Text>to</Text>
              <Input
                type="time"
                value={session.endTime}
                onChange={(e) => handleChangeSessionField('recurring', index, "endTime", e.target.value)}
              />
              <Text>in</Text>
              <Select
                value={session.roomId}
                onChange={(e) => handleChangeSessionField('recurring', index, "roomId", e.target.value)}
              >
                {allRooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </Select>
              <Icon
                as={MdAddCircleOutline}
                boxSize="6"
                color="#2D3748"
                cursor="pointer"
                onClick={() => {
                  onDeleteRowModalOpen();
                  setRowToDelete({ type: isRecurring ? 'recurring' : 'single', index });
                }}
              />
            </Flex>
          </Box>
        ))}
        <Button onClick={handleAddRecurringRow} colorScheme="teal" leftIcon={<MdAddCircleOutline />}>
          Add Row
        </Button>
      </Flex>
    </TabPanel>
  );

  const sessionsComponent = (
    <Box minH="10vh" width="100%" minW="100%" py={8}>
      <Card shadow="md" border="1px" borderColor="gray.300" borderRadius="15px">
        <CardBody m={6} display="flex" flexDirection="column" justifyContent="space-between">
          <Flex align="center" mb="15px" gap="10px">
            <SessionsBookmark />
            <Text fontSize="24px" fontWeight="700" color="#2D3748">
              {" "}
              Sessions{" "}
            </Text>
          </Flex>
          <Flex align="center" mb="15px" gap="10px">
            <Text fontSize="16px" fontWeight="500">starts on</Text>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} maxW="20%" />
            <Text fontSize="16px" fontWeight="500">and ends on</Text>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} maxW="20%" />
          </Flex>

          <Flex justify="space-between" align="center" mb={4}>
            <Tabs index={isRecurring ? 1 : 0} onChange={(index) => setIsRecurring(index === 1)} variant="enclosed" flex={1}>
              <TabList>
                <Tab>Single</Tab>
                <Tab>Recurring</Tab>
              </TabList>
            </Tabs>
            <Button onClick={() => setDeleteAll(true)} colorScheme="red" size="sm">
              Reset All Sessions
            </Button>
          </Flex>
          
          <TabPanels>
            {addSingle}
            {addRecurring}
          </TabPanels>
          
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
            <Button backgroundColor="#4441C8" onClick={onSaveSessionModalOpen}>
              <Text color="#FFFFFF">
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
              {allSessions.map((session) => (
                <Tr
                  key={session.id}
                  textColor={session.archived === true ? "#A0AEC0" : "#2D3748"}
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
                        {allRooms.find((room) => room.id === session.roomId)?.name || "N/A"}
                      </Text>
                    </Box>
                  </Td>
                  <Td>
                    <Icon
                      boxSize="7"
                      padding="5px"
                      borderRadius="6px"
                      backgroundColor="#EDF2F7"
                      color="black"
                    >
                      <EllipsisIcon />
                    </Icon>
                  </Td>
                </Tr>
              ))}
              </Tbody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>
    </Box>
  )

  return (
    <Navbar>
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
            fontSize="14px"
            fontWeight="600"
            borderRadius="6px"
            onClick={() => {
              if (isChanged) {
                onUnsavedSessionModalOpen();
              } else {
                navigate(`/programs/${eventId}`);
              }
            }}
          >
            <Icon
              as={ChevronLeftIcon}
              boxSize={5}
            />{" "}
            Programs
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

        {isChanged && <UnsavedChangesModal
          isOpen={isUnsavedSessionModalOpen}
          onClose={onUnsavedSessionModalClose}
          noSave={() => {
            onUnsavedSessionModalClose(); 
            navigate(`/programs/${eventId}`);}}
          save={handleGoBack}
        />}

      </Box>
    </Navbar>
  );
};