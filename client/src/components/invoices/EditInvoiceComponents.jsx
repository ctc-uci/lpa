import { format } from 'date-fns';
import React, { useState } from 'react';
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import {
  Button,
  Box,
  Flex,
  Select,
  Table,
  Tbody,
  Td,
  Text,
  Thead,
  Th,
  Tr,
  Link,
  VStack,
  Heading,
  HStack,
  Image,
  SimpleGrid,
  Input
  } from '@chakra-ui/react'

import logo from '../../assets/logo/logo.png';

const EditInvoiceTitle = () => {
  return (
    <Flex direction={{base: "column", md: "row"}} justify="space-between" align="center" mb={8} gap={16}>
      <Image 
          src={logo} 
          alt="La Peña Logo" 
          w="200px"
      />

      <VStack align="flex-start" spacing={0}>
          <Heading size="xl">RENTAL INVOICE</Heading>
          <Text fontSize="sm">La Peña Cultural Center</Text>
          <Text fontSize="sm">3105 Shattuck Ave., Berkeley, CA 94705</Text>
          <Text fontSize="sm">lapena.org</Text>
      </VStack>
    </Flex>
  )
}

const EditInvoiceDetails = ({ instructors, programName, payees }) => {
  return (
    <VStack spacing={6} align="stretch" mb={8}>
        <Heading textAlign="center" size="lg">Classroom Rental Monthly Statement</Heading>
        
        <SimpleGrid columns={{base: 1, md: 2}} spacing={6}>
            {/* Left column */}
            <VStack align="stretch" flex={1}>
                <Text fontWeight="bold">Recurring Program:</Text>
                <Input 
                placeholder="Program Name"
                size="sm"
                value={programName}
                readOnly
                />
                <VStack align="stretch" flex={1} maxH="120px" overflowY="auto">
                <Text fontWeight="bold">Designated Payers:</Text>
                    {payees && payees.length > 0 ? (
                    payees.map((payee, index) => (
                        <Input 
                            value={`${payee.name} - ${payee.email}`}
                            size="md"
                            mr={2}
                            borderRadius="0"
                        />
                    
                    ))
                ) : (
                    <Text>No payees found.</Text>
                )}
                </VStack>
            </VStack>
            
            
            {/* Right column */}
            <HStack align="flex-start">
            <VStack align="stretch" flex={1} maxH="195px" overflowY="auto">
                <Text fontWeight="bold">Lead Artist(s):</Text>


              {instructors && instructors.length > 0 ? (
                instructors.map((instructor, index) => (
                <HStack>
                    <Input 
                      value={instructor.name}
                      size="sm"
                      mr={2}
                    />
                    <Input 
                      value={instructor.email}
                      size="sm"
                      mr={2}
                    />
              </HStack>
                  
                ))
              ) : (
                <Text>No instructors found.</Text>
              )}
            </VStack>

            </HStack>
        </SimpleGrid>
    </VStack>
  )
}

