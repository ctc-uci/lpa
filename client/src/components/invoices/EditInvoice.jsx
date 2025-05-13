import React, { useEffect, useState } from "react";

import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Image,
  Text,
  useToast,
  VStack,
  useDisclosure
} from "@chakra-ui/react";

import { useNavigate, useParams } from "react-router-dom";

import InvoiceFooterBackground from "../../assets/background/InvoiceFooter.png";
import InvoiceHeaderBackground from "../../assets/background/InvoiceHeader.png";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import Navbar from "../navbar/Navbar";
import {
  EditInvoiceDetails,
  EditInvoiceTitle,
  FooterDescription,
  InvoiceSummary,
  StatementComments,
} from "./EditInvoiceComponents";

import { EmailSidebar } from "../email/EmailSidebar";
import { LeftIcon } from "../../assets/LeftIcon";

const InvoiceNavBar = ({ onBack, onSave, isSaving, payees, comments, invoice, programName }) => {
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
          icon={<LeftIcon color="black"/>}
          onClick={onBack}
          variant="link"
          color="#474849"
          fontSize="1.5em"
          aria-label="Go back"
        />
        <Text fontWeight="700">{`${programName.split(" ").slice(0, 3).join(" ")}_${getGeneratedDate(comments, invoice, false)}_Classroom Rental Summary`}</Text>
      </HStack>
      <HStack>
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
        <HStack>
          <EmailSidebar isOpen={isOpen} onOpen={onOpen} onClose={onClose} payees={payees} pdf_title={`${programName.split(" ").slice(0, 3).join(" ")}, ${getGeneratedDate(comments, invoice, false)} Invoice`} invoice={invoice}/>
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

  const [sessions, setSessions] = useState([]);
  const [summary, setSummary] = useState([]);

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


        const sessionResponse = await backend.get(`comments/invoice/sessions/${id}`)
        setSessions(sessionResponse.data)

        const summaryResponse = await backend.get(`comments/invoice/summary/${id}`)
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
        // if (!comments || !Array.isArray(comments) || comments.length === 0) {
        //   return;
        // }

        // const commentWithBookingId = comments[0].bookingId;
        // Gets all bookings within the invoice start and end date
        const bookingResponse = await backend.get(
          `/bookings`, {
            params: {
              start: invoice.data[0].startDate,
              end: invoice.data[0].endDate
            }
          }
        );
        // Filter for only the bookings that match the event id
        const bookingsWithinDate = bookingResponse.data;
        const bookingsWithEventId = bookingsWithinDate.filter(booking => booking.eventId === invoice.data[0].eventId);

        setBookingDetails(bookingsWithEventId);

        // Now fetch rooms for all those bookings
        const roomPromises = bookingsWithEventId.map(booking =>
          backend.get(`/rooms/${booking.roomId}`)
        );

        // Wait for all the room requests to complete in parallel:
        const roomResponses = await Promise.all(roomPromises);

        // Extract just the room data from the responses:
        const roomsArray = roomResponses.map(response => response.data[0]);



        setRoom(roomsArray);

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
      // Process all sessions
      for (const session of sessions) {
        
        // Handle comments for each session
        if (session.comments && session.comments.length > 0) {
          for (let i = 0; i < session.comments.length; i++) {
            const commentText = session.comments[i];

            // Prepare comment data
            const commentData = {
              user_id: session.userId, // Will be set by the server if null
              booking_id: session.bookingId || null,
              invoice_id: id,
              datetime: session.datetime,
              comment: commentText,
              adjustment_type: "none",
              adjustment_value: 0,
            };
            
            // If this is a custom row (doesn't have a real booking_id)
            if (String(session.id).includes("custom")) {
              commentData.booking_id = null;
              commentData.adjustment_type = "total";
              commentData.adjustment_value = session.rate;
              
              // For custom rows, always create a new comment
              try {
                await backend.post(`/comments`, commentData);
              } catch (error) {
                console.error(`Error saving custom row:`, error);
                throw error;
              }
              continue; // Skip the regular comment handling for custom rows
            } 
            // If this is a total adjustment session from the server
            else if (String(session.id).includes("total-")) {
              const originalCommentId = session.id.split("-")[1];
              
              // Update the existing total adjustment
              try {
                await backend.put(`/comments/${originalCommentId}`, {
                  comment: commentText,
                  adjustment_value: session.rate || session.total,
                  datetime: session.datetime,
                  adjustment_type: "total" // Ensure we keep it as total
                });
              } catch (error) {
                console.error(`Error updating total adjustment:`, error);
                throw error;
              }
              
              // Skip the rest of this iteration since we've handled this comment
              continue;
            }
            
            try {
              // For regular sessions, check if this comment already exists
              const existingComment = comments.find(c => 
                c.bookingId == commentData.booking_id && 
                c.comment == commentData.comment
              );

              if (existingComment) {
                // Update existing comment
                await backend.put(`/comments/${existingComment.id}`, commentData);
              } else {
                // Create new comment
                await backend.post(`/comments`, commentData);
              }
            } catch (error) {
              console.error(`Error saving comment:`, error);
              throw error;
            }
          }
        } else if (String(session.id).includes("custom")) {
          // Handle custom rows that might not have comments array
          const commentData = {
            user_id: session.userId,
            booking_id: null,
            invoice_id: id,
            datetime: session.datetime,
            comment: session.type || "Custom Fee",
            adjustment_type: "total",
            adjustment_value: session.rate
          };
          
          try {
            await backend.post(`/comments`, commentData);
          } catch (error) {
            console.error(`Error saving custom row without comments:`, error);
            throw error;
          }
        } else if (String(session.id).includes("total-")) {
          // Handle total adjustment sessions that might not have comments array
          const originalCommentId = session.id.split("-")[1];
          
          try {
            await backend.put(`/comments/${originalCommentId}`, {
              comment: session.type || "Additional Fee",
              adjustment_value: session.rate || session.total,
              datetime: session.datetime,
              adjustment_type: "total"
            });
          } catch (error) {
            console.error(`Error updating total adjustment without comments:`, error);
            throw error;
          }
        }
        
        // Handle adjustments for each session
        if (session.adjustmentValues && session.adjustmentValues.length > 0) {
          for (const adjustmentValue of session.adjustmentValues) {
            // Parse the adjustment value
            const isPercent = adjustmentValue.includes('%');
            const isNegative = adjustmentValue.startsWith('-');
            const numericValue = parseFloat(adjustmentValue.replace(/[+$%-]/g, ""));
            
            if (isNaN(numericValue)) continue;
            
            const adjustmentType = isPercent ? 'rate_percent' : 'rate_flat';
            const adjustmentNumericValue = isNegative ? -numericValue : numericValue;
            
            const adjustmentData = {
              user_id: session.userId,
              booking_id: session.bookingId || null,
              invoice_id: id,
              datetime: session.datetime,
              comment: "",
              adjustment_type: adjustmentType,
              adjustment_value: adjustmentNumericValue,
            };

            
            try {
              // Check if this adjustment already exists
              const existingAdjustment = comments.find(c => 
                c.bookingId == adjustmentData.booking_id && 
                c.adjustmentType == adjustmentData.adjustment_type &&
                c.adjustmentValue == adjustmentData.adjustment_value
              );
              
              // ! TODO If you change an adjustment value, it will keep the old one and create a new one with the change
              if (existingAdjustment) {
                // Update existing adjustment
                // console.log("existingAdjustmentData", existingAdjustment);
                const existingAdjustmentResponse = await backend.put(`/comments/${existingAdjustment.id}`, adjustmentData);
                // console.log("existingAdjustmentResponse", existingAdjustmentResponse);
              } else {
                // Create new adjustment
                // console.log("newAdjustmentData", adjustmentData);
                const newAdjustmentResponse = await backend.post(`/comments`, adjustmentData);
                // console.log("newAdjustmentResponse", newAdjustmentResponse);
              }
            } catch (error) {
              console.error(`Error saving adjustment:`, error);
              throw error;
            }
          }
        }
      }
      
      // Process summary adjustments
      if (summary && summary.length > 0) {
        for (const summaryItem of summary) {
          if (summaryItem.adjustmentValues && summaryItem.adjustmentValues.length > 0) {
            for (const adjustmentValue of summaryItem.adjustmentValues) {

              // Parse the adjustment value
              const isPercent = adjustmentValue.includes('%');
              const isNegative = adjustmentValue.startsWith('-');
              const numericValue = parseFloat(adjustmentValue.replace(/[+$%-]/g, ""));
              
              if (isNaN(numericValue)) continue;
              
              const adjustmentType = isPercent ? 'rate_percent' : 'rate_flat';
              const adjustmentNumericValue = isNegative ? -numericValue : numericValue;
              
              const adjustmentData = {
                user_id: summaryItem.userId,
                booking_id: null, // Summary adjustments don't have booking_id
                invoice_id: id,
                datetime: new Date().toISOString(),
                comment: "",
                adjustment_type: adjustmentType,
                adjustment_value: adjustmentNumericValue,
              };
              
              try {
                // Check if this summary adjustment already exists
                const existingAdjustment = comments.find(c => 
                  c.bookingId === null && 
                  c.adjustmentType == adjustmentData.adjustment_type &&
                  c.adjustmentValue == adjustmentData.adjustment_value
                );
                
                if (existingAdjustment) {
                  // Update existing adjustment
                  // console.log("existingSummaryAdjustment", existingAdjustment);
                  const existingAdjustmentResponse = await backend.put(`/comments/${existingAdjustment.id}`, adjustmentData);
                  console.log("existingAdjustmentResponse", existingAdjustmentResponse);
                } else {
                  // Create new adjustment
                  // console.log("newSummaryAdjustment", adjustmentData);
                  const newAdjustmentResponse = await backend.post(`/comments`, adjustmentData);
                  console.log("newAdjustmentResponse", newAdjustmentResponse);
                }
              } catch (error) {
                console.error(`Error saving summary adjustment:`, error);
                throw error;
              }
            }
          }
        }
      }

      // Navigate to the saved edits page
      // navigate(`/invoices/savededits/${id}`);
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
              invoice={invoice?.data}
              subtotal={editedSubtotal}
              setSubtotal={setEditedSubtotal}
              sessions={sessions}
              setSessions={setSessions}
            />
            <InvoiceSummary
              pastDue={pastDue}
              subtotal={subtotal}
              setSubtotal={setSubtotalValue}
              comments={editedComments}
              onCommentsChange={handleCommentUpdate}
              onSubtotalChange={handleSubtotalUpdate}
              room={room}
              setRoom={setRoom}
              sessions={sessions}
              setSessions={setSessions}
              summary={summary}
              setSummary={setSummary}
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
