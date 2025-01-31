// i needa fix indendation and other stuff on this its mainly chatgptd lol
// also TODO FIX THE TIME FILTERS FOR SOME REASON THEHY DONT WORK YETGA

import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
} from "@chakra-ui/react";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";

export const ProgramFiltersModal = ({ isOpen, onClose, onApplyFilters }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [status, setStatus] = useState('all');
  const [room, setRoom] = useState('all');
  const [instructor, setInstructor] = useState('all');
  const [payee, setPayee] = useState('all');

  const [rooms, setRooms] = useState([]);
  const [clients, setClients] = useState([]);

  const { backend } = useBackendContext();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const roomsResponse = await backend.get('/rooms');
        setRooms(roomsResponse.data);

        const clientsResponse = await backend.get('/clients');
        setClients(clientsResponse.data);
      } catch (error) {
        console.error('Failed to fetch filter data:', error);
      }
    };

    fetchData();
  }, [backend]);

  const handleApply = () => {
    onApplyFilters({
      dateRange: { start: startDate, end: endDate },
      timeRange: { start: startTime, end: endTime },
      status,
      room,
      instructor,
      payee,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Filter Programs</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Date Range</FormLabel>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Start Date"
              />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="End Date"
              />
            </FormControl>
            <FormControl>
              <FormLabel>Time Range</FormLabel>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Status</FormLabel>
              <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="past">Past</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Room</FormLabel>
              <Select value={room} onChange={(e) => setRoom(e.target.value)}>
                <option value="all">All</option>
                {rooms.map((room) => (
                    <option key={room.id} value={room.name}>{room.name}</option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
                <FormLabel>Instructor</FormLabel>
                <Select value={instructor} onChange={(e) => setInstructor(e.target.value)}>
                    <option value="all">All</option>
                    {clients.map((client) => (
                    <option key={client.id} value={client.name}>{client.name}</option>
                    ))}
                </Select>
            </FormControl>

            <FormControl>
                <FormLabel>Payee</FormLabel>
                <Select value={payee} onChange={(e) => setPayee(e.target.value)}>
                    <option value="all">All</option>
                    {clients.map((client) => (
                    <option key={client.id} value={client.name}>{client.name}</option>
                    ))}
                </Select>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleApply}>
            Apply Filters
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};