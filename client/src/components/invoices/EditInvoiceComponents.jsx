import React, { useEffect, useRef, useState } from "react";

import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Image,
  Input,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Radio,
  RadioGroup,
  SimpleGrid,
  Slide,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";

import { format } from "date-fns";

import {
  BookWithBookmarkIcon,
  CalendarIcon,
  CancelIcon,
  ClockIcon,
  DollarSignIcon,
  EditDocumentIcon,
  LocationIcon,
  PencilIcon,
  PlusIcon,
} from "../../assets/EditInvoiceIcons";
import commentsIcon from "../../assets/icons/comments.svg";
import plusIcon from "../../assets/icons/plus.svg";
import logo from "../../assets/logo/logo.png";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { getCurrentUser } from "../../utils/auth/firebase";
import {RoomFeeAdjustmentSideBar, SummaryFeeAdjustmentSideBar} from "./RoomFeeAdjustmentSideBar";

const getGeneratedDate = (comments = [], invoice = null, includeDay = true) => {
  if (comments.length > 0) {
    const latestComment = comments.sort(
      (a, b) => new Date(b.datetime) - new Date(a.datetime)
    )[0];

    const latestDate = new Date(latestComment.datetime);
    const month = latestDate.toLocaleString("default", { month: "long" });
    const day = latestDate.getDate();
    const year = latestDate.getFullYear();

    return includeDay ? `${month} ${day}, ${year}` : `${month} ${year}`;
  } else if (invoice) {
    return invoice["startDate"];
  } else {
    return "No Date Found";
  }
};

const EditInvoiceTitle = ({ comments, invoice, compactView }) => {
  return (
    <Flex
      justifyContent="space-between"
      fontFamily="Inter"
      color="#2D3748"
      gap={20}
      mb={"29.26px"}
    >
      <Stack>
        <Heading
          color="#2D3748"
          fontWeight="600"
          fontSize={compactView ? "20.932px" : "5xl"}
        >
          INVOICE
        </Heading>
        <Text
          color="#718096"
          fontSize={compactView && "6.509px"}
          whiteSpace="nowrap"
        >
          Generated on {getGeneratedDate(comments, invoice, true)}
        </Text>
      </Stack>
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="end"
        align="center"
        gap="4"
      >
        <VStack
          align="flex-end"
          spacing={0}
        >
          <Text fontSize={compactView ? "7.509px" : "sm"}>
            La Peña Cultural Center
          </Text>
          <Text
            fontSize={compactView ? "7.509px" : "sm"}
            whiteSpace="nowrap"
          >
            3105 Shattuck Ave., Berkeley, CA 94705
          </Text>
          <Text fontSize={compactView ? "7.509px" : "sm"}>lapena.org</Text>
        </VStack>
        <Image
          src={logo}
          alt="La Peña Logo"
          w={100}
        />
      </Flex>
    </Flex>
  );
};

const EditInvoiceDetails = ({
  instructors,
  programName,
  payees,
  comments,
  invoice,
  compactView = false,
}) => {
  return (
    <VStack
      spacing={6}
      align="stretch"
      mb={8}
      fontFamily="Inter"
      color="#2D3748"
    >
      <VStack gap="0">
        <Heading
          textAlign="center"
          fontWeight={"600"}
          fontSize={compactView ? "13.827px" : "2xl"}
        >
          Classroom Rental Monthly Statement
        </Heading>
        <Heading
          fontSize={compactView ? "8.509px" : "sm"}
          textAlign="center"
          color="#2D3748"
          fontWeight="500"
          mt={"5.85px"}
        >
          {getGeneratedDate(comments, invoice, false)}
        </Heading>
      </VStack>

      <SimpleGrid
        columns={{ base: 1, md: 2 }}
        spacing={6}
      >
        {/* Left column */}
        <VStack
          align="stretch"
          flex={1}
        >
          <Text
            fontWeight="500"
            color={"#718096"}
            margin={"0 0"}
            padding={0}
            fontSize={compactView ? "8.509px" : "sm"}
          >
            Recurring Program:
          </Text>
          <Text fontSize={compactView ? "8.509px" : "sm"}>
            {programName || "No program name found"}
          </Text>
          <VStack
            align="stretch"
            flex={1}
            maxH="120px"
          >
            <Text
              fontWeight="500"
              color={"#718096"}
              fontSize={compactView ? "8.509px" : "sm"}
            >
              Designated Payer(s):
            </Text>
            {payees && payees.length > 0 ? (
              payees.map((payee, index) => (
                <Text
                  key={index}
                  mr={2}
                  borderRadius="0"
                  fontSize={compactView ? "8.509px" : "sm"}
                >
                  {payee.name} - {payee.email}
                </Text>
              ))
            ) : (
              <Text
                mr={2}
                borderRadius="0"
                fontSize={compactView ? "8.509px" : "sm"}
              >
                No payees found.
              </Text>
            )}
          </VStack>
        </VStack>

        {/* Right column */}
        <HStack align="flex-start">
          <VStack
            align="stretch"
            flex={1}
            maxH="195px"
            overflowY="auto"
          >
            <Text
              fontWeight="500"
              color={"#718096"}
              fontSize={compactView ? "8.509px" : "sm"}
            >
              Lead Artist(s):
            </Text>
            {instructors && instructors.length > 0 ? (
              instructors.map((instructor, index) => (
                <HStack key={index}>
                  <Text
                    mr={2}
                    fontSize={compactView ? "8.509px" : "sm"}
                  >
                    {instructor.name} - {instructor.email}
                  </Text>
                </HStack>
              ))
            ) : (
              <Text
                mr={2}
                borderRadius="0"
                fontSize={compactView ? "8.509px" : "sm"}
              >
                No instructors found.
              </Text>
            )}
          </VStack>
        </HStack>
      </SimpleGrid>
    </VStack>
  );
};

