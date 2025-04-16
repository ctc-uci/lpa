import React, { useEffect, useState } from "react";

import { DownloadIcon } from "@chakra-ui/icons";
import { Box, Flex, IconButton, Spinner } from "@chakra-ui/react";

import {
  Document,
  Image,
  Page,
  PDFDownloadLink,
  PDFViewer,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { format } from "date-fns";

import InvoiceFooter from "../../assets/background/InvoiceFooter.png";
import InvoiceHeader from "../../assets/background/InvoiceHeader.png";
import logo from "../../assets/logo/logo.png";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";

// TODO FIX ENDPOINTS TO FIX CALCULATIONS
// TODO IMPLEMENT ID DEPENDING ON INVOICE, REMOVE HARDCODED INVOICE ID 22
// TODO DOUBLE CHECK IF ADJUSTMENT TYPE IS CALCULATING CORRECTLY
 

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
    fontWeight: "bold",
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

const getGeneratedDate = (comments) => {
  if (comments?.length > 0) {
    const latestComment = comments?.sort(
      (a, b) => new Date(b.datetime) - new Date(a.datetime)
    )[0];

    const latestDate = new Date(latestComment.datetime);
    const month = latestDate.toLocaleString("default", { month: "long" });

    const year = latestDate.getFullYear();

    return `${month}  ${year}`;
  } else {
    return "No Date Found";
  }
};

const EditInvoiceTitle = ({ comments, invoice }) => {
  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <View
          style={{
            marginRight: 8,
            alignItems: "flex-end",
          }}
        >
          <Text style={{ fontSize: "10px", textAlign: "right" }}>
            La Peña Cultural Center
          </Text>
          <Text style={{ fontSize: "10px", textAlign: "right" }}>
            3105 Shattuck Ave., Berkeley, CA 94705
          </Text>
          <Text style={{ fontSize: "10px", textAlign: "right" }}>
            lapena.org
          </Text>
        </View>

        <Image
          src={logo}
          style={{ width: "75px" }}
        />
      </View>
    </View>
  );
};

