import React, { useEffect, useState } from "react";

import {
  Box,
  Flex,
  Heading,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react";

import { format } from "date-fns";

const SavedStatementComments = ({
  comments = [],
  booking = [],
  room = [],
  subtotal = 0.0,
}) => {
  const [commentsState, setComments] = useState(comments);
  const [bookingState, setBooking] = useState(booking);
  const [roomState, setRoom] = useState(room);

  useEffect(() => {
    if (comments && comments.length > 0) {
      setComments(comments);
      setBooking(booking);
      setRoom(room);
    }
  }, [comments]);

  return (
    <Flex
      direction="column"
      w="100%"
      minH="24"
      fontFamily="Inter"
      color="#2D3748"
    >
      <Heading fontSize="22px" mb="4">
        Sessions
      </Heading>
      <Flex
        border="1px solid #D2D2D2"
        borderRadius="18px"
        minH="24"
        px="12px"
      >
        <Box
        maxHeight="50vh"
        overflowY="auto">
        <Table
          color="#EDF2F7"
          style={{ width: "100%" }}
          textAlign="center"
        >
          <Thead>
            <Tr color="#4A5568">
              <Th textTransform="none" fontSize="14px">
                Date
              </Th>
              <Th textTransform="none" fontSize="14px">
                Classroom
              </Th>
              <Th textTransform="none" fontSize="14px">
                Rental Hours
              </Th>
              <Th textTransform="none" fontSize="14px">
                Room Fee
              </Th>
              <Th textTransform="none" fontSize="14px">
                Adjustment Type(s)
              </Th>
              <Th
                textTransform="none"
                textAlign="end"
                pr="40px"
                fontSize="14px"
              >
                Total
              </Th>
            </Tr>
          </Thead>
          <Tbody color="#2D3748">
            {comments.length > 0 ? (
              comments.map((comment, index) => [
                <Tr key={`comment-${comment.id || "unknown"}-${index}`}>
                  <Td fontSize="clamp(.5rem, 1rem, 1.5rem)" borderBottom='none'>
                    <Text width="100px" fontSize="14px">
                      {format(new Date(comment.datetime), "M/d/yy")}
                    </Text>
                  </Td>
                  <Td fontSize="clamp(.5rem, 1rem, 1.5rem)" borderBottom='none'>
                    <Text fontSize="14px">
                      {room && room.length > 0 ? `${room[0].name}` : "N/A"}
                    </Text>
                  </Td>
                  <Td fontSize="clamp(.5rem, 1rem, 1.5rem)" borderBottom='none'>
                    <Flex
                      align="center"
                      justifyContent="space-evenly"
                      gap="2"
                    >
                      <Text
                        w="85px"
                        px="2"
                        textAlign="center"
                        fontSize="14px"
                        borderRadius="md"
                        p="2"
                      >
                        {booking.startTime
                          ? (() => {
                              const startTime = booking.startTime
                                .split("-")[0]
                                .substring(0, 5);
                              const formatTime = (timeStr) => {
                                const [hours, minutes] = timeStr
                                  .split(":")
                                  .map(Number);
                                const period = hours >= 12 ? "pm" : "am";
                                const hour12 = hours % 12 || 12;
                                return `${hour12}:${minutes.toString().padStart(2, "0")}${period}`;
                              };

                              return `${formatTime(startTime)}`;
                            })()
                          : "N/A"}
                      </Text>
                      <Text fontSize="14px">to</Text>
                      <Text
                        w="85px"
                        px="2"
                        fontSize="14px"
                        textAlign="center"
                        borderRadius="md"
                        p="2"
                      >
                        {booking.startTime
                          ? (() => {
                              const endTime = booking.endTime
                                .split("-")[0]
                                .substring(0, 5);
                              const formatTime = (timeStr) => {
                                const [hours, minutes] = timeStr
                                  .split(":")
                                  .map(Number);
                                const period = hours >= 12 ? "pm" : "am";
                                const hour12 = hours % 12 || 12;
                                return `${hour12}:${minutes.toString().padStart(2, "0")}${period}`;
                              };

                              return `${formatTime(endTime)}`;
                            })()
                          : "N/A"}
                      </Text>
                    </Flex>
                  </Td>
                  <Td fontSize="clamp(.5rem, 1rem, 1.5rem)" borderBottom='none'>
                    <Flex align="center" gap="1">
                      <Text
                        w="95px"
                        fontSize="14px"
                        borderRadius="md"
                        p="2"
                      >
                        {room && room.length > 0 ? `$${room[0].rate}` : "N/A"}
                      </Text>
                      <Text fontSize="14px">/hr</Text>
                    </Flex>
                  </Td>
                  <Td fontSize="clamp(.5rem, 1rem, 1.5rem)" borderBottom='none'>
                    <Text
                      h="40px"
                      borderRadius="md"
                      p="2"
                      fontSize="14px"
                      display="flex"
                      alignItems="center"
                    >
                      {(commentsState[index] && commentsState[index].adjustmentType) || "Click to Select"}
                    </Text>
                  </Td>
                  <Td
                    fontSize="clamp(.5rem, 1rem, 1.5rem)" borderBottom='none'
                    textAlign="center"
                  >
                    <Flex
                      justifyContent="center"
                      alignItems="center"
                      gap="2"
                    >
                      <Text fontSize="14px">$</Text>
                      <Text
                        w="85px"
                        px="2"
                        textAlign="center"
                        fontSize="14px"
                        borderRadius="md"
                        p="2"
                      >
                        {booking.startTime && booking.endTime
                          ? (() => {
                              const timeToMinutes = (timeStr) => {
                                const [hours, minutes] = timeStr
                                  .split(":")
                                  .map(Number);
                                return hours * 60 + minutes;
                              };

                              const startMinutes = timeToMinutes(
                                booking.startTime.substring(0, 5)
                              );
                              const endMinutes = timeToMinutes(
                                booking.endTime.substring(0, 5)
                              );
                              const diff = endMinutes - startMinutes;

                              const totalHours = Math.ceil(diff / 60);

                              return (totalHours * room[0]?.rate).toFixed(2);
                            })()
                          : "N/A"}
                      </Text>
                    </Flex>
                  </Td>
                </Tr>,
                <Tr  className="comment-row">
                  <Td colSpan={6} textAlign="left"  py={2} >
                    <Text fontSize="14px" fontStyle="italic"  fontWeight="500">
                      {comment.comment || "No comment available"}
                    </Text>
                  </Td>
                </Tr>
              ]).flat()
            ) : (
              <Tr>
                <Td colSpan={7} textAlign="center">
                  No comments available.
                </Td>
              </Tr>
            )}

            <Tr>
              <Td
                py="8"
                textAlign="right"
                colSpan={5}
                fontSize="16px"
              >
                <Text fontWeight="bold">Subtotal</Text>
              </Td>
              <Td
                fontSize="clamp(.5rem, 1rem, 1.5rem)" borderBottom='none'
                py="8"
                textAlign="right"
              >
                <Text textAlign="center">{`$ ${subtotal.toFixed(2)}`}</Text>
              </Td>
            </Tr>
          </Tbody>
        </Table>
        </Box>
      </Flex>
    </Flex>
  );
};

const SavedInvoiceSummary = ({ pastDue, subtotal }) => {
  return (
    <Box mt={8} color="#2D3748">
      <VStack align="stretch" spacing={4}>
        <Text fontSize="xl" fontWeight="bold" mr={80}>
          Summary
        </Text>
        <Flex
          border="1px solid #D2D2D2"
          borderRadius="18px"
          minH="24"
        >
          <Table>
            <Thead color="#4A5568">
              <Tr>
                <Th fontSize="14px" textTransform="none">
                  Description
                </Th>
                <Th fontSize="14px" textTransform="none" pl="8">
                  Adjustment Type(s)
                </Th>
                <Th
                  fontSize="14px"
                  textTransform="none"
                  textAlign="end"
                  pr="14"
                >
                  Total
                </Th>
              </Tr>
            </Thead>
            <Tbody color="#2D3748">
              <Tr>
                <Td fontSize="14px" >Past Due Balance</Td>
                <Td >
                  <Text
                    borderRadius="md"
                    p="2"
                    fontSize="14px"
                  >
                    None
                  </Text>
                </Td>
                <Td >
                  <Flex alignItems="center" justifyContent="end">
                    <Text mr={1} fontSize="14px">$</Text>
                    <Text
                      textAlign="center"
                      p="2"
                      fontSize="14px"
                      borderRadius="md"
                      width={`${pastDue.toFixed(2).length + 3}ch`}
                    >
                      {pastDue.toFixed(2)}
                    </Text>
                  </Flex>
                </Td>
              </Tr>
              <Tr >
                <Td colSpan="1">
                  <Text fontWeight="bold" color="gray.700">
                    Waiting for remaining payments from November and December
                  </Text>
                </Td>
              </Tr>
              <Tr>
                <Td fontSize="14px">Current Statement Subtotal</Td>
                <Td>
                  <Text
                    borderRadius="md"
                    p="2"
                    fontSize="14px"
                  >
                    None
                  </Text>
                </Td>
                <Td>
                  <Flex alignItems="center" justifyContent="end">
                    <Text mr={1} fontSize="14px">$</Text>
                    <Text
                      textAlign="center"
                      p="2"
                      fontSize="14px"
                      borderRadius="md"
                      width={`${subtotal.toFixed(2).length + 3}ch`}
                    >
                      {subtotal.toFixed(2)}
                    </Text>
                  </Flex>
                </Td>
              </Tr>
              <Tr>
                <Td textAlign="end" colSpan="2" fontSize="16px" fontWeight="700">Total Amount Due</Td>
                <Td>
                  <Flex alignItems="center" justifyContent="end">
                    <Text mr={1} fontSize="14px">$</Text>
                    <Text
                      textAlign="center"
                      fontWeight="700"
                      p="2"
                      color="#474849"
                      fontSize="24px"
                      borderRadius="md"
                      width={`${(subtotal + pastDue).toFixed(2).length + 3}ch`}
                    >
                      {(subtotal + pastDue).toFixed(2)}
                    </Text>
                  </Flex>
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </Flex>
      </VStack>
    </Box>
  );
};

export {
  SavedStatementComments,
  SavedInvoiceSummary
};