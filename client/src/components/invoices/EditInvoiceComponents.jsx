import React, { useEffect, useRef, useState } from "react";

import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  IconButton,
  Image,
  Input,
  Link,
  Radio,
  RadioGroup,
  Select,
  SimpleGrid,
  Stack,
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

import commentsIcon from "../../assets/icons/comments.svg";
import plusIcon from "../../assets/icons/plus.svg";
import logo from "../../assets/logo/logo.png";

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

const EditInvoiceTitle = ({ comments, invoice }) => {
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
          fontSize="23.932px"
        >
          INVOICE
        </Heading>
        <Text
          color="#718096"
          fontSize="8.509px"
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
          <Text fontSize="8.509px">La Peña Cultural Center</Text>
          <Text fontSize="8.509px">3105 Shattuck Ave., Berkeley, CA 94705</Text>
          <Text fontSize="8.509px">lapena.org</Text>
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
          fontSize="13.827px"
          fontWeight={"600"}
        >
          Classroom Rental Monthly Statement
        </Heading>
        <Heading
          fontSize={"8.509px"}
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
            fontSize={"8.509px"}
            fontWeight="500"
            color={"#718096"}
            margin={"0 0"}
            padding={0}
          >
            Recurring Program:
          </Text>
          <Text fontSize={"8.509px"}>
            {programName || "No program name found"}
          </Text>
          <VStack
            align="stretch"
            flex={1}
            maxH="120px"
            overflowY="auto"
          >
            <Text
              fontSize={"8.509px"}
              fontWeight="500"
              color={"#718096"}
            >
              Designated Payer(s):
            </Text>
            {payees && payees.length > 0 ? (
              payees.map((payee, index) => (
                <Text
                  key={index}
                  fontSize={"8.509px"}
                  mr={2}
                  borderRadius="0"
                >
                  {payee.name} - {payee.email}
                </Text>
              ))
            ) : (
              <Text>No payees found.</Text>
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
              fontSize={"8.509px"}
              fontWeight="500"
              color={"#718096"}
            >
              Lead Artist(s):
            </Text>
            {instructors && instructors.length > 0 ? (
              instructors.map((instructor, index) => (
                <HStack key={index}>
                  <Text
                    fontSize={"8.509px"}
                    mr={2}
                  >
                    {instructor.name} - {instructor.email}
                  </Text>
                </HStack>
              ))
            ) : (
              <Text>No instructors found.</Text>
            )}
          </VStack>
        </HStack>
      </SimpleGrid>
    </VStack>
  );
};

const StatementComments = ({
  comments = [],
  booking = [],
  room = [],
  subtotal = 0.0,
  onCommentsChange,
  onSubtotalChange,
}) => {
  const [commentsState, setComments] = useState(comments);
  const [bookingState, setBooking] = useState(booking);
  const [roomState, setRoom] = useState(room);
  const [sessionTotals, setSessionTotals] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [expandedCommentIndex, setExpandedCommentIndex] = useState(null); // Track which row is expanded
  const [rowHoveredIndex, setRowHoveredIndex] = useState(null);
  const [newSubtotalValue, setNewSubtotalValue] = useState(0);
  const [inputValues, setInputValues] = useState(
    Array(comments.length).fill("")
  ); // Initialize local state for input values

  const handleCommentToggle = (index) => {
    setExpandedCommentIndex(expandedCommentIndex === index ? null : index);
  };

  useEffect(() => {
    // Calculate subtotal on initial load
    const calculateSubtotal = () => {
      if (
        comments &&
        comments.length > 0 &&
        booking &&
        room &&
        room.length > 0
      ) {
        const totals = comments.map(() => {
          if (!booking.startTime || !booking.endTime) return 0;

          const timeToMinutes = (timeStr) => {
            const [hours, minutes] = timeStr.split(":").map(Number);
            return hours * 60 + minutes;
          };

          const startMinutes = timeToMinutes(booking.startTime.substring(0, 5));
          const endMinutes = timeToMinutes(booking.endTime.substring(0, 5));
          const diff = endMinutes - startMinutes;
          const totalHours = Math.ceil(diff / 60);

          return parseFloat((totalHours * room[0]?.rate).toFixed(2));
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
      setBooking(booking);
      setRoom(room);
    }
  }, [comments, booking, room]);

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

  return (
    <Flex
      direction="column"
      w="100%"
      minH="24"
      fontFamily="Inter"
      color="#2D3748"
    >
      <Heading
        fontSize="1.2em"
        mb="4"
      >
        Sessions
      </Heading>
      <Flex
        border="1px solid #D2D2D2"
        borderRadius="18px"
        minH="24"
        px="12px"
      >
        <Box
          position="relative"
          maxH="400px"
          overflowY="auto"
          p="3"
        >
          <Table
            color="#EDF2F7"
            style={{ width: "100%" }}
            textAlign="center"
          >
            <Thead>
              <Tr color="#4A5568">
                <Th
                  textTransform="none"
                  fontSize="14px"
                >
                  Date
                </Th>
                <Th
                  textTransform="none"
                  fontSize="14px"
                >
                  Classroom
                </Th>
                <Th
                  textTransform="none"
                  fontSize="14px"
                >
                  Rental Hours
                </Th>
                <Th
                  textTransform="none"
                  fontSize="14px"
                >
                  Room Fee
                </Th>
                <Th
                  textTransform="none"
                  fontSize="14px"
                >
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
              {commentsState.length > 0 ? (
                commentsState
                  .map((comment, index) => [
                    <Tr
                      key={`comment-${comment.id || "unknown"}-${index}`}
                      position="relative"
                      borderBottom={
                        expandedCommentIndex === index
                          ? "none" // No bottom border for the row with expanded comment
                          : hoveredIndex === index
                            ? "1.5px solid purple" // Apply purple bottom border when hovered
                            : "1px solid #e0e0e0" // Default bottom border
                      }
                      onMouseEnter={() => setRowHoveredIndex(index)} // When mouse enters, set hovered index
                      onMouseLeave={() => setRowHoveredIndex(null)}
                      borderTop="none"
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
                          width="100px"
                          fontSize="14px"
                          ml="6"
                        >
                          {format(new Date(comment.datetime), "M/d/yy")}
                        </Text>
                      </Td>
                      <Td
                        fontSize="clamp(.5rem, 1rem, 1.5rem)"
                        borderBottom="none"
                      >
                        <Text fontSize="14px">
                          {room && room.length > 0 ? `${room[0].name}` : "N/A"}
                        </Text>
                      </Td>
                      {/* Rest of the row content remains the same */}
                      <Td
                        fontSize="clamp(.5rem, 1rem, 1.5rem)"
                        borderBottom="none"
                      >
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
                                    return `${hour12}:${minutes.toString().padStart(2, "0")}${period}`;
                                  };

                                  return `${formatTime(endTime)}`;
                                })()
                              : "N/A"}
                          </Text>
                        </Flex>
                      </Td>
                      <Td
                        fontSize="clamp(.5rem, 1rem, 1.5rem)"
                        borderBottom="none"
                      >
                        <Flex
                          align="center"
                          gap="1"
                        >
                          <Text
                            fontSize="14"
                            w="95px"
                          >
                            {room && room.length > 0
                              ? `$${room[0].rate}`
                              : "N/A"}
                          </Text>
                          <Text fontSize="14px">/hr</Text>
                        </Flex>
                      </Td>
                      <Td
                        fontSize="clamp(.5rem, 1rem, 1.5rem)"
                        borderBottom="none"
                      >
                        <RadioDropdown
                          index={index}
                          onSelectionChange={(value) => {
                            handleAdjustmentChange(index, value);
                          }}
                          commentsState={commentsState}
                          setComments={setComments}
                        />
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
                            w="85px"
                            px="2"
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
                    expandedCommentIndex === index && (
                      <Tr
                        key={`comment-text-expanded-${comment.id || "unknown"}-${index}`}
                        borderBottom={
                          hoveredIndex === index
                            ? "1px solid purple"
                            : "1px solid rgb(240, 240, 240)"
                        } // Add bottom border to the expanded comment
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
                    ),
                  ])
                  .flat()
              ) : (
                <Tr>
                  <Td
                    colSpan={7}
                    textAlign="center"
                  >
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
                  fontSize="clamp(.5rem, 1rem, 1.5rem)"
                  py="8"
                  textAlign="right"
                >
                  <Text textAlign="center">{`$ ${newSubtotalValue?.toFixed(2)}`}</Text>
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

const FooterDescription = () => {
  return (
    <Flex
      mt="24"
      justifyContent="space-between"
      color="black"
    >
      <VStack
        pt={3}
        pb={2}
        spacing={0}
        align="start"
        mb={10}
      >
        <Text
          fontWeight="bold"
          fontSize="16px"
        >
          Payments are due at the end of each month.
        </Text>
        <Text
          fontWeight="bold"
          fontSize="16px"
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
      <VStack align="start">
        <Text
          fontSize="16px"
          maxWidth="300px"
          fontWeight="bold"
        >
          For any questions,
        </Text>
        <Text
          fontSize="16px"
          maxWidth="300px"
          fontWeight="bold"
        >
          please contact:{" "}
          <Link
            href="mailto:classes@lapena.org"
            style={{ textDecoration: "underline" }}
            color="blue.500"
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

    // // Notify parent component
    // if (onCommentsChange) {
    //   onCommentsChange(newComments);
    // }
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
