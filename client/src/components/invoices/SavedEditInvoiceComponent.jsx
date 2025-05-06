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
  setSubtotal,
  sessions = [],
  compactView = false,
  rooms = [],
  setRooms,
}) => {
  const calculateTotalBookingRow = (
    startTime,
    endTime,
    rate,
    adjustmentValues
  ) => {
    if (!startTime || !endTime || !rate) return "0.00"; // Check if any required value is missing

    const timeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const startMinutes = timeToMinutes(startTime.substring(0, 5));
    const endMinutes = timeToMinutes(endTime.substring(0, 5));
    const diff = endMinutes - startMinutes;

    const totalHours = Math.ceil(diff / 60);

    const hourlyRate = totalHours * rate;

    const adjustedTotal =
      adjustmentValues?.reduce((acc, val) => {
        const sign = val[0];
        const isPercent = val.includes("%");
        const cleanStr = val.slice(1).replace("$", "").replace("%", "");
        const num = parseFloat(cleanStr);

        if (isNaN(num)) return acc;

        if (isPercent) {
          const factor = 1 + (sign === "+" ? num : -num) / 100;

          return acc * factor;
        } else {
          return sign === "+" ? acc + num : acc - num;
        }
      }, hourlyRate) ?? hourlyRate;

    return adjustedTotal.toFixed(2);
  };

  const calculateSubtotal = (sessions) => {
    if (!sessions || sessions.length === 0) return "0.00";

    const totalSum = sessions.reduce((acc, session) => {
      const total = parseFloat(
        calculateTotalBookingRow(
          session.startTime,
          session.endTime,
          session.rate,
          session.adjustmentValues
        )
      );
      return acc + total;
    }, 0);

    const total = totalSum.toFixed(2);
    setSubtotal(total);
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
          width="100%"
          position="relative"
        >
          <Table
            color="#EDF2F7"
            textAlign="center"
            variant="simple"
            size="sm"
            w="100%"
          >
            {/* header row */}
            <Thead>
              <Tr color="#4A5568">
                <Th
                  fontSize={compactView ? "6" : "12px"}
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
                sessions.flatMap((session, index) => {
                  const sessionRow = (
                    <Tr key={`session-${session.id || "unknown"}-${index}`}>
                      {/* Date */}
                      <Td
                        py={compactView ? 0 : 4}
                        fontSize={compactView ? "6.38" : "sm"}
                        whiteSpace="nowrap"
                        borderBottom={session.comments.length > 0 ? "none" : undefined}
                      >
                        {format(new Date(session.datetime), "EEE. M/d/yy")}
                      </Td>

                      {/* Classroom */}
                      <Td
                        py={compactView ? 0 : 4}
                        fontSize={compactView ? "6.38" : "sm"}
                        borderBottom={session.comments.length > 0 ? "none" : undefined}
                      >
                        {session.name}
                      </Td>

                      {/* Rental hours */}
                      <Td
                        py={compactView ? 0 : 4}
                        fontSize={compactView ? "6.38" : "sm"}
                        borderBottom={session.comments.length > 0 ? "none" : undefined}
                      >
                        <Flex
                          align="center"
                          whiteSpace="nowrap"
                          overflow="hidden"
                          textOverflow="ellipsis"
                        >
                          <Text>{formatTimeString(session.startTime)}</Text>
                          <Text>-</Text>
                          <Text>{formatTimeString(session.endTime)}</Text>
                        </Flex>
                      </Td>

                      {/* Room fee */}
                      <Td
                        py={compactView ? 0 : 4}
                        fontSize={compactView ? "6.38" : "sm"}
                        borderBottom={session.comments.length > 0 ? "none" : undefined}
                      >
                        {session.adjustmentValues.length === 0 ? (
                          "None"
                        ) : (
                          <Box display="inline-block">
                            <Tooltip
                              label={session.adjustmentValues.join(", ")}
                              placement="top"
                              bg="gray"
                              w="auto"
                            >
                              <Text>
                                {session.adjustmentValues
                                  .slice(0, 3)
                                  .join(", ")}
                                {session.adjustmentValues.length > 3
                                  ? ", ..."
                                  : ""}
                              </Text>
                            </Tooltip>
                          </Box>
                        )}
                      </Td>

                      {/* Adjustment type */}
                      <Td
                        py={compactView ? 0 : 4}
                        fontSize={compactView ? "6.38" : "sm"}
                        borderBottom={session.comments.length > 0 ? "none" : undefined}
                      >
                        <Text
                          h="40px"
                          p={compactView ? "0" : "2"}
                          display="flex"
                          alignItems="center"
                        >
                          ${parseFloat(session.rate).toFixed(2)}/hr
                        </Text>
                      </Td>

                      {/* Total */}
                      <Td
                        py={compactView ? 0 : 4}
                        fontSize={compactView ? "6.38" : "sm"}
                        borderBottom={session.comments.length > 0 ? "none" : undefined}
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
                            pl={compactView ? 2 : 4}
                            color="gray.600"
                            py={compactView ? 2 : 6}
                            fontSize={compactView ? "6.38" : "sm"}
                            borderBottom={isLast ? "1px solid" : "none"}
                            borderColor="gray.200"
                            
                          >
                            {line}
                          </Td>
                        </Tr>
                      );
                    }) || [];

                  return [sessionRow, ...textRows];
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
                  {`$ ${calculateSubtotal(sessions)}`}
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
  sessions = [],
  setSessions,
  comments = [],
  rooms = [],
  setRooms,
  subtotal = 0.0,
  pastDue,
  summary = [],
  compactView = false,
}) => {
  const calculateTotalBookingRow = (rate, adjustmentValues) => {
    if (!rate) return "0.00";

    const baseRate = parseFloat(rate);
    if (isNaN(baseRate)) return "0.00";

    const adjustedTotal = (adjustmentValues || []).reduce((acc, val) => {
      const sign = val[0];
      const isPercent = val.includes("%");
      const cleanStr = val.slice(1).replace("$", "").replace("%", "");
      const num = parseFloat(cleanStr);

      if (isNaN(num)) return acc;

      if (isPercent) {
        const factor = 1 + (sign === "+" ? num : -num) / 100;
        return acc * factor;
      } else {
        return sign === "+" ? acc + num : acc - num;
      }
    }, baseRate);

    return adjustedTotal.toFixed(2);
  };

  const calculateSubtotal = (sessions) => {
    if (!sessions || sessions.length === 0) return "0.00";

    const totalSum = sessions.reduce((acc, session) => {
      const total = parseFloat(
        calculateTotalBookingRow(
          session.startTime,
          session.endTime,
          session.rate,
          session.adjustmentValues
        )
      );
      return acc + total;
    }, 0);

    const total = totalSum.toFixed(2);
    setSubtotal(total);
    return total;
  };

  useEffect(() => {
    if (!summary?.[0]?.adjustmentValues || sessions.length === 0) return;

    let shouldUpdate = false;

    const updatedSessions = sessions.map((session) => {
      const adjustedRate = calculateTotalBookingRow(
        session?.rate,
        summary[0]?.adjustmentValues
      );

      if (session.rate !== adjustedRate) {
        shouldUpdate = true;
        return {
          ...session,
          rate: adjustedRate,
        };
      }

      return session;
    });

    if (shouldUpdate) {
      setSessions(updatedSessions);
    }
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
      >
        <Box width="100%">
          <Table
            color="#EDF2F7"
            width="100%"
            textAlign="center"
            size="sm"
          >
            {/* header row */}
            <Thead color="#4A5568">
              <Tr>
                <Th
                  colSpan={4}
                  textTransform="none"
                  fontSize={compactView ? "6.38px" : "sm"}
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
                    <Text fontSize={compactView ? "6.38px" : "sm"}>
                      DESCRIPTION
                    </Text>
                  </Flex>
                </Th>
                <Th
                  textTransform="none"
                  fontSize={compactView ? "6.38px" : "sm"}
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
                      fontSize={compactView ? "6.38px" : "sm"}
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
                  fontSize={compactView ? "6.38px" : "sm"}
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
                  fontSize={compactView ? "6.38px" : "sm"}
                  py={compactView ? "2" : "8"}
                >
                  Room Fee
                </Td>
              </Tr>
              {/* Room Fee Body Row */}

              {sessions?.map((session, key) => (
                <Tr key={key}>
                  <Td
                    pl="16"
                    fontSize={compactView ? "6.38px" : "sm"}
                    py={compactView ? 2 : 4}
                    borderBottom={key === sessions.length - 1 ? undefined : "none"}
                    colSpan={4}
                  >
                    {session.name}
                  </Td>
                  <Td
                    fontSize={compactView ? "6.38px" : "sm"}
                    py={compactView ? 2 : 4}
                    borderBottom={key === sessions.length - 1 ? undefined : "none"}
                  >
                    {summary[0]?.adjustmentValues.length === 0 ? (
                      "None"
                    ) : (
                      <Box display="inline-block">
                        <Tooltip
                          label={summary[0]?.adjustmentValues.join(", ")}
                          placement="top"
                          bg="gray"
                          w="auto"
                        >
                          <Text
                            textOverflow="ellipsis"
                            // whiteSpace="nowrap"
                            overflow="hidden"
                          >
                            {summary[0]?.adjustmentValues.join(", ")}
                          </Text>
                        </Tooltip>
                      </Box>
                    )}
                  </Td>
                  <Td
                    textAlign="end"
                    py={compactView ? 0 : 4}
                    fontSize={compactView ? "6.38px" : "sm"}
                    borderBottom={key === sessions.length - 1 ? undefined : "none"}
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
                  $ {pastDue.toFixed(2)}
                </Td>
              </Tr>

              {/* current statement balance row */}
              <Tr>
                <Td
                  colSpan={4}
                  py={compactView ? 0 : 4}
                  fontSize={compactView ? "6.38px" : "sm"}
                >
                  Current Statement Subtotal
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
                  {`$ ${subtotal}`}
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
                  {`$ ${(parseFloat(pastDue) + parseFloat(subtotal)).toFixed(2)}`}
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
