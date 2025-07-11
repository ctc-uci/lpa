import { useEffect, useState } from "react";

import "./EditBooking.css";

import React from "react";

import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Icon,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Select,
  Tag,
  Textarea,
  useDisclosure,
} from "@chakra-ui/react";

import { CiCircleMore } from "react-icons/ci";
import { IoCloseOutline } from "react-icons/io5";
import { VscAccount } from "react-icons/vsc";
import { useParams } from "react-router";
import { useNavigate } from "react-router-dom";

import { ArchiveIcon } from "../../assets/ArchiveIcon";
import { CalendarIcon } from "../../assets/CalendarIcon";
import { CancelIcon } from "../../assets/CancelIcon";
import { ClockFilledIcon } from "../../assets/ClockFilledIcon";
import { CloseFilledIcon } from "../../assets/CloseFilledIcon";
import { DeleteIcon } from "../../assets/DeleteIcon";
import { DollarIcon } from "../../assets/DollarIcon";
import { EmailIcon } from "../../assets/EmailIcon";
import { EyeIcon } from "../../assets/EyeIcon";
import { InfoIconRed } from "../../assets/InfoIconRed";
import { LocationIcon } from "../../assets/LocationIcon";
import { PaintPaletteIcons } from "../../assets/PaintPaletteIcon";
import { PlusFilledIcon } from "../../assets/PlusFilledIcon";
import { ProfileIcon } from "../../assets/ProfileIcon";
import { RepeatIcon } from "../../assets/RepeatIcon";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import Navbar from "../navbar/Navbar";
import { ArtistsDropdown } from "../programs/programComponents/ArtistsDropdown";
import { LocationDropdown } from "../programs/programComponents/LocationDropdown";
import { PayeesDropdown } from "../programs/programComponents/PayeesDropdown";
import { ProgramInformation } from "../programs/programComponents/ProgramInformation";
import { RoomInformation } from "../programs/programComponents/RoomInformation";
import { TimeInputs } from "../programs/programComponents/TimeInputs";
import { UnsavedChangesModal } from "../unsavedChanges/UnsavedChangesModal";

