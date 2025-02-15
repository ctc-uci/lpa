import { format } from 'date-fns';
import React, { useState } from 'react';
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import {
  Box,
  Button,
  Card,
  Flex,
  Image,
  Input,
  PopoverTrigger,
  Popover,
  PopoverContent,
  Select,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Thead,
  Th,
  Tr,
  Link
  } from '@chakra-ui/react'
import filterIcon from  "../../assets/filter.svg";
import { CalendarIcon } from '@chakra-ui/icons';
import personIcon from "../../assets/person.svg"
import PDFButtonInvoice from "./PDFButtonInvoice"

const InvoiceTitle = ({ title }) => {
  return (
    <Flex direction="row" width="100%" alignItems="center">
      <Text fontSize="clamp(1rem, 1.5rem, 2rem)" color="#474849" fontWeight="bold" marginRight="0.5rem">
        Program:
      </Text>
      <Text fontSize="clamp(.75rem, 1.25rem, 1.75rem)" color="#474849">
        {title}
      </Text>
    </Flex>
  );
};

const InvoiceStats = ({ payees, billingPeriod, amountDue, remainingBalance }) => {
    const formatDate = (isoDate) => {
      const date = new Date(isoDate);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
      });
    }

  return (
    <Flex direction="row" h="auto" w="100%" gap="2rem">
      {/* Billed To Section */}
      <Card
        flex={1}
        h="7em"
        width="25%"
        borderRadius={15}
        borderWidth="1px"
        boxShadow="none"
        display="flex"
        p={4}
        color="#D2D2D2"
        gap={2}
        flexDirection="column"
        overflowY="auto"
        justifyContent="flex-start"
      >
        <Text fontSize="clamp(1rem, 1.5rem, 2rem)" fontWeight="bold" color="#474849"> Billed to: </Text>
        {(payees && payees.length > 0) ? (
          payees.map((payee) => (
            <Box key={payee.id} mb="0.5rem">
              <Text fontSize="clamp(.75rem, 1.25rem, 1.75rem)" color="#474849">{payee.name}</Text>
              <Text fontSize="clamp(.75rem, 1.25rem, 1.75rem)" color="#474849">{payee.email}</Text>
            </Box>
          ))
        ) : (
          <Text fontSize="clamp(.75rem, 1.25rem, 1.75rem)" color="#474849">N/A</Text>
        )}
      </Card>

      {/* Invoice Details Section */}
      <Card
        flex={3}
        h="7em"
        borderRadius={15}
        borderWidth="1px"
        color="#D2D2D2"
        boxShadow="none"
        width="75%"
        padding="1.5em"
        display="flex"
        flexDirection="column"
        justifyContent="center"
      >
        <Flex width="100%" justifyContent="space-between">
          <Box>
            <Text fontWeight="bold" fontSize="clamp(1rem, 1.5rem, 2rem)" color="#474849"> Billing Period </Text>

            {(billingPeriod && billingPeriod["startDate"]) ? (
              <Text color="#474849" fontSize="clamp(.75rem, 1.25rem, 1.75rem)">
                {formatDate(billingPeriod["startDate"])} - {formatDate(billingPeriod["endDate"])}
              </Text>
            ) : (
              <Text color="#474849" fontSize="clamp(.75rem, 1.25rem, 1.75rem)">
                N/A - N/A
              </Text>
            )}
          </Box>
          <Box>
            <Text fontWeight="bold" fontSize="clamp(1rem, 1.5rem, 2rem)" color="#474849"> Amount Due </Text>
            <Text color="#474849" fontSize="clamp(.75rem, 1.25rem, 1.75rem)"> {amountDue ? `$${amountDue.toFixed(2)}` : "N/A"} </Text>
          </Box>
          <Box>
            <Text fontWeight="bold" fontSize="clamp(1rem, 1.5rem, 2rem)" color="#474849"> Remaining Balance </Text>
            <Text color="#474849" fontSize="clamp(.75rem, 1.25rem, 1.75rem)"> {remainingBalance !== 0 ? `$${remainingBalance.toFixed(2)}` : "N/A"} </Text>
          </Box>
        </Flex>
      </Card>
    </Flex>
  );
};

