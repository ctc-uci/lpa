import React, { useEffect, useState } from "react";

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
} from "@chakra-ui/react";

import { useBackendContext } from "../contexts/hooks/useBackendContext";

export const AddClassModal = ({ isOpen, onClose }) => {
  const { backend } = useBackendContext();

  const [rooms, setRooms] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Bookings part
  const [bookingsForm, setBookingsForm] = useState({
    event_id: "",
    room_id: "",
    start_time: "",
    end_time: "",
    date: "",
    archived: false,
  });

  // Events part
  const [eventsForm, setEventsForm] = useState({
    name: "",
    description: "",
    archived: false,
  });

  const getDatesForDays = (startDate, endDate, selectedDays) => {
    const daysMap = { Su: 0, M: 1, Tu: 2, W: 3, Th: 4, F: 5, S: 6 };
    const daysIndices = selectedDays.map((day) => daysMap[day]);

    const dates = [];
    const currentDate = new Date(startDate);
    const lastDate = new Date(endDate);

    while (currentDate <= lastDate) {
      if (daysIndices.includes(currentDate.getUTCDay())) {
        dates.push(new Date(currentDate).toISOString().split("T")[0]);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  const handleSubmit = async () => {
    try {
      // 1) Create the event
      const eventResponse = await backend.post("/events", eventsForm);
      const eventId = eventResponse.data.id;

      // 2) Generate all relevant dates
      const dates = getDatesForDays(startDate, endDate, selectedDays);

      // 3) Post each booking
      for (const date of dates) {
        const bookingData = {
          ...bookingsForm,
          event_id: eventId,
          date: date,
        };
        const bookingsResponse = await backend.post("/bookings", bookingData);
        console.log("Created booking:", bookingsResponse.data);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await backend.get("/rooms");
        setRooms(response.data);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };

    fetchData();
  }, [backend]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Class</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl>
            <FormLabel>Name</FormLabel>
            <Input
              placeholder="Enter name"
              value={eventsForm.name}
              onChange={(e) =>
                setEventsForm({ ...eventsForm, name: e.target.value })
              }
            />
          </FormControl>

          <FormControl>
            <FormLabel>Description</FormLabel>
            <Input
              placeholder="Enter description"
              value={eventsForm.description}
              onChange={(e) =>
                setEventsForm({ ...eventsForm, description: e.target.value })
              }
            />
          </FormControl>

          <FormControl mt={4}>
            <FormLabel>Room</FormLabel>
            <Select
              placeholder="Select Room"
              onChange={(e) => {
                setBookingsForm((prevForm) => ({
                  ...prevForm,
                  room_id: e.target.value,
                }));
              }}
            >
              {rooms.map((room) => (
                <option
                  key={room.id}
                  value={room.id}
                >
                  {room.name}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Days</FormLabel>
            <Flex justifyContent="space-evenly">
              {["Su", "M", "Tu", "W", "Th", "F", "S"].map((day) => (
                <IconButton
                  key={day}
                  isRound
                  variant={selectedDays.includes(day) ? "solid" : "outline"}
                  aria-label={`Toggle ${day}`}
                  fontSize="20px"
                  icon={<Box as="span">{day}</Box>}
                  value={day}
                  onClick={() => {
                    if (selectedDays.includes(day)) {
                      setSelectedDays((prev) => prev.filter((d) => d !== day));
                    } else {
                      setSelectedDays((prev) => [...prev, day]);
                    }
                  }}
                />
              ))}
            </Flex>
          </FormControl>

          <FormControl>
            <FormLabel>Start Date</FormLabel>
            <Input
              type="date"
              w="50%"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <FormLabel>End Date</FormLabel>
            <Input
              type="date"
              w="50%"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <FormLabel>Start Time</FormLabel>
            <Input
              type="time"
              w="50%"
              value={bookingsForm.start_time}
              onChange={(e) =>
                setBookingsForm({ ...bookingsForm, start_time: e.target.value })
              }
            />
            <FormLabel>End Time</FormLabel>
            <Input
              type="time"
              w="50%"
              value={bookingsForm.end_time}
              onChange={(e) =>
                setBookingsForm({ ...bookingsForm, end_time: e.target.value })
              }
            />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button
            colorScheme="blue"
            mr={3}
            onClick={() => {
              handleSubmit();
              onClose();
            }}
          >
            Submit
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
