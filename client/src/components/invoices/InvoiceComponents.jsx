import React, { useEffect, useState } from "react";

import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@chakra-ui/icons";
import {
  Box,
  Button,
  Card,
  Flex,
  HStack,
  Icon,
  IconButton,
  Image,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  Table,
  TableContainer,
  Tag,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";

import { format } from "date-fns";
import { FaCircle, FaUser } from "react-icons/fa";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import { FiMoreHorizontal } from "react-icons/fi";

import filterIcon from "../../assets/filter.svg";
import { archiveCalendar } from "../../assets/icons/ProgramIcons";
import arrowsSvg from "../../assets/icons/right-icon.svg";
import personIcon from "../../assets/person.svg";
import PDFButtonInvoice from "./PDFButtonInvoice";

const InvoiceTitle = ({ title }) => {
  return (
    <Flex
      direction="row"
      width="100%"
      alignItems="center"
    >
      <Text
        fontSize="clamp(1rem, 1.5rem, 2rem)"
        color="#474849"
        fontWeight="bold"
        marginRight="0.5rem"
      >
        Program:
      </Text>
      <Text
        fontSize="clamp(.75rem, 1.25rem, 1.75rem)"
        color="#474849"
      >
        {title}
      </Text>
    </Flex>
  );
};

const InvoiceStats = ({
  payees,
  billingPeriod,
  amountDue,
  remainingBalance,
}) => {
  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Flex
      direction="row"
      h="auto"
      w="100%"
      gap="2rem"
    >
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
        <Text
          fontSize="clamp(1rem, 1.5rem, 2rem)"
          fontWeight="bold"
          color="#474849"
        >
          {" "}
          Billed to:{" "}
        </Text>
        {payees && payees.length > 0 ? (
          payees.map((payee) => (
            <Box
              key={payee.id}
              mb="0.5rem"
            >
              <Text
                fontSize="clamp(.75rem, 1.25rem, 1.75rem)"
                color="#474849"
              >
                {payee.name}
              </Text>
              <Text
                fontSize="clamp(.75rem, 1.25rem, 1.75rem)"
                color="#474849"
              >
                {payee.email}
              </Text>
            </Box>
          ))
        ) : (
          <Text
            fontSize="clamp(.75rem, 1.25rem, 1.75rem)"
            color="#474849"
          >
            N/A
          </Text>
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
        <Flex
          width="100%"
          justifyContent="space-between"
        >
          <Box>
            <Text
              fontWeight="bold"
              fontSize="clamp(1rem, 1.5rem, 2rem)"
              color="#474849"
            >
              {" "}
              Billing Period{" "}
            </Text>

            {billingPeriod && billingPeriod["startDate"] ? (
              <Text
                color="#474849"
                fontSize="clamp(.75rem, 1.25rem, 1.75rem)"
              >
                {formatDate(billingPeriod["startDate"])} -{" "}
                {formatDate(billingPeriod["endDate"])}
              </Text>
            ) : (
              <Text
                color="#474849"
                fontSize="clamp(.75rem, 1.25rem, 1.75rem)"
              >
                N/A - N/A
              </Text>
            )}
          </Box>
          <Box>
            <Text
              fontWeight="bold"
              fontSize="clamp(1rem, 1.5rem, 2rem)"
              color="#474849"
            >
              {" "}
              Amount Due{" "}
            </Text>
            <Text
              color="#474849"
              fontSize="clamp(.75rem, 1.25rem, 1.75rem)"
            >
              {" "}
              {amountDue ? `$${Number(amountDue).toFixed(2)}` : "N/A"}{" "}
            </Text>
          </Box>
          <Box>
            <Text
              fontWeight="bold"
              fontSize="clamp(1rem, 1.5rem, 2rem)"
              color="#474849"
            >
              {" "}
              Remaining Balance{" "}
            </Text>
            <Text
              color="#474849"
              fontSize="clamp(.75rem, 1.25rem, 1.75rem)"
            >
              {" "}
              {remainingBalance !== 0
                ? `$${Number(remainingBalance).toFixed(2)}`
                : "N/A"}{" "}
            </Text>
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
    (currentPageNumber - 1) * commentsPerPage,
    currentPageNumber * commentsPerPage
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
    <Flex
      direction="column"
      w="100%"
    >
      <Text
        fontWeight="bold"
        fontSize="clamp(.75rem, 1.25rem, 1.75rem)"
        color="#474849"
      >
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
              <Th
                fontSize="clamp(.5rem, 1rem, 1.5rem)"
                textTransform="none"
              >
                {" "}
                Date{" "}
              </Th>
              <Th
                fontSize="clamp(.5rem, 1rem, 1.5rem)"
                textTransform="none"
              >
                {" "}
                Comment{" "}
              </Th>
              <Th
                fontSize="clamp(.5rem, 1rem, 1.5rem)"
                textTransform="none"
              >
                {" "}
                Amount{" "}
              </Th>
            </Tr>
          </Thead>
          <Tbody color="#2D3748">
            {comments && comments.length > 0 ? (
              currentPageComments.map((comment) => (
                <Tr key={comment.id}>
                  <Td fontSize="clamp(.5rem, 1rem, 1.5rem)">
                    {format(new Date(comment.datetime), "M/d/yy")}
                  </Td>
                  <Td fontSize="clamp(.5rem, 1rem, 1.5rem)">
                    {comment.comment}
                  </Td>
                  <Td fontSize="clamp(.5rem, 1rem, 1.5rem)">
                    {comment.adjustmentValue
                      ? `$${Number(comment.adjustmentValue).toFixed(2)}`
                      : "N/A"}
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={3}>No comments available.</Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Flex>
      <Flex
        direction="row"
        width="100%"
        alignItems="center"
        mb={5}
      >
        <Text
          fontSize="clamp(.5rem, 1rem, 1.5rem)"
          marginRight="0.5rem"
        >
          {" "}
          Show:{" "}
        </Text>
        <Select
          width="auto"
          marginRight="0.5rem"
          value={commentsPerPage}
          onChange={handleCommentsPerPageChange}
        >
          <option value={3}>3</option>
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </Select>
        <Text fontSize="clamp(.5rem, 1rem, 1.5rem)">per page</Text>
        <Flex
          direction="row"
          marginLeft="auto"
          alignItems="center"
        >
          <Text
            fontSize="clamp(.5rem, 1rem, 1.5rem)"
            marginRight="1rem"
          >
            {" "}
            {currentPageNumber} of {totalPages < 1 ? 1 : totalPages}{" "}
          </Text>
          <Button
            onClick={handlePrevPage}
            isDisabled={currentPageNumber === 1}
            borderLeftRadius={30}
          >
            <FaAngleLeft></FaAngleLeft>
          </Button>
          <Button
            onClick={handleNextPage}
            isDisabled={currentPageNumber === totalPages || totalPages === 0}
            borderRightRadius={30}
          >
            <FaAngleRight></FaAngleRight>
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};

function InvoicesTable({ filteredInvoices, isPaidColor, seasonColor }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const totalInvoices = filteredInvoices?.length || 0;
  const totalPages = Math.ceil(totalInvoices / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalInvoices);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date
      .toLocaleDateString("en-US", {
        weekday: "short",
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      })
      .replace(/,/g, ".");
  };

  // Get current page data
  const currentInvoices = filteredInvoices.slice(startIndex, endIndex);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredInvoices]);

  useEffect(() => {
    const calculateRowsPerPage = () => {
      const viewportHeight = window.innerHeight;
      const rowHeight = 56;

      const availableHeight = viewportHeight * 0.5;

      console.log(availableHeight / rowHeight);
      return Math.max(5, Math.floor(availableHeight / rowHeight));
    };

    setItemsPerPage(calculateRowsPerPage());

    const handleResize = () => {
      setItemsPerPage(calculateRowsPerPage());
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <Box position="relative">
        <TableContainer>
          <Table>
            <Thead>
              <Tr>
                <Th
                  textTransform="none"
                  fontSize="md"
                >
                  <HStack
                    spacing={2}
                    alignItems="center"
                  >
                    <Text>STATUS</Text>
                    <Image src={arrowsSvg} />
                  </HStack>
                </Th>
                <Th
                  textTransform="none"
                  fontSize="md"
                >
                  INVOICE SENT
                </Th>
                <Th
                  textTransform="none"
                  fontSize="md"
                >
                  <HStack
                    spacing={2}
                    alignItems="center"
                  >
                    <Text>PROGRAM</Text>
                    <Image src={arrowsSvg} />
                  </HStack>
                </Th>
                <Th
                  textTransform="none"
                  fontSize="md"
                >
                  <Flex align="center">
                    <FaUser style={{ marginRight: "8px" }} />
                    <Text>PAYER(S)</Text>
                  </Flex>
                </Th>
                <Th
                  textTransform="none"
                  fontSize="md"
                >
                  <HStack
                    spacing={2}
                    alignItems="flex-end"
                  >
                    <Icon as={archiveCalendar} />
                    <Text>DEADLINE</Text>
                    <Image src={arrowsSvg} />
                  </HStack>
                </Th>
                <Th
                  textTransform="none"
                  fontSize="md"
                >
                  SEASON
                </Th>
                <Th
                  textTransform="none"
                  fontSize="md"
                >
                  DOWNLOADS
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {currentInvoices.map((invoice, index) => {
                const validPayers = Array.isArray(invoice.payers)
                  ? invoice.payers.filter(
                      (payer) => payer && typeof payer === "string"
                    )
                  : [];
                const [tagBgColor, tagTextColor] = seasonColor(invoice);
                return (
                  <Tr key={index}>
                    <Td
                      style={{
                        color: isPaidColor(invoice),
                        fontWeight:
                          invoice.isPaid === "Past Due" ? "bold" : "normal",
                      }}
                    >
                      {invoice.isPaid}
                    </Td>
                    <Td>
                      <Flex
                        justifyContent="center"
                        align="center"
                        w="60%"
                      >
                        {invoice.isSent ? (
                          <Icon
                            as={FaCircle}
                            color="#0C824D"
                            boxSize={4}
                          />
                        ) : (
                          <Icon
                            as={FaCircle}
                            color="#EA4335"
                            boxSize={4}
                          />
                        )}
                      </Flex>
                    </Td>
                    <Td>{invoice.eventName}</Td>
                    <Td>
                      {validPayers.length > 1
                        ? `${validPayers[0].trim()},...`
                        : validPayers.length === 1
                          ? validPayers[0].trim()
                          : "N/A"}
                    </Td>
                    <Td>{formatDate(invoice.endDate)}</Td>
                    <Td>
                      <Tag
                        bg={tagBgColor}
                        color={tagTextColor}
                      >
                        {invoice.season}
                      </Tag>
                    </Td>
                    <Td>
                      <Flex ml="18px">
                        <PDFButtonInvoice invoice={invoice} />
                      </Flex>
                    </Td>
                    <Td>
                      <IconButton
                        icon={<FiMoreHorizontal />}
                        size="sm"
                        bg="#EDF2F7"
                        color="#000000"
                        borderRadius="md"
                      />
                    </Td>
                  </Tr>
                );
              })}
              {currentInvoices.length === 0 && (
                <Tr>
                  <Td
                    colSpan={7}
                    textAlign="center"
                    py={4}
                  >
                    No invoices found
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </TableContainer>

        {/* Pagination Controls - now right-aligned */}
        {totalPages > 1 && (
          <Flex
            alignItems="center"
            justifyContent="flex-end"
            mt={4}
            mb={4}
            pr={4}
          >
            <Text
              mr={2}
              fontSize="sm"
              color="#474849"
              fontFamily="Inter, sans-serif"
            >
              {currentPage} of {totalPages}
            </Text>
            <Button
              onClick={goToPreviousPage}
              isDisabled={currentPage === 1}
              size="sm"
              variant="ghost"
              padding={0}
              minWidth="auto"
              color="gray.500"
              mr="16px"
            >
              <ChevronLeftIcon />
            </Button>
            <Button
              onClick={goToNextPage}
              isDisabled={currentPage === totalPages}
              size="sm"
              variant="ghost"
              padding={0}
              minWidth="auto"
              color="gray.500"
            >
              <ChevronRightIcon />
            </Button>
          </Flex>
        )}
      </Box>
    </>
  );
}

function InvoicesFilter({ invoices, filter, setFilter }) {
  return (
    <>
      <Popover placement="bottom-start">
        <PopoverTrigger>
          <Button
            backgroundColor="#EDF2F7"
            borderRadius="6px"
            h="48px"
            px="12px"
            textColor="#2D3748"
          >
            <Image
              src={filterIcon}
              alt="Filter"
              boxSize="20px"
              mr="4px"
            />{" "}
            Filters
          </Button>
        </PopoverTrigger>
        <PopoverContent
          h="auto"
          w="sm"
          borderRadius="15px"
          box-shadow="0px 4px 4px 0px rgba(0, 0, 0, 0.25)"
          border="1px solid #D2D2D2"
          padding="16px"
          display="inline-flex"
          flexDirection="column"
          gap="16px"
        >
          <Flex
            alignItems="center"
            gap="8px"
          >
            <CalendarIcon color="#767778" />
            <Text
              size="sm"
              as="b"
              color="#767778"
            >
              Date Range
            </Text>
          </Flex>
          <Flex
            justifyContent="space-evenly"
            alignItems="center"
          >
            <Input
              type="date"
              w="150px"
              backgroundColor="#F6F6F6"
              value={filter.startDate}
              onChange={(e) =>
                setFilter({ ...filter, startDate: e.target.value })
              }
            />
            to
            <Input
              type="date"
              w="150px"
              backgroundColor="#F6F6F6"
              value={filter.endDate}
              onChange={(e) =>
                setFilter({ ...filter, endDate: e.target.value })
              }
            />
          </Flex>

          <Text
            size="sm"
            as="b"
            color="#767778"
          >
            Status
          </Text>
          <Flex
            justifyContent="space-between"
            padding="4px 12px"
          >
            {["All", "Paid", "Not Paid", "Past Due"].map((label, index) => (
              <Button
                key={index}
                borderRadius="30px"
                background="#F6F6F6"
                border={
                  filter.status === label.toLowerCase()
                    ? "1px solid var(--indigo, #4E4AE7)"
                    : "1px solid transparent"
                }
                onClick={() =>
                  setFilter((filter) => ({
                    ...filter,
                    status: label.toLowerCase(),
                  }))
                }
              >
                {label}
              </Button>
            ))}
          </Flex>

          <Flex
            justifyContent="space-between"
            alignItems="center"
            mb={4}
          >
            <Flex alignItems="center">
              <Image
                src={personIcon}
                alt="Instructor"
                boxSize="20px"
                mr="4px"
              />
              <Text
                as="b"
                color="#767778"
              >
                Instructor(s)
              </Text>
            </Flex>
            <Select
              w="50%"
              backgroundColor="#F6F6F6"
              value={filter.instructor}
              onChange={(e) =>
                setFilter({ ...filter, instructor: e.target.value })
              }
            >
              <option>All</option>
              {invoices
                .filter((invoice) => invoice.role === "instructor")
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

          <Flex
            justifyContent="space-between"
            alignItems="center"
          >
            <Flex alignItems="center">
              <Image
                src={personIcon}
                alt="Payee"
                boxSize="20px"
                mr="4px"
              />
              <Text
                as="b"
                color="#767778"
              >
                Payee(s)
              </Text>
            </Flex>
            <Select
              w="50%"
              backgroundColor="#F6F6F6"
              value={filter.payee}
              onChange={(e) => setFilter({ ...filter, payee: e.target.value })}
            >
              <option>All</option>
              {invoices
                .filter((invoice) => invoice.role === "payee")
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
  );
}

export {
  InvoiceTitle,
  InvoiceStats,
  InvoicePayments,
  InvoicesTable,
  InvoicesFilter,
};
