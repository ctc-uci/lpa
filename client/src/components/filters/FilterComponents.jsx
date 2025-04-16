import { React, useEffect, useState } from "react";

import {
  Badge,
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { CalendarIcon, TimeIcon, SeasonIcon, EmailIcon, RoomIcon, LeadArtistIcon, PayerIcon } from "../../assets/FilterIcons";
import pastSvg from "../../assets/icons/past.svg";
import activeSvg from "../../assets/icons/active.svg";
import archivedSvg from "../../assets/icons/archived.svg";
import { CloseFilledIcon } from "../../assets/CloseFilledIcon";
import { PlusFilledIcon } from '../../assets/PlusFilledIcon';


export const ProgramStatusFilter = ({ value, onChange }) => {
  const [localStatus, setLocalStatus] = useState(value);

  useEffect(() => {
    setLocalStatus(value);
  }, [value]);

  const handleStatusChange = (newStatus) => {
    setLocalStatus(newStatus);
    onChange("status", newStatus);
  };

  return (
    <FormControl>
      <FormLabel color="#718096">Status</FormLabel>
      <HStack alignItems="center">
        <ButtonGroup
          variant="outline"
          spacing={3}
          colorScheme="purple"
        >
          <Button
            borderRadius="full"
            borderWidth="2px"
            color={localStatus === "all" ? "purple.500" : "gray.300"}
            _hover={{ bg: "purple.100" }}
            onClick={() => handleStatusChange("all")}
          >
            <Text mb="0">All</Text>
          </Button>
          <Button
            borderRadius="full"
            borderWidth="2px"
            color={localStatus === "active" ? "purple.500" : "gray.300"}
            onClick={() => handleStatusChange("active")}
          >
            <Box
              as="img"
              src={activeSvg}
              alt="Active Icon"
              boxSize="20px"
            />
            <Text
              ml="2"
              mb="0"
            >
              Active
            </Text>
          </Button>
          <Button
            borderRadius="full"
            borderWidth="2px"
            color={localStatus === "past" ? "purple.500" : "gray.300"}
            onClick={() => handleStatusChange("past")}
          >
            <Box
              as="img"
              src={pastSvg}
              alt="Past Icon"
              boxSize="20px"
            />
            <Text ml="2">Past</Text>
          </Button>
        </ButtonGroup>
      </HStack>
    </FormControl>
  );
};

export const SessionStatusFilter = ({ value, onChange }) => {
  const [localStatus, setLocalStatus] = useState(value);

  useEffect(() => {
    setLocalStatus(value);
  }, [value]);

  const handleStatusChange = (newStatus) => {
    setLocalStatus(newStatus);
    onChange("status", newStatus);
  };

  return (
    <FormControl>
      <FormLabel color="#718096">Status</FormLabel>
      <HStack alignItems="center">
        <ButtonGroup
          variant="outline"
          spacing={3}
          colorScheme="purple"
        >
          <Button
            borderRadius="full"
            borderWidth="2px"
            color={localStatus === "all" ? "purple.500" : "gray.300"}
            _hover={{ bg: "purple.100" }}
            onClick={() => handleStatusChange("all")}
          >
            <Text mb="0">All</Text>
          </Button>
          <Button
            borderRadius="full"
            borderWidth="2px"
            color={localStatus === "active" ? "purple.500" : "gray.300"}
            onClick={() => handleStatusChange("active")}
          >
            <Box
              as="img"
              src={activeSvg}
              alt="Active Icon"
              boxSize="20px"
            />
            <Text
              ml="2"
              mb="0"
            >
              Active
            </Text>
          </Button>
          <Button
            borderRadius="full"
            borderWidth="2px"
            color={localStatus === "past" ? "purple.500" : "gray.300"}
            onClick={() => handleStatusChange("past")}
          >
            <Box
              as="img"
              src={pastSvg}
              alt="Past Icon"
              boxSize="20px"
            />
            <Text ml="2">Past</Text>
          </Button>
          <Button
            borderRadius="full"
            borderWidth="2px"
            color={localStatus === "archived" ? "purple.500" : "gray.300"}
            onClick={() => handleStatusChange("archived")}
          >
            <Box
              as="img"
              src={archivedSvg}
              alt="Past Icon"
              boxSize="20px"
            />
            <Text ml="2">Archived</Text>
          </Button>
        </ButtonGroup>
      </HStack>
    </FormControl>
  );
};

export const InvoiceStatusFilter = ({ value, onChange }) => {
  const [localStatus, setLocalStatus] = useState(value);

  useEffect(() => {
    setLocalStatus(value);
  }, [value]);

  const handleStatusChange = (newStatus) => {
    setLocalStatus(newStatus);
    onChange("status", newStatus);
  };

  return (
    <FormControl>
      <FormLabel color = "#718096">Status</FormLabel>
      <HStack alignItems="center">
        <ButtonGroup
          variant="outline"
          spacing={3}
          colorScheme="purple"
        >
          <Button
            borderRadius="full"
            borderWidth="2px"
            color={localStatus === "all" ? "purple.500" : "gray.300"}
            _hover={{ bg: "purple.100" }}
            onClick={() => handleStatusChange("all")}
          >
            <Text mb="0">All</Text>
          </Button>
          <Button
            borderRadius="full"
            borderWidth="2px"
            color={localStatus === "full" ? "purple.500" : "gray.300"}
            _hover={{ bg: "purple.100" }}
            onClick={() => handleStatusChange("full")}
          >
            <Text>
              Paid
            </Text>
          </Button>
          <Button
            borderRadius="full"
            borderWidth="2px"
            color={localStatus === "notpaid" ? "purple.500" : "gray.300"}
            _hover={{ bg: "purple.100" }}
            onClick={() => handleStatusChange("notpaid")}
          >
            <Text>Not Paid</Text>
          </Button>
          <Button
            borderRadius="full"
            borderWidth="2px"
            color={localStatus === "none" ? "purple.500" : "gray.300"}
            _hover={{ bg: "purple.100" }}
            onClick={() => handleStatusChange("none")}
          >
            <Text>Past Due</Text>
          </Button>
        </ButtonGroup>
      </HStack>
    </FormControl>
  );
};

export const DayFilter = ({ value = [], onChange }) => {
  const [selectedDays, setSelectedDays] = useState(value);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleDayToggle = (day) => {
    let newSelectedDays;
    if (selectedDays.includes(day)) {
      newSelectedDays = selectedDays.filter(d => d !== day);
    } else {
      newSelectedDays = [...selectedDays, day];
    }
    setSelectedDays(newSelectedDays);
    onChange("days", newSelectedDays);
  };

  return (
    <VStack align="flex-start" spacing={4} width="100%">
      <FormControl>
        <FormLabel color = "#718096">Day</FormLabel>
        <HStack spacing={4}>
          {days.map((day) => (
            <VStack key={day} spacing={2} align="center">
              <Text fontSize="md" fontWeight="medium" color="#718096">
                {day}
              </Text>
              <Checkbox
                _checked={{
                  "& .chakra-checkbox__control": { background: "#4441C8" }
                }}
                size="lg"
                colorScheme="white"
                isChecked={selectedDays.includes(day)}
                onChange={() => handleDayToggle(day)}
                borderColor="gray.200"
                padding={2}
              />
            </VStack>
          ))}
        </HStack>
      </FormControl>
    </VStack>
  );
};

export const DateFilter = ({startDate, endDate, onChange}) => {
  return (
    <FormControl id="date">
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="flex-start"
        gap="16px"
        alignSelf="stretch"
      >
        <Box
          display="flex"
          alignItems="center"
          gap="5px"
          alignSelf="stretch"
        >
          <Icon as={CalendarIcon} />
          <Text
            color="#718096"
            ml="4px"
          >
            Date
          </Text>
        </Box>
        <Box
          display="flex"
          alignItems="center"
          gap="8px"
        >
          <Input
            size="md"
            borderRadius="5px"
            borderColor="#D2D2D2"
            backgroundColor="#F6F6F6"
            width="40%"
            type="date"
            value={startDate || ''}
            placeholder="MM/DD/YYYY"
            onChange={(e) =>
              onChange("startDate", e.target.value)
            }
          />
          <Text> - </Text>
          <Input
            size="md"
            borderRadius="5px"
            borderColor="#D2D2D2"
            backgroundColor="#F6F6F6"
            width="40%"
            type="date"
            value={endDate || ''}
            placeholder="MM/DD/YYYY"
            colorScheme="gray"
            onChange={(e) =>
              onChange("endDate", e.target.value)
            }
          />
        </Box>
      </Box>
    </FormControl>
  );
};

export const TimeFilter = ({startTime, endTime, onChange}) => {

  return (
    <FormControl id="time">
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="flex-start"
        gap="16px"
        alignSelf="stretch"
      >
        <Box
          display="flex"
          alignItems="center"
          gap="5px"
          alignSelf="stretch"
        >
          <Icon as={TimeIcon} />
          <Text color="#718096">Time</Text>
        </Box>
        <Box
          display="flex"
          alignItems="center"
          gap="8px"
        >
          <Input
            size="md"
            borderRadius="5px"
            borderColor="#D2D2D2"
            backgroundColor="#F6F6F6"
            width="30%"
            type="time"
            value={startTime || ''}
            placeholder="00:00 am"
            onChange={(e) => onChange("startTime", e.target.value)}
          />
          <Text> - </Text>
          <Input
            size="md"
            borderRadius="5px"
            borderColor="#D2D2D2"
            backgroundColor="#F6F6F6"
            width="30%"
            type="time"
            value={endTime || ''}
            placeholder="00:00 am"
            onChange={(e) => onChange("endTime", e.target.value)}
          />
        </Box>
      </Box>
    </FormControl>
  );
};

export const RoomFilter = ({ roomMap, onChange, room }) => {
  const [localRoom, setLocalRoom] = useState(room);

  useEffect(() => {
    setLocalRoom(room);
  }, [room]);

  const handleRoomChange = (newRoom) => {
    setLocalRoom(newRoom);
    onChange("room", newRoom);
  };

  return (
    <FormControl>
    <HStack spacing="6px">
      <Icon
        as={RoomIcon}
      />
      <FormLabel mt={1} color="#718096">Room</FormLabel>
    </HStack>
    <HStack
      spacing={2}
      wrap="wrap"
    >
      <Button
        variant="outline"
        borderRadius="full"
        borderWidth="2px"
        color={localRoom === "all" ? "purple.500" : "gray.300"}
        colorScheme="purple"
        onClick={() => handleRoomChange("all")}
      >
        All
      </Button>
      {Array.from(roomMap.values()).map((roomName) => (
        <Button
          key={roomName}
          variant="outline"
          borderRadius="full"
          borderWidth="2px"
          color={localRoom === roomName ? "purple.500" : "gray.300"}
          colorScheme="purple"
          onClick={() => handleRoomChange(roomName)}
        >
          {roomName}
        </Button>
      ))}
    </HStack>
  </FormControl>
  );
};

// Named LeadArtistFilter but works for both leadartist and payer: type="lead" || type="payee"
export const ClientsFilter = ({ clientsList, value, onChange, type }) => {
  const [instructorSearchTerm, setInstructorSearchTerm] = useState('');
  const [searchedInstructors, setSearchedInstructors] = useState([]);
  const [selectedInstructors, setSelectedInstructors] = useState(value || []);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // Update parent component when selection changes
  const handleLeadArtistChange = (artist) => {
    let newSelectedInstructors;
    if (selectedInstructors.includes(artist)) {
      newSelectedInstructors = selectedInstructors.filter(a => a !== artist);
    } else {
      newSelectedInstructors = [...selectedInstructors, artist];
      console.log("new selected:", newSelectedInstructors);
    }
    setSelectedInstructors(newSelectedInstructors);
    if (type === "lead") {
      onChange("instructor", newSelectedInstructors);
    } else {
      onChange("payee", newSelectedInstructors);
    }

  };

  // Filter clients based on search term
  const getInstructorResults = (searchTerm) => {
    if (!searchTerm || searchTerm.trim() === '') {
      setSearchedInstructors([]);
      return;
    }

    const filteredClients = clientsList.filter(client =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedInstructors.some(selected => selected.id === client.id)
    );

    setSearchedInstructors(filteredClients);
  };

  return (
    <VStack align="stretch" spacing={4}>
      <HStack spacing="6px">
        <Icon as={type === "lead" ? LeadArtistIcon : PayerIcon} />
        <Text color="#718096">
          {type === "lead" ? "Lead Artist(s)" : "Payer(s)"}
        </Text>
      </HStack>
      <div id="instructorContainer">
        <div id="instructors">
          <div id="instructorSelection">
            <Box position="relative">
              <div id="instructorInputContainer" style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #E2E8F0',
                borderRadius: '4px',
                padding: '4px 8px'
              }}>
                <Input
                  placeholder="Name"
                  onChange={(e) => {
                    getInstructorResults(e.target.value);
                    setInstructorSearchTerm(e.target.value);
                    setDropdownVisible(true);
                  }}
                  value={instructorSearchTerm}
                  id="instructorInput"
                  variant="unstyled"
                  autoComplete="off"
                />
                <Box
                  as="button"
                  onClick={() => {
                    if (instructorSearchTerm.trim() !== "") {
                      // Find the instructor from the searched list
                      const instructor = searchedInstructors.find(
                        (instr) => instr.name.toLowerCase() === instructorSearchTerm.toLowerCase()
                      );
                      // If instructor exists and is not already selected, add it as a tag
                      if (instructor && !selectedInstructors.some(instr => instr.id === instructor.id)) {
                        console.log("instructor", instructor);
                        setSelectedInstructors((prevItems) => [...prevItems, instructor]);
                        handleLeadArtistChange(instructor);
                      }
                      console.log("Selected Instructors is now", selectedInstructors);
                      setInstructorSearchTerm(""); // reset search
                      setSearchedInstructors([]); // reset searched instructors
                      setDropdownVisible(false); // hide dropdown
                    }
                  }}
                  disabled={
                    instructorSearchTerm.trim() === "" ||
                    !searchedInstructors.some(instr => instr.name.toLowerCase() === instructorSearchTerm.toLowerCase())
                  }
                  cursor={
                    instructorSearchTerm.trim() === "" ||
                    !searchedInstructors.some(instr => instr.name.toLowerCase() === instructorSearchTerm.toLowerCase())
                      ? "not-allowed" : "pointer"
                  }
                  style={{
                    background: "none",
                    border: "none",
                    padding: "4px",
                    borderRadius: "50%"
                  }}
                >
                  <Icon as={PlusFilledIcon}
                    color={
                      instructorSearchTerm.trim() !== "" &&
                      searchedInstructors.some(instr => instr.name.toLowerCase() === instructorSearchTerm.toLowerCase())
                        ? "#4441C8" : "#718096"
                    }
                  />
                </Box>
              </div>

              {dropdownVisible && searchedInstructors.length > 0 && instructorSearchTerm.length > 0 && (
                <Box
                  id="instructorDropdown"
                  w="100%"
                  maxW="195px"
                  position="absolute"
                  zIndex={10}
                  boxShadow="md"
                  bg="white"
                  borderRadius="md"
                  mt={1}
                >
                  {searchedInstructors.map((instructor) => (
                    <Box
                      key={instructor.id}
                      onClick={() => {
                        setInstructorSearchTerm(instructor.name); // Populate input field
                        setDropdownVisible(false);
                      }}
                      style={{
                        padding: "10px",
                        fontSize: "16px",
                        cursor: "pointer",
                        transition: "0.2s",
                        backgroundColor: "#FFF",
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
        <div id="instructorTags" style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          marginTop: '8px'
        }}>
          {selectedInstructors.length > 0 ? (
            selectedInstructors.map((instructor, ind) => (
              <div className="instructorTag" key={ind} style={{
                display: 'flex',
                alignItems: 'center',
              }}>
                <Badge
                  colorScheme="blue"
                  borderRadius="full"
                  px={3}
                  py={1}
                  display="flex"
                  alignItems="center"
                >
                  {instructor.name}
                  <Box
                    as="span"
                    ml={1}
                    backgroundColor="red"
                    cursor="pointer"
                    onClick={() => {
                      // Remove the instructor from the list
                      const newSelectedInstructors = selectedInstructors.filter(
                        (artist) => artist.id !== instructor.id
                      );
                      setSelectedInstructors(newSelectedInstructors);
                      // Notify parent component of the change
                      if (type === "lead") {
                        onChange("instructor", newSelectedInstructors);
                      } else {
                        onChange("payee", newSelectedInstructors);
                      }
                    }}
                  >
                    <Icon
                      fontSize="sm"
                      color="#718096"
                      _hover={{ color: "#4441C8" }}
                      as={CloseFilledIcon}
                    />
                  </Box>
                </Badge>
              </div>
            ))
          ) : <div></div>}
        </div>
      </div>
    </VStack>
  );
}

export const SeasonFilter = ({ value, onChange }) => {
  const [localSeason, setLocalSeason] = useState(value);

  useEffect(() => {
    setLocalSeason(value);
  }, [value]);

  const handleSeasonChange = (newStatus) => {
    setLocalSeason(newStatus);
    onChange("season", newStatus);
  };
  return (
    <FormControl>
      <FormLabel>
        <Flex alignItems="center">
          <Icon as={SeasonIcon} />
          <Text color="#718096" ml="5px">Season</Text>
        </Flex>
      </FormLabel>
      <HStack alignItems="center">
        <ButtonGroup
          variant="outline"
          spacing={3}
          colorScheme="purple"
        >
          <Button
            borderRadius="full"
            borderWidth="2px"
            color={localSeason === "all" ? "purple.500" : "gray.300"}
            _hover={{ bg: "purple.100" }}
            onClick={() => handleSeasonChange("all")}
          >
            <Text mb="0">All</Text>
          </Button>
          <Button
            borderRadius="full"
            borderWidth="2px"
            color={localSeason === "Summer" ? "purple.500" : "gray.300"}
            _hover={{ bg: "purple.100" }}
            onClick={() => handleSeasonChange("Summer")}
          >
            <Text>
              Summer
            </Text>
          </Button>
          <Button
            borderRadius="full"
            borderWidth="2px"
            color={localSeason === "Fall" ? "purple.500" : "gray.300"}
            _hover={{ bg: "purple.100" }}
            onClick={() => handleSeasonChange("Fall")}
          >
            <Text>Fall</Text>
          </Button>
          <Button
            borderRadius="full"
            borderWidth="2px"
            color={localSeason === "Winter" ? "purple.500" : "gray.300"}
            _hover={{ bg: "purple.100" }}
            onClick={() => handleSeasonChange("Winter")}
          >
            <Text>Winter</Text>
          </Button>
        </ButtonGroup>
      </HStack>
    </FormControl>
  );
};

export const EmailFilter = ({ value, onChange}) => {
  const [localEmail, setLocalEmail] = useState(value);

  useEffect(() => {
    setLocalEmail(value);
  }, [value]);

  const handleEmailChange = (newStatus) => {
    setLocalEmail(newStatus);
    onChange("email", newStatus);
  };

  return (
    <FormControl>
      <FormLabel>
        <Flex alignItems="center">
          <Icon as={EmailIcon} />
          <Text color="#718096" ml="5px">Email</Text>
        </Flex>
      </FormLabel>
      <HStack alignItems="center">
        <ButtonGroup
          variant="outline"
          spacing={3}
          colorScheme="purple"
        >
          <Button
            borderRadius="full"
            borderWidth="2px"
            color={localEmail === "all" ? "purple.500" : "gray.300"}
            _hover={{ bg: "purple.100" }}
            onClick={() => handleEmailChange("all")}
          >
            <Text mb="0">All</Text>
          </Button>
          <Button
            borderRadius="full"
            borderWidth="2px"
            color={localEmail === "true" ? "purple.500" : "gray.300"}
            _hover={{ bg: "purple.100" }}
            onClick={() => handleEmailChange("true")}
          >
            <Text>
              Sent
            </Text>
          </Button>
          <Button
            borderRadius="full"
            borderWidth="2px"
            color={localEmail === "" ? "purple.500" : "gray.300"}
            _hover={{ bg: "purple.100" }}
            onClick={() => handleEmailChange("")}
          >
            <Text>Not Sent</Text>
          </Button>
        </ButtonGroup>
      </HStack>
    </FormControl>
  );
};
