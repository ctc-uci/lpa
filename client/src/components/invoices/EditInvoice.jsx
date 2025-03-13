import React, { useEffect, useState } from "react";

import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  VStack,
  Image,
  useToast,
  Text,
} from "@chakra-ui/react";

import { useNavigate, useParams } from "react-router-dom";
import InvoiceHeaderBackground from "../../assets/background/InvoiceHeader.png"
import InvoiceFooterBackground from "../../assets/background/InvoiceFooter.png"
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import Navbar from "../navbar/Navbar";
import {
  EditInvoiceDetails,
  EditInvoiceTitle,
  InvoiceSummary,
  StatementComments,
  FooterDescription,
  RadioDropdown
} from "./EditInvoiceComponents";

const InvoiceNavBar = ({ onBack, onSave, isSaving, payees, comments }) => {
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
      <Text fontWeight='700'>{`${payees?.map(payee => payee.name).join('_')}_${getGeneratedDate()}`}</Text> 
          </HStack>

      <Button
        height="2.5em" 
        borderRadius={10}
        backgroundColor="#4E4AE7"
        color="#FFF"
        fontSize="clamp(.75rem, 1rem, 1.25rem)"
        onClick={onSave}
        isLoading={isSaving}
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
    pastDue: 0
  });

  const [subtotalValue, setSubtotalValue] = useState(0);

  useEffect(() => {
    if (id) {
      sessionStorage.setItem('userId', id);
    } 
  }, [id ]);

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

        // get instructors
        const instructorResponse = await backend.get(
          "/assignments/instructors/" + invoice.data[0].eventId
        );
        setInstructors(instructorResponse.data);

        // get comments
        const commentsResponse = await backend.get("/comments/invoice/" + id);
        setComments(commentsResponse.data);
        setEditedComments(commentsResponse.data); // Initialize edited comments

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
            return sum + Number(res.data.total)
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
          pastDue: remainingBalance
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

  // Function to handle save
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // console.log("editedComments", editedComments)
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
            user_id: comment.userId
          };


          

          console.log("roomData", roomData)
          
          try {
            if (comment.id) {
              // Update existing comment with PUT request
              const response = await backend.put(`/comments/${comment.id}`, commentData);
              console.log("Updated comment:", response.data);
            } else {
              // Create new comment with POST request
              const response = await backend.post(`/comments`, commentData);
              console.log("Created new comment:", response.data);
            }


            // const response = await backend.put(`/comments/${comment.id}`, commentData);
            // console.log("response.data", response.data)
          } catch (error) {
            console.error(`Error saving comment ${comment.id}:`, error);
            
            if (error.response && error.response.status === 400) {
              try {
                const altResponse = await backend.post(`/comments/update/${comment.id}`, commentData);
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
      comments: updatedComments
    });
  };

  // Handler for subtotal updates
  const handleSubtotalUpdate = (newSubtotal) => {
    setEditedSubtotal(newSubtotal);
    setSubtotalValue(newSubtotal);
    setEditedFields({
      ...editedFields,
      subtotal: newSubtotal
    });
  };

  return (
    <Navbar>
      <VStack>
      <InvoiceNavBar onBack={handleBack} onSave={handleSave} isSaving={isSaving} payees={payees} comments={comments}/>
        <Image
              w='80%'
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
              {/* <RadioDropdown/> */}
            </Box>
          </VStack>
          <Image
              w='80%'
              position="relative"
              src={InvoiceFooterBackground}
              backgroundSize="100%"
              backgroundRepeat="no-repeat"
          />
      </VStack>

    </Navbar>
  );
};