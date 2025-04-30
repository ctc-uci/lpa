import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Image,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";

import { archiveCalendar } from "../../assets/icons/ProgramIcons";
import { CalendarIcon } from "./CalendarIcon";
import DateSortingModal from "../filters/DateFilter";
import ProgramSortingModal from "../filters/ProgramFilter";
import { InfoTooltip } from "./InfoTooltip";

const NotificationsComponents = ({ notifications }) => {
  const navigator = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortKey, setSortKey] = useState("date");
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortedNotifications, setSortedNotifications] = useState([]);

  const totalNotifications = sortedNotifications?.length || 0;
  const totalPages = Math.ceil(totalNotifications / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalNotifications);

  const currentNotifications =
    sortedNotifications?.slice(startIndex, endIndex) || [];

  useEffect(() => {
    setCurrentPage(1);
  }, [notifications]);

  useEffect(() => {
    if (!notifications) return;

    const sorted = [...notifications];

    if (sortKey === "date") {
      sorted.sort((a, b) => {
        const dateA = new Date(a.dueTime);
        const dateB = new Date(b.dueTime);
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      });
    } else if (sortKey === "title") {
      // Sort by eventName (program description)
      sorted.sort((a, b) => {
        const totalDescriptionA = a.description + a.eventName;
        const totalDescriptionB = b.description + b.eventName;
        const descA = totalDescriptionA.toString()?.toLowerCase() || "";
        const descB = totalDescriptionB.toString()?.toLowerCase() || "";
        return sortOrder === "asc"
          ? descA.localeCompare(descB)
          : descB.localeCompare(descA);
      });
    }

    setSortedNotifications(sorted);
  }, [sortKey, sortOrder, notifications]);

  // Function to update sorting
  const handleSortChange = (key, order) => {
    setSortKey(key);
    setSortOrder(order);
  };

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
    const calculateRowsPerPage = () => {
      const viewportHeight = window.innerHeight;
      const rowHeight = 56;

      const availableHeight = viewportHeight * 0.5;

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

  const getNotifType = (payStatus) => {
    const statusMap = {
      overdue: {
        label: "Past Due",
        color: "#90080F",
        fontWeight: "700",
        tooltip: "Payment Overdue (5+ Days)",
      },
      neardue: {
        label: "Email Not Sent",
        color: "var(--Secondary-8, #2D3748)",
        fontWeight: "400",
        tooltip: "Email Has Not Been Sent (1+ Weeks)",
      },
      highpriority: {
        label: "Both",
        color: "#90080F",
        fontWeight: "700",
        tooltip: "Past Due and Email Not Sent",
      },
      default: {
        label: "Other",
        color: "var(--Secondary-8, #2D3748)",
        fontWeight: "400",
        tooltip: "Status not categorized",
      },
    };
  
    const { label, color, fontWeight, tooltip } = statusMap[payStatus] || statusMap.default;
  
    return (
      <HStack spacing={1}>
        <Text
          color={color}
          fontFamily="Inter"
          fontSize="14px"
          fontStyle="normal"
          fontWeight={fontWeight}
          lineHeight="normal"
          letterSpacing="0.07px"
        >
          {label}
        </Text>
        <InfoTooltip tooltipInfo={tooltip} />
      </HStack>
    );
  };

  const paymentText = (eventName, description, invoiceId) => {
    const handleClick = () => {
      navigator(`/invoices/edit/${invoiceId}`);
    };

    const textStyles = {
      color: "var(--Secondary-8, #2D3748)",
      fontFamily: "Inter",
      fontSize: "14px",
      fontStyle: "normal",
      fontWeight: "400",
      lineHeight: "normal",
      wordBreak: "break-word",
      whiteSpace: "normal",
      overflowWrap: "break-word",
      width: "100%",
    };

    const linkStyles = {
      color: "#29267D",
      textDecoration: "underline",
      cursor: "pointer",
    };

    return (
      <Text
        sx={textStyles}
        title={`${description} ${eventName}.`}
      >
        {description} <span style={linkStyles} onClick={() => handleClick()}>{eventName}</span>.
      </Text>
    );
  };

  return (
    <>
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th
                textTransform="none"
                fontSize="md"
                paddingBottom="24px"
                paddingLeft="0px"
                width="10%"
              >
                <Flex
                  display="flex"
                  height="15px"
                  padding="8px"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Text
                    color="var(--Secondary-6, #718096)"
                    fontFamily="Inter"
                    fontSize="12px"
                    fontStyle="normal"
                    fontWeight="700"
                    lineHeight="normal"
                  >
                    STATUS
                  </Text>
                </Flex>
              </Th>
              <Th
                textTransform="none"
                fontSize="md"
                paddingBottom="24px"
                width="80%"
              >
                <HStack
                  spacing={2}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Text
                    color="var(--Secondary-6, #718096)"
                    fontFamily="Inter"
                    fontSize="12px"
                    fontStyle="normal"
                    fontWeight="700"
                    lineHeight="normal"
                  >
                    DESCRIPTION
                  </Text>
                  <ProgramSortingModal onSortChange={handleSortChange} />
                </HStack>
              </Th>
              <Th
                textTransform="none"
                fontSize="md"
                paddingBottom="24px"
                width="10%"
              >
                <HStack
                  alignItems="center"
                  justifyContent="space-between"
                  width="100%"
                >
                  <HStack
                    spacing={1}
                    alignItems="center"
                  >
                    <Icon as={CalendarIcon} />
                    <Text
                      color="var(--Secondary-6, #718096)"
                      fontFamily="Inter"
                      fontSize="12px"
                      fontStyle="normal"
                      fontWeight="700"
                      lineHeight="normal"
                    >
                      DATE
                    </Text>
                  </HStack>
                  <DateSortingModal onSortChange={handleSortChange} />
                </HStack>
              </Th>
            </Tr>
          </Thead>

          <Tbody>
            {currentNotifications.length > 0 ? (
              currentNotifications.map((item, index) => (
                <Tr key={index}>
                  <Td paddingLeft="0px">{getNotifType(item.payStatus)}</Td>
                  <Td paddingLeft="24px">
                    {paymentText(
                      item.eventName,
                      item.description,
                      item.id
                    )}
                  </Td>
                  <Td>
                    <Text
                      fontSize="sm"
                      color="#2D3748"
                      letterSpacing="0.07px"
                    >
                      {item.dueTime}
                    </Text>
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={3}>
                  <Flex
                    justify="center"
                    align="center"
                    p={6}
                  >
                    <Text color="gray.500">No notifications to display</Text>
                  </Flex>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>
      {/* Pagination Controls - only show if there's more than one page */}
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
    </>
  );
};

export default NotificationsComponents;
