// ProgramFiltersModal.jsx

import React, { useEffect, useState } from "react";

import {
  Box,
  Button,
  ButtonGroup,
  FormControl,
  FormLabel,
  HStack,
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
} from "@chakra-ui/react";

import activeSvg from "../../assets/icons/active.svg";
// Icons for styling
import calendarSvg from "../../assets/icons/calendar.svg";
import clockSvg from "../../assets/icons/clock.svg";
import locationSvg from "../../assets/icons/location.svg";
import pastSvg from "../../assets/icons/past.svg";
import personSvg from "../../assets/icons/person.svg";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";

export const ProgramFiltersModal = ({ isOpen, onClose, onApplyFilters }) => {
  // State for filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [status, setStatus] = useState("all");
  const [room, setRoom] = useState("all");
  const [instructor, setInstructor] = useState("all");
  const [payee, setPayee] = useState("all");

  // State for data fetching
  const [rooms, setRooms] = useState([]);
  const [clients, setClients] = useState([]);

  const { backend } = useBackendContext();

  // Fetch rooms & clients on mount
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

  // Called when user clicks "Apply"
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Filter Programs</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack
            spacing={4}
            align="stretch"
          >
            {/* === DATE FILTERS === */}
            <FormControl>
              <HStack
                alignItems="center"
                spacing={2}
                pb="3"
              >
                <Box
                  as="img"
                  src={calendarSvg}
                  alt="Calendar Icon"
                  boxSize="20px"
                />
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

            {/* === TIME FILTERS === */}
            <FormControl>
              <HStack
                alignItems="center"
                spacing={2}
                pb="3"
              >
                <Box
                  as="img"
                  src={clockSvg}
                  alt="Clock Icon"
                  boxSize="20px"
                />
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

            {/* === STATUS FILTER (BUTTON GROUP) === */}
            <FormControl>
              <FormLabel>Status</FormLabel>
              <HStack alignItems="center">
                <ButtonGroup variant="outline" spacing={3} colorScheme="purple">
                  <Button 
                    borderRadius="full"
                    borderWidth="2px"
                    color={status === "all" ? "purple.500" : "gray.300"}
                    _hover={{ bg: "purple.100" }}
                    onClick={() => setStatus("all")}
                  >
                    <Text mb="0">All</Text>
                  </Button>
                  {/* ACTIVE */}
                  <Button 
                    borderRadius="full"
                    borderWidth="2px"
                    color={status === "active" ? "purple.500" : "gray.300"}
                    onClick={() => setStatus("active")}
                  >
                    <Box as="img" src={activeSvg} alt="Active Icon" boxSize="20px" />
                    <Text ml="2" mb="0">Active</Text>
                  </Button>
                  <Button
                    borderRadius="full"
                    borderWidth="2px"
                    color={status === "past" ? "purple.500" : "gray.300"}
                    onClick={() => setStatus("past")}
                  >
                    <Box as="img" src={pastSvg} alt="Past Icon" boxSize="20px" />
                    <Text ml="2">Past</Text>
                  </Button>
                </ButtonGroup>
              </HStack>
            </FormControl>

            {/* === ROOM FILTER (PILL BUTTONS) === */}
            <FormControl>
              <HStack>
                <Box as="img" src={locationSvg} alt="Location Icon" boxSize="20px" />
                <FormLabel mt={1}>Room</FormLabel>
              </HStack>
              <HStack
                spacing={2}
                wrap="wrap"
              >
                {/* "All" pill */}
                <Button
                  variant="outline"
                  borderRadius="full"
                  borderWidth="2px"
                  color={room === "all" ? "purple.500" : "gray.300"}
                  colorScheme="purple"
                  onClick={() => setRoom("all")}
                >
                  All
                </Button>

                {/* Each room from the backend */}
                {rooms.map((r) => (
                  <Button
                    key={r.id}
                    variant="outline"
                    borderRadius="full"
                    borderWidth="2px"
                    color={room === r.name ? "purple.500" : "gray.300"}
                    colorScheme="purple"
                    onClick={() => setRoom(r.name)}
                  >
                    {r.name}
                  </Button>
                ))}
              </HStack>
            </FormControl>

            {/* === INSTRUCTOR DROPDOWN === */}
            <FormControl>
              <HStack>
                <Box as="img" src={personSvg} alt="Person Icon" boxSize="20px" />
                <FormLabel>Instructor(s)</FormLabel>
              </HStack>
              <Select
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
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

            {/* === PAYEE DROPDOWN === */}
            <FormControl>
              <HStack>
                <Box as="img" src={personSvg} alt="Person Icon" boxSize="20px" />
                <FormLabel>Payee</FormLabel>
              </HStack>
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
          <Button
            variant="outline"
            onClick={onClose}
            mr={3}
          >
            Cancel
          </Button>
          <Button
            colorScheme="purple"
            onClick={handleApply}
          >
            Apply
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ProgramFiltersModal;
