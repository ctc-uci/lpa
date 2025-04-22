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

import InvoiceFooterBackground from "../../assets/background/InvoiceFooter.png";
import InvoiceHeaderBackground from "../../assets/background/InvoiceHeader.png";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import Navbar from "../navbar/Navbar";
import { EditInvoiceTitle, EditInvoiceDetails, FooterDescription } from "./EditInvoiceComponents";
import { SavedInvoiceSummary, SavedStatementComments } from "./SavedEditInvoiceComponent";


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
        console.log(commentsResponse)
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

  useEffect(() => {
    console.log("comments in saved", comments, invoice);
  }, [comments, invoice])

  return (
    <Navbar>
      <VStack>
        <SavedInvoiceNavBar
          onBack={handleBack}
          id={id}
        />
        <Image
          w="80%"
          position="relative"
          src={InvoiceHeaderBackground}
          backgroundSize="100%"
          backgroundRepeat="no-repeat"
        />
        <VStack
          width="80%"
          spacing={4}
          px={8}
        >
          <Box>
              <EditInvoiceTitle
                  comments={comments}
                  invoice={invoice?.data}
                />
            <EditInvoiceDetails
                instructors={instructors}
                programName={programName}
                payees={payees}
                comments={comments}
                invoice={invoice?.data}
              />
            <SavedStatementComments
                comments={comments}
                booking={booking}
                room={room}
                subtotal={subtotal}
                setSubtotal={setSubtotal}
              />
            <SavedInvoiceSummary
              comments={comments}
              booking={booking}
              room={room}
              subtotal={subtotal}
              setSubtotal={setSubtotal}
              pastDue={pastDue}
            />
            <FooterDescription />
          </Box>
        </VStack>
        <Image
          w="80%"
          position="relative"
          src={InvoiceFooterBackground}
          backgroundSize="100%"
          backgroundRepeat="no-repeat"
        />
      </VStack>
    </Navbar>
  );
};
