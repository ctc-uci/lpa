import {
  Flex,
  Input,
  Text,
  Icon } from "@chakra-ui/react";
import { CalendarIcon } from '../../../assets/CalendarIcon';

export const DateInputs = ( { startDate, setStartDate, endDate, setEndDate } ) => {
  return (
    <Flex alignItems="center">
      <Icon fontSize={25} mr={2}><CalendarIcon/></Icon>
      <Text mr={5} color="#2D3748">Starts on</Text>
      <Input
        type="date"
        size="md"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        backgroundColor="#fff"
        color={!startDate ? "#E2E8F0" : "#2D3748"}
        borderColor="#E2E8F0"
        borderWidth="1px"
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
        color={!endDate ? "#E2E8F0" : "#2D3748"}
        borderColor="#E2E8F0"
        borderWidth="1px"
        borderRadius="4px"
        w={150}
        textAlign="center"
      />
    </Flex>
  );
};