const EditInvoiceDetailsPDF = ({
  instructors,
  programName,
  payees,
  comments,
}) => {
  return (
    <View
      style={{
        // fontFamily: "Inter",
        color: "#2D3748",
        paddingHorizontal: 16,
      }}
    >
      {/* Header */}
      <View style={{ marginBottom: 12 }}>
        <Text
          style={{
            textAlign: "center",
            fontSize: 20,
            fontWeight: "bold",
            marginBottom: 4,
          }}
        >
          Classroom Rental Monthly Statement
        </Text>
        <Text
          style={{
            textAlign: "center",
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          {getGeneratedDate(comments)}
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
          <Text style={{ fontWeight: 700, fontSize: 8, marginBottom: 4 }}>
            Recurring Program:
          </Text>
          <Text style={{ fontSize: 8, marginBottom: 8 }}>
            {programName || "No program name found"}
          </Text>

          <Text style={{ fontWeight: "bold", fontSize: 8, marginBottom: 4 }}>
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
          <Text style={{ fontWeight: "bold", fontSize: 8, marginBottom: 4 }}>
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
    fontWeight: "bold",
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
    borderRadius: "18px",
    // minH="24"
    paddingHorizontal: "12px",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#f3f6fa",
    paddingVertical: 16,
  },
  tableCol: {
    width: "16.66%",
    // borderStyle: "solid",
    // borderColor: "#000",
    // borderBottomWidth: 1,
    // borderRightWidth: 1,
    padding: 4,
  },
});

const handleSubtotalSum = (startTime, endTime, rate) => {
  if (!startTime || !endTime || !rate) return "0.00"; // Check if any required value is missing

  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const startMinutes = timeToMinutes(startTime.substring(0, 5));
  const endMinutes = timeToMinutes(endTime.substring(0, 5));
  const diff = endMinutes - startMinutes;

  const totalHours = Math.ceil(diff / 60);

  const total = (totalHours * rate).toFixed(2);

  return total;
};

const InvoiceTable = ({ booking, comments, room, invoice }) => {
  return (
    <View>
      <Text style={{ fontSize: "14px", marginLeft: 4, marginBottom: 8 }}>
        Sessions
      </Text>
      <View style={tableStyles.table}>
        {/* Header Row */}
        <View style={{ ...tableStyles.tableRow }}>
          <View style={tableStyles.tableCol}>
            <Text style={{ fontSize: 8, fontWeight: 700 }}>Date</Text>
          </View>
          <View style={tableStyles.tableCol}>
            <Text style={{ fontSize: 8 }}>Classroom</Text>
          </View>
          <View style={tableStyles.tableCol}>
            <Text style={{ fontSize: 8 }}>Rental Hours</Text>
          </View>
          <View style={tableStyles.tableCol}>
            <Text style={{ fontSize: 8 }}>Room Fee</Text>
          </View>
          <View style={tableStyles.tableCol}>
            <Text style={{ fontSize: 8 }}>Adjustment Type(s)</Text>
          </View>
          <View
            style={{
              ...tableStyles.tableCol,
              alignItems: "flex-end",
              paddingRight: 20,
            }}
          >
            <Text style={{ fontSize: 8 }}>Total</Text>
          </View>
        </View>

        {/* Data Rows */}

        {comments.map((comment, index) => (
          <View
            style={tableStyles.tableRow}
            key={index}
          >
            <View style={tableStyles.tableCol}>
              <Text style={{ fontSize: 8 }}>
                {format(new Date(comment.datetime), "M/d/yy")}
              </Text>
            </View>
            <View style={tableStyles.tableCol}>
              <Text style={{ fontSize: 8 }}>
                {room && room.length > 0 ? `${room[0].name}` : "N/A"}
              </Text>
            </View>
            <View
              style={{
                ...tableStyles.tableCol,
                flexDirection: "row",
                gap: 4,
              }}
            >
              <Text style={{ fontSize: 8 }}>
                {booking.startTime
                  ? (() => {
                      const startTime = booking.startTime
                        .split("-")[0]
                        .substring(0, 5);
                      const formatTime = (timeStr) => {
                        const [hours, minutes] = timeStr.split(":").map(Number);
                        const period = hours >= 12 ? "pm" : "am";
                        const hour12 = hours % 12 || 12;
                        return `${hour12}:${minutes.toString().padStart(2, "0")}${period}`;
                      };

                      return `${formatTime(startTime)}`;
                    })()
                  : "N/A"}
              </Text>
              <Text style={{ fontSize: 8 }}>to</Text>
              <Text style={{ fontSize: 8 }}>
                {booking.startTime
                  ? (() => {
                      const endTime = booking.endTime
                        .split("-")[0]
                        .substring(0, 5);
                      const formatTime = (timeStr) => {
                        const [hours, minutes] = timeStr.split(":").map(Number);
                        const period = hours >= 12 ? "pm" : "am";
                        const hour12 = hours % 12 || 12;
                        return `${hour12}:${minutes.toString().padStart(2, "0")}${period}`;
                      };

                      return `${formatTime(endTime)}`;
                    })()
                  : "N/A"}
              </Text>
            </View>
            <View
              style={{
                ...tableStyles.tableCol,
                flexDirection: "row",
                gap: 4,
              }}
            >
              <Text style={{ fontSize: 8 }}>
                {room && room.length > 0 ? `$${room[0].rate}` : "N/A"}
              </Text>
              <Text style={{ fontSize: 8 }}>/ hr</Text>
            </View>
            <View style={{ ...tableStyles.tableCol }}>
              <Text style={{ fontSize: 8 }}>
                {(comments[index] && comments[index].adjustmentType) ||
                  "Click to Select"}
              </Text>
            </View>
            <View
              style={{
                ...tableStyles.tableCol,
                alignItems: "flex-end",
                paddingRight: 20,
              }}
            >
              <Text style={{ fontSize: 8 }}>
                ${" "}
                {handleSubtotalSum(
                  booking?.startTime,
                  booking?.endTime,
                  room[0]?.rate
                )}
              </Text>
            </View>
          </View>
        ))}
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
    borderRadius: "18px",
    // minH="24"
    paddingHorizontal: "12px",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#f3f6fa",
    paddingVertical: 16,
  },
  tableCol: {
    width: "33.33%",
  },
});

