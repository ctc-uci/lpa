import React, { useEffect, useState } from "react";

import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Image,
  Input,
  Link,
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
import logo from "../../assets/logo/logo.png";

const EditInvoiceTitle = ({comments, invoice}) => {
  
  const getGeneratedDate = () => {
    if (comments.length > 0) {
      const latestComment = comments
        .sort((a, b) => new Date(b.datetime) - new Date(a.datetime))[0];
      
      const latestDate = new Date(latestComment.datetime);
      const month = latestDate.toLocaleString('default', { month: 'long' });
      const day = latestDate.getDate();
      const year = latestDate.getFullYear();
      
      return `${month} ${day}, ${year}`;
    } else if (invoice) {
      return invoice['startDate'];
    } else {
      return "No Date Found";
    }
  };

  return (
    <Flex
      justifyContent="space-between"
      my="8"
      mx="4"
      fontFamily="Inter"
      color="#2D3748"
    >
      <Stack>
        <Heading
          color="#2D3748"
          fontWeight="600"
          fontSize="45px"
        >
          INVOICE
        </Heading>
        <Text
          color="#718096"
          fontSize="16px"
        >
          {getGeneratedDate()}
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
          <Text fontSize="16px">La Peña Cultural Center</Text>
          <Text fontSize="16px">3105 Shattuck Ave., Berkeley, CA 94705</Text>
          <Text fontSize="16px">lapena.org</Text>
        </VStack>
        <Image
          src={logo}
          alt="La Peña Logo"
          w="125px"
        />
      </Flex>
    </Flex>
  );
};

