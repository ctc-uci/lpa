import {
  Document,
  Image,
  Page,
  Path,
  StyleSheet,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer";
import { format } from "date-fns";

import InvoiceFooter from "../../assets/background/InvoiceFooter.png";
import InvoiceHeader from "../../assets/background/InvoiceHeader.png";
import logo from "../../assets/logo/logo.png";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: "#ffffff",
    flexDirection: "column",
  },
  section: {
    margin: 10,
    padding: 20,
    borderRadius: 5,
    backgroundColor: "#f8f9fa",
    borderBottom: "1px solid #eee",
  },
  header: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 10,
    color: "#2c3e50",
  },
  row: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "center",
  },
  label: {
    width: 100,
    fontSize: 12,
    color: "#666",
    marginRight: 10,
  },
  value: {
    flex: 1,
    fontSize: 12,
    color: "#333",
  },
  dateTime: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  timeBlock: {
    flex: 1,
  },
});

const getGeneratedDate = (comments = [], invoice = null, includeDay = true) => {
  if (comments.length > 0) {
    const latestComment = comments.sort(
      (a, b) => new Date(b.datetime) - new Date(a.datetime)
    )[0];

    const latestDate = new Date(latestComment.datetime);
    const month = latestDate.toLocaleString("default", { month: "long" });
    const day = latestDate.getDate();
    const year = latestDate.getFullYear();

    return includeDay ? `${month} ${day}, ${year}` : `${month} ${year}`;
  } else if (invoice) {
    const invoiceDateSplit = invoice[0]?.startDate?.split("T")[0];
    const invoiceDate = new Date(invoiceDateSplit);
    invoiceDate.setMinutes(
      invoiceDate.getMinutes() + invoiceDate.getTimezoneOffset()
    );
    const month = invoiceDate.toLocaleString("default", { month: "long" });
    const year = invoiceDate.getFullYear();
    return `${month} ${year}`;
  } else {
    return "No Date Found";
  }
};