// TODO
// ! - Summary Sidebar
// ! - Add comments row
// ! - Add fees row
// ! - POST Functionality
// - Fix Current Statement Total in EditInvoice being different that SavedInvoice
// - Make it so removing a comment adjustmenttype from sidebar only applies when pressing apply, otherwise it stays
// - Fix subtotal loading twice
// - Fix recalculation when summary fee adjustment is made

const StatementComments = ({
  invoice,
  comments = [],
  bookings = [],
  rooms = [],
  subtotal = 0.0,
  onCommentsChange,
  onSubtotalChange,
  compactView = false,
  sessions = [],
  setSessions,
  setSubtotal
}) => {
  const { backend } = useBackendContext();
  const [commentsState, setComments] = useState(comments);
  const [bookingState, setBooking] = useState(bookings);
  const [roomState, setRoom] = useState(rooms);
  const [sessionTotals, setSessionTotals] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [expandedBookingIndex, setExpandedBookingIndex] = useState(null); // Track which row is expanded
  const [newSubtotalValue, setNewSubtotalValue] = useState(0);
  const [activeRowId, setActiveRowId] = useState(null);
  const [inputValues, setInputValues] = useState(
    Array(comments.length).fill("")
  ); // Initialize local state for input values
  const [adjustmentsByBooking, setAdjustmentsByBooking] = useState({});
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const currentFirebaseUser = await getCurrentUser();
      const firebaseUid = currentFirebaseUser?.uid;
      if (!firebaseUid) return;
      const userRes = await backend.get(`/users/${firebaseUid}`);
      setUserId(userRes.data[0].id);
    };

    fetchUserId();
  }, []);

  // const addAdjustment = (type, bookingId, fallbackRate = 0) => {
  //   setAdjustmentsByBooking((prev) => {
  //     const existing = prev[bookingId] || [];

  //     let lastAppliedRate = fallbackRate;

  //     if (existing.length > 0) {
  //       const last = existing[existing.length - 1];
  //       const lastValue = last.isNegative ? -last.value : last.value;
  //       lastAppliedRate =
  //         last.type === "dollar"
  //           ? parseFloat(last.appliedRate) + parseFloat(lastValue) // Dollar: add the value to the appliedRate
  //           : parseFloat(last.appliedRate) * (1 + parseFloat(lastValue) / 100); // Percent: apply the percentage change
  //     } else {
  //       const booking = bookingState.find((b) => b.id === bookingId);
  //       const roomForBooking = rooms.find((r) => r.id === booking?.roomId);
  //       lastAppliedRate = roomForBooking ? roomForBooking.rate : fallbackRate;
  //     }

  //     return {
  //       ...prev,
  //       [bookingId]: [
  //         ...existing,
  //         {
  //           type,
  //           appliedRate: lastAppliedRate,
  //           value: 0,
  //           isNegative: true,
  //         },
  //       ],
  //     };
  //   });
  // };

  // const getAdjustedRate = (bookingId) => {
  //   // let newRate = Number(roomForBooking?.rate || 0);

  //   const adjustments = adjustmentsByBooking[bookingId] || [];

  //   const booking = bookingState.find((b) => b.id === bookingId);
  //   const roomForBooking = rooms.find((r) => r.id === booking.roomId);
  //   let newRate = Number(roomForBooking?.rate || 0);

  //   adjustments.forEach((adj) => {
  //     const amount =
  //       adj.type === "dollar"
  //         ? Number(adj.value || 0)
  //         : (Number(adj.value || 0) / 100) * Number(adj.appliedRate || 0);

  //     newRate += adj.isNegative ? -amount : amount;
  //   });

  //   return newRate;
  // };



  // useEffect(() => {
  //   // Calculate subtotal on initial load
  //   const calculateSubtotal = () => {
  //     if (bookings && bookings.length > 0 && rooms && rooms.length > 0) {
  //       const totals = bookings.map((booking) => {
  //         if (!booking.startTime || !booking.endTime) return 0;

  //         const timeToMinutes = (timeStr) => {
  //           const [hours, minutes] = timeStr.split(":").map(Number);
  //           return hours * 60 + minutes;
  //         };

  //         const startMinutes = timeToMinutes(booking.startTime.substring(0, 5));
  //         const endMinutes = timeToMinutes(booking.endTime.substring(0, 5));
  //         const diff = endMinutes - startMinutes;
  //         const totalHours = Math.ceil(diff / 60);

  //         // Start with the base rate
  //         const roomForBooking = rooms.find((r) => r.id === booking.roomId);
  //         let newRate = Number(roomForBooking?.rate || 0);

  //         const adjustments = adjustmentsByBooking[booking.id] || [];

  //         adjustments.forEach((adj) => {
  //           const amount =
  //             adj.type === "dollar"
  //               ? Number(adj.value || 0)
  //               : (Number(adj.value || 0) / 100) * Number(adj.appliedRate || 0);

  //           newRate += adj.isNegative ? -amount : amount;
  //         });

  //         return parseFloat((totalHours * newRate).toFixed(2));
  //       });

  //       const newSubtotal = totals.reduce((sum, total) => sum + total, 0);
  //       setSessionTotals(totals);
  //       if (onSubtotalChange) {
  //         onSubtotalChange(newSubtotal);
  //         setNewSubtotalValue(newSubtotal);
  //       }
  //     }
  //   };

  //   calculateSubtotal();

  //   if (comments && comments.length > 0) {
  //     setComments(comments);
  //     setBooking(bookings);
  //     setRoom(rooms);
  //   }
  // }, [comments, bookings, rooms, adjustmentsByBooking]);

 



  const calculateTotalBookingRow = (startTime, endTime, rate, adjustmentValues) => {
    if (!startTime || !endTime || !rate) return "0.00";
  
    const timeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      return hours * 60 + minutes;
    };
  
    const rawStart = timeToMinutes(startTime.substring(0, 5));
    const rawEnd = timeToMinutes(endTime.substring(0, 5));
    const endAdjusted = rawEnd <= rawStart ? rawEnd + 24 * 60 : rawEnd;
    const durationInHours = (endAdjusted - rawStart) / 60;
  
    const baseRate = Number(rate);
  
    const adjustedRate = adjustmentValues.reduce((currentRate, val) => {
      const isNegative = val.startsWith("-");
      const numericPart = parseFloat(val.replace(/[+$%-]/g, ""));
      if (isNaN(numericPart)) return currentRate;
  
      const adjustmentAmount = val.includes("$")
        ? numericPart
        : val.includes("%")
        ? (numericPart / 100) * currentRate
        : 0;
  
      return isNegative ? currentRate - adjustmentAmount : currentRate + adjustmentAmount;
    }, baseRate);
  
    const total = adjustedRate * durationInHours;
    return total.toFixed(2);
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
                  // console.log("session", session)

                  const sessionRow = (
                    <Tr key={`session-${session.id || "unknown"}-${index}`}>
                      {/* Date */}
                      <Td
                        py={compactView ? 0 : 4}
                        fontSize={compactView ? "6.38" : "sm"}
                        whiteSpace="nowrap"
                        borderBottom={
                          session.comments.length > 0 ? "none" : undefined
                        }
                      >
                        {format(new Date(session.datetime), "EEE. M/d/yy")}
                      </Td>

                      {/* Classroom */}
                      <Td
                        py={compactView ? 0 : 4}
                        fontSize={compactView ? "6.38" : "sm"}
                        borderBottom={
                          session.comments.length > 0 ? "none" : undefined
                        }
                      >
                        {session.name}
                      </Td>

                      {/* Rental hours */}
                      <Td
                        py={compactView ? 0 : 4}
                        fontSize={compactView ? "6.38" : "sm"}
                        borderBottom={
                          session.comments.length > 0 ? "none" : undefined
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

                      {/* Room fee */}
                      <Td
                        py={compactView ? 0 : 4}
                        fontSize={compactView ? "6.38" : "sm"}
                        borderBottom={
                          session.comments.length > 0 ? "none" : undefined
                        }
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

                        {/* Adjust Button  */}
                      <Button
                        leftIcon={<Icon as={PencilIcon} />}
                        color="white"
                        background="#4441C8"
                        borderRadius="md"
                        px="3"
                        py="2"
                        fontSize="small"
                        height="32px"
                        opacity={
                          activeRowId === null ||
                          activeRowId === session.id
                            ? 1
                            : 0.3
                        }
                        onClick={() => setActiveRowId(session.id)}
                        isDisabled={
                          activeRowId !== null &&
                          activeRowId !== session.id
                        }
                      >
                      Adjust
                    </Button>

                    {/* Adjust Sidebar */}
                    <RoomFeeAdjustmentSideBar
                            isOpen={activeRowId === session.id}
                            onClose={() => setActiveRowId(null)}
                            invoice={invoice[0]}
                            userId={userId}
                            session={session}
                            setSessions={setSessions}
                            sessionIndex={index}
                            subtotal={calculateTotalBookingRow(
                              session.startTime,
                              session.endTime,
                              session.rate,
                              session.adjustmentValues
                            )}
                          />
                      </Td>
                      
                      

                      {/* Adjustment type */}
                      <Td
                        py={compactView ? 0 : 4}
                        fontSize={compactView ? "6.38" : "sm"}
                        borderBottom={
                          session.comments.length > 0 ? "none" : undefined
                        }
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
                        borderBottom={
                          session.comments.length > 0 ? "none" : undefined
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

const InvoiceSummary = ({
  pastDue,
  subtotal,
  onSubtotalChange,
  room,
  setRoom,
  compactView = false,
  sessions = [],
  setSessions,
  summary = [],
  setSummary,
}) => {

  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef();

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
                  fontSize={compactView ? "6.38px" : "sm"}
                  py={compactView ? "2" : "8"}
                  colSpan={4}
                >
                  Room Fee
                </Td>
                <Td borderBottom="none">
                  <Button
                        // onClose={() => setActiveRowId(null)}
                        leftIcon={<Icon as={PencilIcon} />}
                        color="white"
                        background="#4441C8"
                        borderRadius="md"
                        px="3"
                        py="2"
                        fontSize="small"
                        height="32px"
                        // opacity={
                        //   activeRowId === null ||
                        //   activeRowId === session.id
                        //     ? 1
                        //     : 0.3
                        // }
                        // onClick={() => setActiveRowId(session.id)}
                        // isDisabled={
                        //   activeRowId !== null &&
                        //   activeRowId !== session.id
                        // }
                        onClick={onOpen}
                      >
                      Adjust
                    </Button>
                </Td>

                <SummaryFeeAdjustmentSideBar 
                    isOpen={isOpen}
                    onClose={onClose}
                    summary={summary[0]}
                    setSummary={setSummary}
                    sessionIndex={0}
                    subtotal={subtotal}
                />
              </Tr>
              {/* Room Fee Body Row */}

              {sessions?.map((session, key) => (
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
                    borderBottom={
                      key === sessions.length - 1 ? undefined : "none"
                    }
                  >
                    <HStack
                      spacing={1}
                      justify="end"
                    >
                      <Box as="span">$</Box>
                      <Input
                        value={parseFloat(session.rate).toFixed(2)}
                        w="8ch"
                        textAlign="center"
                        px={1}
                      />
                      <Box as="span">/hr</Box>
                    </HStack>
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
                  {`$ ${subtotal.toFixed(2)}`}
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

const FooterDescription = ({ compactView = false }) => {
  return (
    <Flex
      mt={compactView ? "4" : "16"}
      justifyContent="space-between"
      gap={10}
      color="black"
      mx={compactView ? "2" : "16"}
    >
      {/* left text */}
      <VStack
        pt={3}
        pb={2}
        spacing={0}
        align="start"
        mb={10}
      >
        <Text
          fontWeight="bold"
          fontSize={compactView ? "6.51px" : "md"}
        >
          Payments are due at the end of each month.
        </Text>
        <Text
          fontWeight="bold"
          fontSize={compactView ? "6.51px" : "md"}
        >
          You can make your payment at:{" "}
          <Link
            color="blue.500"
            href="https://lapena.org/payment"
          >
            lapena.org/payment
          </Link>
        </Text>
      </VStack>

      {/* right text */}
      <VStack
        pt={3}
        pb={2}
        spacing={0}
        align="start"
        mb={10}
      >
        <Text
          fontWeight="bold"
          fontSize={compactView ? "6.51px" : "md"}
        >
          For any questions,
        </Text>
        <Text
          fontWeight="bold"
          fontSize={compactView ? "6.51px" : "md"}
        >
          please contact:{" "}
          <Link
            href="mailto:classes@lapena.org"
            style={{ textDecoration: "underline" }}
            color="blue.500"
            fontSize={compactView ? "6.51px" : "md"}
          >
            classes@lapena.org
          </Link>
        </Text>
      </VStack>
    </Flex>
  );
};

export {
  StatementComments,
  EditInvoiceTitle,
  EditInvoiceDetails,
  InvoiceSummary,
  FooterDescription,
};
