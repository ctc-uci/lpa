import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import Navbar from "../navbar/Navbar";
import { CounterComponent } from "./Counter";
import { FilterButton } from "./FilterButton";
import styles from "./Notifications.module.css";
import NotificationsComponents from "./NotificationsComponents";
import { InboxTab } from "./InboxTab";

export const Notifications = () => {
  const { backend } = useBackendContext();

  const [notifications, setNotifications] = useState([]);
  const [filterType, setFilterType] = useState({
    type: "all",
    startDate: null,
    endDate: null,
  }); // all, overdue, neardue

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

              const endDate = new Date(invoice.endDate);
              const dueTime = formatDistanceToNow(endDate, { addSuffix: true });
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
      <div
        style={{
          marginLeft: "57px",
          marginTop: "90px",
          marginRight: "57px",
          flex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div className={styles.titleContainer}>
            <h1 className={styles.title}>Invoice Notifications</h1>
            <CounterComponent count={notifications.length} />
          </div>
        </div>
        <div style={{display: "flex", flexDirection: "row", gap: "50px", marginBottom: "20px"}}>
          <InboxTab/>
          <FilterButton
            setFilterType={setFilterType}
            currentFilter={filterType}
          />
        </div>
        <NotificationsComponents notifications={notifications} />
      </div>
    </Navbar>
  );
};
