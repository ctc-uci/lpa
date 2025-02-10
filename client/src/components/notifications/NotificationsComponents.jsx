import React from 'react';
import {
  Box,
  Flex,
  Text
} from '@chakra-ui/react';
import { format } from "date-fns";
import { MdEmail } from 'react-icons/md';


const NotificationsComponents = ({ notifications }) => {
  return (
    <Box border="1px solid" borderColor="gray.200" borderRadius="md">
        {notifications.map((item, index) => (
          <Flex key={index} p={4} align="center" justify="space-between">
            <Flex align="center">
              <Box borderLeft="4px solid" borderColor="#90080F" h="40px" mr={3}></Box>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="full"
                border="1px solid"
                borderColor="gray.300"
                boxSize="40px"
                mr={3}
              >
                <MdEmail size={20} color="#474849" />
              </Box>
              <Box>
                <Text fontWeight="bold" color="#474849">{item.eventName} is {item.payStatus} </Text>
                <Text fontSize="sm" color="#767778">
                  {item.eventName} | Due: {format(new Date(item.endDate), "MMM d")} | Total: ${item.total} | Paid: ${item.paid}
                </Text>
              </Box>
            </Flex>
            <Text fontSize="sm" color="#767778">{item.dueTime}</Text>
          </Flex>
        ))}
      </Box>
  );
};

export default NotificationsComponents;