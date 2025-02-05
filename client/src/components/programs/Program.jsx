import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { ProgramSummary, Sessions } from './ProgramComponents';
import Navbar from '../Navbar';
import {
  Box,
  Text,
  Flex,
} from "@chakra-ui/react"
import { useBackendContext } from '../../contexts/hooks/useBackendContext';

export const Program = () => {
  const { id } = useParams();
  const { backend } = useBackendContext();
  const [ program, setProgram ] = useState(null);
  const [ sessions, setSessions ] = useState(null);
  const [ roomIds, setRoomIds ] = useState(null);
  const [ roomNames, setRoomNames] = useState(null);
  const [ nextRoom, setNextRoom ] = useState(null);
  const [ nextBookingInfo, setNextBookingInfo ] = useState(null);


  const getProgram = async () => {
    try {
      const programResponse = await backend.get(`/events/${id}`);
      const programData = programResponse.data;
      setProgram(programData); // programData should have what Events table in DB model contains
    } catch {
      console.log("From getProgram: ", error);
    }
  };


  const getNextRoom = async () => {
    try {
      const nextSession = sessions?.find(session => !session.archived);

      if (!nextSession) {
        console.log("No upcoming sessions found");
        return;
      }

      const roomResponse = await backend.get(`/rooms/${nextSession.roomId}`);
      setNextRoom(roomResponse.data[0]);
    }catch {
      console.log("From getNextRoom: ", error);
    }

  }

  const getNextBookingInfo = async () => {
    try {
      const nextBooking = {
        nextSession: {},
        nextRoom:{},


      };
      const nextSession = sessions?.find(session => !session.archived);

      if (!nextSession) {
        console.log("No upcoming sessions found");
        return;
      }
      nextBooking.nextSession = nextSessio
      const roomResponse = await backend.get(`/rooms/${nextBooking.nextSession.roomId}`);
      setNextRoom(roomResponse.data[0]);
      nextBooking.nextRoom = roomResponse.data[0]


      const assignmentResponse = await backend.get(`/assigments/event/${nextBooking.nextSession.id}`);




  const getSessions = async () => {
    try {
      const sessionsResponse = await backend.get(`bookings/event/${id}`);
      const sessionsData = sessionsResponse.data;
      setSessions(sessionsData);
      // Get set of room ids
      const uniqueRoomIds = [...new Set(sessionsData.map(session => session.roomId))];
      setRoomIds(uniqueRoomIds);

    } catch {
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
    } catch {
      console.log("From getRoomNames: ", error);
    }
  }

  useEffect(() => {
    getProgram();
    getSessions();

  }, [id]);

  useEffect(() => {
    if (roomIds) {
      getRoomNames();
      getNextRoom();
    }
  }, [roomIds]);

  return (
    <Flex>
      <Navbar/>
      <Box>
        <ProgramSummary program={program} nextRoom={nextRoom} sessions = {sessions}/>
        <Sessions sessions={sessions} rooms={roomNames}/>
      </Box>
    </Flex>
  );
};
}
