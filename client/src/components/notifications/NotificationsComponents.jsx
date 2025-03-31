import React, { useEffect, useState } from "react";

import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { Box, Button, Flex, HStack, Text } from "@chakra-ui/react";

import { MdEmail } from "react-icons/md";

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
              color: "#2E79C3",
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
              color: "#2E79C3",
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
              color: "#2E79C3",
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

  const paymentRow = (eventName, payStatus, dueTime, index) => {
    let notifType = "";
    if (payStatus === "overdue") {
      notifType = "Payment Past Due";
    } else if (payStatus === "neardue") {
      notifType = "Email Not Sent";
    } else if (payStatus === "highpriority") {
      notifType = "High Priority";
    }

    return (
      <Flex
        key={index}
        p={4}
        align="center"
        justify="space-between"
      >
        <Flex align="center">
          <Box
            borderLeft="4px solid"
            borderColor={
              payStatus === "overdue"
                ? "#90080F"
                : payStatus === "neardue"
                  ? "#DAB434"
                  : "#ffa500"
            }
            h="40px"
            mr={3}
          ></Box>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="full"
            border="1px solid"
            borderColor="gray.300"
            boxSize="40px"
            mr={3}
          >
            <MdEmail
              size={20}
              color="#474849"
            />
          </Box>
          <Box>
            <div style={{ display: "flex", flexDirection: "row" }}>
              <Text
                color={"var(--dark-grey)"}
                fontFamily={"Inter, sans-serif"}
                fontSize={"18px"}
                width={"200px"}
              >
                {notifType}
              </Text>
              {paymentText(eventName, payStatus)}
            </div>{" "}
          </Box>
        </Flex>
        <Text
          fontSize="sm"
          color="#767778"
        >
          {dueTime}
        </Text>
      </Flex>
    );
  };

  return (
    <>
      <Box
        border="1px solid"
        borderColor="gray.200"
        borderRadius="md"
      >
        {currentNotifications.length > 0 ? (
          currentNotifications.map((item, index) =>
            paymentRow(item.eventName, item.payStatus, item.dueTime, index)
          )
        ) : (
          <Flex
            justify="center"
            align="center"
            p={6}
          >
            <Text color="gray.500">No notifications to display</Text>
          </Flex>
        )}
      </Box>

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
