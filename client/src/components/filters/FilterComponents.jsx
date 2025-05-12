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

import { CloseFilledIcon } from "../../assets/CloseFilledIcon";
import {
  CalendarIcon,
  EmailIcon,
  LeadArtistIcon,
  PayerIcon,
  RoomIcon,
  SeasonIcon,
  TimeIcon,
} from "../../assets/FilterIcons";
import activeSvg from "../../assets/icons/active.svg";
import archivedSvg from "../../assets/icons/archived.svg";
import noBookingsSvg from "../../assets/icons/none.svg";
import pastSvg from "../../assets/icons/past.svg";
import { PlusFilledIcon } from "../../assets/PlusFilledIcon";

import "./Filters.css";

export const RoundedButton = ({ children, onClick, isActive }) => {
  return (
    <Button
      borderRadius="full"
      borderWidth="2px"
      fontWeight="500"
      borderColor={isActive ? "#4441C8" : "transparent"}
      color={isActive ? "#4441C8" : "#2D3748"}
      backgroundColor="#EDF2F7"
      _hover={{
        backgroundColor: "#E2E8F0",
      }}
      onClick={() => onClick()}
    >
      {children}
    </Button>
  );
};

export const DateInput = ({ value, onChange }) => {
  return (
    <Input
      size="md"
      borderRadius="5px"
      borderColor="#E2E8F0"
      backgroundColor="#FFF"
      color="#2D3748"
      width="40%"
      type="date"
      value={value || ""}
      sx={{
        "&::-webkit-calendar-picker-indicator": {
          cursor: "pointer",
        },
        '&:not([value=""])': {
          color: "#2D3748",
        },
        '&[value=""]': {
          color: "#A0AEC0",
        },
      }}
      onChange={(e) => onChange(e)}
    />
  );
};

export const TimeInput = ({ value, onChange }) => {
  return (
    <Input
      size="md"
      borderRadius="5px"
      borderColor="#E2E8F0"
      backgroundColor="#FFF"
      color="#2D3748"
      width="40%"
      type="time"
      value={value || ""}
      marginLeft="8px"
      marginRight="8px"
      sx={{
        "&::-webkit-calendar-picker-indicator": {
          cursor: "pointer",
        },
        '&:not([value=""])': {
          color: "#2D3748",
        },
        '&[value=""]': {
          color: "#A0AEC0",
        },
      }}
      onChange={(e) => onChange(e)}
    />
  );
};

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
          <RoundedButton
            onClick={() => handleStatusChange("all")}
            isActive={localStatus === "all"}
          >
            <Text mb="0">All</Text>
          </RoundedButton>
          <RoundedButton
            onClick={() => handleStatusChange("active")}
            isActive={localStatus === "active"}
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
          </RoundedButton>
          <RoundedButton
            onClick={() => handleStatusChange("past")}
            isActive={localStatus === "past"}
          >
            <Box
              as="img"
              src={pastSvg}
              alt="Past Icon"
              boxSize="20px"
            />
            <Text ml="2">Past</Text>
          </RoundedButton>
          <RoundedButton
            onClick={() => handleStatusChange("no bookings")}
            isActive={localStatus === "no bookings"}
          >
            <Box
              as="img"
              src={noBookingsSvg}
              alt="No Bookings Icon"
              boxSize="20px"
            />
            <Text ml="2">No Bookings</Text>
          </RoundedButton>
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
          <RoundedButton
            onClick={() => handleStatusChange("all")}
            isActive={localStatus === "all"}
          >
            <Text mb="0">All</Text>
          </RoundedButton>
          <RoundedButton
            onClick={() => handleStatusChange("active")}
            isActive={localStatus === "active"}
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
          </RoundedButton>
          <RoundedButton
            onClick={() => handleStatusChange("past")}
            isActive={localStatus === "past"}
          >
            <Box
              as="img"
              src={pastSvg}
              alt="Past Icon"
              boxSize="20px"
            />
            <Text ml="2">Past</Text>
          </RoundedButton>
          <RoundedButton
            onClick={() => handleStatusChange("archived")}
            isActive={localStatus === "archived"}
          >
            <Box
              as="img"
              src={archivedSvg}
              alt="Past Icon"
              boxSize="20px"
            />
            <Text ml="2">Archived</Text>
          </RoundedButton>
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
      <FormLabel color="#718096">Status</FormLabel>
      <HStack alignItems="center">
        <ButtonGroup
          variant="outline"
          spacing={3}
          colorScheme="purple"
        >
          <RoundedButton
            onClick={() => handleStatusChange("all")}
            isActive={localStatus === "all"}
          >
            <Text mb="0">All</Text>
          </RoundedButton>
          <RoundedButton
            onClick={() => handleStatusChange("full")}
            isActive={localStatus === "full"}
          >
            <Text>Paid</Text>
          </RoundedButton>
          <RoundedButton
            onClick={() => handleStatusChange("notpaid")}
            isActive={localStatus === "notpaid"}
          >
            <Text>Not Paid</Text>
          </RoundedButton>
          <RoundedButton
            onClick={() => handleStatusChange("none")}
            isActive={localStatus === "none"}
          >
            <Text>Past Due</Text>
          </RoundedButton>
        </ButtonGroup>
      </HStack>
    </FormControl>
  );
};

