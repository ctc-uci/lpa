import { useEffect, useState } from "react";
import './Program.css';
import { Box, Flex, Text, IconButton } from "@chakra-ui/react";

import { useParams } from "react-router";

import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import Navbar from "../navbar/Navbar";
import { ProgramSummary, Sessions } from "./ProgramComponents";
import { ChevronLeftIcon } from "@chakra-ui/icons";

export const Program = () => {
  const { id } = useParams();
  const { backend } = useBackendContext();
  const [program, setProgram] = useState(null);
  const [programName, setProgramName] = useState("");
  const [sessions, setSessions] = useState(null);
  const [roomIds, setRoomIds] = useState(null);
  const [roomNames, setRoomNames] = useState(null);
  const [nextBookingInfo, setNextBookingInfo] = useState({
    nextSession: {},
    nextRoom: {},
    assignments: {},
    instructors: [],
    payees: [],
  });
  const [isArchived, setIsArchived] = useState(false);

  const getProgram = async () => {
    try {
      const programResponse = await backend.get(`/events/${id}`);
      const programData = programResponse.data;
      setProgram(programData); // programData should have what Events table in DB model contains
      setProgramName(programData[0].name);
      setIsArchived(programData[0].archived);
    } catch {
      console.log("From getProgram: ", error);
    }
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

      const nextSession = sessions?.find((session) => !session.archived);

      if (!nextSession) {
        console.log("No upcoming sessions found");
        return;
      }

      nextBooking.nextSession = nextSession;
      const roomResponse = await backend.get(
        `/rooms/${nextBooking.nextSession.roomId}`
      );
      nextBooking.nextRoom = roomResponse.data[0];

      const assignmentsResponse = await backend.get(
        `/assignments/event/${program[0].id}`
      );

      nextBooking.assignments = assignmentsResponse.data;

      for (const assignment of assignmentsResponse.data) {
        const clientResponse = await backend.get(
          `/clients/${assignment.clientId}`
        );
        const assignmentWithClient = {
          ...assignment,
          clientName: clientResponse.data.name,
          clientEmail: clientResponse.data.email,
        };

        if (assignment.role === "instructor") {
          nextBooking.instructors.push(assignmentWithClient);
        } else if (assignment.role === "payee") {
          nextBooking.payees.push(assignmentWithClient);
        }
      }

      setNextBookingInfo(nextBooking);
    } catch (error) {
      console.log("From getNextBookingInfo: ", error);
    }
  };

  const getSessions = async () => {
    try {
      const sessionsResponse = await backend.get(`bookings/byEvent/${id}`);
      const sessionsData = sessionsResponse.data;
      setSessions(sessionsData);
      // Get set of room ids
      const uniqueRoomIds = [
        ...new Set(sessionsData.map((session) => session.roomId)),
      ];
      setRoomIds(uniqueRoomIds);

    } catch (error) {
      console.log("From getSessions: ", error);
    }
  };

  // Use set of room ids to create map of room id to name, pass map into sessions component
  const getRoomNames = async () => {
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

  useEffect(() => {
    getProgram();
    getSessions();
  }, [id]);

  useEffect(() => {
    if (roomIds) {
      getRoomNames();
    }
  }, [roomIds]);

  useEffect(() => {
    if (program && sessions) {
      getNextBookingInfo();
    }
  }, [program, sessions]);

  return (
    <Navbar>
      <Box style={{width: "100%", padding: "20px 20px 20px 20px"}}>
          <ProgramSummary
            program={program}
            bookingInfo={nextBookingInfo}
            isArchived={isArchived}
            setIsArchived={setIsArchived}
            eventId={id}
          />
          <Sessions
            programName={programName}
            sessions={sessions}
            rooms={roomNames}
            instructors={nextBookingInfo.instructors}
            payees={nextBookingInfo.payees}
            isArchived={isArchived}
            setIsArchived={setIsArchived}
            eventId={id}
          />
      </Box>
    </Navbar>
  );
};
