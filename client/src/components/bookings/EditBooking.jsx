import { useEffect, useState } from "react";
import './EditBooking.css';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
useDisclosure,
Checkbox,
// Lorem,
} from "@chakra-ui/react";

import {InfoIconPurple} from '../../assets/InfoIconPurple';
import {InfoIconRed} from '../../assets/InfoIconRed';
import {ArchiveIcon} from '../../assets/ArchiveIcon';
import {DeleteIcon} from '../../assets/DeleteIcon';
import {ProfileIcon} from '../../assets/ProfileIcon';
import {CancelIcon} from '../../assets/CancelIcon';
import {RepeatIcon} from '../../assets/RepeatIcon';
import {ClockFilledIcon} from '../../assets/ClockFilledIcon';
import {CalendarIcon} from '../../assets/CalendarIcon';
import {PlusFilledIcon} from '../../assets/PlusFilledIcon';
import {CloseFilledIcon} from '../../assets/CloseFilledIcon';
import { ChevronDownIcon } from "@chakra-ui/icons";
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
  const [eventId, setEventId] = useState();
  const {
  isOpen: isOpen,
  onOpen: onOpen,
  onClose: onClose
} = useDisclosure();

const {
  isOpen: cancelIsOpen,
  onOpen: cancelOnOpen,
  onClose: cancelOnClose
} = useDisclosure();
  const [deactivateOption, setDeactivateOption] = useState("archive");



  useEffect(() => {
    getInitialEventData();
    getInitialLocations();
    printData();
  }, []);

  const printData = () => {
    console.log(eventName);
  };

  const exit = () => {
    navigate('/programs/' + eventId);
  };

  const getInitialEventData = async () => {
    const eventResponse = await backend.get(`/bookings/displayData/${id}`);
    console.log(eventResponse.data);
console.log(eventResponse.data[0]);
    setEventId(eventResponse.data[0].eventId);
    setEventName(eventResponse.data[0].eventname);
    setGeneralInformation(eventResponse.data[0].eventdescription);
    setEventArchived(eventResponse.data[0].archived);
    setSelectedLocation(eventResponse.data[0].roomname);
    setSelectedLocationId(eventResponse.data[0].roomId);
    setRoomDescription(eventResponse.data[0].roomdescription);
    setLocationRate(eventResponse.data[0].rate);
    setStartTime(eventResponse.data[0].startTime.split(':').slice(0, 2).join(':'));
    setEndTime(eventResponse.data[0].endTime.split(':').slice(0, 2).join(':'));
    setStartDate(eventResponse.data[0].date.split("T")[0]);

    const ids = eventResponse.data.map(booking => booking.bookingId);

    setBookingIds(ids);
    setEndDate(eventResponse.data[eventResponse.data.length - 1].date.split("T")[0]);

    const instructors = Array.from (
      new Map (
        eventResponse.data
        .filter(instructor => instructor.clientrole === "instructor")
        .map (instructor => [instructor.email, {
          id: instructor.clientId,
          name: instructor.clientname,
          email: instructor.email
        }])
      ).values()
    );

    const payees = Array.from (
      new Map (
        eventResponse.data
        .filter(client => client.clientrole === "payee")
        .map (client => [client.email, {
          id: client.clientId,
          name: client.clientname,
          email: client.email
        }])
      ).values()
    );

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

      await backend.put('/bookings/byEvent/' + id, bookingsData);

      exit();

    } catch (error) {
        console.error("Error saving:", error);
    }
  };

  const setArchived = async (boolean) => {
  console.log("set archived: ", boolean)
    await backend.put(`/bookings/` + id, {archived: boolean});
  }

  const handleConfirm = async () => {
    if (deactivateOption === "archive") {
      setArchived(true);
      onClose();
    }
    else {
      await backend.delete('/bookings/' + id);
    }
    exit();
  }

