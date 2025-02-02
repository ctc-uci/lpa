import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Flex,
  Card,
  Box,
  Text
} from '@chakra-ui/react';
import React, { useState, useEffect } from 'react';
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { format } from 'date-fns';

export const InvoicesStats = ({ name, email }) => {
  return (
    <Flex gap={7} align="center" w="100%">

      {/* Billed To Section */}
      <Card
        flex={1}
        h="7em"
        borderRadius={15}
        borderWidth=".07em"
        color="#D2D2D2"
        boxShadow="none"
        display="flex"
        justifyContent="center"
        p={4}
      >
        <Text fontWeight="bold" fontSize="22px" color="#474849">Billed to:</Text>
        <Text fontSize="20px" color="#474849">{name}</Text>
        <Text fontSize="20px" color="#474849">{email}</Text>
      </Card>

      {/* Invoice Details Section */}
      <Card
        flex={3}
        h="7em"
        borderRadius={15}
        borderWidth=".07em"
        color="#D2D2D2"
        boxShadow="none"

        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="flex-start"
        p={4}
      >
        <Flex w="100%" justifyContent="space-between">
          <Box>
            <Text fontWeight="bold" fontSize="22px" color="#474849">Billing Period</Text>
            <Text color="#474849" fontSize="20px" >Jan 1 - Jan 31</Text>
          </Box>

          <Box>
            <Text fontWeight="bold" fontSize="22px" color="#474849">Amount Due</Text>
            <Text color="#474849" fontSize="20px" >$100.00</Text>
          </Box>

          <Box>
            <Text fontWeight="bold" fontSize="22px" color="#474849">Remaining Balance</Text>
            <Text color="#474849" fontSize="20px" >$20.00</Text>
          </Box>
        </Flex>
      </Card>
    </Flex>




  );

};

export const InvoicesTable = ({ comments }) => {
  return (
    <Flex
      w="100%"
        borderRadius={15}
        borderWidth=".07em"
        borderColor="#D2D2D2"
        p={3}
      >
        <Table
          variant="striped"
          color="$EDF2F7"
        >
          <Thead>
            <Tr>
              <Th>Date</Th>
              <Th>Comment</Th>
              <Th>Amount</Th>
            </Tr>
          </Thead>
          <Tbody>
            {Array.isArray(comments) && comments.length > 0 ? (
              comments.map((comment) => (
                <Tr key={comment.id}>
                  <Td>{format(new Date(comment.date), 'M/d/yy')}</Td>
                  <Td>{comment.comment}</Td>
                  <Td fontWeight="bold">{comment.amount}</Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan="3">No comments available.</Td>
              </Tr>
            )}

          </Tbody>


        </Table>
      </Flex>
  );

};
