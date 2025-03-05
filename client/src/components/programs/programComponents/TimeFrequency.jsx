import { useEffect, useState } from "react";
import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  Icon,
  IconButton,
  Input,
  Text,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Checkbox,
  Button
} from "@chakra-ui/react";

import { ClockFilledIcon } from '../../../assets/ClockFilledIcon';
import { CalendarIcon } from '../../../assets/CalendarIcon';
import { RepeatIcon } from '../../../assets/RepeatIcon';

export const TimeFrequency = ({
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  selectedDays,
  setSelectedDays,
}) => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCustomRepeat, setIsCustomRepeat] = useState(false);
  const [tempSelectedDays, setTempSelectedDays] = useState({});
  const [repeatType, setRepeatType] = useState("Does not repeat");
  const [repeatInterval, setRepeatInterval] = useState(1);

  // opens the dropdown if custom is selected
  const handleDropdownChange = (event) => {
    const value = event.target.value;
    setRepeatType(value);
    if (value === "Custom") {
      setIsModalOpen(true);
    }
  };

  // // handles the frequency of the event
  // const handleRepeatChange = (event) => {
  //   const value = event.target.value;
  //   setRepeatInterval(value);
  // };

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
        <Flex alignItems="center" mb={4}>
          <Icon fontSize={20} mr={3}><RepeatIcon/></Icon>
          <Select size="md" w={250} value={repeatType} onChange={handleDropdownChange}>
            <option>Does not repeat</option>
            <option>Every week</option>
            <option>Every month</option>
            <option>Every year</option>
            <option>Custom</option>
          </Select>
        </Flex>



        {/* Custom Reoccurrence Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Custom Reoccurrence</ModalHeader>
          <ModalBody>
          <Text mb={2}>Repeats every:</Text>
          <Flex mb={4} alignItems="center">
            <Select
              value={repeatInterval}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "N") {
                  // setRepeatInterval("N");
                  setIsCustomRepeat(true);
                } else {
                  setRepeatInterval(value);
                  setIsCustomRepeat(false);
                }
              }}
              w="30%"
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="N">N</option>
            </Select>

            {isCustomRepeat && (
              <Input
                type="number"
                min="1"
                value={repeatInterval}
                onChange={(e) => setRepeatInterval(e.target.value)}
                w="30%"
                ml={2}
                placeholder="Enter a number"
              />
            )}

            <Select ml={2} w="50%">
              <option>Week</option>
              <option>Month</option>
              <option>Year</option>
            </Select>
          </Flex>


            <Text mb={2}>Select days:</Text>
            <Flex mb={4}>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <Checkbox
                  key={day}
                  isChecked={day in tempSelectedDays}
                  onChange={() => handleCheckboxChange(day)}
                  mr={2}
                >
                  {day}
                </Checkbox>
              ))}
            </Flex>

            {/* Time selection for each selected day */}
            {Object.keys(tempSelectedDays).map((day) => (
              <Flex key={day} mb={3} alignItems="center">
                <Text w="20%">{day}</Text>
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

        {/* Time Inputs */}
        <Flex alignItems="center" mb={4}>
          <Icon fontSize={25} mr={2}><ClockFilledIcon/></Icon>
          <Input
            placeholder="00:00 am"
            type="time"
            size="md"
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
            backgroundColor="#fff"
            color="#2D3748"
            _placeholder={{
              color: "#E2E8F0",
            }}
            borderColor="#E2E8F0"
            borderWidth={1.5}
            borderRadius="4px"
            w={125}
            textAlign="center"
          />
          <Text mr={5} ml={5} color="#2D3748">to</Text>
          <Input
            type="time"
            size="md"
            value={endTime}
            onChange={(event) => setEndTime(event.target.value)}
            backgroundColor="#fff"
            color="#2D3748"
            _placeholder={{
              color: "#E2E8F0",
            }}
            borderColor="#E2E8F0"
            borderWidth={1.5}
            borderRadius="4px"
            w={125}
            textAlign="center"
          />
        </Flex>


        {/* Date Inputs */}
        <Flex alignItems="center">
          <Icon fontSize={25} mr={2}><CalendarIcon/></Icon>
          <Text mr={5}color="#2D3748">Starts on</Text>
          <Input
            type="date"
            size="md"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            backgroundColor="#fff"
            color="#2D3748"
            _placeholder={{
              color: "#E2E8F0",
            }}
            borderColor="#E2E8F0"
            borderWidth={1.5}
            borderRadius="4px"
            w={150}
            textAlign="center"
          />

          <Text mr={5} ml={5} color="#2D3748">and ends on</Text>

          <Input
            type="date"
            size="md"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            backgroundColor="#fff"
            color="#2D3748"
            _placeholder={{
              color: "#E2E8F0",
            }}
            borderColor="#E2E8F0"
            borderWidth={1.5}
            borderRadius="4px"
            w={150}
            textAlign="center"
          />
        </Flex>
      </Box>
    );
};