const SummaryTable = ({ remainingBalance, subtotalSum, pastDue }) => {
  return (
    <View>
      <Text style={{ fontSize: "14px", marginLeft: 4, marginBottom: 8 }}>
        Summary
      </Text>
      <View style={summaryTableStyles.table}>
        {/* Header Row */}
        <View style={{ ...summaryTableStyles.tableRow, width: "100%" }}>
          <View style={summaryTableStyles.tableCol}>
            <Text style={{ fontSize: 8 }}>Description</Text>
          </View>
          <View style={summaryTableStyles.tableCol}>
            <Text style={{ fontSize: 8 }}>Adjustment Type(s)</Text>
          </View>
          <View
            style={{
              ...summaryTableStyles.tableCol,
              alignItems: "flex-end",
              paddingRight: 20,
            }}
          >
            <Text style={{ fontSize: 8 }}>Total</Text>
          </View>
        </View>

        {/* Data Rows */}
        <View style={{ ...summaryTableStyles.tableRow, width: "100%" }}>
          <View style={summaryTableStyles.tableCol}>
            <Text style={{ fontSize: 8 }}>Past Due Balance</Text>
          </View>
          <View style={summaryTableStyles.tableCol}>
            <Text style={{ fontSize: 8 }}>None</Text>
          </View>
          <View
            style={{
              ...summaryTableStyles.tableCol,
              alignItems: "flex-end",
              paddingRight: 20,
            }}
          >
            <Text style={{ fontSize: 8 }}>$ {pastDue.toFixed(2)}</Text>
          </View>
        </View>

        <View style={{ ...summaryTableStyles.tableRow, width: "100%" }}>
          <View style={{ width: "100%" }}>
            <Text style={{ fontSize: 8 }}>
              Waiting for remaining payments from November and December
            </Text>
          </View>
        </View>

        <View style={{ ...summaryTableStyles.tableRow, width: "100%" }}>
          <View style={summaryTableStyles.tableCol}>
            <Text style={{ fontSize: 8 }}>Current Statement Subtotal</Text>
          </View>
          <View style={summaryTableStyles.tableCol}>
            <Text style={{ fontSize: 8 }}>None</Text>
          </View>
          <View
            style={{
              ...summaryTableStyles.tableCol, 
              alignItems: "flex-end",
              paddingRight: 20,
            }}
          >
            <Text style={{ fontSize: 8 }}>$ {subtotalSum.toFixed(2)}</Text>
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
          <View style={{ width: "25%" }}>
            <Text style={{ fontSize: 8 }}>Total Amount Due</Text>
          </View>
          <View>
            <Text style={{ fontSize: 8 }}>{(pastDue + subtotalSum).toFixed(2)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// const MyDocument = ({
//   invoice,
//   backend,
//   loading,
//   setLoading,
//   // instructors,
//   // programName,
//   // payees,
//   // comments,
//   // room,
//   // booking,
//   // remainingBalance,
//   // subtotalSum,
//   // pastDue
// }) => {

  
//   const [instructors, setInstructors] = useState([]);
//   const [programName, setProgramName] = useState("");
//   const [payees, setPayees] = useState([]);
//   const [comments, setComments] = useState([]);
//   const [booking, setBookingDetails] = useState([]);
//   const [room, setRoom] = useState([]);
//   // const [loading, setLoading] = useState(true);
//   const [remainingBalance, setRemainingBalance] = useState(0);
//   const [subtotalSum, setSubtotalSum] = useState(0);

//   const fetchData = async () => {
//     try {
//       console.log("invoice fetchData", invoice)
//       const instructorResponse = await backend.get(
//         "/assignments/instructors/" + invoice?.data[0].eventId
//       );
//       setInstructors(instructorResponse.data);
//       // console.log("instructors", instructorResponse.data);

//       const commentsResponse = await backend.get("/comments/invoice/22");
//       // const commentsResponse = await backend.get("/comments/invoice/" + id);
//       setComments(commentsResponse.data);
//       // console.log("comments", comments);

//       // get program name
//       const programNameResponse = await backend.get(
//         "/events/" + invoice.data[0].eventId
//       );
//       setProgramName(programNameResponse.data[0].name);
//       // console.log("programName", programNameResponse.data[0].name)

//       // get payees
//       // const payeesResponse = await backend.get("/invoices/payees/" + id);
//       const payeesResponse = await backend.get("/invoices/payees/22");
//       setPayees(payeesResponse.data);
//       // console.log("payees", payeesResponse.data)
//       console.log("commentsResponse.data.length", commentsResponse.data.length)
//       if (commentsResponse.data.length > 0) {
//         const bookingId = commentsResponse.data[0]?.bookingId;
        
//         if (bookingId) {
//           const bookingResponse = await backend.get("/bookings/" + bookingId);
//           setBookingDetails(bookingResponse.data[0]);

//           const roomResponse = await backend.get(
//             `/rooms/${bookingResponse.data[0].roomId}`
//           );
//           setRoom(roomResponse.data);
//         }
//       }

//       // get subtotal
//       // const subtotalResponse = await backend.get("/invoices/total/22");

//       const unpaidInvoicesResponse = await backend.get(
//         "/events/remaining/" + invoice.data[0]["eventId"]
//       );

//       const unpaidTotals = await Promise.all(
//         unpaidInvoicesResponse.data.map((invoice) =>
//           backend.get(`/invoices/total/${invoice.id}`)
//         )
//       );

//       const partiallyPaidTotals = await Promise.all(
//         unpaidInvoicesResponse.data.map((invoice) =>
//           backend.get(`/invoices/paid/${invoice.id}`)
//         )
//       );

//       const invoiceTotal = await backend.get(`/invoices/total/22`)
//       const unpaidTotal = unpaidTotals.reduce(
//         (sum, res) => sum + res.data.total,
//         0 
//       );
//       const unpaidPartiallyPaidTotal = partiallyPaidTotals.reduce(
//         (sum, res) => {
//           if(res.data.total) // TODO FIX ENDPOINTS BECAUSE CALCULATION IS WRONG
//             console.log("res", res.data.total, "sum", sum, "sum + Number(res.data.total)", sum + Number(res.data.total))
//             return sum + Number(res.data.total); // Had to change to number because was causing NaN
//         },
//         0
//       );

//       // console.log("unpaidPartiallyPaidTotal", unpaidPartiallyPaidTotal)
//       const remainingBal = unpaidTotal - unpaidPartiallyPaidTotal;
//       setRemainingBalance(remainingBal);
//       console.log("remainingBal", remainingBal)




//       setLoading(false);
//       console.log("setLoading(false)", false)
//     } catch (err) {
//       console.log("Error fetching data: ", err);
//     }
//   }; 

//   useEffect(() => {
//     // if (invoice && invoice.data && invoice.data[0]?.eventId) {
//     console.log("IN HERE THIS SHOULD RUN")
//     fetchData();
//     // }
//   }, [invoice, backend]);

//   useEffect(() => {
//     if (
//       comments.length > 0 &&
//       booking.startTime &&
//       booking.endTime &&
//       room.length > 0 &&
//       room[0]?.rate
//     ) {
//       const total = handleSubtotalSum(
//         booking.startTime,
//         booking.endTime,
//         room[0].rate
//       );
//       const subtotal = parseFloat(total) * comments.length;
//       setSubtotalSum(subtotal);
//     }
//   }, [comments, booking, room]);

//   return (
//     <Document>
//       <Page
//         size="A4"
//         style={styles.page}
//       >
//         <View style={{ flexGrow: 1 }}>
//           <Image src={InvoiceHeader} />
//           <View style={{ marginHorizontal: 16, gap: 16 }}>
//             <View
//               style={{
//                 justifyContent: "space-between",
//                 marginVertical: "8",
//                 // marginHorizontal: "4",
//                 // fontFamily: "Inter",
//                 color: "#2D3748",
//                 flexDirection: "row",
//               }}
//             >
//               <View>
//                 <Text
//                   style={{
//                     color: "#2D3748",
//                     fontWeight: "700",
//                     fontSize: "24px",
//                   }}
//                 >
//                   INVOICE
//                 </Text>
//                 <Text
//                   style={{
//                     color: "#718096",
//                     fontSize: "12px",
//                   }}
//                 >
//                   {getGeneratedDate(comments)}
//                 </Text>
//               </View>
//               <EditInvoiceTitle />
//             </View>
//             <View>
//               <EditInvoiceDetailsPDF
//                 invoice={invoice}
//                 instructors={instructors}
//                 programName={programName}
//                 payees={payees}
//                 comments={comments}
//                 room={room}
//               />
//             </View>

//             {/* Table */}
//             <InvoiceTable
//               booking={booking}
//               comments={comments}
//               room={room}
//             />

//             {/* <SummaryTable remainingBalance={remainingBalance} subtotalSum={subtotalSum} pastDue={pastDue}/> */}
//             {/* End of Table */}
//           </View>
//         </View>
//         <Image
//           src={InvoiceFooter}
//           style={{ width: "100%" }}
//         />
//       </Page>
//     </Document>
//   );
// };
const MyDocument = ({
  invoice,
  instructors,
  programName,
  payees,
  comments,
  room,
  booking,
  remainingBalance,
  subtotalSum,
}) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={{ flexGrow: 1 }}>
          <Image src={InvoiceHeader} />
          <View style={{ marginHorizontal: 16, gap: 16 }}>
            <View
              style={{
                justifyContent: "space-between",
                marginVertical: "8",
                flexDirection: "row",
              }}
            >
              <View>
                <Text
                  style={{
                    color: "#2D3748",
                    fontWeight: "700",
                    fontSize: "24px",
                  }}
                >
                  INVOICE
                </Text>
                <Text style={{ color: "#718096", fontSize: "12px" }}>
                  {getGeneratedDate(comments)}
                </Text>
              </View>
              <EditInvoiceTitle />
            </View>

            <EditInvoiceDetailsPDF
              invoice={invoice}
              instructors={instructors}
              programName={programName}
              payees={payees}
              comments={comments}
              room={room}
            />

            <InvoiceTable
              booking={booking}
              comments={comments}
              room={room}
            />

            {/* <SummaryTable remainingBalance={remainingBalance} subtotalSum={subtotalSum} pastDue={pastDue}/> */}
          </View>
        </View>
        <Image src={InvoiceFooter} style={{ width: "100%" }} />
      </Page>
    </Document>
  );
};


const fetchInvoiceData = async (invoice, backend) => {
  const eventId = invoice?.data[0]?.eventId;

  const [
    instructorResponse,
    commentsResponse,
    programNameResponse,
    payeesResponse,
    unpaidInvoicesResponse,
    invoiceTotalResponse
  ] = await Promise.all([
    backend.get(`/assignments/instructors/${eventId}`),
    backend.get(`/comments/invoice/22`),
    backend.get(`/events/${eventId}`),
    backend.get(`/invoices/payees/22`),
    backend.get(`/events/remaining/${eventId}`),
    backend.get(`/invoices/total/22`)
  ]);

  const comments = commentsResponse.data;
  let booking = {};
  let room = [];

  if (comments.length > 0 && comments[0].bookingId) {
    const bookingResponse = await backend.get(`/bookings/${comments[0].bookingId}`);
    booking = bookingResponse.data[0];

    const roomResponse = await backend.get(`/rooms/${booking.roomId}`);
    room = roomResponse.data;
  }

  const unpaidTotals = await Promise.all(
    unpaidInvoicesResponse.data.map(invoice =>
      backend.get(`/invoices/total/${invoice.id}`)
    )
  );
  const partiallyPaidTotals = await Promise.all(
    unpaidInvoicesResponse.data.map(invoice =>
      backend.get(`/invoices/paid/${invoice.id}`)
    )
  );

  const unpaidTotal = unpaidTotals.reduce((sum, res) => sum + res.data.total, 0);
  const unpaidPartiallyPaidTotal = partiallyPaidTotals.reduce((sum, res) => {
    return res.data.total ? sum + Number(res.data.total) : sum;
  }, 0);

  const remainingBalance = unpaidTotal - unpaidPartiallyPaidTotal;

  let subtotalSum = 0;
  if (comments.length && booking.startTime && booking.endTime && room[0]?.rate) {
    const total = handleSubtotalSum(booking.startTime, booking.endTime, room[0].rate);
    subtotalSum = parseFloat(total) * comments.length;
  }

  return {
    instructors: instructorResponse.data,
    programName: programNameResponse.data[0].name,
    payees: payeesResponse.data,
    comments,
    booking,
    room,
    remainingBalance,
    subtotalSum,
  };
};

const PDFButtonInvoice = () => {
  // // get comments for the invoice, all relevant db data here
  const { backend } = useBackendContext();
  const [invoice, setInvoice] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);


  const fetchData = async () => {
    try {
      const response = await backend.get("/invoices/22");
      setInvoice(response.data);

      const invoiceDataResponse = await fetchInvoiceData(response, backend);
      setInvoiceData(invoiceDataResponse);
      console.log("invoiceDataResponse", invoiceDataResponse)
      //   // get instructors
    } catch (err) {
      console.error("Error fetching invoice data:", err);
    } 
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Box>
      {/* {loading ? (
        <Flex
          h="100%"
          justifyContent="center"
          alignItems="center"
          gap="4"
        >
          <Spinner />
          <Text>PDF Loading...</Text>
        </Flex>
      ) : ( */}
      <PDFDownloadLink
        document={
          <MyDocument
            invoice={invoice}
            {...invoiceData}
          />
        }
        fileName="bookingdata.pdf"
      >
          <IconButton
            icon={<DownloadIcon boxSize="20px" />}
            backgroundColor="transparent"
            aria-label="Download PDF"
          />
      </PDFDownloadLink>
    {/* )} */}
    </Box>
  );
};

