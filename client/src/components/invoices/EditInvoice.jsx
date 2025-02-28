import React, { useEffect, useState } from "react";

import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  VStack,
} from "@chakra-ui/react";

import { FaAngleLeft } from "react-icons/fa6";
import { useNavigate, useParams } from "react-router-dom";

import InvoiceBackground from "../../assets/background/InvoiceBackground.png";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import Navbar from "../navbar/Navbar";
import {
  EditInvoiceDetails,
  EditInvoiceTitle,
  InvoiceSummary,
  StatementComments,
} from "./EditInvoiceComponents";

const InvoiceNavBar = ({ onBack, id }) => {
  return (
    <Flex
      width="100%"
      justifyContent="space-between"
      alignItems="center"
      py={4}
      px={6}
      bg="white"
      borderBottom="1px solid #E2E8F0"
    >
      <IconButton
        icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="19" height="18" viewBox="0 0 19 18" fill="none">
                <path d="M17.0129 7.83962H3.98118L9.67452 2.14629C10.1295 1.69129 10.1295 0.944622 9.67452 0.489622C9.56659 0.381468 9.43838 0.295662 9.29725 0.237117C9.15611 0.178572 9.00482 0.148438 8.85202 0.148438C8.69922 0.148438 8.54793 0.178572 8.40679 0.237117C8.26566 0.295662 8.13745 0.381468 8.02952 0.489622L0.341185 8.17796C0.233031 8.28589 0.147225 8.41409 0.0886803 8.55523C0.0301352 8.69636 0 8.84766 0 9.00046C0 9.15325 0.0301352 9.30455 0.0886803 9.44568C0.147225 9.58682 0.233031 9.71502 0.341185 9.82296L8.02952 17.5113C8.13753 17.6193 8.26576 17.705 8.40689 17.7634C8.54801 17.8219 8.69927 17.852 8.85202 17.852C9.00477 17.852 9.15603 17.8219 9.29715 17.7634C9.43828 17.705 9.56651 17.6193 9.67452 17.5113C9.78253 17.4033 9.86821 17.275 9.92667 17.1339C9.98512 16.9928 10.0152 16.8415 10.0152 16.6888C10.0152 16.536 9.98512 16.3848 9.92667 16.2437C9.86821 16.1025 9.78253 15.9743 9.67452 15.8663L3.98118 10.173H17.0129C17.6545 10.173 18.1795 9.64796 18.1795 9.00629C18.1795 8.36462 17.6545 7.83962 17.0129 7.83962Z" fill="#4A5568"/>
            </svg>
            }
        onClick={onBack}
        variant="link"
        color="#474849"
        fontSize="1.5em"
        aria-label="Go back"
      />

      <Button
        height="2.5em"
        borderRadius={10}
        backgroundColor="#4E4AE7"
        color="#FFF"
        fontSize="clamp(.75rem, 1rem, 1.25rem)"
      >
        Save
      </Button>
    </Flex>
  );
};

export const EditInvoice = () => {
  const { id } = useParams();
  const { backend } = useBackendContext();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState([]);
  const [comments, setComments] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [programName, setProgramName] = useState("");
  const [payees, setPayees] = useState([]);
  const [booking, setBookingDetails] = useState([]);
  const [room, setRoom] = useState([]);

  const [subtotal, setSubtotal] = useState(0);
  const [pastDue, setPastDue] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // get current invoice
        const currentInvoiceResponse = await backend.get("/invoices/" + id);
        setInvoice(currentInvoiceResponse);
      } catch (error) {
        // Invoice/field does not exist
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [backend, id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // If no invoice is found, set everything to null
        // console.log("INVOICE",invoice)
        if (!invoice.data || invoice.status === 404) {
          setComments([]);
          setInstructors([]);
          setProgramName("");
          setPayees(null);
          setPastDue(0);
          return;
        }

        // get instructors
        const instructorResponse = await backend.get(
          "/assignments/instructors/" + invoice.data[0].eventId
        );
        setInstructors(instructorResponse.data);

        // get comments
        const commentsResponse = await backend.get("/comments/invoice/" + id);
        // console.log("CR", commentsResponse)
        setComments(commentsResponse.data);

        // get program name
        const programNameResponse = await backend.get(
          "/events/" + invoice.data[0].eventId
        );
        setProgramName(programNameResponse.data[0].name);

        // get payees
        const payeesResponse = await backend.get("/invoices/payees/" + id);
        setPayees(payeesResponse.data);

        // get subtotal
        const subtotalResponse = await backend.get("/invoices/total/" + id);
        setSubtotal(subtotalResponse.data.total);

        // get the unpaid/remaining invoices
        const unpaidInvoicesResponse = await backend.get(
          "/events/remaining/" + invoice.data[0]["eventId"]
        );

        // calculate sum of unpaid/remaining invoices
        const unpaidTotals = await Promise.all(
          unpaidInvoicesResponse.data.map((invoice) =>
            backend.get(`/invoices/total/${invoice.id}`)
          )
        );
        const partiallyPaidTotals = await Promise.all(
          unpaidInvoicesResponse.data.map((invoice) =>
            backend.get(`/invoices/paid/${invoice.id}`)
          )
        );
        const unpaidTotal = unpaidTotals.reduce(
          (sum, res) => sum + res.data.total,
          0
        );
        const unpaidPartiallyPaidTotal = partiallyPaidTotals.reduce(
          (sum, res) => sum + res.data.paid,
          0
        );
        const remainingBalance = unpaidTotal - unpaidPartiallyPaidTotal;
        setPastDue(remainingBalance);
      } catch (error) {
        // Invoice/field does not exist
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [invoice]);

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
        console.log("Booking details:", bookingResponse.data);
        setBookingDetails(bookingResponse.data[0]);

        const roomResponse = await backend.get(
          `/rooms/${bookingResponse.data[0].roomId}`
        );
        setRoom(roomResponse.data);
        console.log("Room", roomResponse);
      } catch (error) {
        console.error("Error fetching booking details:", error);
      }
    };

    fetchBookingDetails();
  }, [comments, backend]);

  const handleBack = () => {
    navigate(`/invoices/${id}`);
};

  return (
    <Navbar>
      <VStack>
      <InvoiceNavBar onBack={handleBack} id={id} />
      <Box
          width="80%"
          minH="150vh"
          position="relative"
          bg="white"
          backgroundImage={`url(${InvoiceBackground})`}
          backgroundSize="100% 150vh"
          backgroundPosition="top"
          backgroundRepeat="no-repeat"
          overflow="visible"
        >
          <VStack
            width="100%"
            height="100%"
            spacing={4}
            pt={8}
            pb={32}
            px={8}
          >
            <Box
              width="100%"
              overflowY="visible"
              mt={36}
            >
              <EditInvoiceTitle />
              <EditInvoiceDetails
                instructors={instructors}
                programName={programName}
                payees={payees}
              />
              <StatementComments
                comments={comments}
                booking={booking}
                room={room}
                subtotal={subtotal}
              />
              <InvoiceSummary
                pastDue={pastDue}
                subtotal={subtotal}
              />
            </Box>
          </VStack>
        </Box>
      </VStack>

    </Navbar>
  );
};
