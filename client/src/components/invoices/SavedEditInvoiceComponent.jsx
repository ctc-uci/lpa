import React, { useEffect, useState } from "react";

import {
  Box,
  Flex,
  Heading,
  Icon,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  VStack,
} from "@chakra-ui/react";

import { format } from "date-fns";

const SavedStatementComments = ({
  comments = [],
  booking = [],
  room = [],
  subtotal = 0.0,
  setSubtotal,
  sessions = [],
  summary = [],
}) => {
  // const [commentsState, setComments] = useState(comments);
  // const [bookingState, setBooking] = useState(booking);
  // const [roomState, setRoom] = useState(room);
  // const commentsWithBooking = comments.filter((comment) => comment.bookingId !== null)

  const [subtotalSum, setSubtotalSum] = useState(subtotal);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const handleSubtotalSum = (startTime, endTime, rate) => {
    if (!startTime || !endTime || !rate) return "0.00"; // Check if any required value is missing

    const timeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const startMinutes = timeToMinutes(startTime.substring(0, 5));
    const endMinutes = timeToMinutes(endTime.substring(0, 5));
    const diff = endMinutes - startMinutes;

    const totalHours = Math.ceil(diff / 60);

    const total = (totalHours * rate).toFixed(2);

    return total;
  };

  const formatTimeString = (timeStr) => {
    if (!timeStr) {
      return "N/A";
    }
    const timePart = timeStr.split("-")[0]?.substring(0, 5); // Added optional chaining
    if (!timePart) {
      return "N/A";
    }

    const [hours, minutes] = timePart.split(":").map(Number);
    const period = hours >= 12 ? "pm" : "am";
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  useEffect(() => {
    // Ensure all required values are available and this only runs once
    if (
      booking &&
      room &&
      booking.startTime &&
      booking.endTime &&
      room[0]?.rate &&
      !isDataLoaded
    ) {
      const total = handleSubtotalSum(
        booking.startTime,
        booking.endTime,
        room[0]?.rate
      );

      // Add subtotal for each comment (this logic is now inside useEffect)
      if (sessions && sessions.length > 0) {
        sessions.forEach(() => {
          setSubtotalSum((prevSubtotal) => prevSubtotal + parseFloat(total)); // Add to subtotalSum
        });
      }

      setSubtotal(subtotalSum);
      // Set flag to prevent future reruns of this effect
      setIsDataLoaded(true);
    }
  }, [booking, room, sessions, isDataLoaded]);

  return (
    <Flex
      direction="column"
      w="100%"
      minH="24"
      fontFamily="Inter"
      color="#2D3748"
    >
      <Heading
        size="md"
        mb="2"
      >
        Sessions
      </Heading>
      <Flex
        border="1px solid #D2D2D2"
        borderRadius="9.57px"
        minH="24"
        px="12px"
        width="100%"
      >
        <Box width="100%">
          <Table
            color="#EDF2F7"
            width="100%"
            textAlign="center"
            tableLayout="fixed"
            size="sm"
          >
            {/* header row */}
            <Thead>
              <Tr color="#4A5568">
                <Th
                  textTransform="none"
                  py="4"
                >
                  DATE
                </Th>
                <Th
                  textTransform="none"
                  py="4"
                >
                  CLASSROOM
                </Th>
                <Th
                  textTransform="none"
                  py="4"
                >
                  RENTAL HOURS
                </Th>
                <Th
                  textTransform="none"
                  py="4"
                >
                  ROOM FEE ADJUSTMENT
                </Th>
                <Th
                  textTransform="none"
                  py="4"
                >
                  ROOM FEE
                </Th>
                <Th
                  textTransform="none"
                  py="4"
                >
                  TOTAL
                </Th>
              </Tr>
            </Thead>

            <Tbody color="#2D3748">
              {sessions.length > 0 ? (
                sessions
                  .map((sessions, index) => [
                    <Tr key={`comment-${sessions.id || "unknown"}-${index}`}>
                      {/* date */}
                      <Td py="4">
                        {/* Doing Tue. instead of Tues. because its built in and format doesn't allow that kind of customization */}
                        {format(new Date(sessions.datetime), "EEE. M/d/yy")}
                      </Td>

                      {/* classroom */}
                      <Td py="4">
                        {room && room.length > 0 ? `${room[0].name}` : "N/A"}
                      </Td>

                      {/* rental hours */}
                      <Td py="4">
                        <Flex align="center">
                          <Text>{formatTimeString(booking.startTime)}</Text>
                          <Text>-</Text>
                          <Text>{formatTimeString(booking.endTime)}</Text>
                        </Flex>
                      </Td>

                      {/* room fee */}
                      <Td borderBottom="none">
                          {sessions.adjustmentValues.length === 0 ? (
                            "None"
                          ) : (
                            <Box display="inline-block"> {/* Wrap Text in a Box */}
                              <Tooltip
                                label={sessions.adjustmentValues.join(", ")}
                                placement="top"
                                bg="gray"
                                w="auto"
                              >
                                <Text
                                  textOverflow="ellipsis"
                                  whiteSpace="nowrap"
                                  overflow="hidden"
                                >
                                  {sessions.adjustmentValues.join(", ")}
                                </Text>
                              </Tooltip>
                            </Box>
                          )}
                        </Td>

                      {/* adjustment type */}
                      <Td py="4">
                        <Text
                          h="40px"
                          p="2"
                          display="flex"
                          alignItems="center"
                        >
                          {room && room.length > 0
                            ? `$${room[0].rate}/hr`
                            : "N/A"}
                        </Text>
                      </Td>

                      {/* total */}
                      <Td py="4">
                        <Flex
                          justifyContent="center"
                          alignItems="center"
                          gap={2}
                        >
                          <Text>$</Text>
                          <Text textAlign="center">
                            {booking &&
                            room &&
                            booking.startTime &&
                            booking.endTime &&
                            room[0]?.rate
                              ? handleSubtotalSum(
                                  booking.startTime,
                                  booking.endTime,
                                  room[0]?.rate
                                )
                              : "N/A"}
                          </Text>
                        </Flex>
                      </Td>
                    </Tr>,
                  ])
                  .flat()
              ) : (
                <Tr py="4">
                  <Td
                    colSpan={7}
                    textAlign="center"
                  >
                    No comments available.
                  </Td>
                </Tr>
              )}

              <Tr py="4">
                <Td
                  textAlign="right"
                  colSpan={5}
                  fontWeight="bold"
                >
                  Subtotal
                </Td>
                <Td
                  borderBottom="none"
                  py="8"
                  textAlign="center"
                >
                  {`$ ${subtotalSum.toFixed(2)}`}
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </Box>
      </Flex>
    </Flex>
  );
};

const SavedInvoiceSummary = ({
  comments = [],
  booking = [],
  room = [],
  subtotal = 0.0,
  setSubtotal,
  pastDue,
  summary = [],
}) => {
  //! THIS RECALCULATES EVERYTHING BUT PASSING IT BETWEEN COMPONENTS WASNT WORKING

  const [commentsState, setComments] = useState(comments);
  const [bookingState, setBooking] = useState(booking);
  const [roomState, setRoom] = useState(room);
  const [subtotalSum, setSubtotalSum] = useState(subtotal);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const handleSubtotalSum = (startTime, endTime, rate) => {
    if (!startTime || !endTime || !rate) return "0.00"; // Check if any required value is missing

    const timeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const startMinutes = timeToMinutes(startTime.substring(0, 5));
    const endMinutes = timeToMinutes(endTime.substring(0, 5));
    const diff = endMinutes - startMinutes;

    const totalHours = Math.ceil(diff / 60);

    const total = (totalHours * rate).toFixed(2);

    return total;
  };

  useEffect(() => {
    if (comments && comments.length > 0) {
      setComments(comments);
      setBooking(booking);
      setRoom(room);
    }
  }, [booking, comments, room]);

  useEffect(() => {
    // Ensure all required values are available and this only runs once
    if (
      bookingState &&
      room &&
      bookingState.startTime &&
      bookingState.endTime &&
      room[0]?.rate &&
      !isDataLoaded
    ) {
      const total = handleSubtotalSum(
        bookingState.startTime,
        bookingState.endTime,
        room[0]?.rate
      );

      // Add subtotal for each comment (this logic is now inside useEffect)
      if (commentsState && commentsState.length > 0) {
        commentsState.forEach(() => {
          setSubtotalSum((prevSubtotal) => prevSubtotal + parseFloat(total)); // Add to subtotalSum
        });
      }

      setSubtotal(subtotalSum);
      // Set flag to prevent future reruns of this effect
      setIsDataLoaded(true);
    }
  }, [bookingState, room, commentsState, isDataLoaded]);

  console.log("summary in summary", summary);

  return (
    <Flex
      direction="column"
      w="100%"
      minH="24"
      fontFamily="Inter"
      color="#2D3748"
      mt={8}
    >
      <Heading
        mb="2"
        size="md"
      >
        Summary
      </Heading>
      <Flex
        border="1px solid #D2D2D2"
        borderRadius="9.57px"
        minH="24"
        px="12px"
        width="100%"
      >
        <Box width="100%">
          <Table
            color="#EDF2F7"
            width="100%"
            textAlign="center"
            tableLayout="fixed"
            size="sm"
          >
            {/* header row */}
            <Thead color="#4A5568">
              <Tr>
                <Th
                  colSpan={4}
                  textTransform="none"
                  borderBottom="none"
                >
                  Description
                </Th>
                <Th
                  textTransform="none"
                  borderBottom="none"
                >
                  Adjustment Type(s)
                </Th>
                <Th
                  textTransform="none"
                  borderBottom="none"
                  textAlign="end"
                  pr={14}
                >
                  Total
                </Th>
              </Tr>
            </Thead>

            <Tbody color="#2D3748">
              {/* Room Fee Header Row */}
              <Tr p="40">
                <Td
                  borderBottom="none"
                  colSpan={4}
                >
                  Room Fee
                </Td>
              </Tr>
              {/* Room Fee Body Row */}

              {summary.map((row) => (
                <Tr>
                  <Td
                    borderBottom="none"
                    colSpan={4}
                    pl="16"
                  >
                    {room[0].name}
                  </Td>
                  <Td borderBottom="none">
                          {row.adjustmentValues.length === 0 ? (
                            "None"
                          ) : (
                            <Box display="inline-block"> {/* Wrap Text in a Box */}
                              <Tooltip
                                label={row.adjustmentValues.join(", ")}
                                placement="top"
                                bg="gray"
                                w="auto"
                              >
                                <Text
                                  textOverflow="ellipsis"
                                  whiteSpace="nowrap"
                                  overflow="hidden"
                                >
                                  {row.adjustmentValues.join(", ")}
                                </Text>
                              </Tooltip>
                            </Box>
                          )}
                        </Td>
                  <Td
                    borderBottom="none"
                    textAlign="end"
                    pr={14}
                  >
                    {room && room.length > 0
                            ? `$${room[0].rate}/hr`
                            : "N/A"}
                  </Td>
                </Tr>
              ))}
              {/* past due balance row */}
              <Tr>
                <Td
                  borderBottom="none"
                  colSpan={4}
                >
                  Past Due Balance
                </Td>
                <Td borderBottom="none"></Td>
                <Td
                  borderBottom="none"
                  textAlign="end"
                  pr={14}
                >
                  $ {pastDue.toFixed(2)}
                </Td>
              </Tr>

              {/* current statement balance row */}
              <Tr>
                <Td colSpan={4}>Current Statement Subtotal</Td>
                <Td>None</Td>
                <Td
                  textAlign="end"
                  pr={14}
                >
                  $ {subtotalSum.toFixed(2)}
                </Td>
              </Tr>

              {/* total row */}
              <Tr>
                <Td
                  textAlign="right"
                  colSpan={5}
                  fontWeight="700"
                >
                  Total Amount Due
                </Td>
                <Td
                  fontWeight="700"
                  borderBottom="none"
                  py="8"
                  textAlign="center"
                >
                  {`$ ${(pastDue + subtotalSum).toFixed(2)}`}
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </Box>
      </Flex>
    </Flex>
  );
};

export { SavedStatementComments, SavedInvoiceSummary };
