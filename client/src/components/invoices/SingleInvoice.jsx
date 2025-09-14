import React, { useCallback, useEffect, useRef, useState } from "react";

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
import { UnsavedChangesModal } from "../popups/UnsavedChangesModal";
import { EmailHistory } from "./EmailHistory";
import {
  InvoicePayments,
  InvoiceStats,
  InvoiceTitle,
} from "./InvoiceComponents";
import { InvoiceView } from "./InvoiceView";
import { PDFButtonInvoice } from "./PDFButtonInvoice";
import { useSessionStore } from "../../stores/useSessionStore";
import { useSummaryStore } from "../../stores/useSummaryStore";

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
  const currentPastDue = useRef(pastDue);

  const {
    isOpen: isModalOpen,
    onOpen: openModal,
    onClose: closeModal,
  } = useDisclosure();
  const [intendedPath, setIntendedPath] = useState(null);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [actionToContinue, setActionToContinue] = useState(null);
  // const [summary, setSummary] = useState([]);
  // const [sessions, setSessions] = useState([]);
  const { summary, setSummary } = useSummaryStore();
  const { sessions, setSessions } = useSessionStore();
  const invoicePaymentsRef = useRef(null);

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
        const invoiceTotalResponse = await backend.get(`/invoices/total/${id}`);
        const total = invoiceTotalResponse.data.total;
        setTotal(total);
        setSubtotal(total);

        // // calculate sum of unpaid/remaining invoices
        // const unpaidInvoicesResponse = await backend.get(
        //   "/events/remaining/" + currentInvoiceResponse.data[0]["eventId"]
        // );
        // // console.log("currentInvoiceResponse data[0] eventId", currentInvoiceResponse.data[0]["eventId"]);

        // const unpaidTotals = await Promise.all(
        //   unpaidInvoicesResponse.data.map((invoice) =>{
        //     // console.log("invoice.id", invoice.id)
        //     return backend.get(`/invoices/total/${invoice.id}`)
        //   })
        // )

        // const partiallyPaidTotals = await Promise.all(
        //   unpaidInvoicesResponse.data.map((invoice) =>
        //     backend.get(`/invoices/paid/${invoice.id}`)
        //   )
        // );
        // console.log("partiallyPaidTotals", partiallyPaidTotals);
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

        // const remainingBalanceCalculated = unpaidTotal - unpaidPartiallyPaidTotal;
        // console.log("remainingBalance", remainingBalance);
        // console.log("unpaidTotal - unpaidPartiallyPaidTotal", `${unpaidTotal} - ${unpaidPartiallyPaidTotal}`);

        // setRemainingBalance(remainingBalanceCalculated);
        // setPastDue(remainingBalance);

        // const paidTotalResponse = await backend.get(`/invoices/paid/${id}`);
        // const paidTotal = paidTotalResponse.data.total;

        // const remainingBalanceCalculated =
        //   total - paidTotal > 0 ? total - paidTotal : 0;
        // setRemainingBalance(remainingBalanceCalculated);
        // setPastDue(remainingBalanceCalculated);

         // ==== PAST DUE CALCULATION ====
         const unpaidInvoicesResponse = await backend.get(
          "/events/remaining/" + currentInvoice.eventId
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
        // const commentsResponse = await backend.get(
        //   "/comments/paidInvoices/" + id
        // );

        const commentsResponse = await backend.get("/comments/invoice/" + id);
        setComments(commentsResponse.data);

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

        const sessionResponse = await backend.get(
          `comments/invoice/sessions/${id}`
        );

        // console.log("sessionResponse", sessionResponse.data)
        // console.log("sessionResponse", sessionResponse.data)
        setSessions(sessionResponse.data);

        const summaryResponse = await backend.get(
          `comments/invoice/summary/${id}`
        );
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
        // console.log("fetching booking details 2");
        // if (!comments || !Array.isArray(comments) || comments.length === 0) {
        //   return;
        // }

        // console.log("fetching booking details 3");
        // console.log("comments", comments);

        // // Check if bookingId exists and is not null
        // const commentWithBookingId = comments[0]?.bookingId;
        // if (!commentWithBookingId) {
        //   return;
        // }

        // console.log("fetching booking details 4");

        // const bookingResponse = await backend.get(
        //   `/bookings/${commentWithBookingId}`
        // );

        // if (!bookingResponse.data || !bookingResponse.data[0]) {
        //   return;
        // }

        // setBookingDetails(bookingResponse.data[0]);

        // const roomResponse = await backend.get(
        //   `/rooms/${bookingResponse.data[0].roomId}`
        // );
        // if (roomResponse.data) {
        //   setRoom(roomResponse.data);
        //   setRoomRate(roomResponse.data[0]?.rate || 0);
        // }

        const totalRoomRate = sessions.reduce((acc, session) => {
          return acc + (Number(session.rate) || 0);
        }, 0);
        setRoomRate(totalRoomRate);
      } catch (error) {
        console.error("Error fetching booking details:", error);
      }
    };
    fetchBookingDetails();
  }, [sessions, backend]);

  const handlePreviewClick = () => {
    navigate(`/invoices/savededits/${id}`);
    console.log("Preview clicked");
  };

  const handleSaveChanges = () => {
    if (pendingNavigation) {
      invoicePaymentsRef.current?.handleSaveComment();
      pendingNavigation();
      setPendingNavigation(null);
      setHasUnsavedChanges(false);
    } else {
      invoicePaymentsRef.current?.handleSaveComment();
      setHasUnsavedChanges(false);
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

  const handleOtherButtonClick = useCallback((onContinueAction) => {
    setActionToContinue(() => onContinueAction);
    openModal();
  }, []);

  return (
    <Navbar
      handleNavbarClick={handleNavbarClick}
      hasUnsavedChanges={hasUnsavedChanges}
    >
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
                    } else if (actionToContinue) {
                      actionToContinue();
                      setActionToContinue(null);
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
                  onClick={() => {
                    closeModal();
                    handleSaveChanges();
                  }}
                  backgroundColor="#4441C8"
                  _hover={{ backgroundColor: "#312E8A" }}
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
            width="95%"
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
              <PDFButtonInvoice
                id={id}
                hasUnsavedChanges={hasUnsavedChanges}
                handleOtherButtonClick={handleOtherButtonClick}
              />
              <Button
                height={"40px"}
                backgroundColor="#4441C8"
                color="#FFF"
                fontFamily={"Inter"}
                fontWeight={"700"}
                fontSize="14px"
                gap={"4px"}
                padding={"0px 16px"}
                onClick={() => {
                  console.log(hasUnsavedChanges);
                  if (hasUnsavedChanges) {
                    openModal();
                    setPendingNavigation(
                      () => () => navigate(`/invoices/savededits/${id}`)
                    );
                    console.log("has unsaved changes");
                  } else {
                    handlePreviewClick();
                  }
                }}
                _hover={{ bg: "#312E8A" }}
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
                  remainingBalance={remainingBalance}
                ></InvoiceStats>
                <InvoicePayments
                  comments={comments}
                  setComments={setComments}
                  setHasUnsavedChanges={setHasUnsavedChanges}
                  setRemainingBalance={setRemainingBalance}
                  amountDue={total}
                  hasUnsavedChanges={hasUnsavedChanges}
                  handleOtherButtonClick={handleOtherButtonClick}
                  handleSaveChanges={handleSaveChanges}
                  ref={invoicePaymentsRef}
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
                mr="40px"
              >
                <TransformWrapper
                  limitToBounds={false}
                  centerOnInit={true}
                  limitToWrapper={true}
                  panning={{ velocityDisabled: true }}
                >
                  <TransformComponent>
                    <Box
                      transform="scale(0.85)"
                      transformOrigin="center"
                    >
                      <InvoiceView
                        comments={comments}
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
