import {
  Flex,
  Input,
  Text,
  Icon
} from "@chakra-ui/react";
import { ClockFilledIcon } from '../../../assets/ClockFilledIcon';

// Reusable TimeInput component
const TimeInput = ({ value, onChange }) => (
  <Input
    type="time"
    size="md"
    value={value}
    onChange={onChange}
    backgroundColor="#fff"
    color="#2D3748"
    borderColor="#E2E8F0"
    borderWidth={1.5}
    borderRadius="4px"
    w={125}
    textAlign="center"
  />
);

// Function to map day abbreviation to full day name
const getFullDayName = (day) => {
  const dayMapping = {
    Sun: "Sunday",
    Mon: "Monday",
    Tue: "Tuesday",
    Wed: "Wednesday",
    Thu: "Thursday",
    Fri: "Friday",
    Sat: "Saturday"
  };
  return dayMapping[day] || day;
};

export const TimeInputs = ({ selectedDays, setSelectedDays }) => {
  return (
    <Flex alignItems="center">
      <Icon fontSize={25} mr={2}>
        <ClockFilledIcon />
      </Icon>
      <Flex direction="column" justifyContent="center" gap={4}>
        {/* Time Inputs for Selected Days */}
        {Object.keys(selectedDays).length > 0 ? (
          Object.keys(selectedDays).map((day) => {
            const fullDayName = getFullDayName(day);
            return (
              <Flex key={day} alignItems="center" w="100%">
                {/* start time */}
                <TimeInput
                  value={selectedDays[day].start}
                  onChange={(event) =>
                    setSelectedDays({
                      ...selectedDays,
                      [day]: { ...selectedDays[day], start: event.target.value }
                    })
                  }
                />
                <Text mx={7} color="#2D3748">to</Text>
                {/* end time */}
                <TimeInput
                  value={selectedDays[day].end}
                  onChange={(event) =>
                    setSelectedDays({
                      ...selectedDays,
                      [day]: { ...selectedDays[day], end: event.target.value }
                    })
                  }
                />
                <Text ml={5} w={100}>on {fullDayName}</Text>
              </Flex>
            );
          })
        ) : (
          <Flex alignItems="center">
            <TimeInput
              value=""
              onChange={(event) => setStartTime(event.target.value)}
            />
            <Text mx={7} color="#2D3748">to</Text>
            <TimeInput
              value=""
              onChange={(event) => setEndTime(event.target.value)}
            />
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};