return (
    <Navbar>
      <div id="body">
        <div id="programsBody">
          <div>
            <Icon fontSize="2xl" onClick={cancelOnOpen} id="leftCancel"><IoCloseOutline/></Icon>
            <Modal isOpen={cancelIsOpen} onClose={cancelOnClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader textAlign="center" paddingBottom="0">Discard unsaved changes?</ModalHeader>
                <ModalFooter style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant='ghost' onClick={cancelOnClose}>
                    Cancel
                  </Button>
                  <Button  colorScheme='red' mr={3} id="deactivateConfirm" onClick={exit}>Ok</Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </div>
          <div id="eventInfoBody">
            <div id="info">
              <InfoIconPurple id="infoIcon"/>
              <p>You are editing a session of this program</p>
            </div>
            <div id="title">
              <h1><b>{eventName}</b></h1>
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
              <Flex align="center" gap={8.25}>
                  <ProfileIcon />
                  <span> {selectedPayees.map(payee => payee.name).join(", ")} </span>
                  <ProfileIcon />
                  <span> {selectedInstructors.map(instructors => instructors.name).join(", ")} </span>
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
                <Textarea value={generalInformation} isReadOnly backgroundColor="#F6F6F6"></Textarea>
              </div>
            </div>
          </div>
          <div id="saveCancel">
            <Button id="save" onClick={saveEvent}>Save</Button>
            <Popover id="popTrigger">
              <PopoverTrigger asChild>
                <Icon boxSize="10"><CiCircleMore/></Icon>
              </PopoverTrigger>
                <PopoverContent style={{width:"100%"}}>
                  <PopoverBody onClick={onOpen}>
                    <div id="cancelBody">
                      <Icon fontSize="1xl"><CancelIcon id="cancelIcon"/></Icon>
                      <p id="cancel">Deactivate</p>
                    </div>
                  </PopoverBody>
                </PopoverContent>
            </Popover>
            <Modal isOpen={isOpen} onClose={onClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Deactivate Program?</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <div id="deactivateDeadlineBox">
                    <Box padding = "10px" backgroundColor = "red.100" borderRadius="15px">
                      <div class="horizontal">
                        <InfoIconRed fontSize="2xl"/>
                        <p id="deactivateDeadlineText"> The deactivation fee deadline for this session is Thu. 1/2/2025 </p>
                      </div>
                      <Checkbox borderColor = "black">Waive fee </Checkbox>
                    </Box>
                    </div>
                  <div id="deactivateReason">Reason for Deactivation
                    <Input placeholder="..." />
                  </div>
                  <div id = "archive" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Menu>
                    <MenuButton as={Button} rightIcon={<ChevronDownIcon />} backgroundColor="#F6F6F6" width="30%">
                        <Box display="flex" alignItems="center" justifyContent = "space-between" gap="8px">
                          <Box as="span" display="flex" alignItems="center" gap="8px">
                            <Icon as={ArchiveIcon} />
                            {deactivateOption === "archive" ? "Archive" : "Delete "}
                          </Box>
                        </Box>
                    </MenuButton>
                    <MenuList>
                      <MenuItem
                        icon={<ArchiveIcon />}
                        onClick={() => {
                          setDeactivateOption("archive");
                          setEventArchived(true);
                        }}
                      >
                        Archive
                      </MenuItem>
                      <MenuItem
                        icon={<DeleteIcon />}
                        onClick={() => {
                          setDeactivateOption("delete");
                          setEventArchived(false);
                        }}
                      >
                        Delete
                      </MenuItem>
                    </MenuList>
                  </Menu>
                  </div>
                </ModalBody>

                <ModalFooter style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant='ghost' onClick={onClose}>
                    Exit
                  </Button>
                  <Button  colorScheme='red' mr={3} id="deactivateConfirm" onClick={() => {handleConfirm(); exit();}}>Confirm</Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </div>
        </div>
      </div>
    </Navbar>
);
};
