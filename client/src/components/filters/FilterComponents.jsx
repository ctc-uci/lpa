import { React, useEffect, useState } from "react";

import {
  filterDateCalendar,
} from "../../assets/icons/ProgramIcons";

import {
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
  InputGroup,
  Tag,
  Text,
  VStack,
  useColorModeValue
} from "@chakra-ui/react";
import { CalendarIcon, TimeIcon, SeasonIcon, EmailIcon, RoomIcon, LeadArtistIcon, PayerIcon } from "../../assets/FilterIcons";
import pastSvg from "../../assets/icons/past.svg";
import activeSvg from "../../assets/icons/active.svg";
import archivedSvg from "../../assets/icons/archived.svg";
import locationSvg from "../../assets/icons/location.svg";
import { CloseFilledIcon } from "../../assets/CloseFilledIcon";
import { PlusFilledIcon } from '../../assets/PlusFilledIcon';
import BsPaletteFill from "../../assets/icons/BsPaletteFill.svg";
import personSvg from "../../assets/person.svg";


export const ProgramStatusFilter = () => {
  const [status, setStatus] = useState('all');

  const handleStatusChange = (status) => {
    setStatus(status);
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
            color={status === "all" ? "purple.500" : "gray.300"}
            _hover={{ bg: "purple.100" }}
            onClick={() => setStatus("all")}
          >
            <Text mb="0">All</Text>
          </Button>
          <Button
            borderRadius="full"
            borderWidth="2px"
            color={status === "active" ? "purple.500" : "gray.300"}
            onClick={() => setStatus("active")}
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
            color={status === "past" ? "purple.500" : "gray.300"}
            onClick={() => setStatus("past")}
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

export const InvoiceStatusFilter = () => {
  const [status, setStatus] = useState('all');

  const handleStatusChange = (status) => {
    setStatus(status);
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
            color={status === "all" ? "purple.500" : "gray.300"}
            _hover={{ bg: "purple.100" }}
            onClick={() => setStatus("all")}
          >
            <Text mb="0">All</Text>
          </Button>
          <Button
            borderRadius="full"
            borderWidth="2px"
            color={status === "paid" ? "purple.500" : "gray.300"}
            _hover={{ bg: "purple.100" }}
            onClick={() => setStatus("paid")}
          >
            <Text>
              Paid
            </Text>
          </Button>
          <Button
            borderRadius="full"
            borderWidth="2px"
            color={status === "notpaid" ? "purple.500" : "gray.300"}
            _hover={{ bg: "purple.100" }}
            onClick={() => setStatus("notpaid")}
          >
            <Text>Not Paid</Text>
          </Button>
          <Button
            borderRadius="full"
            borderWidth="2px"
            color={status === "pastdue" ? "purple.500" : "gray.300"}
            _hover={{ bg: "purple.100" }}
            onClick={() => setStatus("pastdue")}
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

// Might be able to consolidate with payers, where a new parameter determines whether it is payer or lead artist filter
// Backend may have to be passed in as a parameter too?
export const LeadArtistFilter = ( {instructorSearchTerm, searchedInstructors, selectedInstructors, setSelectedInstructors, setSearchedInstructors, getInstructorResults, setInstructorSearchTerm} ) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);

  return (
    <VStack align="stretch" spacing={4}>
      <HStack spacing="6px">
        <Icon as={LeadArtistIcon} />
        <Text color="#718096"> Lead Artist(s) </Text>
      </HStack>
      <div id="instructorContainer">
        <div id="instructors">
          <div id="instructorSelection">
            <Box>
              <div id="instructorInputContainer">
                <Input
                    placeholder="Name"
                    onChange={(e) => {
                      getInstructorResults(e.target.value);
                      setInstructorSearchTerm(e.target.value);
                      setDropdownVisible(true);
                    }}
                    value={instructorSearchTerm}
                    id="instructorInput"/>
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
                          setSelectedInstructors((prevItems) => [...prevItems, instructor]);
                        }
                        setInstructorSearchTerm("");
                        setSearchedInstructors([]);
                        getInstructorResults(")")
                      }
                    }}
                    disabled={
                      instructorSearchTerm.trim() === "" ||
                      !searchedInstructors.some(instr => instr.name.toLowerCase() === instructorSearchTerm.toLowerCase())
                    }
                    cursor={
                      instructorSearchTerm.trim()==="" ||
                      !searchedInstructors.some(instr => instr.name.toLowerCase() === instructorSearchTerm.toLowerCase())
                      ? "not-allowed" : "pointer"
                    }
                  >
                    <PlusFilledIcon
                      color={
                        instructorSearchTerm.trim() !== "" &&
                          searchedInstructors.some(instr => instr.name.toLowerCase() === instructorSearchTerm.toLowerCase())
                          ? "#4441C8" : "#718096"
                      }
                    />
                  </Box>
                </div>

                {dropdownVisible && searchedInstructors.length > 0 && instructorSearchTerm.length > 0 && (
                  <Box id="instructorDropdown" w="100%" maxW="195px">
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
                            backgroundColor:"#FFF",
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
            <div id="instructorTags">
              {selectedInstructors.length > 0 ? (
                selectedInstructors.map((instructor, ind) => (
                  <div className="instructorTag" key={ind}>
                    <Tag value={instructor.id}>
                      {instructor.name}
                    </Tag>
                    <Icon
                        fontSize="lg"
                        color = "#718096"
                        _hover={{ color: "#4441C8" }}
                        cursor="pointer"
                        onClick={() => {
                            setSelectedInstructors(prevItems =>
                            prevItems.filter(item => item.id !== instructor.id));
                        }}
                    >
                        <CloseFilledIcon color="currentColor"/>
                    </Icon>
                  </div>
                ))
            ) : <div></div> }
        </div>
      </div>
    </VStack>
  );
};

