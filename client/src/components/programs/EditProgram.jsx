import { useEffect, useRef, useState } from "react";
import './EditProgram.css';

import {
    Button,
    Icon,
    Box,
    Flex,
    Text,
} from "@chakra-ui/react";
import { useDisclosure, useToast } from "@chakra-ui/react";;

import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { IoCloseOutline } from "react-icons/io5";
import { useParams } from "react-router";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../navbar/Navbar";
import React from 'react';

import { UnsavedChangesModal } from "../unsavedChanges/UnsavedChangesModal";
import { TitleInformation } from "./programComponents/TitleInformation";
import { ArtistsDropdown } from "./programComponents/ArtistsDropdown";
import { PayeesDropdown } from "./programComponents/PayeesDropdown"
import { LocationDropdown } from "./programComponents/LocationDropdown"
import { RoomInformation } from "./programComponents/RoomInformation"
import { ProgramInformation } from "./programComponents/ProgramInformation"
import { ReoccuranceDropdown } from "./programComponents/ReoccuranceDropdown"
import { EmailDropdown } from "./programComponents/EmailDropdown";
import { DateInputs } from "./programComponents/DateInputs";
import { TimeInputs } from "./programComponents/TimeInputs";
import { GreenCheckIcon } from "../../assets/GreenCheckIcon";