export const DayFilter = ({ value = [], onChange }) => {
  const [selectedDays, setSelectedDays] = useState(value);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handleDayToggle = (day) => {
    let newSelectedDays;
    if (selectedDays.includes(day)) {
      newSelectedDays = selectedDays.filter((d) => d !== day);
    } else {
      newSelectedDays = [...selectedDays, day];
    }
    setSelectedDays(newSelectedDays);
    onChange("days", newSelectedDays);
  };

  useEffect(() => {
    setSelectedDays(value);
  }, [value]);

  return (
    <VStack
      align="flex-start"
      spacing={4}
      width="100%"
    >
      <FormControl>
        <FormLabel color="#718096">Day</FormLabel>
        <HStack spacing={4}>
          {days.map((day) => (
            <VStack
              key={day}
              spacing={2}
              align="center"
            >
              <Text
                fontSize="md"
                fontWeight="medium"
                color="#718096"
              >
                {day}
              </Text>
              <Checkbox
                _checked={{
                  "& .chakra-checkbox__control": {
                    background: "#4441C8",
                    borderColor: "transparent",
                  },
                }}
                _hover={{
                  "& .chakra-checkbox__control": {
                    background: `${selectedDays.includes(day) ? "#4441C8" : "#E2E8F0"}`,
                  },
                }}
                size="lg"
                isChecked={selectedDays.includes(day)}
                onChange={() => handleDayToggle(day)}
                borderColor="#E2E8F0"
                backgroundColor="#FFF"
                padding={2}
              />
            </VStack>
          ))}
        </HStack>
      </FormControl>
    </VStack>
  );
};

export const DateFilter = ({ startDate, endDate, onChange }) => {
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
          <DateInput
            onChange={(e) => onChange("startDate", e.target.value)}
            value={startDate || ""}
          />
          <Text> - </Text>
          <DateInput
            onChange={(e) => onChange("endDate", e.target.value)}
            value={endDate || ""}
          />
        </Box>
      </Box>
    </FormControl>
  );
};

export const TimeFilter = ({ startTime, endTime, onChange }) => {
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
          <TimeInput
            value={startTime || ""}
            onChange={(e) => onChange("startTime", e.target.value)}
          />
          <Text> - </Text>
          <TimeInput
            value={endTime || ""}
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
        <Icon as={RoomIcon} />
        <FormLabel
          mt={1}
          color="#718096"
        >
          Room
        </FormLabel>
      </HStack>
      <HStack
        spacing={2}
        wrap="wrap"
      >
        <RoundedButton
          onClick={() => handleRoomChange("all")}
          isActive={localRoom === "all"}
        >
          All
        </RoundedButton>
        {Array.from(roomMap.values()).map((roomName) => (
          <RoundedButton
            key={roomName}
            onClick={() => handleRoomChange(roomName)}
            isActive={localRoom === roomName}
          >
            {roomName}
          </RoundedButton>
        ))}
      </HStack>
    </FormControl>
  );
};

