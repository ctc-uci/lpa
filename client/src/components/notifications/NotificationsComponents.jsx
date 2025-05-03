import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { HStack, Flex, Icon, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";

import { CalendarIcon } from "./CalendarIcon";
import DateSortingModal from "../filters/DateFilter";
import ProgramSortingModal from "../filters/ProgramFilter";
import { InfoTooltip } from "./InfoTooltip";

const NotificationsComponents = ({ 
  notifications, 
  currentPage, 
  itemsPerPage,
  sortKey, 
  sortOrder, 
  onSortChange 
}) => {
  const navigator = useNavigate();
  const [sortedNotifications, setSortedNotifications] = useState([]);
  
  // Calculate pagination values
  const totalNotifications = notifications?.length || 0;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalNotifications);
  
  // Get current page's notifications
  const currentNotifications = sortedNotifications?.slice(startIndex, endIndex) || [];

  // Sort notifications when sort parameters or data changes
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
    <TableContainer padding={"16px"}>
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
                <ProgramSortingModal onSortChange={onSortChange} />
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
                <DateSortingModal onSortChange={onSortChange} />
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
  );
};

export default NotificationsComponents;