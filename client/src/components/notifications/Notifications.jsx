import { useEffect, useState } from "react";

import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import Navbar from "../Navbar";
import NotificationsComponents from "./NotificationsComponents";
import { CounterComponent } from "./Counter";
import { FilterButton } from "./FilterButton";
import styles from "./Notifications.module.css";
import { isBefore, isWithinInterval, formatDistanceToNow } from 'date-fns';

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
        const notifsResponse = await backend.get("/invoices");
        const notifsData = notifsResponse.data;
        const today = new Date();

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
              const total = totalRes.data.total;
              const paid = paidRes.data.paid;
              let payStatus = "upcoming";

              if (total !== paid) {
                if (isBefore(endDate, today)) {
                  payStatus = "overdue";
                } else if (isWithinInterval(endDate, { start: today, end: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) })) {
                  payStatus = "due in one week";
                }
              }

              const dueTime = formatDistanceToNow(endDate, { addSuffix: true });

              return {
                ...invoice,
                eventName: eventRes.data[0]?.name || "Unknown Event",
                total,
                paid,
                payStatus,
                dueTime
              };
            } catch (err) {
              console.error(`Failed to fetch additional data for invoice ID: ${invoice.id}`, err);
              return {
                ...invoice,
                eventName: "Unknown Event",
                total: 0,
                paid: 0,
                payStatus: "unknown",
                dueTime: "N/A",
              };
            }
          })
        );

        // Filter invoices based on filterType
        const filteredInvoices = enrichedInvoices.filter((invoice) => {
          const endDate = new Date(invoice.endDate);

          // Filter by type
          if (filterType.type === "overdue" && invoice.payStatus !== "overdue") return false;
          if (filterType.type === "neardue" && invoice.payStatus !== "due in one week") return false;

          // Filter by date range if provided
          const startDate = filterType.startDate ? new Date(filterType.startDate) : null;
          const filterEndDate = filterType.endDate ? new Date(filterType.endDate) : null;

          if (startDate && endDate < startDate) return false;
          if (filterEndDate && endDate > filterEndDate) return false;

          return true;
        });

        setNotifications(filteredInvoices);

      } catch (err) {
        console.error("Failed to fetch invoices", err);
      }
    };
    fetchNotifs();
  }, [filterType, backend]);

  return (
    <div style={{ display: "flex", flexDirection: "row", height: "100vh" }}>
      <Navbar />
      <div style={{ marginLeft: "57px", marginTop: "90px", width: "1080px", flex: 1 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingRight: "20px",
          }}
        >
          <div className={styles.titleContainer}>
            <h1 className={styles.title}>Invoice Notifications</h1>
            <CounterComponent count={notifications.length} />
          </div>

          <FilterButton
            setFilterType={setFilterType}
            currentFilter={filterType}
          />
        </div>
        <NotificationsComponents notifications={notifications} />
      </div>
    </div>
  );
};
