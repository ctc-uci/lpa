import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Button,
} from '@chakra-ui/react';
import React, { useState, useEffect } from 'react';
import { useBackendContext } from "../contexts/hooks/useBackendContext";

export const EventsTable = () => {
    const { backend } = useBackendContext();
    const [ events, setEvents ] = useState([]);

    const fetchEvents = async () => {
        try {
            const eventsResponse = await backend.get('/events');
            const eventsData = eventsResponse.data;
            const eventsWithAssignments = [];

            for (const event of eventsData) {
                const instructors = [];
                const payees = [];
            
                try {
                    // Attempt to fetch assignment information for each event
                    const assignmentsResponse = await backend.get('/assignments/event/' + event.id);
                    const assignmentsData = assignmentsResponse.data;
    
                    // Process assignment information if available
                    if (Array.isArray(assignmentsData) && assignmentsData.length > 0) {
                        for (const assignment of assignmentsData) {
                            if (assignment.role.toLowerCase() === 'instructor') {
                                instructors.push(assignment.clientName);
                            } else if (assignment.role.toLowerCase() === 'payee') {
                                payees.push(assignment.clientName);
                            }
                        }
                    }
                } catch {
                    console.error('Failed to fetch assignments for event', event.id);
                }

                // Add event with assignments to list
                eventsWithAssignments.push({
                    id: event.id,
                    name: event.name,
                    description: event.description,
                    instructors: instructors.join(', '),
                    payees: payees.join(', ')
                });
                }

            setEvents(eventsWithAssignments);
        } catch {
            console.error('Failed to fetch events');
        }
    }

    useEffect(() => {
        // call the fetch event here to fetch all events
        fetchEvents();
    }, []);

    return (
        <Table variant="striped" colorScheme="teal">
          <Thead>
            <Tr>
              <Th>Class</Th>
              <Th>Description</Th>
              <Th>Instructor</Th>
              <Th>Payee</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {events.map((event) => (
              <Tr key={event.id}>
                <Td>{event.name}</Td>
                <Td>{event.description}</Td>
                <Td>{event.instructors}</Td>
                <Td>{event.payees}</Td>
                <Td>
                  <Menu>
                    <MenuButton
                      as={Button}
                      size="sm"
                      variant="outline"
                    >
                      Actions
                    </MenuButton>
                    <MenuList>
                      <MenuItem onClick={() => {}}>Edit</MenuItem>
                      <MenuItem onClick={() => {}}>Delete</MenuItem>
                    </MenuList>
                  </Menu>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
    );

};