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
  repeatType,
  setRepeatType,
  repeatInterval,
  setRepeatInterval,
  customRepeatType,
  setCustomRepeatType
}) => {

  const [isModalOpen, setIsModalOpen] = useState(false); // if the reoccurance modal is open
  const [isCustomRepeat, setIsCustomRepeat] = useState(false); // if N is selected
  const [tempSelectedDays, setTempSelectedDays] = useState({}); // temp store for what days are selected

  // opens the dropdown if custom is selected
  const handleDropdownChange = (event) => {
    setRepeatType(event.target.value);
    setIsModalOpen(true);
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


        {repeatType === "Custom" ? (
          <>
            <ModalHeader>Custom Reoccurrence</ModalHeader>
            <Flex p={5} mb={4} alignItems="center">
              <Text w={200}>Repeats every</Text>
              <Select
                w={200}
                value={repeatInterval}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "N") {
                    setIsCustomRepeat(true);
                  } else {
                    setIsCustomRepeat(false);
                    setRepeatInterval(Number(value));
                  }
                }}
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="N">N</option>
              </Select>

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

              <Select
                ml={2}
                w="50%"
                value={customRepeatType}
                onChange={(e) => setCustomRepeatType(e.target.value)}
              >
                <option value="Week">Week</option>
                <option value="Month">Month</option>
                <option value="Year">Year</option>
              </Select>
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
            <Flex mb={4}>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <Checkbox
                  key={day}
                  isChecked={day in tempSelectedDays}
                  onChange={() => handleCheckboxChange(day)}
                  mr={2}
                  borderRadius={2}
                  sx={{
                    "& .chakra-checkbox__control": {
                      _hover: { bg: "#E2E8F0"}
                    }
                  }}
                >
                  {day}
                </Checkbox>
              ))}
            </Flex>

            {/* time selection for each selected day */}
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


        <Flex alignItems="center">
        <Icon fontSize={25} mr={2}><ClockFilledIcon/></Icon>
        <Flex direction="column"  alignContent="center" gap={2}>
          {/* Time Inputs for Selected Days */}
          {Object.keys(selectedDays).length > 0 ? (
            Object.keys(selectedDays).map((day) => {
              const fullDayName = {
                Sun: "Sunday",
                Mon: "Monday",
                Tue: "Tuesday",
                Wed: "Wednesday",
                Thu: "Thursday",
                Fri: "Friday",
                Sat: "Saturday"
              }[day];

              return (
                <Flex key={day} alignItems="center" mb={4} w="100%">
                  {/* start time */}
                  <Input
                    type="time"
                    size="md"
                    value={selectedDays[day].start}
                    onChange={(event) => setSelectedDays({
                      ...selectedDays,
                      [day]: { ...selectedDays[day], start: event.target.value }
                    })}
                    backgroundColor="#fff"
                    color="#2D3748"
                    borderColor="#E2E8F0"
                    borderWidth={1.5}
                    borderRadius="4px"
                    w={125}
                    textAlign="center"
                  />
                  <Text mx={7} color="#2D3748">to</Text>
                  {/* end time */}
                  <Input
                    type="time"
                    size="md"
                    value={selectedDays[day].end}
                    onChange={(event) => setSelectedDays({
                      ...selectedDays,
                      [day]: { ...selectedDays[day], end: event.target.value }
                    })}
                    backgroundColor="#fff"
                    color="#2D3748"
                    borderColor="#E2E8F0"
                    borderWidth={1.5}
                    borderRadius="4px"
                    w={125}
                    textAlign="center"
                  />
                  <Text ml={5} w={100}>on {fullDayName}</Text>
                </Flex>
              );
            })
          ) : (
            <Flex alignItems="center" mb={4}>
              <Input
                placeholder="00:00 am"
                type="time"
                size="md"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                backgroundColor="#fff"
                color="#2D3748"
                borderColor="#E2E8F0"
                borderWidth={1.5}
                borderRadius="4px"
                w={125}
                textAlign="center"
              />
              <Text mx={7} color="#2D3748">to</Text>
              <Input
                type="time"
                size="md"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                backgroundColor="#fff"
                color="#2D3748"
                borderColor="#E2E8F0"
                borderWidth={1.5}
                borderRadius="4px"
                w={125}
                textAlign="center"
              />
            </Flex>
          )}
        </Flex>
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
