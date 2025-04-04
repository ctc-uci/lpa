import React, { useEffect, useState } from "react";

import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import {
  Button,
  Flex,
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
  HStack,
} from "@chakra-ui/react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import arrowsSvg from "../../assets/icons/right-icon.svg";
import { archiveCalendar } from "../../assets/icons/ProgramIcons";

const NotificationsComponents = ({ notifications }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalNotifications = notifications?.length || 0;
  const totalPages = Math.ceil(totalNotifications / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalNotifications);

  const currentNotifications = notifications?.slice(startIndex, endIndex) || [];

  useEffect(() => {
    setCurrentPage(1);
  }, [notifications]);

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

  const renderPageButtons = () => {
    const pageButtons = [];

    if (totalPages > 0) {
      pageButtons.push(
        <Button
          key={1}
          size="sm"
          colorScheme={currentPage === 1 ? "blue" : "gray"}
          variant={currentPage === 1 ? "solid" : "outline"}
          onClick={() => goToPage(1)}
          mx={1}
        >
          1
        </Button>
      );
    }

    const startPage = Math.max(2, currentPage - 2);
    const endPage = Math.min(currentPage + 2, totalPages - 1);

    if (startPage > 2) {
      pageButtons.push(
        <Text
          key="ellipsis-start"
          mx={1}
        >
          ...
        </Text>
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      pageButtons.push(
        <Button
          key={i}
          size="sm"
          colorScheme={currentPage === i ? "blue" : "gray"}
          variant={currentPage === i ? "solid" : "outline"}
          onClick={() => goToPage(i)}
          mx={1}
        >
          {i}
        </Button>
      );
    }

    if (endPage < totalPages - 1) {
      pageButtons.push(
        <Text
          key="ellipsis-end"
          mx={1}
        >
          ...
        </Text>
      );
    }

    // Always show last page if there's more than one page
    if (totalPages > 1) {
      pageButtons.push(
        <Button
          key={totalPages}
          size="sm"
          colorScheme={currentPage === totalPages ? "blue" : "gray"}
          variant={currentPage === totalPages ? "solid" : "outline"}
          onClick={() => goToPage(totalPages)}
          mx={1}
        >
          {totalPages}
        </Button>
      );
    }

    return pageButtons;
  };

  const getNotifType = (payStatus) => {
    const statusMap = {
      overdue: {
        label: "Past Due",
        color: "#90080F",
        tooltip: "This payment is overdue",
      },
      neardue: {
        label: "Email Not Sent",
        color: "#2D3748",
        tooltip: "Invoice is near due but email not sent",
      },
      highpriority: {
        label: "Both",
        color: "#90080F",
        tooltip: "High priority and overdue",
      },
      default: {
        label: "Other",
        color: "#2D3748",
        tooltip: "Status not categorized",
      },
    };
  
    const { label, color } = statusMap[payStatus] || statusMap.default;
  
    return (
      <HStack spacing={1}>
        <Text color={color} fontWeight={payStatus === "overdue" || payStatus === "highpriority" ? "bold" : "normal"}>
          {label}
        </Text>
        <AiOutlineInfoCircle color="#4A5568"/>
      </HStack>
    );
  };

  const paymentText = (eventName, payStatus) => {
    if (payStatus === "overdue") {
      return (
        <Text
          fontSize="sm"
          color="#767778"
        >
          Payment for{" "}
          <span
            style={{
              color: "#29267D",
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            {eventName}
          </span>{" "}
          is {payStatus}.
        </Text>
      );
    } else if (payStatus === "neardue") {
      return (
        <Text
          fontSize="sm"
          color="#767778"
        >
          <span
            style={{
              color: "#29267D",
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            {eventName}
          </span>{" "}
          not sent to Payer(s).
        </Text>
      );
    } else {
      return (
        <Text
          fontSize="sm"
          color="#767778"
        >
          Missing an email for{" "}
          <span
            style={{
              color: "#29267D",
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            {eventName}
          </span>{" "}
          and is overdue.
        </Text>
      );
    }
  };

  return (
    <>
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th textTransform="none" fontSize="md">  
                <Text>STATUS</Text>
              </Th>
              <Th textTransform="none" fontSize="md">
                <HStack spacing={2} alignItems="center">
                  <Text>DESCRIPTION</Text>
                  <Image src={arrowsSvg} />
                </HStack>
              </Th>
              <Th textTransform="none" fontSize="md">
                <HStack spacing={2} alignItems="center">
                  <Icon as={archiveCalendar} />
                  <Text>DATE</Text>
                  <Image src={arrowsSvg} />
                </HStack>
              </Th>
            </Tr>
          </Thead>

          <Tbody>
            {currentNotifications.length > 0 ? (
              currentNotifications.map((item, index) => (
                <Tr key={index}>
                  <Td>{getNotifType(item.payStatus)}</Td>
                  <Td>{paymentText(item.eventName, item.payStatus)}</Td>
                  <Td>
                    <Text fontSize="sm" color="#767778">
                      {item.dueTime}
                    </Text>
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={3}>
                  <Flex justify="center" align="center" p={6}>
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
          justifyContent="center"
          mt={4}
          mb={2}
        >
          <Button
            leftIcon={<ChevronLeftIcon />}
            onClick={goToPreviousPage}
            isDisabled={currentPage === 1}
            size="sm"
            mr={2}
            variant="outline"
            colorScheme="blue"
          >
            Prev
          </Button>

          <HStack spacing={1}>{renderPageButtons()}</HStack>

          <Button
            rightIcon={<ChevronRightIcon />}
            onClick={goToNextPage}
            isDisabled={currentPage === totalPages}
            size="sm"
            ml={2}
            variant="outline"
            colorScheme="blue"
          >
            Next
          </Button>
        </Flex>
      )}
    </>
  );
};

export default NotificationsComponents;
