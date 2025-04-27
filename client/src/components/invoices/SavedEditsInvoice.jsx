import React, { useEffect, useState } from "react";

import {
  Box,
  Flex,
  Icon,
  IconButton,
  Image,
  VStack,
} from "@chakra-ui/react";
import { useNavigate, useParams} from "react-router-dom";

import { BackArrowIcon } from "../../assets/BackArrowIcon";
import { SavedInvoiceEllipsisIcon } from "../../assets/SavedInvoiceEllipsisIcon.jsx";

import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import Navbar from "../navbar/Navbar";
import { InvoiceView } from "./InvoiceView";

const SavedInvoiceNavBar = ({ onBack, id }) => {
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
          icon={<BackArrowIcon/>}
          onClick={onBack}
          variant="link"
          color="#474849"
          fontSize="1.5em"
          aria-label="Go back"
        />

        <Icon
          viewBox="0 0 17 16"
          boxSize={5}
          color="#4A5568"
        >
          <SavedInvoiceEllipsisIcon/>
          <path
            d="M8.17904 6.6665C7.4457 6.6665 6.8457 7.2665 6.8457 7.99984C6.8457 8.73317 7.4457 9.33317 8.17904 9.33317C8.91237 9.33317 9.51237 8.73317 9.51237 7.99984C9.51237 7.2665 8.91237 6.6665 8.17904 6.6665ZM12.179 6.6665C11.4457 6.6665 10.8457 7.2665 10.8457 7.99984C10.8457 8.73317 11.4457 9.33317 12.179 9.33317C12.9124 9.33317 13.5124 8.73317 13.5124 7.99984C13.5124 7.2665 12.9124 6.6665 12.179 6.6665ZM4.17904 6.6665C3.4457 6.6665 2.8457 7.2665 2.8457 7.99984C2.8457 8.73317 3.4457 9.33317 4.17904 9.33317C4.91237 9.33317 5.51237 8.73317 5.51237 7.99984C5.51237 7.2665 4.91237 6.6665 4.17904 6.6665Z"
            fill="currentColor"
          />
        </Icon>



      </Flex>
    );
  };

export const SavedEdit = () => {
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

  const [sessions, setSessions] = useState([]);
  const [summary, setSummary] = useState([]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentInvoiceResponse = await backend.get("/invoices/" + id);
        setInvoice(currentInvoiceResponse);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [backend, id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!invoice.data || invoice.status === 404) {
          setComments([]);
          setInstructors([]);
          setProgramName("");
          setPayees(null);
          setPastDue(0);
          return;
        }

        const instructorResponse = await backend.get(
          "/assignments/instructors/" + invoice.data[0].eventId
        );
        setInstructors(instructorResponse.data);

        const commentsResponse = await backend.get("/comments/invoice/" + id); 
        console.log("commentsResponse", commentsResponse)
        setComments(commentsResponse.data);

        const programNameResponse = await backend.get(
          "/events/" + invoice.data[0].eventId
        );
        setProgramName(programNameResponse.data[0].name);

        const payeesResponse = await backend.get("/invoices/payees/" + id);
        setPayees(payeesResponse.data);

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
          (sum, res) => {
            return sum + Number(res.data.total); // Had to change to number because was causing NaN
          },
          0
        );
        const remainingBalance = unpaidTotal - unpaidPartiallyPaidTotal;
        setPastDue(remainingBalance);

        const sessionResponse = await backend.get(`comments/invoice/sessions/${id}`)
        setSessions(sessionResponse.data)

        const summaryResponse = await backend.get(`comments/invoice/sessions/${id}?includeNoBooking=true`)
        setSummary(summaryResponse.data);

      } catch (error) {
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

        const commentWithBookingId = comments[0].bookingId;

        const bookingResponse = await backend.get(
          `/bookings/${commentWithBookingId}`
        );
        setBookingDetails(bookingResponse.data[0]);

        const roomResponse = await backend.get(
          `/rooms/${bookingResponse.data[0].roomId}`
        );
        setRoom(roomResponse.data);
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
        <SavedInvoiceNavBar
          onBack={handleBack}
          id={id}
        />

        <InvoiceView
          comments={comments}
          sessions={sessions}
          summary={summary}
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
      </VStack>
    </Navbar>
  );
};