const EditInvoiceTitle = ({ comments, invoice }) => {
  return (
    <View style={{ marginTop: 16 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View>
          <Text
            style={{
              color: "#2D3748",
              fontSize: "28px",
              fontWeight: "600",
            }}
          >
            INVOICE
          </Text>
          <Text style={{ color: "#718096", fontSize: "12px" }}>
            Generated on {getGeneratedDate(comments, invoice.data, true)}
          </Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          <View
            style={{
              alignItems: "flex-end",
            }}
          >
            <Text
              style={{ fontSize: "10px", textAlign: "right", color: "#2D3748" }}
            >
              La Peña Cultural Center
            </Text>
            <Text
              style={{ fontSize: "10px", textAlign: "right", color: "#2D3748" }}
            >
              3105 Shattuck Ave., Berkeley, CA 94705
            </Text>
            <Text
              style={{ fontSize: "10px", textAlign: "right", color: "#2D3748" }}
            >
              lapena.org
            </Text>
          </View>

          <Image
            src={logo}
            style={{ width: "75px" }}
          />
        </View>
      </View>
    </View>
  );
};

const EditInvoiceDetailsPDF = ({
  instructors,
  programName,
  payees,
  comments,
  invoice,
}) => {
  return (
    <View
      style={{
        color: "#2D3748",
        paddingHorizontal: 16,
      }}
    >
      {/* Header */}
      <View style={{ marginBottom: 12 }}>
        <Text
          style={{
            textAlign: "center",
            fontSize: 12,
            marginBottom: 4,
            fontWeight: 600,
          }}
        >
          Classroom Rental Monthly Statement
        </Text>
        <Text
          style={{
            textAlign: "center",
            fontSize: 10,
            fontWeight: 500,
          }}
        >
          {getGeneratedDate([], invoice.data, false)}
        </Text>
      </View>

      {/* Main content row */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        {/* Left column */}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 8,
              marginBottom: 4,
              color: "#718096",
            }}
          >
            Recurring Program:
          </Text>
          <Text style={{ fontSize: 8, marginBottom: 8 }}>
            {programName || "No program name found"}
          </Text>

          <Text
            style={{
              fontWeight: "bold",
              fontSize: 8,
              marginBottom: 4,
              color: "#718096",
            }}
          >
            Designated Payers:
          </Text>
          {payees && payees.length > 0 ? (
            payees.map((payee, index) => (
              <Text
                key={index}
                style={{ fontSize: 8, marginBottom: 2 }}
              >
                {payee.name} - {payee.email}
              </Text>
            ))
          ) : (
            <Text style={{ fontSize: 8 }}>No payees found.</Text>
          )}
        </View>

        {/* Right column */}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 8,
              marginBottom: 4,
              color: "#718096",
            }}
          >
            Lead Artist(s):
          </Text>
          {instructors && instructors.length > 0 ? (
            instructors.map((instructor, index) => (
              <Text
                key={index}
                style={{ fontSize: 8, marginBottom: 2 }}
              >
                {instructor.name} - {instructor.email}
              </Text>
            ))
          ) : (
            <Text style={{ fontSize: 8 }}>No instructors found.</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const tableStyles = StyleSheet.create({
  section: {
    padding: 10,
  },
  heading: {
    marginBottom: 10,
    fontWeight: 600,
    borderBottomWidth: 1,
    borderColor: "#000",
  },
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    borderRightWidth: 0,
    borderBottomWidth: 0,
    border: "1px solid #D2D2D2",
    borderRadius: "8px",
    paddingHorizontal: "12px",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#f3f6fa",
    paddingVertical: 12,
    paddingLeft: 8,
  },
  tableCol: {
    width: "16.66%",
    padding: 4,
  },
});

const formatTimeString = (timeStr) => {
  if (!timeStr) {
    return "N/A";
  }
  const timePart = timeStr.split("-")[0]?.substring(0, 5); // Added optional chaining
  if (!timePart) {
    return "N/A";
  }

  const [hours, minutes] = timePart.split(":").map(Number);
  const period = hours >= 12 ? "pm" : "am";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
};

const calculateNewRate = (session, summary) => {
  let newRate = Number(session.rate || 0);

  // Apply summary adjustments first
  summary[0]?.adjustmentValues?.forEach((adj) => {
    const val = Number(adj.value);
    const isNegative = val < 0;
    const numericPart = Math.abs(val);

    let adjustmentAmount = 0;

    if (adj.type === "rate_flat") {
      adjustmentAmount = numericPart;
    } else if (adj.type === "rate_percent") {
      adjustmentAmount = (numericPart / 100) * Number(newRate || 0);
    }

    if (isNegative) {
      newRate -= adjustmentAmount;
    } else {
      newRate += adjustmentAmount;
    }
  });

  // Then apply session adjustments
  session.adjustmentValues?.forEach((adj) => {
    const val = Number(adj.value);
    const isNegative = val < 0;
    const numericPart = Math.abs(val);

    let adjustmentAmount = 0;

    if (adj.type === "rate_flat") {
      adjustmentAmount = numericPart;
    } else if (adj.type === "rate_percent") {
      adjustmentAmount = (numericPart / 100) * Number(newRate || 0);
    }

    if (isNegative) {
      newRate -= adjustmentAmount;
    } else {
      newRate += adjustmentAmount;
    }
  });

  return newRate;
};

const calculateTotalBookingRow = ({
  startTime = "00:00:00+00",
  endTime = "01:00:00+00",
  rate = 0,
  adjustmentValues = [],
  totalArray = [],
}) => {
  if (!startTime || !endTime || !rate) return "0.00";

  // Make sure we're working with valid arrays
  const currentAdjustmentValues = Array.isArray(adjustmentValues)
    ? adjustmentValues.filter((adj) => adj && adj.type)
    : [];
  const currentTotalArray = Array.isArray(totalArray) ? totalArray : [];

  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const rawStart = timeToMinutes(startTime.substring(0, 5));
  const rawEnd = timeToMinutes(endTime.substring(0, 5));
  const endAdjusted = rawEnd <= rawStart ? rawEnd + 24 * 60 : rawEnd;
  const durationInHours = (endAdjusted - rawStart) / 60;

  const baseRate = Number(rate);

  // Calculate adjustments to the rate
  const adjustedRate = currentAdjustmentValues.reduce((currentRate, adj) => {
    if (!adj || !adj.type || adj.value === undefined) return currentRate;

    const numericValue = Number(adj.value);
    if (isNaN(numericValue)) return currentRate;

    const numericPart = Math.abs(numericValue);
    let adjustmentAmount = 0;

    if (adj.type === "rate_flat") {
      adjustmentAmount = numericPart;
    } else if (adj.type === "rate_percent") {
      adjustmentAmount = (numericPart / 100) * currentRate;
    }

    return numericValue < 0
      ? currentRate - adjustmentAmount
      : currentRate + adjustmentAmount;
  }, baseRate);

  // Calculate the base total with adjusted rate
  const baseTotal = adjustedRate * durationInHours;

  // Add any "total" type adjustments
  const totalAdjustments = currentAdjustmentValues
    .filter((adj) => adj && adj.type === "total")
    .reduce((sum, adj) => sum + Number(adj.value || 0), 0);

  // Add all values from the total array
  const totalArraySum = currentTotalArray.reduce((sum, item) => {
    const value = Number(item.value);
    return sum + (isNaN(value) ? 0 : value);
  }, 0);

  // Combine all totals
  const finalTotal = baseTotal + totalAdjustments + totalArraySum;
  return finalTotal.toFixed(2);
};

const calculateSubtotal = (sessions) => {
  if (!sessions || sessions.length === 0) return "0.00";

  const adjSum = sessions.reduce((acc, session) => {
    // Check if session has adjustmentValues and it's not empty
    if (!session.adjustmentValues || session.adjustmentValues.length === 0) {
      // Calculate without adjustments
      const total = parseFloat(
        calculateTotalBookingRow(
          session.startTime,
          session.endTime,
          session.rate,
          []
        )
      );
      return acc + total;
    }

    const total = parseFloat(
      calculateTotalBookingRow(
        session.startTime,
        session.endTime,
        session.rate,
        session.adjustmentValues
      )
    );
    return acc + total;
  }, 0);

  const totalSum = sessions.reduce((acc, session) => {
    const total = parseFloat(
      session.total.reduce((sum, item) => sum + Number(item.value || 0), 0)
    );
    return acc + total;
  }, 0);

  const finalTotal = adjSum + totalSum;

  const total = finalTotal.toFixed(2);
  return total;
};

const InvoiceTable = ({ sessions, summary }) => {
  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 2 }}>
        <Svg
          width="14"
          height="14"
          viewBox="0 0 16 21"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <Path
            d="M2 20.5C1.45 20.5 0.979333 20.3043 0.588 19.913C0.196666 19.5217 0.000666667 19.0507 0 18.5V2.5C0 1.95 0.196 1.47933 0.588 1.088C0.98 0.696667 1.45067 0.500667 2 0.5H14C14.55 0.5 15.021 0.696 15.413 1.088C15.805 1.48 16.0007 1.95067 16 2.5V18.5C16 19.05 15.8043 19.521 15.413 19.913C15.0217 20.305 14.5507 20.5007 14 20.5H2ZM7 2.5V8.625C7 8.825 7.07933 8.971 7.238 9.063C7.39667 9.155 7.56733 9.15067 7.75 9.05L8.975 8.325C9.14167 8.225 9.31267 8.175 9.488 8.175C9.66333 8.175 9.834 8.225 10 8.325L11.225 9.05C11.4083 9.15 11.5833 9.15433 11.75 9.063C11.9167 8.97167 12 8.82567 12 8.625V2.5H7Z"
            fill="#2D3748"
          />
        </Svg>
        <Text
          style={{
            fontSize: "12px",
            marginLeft: 4,
            marginBottom: 8,
            fontWeight: "bold",
          }}
        >
          Sessions
        </Text>
      </View>
      <View style={tableStyles.table}>
        {/* Header Row */}
        <View style={{ ...tableStyles.tableRow }}>
          <View style={tableStyles.tableCol}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <Svg
                xmlns="http://www.w3.org/2000/svg"
                width="10"
                height="10"
                viewBox="0 0 16 16"
                fill="none"
              >
                <Path
                  d="M3.5 0C3.63261 0 3.75979 0.0526784 3.85355 0.146447C3.94732 0.240215 4 0.367392 4 0.5V1H12V0.5C12 0.367392 12.0527 0.240215 12.1464 0.146447C12.2402 0.0526784 12.3674 0 12.5 0C12.6326 0 12.7598 0.0526784 12.8536 0.146447C12.9473 0.240215 13 0.367392 13 0.5V1H14C14.5304 1 15.0391 1.21071 15.4142 1.58579C15.7893 1.96086 16 2.46957 16 3V14C16 14.5304 15.7893 15.0391 15.4142 15.4142C15.0391 15.7893 14.5304 16 14 16H2C1.46957 16 0.960859 15.7893 0.585786 15.4142C0.210714 15.0391 0 14.5304 0 14V3C0 2.46957 0.210714 1.96086 0.585786 1.58579C0.960859 1.21071 1.46957 1 2 1H3V0.5C3 0.367392 3.05268 0.240215 3.14645 0.146447C3.24021 0.0526784 3.36739 0 3.5 0V0ZM13.454 3H2.545C2.245 3 2 3.224 2 3.5V4.5C2 4.776 2.244 5 2.545 5H13.455C13.755 5 14 4.776 14 4.5V3.5C14 3.224 13.756 3 13.454 3ZM11.5 7C11.3674 7 11.2402 7.05268 11.1464 7.14645C11.0527 7.24021 11 7.36739 11 7.5V8.5C11 8.63261 11.0527 8.75979 11.1464 8.85355C11.2402 8.94732 11.3674 9 11.5 9H12.5C12.6326 9 12.7598 8.94732 12.8536 8.85355C12.9473 8.75979 13 8.63261 13 8.5V7.5C13 7.36739 12.9473 7.24021 12.8536 7.14645C12.7598 7.05268 12.6326 7 12.5 7H11.5Z"
                  fill="#718096"
                />
              </Svg>
              <Text style={{ fontSize: 7, fontWeight: 600 }}>Date</Text>
            </View>
          </View>
          <View style={tableStyles.tableCol}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 2 }}
            >
              <Svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 12 18"
                fill="none"
              >
                <Path
                  d="M5.83333 0.666992C2.60833 0.666992 0 3.27533 0 6.50033C0 10.8753 5.83333 17.3337 5.83333 17.3337C5.83333 17.3337 11.6667 10.8753 11.6667 6.50033C11.6667 3.27533 9.05833 0.666992 5.83333 0.666992ZM5.83333 8.58366C5.2808 8.58366 4.7509 8.36417 4.36019 7.97346C3.96949 7.58276 3.75 7.05286 3.75 6.50033C3.75 5.94779 3.96949 5.41789 4.36019 5.02719C4.7509 4.63649 5.2808 4.41699 5.83333 4.41699C6.38587 4.41699 6.91577 4.63649 7.30647 5.02719C7.69717 5.41789 7.91667 5.94779 7.91667 6.50033C7.91667 7.05286 7.69717 7.58276 7.30647 7.97346C6.91577 8.36417 6.38587 8.58366 5.83333 8.58366Z"
                  fill="#718096"
                />
              </Svg>
              <Text style={{ fontSize: 7, fontWeight: 600, color: "#718096" }}>
                Classroom
              </Text>
            </View>
          </View>
          <View style={tableStyles.tableCol}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 2 }}
            >
              <Svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 20 20"
                fill="none"
              >
                <Path
                  d="M14.168 2.78357C15.4249 3.50928 16.4704 4.55067 17.2011 5.80465C17.9319 7.05863 18.3224 8.48171 18.3342 9.93302C18.3459 11.3843 17.9784 12.8135 17.268 14.0792C16.5576 15.3448 15.529 16.4029 14.284 17.1488C13.039 17.8948 11.6208 18.3026 10.1697 18.332C8.71866 18.3613 7.28509 18.0112 6.01093 17.3163C4.73677 16.6213 3.66619 15.6057 2.90519 14.3698C2.14419 13.134 1.71914 11.7208 1.67214 10.2702L1.66797 10.0002L1.67214 9.73024C1.7188 8.29106 2.13759 6.88854 2.88767 5.6594C3.63774 4.43026 4.69351 3.41645 5.95204 2.7168C7.21058 2.01716 8.62892 1.65557 10.0688 1.66727C11.5087 1.67897 12.921 2.06357 14.168 2.78357ZM10.0013 5.00024C9.79719 5.00026 9.60019 5.0752 9.44766 5.21083C9.29513 5.34646 9.19768 5.53336 9.1738 5.73607L9.16797 5.83357V10.0002L9.17547 10.1094C9.19447 10.254 9.25108 10.391 9.33963 10.5069L9.41213 10.5902L11.9121 13.0902L11.9905 13.1586C12.1366 13.272 12.3163 13.3335 12.5013 13.3335C12.6863 13.3335 12.866 13.272 13.0121 13.1586L13.0905 13.0894L13.1596 13.0111C13.273 12.8649 13.3346 12.6852 13.3346 12.5002C13.3346 12.3153 13.273 12.1355 13.1596 11.9894L13.0905 11.9111L10.8346 9.6544V5.83357L10.8288 5.73607C10.8049 5.53336 10.7075 5.34646 10.5549 5.21083C10.4024 5.0752 10.2054 5.00026 10.0013 5.00024Z"
                  fill="#718096"
                />
              </Svg>
              <Text style={{ fontSize: 7, fontWeight: 600, color: "#718096" }}>
                Rental Hours
              </Text>
            </View>
          </View>
          <View style={tableStyles.tableCol}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 2 }}
            >
              <Svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 16 20"
                fill="none"
              >
                <Path
                  d="M1.78273 0.5C0.802228 0.5 0 1.31429 0 2.30952V16.7857C0 17.781 0.802228 18.5952 1.78273 18.5952H5.34819V16.8762L14.2618 7.82857V5.92857L8.91365 0.5H1.78273ZM8.02228 1.85714L12.9248 6.83333H8.02228V1.85714ZM14.351 10.4524C14.2618 10.4524 14.0836 10.5429 13.9944 10.6333L13.1031 11.5381L14.9749 13.4381L15.8663 12.5333C16.0446 12.3524 16.0446 11.9905 15.8663 11.8095L14.7075 10.6333C14.6184 10.5429 14.5292 10.4524 14.351 10.4524ZM12.5682 12.081L7.13092 17.6V19.5H9.00279L14.4401 13.981L12.5682 12.081Z"
                  fill="#718096"
                />
              </Svg>
              <View>
                <Text
                  style={{ fontSize: 7, fontWeight: 600, color: "#718096" }}
                >
                  Room Fee
                </Text>
                <Text
                  style={{ fontSize: 7, fontWeight: 600, color: "#718096" }}
                >
                  Adjustment
                </Text>
              </View>
            </View>
          </View>
          <View
            style={{
              ...tableStyles.tableCol,
              alignItems: "flex-end",
              paddingRight: 20,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 2 }}
            >
              <Svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 12 20"
                fill="none"
              >
                <Path
                  d="M10 6.5H12C12 3.663 9.245 2.369 7 2.071V0H5V2.071C2.755 2.369 0 3.663 0 6.5C0 9.206 2.666 10.613 5 10.93V15.9C3.552 15.649 2 14.876 2 13.5H0C0 16.089 2.425 17.619 5 17.936V20H7V17.93C9.245 17.632 12 16.337 12 13.5C12 10.663 9.245 9.369 7 9.071V4.1C8.33 4.339 10 5.041 10 6.5ZM2 6.5C2 5.041 3.67 4.339 5 4.1V8.899C3.629 8.646 2 7.897 2 6.5ZM10 13.5C10 14.959 8.33 15.661 7 15.9V11.1C8.33 11.339 10 12.041 10 13.5Z"
                  fill="#718096"
                />
              </Svg>
              <Text style={{ fontSize: 7, fontWeight: 600, color: "#718096" }}>
                Room Fee
              </Text>
            </View>
          </View>
          <View
            style={{
              ...tableStyles.tableCol,
              alignItems: "flex-end",
              paddingRight: 20,
            }}
          >
            <Text style={{ fontSize: 7, fontWeight: 600, color: "#718096" }}>
              Total
            </Text>
          </View>
        </View>

        {/* Data Rows */}
        {sessions
          .filter((session) => session.name.length === 0)
          .map((session, index) =>
            session.total?.map((total, totalIndex) => {
              return (
                <View
                  key={`total-${index}-${totalIndex}`}
                  style={tableStyles.tableRow}
                >
                  <View style={tableStyles.tableCol}>
                    <Text style={{ fontSize: 7 }}>
                      {(() => {
                        const date = new Date(total.date);
                        date.setMinutes(
                          date.getMinutes() + date.getTimezoneOffset()
                        );
                        return format(date, "EEE. M/d/yy");
                      })()}
                    </Text>
                  </View>
                  <View style={{ ...tableStyles.tableCol, flex: 4 }}>
                    <Text style={{ fontSize: 7 }}>
                      {total.comment || "Custom adjustment"}
                    </Text>
                  </View>
                  <View
                    style={{
                      ...tableStyles.tableCol,
                      alignItems: "flex-end",
                      paddingRight: 20,
                    }}
                  >
                    <Text style={{ fontSize: 7 }}>
                      $ {Number(total.value || 0).toFixed(2)}
                    </Text>
                  </View>
                </View>
              );
            })
          )}

        {sessions
          ?.filter((session) => session.name.length > 0)
          .flatMap((session, index) => {
            const sessionRows = (
              <View
                style={tableStyles.tableRow}
                key={`${index}-${session.bookingDate}`}
              >
                <View style={tableStyles.tableCol}>
                  <Text style={{ fontSize: 7 }}>
                    {format(new Date(session.bookingDate), "EEE. M/d/yy")}
                  </Text>
                </View>
                <View style={tableStyles.tableCol}>
                  <Text style={{ fontSize: 7 }}>
                    {session.name && `${session.name}`}
                  </Text>
                </View>
                <View
                  style={{
                    ...tableStyles.tableCol,
                    flexDirection: "row",
                    gap: 4,
                  }}
                >
                  <Text style={{ fontSize: 7 }}>
                    {formatTimeString(session.startTime)} -{" "}
                    {formatTimeString(session.endTime)}
                  </Text>
                </View>
                <View
                  style={{
                    ...tableStyles.tableCol,
                    flexDirection: "row",
                    gap: 4,
                  }}
                >
                  <Text style={{ fontSize: 7 }}>
                    {session.adjustmentValues
                      .filter((adj) => adj.type !== "total").length > 0 ? session.adjustmentValues
                      .filter((adj) => adj.type !== "total")
                      .map((adj) => {
                        const value = Number(adj.value);
                        const sign = value >= 0 ? "+" : "-";
                        const isFlat = adj.type === "rate_flat";
                        const absValue = Math.abs(value);
                        return isFlat
                          ? `${sign}$${absValue}`
                          : `${sign}${absValue}%`;
                      })
                      .join(", ") : "None"}
                  </Text>
                </View>
                <View style={{ ...tableStyles.tableCol }}>
                  <Text
                    style={{
                      fontSize: 7,
                      textAlign: "right",
                      paddingRight: 20,
                    }}
                  >
                    $ {calculateNewRate(session, summary).toFixed(2)}/hr
                  </Text>
                </View>
                <View
                  style={{
                    ...tableStyles.tableCol,
                    alignItems: "flex-end",
                    paddingRight: 20,
                  }}
                >
                  <Text style={{ fontSize: 7 }}>
                    ${" "}
                    {calculateTotalBookingRow({
                      startTime: session.startTime,
                      endTime: session.endTime,
                      rate: session.rate,
                      adjustmentValues: [
                        ...(summary[0]?.adjustmentValues || []),
                        ...(session.adjustmentValues || []),
                      ],
                      totalArray: [],
                    })}
                  </Text>
                </View>
              </View>
            );

            {
              /* Comments section */
            }
            const commentRows =
              session.comments?.map((line, textIndex) => {
                return (
                  <View
                    key={`comment-${textIndex}`}
                    style={tableStyles.tableRow}
                  >
                    <View
                      style={{
                        ...tableStyles.tableCol,
                        flex: 1,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 7,
                        }}
                      >
                        {line.comment}
                      </Text>
                    </View>
                  </View>
                );
              }) || [];

            const totalRow =
              session?.total?.map((total, totalIndex) => {
                return (
                  <View style={tableStyles.tableRow}>
                    <View style={tableStyles.tableCol}>
                      <Text style={{ fontSize: 7 }}>
                        {format(new Date(total.date), "EEE. M/d/yy")}
                      </Text>
                    </View>
                    <View
                      style={{
                        ...tableStyles.tableCol,
                        flex: 1,
                      }}
                    >
                      <Text style={{ fontSize: 7 }}>
                        {total.comment || "Custom adjustment"}
                      </Text>
                    </View>
                    <View
                      style={{
                        ...tableStyles.tableCol,
                        alignItems: "flex-end",
                        paddingRight: 20,
                      }}
                    >
                      <Text style={{ fontSize: 7 }}>
                        $ {Number(total.value || 0).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                );
              }) || [];

            return [sessionRows, ...commentRows, ...totalRow];
          })}

        <View style={tableStyles.tableRow}>
          <View
            style={{
              ...tableStyles.tableCol,
              flex: 5,
              alignItems: "flex-end",
              paddingRight: 16,
            }}
          >
            <Text
              style={{
                fontSize: 7,
                fontWeight: "bold",
              }}
            >
              Subtotal
            </Text>
          </View>
          <View
            style={{
              ...tableStyles.tableCol,
              alignItems: "flex-end",
              paddingRight: 20,
            }}
          >
            <Text style={{ fontSize: 7 }}>
              $ {calculateSubtotal(sessions, summary)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const summaryTableStyles = StyleSheet.create({
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    borderRightWidth: 0,
    borderBottomWidth: 0,
    border: "1px solid #D2D2D2",
    borderRadius: "8px",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#f3f6fa",
    paddingVertical: 16,
    paddingLeft: 16,
  },
  roomFeeRow: {
    flexDirection: "row",
    paddingVertical: 16,
    paddingLeft: 16,
  },
  lastRoomFeeRow: {
    borderBottomWidth: 1,
    borderColor: "#f3f6fa",
    paddingVertical: 16,
    paddingLeft: 16,
  },
  tableCol: {
    width: "33.33%",
  },
  roomFeeColName: {
    width: "33.33%",
    paddingLeft: 16,
  },
  roomFeeColAdjustment: {
    width: "33.33%",
  },
});

const SummaryTable = ({
  remainingBalance,
  subtotalSum,
  pastDue,
  sessions,
  summary,
}) => {
  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 2 }}>
        <Svg
          width="14"
          height="14"
          viewBox="0 0 16 21"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <Path
            d="M2 20.5C1.45 20.5 0.979333 20.3043 0.588 19.913C0.196666 19.5217 0.000666667 19.0507 0 18.5V2.5C0 1.95 0.196 1.47933 0.588 1.088C0.98 0.696667 1.45067 0.500667 2 0.5H14C14.55 0.5 15.021 0.696 15.413 1.088C15.805 1.48 16.0007 1.95067 16 2.5V18.5C16 19.05 15.8043 19.521 15.413 19.913C15.0217 20.305 14.5507 20.5007 14 20.5H2ZM7 2.5V8.625C7 8.825 7.07933 8.971 7.238 9.063C7.39667 9.155 7.56733 9.15067 7.75 9.05L8.975 8.325C9.14167 8.225 9.31267 8.175 9.488 8.175C9.66333 8.175 9.834 8.225 10 8.325L11.225 9.05C11.4083 9.15 11.5833 9.15433 11.75 9.063C11.9167 8.97167 12 8.82567 12 8.625V2.5H7Z"
            fill="#2D3748"
          />
        </Svg>
        <Text
          style={{
            fontSize: "12px",
            marginLeft: 4,
            marginBottom: 8,
            fontWeight: "bold",
          }}
        >
          Summary
        </Text>
      </View>
      <View style={summaryTableStyles.table}>
        {/* Header Row */}
        <View style={{ ...summaryTableStyles.tableRow, width: "100%" }}>
          <View style={summaryTableStyles.tableCol}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 2 }}
            >
              <Svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 12 20"
                fill="none"
              >
                <Path
                  d="M10 6.5H12C12 3.663 9.245 2.369 7 2.071V0H5V2.071C2.755 2.369 0 3.663 0 6.5C0 9.206 2.666 10.613 5 10.93V15.9C3.552 15.649 2 14.876 2 13.5H0C0 16.089 2.425 17.619 5 17.936V20H7V17.93C9.245 17.632 12 16.337 12 13.5C12 10.663 9.245 9.369 7 9.071V4.1C8.33 4.339 10 5.041 10 6.5ZM2 6.5C2 5.041 3.67 4.339 5 4.1V8.899C3.629 8.646 2 7.897 2 6.5ZM10 13.5C10 14.959 8.33 15.661 7 15.9V11.1C8.33 11.339 10 12.041 10 13.5Z"
                  fill="#718096"
                />
              </Svg>
              <Text style={{ fontSize: 7, fontWeight: 600, color: "#718096" }}>
                Description
              </Text>
            </View>
          </View>
          <View style={summaryTableStyles.tableCol}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 2 }}
            >
              <Svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 16 20"
                fill="none"
              >
                <Path
                  d="M1.78273 0.5C0.802228 0.5 0 1.31429 0 2.30952V16.7857C0 17.781 0.802228 18.5952 1.78273 18.5952H5.34819V16.8762L14.2618 7.82857V5.92857L8.91365 0.5H1.78273ZM8.02228 1.85714L12.9248 6.83333H8.02228V1.85714ZM14.351 10.4524C14.2618 10.4524 14.0836 10.5429 13.9944 10.6333L13.1031 11.5381L14.9749 13.4381L15.8663 12.5333C16.0446 12.3524 16.0446 11.9905 15.8663 11.8095L14.7075 10.6333C14.6184 10.5429 14.5292 10.4524 14.351 10.4524ZM12.5682 12.081L7.13092 17.6V19.5H9.00279L14.4401 13.981L12.5682 12.081Z"
                  fill="#718096"
                />
              </Svg>
              <Text style={{ fontSize: 7, fontWeight: 600, color: "#718096" }}>
                Room Fee Adjustment
              </Text>
            </View>
          </View>
          <View
            style={{
              ...summaryTableStyles.tableCol,
              alignItems: "flex-end",
              paddingRight: 20,
            }}
          >
            <Text style={{ fontSize: 7, fontWeight: 600, color: "#718096" }}>
              Total
            </Text>
          </View>
        </View>

        {/* Room Fee Row */}
        <View style={{ ...summaryTableStyles.roomFeeRow, width: "100%" }}>
          <View style={summaryTableStyles.tableCol}>
            <Text style={{ fontSize: 7 }}>Room Fee</Text>
          </View>
        </View>
        {Object.values(
          (sessions || [])
            ?.filter((session) => session.name?.length > 0)
            .reduce((acc, session) => {
              // Use session name as key to remove duplicates
              if (!acc[session.name]) {
                acc[session.name] = {
                  ...session,
                  rate: session.rate
                };
              }
              return acc;
            }, {})
        ).map((session, index, array) => {
          const isLast = index === array.length - 1;
          const rowStyle = isLast
            ? summaryTableStyles.lastRoomFeeRow
            : summaryTableStyles.roomFeeRow;
          return (
            <View
              style={{
                ...rowStyle,
                width: "100%",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  ...summaryTableStyles.roomFeeColName,
                  flex: 2,
                }}
              >
                <Text style={{ fontSize: 7 }}>{session.name}</Text>
              </View>
              <View
                style={{
                  ...summaryTableStyles.roomFeeColAdjustment,
                  flex: 2,
                  paddingHorizontal: 8,
                }}
              >
                <Text style={{ fontSize: 7 }}>
                  {summary.length > 0 && summary[0]?.adjustmentValues?.length > 0 ? summary[0]?.adjustmentValues?.map((adj, index) => {
                    const value = Number(adj.value);
                    const sign = value >= 0 ? "+" : "-";
                    const isFlat = adj.type === "rate_flat";
                    const absValue = Math.abs(value);
                    const adjustment = isFlat
                      ? `${sign}$${absValue}`
                      : `${sign}${absValue}%`;
                    return index === 0 ? adjustment : `, ${adjustment}`;
                  }) : "None"}
                </Text>
              </View>
              <View
                style={{
                  ...summaryTableStyles.tableCol,
                  flex: 1,
                  alignItems: "flex-end",
                  paddingRight: 20,
                }}
              >
                <Text style={{ fontSize: 7 }}>
                  $ {calculateTotalBookingRow({
                    rate: Number(session.rate),
                    adjustmentValues: summary.length > 0 ? summary[0].adjustmentValues : [],
                  })}/hr
                </Text>
              </View>
            </View>
          );
        })}

        {/* Data Rows */}
        <View style={{ ...summaryTableStyles.tableRow, width: "100%" }}>
          <View style={summaryTableStyles.tableCol}>
            <Text style={{ fontSize: 7 }}>Past Due Balance</Text>
          </View>
          <View style={summaryTableStyles.tableCol}></View>
          <View
            style={{
              ...summaryTableStyles.tableCol,
              alignItems: "flex-end",
              paddingRight: 20,
            }}
          >
            <Text style={{ fontSize: 7 }}>
              $ {Number(remainingBalance).toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={{ ...summaryTableStyles.tableRow, width: "100%" }}>
          <View style={summaryTableStyles.tableCol}>
            <Text style={{ fontSize: 7 }}>Current Statement Subtotal</Text>
          </View>
          <View style={summaryTableStyles.tableCol}></View>
          <View
            style={{
              ...summaryTableStyles.tableCol,
              alignItems: "flex-end",
              paddingRight: 20,
            }}
          >
            <Text style={{ fontSize: 7 }}>
              $ {calculateSubtotal(sessions, summary)}
            </Text>
          </View>
        </View>

        <View
          style={{
            ...summaryTableStyles.tableRow,
            width: "100%",
            flexDirection: "row",
            justifyContent: "flex-end",
            paddingRight: 20,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
            <View style={{ paddingRight: 16 }}>
              <Text style={{ fontSize: 7 }}>Total Amount Due</Text>
            </View>
            <View>
              <Text style={{ fontWeight: "bold", fontSize: 12 }}>
                $
                {(
                  remainingBalance +
                  Number(calculateSubtotal(sessions, summary))
                ).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const Footer = () => {
  return (
    <View
      style={{
        marginTop: 18,
        flexDirection: "row",
        justifyContent: "space-around",
        paddingHorizontal: 16,
        color: "#000000",
      }}
    >
      {/* left text */}
      <View
        style={{
          paddingTop: 12,
          paddingBottom: 8,
        }}
      >
        <Text
          style={{
            fontWeight: "bold",
            fontSize: 8,
            marginBottom: 4,
          }}
        >
          Payments are due at the end of each month.
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 8,
            }}
          >
            You can make your payment at:
          </Text>
          <Text style={{ fontWeight: "bold", fontSize: 8, color: "#3182CE" }}>
            lapena.org/payment
          </Text>
        </View>
      </View>

      {/* right text */}
      <View
        style={{
          paddingTop: 12,
          paddingBottom: 8,
        }}
      >
        <Text
          style={{
            fontWeight: "bold",
            fontSize: 8,
            marginBottom: 4,
          }}
        >
          For any questions,
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 8,
            }}
          >
            please contact:
          </Text>
          <Text style={{ fontWeight: "bold", fontSize: 8, color: "#3182CE" }}>
            classes@lapena.org
          </Text>
        </View>
      </View>
    </View>
  );
};

const InvoicePDFDocument = ({
  invoice,
  instructors,
  programName,
  payees,
  comments,
  room,
  booking,
  remainingBalance,
  subtotalSum,
  sessions,
  summary,
}) => {
  return (
    <Document>
      <Page
        size="A4"
        style={styles.page}
      >
        <View style={{ flex: 1, flexGrow: 1 }}>
          <Image src={InvoiceHeader} />
          <View style={{ marginHorizontal: 16, gap: 16 }}>
            <EditInvoiceTitle
              invoice={invoice}
              instructors={instructors}
              programName={programName}
              payees={payees}
              comments={comments}
            />
            <EditInvoiceDetailsPDF
              invoice={invoice}
              instructors={instructors}
              programName={programName}
              payees={payees}
              comments={comments}
              room={room}
            />

            <InvoiceTable
              sessions={sessions}
              summary={summary}
            />

            <SummaryTable
              remainingBalance={remainingBalance}
              subtotalSum={subtotalSum}
              summary={summary}
              sessions={sessions}
            />

            <Footer />
          </View>
        </View>
        <Image
          src={InvoiceFooter}
          style={{ width: "100%" }}
        />
      </Page>
    </Document>
  );
};

export { InvoicePDFDocument };
