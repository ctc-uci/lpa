import {
  Flex,
  Input,
  Text,
  Icon
} from "@chakra-ui/react";
import { ClockFilledIcon } from '../../../assets/ClockFilledIcon';

const TimeInput = ({ value, onChange }) => (
  <Input
    type="time"
    size="md"
    onChange={onChange}
    backgroundColor="#fff"
    color={!value ? "#E2E8F0" : "#2D3748"}
    borderColor={"#E2E8F0"}
    borderWidth="1px"
    borderRadius="4px"
    width="7rem"
    textAlign="center"
    value={value}
  />
);



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

export const TimeInputs = ({ selectedDays, setSelectedDays, startTime, endTime, setStartTime, setEndTime }) => {
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
                <TimeInput
                  value={selectedDays[day].end}
                  onChange={(event) =>
                    setSelectedDays({
                      ...selectedDays,
                      [day]: { ...selectedDays[day], end: event.target.value }
                    })
                  }
                />
                <Text ml={7} mr={7}>on</Text>
                <Text> {fullDayName} </Text>
              </Flex>
            );
          })
        ) : (
          <Flex alignItems="center">
            <TimeInput
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
            />
            <Text mx={3} color="#2D3748">to</Text>
            <TimeInput
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
            />
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};
