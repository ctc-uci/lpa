import { useState } from "react";
import {
  Box,
  Flex,

  Icon,
  Input,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Checkbox,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  VStack,
} from "@chakra-ui/react";


import { RepeatIcon } from '../../../assets/RepeatIcon';
import {ArrowDropdown} from '../../../assets/ArrowDropdown';

export const ReoccuranceDropdown = ({
  setSelectedDays,
  repeatType,
  setRepeatType,
  repeatInterval,
  setRepeatInterval,
  customRepeatType,
  setCustomRepeatType,
  newProgram = false
}) => {

  const [hasEdits, setHasEdits] = useState(false); // whether or not edits have been made
  const [isModalOpen, setIsModalOpen] = useState(false); // if the reoccurance modal is open
  const [isCustomRepeat, setIsCustomRepeat] = useState(false); // if N is selected
  const [tempSelectedDays, setTempSelectedDays] = useState({}); // temp store for what days are selected

  const dayFullNames = {
    Sun: "Sunday",
    Mon: "Monday",
    Tue: "Tuesday",
    Wed: "Wednesday",
    Thu: "Thursday",
    Fri: "Friday",
    Sat: "Saturday"
  };
  const dayOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // opens the dropdown if custom is selected
  const handleDropdownChange = (event) => {
    setRepeatType(event.target.value);
    if (repeatType !== "Does not repeat") {
      setIsModalOpen(true);
    }
  };

  // handles which time rows are displayed
  const handleCheckboxChange = (day) => {
    setTempSelectedDays((prev) => {
      const updatedDays = { ...prev };
      if (updatedDays[day]) {
        delete updatedDays[day];
      } else {
        updatedDays[day] = { start: "00:00", end: "00:00" };
      }
      return updatedDays;
    });
  };


  const handleTimeChange = (day, field, value) => {
    setTempSelectedDays((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const saveCustomRecurrence = () => {
    setSelectedDays(tempSelectedDays);
    setIsModalOpen(false);
  };


  return (
      <Box>
        {/* repeatability dropdown */}

        <Flex alignItems="center">
          <Icon fontSize={20} mr={3}><RepeatIcon/></Icon>
          <Popover placement="bottom-start" matchWidth>
            <PopoverTrigger>
              <Box
                width="250px"
                height="40px"
                backgroundColor="white"
                border="1px solid #E2E8F0"
                borderRadius="4px"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                padding="10px"
                fontFamily="Inter"
                fontSize="16px"
                color="#2D3748"
                _hover={{ backgroundColor: "#EDF2F7" }}
                cursor="pointer"
              >
                {newProgram && hasEdits ? repeatType : newProgram ? "Does not repeat" : (!newProgram && hasEdits) ? repeatType : "Reset all bookings"}
                <ArrowDropdown />
              </Box>
            </PopoverTrigger>
            <PopoverContent width="250px" boxShadow="none" outline="none" background="white">
              <PopoverBody>
                <VStack align="start" spacing={2}>
                  {["Does not repeat", "Every week", "Every month", "Every year", "Custom"].map((option) => (
                    <Box
                      key={option}
                      width="100%"
                      fontSize="14px"
                      borderRadius="4px"
                      cursor="pointer"
                      backgroundColor={repeatType === option ? "#EDF2F7" : "white"}
                      _hover={{ backgroundColor: "#EDF2F7" }}
                      onClick={() => {
                        handleDropdownChange({ target: { value: option } });
                        setHasEdits(true);
                      }}
                    >
                      <Text margin="10px">{option}</Text>
                    </Box>
                  ))}
                </VStack>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </Flex>

        {/* Custom Reoccurrence Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
        {repeatType === "Custom" ? (
          <>
            <ModalHeader>Custom Reoccurrence</ModalHeader>
            <Flex p={5} mb={4} alignItems="center">
              <Text w={200}>Repeats every</Text>
              <Popover placement="bottom-start" matchWidth>
                <PopoverTrigger>
                  <Box
                    width="35%"
                    height="40px"
                    backgroundColor="white"
                    border="1px solid #E2E8F0"
                    borderRadius="4px"
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    padding="10px"
                    fontFamily="Inter"
                    fontSize="16px"
                    color="#2D3748"
                    _hover={{ backgroundColor: "#EDF2F7" }}
                    cursor="pointer"
                  >
                    {repeatInterval === "N" ? "Custom" : repeatInterval}
                    <ArrowDropdown />
                  </Box>
                </PopoverTrigger>
                <PopoverContent boxShadow="none" outline="none" background="white" width="100%">
                  <PopoverBody>
                    <VStack align="start" spacing={2}>
                      {["1", "2", "N"].map((option) => (
                        <Box
                          key={option}
                          width="100%"
                          fontSize="16px"
                          borderRadius="4px"
                          cursor="pointer"
                          backgroundColor={repeatInterval === option ? "#EDF2F7" : "white"}
                          _hover={{ backgroundColor: "#EDF2F7" }}
                          onClick={() => {
                            if (option === "N") {
                              setIsCustomRepeat(true);
                            } else {
                              setIsCustomRepeat(false);
                              setRepeatInterval(Number(option));
                            }
                          }}
                        >
                          <Text margin="10px">{option === "N" ? "Custom" : option}</Text>
                        </Box>
                      ))}
                    </VStack>
                  </PopoverBody>
                </PopoverContent>
              </Popover>

              {isCustomRepeat && (
                <Input
                  ml={2}
                  w={200}
                  type="number"
                  min="1"
                  value={repeatInterval}
                  onChange={(e) => setRepeatInterval(Number(e.target.value))}
                  placeholder="Enter a number"
                />
              )}

              <Popover placement="bottom-start" matchWidth>
                <PopoverTrigger>
                  <Box
                    ml={2}
                    width="50%"
                    height="40px"
                    backgroundColor="white"
                    border="1px solid #E2E8F0"
                    borderRadius="4px"
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    padding="10px"
                    fontFamily="Inter"
                    fontSize="16px"
                    color="#2D3748"
                    _hover={{ backgroundColor: "#EDF2F7" }}
                    cursor="pointer"
                  >
                    {customRepeatType}
                    <ArrowDropdown />
                  </Box>
                </PopoverTrigger>
                <PopoverContent width="100%" boxShadow="none" outline="none" background="white">
                  <PopoverBody>
                    <VStack align="start" spacing={2}>
                      {["Week", "Month", "Year"].map((option) => (
                        <Box
                          key={option}
                          width="100%"
                          fontSize="16px"
                          borderRadius="4px"
                          cursor="pointer"
                          backgroundColor={customRepeatType === option ? "#EDF2F7" : "white"}
                          _hover={{ backgroundColor: "#EDF2F7" }}
                          onClick={() => setCustomRepeatType(option)}
                        >
                          <Text margin="10px">{option}</Text>
                        </Box>
                      ))}
                    </VStack>
                  </PopoverBody>
                </PopoverContent>
              </Popover>

            </Flex>
          </>
        ) : (
          <>
            <ModalHeader>Custom Reoccurrence</ModalHeader>
            <Flex p={5} mb={4} alignItems="center">
              <Text w={200}>
                Repeats every 1{" "}
                {repeatType
                  ? repeatType.split(" ")[1].charAt(0).toUpperCase() +
                    repeatType.split(" ")[1].slice(1)
                  : "Week"}
              </Text>
            </Flex>
          </>
        )
      }
          <ModalBody>
            <Flex mb={4} gap={4} w="100%" justifyContent="center" pb={5}>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <VStack >
                <Text fontSize="16px">{day}</Text>
                  <Checkbox
                    key={day}
                    isChecked={day in tempSelectedDays}
                    onChange={() => handleCheckboxChange(day)}
                    borderRadius={2}
                    _checked={{"& .chakra-checkbox__control": { background: "#4441C8" , borderWidth: 0}}}
                    _hover={{"& .chakra-checkbox__control": { background: "#E2E8F0" }}}
                  >
                  </Checkbox>
                </VStack>
              ))}
            </Flex>

            {/* Time selection for each selected day */}
            {Object.keys(tempSelectedDays)
              .sort((a, b) => dayOrder.indexOf(dayFullNames[a]) - dayOrder.indexOf(dayFullNames[b])) // Sort by predefined order
              .map((day) => (
                <Flex key={day} mb={7} alignItems="center" w="100%">
                  <Text width={150}>{dayFullNames[day]}</Text>
                  <Input
                    type="time"
                    value={tempSelectedDays[day].start}
                    onChange={(e) => handleTimeChange(day, "start", e.target.value)}
                    w="30%"
                  />
                  <Text mx={2}>-</Text>
                  <Input
                    type="time"
                    value={tempSelectedDays[day].end}
                    onChange={(e) => handleTimeChange(day, "end", e.target.value)}
                    w="30%"
                  />
                </Flex>
              ))}

          </ModalBody>
          <ModalFooter>
            <Button backgroundColor="#EDF2F7" mr={3} onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button id="save" onClick={saveCustomRecurrence}>
              Done
            </Button>
          </ModalFooter>
        </ModalContent>
        </Modal>


      </Box>
    );
};