const EditInvoiceDetails = ({ instructors, programName, payees, comments, invoice }) => {


  const getGeneratedDate = () => {
    if (comments.length > 0) {
      const latestComment = comments
        .sort((a, b) => new Date(b.datetime) - new Date(a.datetime))[0];
  
      // Extract month, day, and year from the latest comment
      const latestDate = new Date(latestComment.datetime);
      const month = latestDate.toLocaleString('default', { month: 'long' });
      const year = latestDate.getFullYear();
  
      return `${month} ${year}`
    } else if (invoice) {
      return invoice['startDate'];
    } else {
      return "No Date Found";
    }
  };

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
          size="lg"
        >
          Classroom Rental Monthly Statement
        </Heading>
        <Heading
          size="sm"
          textAlign="center"
          color="#2D3748"
          fontWeight='500'
        >
          {getGeneratedDate()}
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
          <Text fontWeight="bold">Recurring Program:</Text>
          <Text size="sm">{programName || "No program name found"}</Text>
          <VStack
            align="stretch"
            flex={1}
            maxH="120px"
            overflowY="auto"
          >
            <Text fontWeight="bold">Designated Payers:</Text>
            {payees && payees.length > 0 ? (
              payees.map((payee, index) => (
                <Text
                  key={index}
                  size="md"
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
            <Text fontWeight="bold">Lead Artist(s):</Text>

            {instructors && instructors.length > 0 ? (
              instructors.map((instructor, index) => (
                <HStack key={index}>
                  <Text
                    size="sm"
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
  onSubtotalChange
}) => {
  const [commentsState, setComments] = useState(comments);
  const [bookingState, setBooking] = useState(booking);
  const [roomState, setRoom] = useState(room);
  const [sessionTotals, setSessionTotals] = useState([]);

  useEffect(() => {
    if (comments && comments.length > 0) {
      setComments(comments);
      setBooking(booking);
      setRoom(room);
      
      // Calculate individual session totals
      if (booking && room && room.length > 0) {
        const totals = comments.map(comment => {
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
        
        setSessionTotals(totals);
        
        // Calculate new subtotal based on session totals
        const newSubtotal = totals.reduce((sum, total) => sum + total, 0);
        if (onSubtotalChange && newSubtotal !== subtotal) {
          onSubtotalChange(newSubtotal);
        }
      }
    }
  }, [comments, booking, room, onSubtotalChange, subtotal]);

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
    newTotals[index] = parseFloat(value);
    setSessionTotals(newTotals);
    
    // Calculate new subtotal
    const newSubtotal = newTotals.reduce((sum, total) => sum + total, 0);
    if (onSubtotalChange) {
      onSubtotalChange(newSubtotal);
    }
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
        fontSize="22px"
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
              commentsState.map((comment, index) => {
                return (
                  <Tr key={`comment-${comment.id || "unknown"}-${index}`}>
                    <Td fontSize="clamp(.5rem, 1rem, 1.5rem)">
                      <Text
                        width="100px"
                        fontSize="14px"
                      >
                        {format(new Date(comment.datetime), "M/d/yy")}
                      </Text>
                    </Td>
                    <Td fontSize="clamp(.5rem, 1rem, 1.5rem)">
                      <Text fontSize="14px">
                        {room && room.length > 0 ? `${room[0].name}` : "N/A"}
                      </Text>
                    </Td>
                    <Td fontSize="clamp(.5rem, 1rem, 1.5rem)">
                      <Flex
                        align="center"
                        justifyContent="space-evenly"
                        gap="2"
                      >
                        <Input
                          w="85px"
                          px="2"
                          textAlign="center"
                          fontSize="14px"
                          value={
                            booking.startTime
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
                              : "N/A"
                          }
                        />
                        <Text fontSize="14px">to</Text>
                        <Input
                          w="85px"
                          px="2"
                          fontSize="14px"
                          textAlign="center"
                          value={
                            booking.startTime
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
                              : "N/A"
                          }
                        />
                      </Flex>
                    </Td>
                    <Td fontSize="clamp(.5rem, 1rem, 1.5rem)">
                      <Flex
                        align="center"
                        gap="1"
                      >
                        <Input
                          w="95px"
                          fontSize="14px"
                          value={
                            room && room.length > 0 ? `$${room[0].rate}` : "N/A"
                          }
                        />
                        <Text fontSize="14px">/hr</Text>
                      </Flex>
                    </Td>
                    <Td fontSize="clamp(.5rem, 1rem, 1.5rem)">
                      <Select 
                        h="40px"
                        value={(commentsState[index] && commentsState[index].adjustmentType) || ""}
                        onChange={(e) => handleAdjustmentChange(index, e.target.value)}
                        placeholder="Click to Select"
                        borderRadius="4px"
                        fontSize="14px"
                      >
                        <option value="rate_flat">Rate Flat</option>
                        <option value="paid">Paid</option>
                      </Select>
                    </Td>
                    <Td
                      fontSize="clamp(.5rem, 1rem, 1.5rem)"
                      textAlign="center"
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
                            sessionTotals[index] ? sessionTotals[index].toFixed(2) :
                            booking.startTime && booking.endTime
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
                              : "0.00"
                          }
                          onChange={(e) => handleSessionTotalChange(index, e.target.value)}
                        />
                      </Flex>
                    </Td>
                  </Tr>
                );
              })
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
                fontSize='16px'
              >
                <Text fontWeight="bold">Subtotal</Text>
              </Td>
              <Td
                fontSize="clamp(.5rem, 1rem, 1.5rem)"
                py="8"
                textAlign="right"
              >
                <Text textAlign="center">{`$ ${subtotal?.toFixed(2)}`}</Text>
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </Flex>
    </Flex>
  );
};

const InvoiceSummary = ({ pastDue, subtotal, onSubtotalChange }) => {
  const pastDueValue = pastDue;
  const [subtotalValue, setSubtotalValue] = useState(subtotal);
  
  
  useEffect(() => {
    setSubtotalValue(subtotal);
  }, [subtotal]);
  
  const handleSubtotalChange = (e) => {
    const newValue = parseFloat(e.target.value);
    setSubtotalValue(newValue);
    if (onSubtotalChange) {
      onSubtotalChange(newValue);
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
          <Table>
            <Thead
              color="#4A5568"
            >
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
                  pl='8'
                >
                  Adjustment Type(s)
                </Th>
                <Th
                  fontSize="14px"
                  textTransform="none"
                  textAlign='end'
                  pr='14'
                >
                  Total
                </Th>
              </Tr>
            </Thead>
            <Tbody color="#2D3748">
              <Tr >
                <Td fontSize="14px" border="none">Past Due Balance</Td>
                <Td border="none">
                  <Select placeholder="Click to select" fontSize="14px" isReadOnly>
                    {/* <option value=""></option> */}
                  </Select>
                </Td>
                <Td border="none">
                  <Flex alignItems="center" justifyContent='end'>
                    <Text mr={1} fontSize="14px">$</Text>
                    <Input textAlign='center' p='0' fontSize="14px" value={pastDueValue.toFixed(2)} width={`${pastDueValue.toFixed(2).length + 1}ch`}/>
                  </Flex>
                </Td>
              </Tr>
              <Tr borderBottom="1px solid" borderColor="gray.200">
                <Td colSpan='1'>
                <Text fontWeight="bold" color="gray.700">
                  Waiting for remaining payments from November and December
                </Text>
                </Td>
              </Tr>
              <Tr>
                <Td fontSize="14px">Current Statement Subtotal</Td>
                <Td>
                  <Select placeholder="Click to select" fontSize="14px"> 
                    {/* <option value=""></option> */}
                  </Select>
                </Td>
                <Td>
                  <Flex alignItems="center" justifyContent='end'>
                    <Text mr={1} fontSize="14px">$</Text>
                    <Input 
                      type="number" 
                      textAlign="center" 
                      px='0' 
                      fontSize="14px" 
                      value={subtotalValue.toFixed(2)} 
                      width={`${subtotalValue.toFixed(2).length + 1}ch`}
                      onChange={handleSubtotalChange}
                    />
                  </Flex>
                </Td>
              </Tr>
              <Tr>
                <Td textAlign='end' colSpan='2' fontSize='16px' fontWeight='700'>Total Amount Due</Td>
                <Td>
                  <Flex alignItems="center" justifyContent='end'>
                    <Text mr={1} fontSize="14px">$</Text>
                    <Input 
                      type="number" 
                      textAlign="center"  
                      fontWeight='700' 
                      px='0' 
                      color='#474849' 
                      fontSize="24px" 
                      width={`${(subtotalValue + pastDueValue).toFixed(2).length + 1}ch`} 
                      value={(subtotalValue + pastDueValue).toFixed(2)} 
                      readOnly
                    />
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

const FooterDescription = () => {
  return (
    <Flex
          mt='24'
          justifyContent="space-between"
          color="black"
        >
          <VStack
            pt={3}
            pb={2}
            spacing={0}
            align="start"
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
}

export {
  StatementComments,
  EditInvoiceTitle,
  EditInvoiceDetails,
  InvoiceSummary,
  FooterDescription
};