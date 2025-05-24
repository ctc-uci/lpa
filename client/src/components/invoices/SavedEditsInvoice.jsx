import React, { useEffect, useState } from "react";

import {
  Box,
  Button,
  Link as ChakraLink,
  Flex,
  HStack,
  Icon,
  IconButton,
  Image,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";

import { Link, useNavigate, useParams } from "react-router-dom";

import { PencilIcon } from "../../assets/EditInvoiceIcons.jsx";
import { LeftIcon } from "../../assets/LeftIcon.jsx";
import { SavedInvoiceEllipsisIcon } from "../../assets/SavedInvoiceEllipsisIcon.jsx";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { EmailSidebar } from "../email/EmailSidebar.jsx";
import Navbar from "../navbar/Navbar";
import { InvoiceView } from "./InvoiceView";

const SavedInvoiceNavBar = ({
  onBack,
  id,
  invoice,
  payees,
  programName,
  comments,
}) => {

  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  
  const getGeneratedDate = (comments = [], invoice = null, includeDay = true) => {
    console.log("invoice", invoice);
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
      const invoiceDateSplit = invoice[0]?.startDate?.split('T')[0];
      const invoiceDate = new Date(invoiceDateSplit);
      invoiceDate.setMinutes(invoiceDate.getMinutes() + invoiceDate.getTimezoneOffset());
      const month = invoiceDate.toLocaleString("default", { month: "long" });
      const year = invoiceDate.getFullYear();
      return `${month} ${year}`;
    } else {
      return "No Date Found";
    }
  };

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
      <HStack>
        <IconButton
          icon={<LeftIcon color="black" />}
          onClick={onBack}
          variant="link"
          color="#474849"
          fontSize="1.5em"
          aria-label="Go back"
        />
        <Text fontWeight="700">{`${programName.trim().split(" ").slice(0, 3).join(" ")}, ${getGeneratedDate([], invoice?.data, false)}_Classroom Rental Summary`}</Text>
      </HStack>

      <HStack>
        {/* Edit Icon looks different from Figma HiFi, so lmk if yall want me to make another edit icon or just reuse the icon we already have */}
        <Button
          leftIcon={<PencilIcon color="black" />}
          onClick={() => navigate(`/invoices/edit/${id}`)}
        >
          Edit
        </Button>
        <EmailSidebar
          isOpen={isOpen}
          onOpen={onOpen}
          onClose={onClose}
          payees={payees}
          pdf_title={`${programName.trim().split(" ").slice(0, 3).join(" ")}, ${getGeneratedDate([], invoice?.data, false)} Invoice`}
          invoice={invoice}
        />
      </HStack>
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
        setComments(commentsResponse.data);

        const programNameResponse = await backend.get(
          "/events/" + invoice.data[0].eventId
        );
        setProgramName(programNameResponse.data[0].name);

        const payeesResponse = await backend.get("/invoices/payees/" + id);
        setPayees(payeesResponse.data);

        // const subtotalResponse = await backend.get("/invoices/total/" + id);
        // setSubtotal(subtotalResponse.data.total);

        // ==== PAST DUE CALCULATION ====
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

        // ==== END OF PAST DUE CALCULATION ====

        const sessionResponse = await backend.get(
          `comments/invoice/sessions/${id}`
        );
        setSessions(sessionResponse.data);

        const summaryResponse = await backend.get(
          `comments/invoice/summary/${id}`
        );
        setSummary(summaryResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [invoice]);

  // useEffect(() => {
  //   const fetchBookingDetails = async () => {
  //     try {
  //       if (!comments || !Array.isArray(comments) || comments.length === 0) {
  //         return;
  //       }

  //       const commentWithBookingId = comments[0].bookingId;

  //       const bookingResponse = await backend.get(
  //         `/bookings/${commentWithBookingId}`
  //       );
  //       setBookingDetails(bookingResponse.data[0]);

  //       const roomResponse = await backend.get(
  //         `/rooms/${bookingResponse.data[0].roomId}`
  //       );
  //       setRoom(roomResponse.data);
  //       console.log("roomresponse.data", roomResponse.data)
  //     } catch (error) {
  //       console.error("Error fetching booking details:", error);
  //     }
  //   };

  //   fetchBookingDetails();
  // }, [comments, backend]);

  const handleBack = () => {
    navigate(`/invoices/${id}`);
  };

  return (
    <Navbar>
      <VStack>
        <SavedInvoiceNavBar
          onBack={handleBack}
          id={id}
          invoice={invoice}
          payees={payees}
          programName={programName}
        />

        <InvoiceView
          comments={comments}
          sessions={sessions}
          setSessions={setSessions}
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
