import React, { useEffect, useState } from "react";

import {
  Box,
  Button,
  Flex,
  IconButton,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";

import { FaAngleLeft } from "react-icons/fa6";
import { FiExternalLink } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import {
  TransformComponent,
  TransformWrapper,
  useControls,
} from "react-zoom-pan-pinch";

import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import Navbar from "../navbar/Navbar";
import { EmailHistory } from "./EmailHistory";
import {
  InvoicePayments,
  InvoiceStats,
  InvoiceTitle,
} from "./InvoiceComponents";
import { InvoiceView } from "./InvoiceView";
import { PDFButtonInvoice } from "./PDFButtonInvoice";

export const SingleInvoice = () => {
  const { id } = useParams();
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
  const {
    isOpen: isModalOpen,
    onOpen: openModal,
    onClose: closeModal,
  } = useDisclosure();
  const [intendedPath, setIntendedPath] = useState(null);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [summary, setSummary] = useState([]);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current invoice
        const currentInvoiceResponse = await backend.get(`/invoices/${id}`);
        setInvoice(currentInvoiceResponse);

        // If no invoice is found, set everything to null
        if (
          !currentInvoiceResponse.data ||
          currentInvoiceResponse.status === 404
        ) {
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
        // const invoiceTotalResponse = await backend.get(`/invoices/total/${id}`);
        // const total = invoiceTotalResponse.data.total;
        // setTotal(total);
        // setSubtotal(total);

        // calculate sum of unpaid/remaining invoices
        // const unpaidInvoicesResponse = await backend.get(
        //   "/events/remaining/" + currentInvoiceResponse.data[0]["eventId"]
        // );
        // const unpaidTotals = await Promise.all(
        //   unpaidInvoicesResponse.data.map((invoice) =>
        //     backend.get(`/invoices/total/${invoice.id}`)
        //   )
        // );
        // const partiallyPaidTotals = await Promise.all(
        //   unpaidInvoicesResponse.data.map((invoice) =>
        //     backend.get(`/invoices/paid/${invoice.id}`)
        //   )
        // );
        // const unpaidTotal = unpaidTotals.reduce(
        //   (sum, res) => sum + res.data.total,
        //   0
        // );
        // const unpaidPartiallyPaidTotal = partiallyPaidTotals.reduce(
        //   (sum, res) => {
        //     const paidAmount = res.data.paid || 0;
        //     return sum + paidAmount;
        //   },
        //   0
        // );

        // const remainingBalance = unpaidTotal - unpaidPartiallyPaidTotal;

        // setRemainingBalance(remainingBalance);
        // setPastDue(remainingBalance);

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

        // set billing period
        setBillingPeriod({
          startDate: currentInvoice.startDate,
          endDate: currentInvoice.endDate,
        });
        // get comments
        const commentsResponse = await backend.get(
          "/comments/paidInvoices/" + id
        );
        setComments(commentsResponse.data);

        console.log("commentsResponse", commentsResponse);

        // get emails
        const emailsResponse = await backend.get(
          "/invoices/historicInvoices/" + id
        );
        setEmails(emailsResponse.data);

        // get payees
        const payeesResponse = await backend.get("/invoices/payees/" + id);
        setPayees(payeesResponse.data);

        // get corresponding event
        const eventResponse = await backend.get("/invoices/invoiceEvent/" + id);
        setEvent(eventResponse.data);

        const sessionResponse = await backend.get(`comments/invoice/sessions/${id}`)
        setSessions(sessionResponse.data)

        const summaryResponse = await backend.get(`comments/invoice/summary/${id}`)
        setSummary(summaryResponse.data);
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
        setRoomRate(room[0]?.rate);
      } catch (error) {
        console.error("Error fetching booking details:", error);
      }
    };

    fetchBookingDetails();
  }, [comments, backend, room]);

  const handlePreviewClick = () => {
    navigate(`/invoices/savededits/${id}`);
  };

  const handleModalConfirm = () => {
    console.log("Handle modal confirm executed");
    if (intendedPath) {
      navigate(intendedPath);
      setIntendedPath(null);
    } else {
      navigate("/invoices");
    }
  };

  const handleNavbarClick = (path) => {
    if (hasUnsavedChanges) {
      openModal();
      setPendingNavigation(() => () => navigate(path));
    } else {
      navigate(path);
    }
  };

  console.log("comments before", comments);

  return (
    <Navbar onNavbarClick={handleNavbarClick}>
      <Flex
        direction="row"
        height="100%"
        width="100%"
      >
        <Flex
          direction="column"
          height="100%"
          width="100%"
          paddingY="2.5vw"
          gap="1.25vw"
        >
          <Modal
            isOpen={isModalOpen}
            onClose={closeModal}
          >
            <ModalOverlay />
            <ModalContent>
              <ModalHeader
                textAlign="left"
                color="#4A5568"
                pb={4}
                fontSize="16px"
                fontWeight="700"
              >
                Leave without saving changes?
              </ModalHeader>
              <ModalFooter
                style={{ display: "flex", justifyContent: "flex-end" }}
                gap={3}
              >
                <Button
                  onClick={() => {
                    closeModal();
                    if (pendingNavigation) {
                      pendingNavigation();
                      setHasUnsavedChanges(false);
                    }
                  }}
                  backgroundColor="#EDF2F7"
                  color="#2D3748"
                  fontSize="14px"
                  fontWeight="500"
                >
                  Don't Save
                </Button>
                <Button
                  onClick={closeModal}
                  backgroundColor="#4441C8"
                  color="#FFFFFF"
                  fontSize="14px"
                  fontWeight="500"
                >
                  Save
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
          <Flex
            direction="row"
            width="100%"
          >
            {/* back button */}
            <IconButton
              icon={<FaAngleLeft />}
              onClick={() => handleNavbarClick(`/invoices`)}
              variant="link"
              color="#474849"
              fontSize="1.5em"
              mr={6}
            ></IconButton>
            <InvoiceTitle
              title={event ? event.name : "N/A"}
              isSent={invoice?.data?.[0]?.isSent}
              paymentStatus={invoice?.data?.[0]?.paymentStatus}
              endDate={invoice?.data?.[0]?.endDate}
            ></InvoiceTitle>

            {/* buttons */}
            <Flex
              direction="row"
              marginLeft="auto"
              gap={1}
            >
              <PDFButtonInvoice id={id} />
              <Button
                height={"40px"}
                backgroundColor="#4441C8"
                color="#FFF"
                fontFamily={"Inter"}
                fontWeight={"700"}
                fontSize="14px"
                gap={"4px"}
                padding={"0px 16px"}
                onClick={handlePreviewClick}
              >
                <FiExternalLink />
                Preview
              </Button>
            </Flex>
          </Flex>
          <Flex
            direction="column"
            height="100%"
            width="100%"
            padding="2.5vh 26px 26px 4vw"
            gap="1.25vw"
          >
            <Flex
              direction="row"
              width="100%"
              justify="space-between"
              gap="16px"
            >
              <Flex
                direction="column"
                height="100%"
                w="50%"
                // padding="2.5vw"
                gap="1.25vw"
              >
                <InvoiceStats
                  roomRate={roomRate}
                  billingPeriod={billingPeriod}
                  amountDue={total}
                  remainingBalance={!remainingBalance}
                ></InvoiceStats>
                <InvoicePayments
                  comments={comments}
                  setComments={setComments}
                  setHasUnsavedChanges={setHasUnsavedChanges}
                ></InvoicePayments>
                <EmailHistory emails={emails}></EmailHistory>
              </Flex>
              <Flex
                direction="column"
                gap="1.25vw"
                borderWidth={25}
                borderRadius={18}
                w="50%"
                h="80%"
                borderColor="#D9D9D933"
                overflow="hidden" // Important: prevents scrollbars from fighting transform
                justifyContent="center" 
                alignItems="center"
              >
                <TransformWrapper
                  limitToBounds={false}
                  centerOnInit={true}
                  limitToWrapper={true}
                  panning={{ velocityDisabled: true }}
                >
                  <TransformComponent >
                    <Box transform="scale(0.85)" transformOrigin="center">
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
                        compactView={true}
                      />
                    </Box>
                  </TransformComponent>
                </TransformWrapper>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Navbar>
  );
};
