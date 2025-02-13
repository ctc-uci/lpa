import { useEffect, useState } from "react";

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
import {RepeatIcon} from '../../assets/RepeatIcon';
import {ClockFilledIcon} from '../../assets/ClockFilledIcon';
import {CalendarIcon} from '../../assets/CalendarIcon';
import {PlusFilledIcon} from '../../assets/PlusFilledIcon';
import {CloseFilledIcon} from '../../assets/CloseFilledIcon';
import {EmailIcon} from '../../assets/EmailIcon';
import {LocationIcon} from '../../assets/LocationIcon';
import {DollarIcon} from '../../assets/DollarIcon';
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { useNavigate } from 'react-router-dom';
import { IoCloseOutline } from "react-icons/io5";
import { CiCircleMore } from "react-icons/ci";
import { useParams } from "react-router";
import { VscAccount } from "react-icons/vsc";
import Navbar from "../navbar/Navbar";
import React from 'react';

export const EditBooking = () => {
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
  const [selectedInstructors, setSelectedInstructors] = useState([]);
  const [selectedPayees, setSelectedPayees] = useState([]);
  const [generalInformation, setGeneralInformation] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedDays, setSelectedDays] = useState([]);
  const [bookingIds, setBookingIds] = useState([]);


  useEffect(() => {
    getInitialEventData();
    getInitialBookingData();
    getInitialAssignmentsData();
    getInitialLocations();
    printData();
  }, []);

const printData = () => {
    console.log(eventName);
  };

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
    }

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

// change to delete singular booking form bookings table, not every booking for an event
  const deleteAllEventBookings = async () => {
    try {
      await backend.delete('/bookings/event/' + id);
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
              <div id="dateTimeDiv" style={{fontSize:"1rem"}}>
                <div>
                  <Icon boxSize={6} fontSize="sm"><ClockFilledIcon/></Icon>
                  <Input id = "time1" placeholder="00:00 am" type='time' variant="outline" size="md" value={startTime} onChange={(event) => setStartTime(event.target.value)} backgroundColor="#F6F6F6" color="#767778"/>
                </div>
                to
                <div>
                  <Icon boxSize={6} fontSize="lg"><ClockFilledIcon/></Icon>
                  <Input id = "time2" placeholder="00:00 pm" type='time' variant="outline" size="md" value={endTime} onChange={(event) => setEndTime(event.target.value)} backgroundColor="#F6F6F6" color="#767778"/>
                </div>
                from
                <div>
                  <Icon boxSize={6} fontSize="lg"><CalendarIcon /></Icon>
                  <Input id = "date1" placeholder="Day. MM/DD/YYYY" type='date' variant="outline" size="md" value={startDate} onChange={(e) => setStartDate(e.target.value)} backgroundColor="#F6F6F6" color="#767778"/>
                </div>
              </div>

            <div id = "payee">
            <Flex align="center" gap={2}>
                <Icon as={VscAccount} fontSize="2xl" />
                <Icon as={VscAccount} fontSize="2xl" />

            </Flex>
            </div>
     

              <div id="payeeEmails">
                <EmailIcon />
                {selectedPayees.map(payee => payee.email).join(", ")}
              </div>

              <div id="location">
                <LocationIcon />
                {locations && locations.length > 0 ? (
                      <Select width="30%" backgroundColor="#F6F6F6"  value={selectedLocationId === "" ? 'DEFAULT' : selectedLocationId}
                        onChange={(event) => {
                          const selectedId = parseInt(event.target.value);
                          const location = locations.find(loc => loc.id === selectedId);
                          setSelectedLocation(location.name);
                          setSelectedLocationId(location.id);
                          setRoomDescription(location.description);
                          setLocationRate(location.rate);
                        }}
                      >
                      <option value={'DEFAULT'} disabled>Location...</option>
                        {locations.map((location) => (
                          <option value={location.id} key={location.id}>
                            {location.name}
                          </option>
                        ))}
                      </Select>
                    ) : <div></div>  }
                <div id="locationRate">
                  <DollarIcon />
                  <p>{locationRate} / hour</p>
                </div>
              </div>

              <div id="roomDescription">
                <h3>Room Description</h3>
                <p>{roomDescription}</p>
              </div>

              <div id="information">
                <h3>General Information</h3>
                <Textarea defaultValue={generalInformation} onChange={(e) => {setGeneralInformation(e.target.value);}} backgroundColor="#F6F6F6"></Textarea>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Navbar>
);
};
