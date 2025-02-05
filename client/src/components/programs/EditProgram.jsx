import { useEffect, useState } from "react";
import './EditProgram.css';

import {
  Box,
  Button,
  Link as ChakraLink,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Link,
  Select,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tag,
  Tr,
  VStack,
  Kbd,
  Portal,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
} from "@chakra-ui/react";

import {CancelIcon} from '../../assets/CancelIcon';
import {RepeatIcon} from '../../assets/RepeatIcon';
// import { useAuthContext } from "../../contexts/hooks/useAuthContext";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { useNavigate } from 'react-router-dom';
// import { useRoleContext } from "../../contexts/hooks/useRoleContext";
// import { User } from "../../types/user";
// import { RoleSelect } from "./RoleSelect";
import { MdOutlineEmail, MdLocationOn } from "react-icons/md";
import { IoCloseOutline } from "react-icons/io5";
import { TbCalendarEvent } from "react-icons/tb";
import { GoClockFill } from "react-icons/go";
import { CiCircleMore } from "react-icons/ci";
import { IoMdAddCircle, IoMdCloseCircle } from "react-icons/io";
import { useParams } from "react-router";
import Navbar from "../navbar/Navbar";
import React from 'react';


export const EditProgram = () => {
  const { backend } = useBackendContext();
  const navigate = useNavigate();
  const {id} = useParams();
  const [locations, setLocations] = useState({}); // rooms.id rooms.name
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventArchived, setEventArchived] = useState("");
  const [searchedInstructors, setSearchedInstructors] = useState([]);
  const [selectedInstructors, setSelectedInstructors] = useState([]);
  const [searchedPayees, setSearchedPayees] = useState([]);
  const [selectedPayees, setSelectedPayees] = useState([]);
  const [roomDescription, setRoomDescription] = useState("");
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
    navigate('/program/' + id);
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
      setStartTime(bookingResponse.data[0].startTime.split(':').slice(0, 2).join(':'));
      setEndTime(bookingResponse.data[0].endTime.split(':').slice(0, 2).join(':'));
      setStartDate(bookingResponse.data[0].date.split("T")[0]);

      const ids = bookingResponse.data.map(booking => booking.bookingId);

      setBookingIds(ids);
      setEndDate(bookingResponse.data[bookingResponse.data.length - 1].date.split("T")[0]);
    }
    console.log(bookingResponse.data);
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
        const instructorResponse = await backend.get("/assignments/searchClients", {
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
        const payeeResponse = await backend.get("/assignments/searchClients", {
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
        const deletedCommentResponse = await backend.delete('/comments/booking/' + bookingId);
        console.log("deleted comments: ", deletedCommentResponse);
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
      const deletedBookingResponse = await backend.delete('/bookings/event/' + id);
      console.log("deleted events: ", deletedBookingResponse);
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
      const deletedAssignmentResponse = await backend.delete('/assignments/event/' + id);
      console.log("deleted events: ", deletedAssignmentResponse);
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
      console.log("saving event");
      const eventsResponse = await backend.put('/events/' + id, {
          name: eventName,
          description: generalInformation,
          archived: eventArchived
      });

      deleteAllBookingComments();
      // error if no comments for booking & try to delete
      // error if comments for booking & dont try to delete
      deleteAllEventBookings();
      deleteAllAssignments();

      const dates = getDatesForDays(startDate, endDate, selectedDays);
      console.log("dates: ", dates);
      for (const date of dates) {
        const bookingsData = {
          event_id: id,
          room_id: selectedLocationId,
          start_time: startTime,
          end_time: endTime,
          date: date,
          archived: eventArchived,
        };

        const bookingsResponse = await backend.post('/bookings', bookingsData);
        console.log("booking made for: ", bookingsResponse.data, bookingsData);
      }

      for (const instructor of selectedInstructors) {
        const instructorResponse = await backend.post("/assignments", {
            eventId: id,
            clientId: instructor.id,
            role: "instructor"
        });
      }

    console.log(selectedPayees);
      for (const payee of selectedPayees) {
        const payeeResponse = await backend.post("/assignments", {
            eventId: id,
            clientId: payee.id,
            role: "payee"
        });
      }
      // exit();

    } catch (error) {
        console.error("Error getting instructors:", error);
    }
  };

  return (
    <div id="body">
      <Navbar >
      </Navbar>
      <div id="programsBody">
        <div onClick={exit}><Icon fontSize="2xl" id="leftCancel"><IoCloseOutline /></Icon></div>
        <div id="eventInfoBody">
          <div id="title"><h1><b>{eventName}</b></h1><Button id="save" onClick={saveEvent}>Save</Button></div>
          <div>
            {/* <Field invalid label="startTime" errorText="This field is required">*/}
            <div id="dateTimeDiv">
              <div>
                <Icon boxSize={6}><GoClockFill/></Icon>
                <Input id = "time1" placeholder="00:00 am" type='time' variant="outline" size="md" value={startTime} onChange={(event) => setStartTime(event.target.value)}/>
              </div>
              to
              <div>
                <Icon boxSize={6}><GoClockFill/></Icon>
                <Input id = "time2" placeholder="00:00 pm" type='time' variant="outline" size="md" value={endTime} onChange={(event) => setEndTime(event.target.value)}/>
              </div>
              from
              <div>
                <Icon boxSize={6}><TbCalendarEvent /></Icon>
                <Input id = "date1" placeholder="Day. MM/DD/YYYY" type='date' variant="outline" size="md" value={startDate} onChange={(e) => setStartDate(e.target.value)}/>
              </div>
              to
              <div>
                <Icon boxSize={6}><TbCalendarEvent /></Icon>
                <Input id = "date2" placeholder="Day. MM/DD/YYYY" type='date' variant="outline" size="md" value={endDate} onChange={(e) => setEndDate(e.target.value)}/>
              </div>
            </div>
            <div id="repeatDiv">
              <Icon fontSize="150%"><RepeatIcon /></Icon>
              <FormLabel>Repeat</FormLabel>
              <FormControl >
                <Flex id="repeatContainer">
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
            </div>
          </div>
          <div id="instructorContainer">
            <div id="instructors">
              <div id="instructorSelection">
                <div id="instructorInput">
                  <Input placeholder="Instructor" onChange={(e)=>{getInstructorResults(e.target.value); setInstructorSearchTerm(e.target.value);}}/>
                  <IoMdAddCircle />
                </div>
                <select
                      onChange={(event) => {
                        const selectedId = event.target.value;
                        const selectedInstructor = searchedInstructors.find(
                          instructor => instructor.id.toString() === selectedId
                        );

                        const alreadySelected = selectedInstructors.find(
                          instructor => instructor.id.toString() === selectedId
                        );

                        if (selectedInstructor && !alreadySelected) {
                          setSelectedInstructors(prevItems => [...prevItems, selectedInstructor]);
                          const filteredInstructors = searchedInstructors.filter(
                            (instructor) => selectedId !== instructor.id.toString());
                          setSearchedInstructors(filteredInstructors);
                        }
                      }}
                    multiple
                >
                  {searchedInstructors.map((instructor) => (
                    <option value={instructor.id} key={instructor.id}>
                      {instructor.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div id="instructorTags">
              {selectedInstructors.length > 0 ? (
                selectedInstructors.map((instructor, ind) => (
                  <div key={ind}>
                    <Icon fontSize="xl" onClick={() => {
                        setSelectedInstructors(prevItems =>
                          prevItems.filter(item => item.id !== instructor.id));
                      }}><IoCloseOutline /></Icon>
                    <Tag value={instructor.id}>
                      {instructor.name}
                    </Tag>
                  </div>
                ))
              ) : (
                <div></div>
              )}
            </div>
          </div>

          <div id="payeeContainer">
            <div id="payees">
              <div id="payeeSelection">
                <div id="payeeInput">
                  <Input placeholder="Payee" onChange={(e)=>{getPayeeResults(e.target.value); setPayeeSearchTerm(e.target.value);}}/>
                  <IoMdAddCircle />
                </div>
                <select
                    onChange={(event) => {
                        const selectedId = event.target.value;
                              const selectedPayee = searchedPayees.find(
                                payee => payee.id.toString() === selectedId
                              );

                              const alreadySelected = selectedPayees.find(
                                payee => payee.id.toString() === selectedId
                              );

                              if (selectedPayee && !alreadySelected) {
                                setSelectedPayees(prevItems => [...prevItems, selectedPayee]);
                                const filteredPayees = searchedPayees.filter(
                                  (payee) => selectedId !== payee.id.toString());
                                setSearchedPayees(filteredPayees);
                              }
                              }}
                    multiple
                  >
                    {searchedPayees.map((payee) => (
                      <option value={payee.id} key={payee.id}>
                        {payee.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div id="payeeTags">
                {selectedPayees.length > 0 ? (
                  selectedPayees.map((payee, ind) => (
                    <div key={ind}>
                      <Icon fontSize="xl" onClick={(e) => {
                        setSelectedPayees(prevItems =>
                          prevItems.filter(item => item.id !== payee.id));
                      }}><IoCloseOutline/></Icon>
                      <Tag value={payee.id}>
                        {payee.name}
                      </Tag>
                    </div>
                  ))
                ) : (
                  <div></div>
                )}
            </div>
          </div>
          <div id="payeeEmails">
            <MdOutlineEmail />
            {selectedPayees.map(payee => payee.email).join(", ")}
          </div>

          <div id="location">
            <MdLocationOn />
            {locations && locations.length > 0 ? (
                  <Select
                    defaultValue={'DEFAULT'}
                    onChange={(event) => {
                      const selectedId = parseInt(event.target.value);
                      const location = locations.find(loc => loc.id === selectedId);
                      setSelectedLocation(location.name);
                      setSelectedLocationId(location.id);
                      setRoomDescription(location.description);
                    }}
                  >
                    <option value="DEFAULT" disabled>{selectedLocation}</option>
                    {locations.map((location) => (
                      <option value={location.id} key={location.id}>
                        {location.name}
                      </option>
                    ))}
                  </Select>
                ) : <div></div>  }
          </div>

          <div id="roomDescription">
            <h3>Room Description</h3>
            <p>{roomDescription}</p>
          </div>

          <div id="information">
            <h3>General Information</h3>
            <Textarea defaultValue={generalInformation} onChange={(e) => {setGeneralInformation(e.target.value);}}></Textarea>
          </div>
        </div>
        <Popover id="popTrigger">
          <PopoverTrigger asChild>
            <Icon fontSize="2xl"><CiCircleMore /></Icon>
          </PopoverTrigger>
            <PopoverContent style={{width:"100%"}}>
              <PopoverBody onClick={exit}>
                <div id="cancelBody">
                  <Icon fontSize="2xl"><CancelIcon id="cancelIcon"/></Icon>
                  <p id="cancel">Close</p>
                </div>
              </PopoverBody>
            </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
