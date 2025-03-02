import { useEffect, useState } from "react";
import './EditProgram.css';

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Icon,
  IconButton,
  Input,
  Select,
  Textarea,
  Tag,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
} from "@chakra-ui/react";


import {CancelIcon} from '../../assets/CancelIcon';

import {EmailIcon} from '../../assets/EmailIcon';
import {PlusFilledIcon} from '../../assets/PlusFilledIcon';


import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { useNavigate } from 'react-router-dom';
import { IoCloseOutline } from "react-icons/io5";
import { CiCircleMore } from "react-icons/ci";
import { useParams } from "react-router";
import Navbar from "../navbar/Navbar";
import React from 'react';

import { PayeesDropdown } from "./programComponents/PayeesDropdown"
import { LocationDropdown } from "./programComponents/LocationDropdown"
import { RoomInformation } from "./programComponents/RoomInformation"
import { ProgramInformation } from "./programComponents/ProgramInformation"
import { TimeFrequency } from "./programComponents/TimeFrequency"

export const EditProgram = () => {
  const { backend } = useBackendContext();
  const navigate = useNavigate();
  const {id} = useParams();
  const [locations, setLocations] = useState({}); // rooms.id rooms.name
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [locationRate, setLocationRate] = useState("--.--");
  const [roomDescription, setRoomDescription] = useState("N/A");
  const [eventName, setEventName] = useState("");
  const [eventArchived, setEventArchived] = useState("");
  const [searchedInstructors, setSearchedInstructors] = useState([]);
  const [selectedInstructors, setSelectedInstructors] = useState([]);
  const [searchedPayees, setSearchedPayees] = useState([]);
  const [selectedPayees, setSelectedPayees] = useState([]);
  const [generalInformation, setGeneralInformation] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedDays, setSelectedDays] = useState([]);
  const [bookingIds, setBookingIds] = useState([]);
  const [instructorSearchTerm, setInstructorSearchTerm] = useState("");
  const [payeeSearchTerm, setPayeeSearchTerm] = useState("");


  useEffect(() => {
    getInitialEventData();
    getInitialBookingData();
    getInitialAssignmentsData();
    getInitialLocations();
  }, []);

  useEffect(() => {
    getInstructorResults(instructorSearchTerm);
  }, [selectedInstructors, instructorSearchTerm]);

  useEffect(() => {
    getPayeeResults(payeeSearchTerm);
  }, [selectedPayees, payeeSearchTerm]);


  const exit = () => {
    navigate('/programs/' + id);
  };

  const getInitialEventData = async () => {
    const eventResponse = await backend.get(`/events/${id}`);

    setEventName(eventResponse.data[0].name);
    setGeneralInformation(eventResponse.data[0].description);
    setEventArchived(eventResponse.data[0].archived);
  }

  const getInitialBookingData = async () => {
    const bookingResponse = await backend.get('/bookings/rooms/event/' + id);
    if (bookingResponse.data.length > 0) {
      setSelectedLocation(bookingResponse.data[0].name);
      setSelectedLocationId(bookingResponse.data[0].roomId);
      setRoomDescription(bookingResponse.data[0].description);
      setLocationRate(bookingResponse.data[0].rate);
      setStartTime(bookingResponse.data[0].startTime.split(':').slice(0, 2).join(':'));
      setEndTime(bookingResponse.data[0].endTime.split(':').slice(0, 2).join(':'));
      setStartDate(bookingResponse.data[0].date.split("T")[0]);

      const ids = bookingResponse.data.map(booking => booking.bookingId);

      setBookingIds(ids);
      setEndDate(bookingResponse.data[bookingResponse.data.length - 1].date.split("T")[0]);
    }
  }

  const getInitialAssignmentsData = async () => {
    const eventClientResponse = await backend.get('/assignments/event/' + id);

    const instructors = eventClientResponse.data
  .filter(client => client.role === "instructor")
  .map(client => ({
    id: client.clientId,
    name: client.clientName,
    email: client.clientEmail
  }));

const payees = eventClientResponse.data
  .filter(client => client.role === "payee")
  .map(client => ({
    id: client.clientId,
    name: client.clientName,
    email: client.clientEmail
  }));
    setSelectedInstructors(instructors);
    setSelectedPayees(payees);
  }

  const getInitialLocations = async () => {
    try {
      const locationResponse = await backend.get("/rooms");
      setLocations(locationResponse.data);
    } catch (error) {
        console.error("Error getting locations:", error);
    }
  };

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

  const getInstructorResults = async (search) => {
    try {
      if (search !== "") {
        const instructorResponse = await backend.get("/clients/search", {
          params: {
            searchTerm: search
          }
        });
        filterSelectedInstructorsFromSearch(instructorResponse.data);
      }
      else {
        setSearchedInstructors([]);
      }
    } catch (error) {
      console.error("Error getting instructors:", error);
    }
  };

  const filterSelectedInstructorsFromSearch = (instructorData) => {
    const filteredInstructors =  instructorData.filter(
      instructor => !selectedInstructors.some(
        selected => selected.id === instructor.id
      )
    );
    setSearchedInstructors(filteredInstructors);
  };

  const getPayeeResults = async (search) => {
    try {
      if (search !== "") {
        const payeeResponse = await backend.get("/clients/search", {
          params: {
            searchTerm: search
          }
        });
        filterSelectedPayeesFromSearch(payeeResponse.data);
      }
      else {
        setSearchedPayees([]);
      }
    } catch (error) {
        console.error("Error getting instructors:", error);
    }
  };

  const filterSelectedPayeesFromSearch = (payeesData) => {
    const filteredPayees = payeesData.filter(
      (payee) => !selectedPayees.some(
        (selectedPayee) => selectedPayee.id === payee.id
      )
    );

    setSearchedPayees(filteredPayees);
  };

  const deleteAllBookingComments = async () => {
  try {
    await Promise.all(bookingIds.map(async (bookingId) => {
      try {
        await backend.delete('/comments/booking/' + bookingId);
      } catch (err) {
        if (err.response?.status === 404) {
          console.log(`No comments found for booking ${bookingId}`);
          return;
        }
        throw err;
      }
    }));
  } catch (error) {
    console.error("Error deleting event bookings", error);
    throw error;
  }
};

  const deleteAllEventBookings = async () => {
    try {
      await backend.delete('/bookings/byEvent/' + id);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(`No bookings found for event ${id}`);
        return;
      }
      else {
        console.error("Error deleting event bookings", error);
      }
    }
  };

  const deleteAllAssignments = async () => {
    try {
      await backend.delete('/assignments/event/' + id);
    } catch (error) {
      if (error.response?.status === 404) {
          console.log(`No assignments found for event ${id}`);
          return;
        }
      else {
        console.error("Error deleting event bookings", error);
      }
    }
  };

  const saveEvent = async () => {
    try {
      await backend.put('/events/' + id, {
          name: eventName,
          description: generalInformation,
          archived: eventArchived
      });

      deleteAllBookingComments();
      deleteAllEventBookings();
      deleteAllAssignments();

      const dates = getDatesForDays(startDate, endDate, selectedDays);
      for (const date of dates) {
        const bookingsData = {
          event_id: id,
          room_id: selectedLocationId,
          start_time: startTime,
          end_time: endTime,
          date: date,
          archived: eventArchived,
        };

        await backend.post('/bookings', bookingsData);
      }

      for (const instructor of selectedInstructors) {
        await backend.post("/assignments", {
            eventId: id,
            clientId: instructor.id,
            role: "instructor"
        });
      }

      for (const payee of selectedPayees) {
        await backend.post("/assignments", {
            eventId: id,
            clientId: payee.id,
            role: "payee"
        });
      }
      exit();

    } catch (error) {
        console.error("Error getting instructors:", error);
    }
  };

  return (
    <Navbar>
      <div id="body">
        <div id="programsBody">
          <div><Icon fontSize="2xl" onClick={exit} id="leftCancel"><IoCloseOutline/></Icon></div>
          <div id="eventInfoBody">
            <div id="title">
              <h1><b>{eventName}</b></h1>
              <div id = "saveCancel">
                <Button id="save" onClick={saveEvent}>Save</Button>
                <Popover id="popTrigger">
                  <PopoverTrigger asChild>
                    <Icon boxSize="5"><CiCircleMore/></Icon>
                  </PopoverTrigger>
                    <PopoverContent style={{width:"100%"}}>
                      <PopoverBody onClick={exit}>
                        <div id="cancelBody">
                          <Icon fontSize="1xl"><CancelIcon id="cancelIcon"/></Icon>
                          <p id="cancel">Cancel</p>
                        </div>
                      </PopoverBody>
                    </PopoverContent>
                </Popover>
              </div>
            </div>
            <div id="innerBody">


              <TimeFrequency
                startTime={startTime}
                setStartTime={setStartTime}
                endTime={endTime}
                setEndTime={setEndTime}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                selectedDays={selectedDays}
                setSelectedDays={setSelectedDays}
              />






              <div id="instructorContainer">
                <div id="instructors">
                  <div id="instructorSelection">
                    <Box>
                      <div id="instructorInputContainer">
                        <Input
                          placeholder="Instructor..."
                          onChange={(e) => {
                            getInstructorResults(e.target.value);
                            setInstructorSearchTerm(e.target.value);
                          }}
                          value={instructorSearchTerm} id="instructorInput"/>
                        <PlusFilledIcon />
                      </div>

                      {searchedInstructors.length > 0 && (
                        <Box id="instructorDropdown">
                          {searchedInstructors.map((instructor) => (
                            <Box
                              key={instructor.id}
                              onClick={() => {
                                const alreadySelected = selectedInstructors.find(
                                  (instr) => instr.id.toString() === instructor.id
                                );
                                if (instructor && !alreadySelected) {
                                  setSelectedInstructors((prevItems) => [...prevItems, instructor]);
                                  const filteredInstructors = searchedInstructors.filter(
                                    (instr) => instructor.id !== instr.id.toString()
                                  );
                                  setSearchedInstructors(filteredInstructors);
                                }
                              }}
                              style={{
                                padding: "10px",
                                fontSize: "16px",
                                cursor: "pointer",
                                transition: "0.2s",
                              }}
                              bg="#F6F6F6"
                              _hover={{ bg: "#D9D9D9" }}
                            >
                              {instructor.name}
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                  </div>
                </div>
                <div id="instructorTags">
                  {selectedInstructors.length > 0 ? (
                    selectedInstructors.map((instructor, ind) => (
                      <div className="instructorTag" key={ind}>
                        <Icon fontSize="lg" onClick={() => {
                            setSelectedInstructors(prevItems =>
                              prevItems.filter(item => item.id !== instructor.id));
                          }}><CloseFilledIcon /></Icon>
                        <Tag value={instructor.id}>
                          {instructor.name}
                        </Tag>
                      </div>
                    ))
                  ) : <div></div> }
                </div>
              </div>

              <PayeesDropdown
                payeeSearchTerm={payeeSearchTerm}
                searchedPayees={searchedPayees}
                selectedPayees={selectedPayees}
                getPayeeResults={getPayeeResults}
                setPayeeSearchTerm={setPayeeSearchTerm}
                setSelectedPayees={setSelectedPayees}
                setSearchedPayees={setSearchedPayees}
              />

              <div id="payeeEmails">
                <EmailIcon />
                {selectedPayees.map(payee => payee.email).join(", ")}
              </div>

              <LocationDropdown
                locations={locations}
                locationRate={locationRate}
                selectedLocationId={selectedLocationId}
                setSelectedLocation={setSelectedLocation}
                setSelectedLocationId={setSelectedLocationId}
                setRoomDescription={setRoomDescription}
                setLocationRate={setLocationRate}
              />

              <RoomInformation
                roomDescription={roomDescription}
              />

              <ProgramInformation
                generalInformation={generalInformation}
                setGeneralInformation={setGeneralInformation}
              />
            </div>
          </div>
        </div>
      </div>
    </Navbar>
  );
};
