import { useEffect, useState } from "react";

import "./Program.css";

import { ChevronLeftIcon} from "@chakra-ui/icons";
import { FileTextIcon } from "lucide-react";
import { Box, Flex, IconButton, Text, Icon } from "@chakra-ui/react";


import { useParams } from "react-router";

import { InfoIconRed } from "../../assets/InfoIconRed";
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

  const getProgram = async () => {
    try {
      const programResponse = await backend.get(`/events/${id}`);
      const programData = programResponse.data;
      setProgram(programData); // programData should have what Events table in DB model contains
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

        const rolesResponse = await backend.get(`/programs/${program.id}/roles`);
        nextBooking.instructors = rolesResponse.data.instructors;
        nextBooking.payees = rolesResponse.data.payees;
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

      // Only get activeSessions
      const activeSessions = sessionsData.filter(session => session.archived === false);
      setSessions(activeSessions);

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
      <Box style={{ width: "100%", padding: "20px 20px 20px 20px" }}>
        <Flex
          align="center"
          gap={2}
        >
          <Icon
            as={FileTextIcon}
            boxSize={6}
            color="gray.600"
          />
          <Text
            fontFamily="Inter"
            fontSize="24px"
            fontStyle="normal"
            fontWeight="700"
            lineHeight="normal"
          >
            Summary
          </Text>
        </Flex>
        {isArchived ? (
          <div id="infoRed">
            <InfoIconRed id="infoIcon" />
            <p>You are viewing an archived program</p>
          </div>
        ) : (
          <div></div>
        )}
        <ProgramSummary
          program={program}
          bookingInfo={nextBookingInfo}
          isArchived={isArchived}
          setIsArchived={setIsArchived}
          eventId={id}
          sessions={sessions}
        />
        <Sessions
          sessions={sessions}
          rooms={roomNames}
          isArchived={isArchived}
          setIsArchived={setIsArchived}
          eventId={id}
          refreshSessions={getSessions}
        />
      </Box>
    </Navbar>
  );
};
