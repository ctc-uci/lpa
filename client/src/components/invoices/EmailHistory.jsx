import { format } from 'date-fns';
import React, { useState } from 'react';
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import {
  Button,
  Flex,
  Select,
  Table,
  Tbody,
  Td,
  Text,
  Thead,
  Th,
  Tr,
  Link
  } from '@chakra-ui/react'

const EmailHistory = ({ emails }) => {
  const [emailsPerPage, setEmailsPerPage] = useState(3);
  const [currentPageNumber, setCurrentPageNumber] = useState(1);

  const totalPages = Math.ceil((emails ?? []).length / emailsPerPage) || 1;
  const currentPageEmails = (emails ?? []).slice(
      (currentPageNumber - 1) * emailsPerPage, currentPageNumber * emailsPerPage
  );

  const handleEmailsPerPageChange = (event) => {
      setEmailsPerPage(Number(event.target.value));
      setCurrentPageNumber(1);
  };

  const handlePrevPage = () => {
      if (currentPageNumber > 1) {
          setCurrentPageNumber(currentPageNumber - 1);
      }
  };

  const handleNextPage = () => {
      if (currentPageNumber < totalPages) {
          setCurrentPageNumber(currentPageNumber + 1);
      }
  };

  return (
      <Flex direction="column" w="100%">
          <Text fontWeight="bold" fontSize="clamp(.75rem, 1.25rem, 1.75rem)" color="#474849" mb={3}>
              Email History
          </Text>

          <Flex
              borderRadius={15}
              borderWidth=".07em"
              borderColor="#E2E8F0"
              p={3}
              mb={3}
          >
              <Table
                  color="#EDF2F7"
              >
                  {/* <Thead>
                      <Tr>
                          <Th fontSize="clamp(.5rem, 1rem, 1.5rem)" textTransform="none"> Date </Th>
                          <Th fontSize="clamp(.5rem, 1rem, 1.5rem)" textTransform="none"> Change Log </Th>
                          <Th></Th>
                      </Tr>
                  </Thead> */}
                  <Tbody color="#2D3748">
                      {emails && emails.length > 0 ? (
                          currentPageEmails.map((email) => (
                              <Tr key={email.id}>
                                  <Td fontSize="clamp(.5rem, 1rem, 1.5rem)">
                                      {format(new Date(email.datetime), "EEE. M/d/yyyy")}
                                  </Td>
                                  <Td fontSize="clamp(.5rem, 1rem, 1.5rem)" fontWeight="bold">
                                    <Link href={email.fileReference} isExternal color="#4E4AE7" textDecoration="underline">
                                      View PDF
                                    </Link>
                                  </Td>
                                  <Td fontSize="clamp(.5rem, 1rem, 1.5rem)" color="#B4B7B9">
                                      {email.comment}
                                  </Td>
                              </Tr>))
                      ) : (
                          <Tr>
                              <Td colSpan={3}>No emails available.</Td>
                          </Tr>
                      )}
                  </Tbody>
              </Table>
          </Flex>
          <Flex direction="row" width="100%" alignItems="center" mb={5}>
              <Text fontSize="clamp(.5rem, 1rem, 1.5rem)" marginRight="0.5rem"> Show: </Text>
              <Select width="auto" marginRight="0.5rem" value={emailsPerPage} onChange={handleEmailsPerPageChange}>
                  <option value={3}>3</option>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
              </Select>
              <Text fontSize="clamp(.5rem, 1rem, 1.5rem)">per page</Text>
              <Flex direction="row" marginLeft="auto" alignItems="center">
                  <Text fontSize="clamp(.5rem, 1rem, 1.5rem)" marginRight="1rem"> {currentPageNumber} of {totalPages < 1 ? 1 : totalPages} </Text>
                  <Button onClick={handlePrevPage} isDisabled={currentPageNumber === 1} borderLeftRadius={30}>
                      <FaAngleLeft></FaAngleLeft>
                  </Button>
                  <Button onClick={handleNextPage} isDisabled={currentPageNumber === totalPages || totalPages === 0} borderRightRadius={30}>
                      <FaAngleRight></FaAngleRight>
                  </Button>
              </Flex>
          </Flex>
      </Flex>
  );
}

export { EmailHistory }
