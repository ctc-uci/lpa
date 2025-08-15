import React, { useEffect, useState } from "react";

import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
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
import { LeftIcon } from "../../assets/LeftIcon";
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
import { getCurrentUser } from "../../utils/auth/firebase";
import { useSessionStore } from "../../stores/useSessionStore";
import { useInvoiceSessions } from "../../contexts/hooks/useInvoiceSessions";
import { useDeletedIdsStore } from "../../stores/useDeletedIdsStore";
import { useSummaryStore } from "../../stores/useSummaryStore";

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

  const getGeneratedDate = (
    comments = [],
    invoice = null,
    includeDay = true
  ) => {
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
      const invoiceDateSplit = invoice[0]?.startDate?.split("T")[0];
      const invoiceDate = new Date(invoiceDateSplit);
      invoiceDate.setMinutes(
        invoiceDate.getMinutes() + invoiceDate.getTimezoneOffset()
      );
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
        <Text fontWeight="700">{`${programName.trim().split(" ").slice(0, 3).join(" ")}_${getGeneratedDate([], invoice.data, false)}_Classroom Rental Summary`}</Text>
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
            pdf_title={`${programName.trim().split(" ").slice(0, 3).join(" ")}, ${getGeneratedDate([], invoice.data, false)} Invoice`}
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
  const { deletedIds, setDeletedIds, addDeletedId } = useDeletedIdsStore();
  const [userId, setUserId] = useState(null);
  const [editedFields, setEditedFields] = useState({
    comments: [],
    subtotal: 0,
    pastDue: 0,
  });

  const [subtotalValue, setSubtotalValue] = useState(0);

  const { sessions, setSessions } = useSessionStore();
  const { summary, setSummary } = useSummaryStore();

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const cancelRef = React.useRef();



  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentInvoiceResponse = await backend.get("/invoices/" + id);
        setInvoice(currentInvoiceResponse);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    const fetchUserId = async () => {
      const currentFirebaseUser = await getCurrentUser();
      const firebaseUid = currentFirebaseUser?.uid;
      if (!firebaseUid) return;
      const userRes = await backend.get(`/users/${firebaseUid}`);
      setUserId(userRes.data[0].id);
    };
    fetchData();
    fetchUserId();
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
          setSessions([]);
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

        const summaryResponse = await backend.get(
          `comments/invoice/summary/${id}`
        );
        if (summaryResponse.data && summaryResponse.data.length === 0) {
          setSummary([{
            adjustmentValues: [],
            comments: [],
            datetime: new Date().toISOString(),
            invoiceId: 0
          }]);
        } else {
          setSummary(summaryResponse.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [invoice]);

  // Fetch sessions via hook into the store
  useInvoiceSessions(id);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        // Check if invoice and invoice.data exist and have elements
        if (
          !invoice ||
          !invoice.data ||
          !Array.isArray(invoice.data) ||
          invoice.data.length === 0
        ) {
          return;
        }

        // Gets all bookings within the invoice start and end date
        const bookingResponse = await backend.get(`/bookings`, {
          params: {
            start: invoice.data[0].startDate,
            end: invoice.data[0].endDate,
          },
        });

        // Filter for only the bookings that match the event id
        const bookingsWithinDate = bookingResponse.data;
        const bookingsWithEventId = bookingsWithinDate.filter(
          (booking) => booking.eventId === invoice.data[0].eventId
        );

        setBookingDetails(bookingsWithEventId);

        // Now fetch rooms for all those bookings
        if (bookingsWithEventId.length > 0) {
          const roomPromises = bookingsWithEventId.map((booking) =>
            backend.get(`/rooms/${booking.roomId}`)
          );

          // Wait for all the room requests to complete in parallel:
          const roomResponses = await Promise.all(roomPromises);

          // Extract just the room data from the responses:
          const roomsArray = roomResponses
            .map((response) =>
              response.data && response.data.length > 0
                ? response.data[0]
                : null
            )
            .filter(Boolean); // Filter out any null values

          setRoom(roomsArray);
        }
      } catch (error) {
        console.error("Error fetching booking details:", error);
      }
    };

    fetchBookingDetails();
  }, [invoice, backend]);

  const handleBack = () => {
    setIsAlertOpen(true);
  };

  const handleCancelBack = () => {
    setIsAlertOpen(false);
  };

  const handleSaveAndBack = async () => {
    setIsAlertOpen(false);
    await handleSave();
  };

  // TODO: fix bug where it deletes comments twice
  const deleteCommentIds = async () => {
    if (deletedIds && deletedIds.length > 0) {
      const deletionPromises = deletedIds.map( async (id) =>
        backend.delete(`/comments/${id}`).catch((error) => {
          console.error(`Error deleting comment with ID ${id}:`, error);
          return null;
        })
      );
      await Promise.all(deletionPromises);
      setDeletedIds([]);
    }
  };

  const postComments = async (id, bookingId, comment, datetime, invoiceId) => {
    const commentData = {
      id: id,
      user_id: userId,
      booking_id: bookingId,
      invoice_id: invoiceId,
      datetime: datetime,
      comment: comment,
      adjustment_type: "none",
      adjustment_value: 0,
    };

    try {
      const existingComment = comments.find((c) => c.id === commentData.id);
      if (existingComment) {
        // console.log("existingComment updated", existingComment);
        await backend.put(
            `/comments/${existingComment.id}`,
            commentData
          );
      } else {
        // console.log("newComment created", commentData);
        await backend.post(`/comments`, commentData);
      }
    } catch (error) {
      console.error(`Error posting comment:`, error);
      throw error;
    }
  };

  const postAdjustments = async (id, userId, bookingId, invoiceId, datetime, comment, type, value) => {
    const adjustmentData = {
      id: id,
      user_id: userId,
      booking_id: bookingId,
      invoice_id: invoiceId,
      datetime: datetime,
      comment: comment,
      adjustment_type: type,
      adjustment_value: value,
    };

    try {
      const existingAdjustment = comments.find((c) => c.id === adjustmentData.id);
      if (existingAdjustment) {
        await backend.put(`/comments/${existingAdjustment.id}`, adjustmentData);
        // console.log("existingAdjustment updated", existingAdjustment);
      } else {
        await backend.post(`/comments`, adjustmentData);
        // console.log("newAdjustment created", adjustmentData);
      }
    } catch (error) {
      console.error(`Error posting adjustment:`, error);
      throw error;
    }
  }

  const postTotal = async (id, userId, bookingId, invoiceId, datetime, comment, value) => {
    try {
      const totalData = {
        id: id,
        user_id: userId,
        booking_id: bookingId,
        invoice_id: invoiceId,
        datetime: datetime,
        comment: comment,
        adjustment_type: "total",
        adjustment_value: value,
      };

      const existingTotal = comments.find((c) => c.id === id);
      if (existingTotal) {
        // Update existing total
        await backend.put(`/comments/${id}`, totalData);
        // console.log("existing totalData updated", totalData);
      } else {
        // Create new total
        await backend.post(`/comments`, totalData);
        // console.log("new totalData created", totalData);
      }
    } catch (error) {
      console.error(`Error posting total:`, error);
      throw error;
    }
  }


  const postSummaryAdjustments = async (id, userId, invoiceId, datetime, type, value) => {
    const summaryData = {
      id: id,
      user_id: userId,
      booking_id: null,
      invoice_id: invoiceId,
      datetime: datetime,
      comment: "",
      adjustment_type: type,
      adjustment_value: value,
    };

    try {
      const existingSummary = comments.find((c) => c.id === summaryData.id);
      if (existingSummary) {
        // console.log("existingSummary updated", existingSummary);
        await backend.put(`/comments/${existingSummary.id}`, summaryData);
      } else {
        // console.log("newSummary created", summaryData);
        await backend.post(`/comments`, summaryData);
      }
    } catch (error) {
      console.error(`Error posting summary adjustment:`, error);
      throw error;
    }
  }
  

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await deleteCommentIds();

      for (const session of sessions) {
        if (
          session.comments &&
          session.comments.length > 0 &&
          session.adjustmentValues[0]?.type !== "total"
        ) {
          for (const comment of session.comments) {
            postComments(comment.id, session.bookingId, comment.comment, session.datetime, id);
          }
        }

        if (
          session.adjustmentValues &&
          session.adjustmentValues.length > 0 &&
          session.adjustmentValues[0]?.type !== "none"
        ) {
          for (const adjustmentValue of session.adjustmentValues) {
            // Skip invalid adjustment values
            if (
              isNaN(adjustmentValue.value) ||
              adjustmentValue.value === undefined ||
              Object.is(adjustmentValue.value, -0) ||
              adjustmentValue.value === 0
            )
              continue;

            const adjComment = session?.comments &&
                session?.comments.length > 0 &&
                session.adjustmentValues[0]?.type === "total"
                  ? session?.comments[0]?.comment
                  : "";

            postAdjustments(adjustmentValue.id, userId, session.bookingId || null, 
              id, 
              session.datetime, 
              adjComment, 
              adjustmentValue.type, 
              adjustmentValue.value
            );

          }
        }

        if (sessions && sessions.length > 0) {
          if (session.total && session.total.length > 0) {
            for (const totalItem of session.total) {
              // console.log("totalItem", totalItem);
              postTotal(totalItem.id, userId, session.bookingId, id, totalItem.date, totalItem.comment, totalItem.value);
            }
          }
        }

        // Process summary adjustments
        if (summary && summary.length > 0) {
          for (const summaryItem of summary) {
            if (
              summaryItem.adjustmentValues &&
              summaryItem.adjustmentValues.length > 0
            ) {
              for (const adjustmentValue of summaryItem.adjustmentValues) {
                // Skip invalid adjustment values
                if (
                  isNaN(adjustmentValue.value) ||
                  adjustmentValue.value === undefined
                )
                  continue;
                postSummaryAdjustments(adjustmentValue.id, userId, id, new Date().toISOString(), adjustmentValue.type, adjustmentValue.value);
              }
            }
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

        {/* Alert Dialog */}
        <AlertDialog
          isOpen={isAlertOpen}
          leastDestructiveRef={cancelRef}
          onClose={handleCancelBack}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader
                fontSize="lg"
                fontWeight="bold"
              >
                Saved edits to invoice?
              </AlertDialogHeader>

              <AlertDialogBody>
                Changes made to this invoice will be saved. Please email
                Payer(s) and Lead Artist(s) this updated PDF.
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button
                  ref={cancelRef}
                  onClick={handleCancelBack}
                  ml={3}
                >
                  Cancel
                </Button>
                <Button
                  bg="#4441C8"
                  color="white"
                  onClick={handleSaveAndBack}
                  ml={3}
                >
                  Save
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>

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
              summary={summary}
            />
            <InvoiceSummary
              pastDue={pastDue}
              subtotal={editedSubtotal}
              setSubtotal={setEditedSubtotal}
              comments={editedComments}
              onCommentsChange={handleCommentUpdate}
              onSubtotalChange={handleSubtotalUpdate}
              room={room}
              setRoom={setRoom}
              sessions={sessions}
              setSessions={setSessions}
              summary={summary}
              setSummary={setSummary}
              deletedIds={deletedIds}
              setDeletedIds={setDeletedIds}
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
