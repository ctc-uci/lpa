import {
  Button,
  Icon,
} from "@chakra-ui/react";

import { useEffect, useState, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import './EditProgram.css';
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { IoCloseOutline } from "react-icons/io5";
import Navbar from "../navbar/Navbar";
import React from 'react';

import { TitleInformation } from "./programComponents/TitleInformation";
import { ArtistsDropdown } from "./programComponents/ArtistsDropdown";
import { PayeesDropdown } from "./programComponents/PayeesDropdown"
import { LocationDropdown } from "./programComponents/LocationDropdown"
import { RoomInformation } from "./programComponents/RoomInformation"
import { ProgramInformation } from "./programComponents/ProgramInformation"
import { ReoccuranceDropdown } from "./programComponents/ReoccuranceDropdown"
import { EmailDropdown } from "./programComponents/EmailDropdown";
import { DeleteConfirmationModal } from "./DiscardConfirmationModal";
import { DateInputs } from "./programComponents/DateInputs";
import { TimeInputs } from "./programComponents/TimeInputs";

import { getDatesForDays } from "../../helpers/getDatesForDays";


export const AddProgram = () => {
  const { backend } = useBackendContext();
  const navigate = useNavigate();
  const [locations, setLocations] = useState({});
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
  const [instructorSearchTerm, setInstructorSearchTerm] = useState("");
  const [payeeSearchTerm, setPayeeSearchTerm] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const initialState = useRef(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  useEffect(() => {
    initialState.current = JSON.stringify({
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
  }, []);


  useEffect(() => {
    const currentState = JSON.stringify({
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

    setHasChanges(currentState !== initialState.current);
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

  const exit = (newEventId = "") => {
    console.log(newEventId);
    if (hasChanges) {
      setIsConfirmModalOpen(true);
      return;
    }
    if (window.history.length > 1) {
      navigate(-1);
    } else {
        navigate("/dashboard");
    }
  };

  const saveAndExit = (newEventId = "") => {
    navigate('/programs/' + newEventId);
  };

  const isFormValid = () => {
    return (
      eventName.trim() !== "" &&
      startDate && endDate &&
      selectedLocationId !== "" &&
      selectedInstructors.length > 0 &&
      selectedPayees.length > 0
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

      let dates;
      if (repeatType !== "Does not repeat") {
        dates = getDatesForDays(startDate, endDate, selectedDays, repeatType, repeatInterval, customRepeatType);
        for (const date of dates) {
          console.log(date)
          const daysMap = { 0: 'Sun', 1: 'Mon', 2: "Tue", 3: "Wed", 4: "Thu", 5: 'Fri', 6: "Sat" }
          const dayOfWeek = daysMap[(new Date(date.date).getDay())];

          const start = selectedDays[dayOfWeek].start
          const end = selectedDays[dayOfWeek].end

          const bookingsData = {
            event_id: newEventId,
            room_id: selectedLocationId,
            start_time: start,
            end_time: end,
            date: date.date,
            archived: eventArchived,
          };

          console.log("Saving event with location ID:", selectedLocationId, "for date:", date, "with times:", start, "-", end);
          await backend.post('/bookings', bookingsData);
        }


      }
      else {
        const date = { date: new Date(startDate), start: startTime, end: endTime };
        console.log(date)

        const start = date.start
        const end = date.end

        const bookingsData = {
          event_id: newEventId,
          room_id: selectedLocationId,
          start_time: start,
          end_time: end,
          date: date.date,
          archived: eventArchived,
        };

        console.log("Saving event with location ID:", selectedLocationId, "for date:", date, "with times:", start, "-", end);
        await backend.post('/bookings', bookingsData);
      }

      console.log("Newly added bookings for dates:", dates);



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
      saveAndExit(newEventId);

    } catch (error) {
        console.error("Error getting instructors:", error);
    }
  };

  return (
    <Navbar>
      <DeleteConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
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
              <ReoccuranceDropdown
                setSelectedDays={setSelectedDays}
                repeatType={repeatType}
                setRepeatType={setRepeatType}
                repeatInterval={repeatInterval}
                setRepeatInterval={setRepeatInterval}
                customRepeatType={customRepeatType}
                setCustomRepeatType={setCustomRepeatType}
                newProgram={true}
              />

             <TimeInputs
                selectedDays={selectedDays}
                setSelectedDays={setSelectedDays}
                startTime={startTime}
                endTime={endTime}
                setStartTime={setStartTime}
                setEndTime={setEndTime}
              />

              <DateInputs
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
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
