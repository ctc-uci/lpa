import { useEffect, useState } from "react";

import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import Navbar from "../Navbar";
import { CounterComponent } from "./Counter";
import { FilterButton } from "./FilterButton";
import styles from "./Notifications.module.css";

export const Notifications = () => {
  const { backend } = useBackendContext();

  const [notifications, setNotifications] = useState([]);
  const [filterType, setFilterType] = useState({
    type: "all",
    startDate: null,
    endDate: null,
  }); // all, overdue, neardue

  useEffect(() => {
    console.log("Current filter:", filterType);
    const fetchNotifs = async () => {
      try {
        let endpoint = "/invoices";
        let queryParams = "";

        // If we have dates, add them as query params regardless of filter type
        if (filterType.startDate && filterType.endDate) {
          queryParams = `?startDate=${filterType.startDate}&endDate=${filterType.endDate}`;
        }

        // Only modify the endpoint if we're filtering by type AND it's not "all"
        if (filterType.type !== "all") {
          endpoint = `/invoices/${filterType.type}${queryParams}`;
        } else {
          endpoint = `/invoices${queryParams}`;
        }

        console.log("Fetching from:", endpoint);
        const notifsResponse = await backend.get(endpoint);
        const notifsData = notifsResponse.data;

        // Handle the response based on what endpoint we hit
        if (
          filterType.type === "all" &&
          notifsData.overdue &&
          notifsData.nearDue
        ) {
          setNotifications([...notifsData.overdue, ...notifsData.nearDue]);
        } else {
          setNotifications(notifsData);
        }
      } catch (err) {
        console.error("Failed to fetch invoices", err);
      }
    };
    fetchNotifs();
  }, [filterType, backend]);

  console.log(notifications); // test output
  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <Navbar />
      <div style={{ marginLeft: "57px", marginTop: "90px", width: "1080px" }}>
        <div
          style={{
            flexDirection: "row",
            display: "flex",
            justifyContent: "space-between",
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
        {/** insert table here */}
      </div>
    </div>
  );
};
