import React, { useState, useEffect } from 'react';
import { Table, Thead, Tbody, Tr, Th, Td, TableContainer, Menu, MenuButton, MenuList, MenuItem, IconButton, Input, Button } from "@chakra-ui/react";
import { useNavigate } from 'react-router-dom';
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { FiMoreVertical, FiFilter } from 'react-icons/fi';

export const ProgramsTable = () => {
  const [programs, setPrograms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { backend } = useBackendContext();
  const navigate = useNavigate();

  const fetchPrograms = async () => {
    try {
      const eventsResponse = await backend.get('/events');
      const bookingsResponse = await backend.get('/bookings');
      const eventsData = eventsResponse.data;
      const bookingsData = bookingsResponse.data;
  
      const currentDate = new Date();
  
      const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { weekday: 'short', month: '2-digit', day: '2-digit', year: 'numeric' };
        return date.toLocaleDateString('en-US', options).replace(/,/g, '.');
      };
  
      const formatTime = (timeString) => {
        const [hours, minutes] = timeString.split(':');
        const date = new Date(2000, 0, 1, hours, minutes);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }).toLowerCase();
      };
  
      const programsData = eventsData.map(event => {
        const eventBookings = bookingsData.filter(booking => booking.eventId === event.id);
        const upcomingBookings = eventBookings.filter(booking => new Date(booking.date) > currentDate);
        const upcomingBooking = upcomingBookings.length > 0 
          ? upcomingBookings.reduce((earliest, current) => 
              new Date(current.date) < new Date(earliest.date) ? current : earliest
            )
          : null;
  
        return {
          id: event.id,
          name: event.name,
          description: event.description,
          status: upcomingBooking ? 'Active' : (eventBookings.length > 0 ? 'Past' : 'No bookings'),
          upcomingDate: upcomingBooking ? formatDate(upcomingBooking.date) : 'No upcoming bookings',
          upcomingTime: upcomingBooking 
            ? `${formatTime(upcomingBooking.startTime)} - ${formatTime(upcomingBooking.endTime)}` 
            : 'N/A',
          room: 'TBD',
          instructor: 'TBD',
          payee: 'TBD'
        };
      });
  
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

  const handleEdit = (id, e) => {
    e.stopPropagation();
    navigate(`/programs/${id}`);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await backend.delete(`/events/${id}`);
      setPrograms(programs.filter(program => program.id !== id));
    } catch (error) {
      console.error('Failed to delete program:', error);
    }
  };

  const filteredPrograms = programs.filter(program =>
    program.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div>
        <Button leftIcon={<FiFilter />}>Filters</Button>
        <Input 
          placeholder="Search programs" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
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
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredPrograms.map((program) => (
              <Tr key={program.id} onClick={() => handleRowClick(program.id)} cursor="pointer">
                <Td>{program.name}</Td>
                <Td>{program.status}</Td>
                <Td>{program.upcomingDate}</Td>
                <Td>{program.upcomingTime}</Td>
                <Td>{program.room}</Td>
                <Td>{program.instructor}</Td>
                <Td>{program.payee}</Td>
                <Td onClick={(e) => e.stopPropagation()}>
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      aria-label='Options'
                      icon={<FiMoreVertical />}
                      variant='outline'
                    />
                    <MenuList>
                      <MenuItem onClick={(e) => handleEdit(program.id, e)}>Edit</MenuItem>
                      <MenuItem onClick={(e) => handleDelete(program.id, e)}>Delete</MenuItem>
                    </MenuList>
                  </Menu>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </>
  );
};

// What We Need From Tables

// Assignment (client_id, role), Events (id, name, archived), Bookings (date, start_time, end_time, room_id), Rooms (name), Client (name)


