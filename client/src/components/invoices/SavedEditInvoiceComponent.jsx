import React, { useEffect, useRef, useState } from "react";

import {
  Box,
  Flex,
  Heading,
  HStack,
  Icon,
  Table,
  TableContainer,
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
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { useSessionStore } from "../../stores/useSessionStore";
import { useInvoiceSessions } from "../../contexts/hooks/useInvoiceSessions";
import { useParams } from "react-router-dom";
import { useSummaryStore } from "../../stores/useSummaryStore";

const SavedStatementComments = ({
  subtotal,
  setSubtotal,
  compactView = false,
  summary = [],
  pastDue,
}) => {
  
  const { id } = useParams();
  useInvoiceSessions(id);
  const { sessions, setSessions } = useSessionStore();

  const calculateSummaryTotal = (rate, adjustmentValues) => {
    if (!rate) return "0.00";

    const baseRate = Number(rate);
    if (isNaN(baseRate)) return "0.00";

    const adjustedTotal = (adjustmentValues || []).reduce((acc, val) => {
      if (isNaN(val.value) || val.type === "total") return acc;

      if (val.type === "rate_percent") {
        const factor = 1 + val.value / 100;
        return acc * factor;
      } else {
        return acc + Number(val.value);
      }
    }, baseRate);

    return Number(adjustedTotal).toFixed(2);
  };

  const calculateTotalBookingRow = (
    startTime,
    endTime,
    rate,
    adjustmentValues,
    totalArray = []
  ) => {
    if (!startTime || !endTime || !rate) return "0.00";

    // Make sure we're working with valid arrays
    const currentAdjustmentValues = Array.isArray(adjustmentValues)
      ? adjustmentValues.filter((adj) => adj && adj.type)
      : [];
    const currentTotalArray = Array.isArray(totalArray) ? totalArray : [];

    const timeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const rawStart = timeToMinutes(startTime.substring(0, 5));
    const rawEnd = timeToMinutes(endTime.substring(0, 5));
    const endAdjusted = rawEnd <= rawStart ? rawEnd + 24 * 60 : rawEnd;
    const durationInHours = (endAdjusted - rawStart) / 60;

    const baseRate = Number(rate);

    // Calculate adjustments to the rate
    const adjustedRate = currentAdjustmentValues.reduce((currentRate, adj) => {
      if (!adj || !adj.type || adj.value === undefined) return currentRate;

      const numericValue = Number(adj.value);
      if (isNaN(numericValue)) return currentRate;

      const numericPart = Math.abs(numericValue);
      let adjustmentAmount = 0;

      if (adj.type === "rate_flat") {
        adjustmentAmount = numericPart;
      } else if (adj.type === "rate_percent") {
        adjustmentAmount = (numericPart / 100) * currentRate;
      }

      return numericValue < 0
        ? currentRate - adjustmentAmount
        : currentRate + adjustmentAmount;
    }, baseRate);

    // Calculate the base total with adjusted rate
    const baseTotal = adjustedRate * durationInHours;

    // Add any "total" type adjustments
    const totalAdjustments = currentAdjustmentValues
      .filter((adj) => adj && adj.type === "total")
      .reduce((sum, adj) => sum + Number(adj.value || 0), 0);

    // Add all values from the total array
    const totalArraySum = currentTotalArray.reduce((sum, item) => {
      const value = Number(item.value);
      return sum + (isNaN(value) ? 0 : value);
    }, 0);

    // Combine all totals
    const finalTotal = baseTotal + totalAdjustments + totalArraySum;

    return finalTotal.toFixed(2);
  };

  useEffect(() => {
    const calculateAndSetSubtotal = () => {
      if (!sessions || sessions.length === 0) {
        setSubtotal(0);
        return;
      }

      const adjSum = sessions.reduce((acc, session) => {
        if (!session.adjustmentValues || session.adjustmentValues.length === 0) {
          const total = parseFloat(
            calculateTotalBookingRow(
              session.startTime,
              session.endTime,
              calculateSummaryTotal(session?.rate, summary[0]?.adjustmentValues),
              []
            )
          );
          return acc + total;
        }

        const total = parseFloat(
          calculateTotalBookingRow(
            session.startTime,
            session.endTime,
            calculateSummaryTotal(session?.rate, summary[0]?.adjustmentValues),
            session.adjustmentValues
          )
        );
        return acc + total;
      }, 0);

      const totalSum = sessions.reduce((acc, session) => {
        const total = parseFloat(
          session.total.reduce((sum, item) => sum + Number(item.value || 0), 0)
        );
        return acc + total;
      }, 0);

      const finalTotal = adjSum + totalSum;
      const total = finalTotal.toFixed(2);
      setSubtotal(Number(total));
    };

    calculateAndSetSubtotal();
  }, [sessions, setSubtotal]);

  const calculateSubtotal = (sessions) => {
    if (!sessions || sessions.length === 0) return "0.00";

    const adjSum = sessions.reduce((acc, session) => {
      // Check if session has adjustmentValues and it's not empty
      if (!session.adjustmentValues || session.adjustmentValues.length === 0) {
        // Calculate without adjustments
        const total = parseFloat(
          calculateTotalBookingRow(
            session.startTime,
            session.endTime,
            calculateSummaryTotal(session?.rate, summary[0]?.adjustmentValues),
            []
          )
        );
        return acc + total;
      }

      const total = parseFloat(
        calculateTotalBookingRow(
          session.startTime,
          session.endTime,
          calculateSummaryTotal(session?.rate, summary[0]?.adjustmentValues),
          session.adjustmentValues
        )
      );
      return acc + total;
    }, 0);

    const totalSum = sessions.reduce((acc, session) => {
      const total = parseFloat(
        session.total.reduce((sum, item) => sum + Number(item.value || 0), 0)
      );
      return acc + total;
    }, 0);

    const finalTotal = adjSum + totalSum;

    const total = finalTotal.toFixed(2);
    setSubtotal(Number(total));
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

  const calculateNewRate = (session) => {
    let newRate = Number(session.rate || 0);

    session.adjustmentValues.forEach((adj) => {
      const val = Number(adj.value);
      const isNegative = val < 0;
      const numericPart = Math.abs(val);

      let adjustmentAmount = 0;

      if (adj.type === "rate_flat") {
        adjustmentAmount = numericPart;
      } else if (adj.type === "rate_percent") {
        adjustmentAmount = (numericPart / 100) * Number(newRate || 0);
      }

      if (isNegative) {
        newRate -= adjustmentAmount;
      } else {
        newRate += adjustmentAmount;
      }
    });

    return newRate;
  };

  return (
    <Flex
      direction="column"
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
      >
        <Box position="relative">
          <Table
            color="#EDF2F7"
            textAlign="center"
            variant="simple"
            size="sm"
          >
            {/* header row */}
            <Thead>
              <Tr color="#4A5568">
                <Th
                  fontSize={compactView ? "6" : "12px"}
                  py={compactView ? "4" : "8"}
                >
                  <Flex align="center">
                    <CalendarIcon width={compactView ? "8" : undefined} />
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
                      height={compactView ? "10" : undefined}
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
                      height={compactView ? "10" : undefined}
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
              {sessions
                .filter((session) => session.name.length === 0)
                .map((session, index) =>
                  session.total?.map((total, totalIndex) => {
                    return (
                      <Tr
                        position="relative"
                        cursor="pointer"
                        _hover={{ bg: "gray.50" }}
                        role="group"
                      >
                        <Td
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
                  })
                )}

              {sessions.length > 0 ? (
                sessions
                  .filter((session) => session.name.length > 0)
                  .flatMap((session, index) => {
                    // For regular sessions, use the existing code
                    const sessionRow = (
                      <Tr key={`session-${session.id || "unknown"}-${index}`}>
                        {/* Date */}
                        <Td
                          py={compactView ? 0 : 4}
                          fontSize={compactView ? "6.38" : "sm"}
                          whiteSpace="nowrap"
                          borderBottom={
                            session.comments && session.comments.length > 0
                              ? "none"
                              : undefined
                          }
                        >
                          {format(new Date(session.bookingDate), "EEE. M/d/yy")}
                        </Td>

                        {/* Classroom */}
                        <Td
                          py={compactView ? 0 : 4}
                          fontSize={compactView ? "6.38" : "sm"}
                          borderBottom={
                            session.comments && session.comments.length > 0
                              ? "none"
                              : undefined
                          }
                        >
                          {session.name}
                        </Td>

                        {/* Rental hours */}
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

                        {/* Room fee adjustment */}
                        <Td
                          py={compactView ? 0 : 4}
                          fontSize={compactView ? "6.38" : "sm"}
                          borderBottom={
                            session.comments && session.comments.length > 0
                              ? "none"
                              : undefined
                          }
                        >
                          {session.adjustmentValues &&
                          session.adjustmentValues.filter(
                            (adj) =>
                              adj.value !== 0 &&
                              !Object.is(adj.value, -0) &&
                              Number(adj.value) !== 0
                          ).length === 0 ? (
                            "None"
                          ) : (
                            <Box display="inline-block">
                              <Tooltip
                                label={session.adjustmentValues
                                  .filter((adj) => adj.type !== "total" && adj.value !== 0 && !Object.is(adj.value, -0) && Number(adj.value) !== 0)
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
                                <Text>
                                  {session.adjustmentValues
                                    .filter((adj) => adj.type !== "total" && adj.value !== 0 && !Object.is(adj.value, -0) && Number(adj.value) !== 0)
                                    .slice(0, 3)
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
                                  {session.adjustmentValues.filter(
                                    (adj) => adj.type !== "total" && adj.value !== 0 && !Object.is(adj.value, -0) && Number(adj.value) !== 0
                                  ).length > 3
                                    ? ", ..."
                                    : ""}
                                </Text>
                              </Tooltip>
                            </Box>
                          )}
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
                            ${calculateTotalBookingRow(
                                  "00:00:00+00",
                                  "01:00:00+00",
                                  calculateSummaryTotal(session?.rate, summary[0]?.adjustmentValues),
                                  session.adjustmentValues
                                )}/hr
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
                                calculateSummaryTotal(session?.rate, summary[0]?.adjustmentValues),
                                session.adjustmentValues
                              )}
                            </Text>
                          </Flex>
                        </Td>
                      </Tr>
                    );

                    const textRows =
                      session.comments?.map((line, textIndex) => {
                        const isLast =
                          textIndex === session.comments.length - 1;
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
                              fontSize={compactView ? "6" : "sm"}
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
                              fontSize={compactView ? "6" : "sm"}
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
                                  fontSize={compactView ? "6.38px" : "sm"}
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
  subtotal = 0.0,
  pastDue,
  compactView = false,
  summary = [],
}) => {
  const { sessions, setSessions } = useSessionStore();

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
  // const originalSessionRateRef = useRef({});

  // useEffect(() => {
  //   if (sessions?.length > 0) {
  //     sessions.forEach((session) => {
  //       if (
  //         session.name &&
  //         originalSessionRateRef.current[session.name] === undefined
  //       ) {
  //         originalSessionRateRef.current[session.name] = session.rate;
  //       }
  //     });
  //   }
  // }, [sessions]);

  // useEffect(() => {
  //   if (
  //     !summary?.[0]?.adjustmentValues ||
  //     sessions.length === 0 ||
  //     originalSessionRateRef.current === null
  //   )
  //     return;

  //   const updatedSessions = sessions.map((session) => {
  //     if (
  //       !session.name ||
  //       originalSessionRateRef.current[session.name] === undefined
  //     ) {
  //       return session;
  //     }

  //     const originalSessionRate = originalSessionRateRef.current[session.name];
  //     const adjustedRate = calculateTotalBookingRow(
  //       originalSessionRate,
  //       summary[0]?.adjustmentValues
  //     );

  //     if (session.rate !== adjustedRate) {
  //       return {
  //         ...session,
  //         rate: adjustedRate,
  //       };
  //     }

  //     return session;
  //   });

  //   setSessions(updatedSessions);
  // }, [summary]);

  const totalCustomRow = summary[0]?.total?.reduce((acc, total) => {
    return acc + Number(total.value);
  }, 0) || 0;

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
        <Box w="100%">
          <Table
            color="#EDF2F7"
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
                      height={compactView ? "10" : undefined}
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
              {Object.values(
                sessions
                  .filter((session) => session.name.length > 0)
                  .reduce((acc, session) => {
                    // Use the session name as the key
                    if (!acc[session.name]) {
                      acc[session.name] = {
                        ...session,
                        rate: session.rate // Keep the first rate we see
                      };
                    }
                    return acc;
                  }, {})
              ).map((session, key, array) => (
                <Tr key={key}>
                  <Td
                    pl="16"
                    fontSize={compactView ? "6.38px" : "sm"}
                    py={compactView ? 2 : 4}
                    borderBottom={key === array.length - 1 ? undefined : "none"}
                    colSpan={4}
                  >
                    {session.name}
                  </Td>
                  <Td
                    fontSize={compactView ? "6.38px" : "sm"}
                    py={compactView ? 2 : 4}
                    borderBottom={key === array.length - 1 ? undefined : "none"}
                  >
                    {summary[0]?.adjustmentValues.filter(
                      (adj) =>
                        adj.value !== 0 &&
                        !Object.is(adj.value, -0) &&
                        Number(adj.value) !== 0
                    ).length === 0 ? (
                      "None"
                    ) : (
                      <Box display="inline-block">
                        <Tooltip
                          label={summary[0]?.adjustmentValues
                            .filter((adj) => adj.value !== 0 && !Object.is(adj.value, -0) && Number(adj.value) !== 0)
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
                          <Text textOverflow="ellipsis" overflow="hidden">
                            {summary[0]?.adjustmentValues
                              .filter((adj) => adj.value !== 0 && !Object.is(adj.value, -0) && Number(adj.value) !== 0)
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
                    borderBottom={key === array.length - 1 ? undefined : "none"}
                  >
                    ${calculateTotalBookingRow(session.rate, summary[0]?.adjustmentValues)}/hr
                  </Td>
                </Tr>
              ))}
              {/* past due balance row */}

              {summary[0]?.total?.map((total, totalIndex) => {
                return (
                  <Tr
                  fontSize={compactView ? "6.38px" : "sm"}
                  position="relative"
                  cursor="pointer"
                  _hover={{ bg: "gray.50" }}
                  role="group"
                >
                  <Td
                    fontSize={compactView ? "6.38px" : "sm"}
                    py={compactView ? 2 : 6}
                  >
                    {(() => {
                      const date = new Date(
                        summary[0]?.total[totalIndex].date
                      );
                      date.setMinutes(
                        date.getMinutes() +
                        date.getTimezoneOffset()
                      );
                      return format(date, "EEE. M/d/yy");
                    })()}
                  </Td>
                  <Td
                    colSpan={4}
                    fontSize={compactView ? "6.38px" : "sm"}
                    py={compactView ? 2 : 4}
                  >
                    {summary[0]?.total[totalIndex]?.comment}
                  </Td>
                  <Td
                    textAlign="right"
                    position="relative"
                    fontSize={compactView ? "6.38px" : "sm"}
                    py={compactView ? 2 : 4}
                  >
                    <Flex
                      justifyContent="flex-end"
                      alignItems="center"
                    >
                      <Text mr={1}>$</Text>
                      <Text
                        fontSize={compactView ? "6.38px" : "sm"}
                      >
                        {Number(
                          summary[0]?.total?.[totalIndex]?.value || 0
                        ).toFixed(2)}
                      </Text>
                    </Flex>
                  </Td>
                </Tr>
                );
              })}

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
                  {`$ ${Number(subtotal + totalCustomRow).toFixed(2)}`}
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
                  {`$ ${(parseFloat(pastDue) + parseFloat(subtotal) + parseFloat(totalCustomRow)).toFixed(2)}`}
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