// const TestPDFViewer = ({ invoice }) => {
const TestPDFViewer = () => {
  const { backend } = useBackendContext();
  const [invoice, setInvoice] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await backend.get("/invoices/22");
      setInvoice(response.data);

      const invoiceDataResponse = await fetchInvoiceData(response, backend);
      setInvoiceData(invoiceDataResponse);
      console.log("invoiceDataResponse", invoiceDataResponse)
      //   // get instructors
    } catch (err) {
      console.error("Error fetching invoice data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Box>
      {loading || !invoice ? (
        <Flex h="100%" justifyContent="center" alignItems="center" gap="4">
          <Spinner />
          <Text>PDF Loading...</Text>
        </Flex>
      ) : (
        <PDFDownloadLink
          document={<MyDocument invoice={invoice} {...invoiceData} />}
          fileName="bookingdata.pdf"
        >
          {({ loading: isGenerating }) =>
            isGenerating ? (
              <Flex align="center" gap={2}>
                <Spinner size="sm" />
                <Text fontSize="sm">Generating PDF...</Text>
              </Flex>
            ) : (
              <IconButton
                icon={<DownloadIcon boxSize="20px" />}
                backgroundColor="transparent"
                aria-label="Download PDF"
              />
            )
          }
        </PDFDownloadLink>
      )}
    </Box>
  );
};

export { TestPDFViewer, PDFButtonInvoice, MyDocument };