export const EditProgram = () => {
    const { backend } = useBackendContext();
    const { id } = useParams();
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
    const [initialState, setInitialState] = useState(null);
    const [infoLoaded, setInfoLoaded] = useState({
      event: false,
      booking: false,
      assignments: false,
      locations: false,
    });
    const {
        isOpen: isDeleteConfirmationModalOpen,
        onOpen: onDeleteConfirmationModalOpen,
        onClose: onDeleteConfirmationModalClose
    } = useDisclosure()
    const location = useLocation();
    const navigate = useNavigate();
    const isDuplicated = location.state?.duplicated || false;
    const duplicatedProgramName = location.state?.programName || "";
    const duplicationToast = useToast();

    useEffect(() => {
      if (initialState === null && Object.values(infoLoaded).every(Boolean)) {
        setInitialState(JSON.stringify({
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
          selectedDays,
        }));
      }
    }, [infoLoaded]);

    useEffect(() => {
      const loadInitialData = async () => {
        await getInitialEventData().then(setInfoLoaded((prev) => ({ ...prev, event: true })));
        await getInitialBookingData().then(setInfoLoaded((prev) => ({ ...prev, booking: true })));
        await getInitialAssignmentsData().then(setInfoLoaded((prev) => ({ ...prev, assignments: true })));
        await getInitialLocations().then(setInfoLoaded((prev) => ({ ...prev, locations: true })));
      };

      loadInitialData();
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

    const exit = () => {
        navigate(`/programs/${id}`);
    };

    const isFormValid = () => {
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
          selectedDays,
        });
        return (
            eventName.trim() !== "" &&
            startTime && endTime &&
            startDate && endDate &&
            selectedLocationId !== "" &&
            selectedInstructors.length > 0 &&
            selectedPayees.length > 0 &&
            initialState !== currentState
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
            // console.log("start time: " , bookingResponse.data[0].startTime.split(":").slice(0, 2).join(':'));
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


    const getDatesForDays = (startDate, endDate, selectedDays, repeatInterval, customRepeatInterval, customRepeatType) => {
        console.log("in getDatesForDays", startDate, endDate, selectedDays, repeatInterval, customRepeatInterval, customRepeatType)
        const dayMap = {
            "Sun": 0,
            "Mon": 1,
            "Tue": 2,
            "Wed": 3,
            "Thu": 4,
            "Fri": 5,
            "Sat": 6,
        };
        const selectedDayNumbers = Object.keys(selectedDays).map((day) => dayMap[day]);

        const start = new Date(startDate + "T00:00:00"); // Add time to avoid UTC conversion
        const end = new Date(endDate + "T23:59:59");
        const dates = [];


        // add x days to a date
        const addDays = (date, days) => {
            const newDate = new Date(date);
            newDate.setDate(newDate.getDate() + days);
            return newDate;
        };

        // add x months to a date
        const addMonths = (date, months) => {
            const newDate = new Date(date);
            newDate.setMonth(newDate.getMonth() + months);
            return newDate;
        };

        // add x years to a date
        const addYears = (date, years) => {
            const newDate = new Date(date);
            newDate.setFullYear(newDate.getFullYear() + years);
            return newDate;
        };

        let step = 1;
        let addFunction = addDays;

        switch (repeatInterval) {
            case "Every week":
                step = 7;
                break;
            case "Every month":
                addFunction = addMonths;
                break;
            case "Every year":
                addFunction = addYears;
                break;
            case "Custom":
                step = customRepeatInterval;
                switch (customRepeatType) {
                    case "Week":
                        step *= 7; // (ie. step is 2 * 7 (14 days) when n = 2)
                        break;
                    case "Month":
                        addFunction = addMonths;
                        break;
                    case "Year":
                        addFunction = addYears;
                        break;
                    default:
                        throw new Error("Invalid customRepeatType");
                }
                break;
            default:
                throw new Error("Invalid repeatInterval");
        }

        // iterate through the date range
        let currentDate = start;
        while (currentDate <= end) {
            // check for each selected day and add the matching ones
            selectedDayNumbers.forEach(dayNum => {
                // Find the closest matching day in the current week
                const daysUntilNext = (dayNum - currentDate.getDay() + 7) % 7;
                const nextMatchingDay = addDays(currentDate, daysUntilNext);

                if (nextMatchingDay <= end && selectedDays[Object.keys(dayMap)[dayNum]].start) {
                    // add the date and its start/end time to the result
                    dates.push({
                        date: new Date(nextMatchingDay),
                        startTime: selectedDays[Object.keys(dayMap)[dayNum]].start,
                        endTime: selectedDays[Object.keys(dayMap)[dayNum]].end,
                    });
                }
            });

            // move to the next date based on the repeat logic
            currentDate = addFunction(currentDate, step);
        }

        console.log(dates)

        return dates
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
        const filteredInstructors = instructorData.filter(
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
            await backend.delete('/bookings/event/' + id);
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

            let dates;
            if (repeatType !== "Does not repeat") {
                dates = getDatesForDays(startDate, endDate, selectedDays, repeatType, repeatInterval, customRepeatType);
                for (const date of dates) {
                    console.log(date)
                    const daysMap = { 0: 'Sun', 1: 'Mon', 2: "Tue", 3: "Wed", 4: "Thu", 5: 'Fri', 6: "Sat" }
                    const dayOfWeek = daysMap[(new Date(date.date).getDay())]; // get which day of the week it is during the date

                    const start = selectedDays[dayOfWeek].start
                    const end = selectedDays[dayOfWeek].end

                    const bookingsData = {
                        event_id: id,
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

                // make object
                const bookingsData = {
                    event_id: id,
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
            if (isDuplicated) {
                const maxLength = 35;
                const displayName = duplicatedProgramName.length > maxLength
                  ? `"${duplicatedProgramName.substring(0, maxLength)}..."`
                  : `"${duplicatedProgramName}"`;

                duplicationToast({
                    title: "Program Duplicated",
                    description: displayName,
                    status: "success",
                    duration: 5000,
                    variant: "subtle",
                    render: ({ title, description }) => (
                      <Box
                        p={4}
                        display="flex"
                        alignItems="center"
                        borderLeft="4px solid var(--green-500, #38A169)"
                        background="#C6F6D5"
                        width="400px"
                        height="4rem"
                      >
                        <Flex mr={3}>
                          <GreenCheckIcon />
                        </Flex>
                        <Box flex="1">
                          <Text
                            fontWeight="700"
                            fontSize="16px"
                            color="#2D3748"
                            fontFamily="Inter"
                            lineHeight="24px"
                          >
                            {title}
                          </Text>
                          <Text
                            fontWeight="400"
                            fontSize="14px"
                            color="2#D3748"
                            fontFamily="Inter"
                          >
                            {description}
                          </Text>
                        </Box>
                      </Box>
                    )
                });
                // navigate("/programs");
            }
            exit();

        } catch (error) {
            console.error("Error updating sessions", error);
        }
    };


    return (
      <Navbar>
          <div id="body">
              <div id="programsBody">
                  <div>
                      <Icon
                        fontSize="xl"
                        onClick={() => {onDeleteConfirmationModalOpen();}}
                        id="leftCancel"
                      >
                        <IoCloseOutline />
                      </Icon>
                      <UnsavedChangesModal
                        isOpen={isDeleteConfirmationModalOpen}
                        onOpen={onDeleteConfirmationModalOpen}
                        onClose={onDeleteConfirmationModalClose}
                        exit={exit}
                        save={saveEvent}
                        isFormValid={isFormValid}
                      />
                  </div>
                  <div id="eventInfoBody">
                      <div id="title">
                          <TitleInformation
                            eventName={eventName}
                            setEventName={setEventName}
                          />
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
                              className="inputElement"
                          />

                          <TimeInputs
                              selectedDays={selectedDays}
                              setSelectedDays={setSelectedDays}
                              startTime={startTime}
                              endTime={endTime}
                              setStartTime={setStartTime}
                              setEndTime={setEndTime}
                              className="inputElement"
                          />

                          <DateInputs
                              startDate={startDate}
                              setStartDate={setStartDate}
                              endDate={endDate}
                              setEndDate={setEndDate}
                              className="inputElement"
                          />

                          <ArtistsDropdown
                              instructorSearchTerm={instructorSearchTerm}
                              searchedInstructors={searchedInstructors}
                              selectedInstructors={selectedInstructors}
                              setSelectedInstructors={setSelectedInstructors}
                              setSearchedInstructors={setSearchedInstructors}
                              getInstructorResults={getInstructorResults}
                              setInstructorSearchTerm={setInstructorSearchTerm}
                              className="inputElement"
                          />

                          <PayeesDropdown
                              payeeSearchTerm={payeeSearchTerm}
                              searchedPayees={searchedPayees}
                              selectedPayees={selectedPayees}
                              getPayeeResults={getPayeeResults}
                              setPayeeSearchTerm={setPayeeSearchTerm}
                              setSelectedPayees={setSelectedPayees}
                              setSearchedPayees={setSearchedPayees}
                              className="inputElement"
                          />

                          <EmailDropdown
                              selectedPayees={selectedPayees}
                              className="inputElement"
                          />

                          <LocationDropdown
                              locations={locations}
                              locationRate={locationRate}
                              selectedLocationId={selectedLocationId}
                              selectedLocation={selectedLocation}
                              setSelectedLocation={setSelectedLocation}
                              setSelectedLocationId={setSelectedLocationId}
                              setRoomDescription={setRoomDescription}
                              setLocationRate={setLocationRate}
                              className="inputElement"
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
                  <div id="saveCancel">
                    <Button
                        id="saveProgram"
                        onClick={saveEvent}
                        isDisabled={!isFormValid()}
                        backgroundColor={isFormValid() ? "#4441C8.600" : "gray.300"}
                        _hover={{ backgroundColor: isFormValid() ? "#4441C8.700" : "gray.300" }}
                    >
                        Save
                    </Button>
                  </div>
              </div>
          </div>
      </Navbar>
    );
};
