import React, { useEffect, useState } from "react";

import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Image,
  Text,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";

import { useNavigate, useParams } from "react-router-dom";

import { BackArrowIcon } from "../../assets/BackArrowIcon";
import InvoiceFooterBackground from "../../assets/background/InvoiceFooter.png";
import InvoiceHeaderBackground from "../../assets/background/InvoiceHeader.png";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { EmailSidebar } from "../email/EmailSidebar";
import Navbar from "../navbar/Navbar";
import {
  EditInvoiceDetails,
  EditInvoiceTitle,
  FooterDescription,
  InvoiceSummary,
  StatementComments,
} from "./EditInvoiceComponents";

const InvoiceNavBar = ({
  onBack,
  onSave,
  isSaving,
  payees,
  comments,
  invoice,
  programName,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const getGeneratedDate = () => {
    if (comments.length > 0) {
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
          icon={<BackArrowIcon />}
          onClick={onBack}
          variant="link"
          color="#474849"
          fontSize="1.5em"
          aria-label="Go back"
        />
        <Text fontWeight="700">{`${programName.split(" ").slice(0, 3).join(" ")}, ${getGeneratedDate(comments, invoice, false)} Invoice`}</Text>
      </HStack>
      <HStack>
        <Button
          height="2.5em"
          borderRadius={10}
          backgroundColor="#4441C8"
          _hover={{ backgroundColor: "#312E8A" }}
          color="#FFF"
          fontSize="clamp(.75rem, 1rem, 1.25rem)"
          onClick={onSave}
          isLoading={isSaving}
        >
          Save
        </Button>
        <HStack>
          <EmailSidebar
            isOpen={isOpen}
            onOpen={onOpen}
            onClose={onClose}
            payees={payees}
            pdf_title={`${programName.split(" ").slice(0, 3).join(" ")}, ${getGeneratedDate(comments, invoice, false)} Invoice`}
            invoice={invoice}
          />
        </HStack>
      </HStack>
    </Flex>
  );
};

export const EditInvoice = () => {
  const { id } = useParams();
  const { backend } = useBackendContext();
  const navigate = useNavigate();
  const toast = useToast();

  const [invoice, setInvoice] = useState([]);
  const [comments, setComments] = useState([]);
  const [editedComments, setEditedComments] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [programName, setProgramName] = useState("");
  const [payees, setPayees] = useState([]);
  const [booking, setBookingDetails] = useState([]);
  const [room, setRoom] = useState([]);

  const [subtotal, setSubtotal] = useState(0);
  const [editedSubtotal, setEditedSubtotal] = useState(0);
  const [pastDue, setPastDue] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const [editedFields, setEditedFields] = useState({
    comments: [],
    subtotal: 0,
    pastDue: 0,
  });

  const [subtotalValue, setSubtotalValue] = useState(0);

  useEffect(() => {
    if (id) {
      sessionStorage.setItem("userId", id);
    }
  }, [id]);

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
        setEditedComments(commentsResponse.data);

        const programNameResponse = await backend.get(
          "/events/" + invoice.data[0].eventId
        );
        setProgramName(programNameResponse.data[0].name);

        const payeesResponse = await backend.get("/invoices/payees/" + id);
        setPayees(payeesResponse.data);

        const subtotalResponse = await backend.get("/invoices/total/" + id);
        setSubtotal(subtotalResponse.data.total);
        setEditedSubtotal(subtotalResponse.data.total);

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
            return sum + Number(res.data.total);
          },
          0
        );
        const remainingBalance = unpaidTotal - unpaidPartiallyPaidTotal;
        setPastDue(remainingBalance);

        // Initialize the edited fields with current data
        setEditedFields({
          comments: commentsResponse.data,
          adjustments: [],
          subtotal: subtotalResponse.data.total,
          pastDue: remainingBalance,
        });
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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const roomData = {
        ...room[0],
        rate: room[0].rate,
      };

      console.log("roomData", roomData);
      const roomResponse = await backend.put(`/rooms/${room[0].id}`, roomData);
      console.log("roomResponse", roomResponse);

      for (const comment of editedComments) {
        const commentData = {
          adjustment_type: comment.adjustmentType || null,
          adjustment_value: comment.adjustmentValue,
          booking_id: comment.bookingId,
          comment: comment.comment,
          datetime: comment.datetime,
          id: comment.id || null,
          invoice_id: comment.invoiceId,
          user_id: comment.userId,
        };

        try {
          if (comment.id) {
            // Update existing comment
            const response = await backend.put(
              `/comments/${comment.id}`,
              commentData
            );
            console.log("Updated comment:", response.data);
          } else {
            // Create new comment
            const response = await backend.post(`/comments`, commentData);
            console.log("Created new comment:", response.data);
          }
        } catch (error) {
          console.error(`Error saving comment ${comment.id}:`, error);

          if (error.response && error.response.status === 400) {
            try {
              const altResponse = await backend.post(
                `/comments/update/${comment.id}`,
                commentData
              );
            } catch (altError) {
              console.error("Alternative update failed:", altError);
              throw altError;
            }
          } else {
            throw error;
          }
        }
      }

      navigate(`/invoices/savededits/${id}`);
    } catch (error) {
      console.error("Error saving invoice:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handler for comment updates
  const handleCommentUpdate = (updatedComments) => {
    setEditedComments(updatedComments);
    setEditedFields({
      ...editedFields,
      comments: updatedComments,
    });
  };

  // Handler for subtotal updates
  const handleSubtotalUpdate = (newSubtotal) => {
    setEditedSubtotal(newSubtotal);
    setSubtotalValue(newSubtotal);
    setEditedFields({
      ...editedFields,
      subtotal: newSubtotal,
    });
  };

  return (
    <Navbar>
      <VStack>
        <InvoiceNavBar
          onBack={handleBack}
          onSave={handleSave}
          isSaving={isSaving}
          payees={payees}
          comments={comments}
          invoice={invoice}
          programName={programName}
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
          <Box width="100%">
            <EditInvoiceTitle
              comments={editedComments}
              invoice={invoice?.data}
            />
            <EditInvoiceDetails
              instructors={instructors}
              programName={programName}
              payees={payees}
              comments={editedComments}
              invoice={invoice?.data}
            />
            <StatementComments
              booking={booking}
              room={room}
              subtotal={editedSubtotal}
              comments={editedComments}
              onCommentsChange={handleCommentUpdate}
              onSubtotalChange={handleSubtotalUpdate}
            />
            <InvoiceSummary
              pastDue={pastDue}
              subtotal={subtotalValue}
              comments={editedComments}
              onCommentsChange={handleCommentUpdate}
              onSubtotalChange={handleSubtotalUpdate}
              room={room}
              setRoom={setRoom}
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
