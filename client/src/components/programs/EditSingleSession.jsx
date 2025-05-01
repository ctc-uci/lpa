import { useEffect, useState } from "react";

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
  useDisclosure, 
  Tbody} from "@chakra-ui/react";
import { ChevronLeftIcon } from "@chakra-ui/icons";
import { EllipsisIcon } from "lucide-react";

import Navbar from "../navbar/Navbar";
import { SessionsBookmark } from "../../assets/SessionsBookmark";
import { MdFeaturedPlayList } from "../../assets/MdFeaturedPlayList";
import { FilledOutCalendar } from "../../assets/FilledOutCalendar";
import {
  sessionsClock,
  sessionsMapPin,
} from "../../assets/icons/ProgramIcons";

import DateSortingModal from "../filters/DateFilter";
import { SaveSessionModal } from "../popups/SaveSessionModal";
import { UnsavedChangesModal } from "../popups/UnsavedChangesModal";


export const EditSingleSession = () => {
  const { id } = useParams();
  const { backend } = useBackendContext();
  const navigate = useNavigate();

  const { isOpen: isSaveSessionModalOpen,
          onOpen: onSaveSessionModalOpen, 
          onClose: onSaveSessionModalClose } = useDisclosure();

  const { isOpen: isUnsavedSessionModalOpen,
          onOpen: onUnsavedSessionModalOpen, 
          onClose: onUnsavedSessionModalClose } = useDisclosure();

  // Function to update sorting
  const handleSortChange = (key, order) => {
    setSortKey(key);
    setSortOrder(order);
  };

  const normalizeDate = (isoString) => {
    if (!isoString) return "";
    return isoString.split("T")[0];
  };
  
  const normalizeTime = (timeString) => {
    if (!timeString) return "";
    const parts = timeString.split(":");
    return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
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
    const [hours, minutes] = timeString.split(":").map(Number)
    const period = hours >= 12 ? "p.m." : "a.m.";
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  // States for single session
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [room, setRoom] = useState("");
  const [eventId, setEventId] = useState("");
  const [isChanged, setIsChanged] = useState(false);

  // States for general information
  const [allRooms, setAllRooms] = useState([]);
  const [allSessions, setAllSessions] = useState([]);
  const [programName, setProgramName] = useState("");

  const updateSingleSessionField = (field, value) => {
    setAllSessions((prev) =>
      prev.map((session) =>
        Number(session.id) === Number(id)
          ? { ...session, [field]: value }
          : session
      )
    );
    setIsChanged(true);
  };

  const saveChanges = async () => {
    // TODO: complete delete functionality and check if the session is deleted
    try {
      const updatedSession = allSessions.find((session) => Number(session.id) === Number(id));
      const convertedSession = {
        event_id: updatedSession.eventId,
        room_id: updatedSession.roomId,
        start_time: updatedSession.startTime,
        end_time: updatedSession.endTime,
        date: updatedSession.date,
        archived: updatedSession.archived
      };
      const response = await backend.put(`/bookings/${id}`, convertedSession);
      console.log("Updated session:", response.data);
    }
    catch (error) {
      console.error("Error updating session:", error);
    }
  };

  const handleGoBack = () => {
      saveChanges();
      navigate(`/programs/${eventId}`);
  };

  const fetchAllRooms = async () => {
    // TODO: only fetch rooms that are available at the given date/time
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
      // Fetch single session
      const singleSessionResponse = await backend.get(`/bookings/${id}`);
      const singleSessionData = singleSessionResponse.data;
      console.log("Single session:", singleSessionData);
  
      setDate(normalizeDate(singleSessionData[0].date));
      setStartTime(normalizeTime(singleSessionData[0].startTime));
      setEndTime(normalizeTime(singleSessionData[0].endTime));
      setRoom(singleSessionData[0].roomId);
      setEventId(singleSessionData[0].eventId);
  
      // Fetch all sessions
      try {
        const allSessionsResponse = await backend.get(`/bookings/byEvent/${singleSessionData[0].eventId}`);
        const allSessionsData = allSessionsResponse.data;
        console.log("All sessions:", allSessionsData);
        setAllSessions(allSessionsData);
  
        // Fetch program name
        try {
          const programResponse = await backend.get(`/events/${singleSessionData[0].eventId}`);
          const programData = programResponse.data;
          console.log("Program:", programData);
          setProgramName(programData[0].name);
        } catch (programError) {
          console.error("Error fetching program name:", programError);
        }
      } catch (allSessionError) {
        console.error("Error processing session data or fetching all sessions:", allSessionError);
      }
    } catch (singleSessionError) {
      console.error("Error fetching single session:", singleSessionError);
    }
  };
  
  // Call the functions
  useEffect(() => {
    fetchAllRooms();
    fetchAllInfo();
  }, [id]);

  const singleSessionComponent = (
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
          <Flex
            align="center"
            mb="15px"
            gap="10px"
          >
            <SessionsBookmark />
            <Text
              fontSize="24px"
              fontWeight="700"
              color="#2D3748"
            >
              {" "}
              Single Sessions{" "}
            </Text>
          </Flex>
          <Box
            m={1}
            display="flex"
            flexDirection="row"
            alignItems="center"
            gap="15px"
          >
            <Text>On</Text>
          
            <Input
              type="date"
              value={date}
              maxW="15%"
              onChange={(e) => {
                const newDate = e.target.value;
                setDate(newDate);
                updateSingleSessionField("date", new Date(newDate).toISOString()); 
              }}
            />

            <Text>from</Text>

            <Input
              type="time"
              value={startTime}
              maxW="11%"
              onChange={(e) => {
                const newStartTime = e.target.value;
                setStartTime(newStartTime);
                updateSingleSessionField("startTime", newStartTime + ":00+00");
              }}
            />

            <Text>to</Text>

            <Input
              type="time"
              value={endTime}
              maxW="11%"
              onChange={(e) => {
                const newEndTime = e.target.value;
                setEndTime(newEndTime);
                updateSingleSessionField("endTime", newEndTime + ":00+00");
              }}
            />

            <Text>in</Text>

            <Select
              placeholder="Select room"
              border="1px solid lightgray"
              borderRadius="md"
              maxW="20%"
              value={room}
              onChange={(e) => {
                const newRoom = e.target.value;
                setRoom(newRoom);
                updateSingleSessionField("roomId", Number(newRoom));
              }}
            >
              {allRooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </Select>
          </Box>
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
                  backgroundColor={Number(session.id) === Number(id) ? "#F8F8FF" : "white"}
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

        {singleSessionComponent}
        {previewSession}

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