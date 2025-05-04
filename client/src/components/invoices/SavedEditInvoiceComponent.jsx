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

import { ClockFilled } from "../../assets/ClockFilled";
import {
  BookWithBookmarkIcon,
  CalendarIcon,
  ClockIcon,
  DollarSignIcon,
  EditDocumentIcon,
  LocationIcon,
} from "../../assets/EditInvoiceIcons";

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
      <HStack align="baseline">
        <BookWithBookmarkIcon />
        <Heading
          size={compactView ? "1.2em" : "md"}
          mb="2"
          
        >
          Sessions
        </Heading>
      </HStack>
      <Flex
        border="1px solid #D2D2D2"
        borderRadius="9.57px"
        minH="24"
        px="12px"
        width="100%"
      >
        <Box
          // width="100%"
          // overflowX="auto"
          // p="4"
          position="relative"
          overflowY="auto"
        >
          <Table
            color="#EDF2F7"
            textAlign="center"
            variant="simple"
            size="sm"
          >
            {/* header row */}
            <Thead>
              {/* <Tr>
                <Th
                  textTransform="none"
                  py={compactView ? 0 : 4}
                  fontSize={compactView && "6px"}
                  color="#718096"
                >
                  <HStack>
                    <CalendarIcon width={compactView && "8"}/>
                    <Text fontSize={compactView ? "6" : "sm"}>DATE</Text>
                  </HStack>
                </Th>
                <Th
                  textTransform="none"
                  py={compactView ? 0 : 4}
                  fontSize={compactView ? "6" : "sm"}
                  color="#718096"
                >
                  <Flex align="center">
                    <LocationIcon width={compactView ? "8" : "12"} height={compactView && "10"}/>
                    <Text ml={compactView ? "1" : "4"}>CLASSROOM</Text>
                  </Flex>
                </Th>
                <Th
                  textTransform="none"
                  py={compactView ? 0 : 4}
                  fontSize={compactView ? "6" : "sm"}
                  color="#718096"
                >
                  <HStack>
                    <ClockIcon width={compactView ? "8" : "14"} height={compactView && "10"}/>
                    <Text whiteSpace="nowrap">RENTAL HOURS</Text>
                  </HStack>
                </Th>
                <Th
                  textTransform="none"
                  py={compactView ? 0 : 4}
                  fontSize={compactView ? "6" : "sm"}
                  color="#718096"
                >
                  <HStack>
                    <EditDocumentIcon width={compactView ? "8" : "10"} height={compactView && "10"}/>
                    <Text whiteSpace="nowrap" fontSize={compactView ? "6" : "sm"}>

                      ROOM FEE ADJUSTMENT
                    </Text>
                  </HStack>
                </Th>
                <Th
                  textTransform="none"
                  py={compactView ? 0 : 4}
                  fontSize={compactView ? "6" : "sm"}
                  color="#718096"
                >
                  
                  <HStack gap="1">
                    <DollarSignIcon width={compactView && "8"} height={compactView && "10"} />
                    <Text whiteSpace="nowrap" fontSize={compactView ? "6" : "sm"}>ROOM FEE</Text>
                  </HStack>
                </Th>
                <Th
                  textTransform="none"
                  py={compactView ? 0 : 4}
                  fontSize={compactView ? "6" : "sm"}
                  color="#718096"
                >
                  TOTAL
                </Th>
              </Tr> */}
              <Tr color="#4A5568">
                <Th
                  fontSize={compactView ? "6" : "12px"}
                  maxWidth="80px"
                  py={compactView ? "4" : "8"}
                >
                  <Flex align="center">
                    <CalendarIcon width={compactView && "8"} />
                    <Text
                      marginLeft="4px"
                      fontSize={compactView ? "6" : "sm"}
                      color="#718096"
                    >
                      Date
                    </Text>
                  </Flex>
                </Th>
                <Th fontSize={compactView ? "6" : "12px"}>
                  <Flex align="center">
                    <LocationIcon
                      width={compactView ? "8" : "12"}
                      height={compactView && "10"}
                    />
                    <Text
                      marginLeft="4px"
                      color="#718096"
                    >
                      Classroom
                    </Text>
                  </Flex>
                </Th>
                <Th fontSize={compactView ? "6" : "12px"}>
                  <Flex align="center">
                    <ClockIcon
                      width={compactView ? "8" : "24"}
                      height={compactView ? "10" : "16"}
                    />
                    <Text
                      marginLeft="4px"
                      color="#718096"
                      whiteSpace="nowrap"
                    >
                      Rental Hours
                    </Text>
                  </Flex>
                </Th>
                <Th
                  fontSize={compactView ? "6" : "12px"}
                  whiteSpace="nowrap"
                >
                  <Flex align="center">
                    <EditDocumentIcon
                      width={compactView ? "8" : "16"}
                      height={compactView && "10"}
                    />
                    <Text
                      marginLeft="4px"
                      color="#718096"
                    >
                      Room Fee Adjustment
                    </Text>
                  </Flex>
                </Th>
                <Th
                  fontSize={compactView ? "6" : "12px"}
                  whiteSpace="nowrap"
                  maxWidth="120px"
                >
                  <Flex align="center">
                    <DollarSignIcon
                      width={compactView ? "12" : "20"}
                      height={compactView ? "12" : "20"}
                    />
                    <Text
                      marginLeft="4px"
                      color="#718096"
                    >
                      Room Fee
                    </Text>
                  </Flex>
                </Th>
                <Th
                  textAlign="end"
                  fontSize={compactView ? "6" : "12px"}
                  color="#718096"
                >
                  Total
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
                        fontSize={compactView ? "6.38" : "sm"}
                        whiteSpace="nowrap"
                      >
                        {/* Doing Tue. instead of Tues. because its built in and format doesn't allow that kind of customization */}
                        {format(new Date(sessions.datetime), "EEE. M/d/yy")}
                      </Td>

                      {/* classroom */}
                      <Td
                        py={compactView ? 0 : 4}
                        fontSize={compactView ? "6.38" : "sm"}
                      >
                        {room && room.length > 0 ? `${room[0].name}` : "N/A"}
                      </Td>

                      {/* rental hours */}
                      <Td
                        py={compactView ? 0 : 4}
                        fontSize={compactView ? "6.38" : "sm"}
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
                        fontSize={compactView ? "6.38" : "sm"}
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
                              // textOverflow="ellipsis"
                              // whiteSpace="nowrap"
                              // overflow="hidden"
                              >
                                {sessions.adjustmentValues
                                  .slice(0, 3)
                                  .join(", ")}
                                {sessions.adjustmentValues.length > 3
                                  ? ", ..."
                                  : ""}
                              </Text>
                            </Tooltip>
                          </Box>
                        )}
                      </Td>

                      {/* adjustment type */}
                      <Td
                        py={compactView ? 0 : 4}
                        fontSize={compactView ? "6.38" : "sm"}
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
                        fontSize={compactView ? "6.38" : "sm"}
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
                  fontSize={compactView ? "6.38" : "sm"}
                >
                  Subtotal
                </Td>
                <Td
                  borderBottom="none"
                  py={compactView ? "0" : "8"}
                  textAlign="center"
                  fontSize={compactView ? "6.38" : "sm"}
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
      <HStack align="baseline">
        <BookWithBookmarkIcon />
        <Heading
          mb="2"
          size={compactView ? "11.7px" : "md"}
          >
          Summary
        </Heading>
      </HStack>
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
                  fontSize={compactView && "6px"}
                  py={compactView ? "4" : "8"}
                >
                  <Flex
                    color="#718096"
                    align="center"
                  >
                    <DollarSignIcon
                      width={compactView ? "12" : "20"}
                      height={compactView ? "12" : "20"}
                    />
                    <Text fontSize={compactView ? "6" : "sm"}>DESCRIPTION</Text>
                  </Flex>
                </Th>
                <Th
                  textTransform="none"
                  fontSize={compactView && "6px"}
                >
                  <Flex
                    color="#718096"
                    align="center"
                  >
                    <EditDocumentIcon
                      width={compactView ? "8" : "16"}
                      height={compactView && "10"}
                    />
                    <Text
                      fontSize={compactView ? "6" : "sm"}
                      ml="4px"
                    >
                      ROOM FEE ADJUSTMENT
                    </Text>
                  </Flex>
                </Th>
                <Th
                  textTransform="none"
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
                  py={compactView ? "2" : "8"}
                >
                  Room Fee
                </Td>
              </Tr>
              {/* Room Fee Body Row */}

              {summary.map((row) => (
                <Tr>
                  <Td
                    colSpan={4}
                    pl="16"
                    fontSize={compactView && "6.38px"}
                    py={compactView ? 2 : 4}
                  >
                    {room[0]?.name}
                  </Td>
                  <Td
                    fontSize={compactView && "6.38px"}
                    py={compactView ? 2 : 4}
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
                            // whiteSpace="nowrap"
                            overflow="hidden"
                          >
                            {row.adjustmentValues.join(", ")}
                          </Text>
                        </Tooltip>
                      </Box>
                    )}
                  </Td>
                  <Td
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
                  colSpan={4}
                  fontSize={compactView && "6.38px"}
                  py={compactView ? "2" : "8"}
                >
                  Past Due Balance
                </Td>
                <Td></Td>
                <Td
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
                  fontSize={compactView ? "6.38px" : "sm"}
                  color="#718096"
                >
                  TOTAL AMOUNT DUE
                </Td>
                <Td
                  fontWeight="700"
                  borderBottom="none"
                  textAlign="end"
                  fontSize={compactView ? "6.38px" : "2xl"}
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