const StatementComments = ({ comments = [], subtotal = 0.0 }) => {
  return (
    <Flex direction="column" w="100%" minH="24">
      <Flex
        borderRadius={0}
        borderWidth=".07em"
        borderColor="#000"
        minH="24"
      >
        <Table color="#EDF2F7">
          <Thead>
            <Tr>
              <Th fontSize="clamp(.5rem, 1rem, 1.5rem)" textTransform="none" color="#000">
                Date
              </Th>
              <Th fontSize="clamp(.5rem, 1rem, 1.5rem)" textTransform="none" color="#000">
                Classroom
              </Th>
              <Th fontSize="clamp(.5rem, 1rem, 1.5rem)" textTransform="none" color="#000">
                Rental Hours
              </Th>
              <Th fontSize="clamp(.5rem, 1rem, 1.5rem)" textTransform="none" color="#000">
                Hourly Fee
              </Th>
              <Th fontSize="clamp(.5rem, 1rem, 1.5rem)" textTransform="none" color="#000">
                Total
              </Th>
              <Th fontSize="clamp(.5rem, 1rem, 1.5rem)" textTransform="none" color="#000">
                Adjustments
              </Th>
              <Th fontSize="clamp(.5rem, 1rem, 1.5rem)" textTransform="none" color="#000">
                Comments
              </Th>
            </Tr>
          </Thead>
          <Tbody color="#2D3748">
            {comments.length > 0 ? (
              comments.map((comment, index) => {
                return (
                  <Tr key={`comment-${comment.id || 'unknown'}-${index}`}>
                    <Td fontSize="clamp(.5rem, 1rem, 1.5rem)">
                      <Input
                        value={format(new Date(comment.datetime), 'M/d/yy')}
                        size="sm"
                        mr={2}
                      />
                    </Td>
                    <Td fontSize="clamp(.5rem, 1rem, 1.5rem)">
                      <Input
                        value={comment.name}
                        size="sm"
                        mr={2}
                      />
                    </Td>
                    <Td fontSize="clamp(.5rem, 1rem, 1.5rem)">
                      <Input
                        value={
                          comment.startTime && comment.endTime
                            ? (() => {
                                const startTime = comment.startTime.split('-')[0].substring(0, 5);
                                const endTime = comment.endTime.split('-')[0].substring(0, 5);

                                const formatTime = (timeStr) => {
                                  const [hours, minutes] = timeStr.split(':').map(Number);
                                  const period = hours >= 12 ? 'pm' : 'am';
                                  const hour12 = hours % 12 || 12;
                                  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
                                };

                                return `${formatTime(startTime)} - ${formatTime(endTime)}`;
                              })()
                            : 'N/A'
                        }
                        size="sm"
                        mr={2}
                      />
                    </Td>
                    <Td fontSize="clamp(.5rem, 1rem, 1.5rem)">
                      <Input
                        value={`$${comment.rate}/hr`}
                        size="sm"
                        mr={2}
                      />
                    </Td>
                    <Td fontSize="clamp(.5rem, 1rem, 1.5rem)">
                      <Input
                        value={`$${comment.adjustmentValue}`}
                        size="sm"
                        mr={2}
                      />
                    </Td>
                    <Td fontSize="clamp(.5rem, 1rem, 1.5rem)">
                      {comment.adjustmentType}
                    </Td>
                    <Td fontSize="clamp(.5rem, 1rem, 1.5rem)">
                      {comment.comment}
                    </Td>
                  </Tr>
                );
              })
            ) : (
              <Tr>
                <Td colSpan={7}>No comments available.</Td>
              </Tr>
            )}

            <Tr>
              <Td colSpan={6}></Td>
              <Td fontSize="clamp(.5rem, 1rem, 1.5rem)">
                <Input
                  fontWeight="medium"
                  value={`Subtotal: ${subtotal}`}
                  size="sm"
                  mr={2}
                />
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </Flex>
    </Flex>
  );
};


const InvoiceSummary = ({ pastDue, subtotal }) => {
    return(
      <Box w="full" mt={8} position="relative">
        <VStack align="stretch" spacing={4}>
        <HStack>
            <Text fontSize="xl" fontWeight="bold" mr={80}>SUMMARY:</Text>
            <Text fontSize="xs" maxWidth="300px" fontWeight="bold">
              if you have any questions about this invoice, please contact: <Link href="mailto:classes@lapena.org" style={{textDecoration: "underline"}}>classes@lapena.org</Link>
            </Text>
        </HStack>
          
        <HStack spacing={2}>
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
            </HStack>
          
          <VStack align="center" pt={3} pb={2} spacing={0}>
            <Text fontWeight="bold">Payments are due at the end of each month:</Text>
            <Text fontWeight="bold">
              You can make your payment at: <Link color="blue.500" href="https://lapena.org/payment">lapena.org/payment</Link>
            </Text>
          </VStack>

          
        </VStack>
      </Box>
    )
  }

export { StatementComments, EditInvoiceTitle, EditInvoiceDetails, InvoiceSummary }
