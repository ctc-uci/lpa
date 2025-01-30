import React, { useState, useEffect } from 'react';
import { Table, Thead, Tbody, Tr, Th, Td, TableContainer } from "@chakra-ui/react";
import { useNavigate } from 'react-router-dom';
import { useBackendContext } from "../../contexts/hooks/useBackendContext";

export const ProgramsTable = () => {
  const [programs, setPrograms] = useState([]);
  const { backend } = useBackendContext();
  const navigate = useNavigate();

  const fetchPrograms = async () => {
    try {
      const eventsResponse = await backend.get('/events');
      const eventsData = eventsResponse.data;

      const programsData = eventsData.map(event => ({
        id: event.id,
        name: event.name,
        description: event.description,
        // Placeholder values for fields we don't have yet
        status: 'Active',
        upcomingDate: 'TBD',
        upcomingTime: 'TBD',
        room: 'TBD',
        instructor: 'TBD',
        payee: 'TBD'
      }));

      setPrograms(programsData);
    } catch (error) {
      console.error('Failed to fetch programs:', error);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const handleRowClick = (id) => {
    navigate(`/programs/${id}`);
  };

  return (
    <TableContainer>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Program Name</Th>
            <Th>Status</Th>
            <Th>Upcoming Date</Th>
            <Th>Upcoming Time</Th>
            <Th>Room</Th>
            <Th>Instructor</Th>
            <Th>Payee</Th>
          </Tr>
        </Thead>
        <Tbody>
          {programs.map((program) => (
            <Tr key={program.id} onClick={() => handleRowClick(program.id)} cursor="pointer">
              <Td>{program.name}</Td>
              <Td>{program.status}</Td>
              <Td>{program.upcomingDate}</Td>
              <Td>{program.upcomingTime}</Td>
              <Td>{program.room || 'N/A'}</Td>
              <Td>{program.instructor}</Td>
              <Td>{program.payee}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

// What We Need From Tables

// Assignment (client_id, role), Events (id, name, archived), Bookings (date, start_time, end_time, room_id), Rooms (name), Client (name)