const InvoicePayments = ({ comments }) => {
    const [commentsPerPage, setCommentsPerPage] = useState(3);
    const [currentPageNumber, setCurrentPageNumber] = useState(1);

    const totalPages = Math.ceil((comments ?? []).length / commentsPerPage) || 1;
    const currentPageComments = (comments ?? []).slice(
        (currentPageNumber - 1) * commentsPerPage, currentPageNumber * commentsPerPage
    );

    const handleCommentsPerPageChange = (event) => {
        setCommentsPerPage(Number(event.target.value));
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
            <Text fontWeight="bold" fontSize="clamp(.75rem, 1.25rem, 1.75rem)" color="#474849">
                Payments
            </Text>

            <Flex
                borderRadius={15}
                borderWidth=".07em"
                borderColor="#E2E8F0"
                p={3}
                mb={3}
            >
                <Table
                    variant="striped"
                    color="#EDF2F7"
                >
                    <Thead>
                        <Tr>
                            <Th fontSize="clamp(.5rem, 1rem, 1.5rem)" textTransform="none"> Date </Th>
                            <Th fontSize="clamp(.5rem, 1rem, 1.5rem)" textTransform="none"> Comment </Th>
                            <Th fontSize="clamp(.5rem, 1rem, 1.5rem)" textTransform="none"> Amount </Th>
                        </Tr>
                    </Thead>
                    <Tbody color="#2D3748">
                        {comments && comments.length > 0 ? (
                            currentPageComments.map((comment) => (
                                <Tr key={comment.id}>
                                    <Td fontSize="clamp(.5rem, 1rem, 1.5rem)">
                                        {format(new Date(comment.datetime), 'M/d/yy')}
                                    </Td>
                                    <Td fontSize="clamp(.5rem, 1rem, 1.5rem)">
                                        {comment.comment}
                                    </Td>
                                    <Td fontSize="clamp(.5rem, 1rem, 1.5rem)">
                                        {comment.adjustmentValue ? `$${Number(comment.adjustmentValue).toFixed(2)}` : "N/A"}
                                    </Td>
                                </Tr>))
                        ) : (
                            <Tr>
                                <Td colSpan={3}>No comments available.</Td>
                            </Tr>
                        )}
                    </Tbody>
                </Table>
            </Flex>
            <Flex direction="row" width="100%" alignItems="center" mb={5}>
                <Text fontSize="clamp(.5rem, 1rem, 1.5rem)" marginRight="0.5rem"> Show: </Text>
                <Select width="auto" marginRight="0.5rem" value={commentsPerPage} onChange={handleCommentsPerPageChange}>
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


const InvoiceEmailHistory = ({ emails }) => {
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
          <Text fontWeight="bold" fontSize="clamp(.75rem, 1.25rem, 1.75rem)" color="#474849">
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
                  <Thead>
                      <Tr>
                          <Th fontSize="clamp(.5rem, 1rem, 1.5rem)" textTransform="none"> Date </Th>
                          <Th fontSize="clamp(.5rem, 1rem, 1.5rem)" textTransform="none"> Change Log </Th>
                          <Th></Th>
                      </Tr>
                  </Thead>
                  <Tbody color="#2D3748">
                      {emails && emails.length > 0 ? (
                          currentPageEmails.map((email) => (
                              <Tr key={email.id}>
                                  <Td fontSize="clamp(.5rem, 1rem, 1.5rem)">
                                      {format(new Date(email.datetime), 'M/d/yy')}
                                  </Td>
                                  <Td fontSize="clamp(.5rem, 1rem, 1.5rem)">
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


function InvoicesTable({filteredInvoices, isPaidColor, isPaid}){

  return (
    <TableContainer paddingTop="8px" border='1px solid var(--gray-200, #E2E8F0)' borderRadius='12px' >
      <Table variant='striped'>
        <Thead>
          <Tr>
            <Th>Program</Th>
            <Th>Status</Th>
            <Th>Payee</Th>
            <Th>Date Due</Th>
            <Th>Download</Th>
          </Tr>
        </Thead>
        <Tbody>
        {filteredInvoices.map((invoice, index) => (
            <Tr key={index}>
              <Td >{invoice.eventName}</Td>
              <Td  style={{ backgroundColor: isPaidColor(invoice) }}> {isPaid(invoice)} </Td>
              <Td >{invoice.name}</Td>
              <Td fontWeight="700">
                {new Date(invoice.endDate).toLocaleDateString("en-US", {
                  month: "2-digit", day: "2-digit", year: "numeric"
                })}
              </Td>
              <Td>
                <Flex  ml="18px">
                  <PDFButtonInvoice invoice={invoice} />
                </Flex>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
}

function InvoicesFilter({invoices, filter, setFilter}) {

  return (
    <>
      <Popover placement='bottom-start'>
        <PopoverTrigger>
          <Button
            backgroundColor="transparent"
            border="1px solid rgba(71, 72, 73, 0.20)"
            borderRadius="15px"
            h="48px"
            px="12px"
            >
              <Image src={filterIcon} alt="Filter" boxSize="20px" mr="4px" /> Filters
          </Button>
        </PopoverTrigger>
         <PopoverContent h='auto' w='sm' borderRadius='15px' box-shadow='0px 4px 4px 0px rgba(0, 0, 0, 0.25)' border='1px solid #D2D2D2' padding='16px' display='inline-flex' flexDirection='column' gap='16px'>
          <Flex alignItems='center' gap='8px'>
            <CalendarIcon color='#767778'/>
            <Text size='sm' as='b' color='#767778'>Date Range</Text>
          </Flex>
          <Flex justifyContent='space-evenly' alignItems='center'>
            <Input type='date' w='150px' backgroundColor='#F6F6F6' value={filter.startDate} onChange={(e) => setFilter({...filter, startDate: e.target.value})}/>
            to
            <Input type='date' w='150px' backgroundColor='#F6F6F6' value={filter.endDate} onChange={(e) => setFilter({...filter, endDate: e.target.value})}/>
          </Flex>

          <Text size='sm' as='b' color='#767778'>Status</Text>
          <Flex justifyContent='space-between' padding='4px 12px'>
          {['All', 'Paid', 'Not Paid', 'Past Due'].map((label, index) => (
              <Button
                key={index}
                borderRadius="30px"
                background="#F6F6F6"
                border={filter.status === label.toLowerCase() ? '1px solid var(--indigo, #4E4AE7)' : '1px solid transparent'}
                onClick={() => setFilter(filter => ({...filter, status: label.toLowerCase()}))
                }
              >
                {label}
              </Button>
            ))}
          </Flex>

          <Flex justifyContent="space-between" alignItems="center" mb={4}>
            <Flex alignItems="center">
              <Image src={personIcon} alt="Instructor" boxSize="20px" mr="4px" />
              <Text as="b" color="#767778">Instructor(s)</Text>
            </Flex>
            <Select w="50%" backgroundColor='#F6F6F6' value={filter.instructor} onChange={(e) => setFilter({...filter, instructor : e.target.value})}>
              <option>All</option>
              {invoices
              .filter(invoice => invoice.role === "instructor")
              .reduce((uniqueNames, invoice) => {
                if (!uniqueNames.includes(invoice.name)) {
                  uniqueNames.push(invoice.name);
                }
                return uniqueNames;
              }, [])
              .map((name, index) => (
                <option key={index}>{name}</option>
              ))}
            </Select>
          </Flex>

          <Flex justifyContent="space-between" alignItems="center">
            <Flex alignItems="center">
              <Image src={personIcon} alt="Payee" boxSize="20px" mr="4px" />
              <Text as="b" color="#767778">Payee(s)</Text>
            </Flex>
            <Select w="50%" backgroundColor='#F6F6F6' value={filter.payee} onChange={(e) => setFilter({...filter, payee : e.target.value})}>
              <option>All</option>
            {invoices
              .filter(invoice => invoice.role === "payee")
              .reduce((uniqueNames, invoice) => {
                if (!uniqueNames.includes(invoice.name)) {
                  uniqueNames.push(invoice.name);
                }
                return uniqueNames;
              }, [])
              .map((name, index) => (
                <option key={index}>{name}</option>
              ))}
            </Select>
          </Flex>


         </PopoverContent>
      </Popover>
    </>
  )
}

export {InvoiceTitle, InvoiceStats, InvoicePayments, InvoiceEmailHistory, InvoicesTable, InvoicesFilter }
