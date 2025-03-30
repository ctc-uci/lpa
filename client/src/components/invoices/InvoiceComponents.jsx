import React, { useState } from "react";

import { CalendarIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Grid,
  Flex,
  Icon,
  IconButton,
  Image,
  Input,
  Menu,
  MenuList,
  MenuItem,
  MenuButton,
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

import {
  deleteIcon,
  sessionsEllipsis,
} from "../../assets/icons/ProgramIcons";

import { format } from "date-fns";
import { FaCircle, FaUser } from "react-icons/fa";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import { TbCaretUpDown } from "react-icons/tb";
import { DollarIcon } from "../../assets/DollarIcon";

import filterIcon from "../../assets/filter.svg";
import personIcon from "../../assets/person.svg";
import PDFButtonInvoice from "./PDFButtonInvoice";
import { EditIcon } from "../../assets/EditIcon";
import { CancelIcon } from "../../assets/CancelIcon";

const InvoiceTitle = ({ title, isSent, paymentStatus }) => {
  return (
    <Flex
      direction="row"
      width="100%"
      alignItems="center"
      gap={5}
    >
      <Text
        fontSize="clamp(1rem, 1.5rem, 2rem)"
        color="#474849"
        fontWeight="bold"
        marginRight="0.5rem"
      >
        {title}
      </Text>

      <Flex gap={2}>
        {/* is sent button */}
        <Button
          backgroundColor={isSent ? "#F0FFF4" : "#FFF5F5"}
          color={isSent ? "#38A169" : "#E53E3E"}
          variant="solid"
        >
          {isSent ? "Sent" : "Not Sent"}
        </Button>

        {/* paymentStatus */}
        <Button
          backgroundColor={paymentStatus === "full" ? "#F0FFF4" : "#FFF5F5"}
          color={paymentStatus === "full" ? "#38A169" : "#E53E3E"}
          variant="solid"
        >
          {paymentStatus === "full" ? "Paid" : "Unpaid"}
        </Button>
      </Flex>


    </Flex>
  );
};

const InvoiceStats = ({
  roomRate,
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
      direction="column"
      h="auto"
      w="100%"
      gap={5}
    >
      {/* Invoice Details Section */}
      <Grid templateColumns="1fr 2fr" gap="1rem" alignItems="end">
        {/* billing period */}
        <Box h={7}>
          <Text
            fontWeight="bold"
            fontSize="clamp(.5rem, 1rem, 1.5rem)"
            color="#474849"
          >
            Billing Period
          </Text>
        </Box>
        <Box h={7}>
          {billingPeriod && billingPeriod["startDate"] ? (
            <Text
              color="#474849"
              fontSize="clamp(.5rem, 1rem, 1.5rem)"
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

        {/* amount due */}
        <Box h={7}>
          <Text
            fontWeight="bold"
            fontSize="clamp(.5rem, 1rem, 1.5rem)"
            color="#474849"
          >
            Amount Due
          </Text>
        </Box>
        <Box h={7}>
          <Text
            color="#474849"
            fontSize="clamp(.5rem, 1rem, 1.5rem)"
          >
            {amountDue ? `$${Number(amountDue).toFixed(2)}` : "N/A"}
          </Text>
        </Box>

        {/* remaining balance */}
        <Box h={7}>
          <Text
            fontWeight="bold"
            fontSize="clamp(.5rem, 1rem, 1.5rem)"
            color="#474849"
          >
            Remaining Balance
          </Text>
        </Box>

        <Box h={7}>
          <Flex gap={2} alignItems="start">
            <Text
              color="#474849"
              fontSize="clamp(.5rem, 1rem, 1.5rem)"
            >
              {roomRate !== 0
                ? `$${Number(remainingBalance).toFixed(2)}`
                : "N/A"}
            </Text>
            <Button backgroundColor="#EDF2F7">
              View Previous Invoice
            </Button>
          </Flex>
        </Box>
      </Grid>


      {/* room rate section */}
      <Flex gap={3} alignItems="center">
        <DollarIcon />
        <Text>{roomRate ? `${Number(roomRate).toFixed(2)} / hour` : "N/A"}</Text>
      </Flex>

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
        mb={3}
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
          <Tbody color="#2D3748">
            {comments && comments.length > 0 ? (
              currentPageComments.map((comment) => (
                <Tr key={comment.id}>
                  <Td fontSize="clamp(.5rem, 1rem, 1.5rem)">
                    {format(new Date(comment.datetime), "EEE. M/d/yy")}
                  </Td>
                  {/* <Td fontSize="clamp(.5rem, 1rem, 1.5rem)">
                    {comment.comment}
                  </Td> */}
                  <Td fontSize="clamp(.5rem, 1rem, 1.5rem)">
                    {comment.adjustmentValue
                      ? `$${Number(comment.adjustmentValue).toFixed(2)}`
                      : "N/A"}
                  </Td>
                  <Td>
                    <Menu>
                              <MenuButton
                                as={IconButton}
                                height="30px"
                                width="30px"
                                rounded="full"
                                variant="ghost"
                                icon={<Icon as={sessionsEllipsis} />}
                              />
                              <MenuList>
                                <MenuItem
                                  //onClick={}
                                >
                                  <Box
                                    display="flex"
                                    padding="12px 16px"
                                    alignItems="center"
                                    gap="8px"
                                  >
                                    <Icon as={EditIcon} />
                                    <Text color="#767778">Edit</Text>
                                  </Box>
                                </MenuItem>
                                <MenuItem
                                  //onClick={}
                                >
                                  <Box
                                    display="flex"
                                    padding="12px 16px"
                                    alignItems="center"
                                    gap="8px"
                                  >
                                    <Icon as={CancelIcon} />
                                    <Text color="#90080F">Cancel</Text>
                                  </Box>
                                </MenuItem>
                              </MenuList>
                    </Menu>
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
  return (
    <TableContainer
      paddingTop="8px"
      border="1px solid var(--gray-200, #E2E8F0)"
      borderRadius="12px"
    >
      <Table variant="striped">
        <Thead>
          <Tr>
            <Th
              textTransform="none"
              fontSize="md"
            >
              <Flex align="center">
                <Text>Status</Text>
                <TbCaretUpDown style={{ marginLeft: "8px" }} />
              </Flex>
            </Th>
            <Th
              textTransform="none"
              fontSize="md"
            >
              Invoice Sent
            </Th>
            <Th
              textTransform="none"
              fontSize="md"
            >
              <Flex align="center">
                <Text>Program</Text>
                <TbCaretUpDown style={{ marginLeft: "8px" }} />
              </Flex>
            </Th>
            <Th
              textTransform="none"
              fontSize="md"
            >
              <Flex align="center">
                <FaUser style={{ marginRight: "8px" }} />
                <Text>Payer(s)</Text>
              </Flex>
            </Th>
            <Th
              textTransform="none"
              fontSize="md"
            >
              <Flex align="center">
                <CalendarIcon
                  color="#767778"
                  style={{ marginRight: "8px" }}
                />
                <Text>Deadline</Text>
                <TbCaretUpDown style={{ marginLeft: "8px" }} />
              </Flex>
            </Th>
            <Th
              textTransform="none"
              fontSize="md"
            >
              Season
            </Th>
            <Th
              textTransform="none"
              fontSize="md"
            >
              Download
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredInvoices.map((invoice, index) => {
            const validPayers = Array.isArray(invoice.payers)
              ? invoice.payers.filter(
                  (payer) => payer && typeof payer === "string"
                )
              : [];
            return (
              <Tr key={index}>
                <Td
                  style={{
                    color: isPaidColor(invoice),
                    textDecoration:
                      invoice.isPaid === "Past Due" ? "underline" : "none",
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
                <Td>
                  {new Date(invoice.endDate).toLocaleDateString("en-US", {
                    month: "2-digit",
                    day: "2-digit",
                    year: "numeric",
                  })}
                </Td>
                <Td>
                  <Tag
                    bg={seasonColor(invoice)}
                    color="white"
                  >
                    {invoice.season}
                  </Tag>
                </Td>
                <Td>
                  <Flex ml="18px">
                    <PDFButtonInvoice invoice={invoice} />
                  </Flex>
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </TableContainer>
  );
}

function InvoicesFilter({ invoices, filter, setFilter }) {
  return (
    <>
      <Popover placement="bottom-start">
        <PopoverTrigger>
          <Button
            backgroundColor="#F0F1F4"
            borderRadius="15px"
            h="48px"
            px="12px"
            textColor="#767778"
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
