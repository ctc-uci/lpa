import { useEffect, useState } from "react";

import { Box, Flex } from "@chakra-ui/react";

import { formatDistanceToNow } from "date-fns";
import { AiFillMail } from "react-icons/ai";

import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import Navbar from "../navbar/Navbar";
import { FilterButton } from "./FilterButton";
import styles from "./Notifications.module.css";
import NotificationsComponents from "./NotificationsComponents";
import { NotificationFilter } from "./NotificationFIlterModal";

export const Notifications = () => {
  const { backend } = useBackendContext();

  const [notifications, setNotifications] = useState([]);
  const [filterType, setFilterType] = useState({
    type: "all",
    startDate: null,
    endDate: null,
  }); // all, overdue, neardue

  const getDueTime = (endDate) => {
    const now = new Date();
    const msInDay = 1000 * 60 * 60 * 24;
    const daysDiff = (endDate - now) / msInDay;

    // console.log("Days difference:", daysDiff);
    if (daysDiff >= 0 && daysDiff <= 7) {
      return formatDistanceToNow(endDate, { addSuffix: true });
    } else {
      return endDate
        .toLocaleDateString("en-US", {
          weekday: "short",
          month: "numeric",
          day: "numeric",
          year: "numeric",
        })
        .replace(/,/g, ".");
    }
  };


  const getDescription = (payStatus, payers) => {
    console.log("PAYERS", payers);
    
    if (!payers || !payers.length) {
      return getBaseDescription(payStatus, "unknown recipients");
    }
    
    const instructorNames = payers
      .filter(payer => payer.role === "instructor")
      .map(payer => payer.clientName)
      .filter(name => name && name.trim() !== ""); 
    
    if (instructorNames.length === 0) {
      return getBaseDescription(payStatus, "unknown recipients");
    }
    
    const formattedNames = instructorNames.length === 1 
      ? instructorNames[0]
      : `${instructorNames.slice(0, -1).join(", ")}, and ${instructorNames[instructorNames.length - 1]}`;
    
    return getBaseDescription(payStatus, formattedNames);
  };
  
  const getBaseDescription = (payStatus, names) => {
    if (payStatus === "overdue") {
      return `Payment not recorded 5 days or more since the payment deadline for `;
    } else if (payStatus === "neardue") {
      return `Email has not been sent to ${names} 1 week before the payment deadline for `;
    } else { // highpriority
      return `Email has not been sent to ${names} 1 week prior and payment not received 5 days past the deadline for `;
    }
  };

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const today = new Date();
        let endpoints = [];
  
        // Only modify the endpoint if we're filtering by type AND it's not "all"
        if (filterType.type === "all") {
          endpoints = [
            `/invoices/overdue`,
            `/invoices/neardue`,
            `/invoices/highpriority`,
          ];
        } else {
          endpoints = [`/invoices/${filterType.type}`];
        }
  
        const responses = await Promise.all(
          endpoints.map((endpoint) => backend.get(endpoint))
        );
  
        const notifsData = responses.flatMap((res) => res.data);
  
        // Fetch additional data for each invoice (total, paid, event name)
        const enrichedInvoices = await Promise.all(
          notifsData.map(async (invoice) => {
            try {
              const [totalRes, paidRes, eventRes] = await Promise.all([
                backend.get(`/invoices/total/${invoice.id}`),
                backend.get(`/invoices/paid/${invoice.id}`),
                backend.get(`/events/${invoice.eventId}`),
              ]);
  
              const eventId = eventRes.data[0]?.id;
              const payersRes = await backend.get(`/assignments/event/${eventId}`);
              console.log("HERE", payersRes);
  
              const endDate = new Date(invoice.endDate);
              const dueTime = getDueTime(endDate);
              let payStatus = "";
              if (endDate < today && invoice.isSent) {
                payStatus = "overdue";
              } else if (endDate < today && !invoice.isSent) {
                payStatus = "highpriority";
              } else {
                payStatus = "neardue";
              }
  
              return {
                ...invoice,
                eventName: eventRes.data[0]?.name || "Unknown Event",
                total: totalRes.data.total,
                paid: paidRes.data.paid,
                payStatus,
                description: getDescription(payStatus, payersRes.data),
                dueTime,
              };
            } catch (err) {
              console.error(
                `Failed to fetch additional data for invoice ID: ${invoice.id}`,
                err
              );
              return {
                ...invoice,
                eventName: "Unknown Event",
                total: 0,
                paid: 0,
                payStatus: "Unknown",
                dueTime: "Unknown",
                payers: [],
              };
            }
          })
        );
  
        setNotifications(enrichedInvoices); // attaches additional info onto invoices
      } catch (err) {
        console.error("Failed to fetch invoices", err);
      }
    };
    fetchNotifs();
  }, [filterType, backend]);


  return (
    <Navbar currentPage="notifications">
      <Box
        padding="26px"
        // border="1px"
      >
        <Flex
          align="center"
          gap={5}
          height="34px"
          padding="0px 19px 0px 8px"
          flex-shrink="0"
          mb="27px"
        >
          <AiFillMail size={28} />
          <h1 className={styles.title}>Invoice Notifications</h1>
        </Flex>
        <Flex
          w="100%"
          flexDirection="column"
          padding="20px"
          border="1px solid var(--medium-light-grey)"
          borderRadius="12px"
        >
          <Flex
            justifyContent="space-between"
            mb="27px"
          >
            {/* <NotificationFilter/> */}
            <FilterButton
              setFilterType={setFilterType}
              currentFilter={filterType}
            />
          </Flex>
          <NotificationsComponents notifications={notifications} />
        </Flex>
      </Box>
    </Navbar>
  );
};