export const EditBooking = () => {
  const { backend } = useBackendContext();
  const navigate = useNavigate();
  const { id } = useParams();
  const [locations, setLocations] = useState({});
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
  const [day, setDay] = useState("");
  const [selectedDays, setSelectedDays] = useState([]);
  const [bookingIds, setBookingIds] = useState([]);
  const [eventId, setEventId] = useState();
  const { isOpen: isOpen, onOpen: onOpen, onClose: onClose } = useDisclosure();
  const [initialState, setInitialState] = useState(null);
  const [infoLoaded, setInfoLoaded] = useState({
    event: false,
    locations: false,
  });

  const {
    isOpen: cancelIsOpen,
    onOpen: cancelOnOpen,
    onClose: cancelOnClose,
  } = useDisclosure();
  const [deactivateOption, setDeactivateOption] = useState("archive");

  useEffect(() => {
    const loadInitialData = async () => {
      await getInitialEventData().then(setInfoLoaded((prev) => ({ ...prev, event: true })));
      await getInitialLocations().then(setInfoLoaded((prev) => ({ ...prev, locations: true })));
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    console.log("initialState", initialState)
    console.log("infoLoaded", infoLoaded);
    if (initialState === null && Object.values(infoLoaded).every(Boolean)) {
      setInitialState(JSON.stringify({
        selectedLocationId,
        startTime,
        endTime,
        startDate,
      }));
    }
  }, [infoLoaded]);

  const exit = () => {
    navigate("/programs/" + eventId);
  };

  const getInitialEventData = async () => {
    console.log("the id is: ", id)
    const eventResponse = await backend.get(`/bookings/displayData/${id}`);
    console.log("eventresponse: ", eventResponse)
    setEventId(eventResponse.data[0].eventId);
    setEventName(eventResponse.data[0].eventname);
    setGeneralInformation(eventResponse.data[0].eventdescription);
    setEventArchived(eventResponse.data[0].archived);
    setSelectedLocation(eventResponse.data[0].roomname);
    setSelectedLocationId(eventResponse.data[0].roomId);
    setRoomDescription(eventResponse.data[0].roomdescription);
    setLocationRate(eventResponse.data[0].rate);
    setStartTime(
      eventResponse.data[0].startTime.split(":").slice(0, 2).join(":")
    );
    setEndTime(eventResponse.data[0].endTime.split(":").slice(0, 2).join(":"));
    setStartDate(eventResponse.data[0].date.split("T")[0]);

    const ids = eventResponse.data.map((booking) => booking.bookingId);

    setBookingIds(ids);
    setEndDate(
      eventResponse.data[eventResponse.data.length - 1].date.split("T")[0]
    );

    const instructors = Array.from(
      new Map(
        eventResponse.data
          .filter((instructor) => instructor.clientrole === "instructor")
          .map((instructor) => [
            instructor.email,
            {
              id: instructor.clientId,
              name: instructor.clientname,
              email: instructor.email,
            },
          ])
      ).values()
    );

    const daysMap = {
      0: "Sunday",
      1: "Monday",
      2: "Tuesday",
      3: "Wednesday",
      4: "Thursday",
      5: "Friday",
      6: "Saturday",
    };
    setDay(
      daysMap[new Date(eventResponse.data[0].date.split("T")[0]).getDay()]
    );

    const payees = Array.from(
      new Map(
        eventResponse.data
          .filter((client) => client.clientrole === "payee")
          .map((client) => [
            client.email,
            {
              id: client.clientId,
              name: client.clientname,
              email: client.email,
            },
          ])
      ).values()
    );

    setSelectedInstructors(instructors);
    setSelectedPayees(payees);
  };

  const getInitialLocations = async () => {
    try {
      const locationResponse = await backend.get("/rooms");
      setLocations(locationResponse.data);
    } catch (error) {
      console.error("Error getting locations:", error);
    }
  };

  const saveEvent = async () => {
    try {
      const bookingsData = {
        event_id: eventId,
        room_id: selectedLocationId,
        start_time: startTime,
        end_time: endTime,
        date: startDate,
        archived: eventArchived,
        description: generalInformation,
      };

      await backend.put("/bookings/" + id, bookingsData);
      console.log("bookingsData in edit: ", bookingsData);

      exit();
    } catch (error) {
      console.error("Error saving:", error);
    }
  };

  const setArchived = async (boolean) => {
    await backend.put(`/bookings/` + id, { archived: boolean });
  };

  const handleConfirm = async () => {
    if (deactivateOption === "archive") {
      setArchived(true);
      onClose();
    } else {
      await backend.delete("/bookings/" + id);
    }
    exit();
  };

  const isFormValid = () => {
    const currentState = JSON.stringify({
        selectedLocationId,
        startTime,
        endTime,
        startDate,
      });
      return (
        startTime && endTime &&
        startDate &&
        selectedLocationId !== "" &&
        initialState !== currentState
      );
    };

  return (
    <Navbar>
      <div id="body">
        <div id="programsBody">
          <div>
            <Icon
              fontSize="xl"
              onClick={cancelOnOpen}
              id="leftCancel"
            >
              <IoCloseOutline />
            </Icon>
            <UnsavedChangesModal
              isOpen={cancelIsOpen}
              onOpen={cancelOnOpen}
              onClose={cancelOnClose}
              exit={exit}
              save={saveEvent}
              isFormValid={isFormValid}
            />
          </div>
          <div id="eventInfoBody">
            <div id="info">
              <EyeIcon id="infoIcon" />
              <p>Editing Session of Program</p>
            </div>
            <div id="title">{eventName}</div>
            <div id="innerBody">
              <TimeInputs
                selectedDays={selectedDays}
                setSelectedDays={setSelectedDays}
                startTime={startTime}
                endTime={endTime}
                setStartTime={setStartTime}
                setEndTime={setEndTime}
              />
              <Flex id="bookingDate">
                <CalendarIcon />
                <span>On {day}</span>
                <Input
                  type="date1"
                  size="md"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  backgroundColor="#fff"
                  color="#2D3748"
                  _placeholder={{
                    color: "#E2E8F0",
                  }}
                  borderColor="#E2E8F0"
                  borderWidth="1px"
                  borderRadius="4px"
                  w={150}
                  textAlign="center"
                  marginLeft="1rem"
                />
              </Flex>

              <Flex id="instructor">
                <PaintPaletteIcons />
                <span>
                  {selectedPayees?.length > 0
                    ? selectedPayees.map((payee) => payee.name).join(", ")
                    : "No payees"}
                </span>
              </Flex>

              <Flex id="payee">
                <ProfileIcon />
                <span>
                  {selectedInstructors?.length > 0
                    ? selectedInstructors
                        .map((instructors) => instructors.name)
                        .join(", ")
                    : "No instructors"}
                </span>
              </Flex>

              <Flex id="emails">
                <EmailIcon />
                <span>
                  {selectedPayees?.length > 0
                    ? selectedPayees.map((payee) => payee.email).join(", ")
                    : "No emails"}
                </span>
              </Flex>

              <LocationDropdown
                locations={locations}
                locationRate={locationRate}
                selectedLocationId={selectedLocationId}
                selectedLocation={selectedLocation}
                setSelectedLocation={setSelectedLocation}
                setSelectedLocationId={setSelectedLocationId}
                setRoomDescription={setRoomDescription}
                setLocationRate={setLocationRate}
              />

              <div id="roomDescription">
                <h3>Room Description</h3>
                <p>{roomDescription}</p>
              </div>

              <div id="information">
                <h3>General Information</h3>
                <p>{generalInformation}</p>
              </div>

              <div id="sessionInformation">
                <h3>Session Information</h3>
                <Textarea placeholder="..."></Textarea>
              </div>
            </div>
          </div>
          <div id="saveCancel">
            <Button
              id="save"
              onClick={saveEvent}
              isDisabled={!isFormValid()}
              backgroundColor={isFormValid() ? "#4441C8.600" : "gray.300"}
              _hover={{ backgroundColor: isFormValid() ? "#312E8A.700" : "gray.300" }}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </Navbar>
  );
};
