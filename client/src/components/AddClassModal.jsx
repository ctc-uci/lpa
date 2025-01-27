import {
    useDisclosure,
    Button,
    Modal,
    ModalOverlay,
    ModalContent, 
    ModalHeader,
    ModalFooter,
    ModalCloseButton,
    FormLabel,
    Input, 
    FormControl,
    ModalBody,
    Select,
    Flex,
    IconButton,
    Box
} from "@chakra-ui/react";
import React, { useState, useEffect } from 'react';

import { useBackendContext } from "../contexts/hooks/useBackendContext";


export const AddClassModal = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { backend } = useBackendContext();

  const [rooms, setRooms] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  //bookings part
  //events part

  const [bookingsForm, setBookingsForm] = useState({
    event_id : "",
    room_id : "",
    start_time : "",
    end_time : "",
    date : "",
    archived : false
  })

  const [eventsForm, setEventsForm] = useState({
    name : "",
    description : "",
    archived: false
  })
  
  const getDatesForDays = (startDate, endDate, selectedDays) => {
    const daysMap = { 'Su': 0, 'M': 1, 'Tu': 2, 'W': 3, 'Th': 4, 'F': 5, 'S': 6 };
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

        const eventResponse = await backend.post("/events", eventsForm);

        const eventId = eventResponse.data.id;
          
        const dates = getDatesForDays(startDate, endDate, selectedDays);

        for (const date of dates) {
          const bookingData = {
            ...bookingsForm,
            event_id : eventId,
            date: date,
          };
          
          const bookingsResponse = await backend.post("/bookings", bookingData);
          console.log(bookingsResponse.data);
        }

        
    } catch (error) {
        console.error("Error submitting form:", error);
    }
  }

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
    <>
      <Button onClick={onOpen}>Open Modal</Button>
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
              <Input placeholder='Enter name' value={eventsForm.name} onChange={(e) => (setEventsForm({...eventsForm, "name" : e.target.value}))}/>
            </FormControl>


            <FormControl>
              <FormLabel>Description</FormLabel>
              <Input placeholder='Enter description' value={eventsForm.description} onChange={(e) => (setEventsForm({...eventsForm, "description" : e.target.value}))}/>
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Room</FormLabel>
                <Select placeholder='Select Room' onChange={(e) => {
                  setBookingsForm((prevForm) => ({
                    ...prevForm,
                    room_id: e.target.value,
                  }));
                }}>
                  
                  {rooms.map(room => ( 
                    <option key={room.id} value={room.id}>{room.name}</option>)
                    )
                  }
                </Select>
            </FormControl>


            <FormControl>
              <FormLabel>Days</FormLabel>
              <Flex justifyContent="space-evenly">
                {["Su", "M", "Tu", "W", "Th", "F", "S"].map((day) => (
                  <IconButton
                    key={day} // Add a key for each button to avoid React warnings
                    isRound={true}
                    variant={selectedDays.includes(day) ? "solid" : "outline"}
                    aria-label={`Toggle ${day}`}
                    fontSize="20px"
                    icon={<Box as="span">{day}</Box>}
                    value={day}
                    onClick={() => {
                      if (selectedDays.includes(day)) {
                        setSelectedDays(selectedDays.filter((d) => d !== day));
                      } else {
                        setSelectedDays([...selectedDays, day]);
                      }
                    }}
                  />
                ))}
              </Flex>
            </FormControl>


          <FormControl>
            <FormLabel>Start Date</FormLabel>
            <Input placeholder='Select Date and Time' size='md' type='date' w="50%" value={startDate} onChange={(e) => setStartDate(e.target.value)}/>
            <FormLabel>End Date</FormLabel>
            <Input placeholder='Select Date and Time' size='md' type='date' w='50%' value={endDate} onChange={(e) => setEndDate(e.target.value)}/>
            <FormLabel>Start Time</FormLabel>
            <Input placeholder='Select Date and Time' size='md' type='time' w='50%' value={bookingsForm.start_time} onChange={(e) => setBookingsForm({...bookingsForm, start_time : e.target.value})}/>
            <FormLabel>End Date</FormLabel>
            <Input placeholder='Select Date and Time' size='md' type='time' w='50%' value={bookingsForm.end_time} onChange={(e) => setBookingsForm({...bookingsForm, end_time : e.target.value})}/>
          </FormControl>

          </ModalBody>


          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={() => {
              handleSubmit();
              onClose();
              }}>
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}