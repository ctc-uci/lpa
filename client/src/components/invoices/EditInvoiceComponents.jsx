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
  MenuList,
  MenuItem,
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

import commentsIcon from "../../assets/icons/comments.svg";
import plusIcon from "../../assets/icons/plus.svg";
import logo from "../../assets/logo/logo.png";
import {
  CalendarIcon,
  LocationIcon,
  ClockIcon,
  EditDocumentIcon,
  DollarSignIcon,
  PencilIcon,
  PlusIcon,
  CancelIcon
} from "../../assets/EditInvoiceIcons";
import RoomFeeAdjustmentSideBar from "./RoomFeeAdjustmentSideBar";
import { getCurrentUser } from "../../utils/auth/firebase";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";


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

const StatementComments = ({
  invoice,
  comments = [],
  bookings = [],
  rooms = [],
  subtotal = 0.0,
  onCommentsChange,
  onSubtotalChange,
  compactView = false,
}) => {
  const { backend } = useBackendContext();
  const [commentsState, setComments] = useState(comments);
  const [bookingState, setBooking] = useState(bookings);
  const [roomState, setRoom] = useState(rooms);
  const [sessionTotals, setSessionTotals] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [expandedBookingIndex, setExpandedBookingIndex] = useState(null); // Track which row is expanded
  const [rowHoveredIndex, setRowHoveredIndex] = useState(null);
  const [newSubtotalValue, setNewSubtotalValue] = useState(0);
  const [activeRowId, setActiveRowId] = React.useState(null);
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

  const addAdjustment = (type, bookingId) => {
    setAdjustmentsByBooking(prev => {
      const existing = prev[bookingId] || [];
      const booking = bookingState.find(b => b.id === bookingId);
      const roomForBooking = rooms.find(r => r.id === booking.roomId);
      return {
        ...prev,
        [bookingId]: [
          ...existing,
          {
            type,
            appliedRate: roomForBooking ? roomForBooking.rate : 0,
            value: 0,
            isNegative: false
          }
        ]
      };
    });
  };

  const getAdjustedRate = (bookingId) => {
    // let newRate = Number(roomForBooking?.rate || 0);

    const adjustments = adjustmentsByBooking[bookingId] || [];

    const booking = bookingState.find(b => b.id === bookingId);
    const roomForBooking = rooms.find(r => r.id === booking.roomId);
    let newRate = Number(roomForBooking?.rate || 0);

    adjustments.forEach(adj => {
      const amount = adj.type === "dollar"
        ? Number(adj.value || 0)
        : (Number(adj.value || 0) / 100) * Number(adj.appliedRate || 0);

      newRate += adj.isNegative ? -amount : amount;
    });

    return newRate;
  };

  const handleCommentToggle = (index) => {
    setExpandedCommentIndex(expandedCommentIndex === index ? null : index);
  };

  useEffect(() => {
    // Calculate subtotal on initial load
    const calculateSubtotal = () => {
      if (
        bookings &&
        bookings.length > 0 &&
        rooms &&
        rooms.length > 0
      ) {
        const totals = bookings.map((booking) => {
          if (!booking.startTime || !booking.endTime) return 0;

          const timeToMinutes = (timeStr) => {
            const [hours, minutes] = timeStr.split(":").map(Number);
            return hours * 60 + minutes;
          };

          const startMinutes = timeToMinutes(booking.startTime.substring(0, 5));
          const endMinutes = timeToMinutes(booking.endTime.substring(0, 5));
          const diff = endMinutes - startMinutes;
          const totalHours = Math.ceil(diff / 60);

          // Start with the base rate
          const roomForBooking = rooms.find(r => r.id === booking.roomId);
          let newRate = Number(roomForBooking?.rate || 0);

          const adjustments = adjustmentsByBooking[booking.id] || [];

          adjustments.forEach(adj => {
            const amount = adj.type === "dollar"
              ? Number(adj.value || 0)
              : (Number(adj.value || 0) / 100) * Number(adj.appliedRate || 0);

            newRate += adj.isNegative ? -amount : amount;
          });

          return parseFloat((totalHours * newRate).toFixed(2));
        });

        const newSubtotal = totals.reduce((sum, total) => sum + total, 0);
        setSessionTotals(totals);
        if (onSubtotalChange) {
          onSubtotalChange(newSubtotal);
          setNewSubtotalValue(newSubtotal);
        }
      }
    };

    calculateSubtotal();

    if (comments && comments.length > 0) {
      setComments(comments);
      setBooking(bookings);
      setRoom(rooms);
    }
  }, [comments, bookings, rooms, adjustmentsByBooking]);

  // Handle adjustmentType change
  const handleAdjustmentChange = (index, value) => {
    const newComments = [...commentsState];
    newComments[index].adjustmentType = value;
    setComments(newComments);

    // Notify parent component
    if (onCommentsChange) {
      onCommentsChange(newComments);
    }
  };

  // Handle session total change
  const handleSessionTotalChange = (index, value) => {
    const newTotals = [...sessionTotals];

    // Update the session total based on the adjustment type
    if (commentsState[index].adjustmentType === "total") {
      newTotals[index] += parseFloat(value); // Set the total directly from the input
    } else if (commentsState[index].adjustmentType === "rate_flat") {
      room[0].rate = parseFloat(value);
    } else if (commentsState[index].adjustmentType === "rate_percent") {
      room[0].rate *= parseFloat(value) / 100;
    }
    setSessionTotals(newTotals);

    // Calculate new subtotal
    const newSubtotal = newTotals.reduce((sum, total) => sum + total, 0);
    if (onSubtotalChange) {
      onSubtotalChange(newSubtotal);
      setNewSubtotalValue(newSubtotal);
    }

    setInputValues((prev) => {
      const newValues = [...prev];
      newValues[index] = newTotals[index].toFixed(2);
      return newValues;
    });
  };

  const handleCommentsChange = (updatedComments) => {
    setComments(updatedComments);
    onCommentsChange(updatedComments);
    console.log(updatedComments);
  };
  console.log("Bookingsstate:", bookingState)
  return (
    <Flex
      direction="column"
      w="100%"
      minH="24"
      fontFamily="Inter"
      color="#2D3748"
    >
      <Heading
        mb="4"
        fontSize="1.2em"
      >
        Sessions
      </Heading>
      <Flex
        border="1px solid #D2D2D2"
        borderRadius="18px"
        minH="24"
        px="12px"
        position="relative"
      >
        <Box
          position="relative"
          overflowY="auto"
          p="4"
        >
          <Table
            color="#EDF2F7"
            textAlign="center"
            variant="simple"
            size="sm"
          >
            <Thead>
              <Tr color="#4A5568">
                <Th
                  fontSize="12px"
                  maxWidth="80px"
                >
                  <Flex align="center">
                    <Icon as={CalendarIcon} />
                    <Text marginLeft="4px" color="#718096">Date</Text>
                  </Flex>
                </Th>
                <Th
                  fontSize="12px"
                >
                  <Flex align="center">
                    <Icon as={LocationIcon} />
                    <Text marginLeft="4px" color="#718096">Classroom</Text>
                  </Flex>
                </Th>
                <Th
                  fontSize="12px"
                  maxWidth="100px"
                >
                  <Flex align="center">
                    <Icon as={ClockIcon} />
                    <Text marginLeft="4px" color="#718096">Rental Hours</Text>
                  </Flex>
                </Th>
                <Th
                  fontSize="12px"
                  whiteSpace="nowrap"
                >
                  <Flex align="center">
                    <Icon as={EditDocumentIcon} />
                    <Text marginLeft="4px" color="#718096">Room Fee Adjustment</Text>
                  </Flex>
                </Th>
                <Th
                  fontSize="12px"
                  whiteSpace="nowrap"
                  maxWidth="120px"
                >
                  <Flex align="center">
                    <Icon as={DollarSignIcon} />
                    <Text marginLeft="4px" color="#718096">Room Fee</Text>
                  </Flex>
                </Th>
                <Th
                  textAlign="end"
                  pr="85px"
                  fontSize="12px"
                  color="#718096"
                >
                  Total
                </Th>
              </Tr>
            </Thead>
            <Tbody color="#2D3748">
              {bookingState.length > 0 ? (
                bookingState
                  .map((booking, index) => {
                    const roomForBooking = rooms.find(r => r.id === booking.roomId);
                    return [
                    <Tr
                      key={`booking-${booking.id || "unknown"}-${index}`}
                      position="relative"
                      borderBottom={
                        expandedBookingIndex === index
                          ? "none" // No bottom border for the row with expanded comment
                          : hoveredIndex === index
                            ? "1.5px solid purple" // Apply purple bottom border when hovered
                            : "1px solid #e0e0e0" // Default bottom border
                      }
                      onMouseEnter={() => setRowHoveredIndex(index)} // When mouse enters, set hovered index
                      onMouseLeave={() => setRowHoveredIndex(null)}
                      borderTop="none"
                      border={activeRowId === booking.id ? "#718096" : "none"}
                      borderRadius="6px"
                    >
                      <Td
                        position="relative"
                        px={0}
                        pr={4}
                        borderBottom="none"
                        overflow="visible"
                      >
                        <VStack
                          position="absolute"
                          left="-30px"
                          zIndex="10"
                          top="50%"
                          transform="translateY(-60%)"
                          gap="-4"
                          opacity={rowHoveredIndex === index ? 1 : 0} // Control visibility based on hover
                          transition="opacity 0.3s ease" // Smooth transition for opacity change
                        >
                          <IconButton
                            aria-label="Plus Icon"
                            icon={
                              <Box
                                w="20px"
                                h="20px"
                                bgImage={`url(${plusIcon})`}
                                bgSize="contain"
                                bgRepeat="no-repeat"
                                bgPos="center"
                                zIndex="11"
                              />
                            }
                            colorScheme="purple"
                            size="xs"
                            borderRadius="full"
                            onMouseEnter={() => setHoveredIndex(index)} // When mouse enters, set hovered index
                            onMouseLeave={() => setHoveredIndex(null)} // When mouse leaves, reset hovered index
                            onClick={() => {
                              const newComment = {
                                adjustmentType: "paid",
                                adjustmentValue: "5",
                                bookingId: 955,
                                comment: "ADDED COMMENT (ALL DUMMY VALUES)",
                                datetime: "2025-02-01T23:15:25.877Z",
                                invoiceId: 22,
                                userId: 48,
                              };

                              handleCommentsChange([
                                ...commentsState,
                                newComment,
                              ]);
                            }}
                          />
                          <IconButton
                            icon={
                              <Box
                                w="60px" // Customize size of the icon
                                h="60px" // Customize size of the icon
                                bgImage={`url(${commentsIcon})`}
                                bgSize="contain"
                                bgRepeat="no-repeat"
                                bgPos="center"
                              />
                            }
                            variant="unstyled" // No surrounding button appearance
                            size="xs" // Optional: Adjust this based on the overall size
                            p={0} // Remove padding around the icon
                            isRound // Makes the button round (optional)
                            aria-label="Icon only" // Ensures accessibility
                            onClick={() => handleCommentToggle(index)} // Toggle comment visibility
                          />
                        </VStack>
                        <Text
                          fontSize="14px"
                          ml="6"
                          whiteSpace="nowrap"
                          color="#2D3748"
                        >
                          {format(new Date(booking.date), "EEE.")} {format(new Date(booking.date), "M/d/yyyy")}
                        </Text>
                      </Td>
                      <Td
                        fontSize="clamp(.5rem, 1rem, 1.5rem)"
                        borderBottom="none"
                      >
                        <Text fontSize="14px">
                          {roomForBooking && rooms.length > 0 ? `${roomForBooking.name}` : "N/A"}
                        </Text>
                      </Td>
                      {/* Rest of the row content remains the same */}
                      <Td
                        fontSize="clamp(.5rem, 1rem, 1.5rem)"
                        borderBottom="none"
                      >
                        <Flex
                          align="center"
                          gap="2"
                        >
                          <Text
                            whiteSpace="nowrap"
                            fontSize="14px"
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
                                    return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
                                  };

                                  return `${formatTime(startTime)}`;
                                })()
                              : "N/A"}
                          </Text>
                          <Text fontSize="14px">-</Text>
                          <Text
                            whiteSpace="nowrap"
                            fontSize="14px"
                          >
                            {booking.endTime
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
                                    return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
                                  };

                                  return `${formatTime(endTime)}`;
                                })()
                              : "N/A"}
                          </Text>
                        </Flex>
                      </Td>
                      <Td borderBottom="none">
                        <Flex align="center" gap={2}>
                          <Button
                            leftIcon={<Icon as={PencilIcon}/>}
                            color="white"
                            background="#4441C8"
                            borderRadius="md"
                            px="3"
                            py="2"
                            fontSize="small"
                            height="32px"
                            opacity={activeRowId === null || activeRowId === booking.id ? 1 : 0.3}
                            onClick={() => setActiveRowId(booking.id)}
                            isDisabled={activeRowId !== null && activeRowId !== booking.id}
                            _hover={{ bg:"#312E8A"}}
                          >
                            Adjust
                          </Button>

                          {adjustmentsByBooking[booking.id] && adjustmentsByBooking[booking.id].length > 0 ? (
                            <Tooltip
                              label={adjustmentsByBooking[booking.id].map(adj => {
                                const sign = adj.isNegative ? "-" : "+";
                                return `${sign}${adj.type === "dollar" ? "$" + adj.value : adj.value + "%"}`;
                              }).join(", ")}
                            >
                              <Text
                                whiteSpace="nowrap"
                                overflow="hidden"
                                textOverflow="ellipsis"
                                maxW="120px"
                              >
                                {adjustmentsByBooking[booking.id].map(adj => {
                                  const sign = adj.isNegative ? "-" : "+";
                                  return `${sign}${adj.type === "dollar" ? "$" + adj.value : adj.value + "%"}`;
                                }).join(", ")}
                              </Text>
                            </Tooltip>
                          ) : (
                            <Text></Text>
                          )}
                        </Flex>
                        <RoomFeeAdjustmentSideBar
                          isOpen={activeRowId === booking.id}
                          onClose={() => setActiveRowId(null)}
                          invoice={invoice[0]}
                          booking={booking}
                          room={roomForBooking}
                          userId={userId}
                          addAdjustment={(type) => addAdjustment(type, booking.id)}
                          adjustments={adjustmentsByBooking[booking.id] || []}
                          setAdjustments={(newAdjustments) => {
                            setAdjustmentsByBooking(prev => ({
                              ...prev,
                              [booking.id]: newAdjustments
                            }));
                          }}
                          onApplyAdjustments={(bookingId, adjustments) => {
                            setAdjustmentsByBooking(prev => ({
                              ...prev,
                              [bookingId]: adjustments
                            }));
                          }}
                        />
                      </Td>
                      <Td
                        borderBottom="none"
                      >
                        <Flex
                          align="center"
                        >
                          <Text
                            fontSize="14"
                          >
                            {roomForBooking && rooms.length > 0
                              ? `$${getAdjustedRate(booking.id).toFixed(2)}/hr`
                              : "N/A"}
                          </Text>
                        </Flex>
                      </Td>
                      <Td
                        fontSize="clamp(.5rem, 1rem, 1.5rem)"
                        textAlign="center"
                        borderBottom="none"
                      >
                        <Flex
                          justifyContent="center"
                          alignItems="center"
                          gap="2"
                        >
                          <Text fontSize="14px">$</Text>
                          <Input
                            w="80px"
                            textAlign="center"
                            fontSize="14px"
                            value={
                              inputValues[index] ||
                              sessionTotals[index]?.toFixed(2) ||
                              "0.00"
                            } // Use local state value
                            onChange={(e) => {
                              setInputValues((prev) => {
                                const newValues = [...prev];
                                newValues[index] = e.target.value; // Update local state
                                return newValues;
                              });
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleSessionTotalChange(
                                  index,
                                  inputValues[index]
                                ); // Call function on Enter
                              }
                            }}
                          />
                        </Flex>
                      </Td>
                    </Tr>,
                    expandedBookingIndex === index && (
                      <Tr
                        key={`booking-text-expanded-${booking.id || "unknown"}-${index}`}
                        borderBottom={
                          hoveredIndex === index
                            ? "1px solid purple"
                            : "1px solid rgb(240, 240, 240)"
                        } // Add bottom border to the expanded booking
                      >
                        <Td
                          colSpan={6}
                          textAlign="left"
                          py={2}
                          borderTop="none"
                          borderBottom="none"
                        >
                          <Text
                            fontSize="14px"
                            fontStyle="italic"
                            fontWeight="500"
                          >
                            {comment.comment || "No comment available"}
                          </Text>
                        </Td>
                      </Tr>
                    )
                  ];
                })
                  .flat()
              ) : (
                <Tr>
                  <Td
                    colSpan={7}
                    textAlign="center"
                  >
                    No sessions for this month.
                  </Td>
                </Tr>
              )}

            <Tr>
              <Td
                py="4" // smaller padding
                textAlign="right"
                colSpan={5}
                fontSize="14px"
              >
                <Text
                  fontWeight="bold"
                  color="gray.500"
                  textTransform="uppercase"
                  letterSpacing="wider"
                >
                  Subtotal
                </Text>
              </Td>
              <Td
                py="4"
                textAlign="right"
              >
                <Text
                  fontWeight="700"
                  fontSize="24px"
                  color="gray.800"
                  fontFamily="Inter"
                >
                  {`$${newSubtotalValue?.toFixed(2)}`}
                </Text>
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
}) => {
  const pastDueValue = pastDue;
  const [subtotalValue, setSubtotalValue] = useState(subtotal);
  const [pendingSubtotalValue, setPendingSubtotalValue] = useState(
    subtotal.toFixed(2)
  );
  const [adjustmentType, setAdjustmentType] = useState("");

  useEffect(() => {
    setSubtotalValue(subtotal);
    setPendingSubtotalValue(subtotal.toFixed(2));
  }, [subtotal]);

  const totalAmountDue = pastDueValue + subtotalValue;

  const handleSubtotalChange = (e) => {
    setPendingSubtotalValue(e.target.value);
  };

  const handleSubtotalSubmit = (e) => {
    if (e.key === "Enter") {
      const value = parseFloat(pendingSubtotalValue);
      if (!isNaN(value)) {
        if (adjustmentType === "total") {
          setSubtotalValue((prevValue) => {
            const newSubtotal = prevValue + value;
            if (onSubtotalChange) {
              onSubtotalChange(newSubtotal);
            }
            return newSubtotal;
          });
        } else if (adjustmentType === "rate_flat") {
          const updatedRoom = room.map((r, index) =>
            index === 0 ? { ...r, rate: value } : r
          );
          setRoom(updatedRoom);
        } else if (adjustmentType === "rate_percent") {
          const updatedRoom = room.map((r, index) =>
            index === 0 ? { ...r, rate: r.rate * (value / 100) } : r
          );
          setRoom(updatedRoom);
        }
      }
    }
  };


  return (
    <Box
      mt={8}
      color="#2D3748"
    >
      <VStack
        align="stretch"
        spacing={4}
      >
        <Text
          fontSize="xl"
          fontWeight="bold"
          mr={80}
        >
          Summary
        </Text>
        <Flex
          border="1px solid #D2D2D2"
          borderRadius="18px"
          minH="24"
        >
          <Box
            position="relative"
            maxH="400px"
            overflowY="auto"
            p="3"
          >
            <Table>
              <Thead color="#4A5568">
                <Tr>
                  <Th
                    fontSize="14px"
                    textTransform="none"
                  >
                    Description
                  </Th>
                  <Th
                    fontSize="14px"
                    textTransform="none"
                    pl="8"
                  >
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
                  <Td
                    fontSize="14px"
                    border="none"
                  >
                    Past Due Balance
                  </Td>
                  <Td border={"none"}></Td>
                  <Td border="none">
                    <Flex
                      alignItems="center"
                      justifyContent="end"
                    >
                      <Text
                        mr={1}
                        fontSize="14px"
                      >
                        ${pastDueValue.toFixed(2)}
                      </Text>
                    </Flex>
                  </Td>
                </Tr>
                <Tr
                  borderBottom="1px solid"
                  borderColor="gray.200"
                >
                  <Td colSpan="1">
                    <Text
                      fontWeight="bold"
                      color="gray.700"
                    >
                      Waiting for remaining payments from November and December
                    </Text>
                  </Td>
                </Tr>
                <Tr>
                  <Td fontSize="14px">Current Statement Subtotal</Td>
                  <Td>
                    <RadioDropdownSummary
                      adjustmentType={adjustmentType}
                      setAdjustmentType={setAdjustmentType}
                    />
                  </Td>
                  <Td>
                    <Flex
                      alignItems="center"
                      justifyContent="end"
                    >
                      <Text
                        mr={1}
                        fontSize="14px"
                      >
                        $
                      </Text>
                      <Input
                        type="number"
                        textAlign="center"
                        px="0"
                        fontSize="14px"
                        value={pendingSubtotalValue}
                        width={`${pendingSubtotalValue.length + 1}ch`}
                        onChange={handleSubtotalChange}
                        onKeyDown={handleSubtotalSubmit} // Listen for Enter key
                      />
                    </Flex>
                  </Td>
                </Tr>
                <Tr>
                  <Td
                    textAlign="end"
                    colSpan="2"
                    fontSize="16px"
                    fontWeight="700"
                  >
                    Total Amount Due
                  </Td>
                  <Td>
                    <Flex
                      alignItems="center"
                      justifyContent="end"
                    >
                      <Text
                        mr={1}
                        fontSize="14px"
                      >
                        $
                      </Text>
                      <Text
                        textAlign="center"
                        p="2"
                        fontSize="14px"
                        borderRadius="md"
                        width={`${totalAmountDue.toFixed(2).length + 3}ch`}
                      >
                        {totalAmountDue.toFixed(2)}
                      </Text>
                    </Flex>
                  </Td>
                </Tr>
              </Tbody>
            </Table>
          </Box>
        </Flex>
      </VStack>
    </Box>
  );
};