export const PayerFilter = ( {payeeSearchTerm, searchedPayees, selectedPayees, getPayeeResults, setPayeeSearchTerm, setSelectedPayees, setSearchedPayees} ) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
      const handleClickOutside = (event) => {
          if (!event.target.closest("#payeeContainer")) {
              setDropdownVisible(false);
          }
      }

      document.addEventListener("click", handleClickOutside);
      return () => {
          document.removeEventListener("click", handleClickOutside);
      }
  }, []);

  return (
    <VStack align="stretch" spacing="4px">
      <HStack spacing="6px">
        <Icon as={PayerIcon}/>
        <Text color="#718096"> Payer(s) </Text>
      </HStack>
      {/* <Box as="img" src={personSvg} boxSize="20px" /> */}
      <div id="payeeContainer">
          <div id="payees">
              <div id="payeeSelection">
                  <Box>
                      <div id="payeeInputContainer">
                          <Input
                              placeholder="Name"
                              onChange={(e) => {
                              getPayeeResults(e.target.value);
                              setPayeeSearchTerm(e.target.value);
                              setDropdownVisible(true);
                              }}
                              value={payeeSearchTerm} id="payeeInput"/>
                          <Box
                              as="button"
                              onClick={() => {
                              if (payeeSearchTerm.trim() !== "") {
                                  // Find the instructor from the searched list
                                  const payee = searchedPayees.find(
                                  (p) => p.name.toLowerCase() === payeeSearchTerm.toLowerCase()
                                  );
                                  // If instructor exists and is not already selected, add it as a tag
                                  if (payee && !selectedPayees.some(p => p.id === payee.id)) {
                                  setSelectedPayees((prevItems) => [...prevItems, payee]);
                                  }
                                  setPayeeSearchTerm("");
                                  setSearchedPayees([]);
                                  getPayeeResults(")")
                              }
                              }}
                              disabled={
                              payeeSearchTerm.trim() === "" ||
                              !searchedPayees.some(p => p.name.toLowerCase() === payeeSearchTerm.toLowerCase())
                              }
                              cursor={
                              payeeSearchTerm.trim()==="" ||
                              !searchedPayees.some(p => p.name.toLowerCase() === payeeSearchTerm.toLowerCase())
                              ? "not-allowed" : "pointer"
                              }
                              _hover={{ color: payeeSearchTerm.trim() !== "" ? "#800080" : "inherit" }}
                          >
                              <PlusFilledIcon
                                  color={
                                      payeeSearchTerm.trim() !== "" &&
                                        searchedPayees.some(p => p.name.toLowerCase() === payeeSearchTerm.toLowerCase())
                                        ? "#4441C8" : "#718096"
                                  }
                              />
                          </Box>
                      </div>

                      {dropdownVisible && searchedPayees.length > 0 && payeeSearchTerm.length > 0 && (
                          <Box id="payeeDropdown" w="100%" maxW="195px">
                              {searchedPayees.map((payee) => (
                                  <Box
                                      key={payee.id}
                                      onClick={() => {
                                          setPayeeSearchTerm(payee.name); // Fill input field
                                          setDropdownVisible(false); // Hide dropdown after selecting
                                  }}
                                      style={{
                                          padding: "10px",
                                          fontSize: "16px",
                                          cursor: "pointer",
                                          transition: "0.2s",
                                          backgroundColor: "#FFF"
                                      }}
                                      bg="#F6F6F6"
                                      _hover={{ bg: "#D9D9D9" }}
                                  >
                                      {payee.name}
                                  </Box>
                              ))}
                          </Box>
                      )}
                  </Box>
              </div>
          </div>
              <div id="payeeTags">
                  {selectedPayees.length > 0 ? (
                      selectedPayees.map((payee, ind) => (
                      <div className="payeeTag" key={ind}>
                          <Tag value={payee.id}>
                              {payee.name}
                          </Tag>
                          <Icon
                              fontSize="lg"
                              color = "#718096"
                              _hover={{ color: "#4441C8" }}
                              cursor="pointer"
                              onClick={() => {
                                  setSelectedPayees(prevItems =>
                                  prevItems.filter(item => item.id !== payee.id));
                              }}
                          >
                              <CloseFilledIcon color="currentColor"/>
                          </Icon>
                      </div>
                  ))
              ) : <div></div> }
          </div>
      </div>
    </VStack>
  );
};

