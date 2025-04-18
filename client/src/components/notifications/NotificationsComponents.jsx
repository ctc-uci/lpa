import React, { useEffect, useState } from "react";

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
import arrowsSvg from "../../assets/icons/right-icon.svg";
import DateSortingModal from "../filters/DateFilter";
import ProgramSortingModal from "../filters/ProgramFilter";
import { InfoTooltip } from "./InfoTooltip";

const NotificationsComponents = ({ notifications }) => {
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

  const paymentText = (eventName, payStatus, description) => {
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
        {description} <span style={linkStyles}>{eventName}</span>.
      </Text>
    );
  };
  const CalendarIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        d="M3.5 0C3.63261 0 3.75979 0.0526784 3.85355 0.146447C3.94732 0.240215 4 0.367392 4 0.5V1H12V0.5C12 0.367392 12.0527 0.240215 12.1464 0.146447C12.2402 0.0526784 12.3674 0 12.5 0C12.6326 0 12.7598 0.0526784 12.8536 0.146447C12.9473 0.240215 13 0.367392 13 0.5V1H14C14.5304 1 15.0391 1.21071 15.4142 1.58579C15.7893 1.96086 16 2.46957 16 3V14C16 14.5304 15.7893 15.0391 15.4142 15.4142C15.0391 15.7893 14.5304 16 14 16H2C1.46957 16 0.960859 15.7893 0.585786 15.4142C0.210714 15.0391 0 14.5304 0 14V3C0 2.46957 0.210714 1.96086 0.585786 1.58579C0.960859 1.21071 1.46957 1 2 1H3V0.5C3 0.367392 3.05268 0.240215 3.14645 0.146447C3.24021 0.0526784 3.36739 0 3.5 0V0ZM13.454 3H2.545C2.245 3 2 3.224 2 3.5V4.5C2 4.776 2.244 5 2.545 5H13.455C13.755 5 14 4.776 14 4.5V3.5C14 3.224 13.756 3 13.454 3ZM11.5 7C11.3674 7 11.2402 7.05268 11.1464 7.14645C11.0527 7.24021 11 7.36739 11 7.5V8.5C11 8.63261 11.0527 8.75979 11.1464 8.85355C11.2402 8.94732 11.3674 9 11.5 9H12.5C12.6326 9 12.7598 8.94732 12.8536 8.85355C12.9473 8.75979 13 8.63261 13 8.5V7.5C13 7.36739 12.9473 7.24021 12.8536 7.14645C12.7598 7.05268 12.6326 7 12.5 7H11.5Z"
        fill="#718096"
      />
    </svg>
  );

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
                      item.payStatus,
                      item.description
                    )}
                  </Td>
                  <Td>
                    <Text
                      fontSize="sm"
                      color="#767778"
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
