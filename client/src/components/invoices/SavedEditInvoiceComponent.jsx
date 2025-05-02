import React, { useEffect, useState } from "react";

import {
  Box,
  Flex,
  Heading,
  HStack,
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

import { CalendarIcon, DollarSignIcon, EditDocumentIcon } from "../../assets/EditInvoiceIcons";
import { LocationIcon } from "../../assets/EditInvoiceIcons";
import { ClockFilled } from "../../assets/ClockFilled";

const SavedStatementComments = ({
  comments = [],
  booking = [],
  room = [],
  subtotal = 0.0,
  setSubtotal,
  sessions = [],
  summary = [],
  compactView = false,
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
        size={compactView ? "11.7px" : "md"}
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
        <Box
          width="100%"
          overflowX="auto"
        >
          <Table
            color="#EDF2F7"
            width="100%"
            textAlign="center"
            size="sm"
          >
            {/* header row */}
            <Thead>
              <Tr maxW="50%">
                <Th
                  textTransform="none"
                  py={compactView ? 0 : 4}
                  fontSize={compactView && "6px"}
                  color="#718096"
                >
                  <HStack>
                    <CalendarIcon />
                    <Text>DATE</Text>
                  </HStack>
                </Th>
                <Th
                  textTransform="none"
                  py={compactView ? 0 : 4}
                  fontSize={compactView && "6"}
                  color="#718096"
                >
                  <HStack gap="1">
                    <LocationIcon />
                    <Text>CLASSROOM</Text>
                  </HStack>
                </Th>
                <Th
                  textTransform="none"
                  py={compactView ? 0 : 4}
                  fontSize={compactView && "6px"}
                  color="#718096"
                >
                  <HStack gap="1">
                    <ClockFilled />
                    <Text>RENTAL HOURS</Text>
                  </HStack>
                </Th>
                <Th
                  textTransform="none"
                  py={compactView ? 0 : 4}
                  fontSize={compactView && "6px"}
                  color="#718096"
                >
                  <HStack>
                    <EditDocumentIcon/>
                    <Text>

                      ROOM FEE ADJUSTMENT
                    </Text>
                  </HStack>
                </Th>
                <Th
                  textTransform="none"
                  py={compactView ? 0 : 4}
                  fontSize={compactView && "6px"}
                  color="#718096"
                >
                  
                  <HStack gap="1">
                    <DollarSignIcon />
                    <Text>ROOM FEE</Text>
                  </HStack>
                </Th>
                <Th
                  textTransform="none"
                  py={compactView ? 0 : 4}
                  fontSize={compactView && "6px"}
                  color="#718096"
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
                      <Td
                        py={compactView ? 0 : 4}
                        fontSize={compactView && "6.38px"}
                      >
                        {/* Doing Tue. instead of Tues. because its built in and format doesn't allow that kind of customization */}
                        {format(new Date(sessions.datetime), "EEE. M/d/yy")}
                      </Td>

                      {/* classroom */}
                      <Td
                        py={compactView ? 0 : 4}
                        fontSize={compactView && "6.38px"}
                      >
                        {room && room.length > 0 ? `${room[0].name}` : "N/A"}
                      </Td>

                      {/* rental hours */}
                      <Td
                        py={compactView ? 0 : 4}
                        fontSize={compactView && "6.38px"}
                      >
                        <Flex
                          align="center"
                          whiteSpace="nowrap"
                          overflow="hidden"
                          textOverflow="ellipsis"
                        >
                          <Text>{formatTimeString(booking.startTime)}</Text>
                          <Text>-</Text>
                          <Text>{formatTimeString(booking.endTime)}</Text>
                        </Flex>
                      </Td>

                      {/* room fee */}
                      <Td
                        fontSize={compactView && "6.38px"}
                        py={compactView ? 0 : 4}
                      >
                        {sessions.adjustmentValues.length === 0 ? (
                          "None"
                        ) : (
                          <Box display="inline-block">
                            {" "}
                            {/* Wrap Text in a Box */}
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
                      <Td
                        py={compactView ? 0 : 4}
                        fontSize={compactView && "6.38px"}
                      >
                        <Text
                          h="40px"
                          p={compactView ? "0" : "2"}
                          display="flex"
                          alignItems="center"
                        >
                          {room && room.length > 0
                            ? `$${room[0].rate}/hr`
                            : "N/A"}
                        </Text>
                      </Td>

                      {/* total */}
                      <Td
                        py={compactView ? 0 : 4}
                        fontSize={compactView && "6.38px"}
                      >
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
                    fontSize={compactView && "8.509px"}
                  >
                    No comments available.
                  </Td>
                </Tr>
              )}

              <Tr py={compactView ? 0 : 4}>
                <Td
                  textAlign="right"
                  colSpan={5}
                  fontWeight="bold"
                  fontSize={compactView && "6.38px"}
                >
                  Subtotal
                </Td>
                <Td
                  borderBottom="none"
                  py={compactView ? "0" : "8"}
                  textAlign="center"
                  fontSize={compactView && "6.38px"}
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
  compactView = false,
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
        size={compactView ? "11.7px" : "md"}
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
        <Box
          width="100%"
          overflowX="auto"
        >
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
                  fontSize={compactView && "6px"}
                >
                  <HStack color="#718096">
                    <DollarSignIcon />
                    <Text>
                      DESCRIPTION
                      </Text>
                  </HStack>
                </Th>
                <Th
                  textTransform="none"
                  borderBottom="none"
                  fontSize={compactView && "6px"}
                >
                  <HStack color="#718096">
                    <EditDocumentIcon />
                    <Text>
                    ROOM FEE ADJUSTMENT
                      </Text>
                  </HStack>
                </Th>
                <Th
                  textTransform="none"
                  borderBottom="none"
                  textAlign="end"
                  py={compactView ? 0 : 4}
                  fontSize={compactView && "6px"}
                  color="#718096"
                >
                  TOTAL
                </Th>
              </Tr>
            </Thead>

            <Tbody color="#2D3748">
              {/* Room Fee Header Row */}
              <Tr p="40">
                <Td
                  borderBottom="none"
                  colSpan={4}
                  fontSize={compactView && "6.38px"}
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
                    fontSize={compactView && "6.38px"}
                    py={compactView ? 0 : 4}
                  >
                    {room[0]?.name}
                  </Td>
                  <Td
                    borderBottom="none"
                    fontSize={compactView && "6.38px"}
                    py={compactView ? 0 : 4}
                  >
                    {row.adjustmentValues.length === 0 ? (
                      "None"
                    ) : (
                      <Box display="inline-block">
                        {" "}
                        {/* Wrap Text in a Box */}
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
                    py={compactView ? 0 : 4}
                    fontSize={compactView && "6.38px"}
                  >
                    {room && room.length > 0 ? `$${room[0].rate}/hr` : "N/A"}
                  </Td>
                </Tr>
              ))}
              {/* past due balance row */}
              <Tr>
                <Td
                  borderBottom="none"
                  colSpan={4}
                  fontSize={compactView && "6.38px"}
                >
                  Past Due Balance
                </Td>
                <Td borderBottom="none"></Td>
                <Td
                  borderBottom="none"
                  textAlign="end"
                  py={compactView ? 0 : 4}
                  fontSize={compactView && "6.38px"}
                >
                  $ {pastDue.toFixed(2)}
                </Td>
              </Tr>

              {/* current statement balance row */}
              <Tr>
                <Td
                  colSpan={4}
                  py={compactView ? 0 : 4}
                  fontSize={compactView && "6.38px"}
                >
                  Current Statement Subtotal
                </Td>
                <Td
                  py={compactView ? 0 : 4}
                  fontSize={compactView && "6.38px"}
                >
                  None
                </Td>
                <Td
                  textAlign="end"
                  py={compactView ? 0 : 4}
                  fontSize={compactView && "6.38px"}
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
                  fontSize={compactView && "6.38px"}
                  color="#718096"
                >
                  TOTAL AMOUNT DUE
                </Td>
                <Td
                  fontWeight="700"
                  borderBottom="none"
                  textAlign="end"
                  fontSize={compactView && "6.38px"}
                  py={compactView ? 0 : 8}
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
