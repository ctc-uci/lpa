import { useEffect, useState } from "react";

import {
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
} from "@chakra-ui/react";

import {ClockFilledIcon} from '../../../assets/ClockFilledIcon';
import {CalendarIcon} from '../../../assets/CalendarIcon';


export const TimeFrequency = ({ load = false }) => {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");


  return (

    <div>
      {/* TODO: repeatability dropdown (brings up modal) */}

      {/* times */}
      <Flex>
          <ClockFilledIcon/>
          <Input id = "time1" placeholder="00:00 am" type='time' variant="outline" size="md" value={startTime} onChange={(event) => setStartTime(event.target.value)} backgroundColor="#F6F6F6" color="#767778"/>
          to
          <Input id = "time2" placeholder="00:00 pm" type='time' variant="outline" size="md" value={endTime} onChange={(event) => setEndTime(event.target.value)} backgroundColor="#F6F6F6" color="#767778"/>
      </Flex>

      {/* dates */}
      <Flex>
        <Icon boxSize={6} fontSize="lg"><CalendarIcon /></Icon>
        Starts on
        <Input id = "date1" placeholder="Day. MM/DD/YYYY" type='date' variant="outline" size="md" value={startDate} onChange={(e) => setStartDate(e.target.value)} backgroundColor="#F6F6F6" color="#767778"/>
        and ends on
        <Input id = "date2" placeholder="Day. MM/DD/YYYY" type='date' variant="outline" size="md" value={endDate} onChange={(e) => setEndDate(e.target.value)} backgroundColor="#F6F6F6" color="#767778"/>
      </Flex>
    </div>
  )
};
