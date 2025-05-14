import { useEffect, useState } from "react";

import "./Program.css";

import { ChevronLeftIcon} from "@chakra-ui/icons";
import { Box } from "@chakra-ui/react";
import { useParams, useLocation } from "react-router";
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
  const [ assignments, setAssignments ] = useState(false);
  const [ instructors, setInstructors ] = useState([]);
  const [ payees, setPayees ] = useState([]);
  const [infoLoaded, setInfoLoaded] = useState({
    program: false,
    assignments: false,
    bookings: false,
  });
  const location = useLocation();

  const getProgram = async () => {
    try {
      const programResponse = await backend.get(`/events/${id}`);
      const programData = programResponse.data;
      setProgram(programData); // programData should have what Events table in DB model contains
      setIsArchived(programData[0].archived);
    } catch {
      console.log("From getProgram: ", error);
    }
    finally {
      setInfoLoaded(prev => ({
        ...prev,
        program: true,
      }));

    }
  };

  const getAssignments = async () => {
      const assignmentsResponse = await backend.get(
        `/assignments/event/${id}`
      );

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
          console.error(`Failed to fetch client ${assignment.clientId} for assignment`, assignment, clientError);
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
      const activeSessions = sessionsData.filter(session => session.archived === false);
      setSessions(activeSessions);

      const uniqueRoomIds = [
        ...new Set(sessionsData.map((session) => session.roomId)),
      ];
      setRoomIds(uniqueRoomIds);
    } catch (error) {
      console.log("From getSessions: ", error);
    }
    finally {
      setInfoLoaded(prev => ({
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
        const roomData = roomResponse.data;
        roomMap.set(roomId, roomData[0].name);
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
  }
  getData();
}, [id, location.key]);

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
        { Object.values(infoLoaded).every(Boolean) && <ProgramSummary
          program={program}
          bookingInfo={nextBookingInfo}
          isArchived={isArchived}
          setIsArchived={setIsArchived}
          eventId={id}
          sessions={sessions}
          instructors={instructors}
          payees={payees}
        /> }
        { Object.values(infoLoaded).every(Boolean) && <Sessions
          sessions={sessions}
          rooms={roomNames}
          isArchived={isArchived}
          setIsArchived={setIsArchived}
          eventId={id}
          refreshSessions={getSessions}
          instructors={instructors}
          payees={payees}
        /> }
      </Box>
    </Navbar>
  );
};