export const SeasonFilter = () => {
  const [season, setSeason] = useState('all');

  const handleStatusChange = (season) => {
    setSelected(season);
  };

  return (
    <FormControl>=
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
            color={season === "all" ? "purple.500" : "gray.300"}
            _hover={{ bg: "purple.100" }}
            onClick={() => setSeason("all")}
          >
            <Text mb="0">All</Text>
          </Button>
          <Button
            borderRadius="full"
            borderWidth="2px"
            color={season === "summer" ? "purple.500" : "gray.300"}
            _hover={{ bg: "purple.100" }}
            onClick={() => setSeason("summer")}
          >
            <Text>
              Summer
            </Text>
          </Button>
          <Button
            borderRadius="full"
            borderWidth="2px"
            color={season === "fall" ? "purple.500" : "gray.300"}
            _hover={{ bg: "purple.100" }}
            onClick={() => setSeason("fall")}
          >
            <Text>Fall</Text>
          </Button>
          <Button
            borderRadius="full"
            borderWidth="2px"
            color={season === "winter" ? "purple.500" : "gray.300"}
            _hover={{ bg: "purple.100" }}
            onClick={() => setSeason("winter")}
          >
            <Text>Winter</Text>
          </Button>
        </ButtonGroup>
      </HStack>
    </FormControl>
  );
};

export const EmailFilter = () => {
  const [emailStatus, setEmailStatus] = useState('all');

  const handleStatusChange = (email) => {
    setSelected(email);
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
            color={emailStatus === "all" ? "purple.500" : "gray.300"}
            _hover={{ bg: "purple.100" }}
            onClick={() => setEmailStatus("all")}
          >
            <Text mb="0">All</Text>
          </Button>
          <Button
            borderRadius="full"
            borderWidth="2px"
            color={emailStatus === "sent" ? "purple.500" : "gray.300"}
            _hover={{ bg: "purple.100" }}
            onClick={() => setEmailStatus("sent")}
          >
            <Text>
              Sent
            </Text>
          </Button>
          <Button
            borderRadius="full"
            borderWidth="2px"
            color={emailStatus === "notsent" ? "purple.500" : "gray.300"}
            _hover={{ bg: "purple.100" }}
            onClick={() => setEmailStatus("notsent")}
          >
            <Text>Not Sent</Text>
          </Button>
        </ButtonGroup>
      </HStack>
    </FormControl>
  );
};
