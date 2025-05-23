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
  subtotal,
  setSubtotal,
  sessions = [],
  compactView = false,
}) => {
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
        console.log("CHECK", bookingState.startTime, bookingState.endTime, room[0]?.rate);
        const total = handleSubtotalSum(bookingState.startTime, bookingState.endTime, room[0]?.rate);


        // Add subtotal for each comment (this logic is now inside useEffect)
        if (commentsState && commentsState.length > 0) {
          commentsState.forEach(() => {
            setSubtotalSum((prevSubtotal) => prevSubtotal + parseFloat(total)); // Add to subtotalSum
          });
        }


        setSubtotal(subtotalSum)
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
    >
      <Heading fontSize="11.7px" mb="2">Sessions</Heading>
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
              <Th textTransform="none" width="80px" fontSize="6.38px" borderBottom='none'>Date</Th>
              <Th textTransform="none" width="80px" fontSize="6.38px" borderBottom='none'>Classroom</Th>
              <Th textTransform="none" width="80px" fontSize="6.38px" borderBottom='none'>Rental Hours</Th>
              <Th textTransform="none" width="80px" fontSize="6.38px" borderBottom='none'>Room Fee</Th>
              <Th textTransform="none" width="80px" fontSize="6.38px" borderBottom='none'>Adjustment Type(s)</Th>
              <Th textTransform="none" width="80px" fontSize="6.38px" borderBottom='none'>Total</Th>
            </Tr>
          </Thead>

          <Tbody color="#2D3748">
            {comments.length > 0 ? (
              comments.map((comment, index) => [
                <Tr key={`comment-${comment.id || "unknown"}-${index}`}>
                  {/* date */}
                  <Td fontSize="6.38px">
                    {format(new Date(comment.datetime), "M/d/yy")}
                  </Td>

                  {/* classroom */}
                  <Td fontSize="6.38px">
                    {room && room.length > 0 ? `${room[0].name}` : "N/A"}
                  </Td>

                  {/* rental hours */}
                  <Td fontSize="6.38px">
                    <Flex
                      align="center"
                      justifyContent="space-evenly"
                      gap={2}
                    >
                      <Text
                        p={2}
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
                      <Text>to</Text>
                      <Text
                        p={2}
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

                  {/* room fee */}
                  <Td fontSize="6.38px">
                    <Flex align="center" gap="1">
                      <Text
                        fontSize="6.38px"
                        p="2"
                      >
                        {room && room.length > 0 ? `$${room[0].rate}` : "N/A"}
                      </Text>
                      <Text fontSize="6.38px">/hr</Text>
                    </Flex>
                  </Td>

                      {/* Room fee rate */}
                      <Td
                        py={compactView ? 0 : 4}
                        fontSize={compactView ? "6.38" : "sm"}
                        borderBottom={
                          session.comments && session.comments.length > 0
                            ? "none"
                            : undefined
                        }
                      >
                        <Text
                          h="40px"
                          p={compactView ? "0" : "2"}
                          display="flex"
                          alignItems="center"
                        >
                          ${calculateNewRate(session).toFixed(2)}/hr
                        </Text>
                      </Td>

                      {/* Total */}
                      <Td
                        py={compactView ? 0 : 4}
                        fontSize={compactView ? "6.38" : "sm"}
                        borderBottom={
                          session.comments && session.comments.length > 0
                            ? "none"
                            : undefined
                        }
                      >
                        <Flex
                          justifyContent="center"
                          alignItems="center"
                          gap={2}
                        >
                          <Text>$</Text>
                          <Text textAlign="center">
                            {calculateTotalBookingRow(
                              session.startTime,
                              session.endTime,
                              session.rate,
                              session.adjustmentValues
                            )}
                          </Text>
                        </Flex>
                      </Td>
                    </Tr>
                  );

                  const textRows =
                    session.comments?.map((line, textIndex) => {
                      const isLast = textIndex === session.comments.length - 1;
                      return (
                        <Tr
                          key={`text-${session.id || "unknown"}-${index}-${textIndex}`}
                        >
                          <Td
                            colSpan={6}
                            pl={4}
                            color="gray.600"
                            py={compactView ? 2 : 6}
                            fontSize={compactView ? "6.38" : "sm"}
                            borderBottom={isLast ? "1px solid" : "none"}
                            borderColor="gray.200"
                          >
                            {line.comment}
                          </Td>
                        </Tr>
                      );
                    }) || [];

                  const totalRow =
                    session?.total?.map((total, totalIndex) => {
                      return (
                        <Tr
                          position="relative"
                          cursor="pointer"
                          _hover={{ bg: "gray.50" }}
                          role="group"
                        >
                          <Td
                            onClick={() =>
                              handleEditCustomRow(session, index, totalIndex)
                            }
                            fontSize={compactView ? "6" : "12px"}
                            py={compactView ? "0" : "6"}
                          >
                            {(() => {
                              const date = new Date(
                                session.total[totalIndex].date
                              );
                              date.setMinutes(
                                date.getMinutes() + date.getTimezoneOffset()
                              );
                              return format(date, "EEE. M/d/yy");
                            })()}
                          </Td>
                          <Td
                            colSpan={4}
                            onClick={() =>
                              handleEditCustomRow(session, index, totalIndex)
                            }
                            fontSize={compactView ? "6" : "12px"}
                            py={compactView ? "0" : "6"}
                          >
                            {session.total[totalIndex]?.comment ||
                              "Custom adjustment"}
                          </Td>
                          <Td
                            textAlign="right"
                            position="relative"
                          >
                            <Flex
                              justifyContent="flex-end"
                              alignItems="center"
                            >
                              <Text
                                onClick={() =>
                                  handleEditCustomRow(
                                    session,
                                    index,
                                    totalIndex
                                  )
                                }
                                fontSize={compactView ? "6" : "12px"}
                                py={compactView ? "0" : "6"}
                              >
                                ${" "}
                                {Number(
                                  session.total[totalIndex].value || 0
                                ).toFixed(2)}
                              </Text>
                            </Flex>
                          </Td>
                        </Tr>
                      );
                    }) || [];

                  return [sessionRow, ...textRows, ...totalRow];
                })
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

            <Tr>
              <Td
                textAlign="right"
                colSpan={5}
                fontSize="6.38px"
                fontWeight="bold"
              >
                Subtotal
              </Td>
              <Td
                fontSize="6.38px" borderBottom='none'
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
  pastDue
}) => {
  const calculateTotalBookingRow = (rate, adjustmentValues) => {
    if (!rate) return "0.00";

    const baseRate = Number(rate);
    if (isNaN(baseRate)) return "0.00";

    const adjustedTotal = (adjustmentValues || []).reduce((acc, val) => {
      if (isNaN(val.value)) return acc;

      if (val.type === "rate_percent") {
        const factor = 1 + val.value / 100;
        return acc * factor;
      } else {
        return acc + Number(val.value);
      }
    }, baseRate);

    return Number(adjustedTotal).toFixed(2);
  };

  // Summary Sidebar total calculations
  const originalSessionRateRef = useRef({});

  useEffect(() => {
    if (sessions?.length > 0) {
      sessions.forEach(session => {
        if (session.name && originalSessionRateRef.current[session.name] === undefined) {
          originalSessionRateRef.current[session.name] = session.rate;
        }
      });
    }
  }, [booking, comments, room]);



  useEffect(() => {
    if (
      !summary?.[0]?.adjustmentValues ||
      sessions.length === 0 ||
      originalSessionRateRef.current === null
    )
      return;

      
      const updatedSessions = sessions.map((session) => {
      if (!session.name || originalSessionRateRef.current[session.name] === undefined) {
        return session;
      }

      const originalSessionRate = originalSessionRateRef.current[session.name];
      const adjustedRate = calculateTotalBookingRow(
        originalSessionRate,
        summary[0]?.adjustmentValues
      );

      if (session.rate !== adjustedRate) {
        return {
          ...session,
          rate: adjustedRate,
        };
      }

      return session;
    });

    setSessions(updatedSessions);
  }, [summary]);

  return (
    <Flex
      direction="column"
      w="100%"
      minH="24"
      fontFamily="Inter"
      color="#2D3748"
      mt={8}
    >

  <Heading fontSize="11.7px" mb="2">Summary</Heading>
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
                <Th fontSize="6.38px" colSpan={4} textTransform="none" borderBottom='none'>Description</Th>
                <Th fontSize="6.38px" textTransform="none" borderBottom='none'>Adjustment Type(s)</Th>
                <Th fontSize="6.38px" textTransform="none" borderBottom='none' textAlign="end" pr={14}>Total</Th>
              </Tr>
            </Thead>

            {/* past due balance row */}
            <Tbody color="#2D3748">
              {/* Room Fee Header Row */}
              <Tr p="40">
                <Td
                  borderBottom="none"
                  colSpan={4}
                  fontSize={compactView ? "6.38px" : "sm"}
                  py={compactView ? "2" : "8"}
                >
                  Room Fee
                </Td>
              </Tr>
              {/* Room Fee Body Row */}
              {/* // TODO NEED TO FIX ADJUSTMENTVALUES[0] */}
              {sessions
                .map((session, key) => (
                  <Tr key={key}>
                    <Td
                      pl="16"
                      fontSize={compactView ? "6.38px" : "sm"}
                      py={compactView ? 2 : 4}
                      borderBottom={
                        key === sessions.length - 1 ? undefined : "none"
                      }
                      colSpan={4}
                    >
                      {session.name}
                    </Td>
                    <Td
                      fontSize={compactView ? "6.38px" : "sm"}
                      py={compactView ? 2 : 4}
                      borderBottom={
                        key === sessions.length - 1 ? undefined : "none"
                      }
                    >
                      {summary[0]?.adjustmentValues.length === 0 ? (
                        "None"
                      ) : (
                        <Box display="inline-block">
                          <Tooltip
                            label={summary[0]?.adjustmentValues
                              .map((adj) => {
                                const value = Number(adj.value);
                                const sign = value >= 0 ? "+" : "-";
                                const isFlat = adj.type === "rate_flat";
                                const absValue = Math.abs(value);
                                return isFlat
                                  ? `${sign}$${absValue}`
                                  : `${sign}${absValue}%`;
                              })
                              .join(", ")}
                            placement="top"
                            bg="gray"
                            w="auto"
                          >
                            <Text
                              textOverflow="ellipsis"
                              // whiteSpace="nowrap"
                              overflow="hidden"
                            >
                              {summary[0]?.adjustmentValues
                                .map((adj) => {
                                  const value = Number(adj.value);
                                  const sign = value >= 0 ? "+" : "-";
                                  const isFlat = adj.type === "rate_flat";
                                  const absValue = Math.abs(value);
                                  return isFlat
                                    ? `${sign}$${absValue}`
                                    : `${sign}${absValue}%`;
                                })
                                .join(", ")}
                            </Text>
                          </Tooltip>
                        </Box>
                      )}
                    </Td>
                    <Td
                      textAlign="end"
                      py={compactView ? 0 : 4}
                      fontSize={compactView ? "6.38px" : "sm"}
                      borderBottom={
                        key === sessions.length - 1 ? undefined : "none"
                      }
                    >
                      ${session.rate}/hr
                    </Td>
                  </Tr>
                ))}
              {/* past due balance row */}

              <Tr>
                <Td
                  colSpan={4}
                  fontSize={compactView ? "6.38px" : "sm"}
                  py={compactView ? "2" : "8"}
                >
                  Past Due Balance
                </Td>
                <Td></Td>
                <Td
                  textAlign="end"
                  py={compactView ? 0 : 4}
                  fontSize={compactView ? "6.38px" : "sm"}
                >
                  $ {pastDue?.toFixed(2)}
                </Td>
              </Tr>

              {/* current statement balance row */}
              <Tr>
                <Td fontSize="6.38px" colSpan={4}>Current Statement Subtotal</Td>
                <Td fontSize="6.38px">None</Td>
                <Td fontSize="6.38px" textAlign="center">
                  <Flex
                    justifyContent="center"
                    alignItems="center"
                    gap={2}
                    fontSize="6.38px"
                  >
                    <Text>$</Text>
                    <Text textAlign="center">{subtotalSum.toFixed(2)}</Text>
                  </Flex>
                </Td>
                <Td
                  py={compactView ? 0 : 4}
                  fontSize={compactView ? "6.38px" : "sm"}
                ></Td>
                <Td
                  textAlign="end"
                  py={compactView ? 0 : 4}
                  fontSize={compactView ? "6.38px" : "sm"}
                >
                  {`$ ${subtotal.toFixed(2)}`}
                </Td>
              </Tr>

              {/* total row */}
              <Tr>
                <Td
                  textAlign="right"
                  colSpan={5}
                  fontSize="7.45px"
                  fontWeight="700"
                >
                  Total Amount Due
                </Td>
                <Td
                  fontSize="11.7px"
                  fontWeight="700"
                  borderBottom='none'
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

export {
  SavedStatementComments,
  SavedInvoiceSummary
};
