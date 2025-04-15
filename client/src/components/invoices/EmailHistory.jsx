import React, { useState } from "react";

import { Flex, Link, Table, Tbody, Td, Text, Tr } from "@chakra-ui/react";

import { format } from "date-fns";

const EmailHistory = ({ emails }) => {
  const [emailsPerPage, setEmailsPerPage] = useState(3);
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
        p={3}
        mb={3}
      >
        <Table color="#EDF2F7">
          <Tbody color="#2D3748">
            {emails && emails.length > 0 ? (
              currentPageEmails.map((email) => (
                <Tr key={email.id}>
                  <Td fontSize="14px">
                    {format(new Date(email.datetime), "EEE. M/d/yyyy")}
                  </Td>
                  <Td
                    fontSize="14px"
                    fontWeight="700"
                    color="#4441C8"
                    fontFamily={"Inter"}
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
    </Flex>
  );
};

export { EmailHistory };
