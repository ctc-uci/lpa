import React, { useState, useEffect } from "react";

import { 
  Flex, 
  Link, 
  Table, 
  Tbody, 
  Td, 
  Text, 
  Tr, 
  Button, 
  HStack, 
  Select,
  Box,
  IconButton
} from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";

import { format } from "date-fns";

const EmailHistory = ({ emails }) => {
  const [emailsPerPage, setEmailsPerPage] = useState(5);
  const [currentPageNumber, setCurrentPageNumber] = useState(1);

  const totalPages = Math.ceil((emails ?? []).length / emailsPerPage) || 1;
  const currentPageEmails = (emails ?? []).slice(
    (currentPageNumber - 1) * emailsPerPage,
    currentPageNumber * emailsPerPage
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
    <Flex
      direction="column"
      w="100%"
    >
      <Text
        fontWeight="700"
        fontSize="16px"
        lineHeight={"20px"}
        color="#474849"
        mb={"12px"}
      >
        Email History
      </Text>

      <Flex
        borderRadius={15}
        borderWidth=".07em"
        borderColor="#E2E8F0"
        padding="20px"
        mb={3}
      >
        <Table color="#EDF2F7">
          <Tbody color="#2D3748">
            {emails && emails.length > 0 ? (
              currentPageEmails.map((email) => (
                <Tr
                  key={email.id}
                  alignItems="center"
                  alignSelf="stretch"
                  gap="12px"
                >
                  <Td
                    fontSize="14px"
                    paddingInlineStart="8px"
                    paddingInlineEnd="8px"
                  >
                    {format(new Date(email.datetime), "EEE. M/d/yyyy HH:mm")}
                  </Td>
                  <Td
                    fontSize="14px"
                    fontWeight="700"
                    color="#4441C8"
                    fontFamily={"Inter"}
                    paddingInlineStart="8px"
                    paddingInlineEnd="8px"
                  >
                    <Link
                      href={email.fileReference}
                      isExternal
                      textDecoration="underline"
                      textUnderlineOffset={"auto"}
                    >
                      View PDF
                    </Link>
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={3}>No emails available.</Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Flex>

      {/* Pagination Controls */}
      {emails && emails.length > 0 && (
        <Flex
          justify="flex-end"
          align="center"
          w="100%"
          px="20px"
        >

          {/* Page info and navigation */}
          <HStack spacing={2}>
            <Text fontSize="14px" color="#718096">
              Page {currentPageNumber} of {totalPages}
            </Text>
            
            <HStack spacing={1}>
              <IconButton
                size="sm"
                variant="outline"
                onClick={handlePrevPage}
                isDisabled={currentPageNumber === 1}
                aria-label="Previous page"
                icon={<ChevronLeftIcon />}
              />
              <IconButton
                size="sm"
                variant="outline"
                onClick={handleNextPage}
                isDisabled={currentPageNumber === totalPages}
                aria-label="Next page"
                icon={<ChevronRightIcon />}
              />
            </HStack>
          </HStack>
        </Flex>
      )}
    </Flex>
  );
};

export { EmailHistory };
