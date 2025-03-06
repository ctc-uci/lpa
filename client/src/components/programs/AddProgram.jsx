import { useEffect, useState } from "react";
import './EditProgram.css';

import {
  Button,
  Icon,
} from "@chakra-ui/react";


import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { useNavigate } from 'react-router-dom';
import { IoCloseOutline } from "react-icons/io5";
import { CiCircleMore } from "react-icons/ci";
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

export const AddProgram = () => {
  const { backend } = useBackendContext();
  const navigate = useNavigate();
  const [locations, setLocations] = useState({}); // rooms.id rooms.name
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [locationRate, setLocationRate] = useState("--.--");
  const [roomDescription, setRoomDescription] = useState("N/A");
  const [eventName, setEventName] = useState("");
  const [eventArchived, setEventArchived] = useState(false);
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


  useEffect(() => {
    getInitialLocations();
  }, []);

  useEffect(() => {
    getInstructorResults(instructorSearchTerm);
  }, [selectedInstructors, instructorSearchTerm]);

  useEffect(() => {
    getPayeeResults(payeeSearchTerm);
  }, [selectedPayees, payeeSearchTerm]);

  useEffect(() => {
    console.log("Selected location ID updated:", selectedLocationId);
}, [selectedLocationId]);

  const exit = (newEventId) => {
    navigate('/programs/' + newEventId);
  };

  const isFormValid = () => {
    return (
      eventName.trim() !== "" &&
      Object.keys(selectedDays).length > 0 &&
      selectedLocationId !== "" &&
      selectedInstructors.length > 0 &&
      selectedPayees.length > 0 &&
      generalInformation.trim() !== ""
    );
  };

  const getInitialLocations = async () => {
    try {
      const locationResponse = await backend.get("/rooms");
      setLocations(locationResponse.data);
    } catch (error) {
        console.error("Error getting locations:", error);
    }
  };

  const getDatesForDays = (startDate, endDate, selectedDays, repeatType, repeatInterval, customRepeatType) => {
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

    const currentDate = new Date(startDate);
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


  const saveEvent = async () => {
    try {
      console.log("Newly added name:", eventName);
      console.log("Newly added Description:", generalInformation);
      console.log("Newly added Location ID:", selectedLocationId);
      console.log("Newly added Instructors:", selectedInstructors);
      console.log("Newly added Payees:", selectedPayees);

      const response = await backend.post('/events/', {
          name: eventName,
          description: generalInformation,
          archived: eventArchived
      });

      const newEventId = response.data.id;



      console.log("Newly added Start Date:", startDate);
      console.log("Newly added End Date:", endDate);
      console.log("Newly added Selected Days:", selectedDays);

      // TODO add , selectedDays as argument
      const dates = getDatesForDays(startDate, endDate, selectedDays, repeatType, repeatInterval);

      console.log("Newly added bookings for dates:", dates);

      for (const date of dates) {
        const daysMap = { 0: 'Sun', 1: 'Mon', 2: "Tue", 3: "Wed", 4: "Thu", 5: 'Fri', 6: "Sat" }

        const dayOfWeek = new Date(date).getUTCDay(); //0-6
        const dayName = daysMap[dayOfWeek];

        // Get start and end times from selectedDays
        const { start, end } = selectedDays[dayName];

        const bookingsData = {
          event_id: newEventId,
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
      console.log("Instructor object:", selectedInstructors);
      for (const instructor of selectedInstructors) {
        console.log("Assigning instructor:", instructor);
        await backend.post("/assignments", {
            eventId: newEventId,
            clientId: instructor.id,
            role: "instructor"
        });
      }

      console.log("payee object:", selectedPayees);
      for (const payee of selectedPayees) {
        console.log("Assigning payee:", payee);
        await backend.post("/assignments", {
            eventId: newEventId,
            clientId: payee.id,
            role: "payee"
        });
      }
      console.log("Save complete, navigating away...");
      exit(newEventId);

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
              {/* <h1><b>{eventName}</b></h1> */}

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
