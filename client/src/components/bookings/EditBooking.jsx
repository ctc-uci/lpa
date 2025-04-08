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
import { TimeInputs } from "../programs/programComponents/TimeInputs";
import { ArchiveIcon } from "../../assets/ArchiveIcon";
import { CalendarIcon } from "../../assets/CalendarIcon";
import { CancelIcon } from "../../assets/CancelIcon";
import { ClockFilledIcon } from "../../assets/ClockFilledIcon";
import { CloseFilledIcon } from "../../assets/CloseFilledIcon";
import { UnsavedChangesModal } from "../unsavedChanges/UnsavedChangesModal";
import { DeleteIcon } from "../../assets/DeleteIcon";
import { DollarIcon } from "../../assets/DollarIcon";
import { EmailIcon } from "../../assets/EmailIcon";
import { EyeIcon } from "../../assets/EyeIcon";
import { InfoIconRed } from "../../assets/InfoIconRed";
import { LocationIcon } from "../../assets/LocationIcon";
import { PlusFilledIcon } from "../../assets/PlusFilledIcon";
import { PaintPaletteIcons } from "../../assets/PaintPaletteIcon";
import { ProfileIcon } from "../../assets/ProfileIcon";
import { RepeatIcon } from "../../assets/RepeatIcon";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import Navbar from "../navbar/Navbar";

export const EditBooking = () => {
  const { backend } = useBackendContext();
  const navigate = useNavigate();
  const { id } = useParams();
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
  const [eventId, setEventId] = useState();
  const { isOpen: isOpen, onOpen: onOpen, onClose: onClose } = useDisclosure();

  const {
    isOpen: cancelIsOpen,
    onOpen: cancelOnOpen,
    onClose: cancelOnClose,
  } = useDisclosure();
  const [deactivateOption, setDeactivateOption] = useState("archive");

  useEffect(() => {
    getInitialEventData();
    getInitialLocations();
  }, []);

  const exit = () => {
    navigate("/programs/" + eventId);
  };

  const getInitialEventData = async () => {
    const eventResponse = await backend.get(`/bookings/displayData/${id}`);
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

      await backend.put("/bookings/byEvent/" + id, bookingsData);

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
            />
          </div>
          <div id="eventInfoBody">
            <div id="info">
              <EyeIcon id="infoIcon" />
              <p>Editing Session of Program</p>
            </div>
            <div id="title">
              <h1>
                <b>{eventName}</b>
              </h1>
            </div>
            <div id="innerBody">
                <TimeInputs
                    selectedDays={selectedDays}
                    setSelectedDays={setSelectedDays}
                    startTime={startTime}
                    endTime={endTime}
                    setStartTime={setStartTime}
                    setEndTime={setEndTime}
                    className="inputElement"
                />
                <div>
                  <Icon
                    boxSize={6}
                    fontSize="lg"
                  >
                    <CalendarIcon />
                  </Icon> On
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
                </div>

              <Flex id="instructor">
                <PaintPaletteIcons />
                <span>
                  {selectedPayees.map((payee) => payee.name).join(", ")}
                </span>
              </Flex>

              <Flex id="payee">
                <ProfileIcon />
                <span>
                  {selectedInstructors.map((instructors) => instructors.name).join(", ")}
                </span>
              </Flex>

              <Flex id="payeeEmails">
                <EmailIcon />
                <span>
                  {selectedPayees.map((payee) => payee.email).join(", ")}
                </span>
              </Flex>

              <div id="location">
                <LocationIcon />
                {locations && locations.length > 0 ? (
                  <Select
                    width="30%"
                    value={
                      selectedLocationId === "" ? "DEFAULT" : selectedLocationId
                    }
                    onChange={(event) => {
                      const selectedId = parseInt(event.target.value);
                      const location = locations.find(
                        (loc) => loc.id === selectedId
                      );
                      setSelectedLocation(location.name);
                      setSelectedLocationId(location.id);
                      setRoomDescription(location.description);
                      setLocationRate(location.rate);
                    }}
                  >
                    <option
                      value={"DEFAULT"}
                      disabled
                    >
                      Location...
                    </option>
                    {locations.map((location) => (
                      <option
                        value={location.id}
                        key={location.id}
                      >
                        {location.name}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <div></div>
                )}
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
                <p>{generalInformation}</p>
              </div>
            </div>
          </div>
          <div id="saveCancel">
            <Button
              id="save"
              onClick={saveEvent}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </Navbar>
  );
};
