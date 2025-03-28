import React, { useState, useEffect } from "react";
import { FaAngleLeft } from "react-icons/fa6";
import { FiEdit, FiExternalLink } from "react-icons/fi";
import {
    useNavigate,
    useParams
} from "react-router-dom";

import {
    Heading,
    Flex,
    Button,
    IconButton,
    Box,
    Text
} from "@chakra-ui/react";

import { InvoicePayments, InvoiceStats, InvoiceTitle } from "./InvoiceComponents";
import { EmailHistory } from "./EmailHistory";

import Navbar from "../navbar/Navbar";
import PDFButtonInvoice from "./PDFButtonInvoice";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";


import {
  InvoiceView,
} from "./InvoiceView";


export const SingleInvoice = () => {
    const { id } = useParams()
    const { backend } = useBackendContext();
    const navigate = useNavigate();

    const [total, setTotal] = useState(0);
    const [remainingBalance, setRemainingBalance] = useState(0);
    const [billingPeriod, setBillingPeriod] = useState({});
    const [comments, setComments] = useState([]);
    const [emails, setEmails] = useState([]);
    const [payees, setPayees] = useState([]);
    const [event, setEvent] = useState();

    const [booking, setBookingDetails] = useState([]);
    const [room, setRoom] = useState([]);
    const [roomRate, setRoomRate] = useState(0);
    const [subtotal, setSubtotal] = useState(0);
    const [pastDue, setPastDue] = useState(0);
    const [programName, setProgramName] = useState("");
    const [instructors, setInstructors] = useState([]);
    const [invoice, setInvoice] = useState([]);

    useEffect(() => {
      const fetchData = async () => {
          try {
              // Get current invoice
              const currentInvoiceResponse = await backend.get(`/invoices/${id}`);
              setInvoice(currentInvoiceResponse);

              // If no invoice is found, set everything to null
              if (!currentInvoiceResponse.data || currentInvoiceResponse.status === 404) {
                  setTotal(null);
                  setRemainingBalance(null);
                  setBillingPeriod(null);
                  setComments(null);
                  setEmails(null);
                  setPayees(null);
                  setEvent(null);
                  setSubtotal(0.0);
                  setPastDue(0.0);
                  setProgramName("");
                  setInstructors([]);
                  return;
              }

              const currentInvoice = currentInvoiceResponse.data[0];

              // get invoice total
              const invoiceTotalResponse = await backend.get(`/invoices/total/${id}`);
              const total = invoiceTotalResponse.data.total;
              setTotal(total);
              setSubtotal(total);

               // get program name
              const programNameResponse = await backend.get(
                "/events/" + currentInvoice.eventId
              );
              setProgramName(programNameResponse.data[0].name);

              // get instructors
              const instructorResponse = await backend.get(
                "/assignments/instructors/" + currentInvoice.eventId
              );
              setInstructors(instructorResponse.data);

              // calculate sum of unpaid/remaining invoices
              const unpaidInvoicesResponse = await backend.get("/events/remaining/" + currentInvoiceResponse.data[0]["eventId"]);
              const unpaidTotals = await Promise.all(
                unpaidInvoicesResponse.data.map(invoice => backend.get(`/invoices/total/${invoice.id}`))
              );
              const partiallyPaidTotals = await Promise.all(
                  unpaidInvoicesResponse.data.map(invoice => backend.get(`/invoices/paid/${invoice.id}`))
              );
              const unpaidTotal = unpaidTotals.reduce((sum, res) => sum + res.data.total, 0);
              const unpaidPartiallyPaidTotal = partiallyPaidTotals.reduce((sum, res) => {
                const paidAmount = res.data.paid || 0;
                return sum + paidAmount;
              }, 0);

              const remainingBalance = unpaidTotal - unpaidPartiallyPaidTotal;

              setRemainingBalance(remainingBalance);
              setPastDue(remainingBalance);

              // set billing period
              setBillingPeriod({
                  startDate: currentInvoice.startDate,
                  endDate: currentInvoice.endDate
              });
              // get comments
              const commentsResponse = await backend.get('/comments/paidInvoices/' + id);
              setComments(commentsResponse.data);
              console.log("COMMENTS: ", commentsResponse.data)

              // get emails
              const emailsResponse = await backend.get('/invoices/historicInvoices/' + id);
              setEmails(emailsResponse.data);

              // get payees
              const payeesResponse = await backend.get("/invoices/payees/" + id);
              setPayees(payeesResponse.data)

              // get corresponding event
              const eventResponse = await backend.get("/invoices/invoiceEvent/" + id);
              setEvent(eventResponse.data)

              console.log(invoice)

          } catch (error) {
              // Invoice/field does not exist
              console.error("Error fetching data:", error);
          }
      };

      fetchData();
  }, [backend, id]);

    useEffect(() => {
      const fetchBookingDetails = async () => {
        try {
          if (!comments || !Array.isArray(comments) || comments.length === 0) {
            return;
          }

          // Find the first comment with a booking_id
          const commentWithBookingId = comments[0].bookingId;

          const bookingResponse = await backend.get(
            `/bookings/${commentWithBookingId}`
          );
          // console.log("Booking details:", bookingResponse.data);
          setBookingDetails(bookingResponse.data[0]);

          const roomResponse = await backend.get(
            `/rooms/${bookingResponse.data[0].roomId}`
          );
          setRoom(roomResponse.data);
          setRoomRate(room[0].rate)
        } catch (error) {
          console.error("Error fetching booking details:", error);
        }
      };

      fetchBookingDetails();
    }, [comments, backend]);

    const handlePreviewClick = () => {
      navigate(`/invoices/savededits/${id}`);
    };

    return (
      <Navbar>
        <Flex direction="row" height="100%" width="100%">
          <Flex direction="column" height="100%" width="100%" padding="2.5vw" gap="1.25vw">
            <Flex direction="row" width="100%">
              {/* back button */}
              <IconButton
                icon={<FaAngleLeft />}
                onClick={() => {
                  navigate("/invoices");
                }}
                variant="link"
                color="#474849"
                fontSize="1.5em"
                mr={6}
              ></IconButton>
              <InvoiceTitle
                title={event ? event.name : "N/A"}
                isSent={invoice?.data?.[0]?.isSent}
                paymentStatus={invoice?.data?.[0]?.paymentStatus}>
              </InvoiceTitle>

              {/* buttons */}
              <Flex direction="row" marginLeft="auto" gap={1}>
                <PDFButtonInvoice invoice={id}></PDFButtonInvoice>

                <Button
                  height="100%"
                  backgroundColor="#4E4AE7"
                  color="#FFF"
                  fontSize="clamp(.75rem, 1.25rem, 1.75rem)"
                  gap={1}
                  onClick={handlePreviewClick}
                >
                  <FiExternalLink></FiExternalLink>
                  Preview
                </Button>

              </Flex>
            </Flex>
            <Flex direction="column" height="100%" width="100%" padding="2.5vw" gap="1.25vw">
              <Flex direction="row" width="100%" gap={5}>
                <Flex direction="column" height="40%" width="100%" padding="2.5vw" gap="1.25vw">
                  <InvoiceStats
                    roomRate={roomRate}
                    billingPeriod={billingPeriod}
                    amountDue={total}
                    remainingBalance={!remainingBalance}
                  ></InvoiceStats>
                  <InvoicePayments comments={comments}></InvoicePayments>
                  <EmailHistory emails={emails}></EmailHistory>
                </Flex>

                <Flex direction="column" height="100%" width="40%" padding="2.5vw" gap="1.25vw">
                  <Box  borderWidth={25} borderRadius={18} borderColor="#D9D9D933" overflow="hidden">
                    <InvoiceView
                      comments={comments}
                      booking={booking}
                      room={room}
                      subtotal={subtotal}
                      setSubtotal={setSubtotal}
                      pastDue={pastDue}
                      payees={payees}
                      programName={programName}
                      instructors={instructors}
                      invoice={invoice?.data}
                    />
                  </Box>
                </Flex>


              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </Navbar>
    );
}
