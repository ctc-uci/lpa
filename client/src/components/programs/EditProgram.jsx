import { useEffect, useState, useRef } from "react";
import './EditProgram.css';

import {
  Button,
  Icon,
} from "@chakra-ui/react";

import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { useNavigate } from 'react-router-dom';
import { IoCloseOutline } from "react-icons/io5";
import { useParams } from "react-router";
import Navbar from "../navbar/Navbar";
import React from 'react';

import { TitleInformation } from "./programComponents/TitleInformation";
import { ArtistsDropdown } from "./programComponents/ArtistsDropdown";
import { PayeesDropdown } from "./programComponents/PayeesDropdown"
import { LocationDropdown } from "./programComponents/LocationDropdown"
import { RoomInformation } from "./programComponents/RoomInformation"
import { ProgramInformation } from "./programComponents/ProgramInformation"
import { TimeFrequency } from "./programComponents/TimeFrequency"
import { EmailDropdown } from "./programComponents/EmailDropdown";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";

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
  const [repeatType, setRepeatType] = useState("Does not repeat");
  const [repeatInterval, setRepeatInterval] = useState(1);
  const [customRepeatType, setCustomRepeatType] = useState("Week");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedDays, setSelectedDays] = useState([]);
  const [bookingIds, setBookingIds] = useState([]);
  const [instructorSearchTerm, setInstructorSearchTerm] = useState("");
  const [payeeSearchTerm, setPayeeSearchTerm] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const initialState = useRef(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);


  useEffect(() => {
    getInitialEventData();
    getInitialBookingData();
    getInitialAssignmentsData();
    getInitialLocations();
  }, []);

  useEffect(() => {
    // Store the initial state when the component first loads
    initialState.current = {
      eventName,
      generalInformation,
      selectedLocationId,
      selectedInstructors,
      selectedPayees,
      repeatType,
      repeatInterval,
      startTime,
      endTime,
      startDate,
      endDate,
      selectedDays
    };
  }, []);

  useEffect(() => {
    // Compare the current state to the initial state
    const isDifferent = JSON.stringify(initialState.current) !== JSON.stringify({
      eventName,
      generalInformation,
      selectedLocationId,
      selectedInstructors,
      selectedPayees,
      repeatType,
      repeatInterval,
      startTime,
      endTime,
      startDate,
      endDate,
      selectedDays
    });

    setHasChanges(isDifferent);
  }, [
    eventName,
    generalInformation,
    selectedLocationId,
    selectedInstructors,
    selectedPayees,
    repeatType,
    repeatInterval,
    startTime,
    endTime,
    startDate,
    endDate,
    selectedDays
  ]);

  useEffect(() => {
    getInstructorResults(instructorSearchTerm);
  }, [selectedInstructors, instructorSearchTerm]);

  useEffect(() => {
    getPayeeResults(payeeSearchTerm);
  }, [selectedPayees, payeeSearchTerm]);

  useEffect(() => {
    console.log("Selected location ID updated:", selectedLocationId);
}, [selectedLocationId]);

  const exit = () => {
    if (hasChanges) {
      setIsConfirmModalOpen(true);
    }
    navigate('/programs/' + id);
  };

  const isFormValid = () => {
    return (
      eventName.trim() !== "" &&
      startTime.trim() !== "" &&
      endTime.trim() !== "" &&
      startDate.trim() !== "" &&
      endDate.trim() !== "" &&
      selectedLocationId !== "" &&
      selectedInstructors.length > 0 &&
      selectedPayees.length > 0 &&
      generalInformation.trim() !== ""
    );
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

  // Start Date: 2025-03-04
  // End Date: 2025-03-05

  // TODO: add **selectedDays** as a parameter
  const getDatesForDays = (startDate, endDate, selectedDays, repeatType, repeatInterval, customRepeatType) => {
    console.log("get dates for days:", startDate, endDate, selectedDays, repeatType, repeatInterval, customRepeatType)
    const daysMap = {
      "Sun": 0,
      "Mon": 1,
      "Tue": 2,
      "Wed": 3,
      "Thu": 4,
      "Fri": 5,
      "Sat": 6,
    };

    const daysIndices = Object.keys(selectedDays).map((day) => daysMap[day]);

    const dates = [];

    let currentDate = new Date(startDate);
    const lastDate = new Date(endDate);

    while (currentDate <= lastDate) {
      // // Adjust forward to the next matching day
      // while (!daysIndices.includes(currentDate.getUTCDay()) && currentDate <= lastDate) {
      //   currentDate.setDate(currentDate.getDate() + 1);
      // }

      if (daysIndices.includes(currentDate.getUTCDay())) {
        dates.push(new Date(currentDate).toISOString().split("T")[0]);
      }

      if (repeatType === "Every week") {
        currentDate.setDate(currentDate.getDate() + 7);
      } else if (repeatType === "Every month") {
        currentDate.setMonth(currentDate.getMonth() + 1);
      } else if (repeatType === "Every year") {
        currentDate.setFullYear(currentDate.getFullYear() + 1);
      } else if (repeatType === "Custom" && repeatInterval && customRepeatType) {
        if (customRepeatType === "Week") {
          currentDate.setDate(currentDate.getDate() + 7 * repeatInterval);
        } else if (customRepeatType === "Month") {
          currentDate.setMonth(currentDate.getMonth() + repeatInterval);
        } else if (customRepeatType === "Year") {
          currentDate.setFullYear(currentDate.getFullYear() + repeatInterval);
        }
      } else {
        currentDate.setDate(currentDate.getDate() + 1);
      }
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
      console.log(`Deleted bookings for event ${id}`);
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
      console.log("Newly added event name:", eventName);
      console.log("Newly added Description:", generalInformation);
      console.log("Newly added Location ID:", selectedLocationId);
      console.log("Newly added Selected Instructors:", selectedInstructors);
      console.log("Newly added Selected Payees:", selectedPayees);

      await backend.put('/events/' + id, {
          name: eventName,
          description: generalInformation,
          archived: eventArchived
      });

      deleteAllBookingComments();
      deleteAllEventBookings();
      deleteAllAssignments();

      console.log("Newly added Start Date:", startDate);
      console.log("Newly added End Date:", endDate);
      console.log("Newly added Selected Days:", selectedDays);

      // TODO add , selectedDays as argument
      const dates = getDatesForDays(startDate, endDate, selectedDays, repeatType, repeatInterval, customRepeatType);

      console.log("Newly added Saving bookings for dates:", dates);

      for (const date of dates) {
        const daysMap = { 0: 'Sun', 1: 'Mon', 2: "Tue", 3: "Wed", 4: "Thu", 5: 'Fri', 6: "Sat" }

        const dayOfWeek = new Date(date).getUTCDay(); //0-6
        const dayName = daysMap[dayOfWeek];

        // Get start and end times from selectedDays
        const { start, end } = selectedDays[dayName];

        const bookingsData = {
          event_id: id,
          room_id: selectedLocationId,
          start_time: start,
          end_time: end,
          date: date,
          archived: eventArchived,
        };

        console.log("Saving event with location ID:", selectedLocationId, "for date:", date, "with times:", start, "-", end);
        await backend.post('/bookings', bookingsData);
      }

      console.log("Assigning instructors...");
      for (const instructor of selectedInstructors) {
        console.log("Assigning instructor:", instructor);
        await backend.post("/assignments", {
            eventId: id,
            clientId: instructor.id,
            role: "instructor"
        });
      }


      for (const payee of selectedPayees) {
        console.log("Assigning payee:", payee);
        await backend.post("/assignments", {
            eventId: id,
            clientId: payee.id,
            role: "payee"
        });
      }
      console.log("Save complete, navigating away...");
      exit();

    } catch (error) {
        console.error("Error getting instructors:", error);
    }
  };


  return (

    <Navbar>
      <DeleteConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={() => {
          setIsConfirmModalOpen(false); // Close modal
          navigate('/programs/' + id); // Navigate if confirmed
        }}
      />
      <div id="body">
        <div id="programsBody">
          <div><Icon fontSize="2xl" onClick={exit} id="leftCancel"><IoCloseOutline/></Icon></div>
          <div id="eventInfoBody">
            <div id="title">

              <TitleInformation
                eventName={eventName}
                setEventName={setEventName}
              />

              <div id = "saveCancel">
                <Button
                  id="save"
                  onClick={saveEvent}
                  isDisabled={!isFormValid()}
                  backgroundColor={isFormValid() ? "purple.600" : "gray.300"}
                  _hover={{ backgroundColor: isFormValid() ? "purple.700" : "gray.300" }}
                >
                  Save

                </Button>
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
                repeatType={repeatType}
                setRepeatType={setRepeatType}
                repeatInterval={repeatInterval}
                setRepeatInterval={setRepeatInterval}
                customRepeatType={customRepeatType}
                setCustomRepeatType={setCustomRepeatType}
              />

              <ArtistsDropdown
                instructorSearchTerm={instructorSearchTerm}
                searchedInstructors={searchedInstructors}
                selectedInstructors={selectedInstructors}
                setSelectedInstructors={setSelectedInstructors}
                setSearchedInstructors={setSearchedInstructors}
                getInstructorResults={getInstructorResults}
                setInstructorSearchTerm={setInstructorSearchTerm}
              />

              <PayeesDropdown
                payeeSearchTerm={payeeSearchTerm}
                searchedPayees={searchedPayees}
                selectedPayees={selectedPayees}
                getPayeeResults={getPayeeResults}
                setPayeeSearchTerm={setPayeeSearchTerm}
                setSelectedPayees={setSelectedPayees}
                setSearchedPayees={setSearchedPayees}
              />

              <EmailDropdown
                selectedPayees={selectedPayees}
              />

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