// Named ClientsFilter but works for both leadartist and payer: type="lead" || type="payee"
export const ClientsFilter = ({ clientsList, value, onChange, type }) => {
  const [instructorSearchTerm, setInstructorSearchTerm] = useState("");
  const [searchedInstructors, setSearchedInstructors] = useState([]);
  const [selectedInstructors, setSelectedInstructors] = useState(value || []);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownVisible &&
        !event.target.closest("#instructorInputContainer") &&
        !event.target.closest("#instructorDropdown")
      ) {
        setDropdownVisible(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownVisible]);
  const handleLeadArtistChange = (artist) => {
    let newSelectedInstructors;
    if (selectedInstructors.includes(artist)) {
      newSelectedInstructors = selectedInstructors.filter((a) => a !== artist);
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
  const getInstructorResults = (searchTerm) => {
    if (!searchTerm || searchTerm.trim() === "") {
      const availableClients = clientsList.filter(
        (client) =>
          !selectedInstructors.some((selected) => selected.id === client.id)
      );
      setSearchedInstructors(availableClients);
      return;
    }

    const filteredClients = clientsList.filter(
      (client) =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !selectedInstructors.some((selected) => selected.id === client.id)
    );

    setSearchedInstructors(filteredClients);
  };

  // Handle input focus
  const handleInputFocus = () => {
    // Show all available clients when input is focused
    const availableClients = clientsList.filter(
      (client) =>
        !selectedInstructors.some((selected) => selected.id === client.id)
    );
    setSearchedInstructors(availableClients);
    setDropdownVisible(true);
  };

  return (
    <VStack
      align="stretch"
      spacing={4}
      width="45%"
      maxW="600px"
    >
      <HStack spacing="6px">
        <Icon as={type === "lead" ? LeadArtistIcon : PayerIcon} />
        <Text color="#718096">
          {type === "lead" ? "Lead Artist(s)" : "Payer(s)"}
        </Text>
      </HStack>
      <div
        id="instructorContainer"
        style={{ width: "100%" }}
      >
        <HStack
          width="100%"
          spacing={3}
          align="flex-start"
        >
          <Box
            position="relative"
            width="100%"
          >
            <div
              id="instructorInputContainer"
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #E2E8F0",
                borderRadius: "8px",
                padding: "8px 12px",
                width: "100%",
                background: "white",
              }}
            >
              <Input
                placeholder="Name"
                onChange={(e) => {
                  getInstructorResults(e.target.value);
                  setInstructorSearchTerm(e.target.value);
                  setDropdownVisible(true);
                }}
                onFocus={handleInputFocus}
                onBlur={(e) => {
                  setTimeout(() => {
                    if (
                      !document.activeElement.closest("#instructorDropdown")
                    ) {
                      setDropdownVisible(false);
                    }
                  }, 200);
                }}
                value={instructorSearchTerm}
                id="instructorInput"
                variant="unstyled"
                autoComplete="off"
                flex="1"
                minWidth="120px"
                fontSize="16px"
              />
              <Box
                as="button"
                onClick={() => {
                  // If there's text in the input, find instructor by name
                  if (instructorSearchTerm.trim() !== "") {
                    // Find the instructor from the searched list
                    const instructor = searchedInstructors.find(
                      (instr) =>
                        instr.name.toLowerCase() ===
                        instructorSearchTerm.toLowerCase()
                    );
                    // If instructor exists and is not already selected, add it as a tag
                    if (
                      instructor &&
                      !selectedInstructors.some(
                        (instr) => instr.id === instructor.id
                      )
                    ) {
                      console.log("instructor", instructor);
                      setSelectedInstructors((prevItems) => [
                        ...prevItems,
                        instructor,
                      ]);
                      handleLeadArtistChange(instructor);
                    }
                    console.log(
                      "Selected Instructors is now",
                      selectedInstructors
                    );
                    setInstructorSearchTerm(""); // reset search
                    // Don't reset searched instructors, just refresh them without selected ones
                    const availableClients = clientsList.filter(
                      (client) =>
                        !selectedInstructors.some(
                          (selected) => selected.id === client.id
                        ) && !(instructor && client.id === instructor.id) // also exclude the one we just added
                    );
                    setSearchedInstructors(availableClients);
                  }
                  // If input is empty but an item is selected in dropdown, add that item
                  else if (dropdownVisible && searchedInstructors.length > 0) {
                    // Get the first instructor from the list
                    const instructor = searchedInstructors[0];

                    if (
                      instructor &&
                      !selectedInstructors.some(
                        (instr) => instr.id === instructor.id
                      )
                    ) {
                      console.log(
                        "Adding first instructor from list:",
                        instructor
                      );
                      setSelectedInstructors((prevItems) => [
                        ...prevItems,
                        instructor,
                      ]);
                      handleLeadArtistChange(instructor);

                      // Update available instructors without refreshing dropdown
                      const availableClients = searchedInstructors.filter(
                        (client) => client.id !== instructor.id
                      );
                      setSearchedInstructors(availableClients);
                    }
                  }
                }}
                disabled={
                  (instructorSearchTerm.trim() === "" &&
                    searchedInstructors.length === 0) ||
                  (instructorSearchTerm.trim() !== "" &&
                    !searchedInstructors.some(
                      (instr) =>
                        instr.name.toLowerCase() ===
                        instructorSearchTerm.toLowerCase()
                    ))
                }
                cursor={
                  (instructorSearchTerm.trim() === "" &&
                    searchedInstructors.length === 0) ||
                  (instructorSearchTerm.trim() !== "" &&
                    !searchedInstructors.some(
                      (instr) =>
                        instr.name.toLowerCase() ===
                        instructorSearchTerm.toLowerCase()
                    ))
                    ? "not-allowed"
                    : "pointer"
                }
                style={{
                  background: "none",
                  border: "none",
                  padding: "4px",
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon
                  as={PlusFilledIcon}
                  color={
                    instructorSearchTerm.trim() !== "" &&
                    searchedInstructors.some(
                      (instr) =>
                        instr.name.toLowerCase() ===
                        instructorSearchTerm.toLowerCase()
                    )
                      ? "#4441C8"
                      : "#718096"
                  }
                />
              </Box>
            </div>

            {dropdownVisible && searchedInstructors.length > 0 && (
              <Box
                id="instructorDropdown"
                w="100%"
                maxW="100%"
                position="absolute"
                zIndex={999}
                boxShadow="lg"
                bg="white"
                borderRadius="md"
                mt={1}
                maxH="200px"
                overflowY="auto"
              >
                {searchedInstructors.map((instructor) => (
                  <Box
                    key={instructor.id}
                    onClick={() => {
                      // Add the instructor immediately instead of just setting the search term
                      if (
                        !selectedInstructors.some(
                          (instr) => instr.id === instructor.id
                        )
                      ) {
                        setSelectedInstructors((prevItems) => [
                          ...prevItems,
                          instructor,
                        ]);
                        handleLeadArtistChange(instructor);

                        // Update available instructors
                        const availableClients = searchedInstructors.filter(
                          (client) => client.id !== instructor.id
                        );
                        setSearchedInstructors(availableClients);
                      }
                      setInstructorSearchTerm("");
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

          <Box
            position="absolute"
            left="calc(100% + 12px)"
            top="0"
            display="flex"
            flexDirection="column"
            gap="8px"
            alignItems="flex-start"
          >
            {selectedInstructors.length > 0 &&
              selectedInstructors.map((instructor, ind) => (
                <Badge
                  key={ind}
                  colorScheme="gray"
                  borderRadius="full"
                  px={3}
                  py={1.5}
                  display="flex"
                  alignItems="center"
                >
                  {instructor.name}
                  <Box
                    as="span"
                    ml={2}
                    cursor="pointer"
                    onClick={(e) => {
                      e.stopPropagation();
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
              ))}
          </Box>
        </HStack>
      </div>
    </VStack>
  );
};

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
          <Text
            color="#718096"
            ml="5px"
          >
            Season
          </Text>
        </Flex>
      </FormLabel>
      <HStack alignItems="center">
        <ButtonGroup
          variant="outline"
          spacing={3}
          colorScheme="purple"
        >
          <RoundedButton
            onClick={() => handleSeasonChange("all")}
            isActive={localSeason === "all"}
          >
            All
          </RoundedButton>
          <RoundedButton
            onClick={() => handleSeasonChange("Summer")}
            isActive={localSeason === "Summer"}
          >
            Summer
          </RoundedButton>

          <RoundedButton
            onClick={() => handleSeasonChange("Fall")}
            isActive={localSeason === "Fall"}
          >
            Fall
          </RoundedButton>
          <RoundedButton
            onClick={() => handleSeasonChange("Winter")}
            isActive={localSeason === "Winter"}
          >
            Winter
          </RoundedButton>
        </ButtonGroup>
      </HStack>
    </FormControl>
  );
};

export const EmailFilter = ({ value, onChange }) => {
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
          <Text
            color="#718096"
            ml="5px"
          >
            Email
          </Text>
        </Flex>
      </FormLabel>
      <HStack alignItems="center">
        <ButtonGroup
          variant="outline"
          spacing={3}
          colorScheme="purple"
        >
          <RoundedButton
            onClick={() => handleEmailChange("all")}
            isActive={localEmail === "all"}
          >
            All
          </RoundedButton>
          <RoundedButton
            onClick={() => handleEmailChange("true")}
            isActive={localEmail === "true"}
          >
            Sent
          </RoundedButton>
          <RoundedButton
            onClick={() => handleEmailChange("")}
            isActive={localEmail === ""}
          >
            Not Sent
          </RoundedButton>
        </ButtonGroup>
      </HStack>
    </FormControl>
  );
};
