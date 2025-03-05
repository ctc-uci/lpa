import React, { useState } from "react";

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
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";

import logo from "../../assets/logo/logo.png";

const EditInvoiceTitle = () => {
  return (
    <Flex
      justifyContent="space-between"
      my="8"
      mx="8"
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
          Generated on 10/25/2025
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

const EditInvoiceDetails = ({ instructors, programName, payees }) => {
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
        >
          October 2025
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
          <Text size="sm">programName</Text>
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
                <HStack>
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
}) => {
  // console.log("COMMENTS",comments)
  //   console.log("BOOKING",booking)
  // console.log("ROOM",room)

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
        px='12px'
      >
        <Table
          color="#EDF2F7"
          style={{ width: "100%" }}
          textAlign="center"
        >
          <Thead>
            <Tr
              color="#4A5568"
            >
              <Th
                textTransform="none"
              >
                Date
              </Th>
              <Th
                textTransform="none"
              >
                Classroom
              </Th>
              <Th
                textTransform="none"
              >
                Rental Hours
              </Th>
              <Th
                textTransform="none"
              >
                Room Fee
              </Th>
              <Th
                textTransform="none"
              >
                Adjustment Type(s)
              </Th>
              <Th
                textTransform="none"
                textAlign='end'
                pr='40px'
              >
                Total
              </Th>
            </Tr>
          </Thead>
          <Tbody color="#2D3748">
            {comments.length > 0 ? (
              comments.map((comment, index) => {
                return (
                  <Tr key={`comment-${comment.id || "unknown"}-${index}`}>
                    <Td
                      fontSize="clamp(.5rem, 1rem, 1.5rem)"
                    >
                      <Text
                        size="sm"
                        width="100px"
                      >{format(new Date(comment.datetime), "M/d/yy")}</Text>
                    </Td>
                    <Td
                      fontSize="clamp(.5rem, 1rem, 1.5rem)"
                    >
                      <Text>
                        {room && room.length > 0 ? `${room[0].name}` : "N/A"}
                      </Text>
                    </Td>
                    <Td
                      fontSize="clamp(.5rem, 1rem, 1.5rem)" 
                    >
                      <Flex align='center' justifyContent='space-evenly' gap='2'>

                      
                        <Input w='85px' px="2" textAlign='center' value={booking.startTime 
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
                            : "N/A"}/>
                            <Text>to</Text>
                          <Input w='85px' px="2" textAlign='center' value={booking.startTime 
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
                          : "N/A"}/>
                        </Flex>
                    </Td>
                    <Td
                      fontSize="clamp(.5rem, 1rem, 1.5rem)"
                    >
                      <Flex align='center' gap='1'>

                        <Input w='95px'
                          value={room && room.length > 0
                            ? `$${room[0].rate}`
                            : "N/A"}
                            />
                        <Text>/hr</Text>
                      </Flex>
                    </Td>
                    <Td
                      fontSize="clamp(.5rem, 1rem, 1.5rem)"
                    >
                      <Select
                        h='40px'
                        value={comment.adjustmentType || ""}
                        size="sm"
                        placeholder='Click to Select'
                        borderRadius='4px'
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
                        gap='2'
                      >
                        <Text>$</Text>
                        <Input
                          w="85px"
                          px="2"
                          textAlign="center"
                          value={
                            booking.startTime && booking.endTime
                              ? (() => {
                                  const timeToMinutes = (timeStr) => {
                                    const [hours, minutes] = timeStr.split(":").map(Number);
                                    return hours * 60 + minutes;
                                  };

                                    
                                    const startMinutes = timeToMinutes(booking.startTime.substring(0, 5));
                                    const endMinutes = timeToMinutes(booking.endTime.substring(0, 5));
                                    const diff = endMinutes - startMinutes;
                                    
                                    const totalHours = Math.ceil(diff / 60);
                                      
                                    return (totalHours * room[0]?.rate).toFixed(2);

                                  
                                })()
                              : "N/A"
                          }
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
                fontSize="clamp(.5rem, 1rem, 1.5rem)"
                py="8"
                textAlign="right"
                colSpan={5}
              >
                <Text fontWeight="bold">{`Subtotal`}</Text>
              </Td>
              <Td
                fontSize="clamp(.5rem, 1rem, 1.5rem)"
                py="8"
                textAlign="right"
              >
                <Text textAlign='center'>{`$ ${subtotal.toFixed(2)}`}</Text>
              </Td>
            </Tr>
            
          </Tbody>
        </Table>
      </Flex>
    </Flex>
  );
};

const InvoiceSummary = ({ pastDue, subtotal }) => {
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
              as="b"
            >
              <Tr>
                <Th
                  fontSize="lg"
                  textTransform="none"
                >
                  Description
                </Th>
                <Th
                  fontSize="lg"
                  textTransform="none"
                >
                  Adjustment Type(s)
                </Th>
                <Th
                  fontSize="lg"
                  textTransform="none"
                >
                  Total
                </Th>
              </Tr>
            </Thead>
            <Tbody color="#2D3748">
              <Tr>
                <Td>Past Due Balance</Td>
                <Td>
                  <Select placeholder="Click to select">
                    <option value=""></option>
                    Past Due Balance
                  </Select>
                </Td>
                <Td>
                  <Flex alignItems="center">
                    <Text mr={1}>$</Text>
                    <Input type="number" />
                    {/* <Input placeholder="0.00" defaultValue={pastDueValue.toFixed(2)} /> */}
                  </Flex>
                </Td>
              </Tr>
              <Tr>
                <Td>
                  Waiting for remaining payments from November and December
                  TODO: NEED TO CHANGE TO CORRECT DATE
                </Td>
              </Tr>
              <Tr>
                <Td>Current Statement Subtotal</Td>
                <Td>
                  <Select placeholder="Click to select">
                    <option value=""></option>
                    Past Due Balance
                  </Select>
                </Td>
                <Td>
                  <Flex alignItems="center">
                    <Text mr={1}>$</Text>
                    <Input type="number" />
                    {/* <Input placeholder="0.00" defaultValue={pastDueValue.toFixed(2)} /> */}
                  </Flex>
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </Flex>

        {/* <HStack spacing={2}>
            <Text w="120px" fontSize="xs" fontWeight="medium">Past Due Balance:</Text>
            <Input 
                  w="80px"
                  value={`$${pastDue && !isNaN(pastDue) ? pastDue : 0}`}
                  size="xs"
                  h="20px"
                />
            </HStack>

            <HStack spacing={2}>
                <Text w="120px" fontSize="xs" fontWeight="medium">Current Statement Subtotal:</Text>
                <Input 
                  w="80px"
                  value={`$${subtotal}`}
                  size="xs"
                  h="20px"
                />
            </HStack>

            <HStack spacing={2}>
                <Text w="120px" fontSize="xs" fontWeight="medium">Total Amount Due:</Text>
                <Input 
                w="80px"
                value={`$${(pastDue && !isNaN(pastDue) ? pastDue : 0) + subtotal}`}
                size="xs"
                h="20px"
                />
            </HStack> */}

        <Flex
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
      </VStack>
    </Box>
  );
};

export {
  StatementComments,
  EditInvoiceTitle,
  EditInvoiceDetails,
  InvoiceSummary,
};
