import { useEffect, useState } from "react";
import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  Icon,
  IconButton,
  Input,
  Text
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

  return (
      <Box>
        {/* repeatiability dropdown */}


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