const FooterDescription = ({compactView = false}) => {
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

const RadioDropdown = ({
  onSelectionChange,
  index,
  commentsState,
  setComments,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const menuRef = useRef(null);

  const options = [
    { id: "rate_percent", label: "Room fee %" },
    { id: "rate_flat", label: "Room fee $" },
    { id: "total", label: "Manual Calculation" },
  ];

  const handleOptionChange = (optionId) => {
    setSelectedOption(optionId);

    if (onSelectionChange) {
      onSelectionChange(optionId);
    }

    setIsOpen(false);
  };

  // Display selected option in button
  const getButtonText = () => {
    if (!selectedOption) return "Click to select";
    const selected = options.find((option) => option.id === selectedOption);
    return selected ? selected.label : "Click to select";
  };

  // Close the menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAdjustmentChange = (index, value) => {
    const newComments = [...commentsState];
    newComments[index].adjustmentType = value;
    setComments(newComments);
  };

  return (
    <Box
      position="relative"
      ref={menuRef}
    >
      <Button
        onClick={() => setIsOpen(!isOpen)}
        rightIcon={<ChevronDownIcon />}
        w="100%"
        h="50px"
        bg="white"
        color="#718096"
        size="sm"
        border="2px solid #E2E8F0"
        borderRadius="md"
        justifyContent="space-between"
        fontWeight="normal"
        textAlign="left"
        _hover={{ bg: "white" }}
        _active={{ bg: "white" }}
      >
        {getButtonText()}
      </Button>

      {isOpen && (
        <Box
          position="absolute"
          top="calc(100% + 5px)"
          left="0"
          width="100%"
          bg="white"
          boxShadow="md"
          borderRadius="md"
          zIndex="dropdown"
          p={2}
          border="1px solid #E2E8F0"
        >
          <RadioGroup
            value={selectedOption}
            onChange={handleOptionChange}
          >
            {options.map((option) => (
              <Flex
                key={option.id}
                py={2}
                px={3}
                alignItems="center"
                _hover={{ bg: "#F7FAFC" }}
                borderRadius="md"
                cursor="pointer"
                onClick={() => handleAdjustmentChange(index, option.id)}
              >
                <Radio
                  value={option.id}
                  colorScheme="blue"
                  mr={3}
                  size="md"
                >
                  <Text
                    fontSize="xs"
                    color="#2D3748"
                  >
                    {option.label}
                  </Text>
                </Radio>
              </Flex>
            ))}
          </RadioGroup>
        </Box>
      )}
    </Box>
  );
};

const RadioDropdownSummary = ({ adjustmentType, setAdjustmentType }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const menuRef = useRef(null);

  const options = [
    { id: "rate_percent", label: "Room fee %" },
    { id: "rate_flat", label: "Room fee $" },
    { id: "total", label: "Manual Calculation" },
  ];

  const handleOptionChange = (optionId) => {
    setSelectedOption(optionId);
    setAdjustmentType(optionId);
    console.log("optionId", optionId);
    setIsOpen(false);
  };

  // Display selected option in button
  const getButtonText = () => {
    if (!selectedOption) return "Click to select";
    const selected = options.find((option) => option.id === selectedOption);
    return selected ? selected.label : "Click to select";
  };

  // Close the menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <Box
      position="relative"
      ref={menuRef}
    >
      <Button
        onClick={() => setIsOpen(!isOpen)}
        rightIcon={<ChevronDownIcon />}
        w="100%"
        h="50px"
        bg="white"
        color="#718096"
        size="sm"
        border="2px solid #E2E8F0"
        borderRadius="md"
        justifyContent="space-between"
        fontWeight="normal"
        textAlign="left"
        _hover={{ bg: "white" }}
        _active={{ bg: "white" }}
      >
        {getButtonText()}
      </Button>

      {isOpen && (
        <Box
          position="absolute"
          top="calc(100% + 5px)"
          left="0"
          width="100%"
          bg="white"
          boxShadow="md"
          borderRadius="md"
          zIndex="dropdown"
          p={2}
          border="1px solid #E2E8F0"
        >
          <RadioGroup
            value={selectedOption}
            onChange={handleOptionChange}
          >
            {options.map((option) => (
              <Flex
                key={option.id}
                py={2}
                px={3}
                alignItems="center"
                _hover={{ bg: "#F7FAFC" }}
                borderRadius="md"
                cursor="pointer"
              >
                <Radio
                  value={option.id}
                  colorScheme="blue"
                  mr={3}
                  size="md"
                >
                  <Text
                    fontSize="xs"
                    color="#2D3748"
                  >
                    {option.label}
                  </Text>
                </Radio>
              </Flex>
            ))}
          </RadioGroup>
        </Box>
      )}
    </Box>
  );
};
export {
  StatementComments,
  EditInvoiceTitle,
  EditInvoiceDetails,
  InvoiceSummary,
  FooterDescription,
  RadioDropdown,
};
