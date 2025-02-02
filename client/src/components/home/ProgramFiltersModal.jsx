import React, { useEffect, useState } from "react";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Text,
  VStack,
  HStack,
  Box,
} from "@chakra-ui/react";

import calendarSvg from "../../assets/icons/calendar.svg";
import clockSvg from "../../assets/icons/clock.svg";
import activeSvg from "../../assets/icons/active.svg";
import pastSvg from "../../assets/icons/past.svg";

import { useBackendContext } from "../../contexts/hooks/useBackendContext";

export const ProgramFiltersModal = ({ isOpen, onClose, onApplyFilters }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [status, setStatus] = useState("all");
  const [room, setRoom] = useState("all");
  const [instructor, setInstructor] = useState("all");
  const [payee, setPayee] = useState("all");

  const [rooms, setRooms] = useState([]);
  const [clients, setClients] = useState([]);

  const { backend } = useBackendContext();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const roomsResponse = await backend.get("/rooms");
        setRooms(roomsResponse.data);

        const clientsResponse = await backend.get("/clients");
        setClients(clientsResponse.data);
      } catch (error) {
        console.error("Failed to fetch filter data:", error);
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
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Filter Programs</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* Date Filters */}
            <FormControl>
              <HStack alignItems="center" spacing={2} pb="3">
                <Box as="img" src={calendarSvg} alt="Calendar Icon" boxSize="20px" />
                <FormLabel mb="1">Date</FormLabel>
              </HStack>
              <HStack>
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
              </HStack>
            </FormControl>

            {/* Time Filters */}
            <FormControl>
              <HStack alignItems="center" spacing={2} pb="3">
                <Box as="img" src={clockSvg} alt="Clock Icon" boxSize="20px" />
                <FormLabel mt="1">Time</FormLabel>
              </HStack>
              <HStack>
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
              </HStack>
            </FormControl>

            {/* Status Buttons */}
            <FormControl>
              <FormLabel>Status</FormLabel>
              <HStack alignItems="center">
                <Button variant="outline" >
                  <Text mb="0">All</Text>
                </Button>
                <Button variant="outline" >
                  <Box as="img" src={activeSvg} alt="Active Icon" boxSize="20px" />
                  <Text ml="2" mb="0">Active</Text>
                </Button>
                <Button variant="outline">
                  <Box as="img" src={pastSvg} alt="Past Icon" boxSize="20px" />
                  <Text ml="2">Past</Text>
                </Button>
              </HStack>
            </FormControl>

            {/* Room Selection as Pills/Chips */}
            <FormControl>
              <FormLabel>Room</FormLabel>
              <HStack>
                {["All", "Community", "Lounge", "Theater"].map((r) => (
                  <Button
                    key={r}
                    colorScheme={room === r ? "purple" : "gray"}
                    onClick={() => setRoom(r)}
                  >
                    {r}
                  </Button>
                ))}
              </HStack>
            </FormControl>

            {/* Instructor Dropdown */}
            <FormControl>
              <FormLabel>Instructor(s)</FormLabel>
              <Select value={instructor} onChange={(e) => setInstructor(e.target.value)}>
                <option value="all">All</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.name}>
                    {client.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            {/* Payee Dropdown */}
            <FormControl>
            <FormLabel>Payee</FormLabel>
              <Select
                value={payee}
                onChange={(e) => setPayee(e.target.value)}
              >
                <option value="all">All</option>
                {clients.map((client) => (
                  <option
                    key={client.id}
                    value={client.name}
                  >
                    {client.name}
                  </option>
                ))}
              </Select>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="purple" onClick={handleApply}>
            Apply
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ProgramFiltersModal;
