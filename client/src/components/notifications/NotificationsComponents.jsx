import React from "react";

import { Box, Flex, Text } from "@chakra-ui/react";

import { format } from "date-fns";
import { MdEmail } from "react-icons/md";

const NotificationsComponents = ({ notifications }) => {
  console.log(notifications);

  const paymentText = (eventName, payStatus) => {
    if (payStatus === "overdue") {
      return (
        <Text
          fontSize="sm"
          color="#767778"
        >
          Payment for {" "}
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
          Missing an email for {" "}
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
    <Box
      border="1px solid"
      borderColor="gray.200"
      borderRadius="md"
    >
      {notifications.map((item, index) =>
        paymentRow(item.eventName, item.payStatus, item.dueTime, index)
      )}
    </Box>
  );
};

export default NotificationsComponents;
