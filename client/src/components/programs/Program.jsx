import { useEffect, useState } from "react";

import "./Program.css";

import { ChevronLeftIcon } from "@chakra-ui/icons";
import { Box, Button, Flex, Icon, Text } from "@chakra-ui/react";

import { useLocation, useParams } from "react-router";
import { useNavigate } from "react-router-dom";

import { EyeIcon } from "../../assets/EyeIcon";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import Navbar from "../navbar/Navbar";
import { ProgramSummary, Sessions } from "./ProgramComponents";

export const Program = () => {
  const { id } = useParams();
  const { backend } = useBackendContext();
  const [program, setProgram] = useState(null);
  const [sessions, setSessions] = useState(null);
  const [roomIds, setRoomIds] = useState(null);
  const [roomNames, setRoomNames] = useState(null);
  const [nextBookingInfo, setNextBookingInfo] = useState(null);
  const [isArchived, setIsArchived] = useState(false);
  const [assignments, setAssignments] = useState(false);
  const [instructors, setInstructors] = useState([]);
  const [payees, setPayees] = useState([]);
  const [infoLoaded, setInfoLoaded] = useState({
    program: false,
    assignments: false,
    bookings: false,
  });
  const location = useLocation();
  const navigate = useNavigate();

  const getProgram = async () => {
    try {
      const programResponse = await backend.get(`/events/${id}`);
      const programData = programResponse.data;
      setProgram(programData); // programData should have what Events table in DB model contains
      setIsArchived(programData[0].archived);
    } catch {
      console.log("From getProgram: ", error);
    } finally {
      setInfoLoaded((prev) => ({
        ...prev,
        program: true,
      }));
    }
  };

  const getAssignments = async () => {
    const assignmentsResponse = await backend.get(`/assignments/event/${id}`);

    const newInstructors = [];
    const newPayees = [];

    for (const assignment of assignmentsResponse.data) {
      try {
        const clientResponse = await backend.get(
          `/clients/${assignment.clientId}`
        );
        const assignmentWithClient = {
          ...assignment,
          clientName: clientResponse.data.name,
          clientEmail: clientResponse.data.email,
        };

        if (assignment.role === "instructor") {
          newInstructors.push(assignmentWithClient);
        } else if (assignment.role === "payee") {
          newPayees.push(assignmentWithClient);
        }
      } catch (clientError) {
        console.error(
          `Failed to fetch client ${assignment.clientId} for assignment`,
          assignment,
          clientError
        );
      }
    }
    setInstructors(newInstructors);
    setPayees(newPayees);
  };

  const getNextBookingInfo = async () => {
    try {
      const nextBooking = {
        nextSession: {},
        nextRoom: {},
        assignments: {},
        instructors: [],
        payees: [],
      };

      const nextSession = sessions?.find((session) => (!session.archived || isArchived));

      if (!nextSession) {
        console.log("No upcoming sessions found");
        return;
      }

      nextBooking.nextSession = nextSession;
      const roomResponse = await backend.get(
        `/rooms/${nextBooking.nextSession.roomId}`
      );
      nextBooking.nextRoom = roomResponse.data[0];
      nextBooking.assignments = assignments;
      nextBooking.instructors = instructors;
      nextBooking.payees = payees;
      setNextBookingInfo(nextBooking);
    } catch (error) {
      console.log("From getNextBookingInfo: ", error);
    }
  };

  const getSessions = async () => {
    try {
      const sessionsResponse = await backend.get(`bookings/byEvent/${id}`);
      const sessionsData = sessionsResponse.data;

      // Only get activeSessions
      const activeSessions = sessionsData.filter(
        (session) => session.archived === false || isArchived
      );
      setSessions(activeSessions);

      const uniqueRoomIds = [
        ...new Set(sessionsData.map((session) => session.roomId)),
      ];
      setRoomIds(uniqueRoomIds);
    } catch (error) {
      console.log("From getSessions: ", error);
    } finally {
      setInfoLoaded((prev) => ({
        ...prev,
        bookings: true,
      }));
    }
  };

  // Use set of room ids to create map of room id to name, pass map into sessions component
  const getRoomNames = async () => {
    try {
      const roomMap = new Map();
      for (const roomId of roomIds) {
        const roomResponse = await backend.get(`rooms/${roomId}`);
        const roomData = roomResponse.data[0];
        // Store the full room data object instead of just the name
        roomMap.set(roomId, {
          name: roomData.name,
          rate: roomData.rate,
          description: roomData.description,
        });
      }
      setRoomNames(roomMap);
    } catch (error) {
      console.log("From getRoomNames: ", error);
    }
  };
  useEffect(() => {
    const getData = async () => {
      await getProgram().then(() => {
        console.log("Program data refreshed");
        setInfoLoaded((prev) => ({ ...prev, program: true }));
      });

      await getSessions().then(() => {
        console.log("Sessions data refreshed");
        setInfoLoaded((prev) => ({ ...prev, bookings: true }));
      });

      await getAssignments().then(() => {
        console.log("Assignments data refreshed: ", instructors);
        setInfoLoaded((prev) => ({ ...prev, assignments: true }));
      });
    };
    getData();
  }, [id, location.key]);

  const exit = () => {
    if (isArchived) {
      navigate("/programs/archived");
    } else {
      navigate("/programs");
    }
  };

  useEffect(() => {
    if (roomIds) {
      getRoomNames();
    }
  }, [roomIds]);

  useEffect(() => {
    if (program && sessions && instructors.length > 0) {
      getNextBookingInfo();
    }
  }, [program, sessions, instructors, payees]);

  return (
    <Navbar>
      <Box
        padding={"20px 20px 20px 20px"}
        width={"100%"}
      >
        {isArchived ? (
          <Flex
            gap={"12px"}
            justifyContent={"space-between"}
            alignItems={"center"}
            padding={"12px 16px"}
            bgColor={"F8F8FF"}
          >
            <Button
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
              gap={"2"}
              marginRight={"40%"}
            >
              <EyeIcon />
              <Text
                color={"#2D3748"}
                fontSize={"16px"}
                fontWeight={"700"}
              >
                Viewing Achived Program
              </Text>
            </Flex>
          </Flex>
        ) : (
          <Flex
            gap={"12px"}
            padding={"12px 16px"}
            bgColor={"F8F8FF"}
          >
            <Button
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
        )}
        {Object.values(infoLoaded).every(Boolean) && (
          <ProgramSummary
            program={program}
            bookingInfo={nextBookingInfo}
            isArchived={isArchived}
            setIsArchived={setIsArchived}
            eventId={id}
            sessions={sessions}
            instructors={instructors}
            payees={payees}
            rooms={roomNames}
          />
        )}
        {Object.values(infoLoaded).every(Boolean) && (
          <Sessions
            sessions={sessions}
            rooms={roomNames}
            isArchived={isArchived}
            setIsArchived={setIsArchived}
            eventId={id}
            refreshSessions={getSessions}
            instructors={instructors}
            payees={payees}
          />
        )}
      </Box>
    </Navbar>
  );
};
