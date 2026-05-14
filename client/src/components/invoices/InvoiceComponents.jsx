import {
  CalendarIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DeleteIcon,
} from "@chakra-ui/icons";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Divider,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  IconButton,
  Image,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  Spacer,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";

import { format } from "date-fns";
import { EllipsisIcon } from "lucide-react";
import { FaCircle, FaUser } from "react-icons/fa";
import { FiMoreHorizontal } from "react-icons/fi";
import { useParams } from "react-router";
import { useLocation, useNavigate } from "react-router-dom";

import { CancelIcon } from "../../assets/CancelIcon";
import { ClockFilled } from "../../assets/ClockFilled";
import { CloseFilledIcon } from "../../assets/CloseFilledIcon";
import { CustomOption } from "../../assets/CustomOption";
import { DarkPlusIcon } from "../../assets/DarkPlusIcon";
import { DollarIcon } from "../../assets/DollarIcon";
import { DownloadInvoiceIcon } from "../../assets/DownloadInvoiceIcon";
import editBlackIcon from "../../assets/editBlackIcon";
import { EditIcon } from "../../assets/EditIcon";
import filterIcon from "../../assets/filter.svg";
import {
  archiveCalendar,
  sessionsEllipsis,
} from "../../assets/icons/ProgramIcons";
import personIcon from "../../assets/person.svg";
import { useAuthContext } from "../../contexts/hooks/useAuthContext";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { ProgramEmailIcon } from "../../assets/ProgramEmailIcon";
import { ProgramsCalendarIcon } from "../../assets/ProgramsCalendarIcon";
import redCancelIcon from "../../assets/redCancelIcon";
import { DeleteIconRed } from "../../assets/DeleteIconRed";
import { SessionsBookmark } from "../../assets/SessionsBookmark";
import { ArchivedDropdown } from "../archivedDropdown/ArchivedDropdown";
import { CancelProgram } from "../cancelModal/CancelProgramComponent";
import { EditOnlyPopup } from "../cancelModal/EditOnlyPopup";
import { PaginationComponent } from "../PaginationComponent";
import DateSortingModal from "../sorting/DateFilter";
import ProgramSortingModal from "../sorting/ProgramFilter";
import StatusSortingModal from "../sorting/StatusFilter";
import { PDFButtonInvoice } from "./PDFButtonInvoice";
import { getAllDue } from "../../utils/pastDueCalc";
import { parseSessionDate, formatSessionDateShort, formatSessionDateWithWeekday } from "../programs/utils";

const InvoiceTitle = ({
  title,
  isSent,
  paymentStatus,
  endDate,
  /**
   * When set (single-invoice page), same figure as stats "Remaining Balance":
   * amount still owed for this period plus all prior invoices for the program.
   * If <= 0, badge shows Paid even when this row's payment_status is not full
   * (e.g. earlier invoice overpaid).
   */
  amountOwedThroughThisPeriod,
  onMarkAsSent,
  onMarkAsNotSent,
}) => {
  const [sentStatusLoading, setSentStatusLoading] = useState(false);

  const isPaid = () => {
    if (paymentStatus === "full") {
      return "Paid";
    }
    if (
      typeof amountOwedThroughThisPeriod === "number" &&
      amountOwedThroughThisPeriod <= 0
    ) {
      return "Paid";
    }
    if (!isSent && new Date() < new Date(endDate) && paymentStatus !== "full") {
      return "Not Paid";
    }
    return "Past Due";
  };

  const canToggleSent =
    (!isSent && Boolean(onMarkAsSent)) ||
    (isSent && Boolean(onMarkAsNotSent));

  const handleSentStatusClick = () => {
    if (!canToggleSent || sentStatusLoading) return;
    if (!isSent && onMarkAsSent) {
      setSentStatusLoading(true);
      void onMarkAsSent()
        .catch(() => undefined)
        .finally(() => setSentStatusLoading(false));
    } else if (isSent && onMarkAsNotSent) {
      setSentStatusLoading(true);
      void onMarkAsNotSent()
        .catch(() => undefined)
        .finally(() => setSentStatusLoading(false));
    }
  };

  return (
    <Flex
      direction="row"
      width="100%"
      alignItems="center"
      gap={5}
    >
      <Text
        fontSize="clamp(1rem, 1.5rem, 2rem)"
        color="#474849"
        fontWeight="bold"
        marginRight="0.5rem"
      >
        {title && title.length > 40 ? title.substring(0, 40) + "..." : title}
      </Text>

      <Flex gap={2}>
        <Button
          fontSize={"15px"}
          fontWeight={"500"}
          fontFamily={"Inter"}
          height={"20px"}
          padding={"15px 8px"}
          gap={"6px"}
          backgroundColor={isSent ? "#F0FFF4" : "#FFF5F5"}
          color={isSent ? "#38A169" : "#E53E3E"}
          variant="solid"
          _hover={{ bg: isSent ? "#F0FFF4" : "#FFF5F5" }}
          cursor={canToggleSent ? "pointer" : "default"}
          isLoading={sentStatusLoading}
          onClick={canToggleSent ? handleSentStatusClick : undefined}
          aria-label={
            canToggleSent
              ? isSent
                ? "Mark invoice as email not sent"
                : "Mark invoice as email sent"
              : isSent
                ? "Invoice email marked sent"
                : "Invoice email not sent"
          }
        >
          {isSent ? "Email Sent" : "Email Not Sent"}
        </Button>

        <Button
          fontSize={"15px"}
          fontWeight={"500"}
          fontFamily={"Inter"}
          height={"20px"}
          padding={"15px 8px"}
          gap={"6px"}
          backgroundColor={isPaid() === "Paid" ? "#F0FFF4" : "#FFF5F5"}
          color={isPaid() === "Paid" ? "#38A169" : "#E53E3E"}
          variant="solid"
          cursor="default"
          _hover={{ bg: isPaid() === "Paid" ? "#F0FFF4" : "#FFF5F5" }}
        >
          {isPaid() === "Paid"
            ? "Paid"
            : isPaid() === "Not Paid"
              ? "Not Paid"
              : "Past Due"}
        </Button>
      </Flex>
    </Flex>
  );
};

const InvoiceStats = ({
  roomRate,
  billingPeriod,
  amountDue,
  remainingBalance,
}) => {
  const { backend } = useBackendContext();
  const { id } = useParams();
  const toast = useToast();
  const navigate = useNavigate();
  const formatDate = (isoDate) => {
    const date = parseSessionDate(isoDate);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const [isLoadingPrevious, setIsLoadingPrevious] = useState(false);
  const [isLoadingFollowing, setIsLoadingFollowing] = useState(false);
  const [isLoadingCurrent, setIsLoadingCurrent] = useState(false);
  const [hasNewerInvoice, setHasNewerInvoice] = useState(false);
  const [hasPreviousInvoice, setHasPreviousInvoice] = useState(false);
  const [showCurrentMonthInvoiceNav, setShowCurrentMonthInvoiceNav] =
    useState(false);

  const fetchInvoiceNavigationFlags = useCallback(async () => {
    const [followingRes, invRes, currentMonthRes] = await Promise.all([
      backend.get(`/invoices/followingInvoices/${id}`),
      backend.get(`/invoices/${id}`),
      backend.get(`/invoices/currentMonthInvoiceForEvent/${id}`),
    ]);
    const hasFollowing =
      Array.isArray(followingRes.data) && followingRes.data.length > 0;
    const eventId = invRes.data?.[0]?.eventId;
    let hasPrevious = false;
    if (eventId) {
      const previousRes = await backend.get(
        `/invoices/previousInvoices/${id}?event_id=${eventId}`
      );
      hasPrevious =
        Array.isArray(previousRes.data) && previousRes.data.length > 0;
    }
    const currentMonthInvoice = currentMonthRes.data?.[0];
    const showCurrentMonth =
      currentMonthInvoice != null &&
      String(currentMonthInvoice.id) !== String(id);
    return { hasFollowing, hasPrevious, showCurrentMonth };
  }, [backend, id]);

  useEffect(() => {
    let cancelled = false;

    fetchInvoiceNavigationFlags()
      .then(({ hasFollowing, hasPrevious, showCurrentMonth }) => {
        if (cancelled) {
          return;
        }
        setHasNewerInvoice(hasFollowing);
        setHasPreviousInvoice(hasPrevious);
        setShowCurrentMonthInvoiceNav(showCurrentMonth);
      })
      .catch(() => {
        if (!cancelled) {
          setHasNewerInvoice(false);
          setHasPreviousInvoice(false);
          setShowCurrentMonthInvoiceNav(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [fetchInvoiceNavigationFlags]);

  const navigateToPreviousInvoice = async () => {
    setIsLoadingPrevious(true);
    try {
      const currentInvoiceResponse = await backend.get(`/invoices/${id}`);
      const eventId = currentInvoiceResponse.data[0].eventId;
      const previousInvoices = await backend.get(`/invoices/previousInvoices/${id}?event_id=${eventId}`);
      if (previousInvoices.data.length === 0) {
        toast({
          title: "No previous invoices",
          description: "There are no previous invoices for this event",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom-right",
        });
        return;
      }
      const previousInvoiceId = previousInvoices.data[previousInvoices.data.length - 1].id;
      navigate(`/invoices/${previousInvoiceId}`);
    } finally {
      setIsLoadingPrevious(false);
    }
  };

  const navigateToFollowingInvoice = async () => {
    setIsLoadingFollowing(true);
    try {
      const followingInvoices = await backend.get(
        `/invoices/followingInvoices/${id}`
      );
      if (followingInvoices.data.length === 0) {
        toast({
          title: "No following invoices",
          description: "There is no newer invoice for this event after this period",
          status: "info",
          duration: 5000,
          isClosable: true,
          position: "bottom-right",
        });
        return;
      }
      const nextInvoiceId = followingInvoices.data[0].id;
      navigate(`/invoices/${nextInvoiceId}`);
    } finally {
      setIsLoadingFollowing(false);
    }
  };

  const navigateToCurrentMonthInvoice = async () => {
    setIsLoadingCurrent(true);
    try {
      const res = await backend.get(
        `/invoices/currentMonthInvoiceForEvent/${id}`
      );
      if (!res.data?.length) {
        toast({
          title: "No invoice for this month",
          description:
            "This program has no invoice whose billing period includes the current calendar month.",
          status: "info",
          duration: 5000,
          isClosable: true,
          position: "bottom-right",
        });
        return;
      }
      const targetId = res.data[0].id;
      if (String(targetId) === String(id)) {
        return;
      }
      navigate(`/invoices/${targetId}`);
    } finally {
      setIsLoadingCurrent(false);
    }
  };

  return (
    <Flex
      direction="column"
      h="auto"
      w="100%"
      gap={5}
    >
      {/* Invoice Details Section */}
      <Grid
        templateColumns="1fr 2fr"
        gap="16px 17px"
        alignItems="start"
      >
        {/* billing period */}
        <Box h={7}>
          <Text
            fontWeight="700"
            fontSize="14px"
            color="#474849"
          >
            Billing Period
          </Text>
        </Box>
        <Box>
          <Flex
            direction="row"
            alignItems="center"
            flexWrap="wrap"
            columnGap={3}
            rowGap={2}
          >
            {billingPeriod && billingPeriod["startDate"] ? (
              <Text
                color="#474849"
                fontSize="14px"
                fontWeight="500"
                flexShrink={0}
              >
                {formatDate(billingPeriod["startDate"])} -{" "}
                {formatDate(billingPeriod["endDate"])}
              </Text>
            ) : (
              <Text
                color="#474849"
                fontSize="14px"
                fontWeight="500"
                flexShrink={0}
              >
                N/A - N/A
              </Text>
            )}
            {(hasPreviousInvoice ||
              hasNewerInvoice ||
              showCurrentMonthInvoiceNav) ? (
              <Flex
                gap={2}
                alignItems="center"
                flexWrap="wrap"
                flexShrink={0}
              >
                {hasPreviousInvoice ? (
                  <IconButton
                    aria-label="Open the previous billing period’s invoice for this program"
                    title="Same program: go to an older billing period’s invoice"
                    icon={<ChevronLeftIcon boxSize={4} />}
                    size="sm"
                    height="28px"
                    minW="28px"
                    backgroundColor="#EDF2F7"
                    color="#474849"
                    _hover={{ backgroundColor: "#E2E8F0" }}
                    onClick={navigateToPreviousInvoice}
                    isLoading={isLoadingPrevious}
                  />
                ) : null}
                {hasNewerInvoice ? (
                  <IconButton
                    aria-label="Open the next billing period’s invoice for this program"
                    title="Same program: go to a newer billing period’s invoice"
                    icon={<ChevronRightIcon boxSize={4} />}
                    size="sm"
                    height="28px"
                    minW="28px"
                    backgroundColor="#EDF2F7"
                    color="#474849"
                    _hover={{ backgroundColor: "#E2E8F0" }}
                    onClick={navigateToFollowingInvoice}
                    isLoading={isLoadingFollowing}
                  />
                ) : null}
                {showCurrentMonthInvoiceNav ? (
                  <IconButton
                    aria-label="Open this program’s invoice for the current calendar month"
                    title="Jump to the invoice whose billing period includes this month"
                    icon={<CalendarIcon boxSize={4} />}
                    size="sm"
                    height="28px"
                    minW="28px"
                    backgroundColor="#EDF2F7"
                    color="#474849"
                    _hover={{ backgroundColor: "#E2E8F0" }}
                    onClick={navigateToCurrentMonthInvoice}
                    isLoading={isLoadingCurrent}
                  />
                ) : null}
              </Flex>
            ) : null}
          </Flex>
        </Box>
        <Box h={7}>
          <Text
            fontWeight="700"
            fontSize="14px"
            color="#474849"
          >
            Amount Past Due
          </Text>
        </Box>
        <Box h={7}>
          <Text
            color="#474849"
            fontSize="14px"
            fontWeight="500"
          >
            {amountDue ? `$${Number(amountDue).toFixed(2)}` : "$0.00"}
          </Text>
        </Box>

        {/* remaining balance */}
        <Box h={7}>
          <Text
            fontWeight="bold"
            fontSize="14px"
            color="#474849"
          >
            Remaining Balance
          </Text>
        </Box>

        <Box h={7}>
          <Text
            color="#474849"
            fontSize="14px"
            fontWeight="500"
          >
            ${Number(remainingBalance).toFixed(2)}
          </Text>
        </Box>

      </Grid>

      {/* room rate section */}
      {/* <Flex
        gap={3}
        alignItems="center"
      >
        <DollarIcon />
        <Text
          fontSize="16px"
          fontWeight="400"
        >
          {roomRate ? `${Number(roomRate).toFixed(2)} / hour` : "N/A"}
        </Text>
      </Flex> */}
    </Flex>
  );
};

const InvoicePayments = forwardRef(
  (
    {
      comments,
      setComments,
      hasUnsavedChanges,
      setHasUnsavedChanges,
      setRemainingBalance,
      /** When set, called after paid comments change to refresh past-due + remaining (single-invoice page). */
      onBalancesRefresh,
      amountDue,
      handleOtherButtonClick,
      onPaymentStatusChange,
    },
    ref
  ) => {
    const { id } = useParams();
    const { backend } = useBackendContext();
    const [commentsPerPage, setCommentsPerPage] = useState(3);
    const [currentPageNumber, setCurrentPageNumber] = useState(1);
    const [adjustValue, setAdjustValue] = useState("--.--");
    const [showInputRow, setShowInputRow] = useState(false);
    const [showEditRow, setShowEditRow] = useState(false);
    const [valueEntered, setValueEntered] = useState(false);
    const [rowValues, setRowValues] = useState({});
    const [rowDates, setRowDates] = useState({});
    const {
      isOpen: isOpen,
      onOpen: onOpen,
      onClose: onClose,
    } = useDisclosure();

    const {
      isOpen: isCanceNewCommentOpen,
      onOpen: onCancelNewCommentOpen,
      onClose: onCancelNewCommentClose,
    } = useDisclosure();

    const [selectedComment, setSelectedComment] = useState(null);
    const [deleteID, setDeleteID] = useState(null);


    const { currentUser } = useAuthContext();
    const [uid, setUid] = useState(null);
    const [programName, setProgramName] = useState("");
    const [invoiceMonth, setInvoiceMonth] = useState("");
    const [invoiceYear, setInvoiceYear] = useState("");
    const [editDate, setEditDate] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const toast = useToast();

    comments = comments.filter(comment => comment.adjustmentType === "paid");

    useEffect(() => {
      const fetchUid = async () => {
        try {
          const uidResponse = await backend.get(
            "/users/email/" + currentUser.email
          );
          setUid(uidResponse.data?.id || null);
        } catch (err) {
          console.error("Error fetching UID:", err);
        }
      };
      fetchUid();
    }, [backend, currentUser]);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const currentInvoiceResponse = await backend.get(`/invoices/${id}`);
          const currentInvoice = currentInvoiceResponse.data[0];
          const date = new Date(currentInvoice.startDate);
          setInvoiceMonth(date.toLocaleString("default", { month: "long" }));
          setInvoiceYear(date.getFullYear());
          const programNameResponse = await backend.get(
            "/events/" + currentInvoice.eventId
          );
          setProgramName(
            programNameResponse.data[0].name.split(" ").slice(0, 3).join(" ")
          );
        } catch (err) {
          console.error("Error fetching bookings:", err);
        }
      };
      fetchData();
    }, [backend, id]);

    useImperativeHandle(ref, () => ({
      handleSaveComment: handleSaveComment,
    }));

    const handleCancelNewComment = () => {
      setIsProcessing(false);
      setShowInputRow(false);
      setAdjustValue("--.--");
      setValueEntered(false);
      setHasUnsavedChanges(false);
      onCancelNewCommentClose();
      setIsProcessing(false);
    };

  const currentPageComments = comments ?? [];

  const updateRemainingBalance = async () => {
    if (onBalancesRefresh) {
      const [commentsResponse] = await Promise.all([
        backend.get("/comments/paidInvoices/" + id),
        onBalancesRefresh(),
      ]);
      setComments(commentsResponse.data);
      return;
    }

    const commentsResponse = await backend.get(
      "/comments/paidInvoices/" + id
    );
    setComments(commentsResponse.data);

    const paidTotal = await getAllDue(backend, id);
    setRemainingBalance(paidTotal);

    const invoiceRes = await backend.get(`/invoices/${id}`);
    const newStatus = invoiceRes.data?.[0]?.paymentStatus ?? "none";
    if (onPaymentStatusChange) onPaymentStatusChange(newStatus);
  }

  const handleDeleteComment = async () => {
    setIsProcessing(true);
    try {
      await backend.delete("/comments/" + deleteID);
      const commentsResponse = await backend.get(
        "/comments/paidInvoices/" + id
      );
      setComments(commentsResponse.data);
      setShowEditRow(false);
      setShowInputRow(false);
      setHasUnsavedChanges(false);
      setAdjustValue("--.--");
      setRowValues({});
      setRowDates({});
      setValueEntered(false);
      onClose();

      await updateRemainingBalance();
    } catch (error) {
      console.error("Error deleting:", error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleShowDelete = (comment) => {
    try {
      setSelectedComment(comment);
      setDeleteID(comment.id);
      onOpen();
    } catch (error) {
      console.error("Error showing modal:", error);
    }
  };

  const handleEditComment = () => {
    const doEdit = () => {
      const initialRowValues = {};
      const initialRowDates = {};
      comments.forEach((comment) => {
        initialRowValues[comment.id] = comment.adjustmentValue
          ? Number(comment.adjustmentValue).toFixed(2)
          : "";
        initialRowDates[comment.id] = comment.datetime;
      });
      setRowValues(initialRowValues);
      setRowDates(initialRowDates);
      setShowEditRow(true);
      setValueEntered(true);
      setHasUnsavedChanges(true);
    };
    try {
      if (hasUnsavedChanges) {
        handleButtonWhileUnsaved(doEdit);
      } else {
        doEdit();
      }
    } catch (error) {
      console.error("Error editing:", error);
    }
  };

    const handleSaveComment = async () => {
      if (!uid) return;
      setIsProcessing(true);

      try {
        if (showEditRow) {
          await Promise.all(
            Object.entries(rowValues).map(async ([commentId, value]) => {
              const numId = parseInt(commentId);
              const originalComment = comments.find((c) => c.id === numId);
              if (!originalComment) return;
              const newValue = parseFloat(value);
              if (isNaN(newValue)) return;
              const dateObj = new Date(rowDates[commentId] || originalComment.datetime);
              dateObj.setMinutes(dateObj.getMinutes() + dateObj.getTimezoneOffset());
              await backend.put("/comments/" + commentId, {
                user_id: uid,
                invoice_id: id,
                booking_id: null,
                datetime: dateObj.toISOString(),
                comment: "",
                adjustment_type: "paid",
                adjustment_value: newValue,
              });
            })
          );
          toast({
            position: "bottom-right",
            duration: 3000,
            status: "success",
            render: () => (
              <HStack
                bg="green.100"
                p={4}
                borderRadius="md"
                boxShadow="md"
                borderLeft="6px solid"
                borderColor="green.500"
                spacing={3}
                align="center"
              >
                <Icon
                  as={CheckCircleIcon}
                  color="green.600"
                  boxSize={5}
                />
                <VStack
                  align="left"
                  spacing={0}
                >
                  <Text
                    color="#2D3748"
                    fontFamily="Inter"
                    fontSize="16px"
                    fontStyle="normal"
                    fontWeight={700}
                    lineHeight="normal"
                    letterSpacing="0.08px"
                  >
                    Payment Saved
                  </Text>
                  {invoiceMonth && invoiceYear && (
                    <Text fontSize="sm">
                      {programName}_{invoiceMonth} {invoiceYear}
                    </Text>
                  )}
                </VStack>
              </HStack>
            ),
          });
        } else {
          const editDateObj = new Date(editDate);
          editDateObj.setMinutes(editDateObj.getMinutes() + editDateObj.getTimezoneOffset());
          const adjustmentValue = parseFloat(adjustValue);
          await backend.post("/comments/", {
            user_id: uid,
            invoice_id: id,
            booking_id: null,
            datetime: editDateObj.toISOString(),
            comment: "",
            adjustment_type: "paid",
            adjustment_value: Number(adjustmentValue),
          });
          toast({
            position: "bottom-right",
            duration: 3000,
            status: "success",
            render: () => (
              <HStack
                bg="green.100"
                p={4}
                borderRadius="md"
                boxShadow="md"
                borderLeft="6px solid"
                borderColor="green.500"
                spacing={3}
                align="center"
              >
                <Icon
                  as={CheckCircleIcon}
                  color="green.600"
                  boxSize={5}
                />
                <VStack
                  align="left"
                  spacing={0}
                >
                  <Text
                    color="#2D3748"
                    fontFamily="Inter"
                    fontSize="16px"
                    fontStyle="normal"
                    fontWeight={700}
                    lineHeight="normal"
                    letterSpacing="0.08px"
                  >
                    New Payment Added
                  </Text>
                  {invoiceMonth && invoiceYear && (
                    <Text fontSize="sm">
                      {programName}_{invoiceMonth} {invoiceYear}
                    </Text>
                  )}
                </VStack>
              </HStack>
            ),
          });
        }
        const commentsResponse = await backend.get(
          "/comments/paidInvoices/" + id
        );
        setComments(commentsResponse.data);
        setShowEditRow(false);
        setShowInputRow(false);
        setHasUnsavedChanges(false);
        setAdjustValue("--.--");
        setRowValues({});
        setRowDates({});

        await updateRemainingBalance();
      } catch (error) {
        console.error("Error saving:", error);
      } finally {
        setIsProcessing(false);
      }
    };

  const handleAddComment = async () => {
    setShowInputRow(true);
    setHasUnsavedChanges(true);
    // Set today's date in YYYY-MM-DD format for the date input
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setEditDate(formattedDate);
    setAdjustValue("");

  };

    const handleButtonWhileUnsaved = (onContinue) => {
      handleOtherButtonClick(onContinue);
    };

    return (
      <Flex
        direction="column"
        w="100%"
      >
        <Flex
          direction="row"
          width="100%"
          justifyContent="space-between"
          marginBottom="12px"
          marginTop="26px"
        >
          <Text
            fontWeight="700"
            fontSize="16px"
            color="#474849"
            mb={3}
          >
            Payments
          </Text>
          {!showInputRow && !showEditRow ? (
            <Flex gap="8px">
              <Button
                onClick={handleEditComment}
                leftIcon={<Icon as={editBlackIcon} />}
                fontSize={"14px"}
                fontWeight={"700"}
                height={"40px"}
                padding={"0px 16px"}
                isDisabled={!comments || comments.length === 0}
              >
                Edit
              </Button>
              <Button
                onClick={handleAddComment}
                leftIcon={<DarkPlusIcon />}
                fontSize={"14px"}
                fontWeight={"700"}
                height={"40px"}
                padding={"0px 16px"}
              >
                Add
              </Button>
            </Flex>
          ) : (
            <Button
              isLoading={isProcessing}
              onClick={handleSaveComment}
              disabled={!valueEntered}
            >
              Save
            </Button>
          )}
        </Flex>

      <Flex
        borderRadius={15}
        borderWidth=".07em"
        borderColor="#E2E8F0"
        padding="20px"
        mb={3}
      >
        <Table color="#EDF2F7">
          <Tbody
            color="#2D3748"
            width="100%"
          >
            {comments && comments.length > 0 ? (
              [...currentPageComments]
                .filter(comment => comment.adjustmentType === "paid")
                .sort((a, b) => a.id - b.id)
                .map((comment) => (
                  <Tr
                    alignItems="center"
                    alignSelf="stretch"
                    gap="12px"
                    key={comment.id}
                  >
                    <Td
                      fontSize="14px"
                      paddingInlineStart="8px"
                      paddingInlineEnd="8px"
                    >
                        <Text>
                          {format(new Date(comment.datetime), "EEE. M/d/yy")}
                        </Text>
                    </Td>
                    <Td
                      fontSize="14px"
                      color="#0C824D"
                      fontWeight="700"
                      paddingInlineStart="8px"
                      paddingInlineEnd="8px"
                    >
                      {showEditRow ? (
                        <Flex alignItems="center">
                          <Text
                            color="#0C824D"
                            fontWeight="bold"
                          >
                            $
                          </Text>
                          <Input
                            type="text"
                            inputMode="decimal"
                            placeholder="0.00"
                            value={rowValues[comment.id] ?? ""}
                            w="60px"
                            textAlign="left"
                            padding="0px 0px 0px 5px"
                            margin="0px 0px 0px 5px"
                            fontSize="14px"
                            color="#0C824D"
                            fontWeight="400"
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '' || /^-?\d*\.?\d{0,2}$/.test(value)) {
                                setRowValues((prev) => ({ ...prev, [comment.id]: value }));
                                setValueEntered(true);
                              }
                            }}
                            onBlur={(e) => {
                              const num = parseFloat(e.target.value);
                              setRowValues((prev) => ({ ...prev, [comment.id]: isNaN(num) ? '' : num.toFixed(2) }));
                            }}
                          />
                        </Flex>
                      ) : comment.adjustmentValue ? (
                        `$${Number(comment.adjustmentValue).toFixed(2)}`
                      ) : (
                        "N/A"
                      )}
                    </Td>
                    <Td
                      textAlign="right"
                      width="1%"
                      paddingInlineStart="4px"
                      paddingInlineEnd="4px"
                    >
                      <Menu
                       placement="bottom-end"
                      >
                        <MenuButton
                          as={IconButton}
                          className="ellipsis-action-button"
                          icon={<Icon as={EllipsisIcon} />}
                        />
                        <MenuList minWidth={"152px"} maxWidth={"152px"}>
                            <MenuItem
                              onClick={() => handleShowDelete(comment)}
                              width={"149px"}
                              _hover={{ bg: "#E2E8F0" }}
                            >
                              <Box
                                display="flex"
                                alignItems="center"
                                gap="8px"
                              >
                                <DeleteIconRed />
                                <Text color="#90080F">Delete</Text>
                              </Box>
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Td>
                    </Tr>
                  ))
              ) : (
                <Tr>
                  {!showInputRow && (
                    <Td colSpan={3}>No comments available.</Td>
                  )}
                </Tr>
              )}

              {showInputRow && (
                <Tr
                  alignItems="center"
                  alignSelf="stretch"
                  gap="12px"
                >
                  <Td
                    fontSize="14px"
                    paddingInlineStart="3px"
                    paddingInlineEnd="8px"
                  >
                    <Input
                      type="date"
                      fontSize="14px"
                      margin="0px 0px 0px 0px"
                      padding="5px"
                      width="95px"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                    />
                  </Td>
                  <Td
                    fontSize="14px"
                    color="#0C824D"
                    fontWeight="700"
                    paddingInlineStart="8px"
                    paddingInlineEnd="8px"
                  >
                    <Flex alignItems="center">
                      <Text
                        color="#0C824D"
                        fontWeight="bold"
                      >
                        $
                      </Text>
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="0.00"
                        value={adjustValue}
                        w="60px"
                        textAlign="left"
                        padding="0px 0px 0px 5px"
                        margin="0px 0px 0px 5px"
                        fontSize="14px"
                        color="#0C824D"
                        fontWeight="400"
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || /^-?\d*\.?\d{0,2}$/.test(value)) {
                            setAdjustValue(value);
                            setValueEntered(true);
                          }
                        }}
                        onBlur={(e) => {
                          const num = parseFloat(e.target.value);
                          setAdjustValue(isNaN(num) ? '' : num.toFixed(2));
                        }}
                      />
                    </Flex>
                  </Td>
                  <Td
                    textAlign="right"
                    width="1%"
                    paddingInlineStart="4px"
                    paddingInlineEnd="4px"
                  >
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        className="ellipsis-action-button"
                        icon={<Icon as={EllipsisIcon} />}
                      />
                      <MenuList
                        minWidth={"149px"}
                        maxWidth={"149px"}
                      >
                        <MenuItem
                          onClick={() => onCancelNewCommentOpen()}
                          width={"149px"}
                          _hover={{ bg: "#E2E8F0" }}
                        >
                          <Box
                            display="flex"
                            alignItems="center"
                            gap="8px"
                          >
                            <DeleteIconRed />
                            <Text color="#90080F">Delete</Text>
                          </Box>
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              )}

          </Tbody>
        </Table>

        <Modal
          isOpen={isOpen}
          onClose={onClose}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader
              color={"var(--Secondary-7, #4A5568)"}
              fontFamily={"Inter"}
              fontSize={"16px"}
              fontWeight={"700"}
              mt={"10px"}
            >
              Delete Payment for{" "}
              {selectedComment
                ? formatSessionDateShort(selectedComment.datetime)
                : ""}
              ?
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text fontFamily={"Inter"}>
                This payment will be permanently deleted.
              </Text>
            </ModalBody>
            <ModalFooter
              style={{
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button
                variant="ghost"
                onClick={onClose}
                fontFamily={"Inter"}
                backgroundColor={"#EDF2F7"}
                fontSize={"14px"}
                fontWeight={"500"}
              >
                Exit
              </Button>
              <Button
                mr={3}
                ml={"12px"}
                _hover={{ backgroundColor: "#71060C" }}
                isLoading={isProcessing}
                backgroundColor={"#90080F"}
                fontFamily={"Inter"}
                fontSize={"14px"}
                fontWeight={"500"}
                borderRadius={"6px"}
                color={"white"}
                onClick={() => {
                  handleDeleteComment();
                }}
              >
                Confirm
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Modal
          isOpen={isCanceNewCommentOpen}
          onClose={onCancelNewCommentClose}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader
              color={"var(--Secondary-7, #4A5568)"}
              fontFamily={"Inter"}
              fontSize={"16px"}
              fontWeight={"700"}
              mt={"10px"}
            >
              Cancel payment?
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text fontFamily={"Inter"}>
                This payment currently being added will be permanently deleted.
              </Text>
            </ModalBody>
            <ModalFooter
              style={{
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button
                isLoading={isProcessing}
                onClick={() => {
                  handleCancelNewComment();
                }}
              >
                Confirm
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Flex>
      </Flex>
    );
  }
);

function InvoicesTable({ filteredInvoices, isPaidColor, sortKey, sortOrder, onSortChange, onInvoiceDeleted }) {

  const navigate = useNavigate();
  const toast = useToast();
  const { backend } = useBackendContext();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [invoiceToDeleteId, setInvoiceToDeleteId] = useState(null);
  const cancelDeleteRef = React.useRef();

  const handleDeleteClick = useCallback(
    (id, e) => {
      e?.stopPropagation();
      setInvoiceToDeleteId(id);
      onDeleteOpen();
    },
    [onDeleteOpen]
  );

  const handleConfirmDelete = useCallback(
    async () => {
      if (!invoiceToDeleteId || !onInvoiceDeleted) return;
      try {
        await backend.delete(`/invoices/${invoiceToDeleteId}`);
        toast({
          title: "Invoice deleted",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "bottom-right",
        });
        onInvoiceDeleted();
      } catch (err) {
        toast({
          title: "Failed to delete invoice",
          description: err.response?.data?.message || err.message,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom-right",
        });
      } finally {
        setInvoiceToDeleteId(null);
        onDeleteClose();
      }
    },
    [invoiceToDeleteId, onInvoiceDeleted, backend, toast, onDeleteClose]
  );

  const handleRowClick = useCallback(
    (id) => {
      navigate(`/invoices/${id}`);
    },
    [navigate]
  );

  const location = useLocation();
  useEffect(() => {
    if (location.pathname === "/invoices") {
      window.__hasShownToast = false; // 🔁 Reset when user visits invoices page
    }
  }, [location.pathname]);
  
  useEffect(() => {
    if (window.__hasShownToast || filteredInvoices.length === 0) return;
    const pastDueInvoices = filteredInvoices.filter(
      (invoice) => invoice.isPaid === "Past Due"
    );
    const pastDueCount = pastDueInvoices.length;

    if (pastDueCount > 0) {
      const programTitle = pastDueInvoices[0].eventName
        .split(" ")
        .map((word) => word.trim())
        .slice(0, 3)
        .join(" ");
      const date = new Date(pastDueInvoices[0].endDate);
      const month = date.toLocaleString("default", { month: "long" });
      const year = date.getFullYear();
      const description =
        pastDueCount === 1
          ? `${programTitle}_${month} ${year}`
          : `You have ${pastDueCount} past due invoices`;

      const toastId = toast({
        title: pastDueCount === 1 ? "Invoice Past Due" : `${pastDueCount} Invoices Past Due`,
        description: description,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-right",
        render: ({ onClose }) => (
          <Flex
            bg="#FED7D7"
            borderLeft="4px solid #E53E3E"
            borderRadius="6px"
            boxShadow="md"
            p={4}
            align="center"
            justify="space-between"
            w="400px"
          >
            <Flex align="center">
              <Icon
                as={CheckCircleIcon}
                color="#E53E3E"
                boxSize={5}
                mr={3}
              />
              <Box>
                <Heading
                  size="sm"
                  color="gray.800"
                >
                  {pastDueCount === 1 ? "Invoice Past Due" : `${pastDueCount} Invoices Past Due`}
                </Heading>
                <Text
                  fontSize="sm"
                  color="gray.700"
                >
                  {description}
                </Text>
              </Box>
            </Flex>
            <Flex
              align="center"
              gap={4}
            >
              <Button
                size="sm"
                variant="link"
                color="#E53E3E"
                fontWeight="bold"
                onClick={() => {
                  window.__hasShownToast = false;
                  onClose();
                  if (pastDueCount === 1) {
                    navigate(`/invoices/${pastDueInvoices[0].id}`);
                  } else {
                    navigate("/notifications");
                  }
                }}
              >
                View
              </Button>
              <Divider
                orientation="vertical"
                height="30px"
                borderColor="#E53E3E"
              />
              <Button
                size="sm"
                variant="link"
                color="#E53E3E"
                fontWeight="regular"
                onClick={() => {
                  window.__hasShownToast = false;
                  onClose();
                }}
              >
                Close
              </Button>
            </Flex>
          </Flex>
        ),
      });
      window.__hasShownToast = true;
    }
  }, [filteredInvoices, toast, navigate]);
  
  // useEffect(() => {
  //   filteredInvoices.forEach((invoice, index) => {
  //     if (invoice.isPaid === "Past Due") {
  //       const programTitle = invoice.eventName.split(" ").slice(0, 3).join(" ");
  //       const date = new Date(invoice.endDate);
  //       const month = date.toLocaleString("default", { month: "long" });
  //       const year = date.getFullYear();
  //       const description = `${programTitle}, ${month} ${year} Invoice`;
  
  //       setTimeout(() => {
  //         toast({
  //           title: "Invoice Past Due",
  //           description: description,
  //           status: "error",
  //           duration: 1000,
  //           isClosable: true,
  //           position: "bottom-right",
  //         });
  //       }, index * 500);
  //     }
  //   });
  // }, [filteredInvoices, toast]);
  

  const PAGE_SIZE = 20;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef(null);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filteredInvoices]);

  const currentInvoices = filteredInvoices.slice(0, visibleCount);
  const hasMore = visibleCount < filteredInvoices.length;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setVisibleCount((prev) => prev + PAGE_SIZE);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore]);

  const handleEdit = useCallback(
    (id, e) => {
      e.stopPropagation();
      navigate(`/invoices/edit/${id}`);
    },
    [navigate]
  );

  return (
    <>
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelDeleteRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete invoice
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete this invoice? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelDeleteRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleConfirmDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
      <Box
        className="invoices-table__container"
        width="100%"
      >
        <TableContainer padding="0" overflowY="auto" maxHeight="75vh" sx={{ "& thead th": { position: "sticky", top: 0, zIndex: 1, bg: "white" } }}>
          <Table
            className="invoices-table__table"
            width="100%"
            position="relative"
            zIndex={3}
            bg="white"
          >
            <Thead>
              <Tr>
                <Th>
                  <HStack
                    width="100%"
                    justifyContent="space-between"
                    gap="12px"
                    paddingLeft="8px"
                    paddingRight="8px"
                  >
                    <Text>STATUS</Text>
                    <StatusSortingModal onSortChange={onSortChange} />
                  </HStack>
                </Th>
                <Th
                  textAlign="center"
                  paddingLeft="8px"
                  paddingRight="8px"
                >
                  <Text>INVOICE SENT</Text>
                </Th>
                <Th>
                  <HStack
                    width="100%"
                    justifyContent="space-between"
                    gap="12px"
                    paddingLeft="8px"
                    paddingRight="8px"
                  >
                    <Text>PROGRAM</Text>
                    <ProgramSortingModal onSortChange={onSortChange} />
                  </HStack>
                </Th>
                <Th
                  paddingLeft="8px"
                  paddingRight="8px"
                >
                  <Text>PAYER(S)</Text>
                </Th>
                <Th>
                  <HStack
                    width="100%"
                    justifyContent="space-between"
                    gap="12px"
                    paddingLeft="8px"
                    paddingRight="8px"
                  >
                    <Text>DEADLINE</Text>
                    <DateSortingModal onSortChange={onSortChange} />
                  </HStack>
                </Th>
                <Th
                  paddingLeft="8px"
                  paddingRight="8px"
                >
                  <Text>LAST PAYMENT</Text>
                </Th>
                {/* <Th
                  paddingLeft="8px"
                  paddingRight="8px"
                >
                  <Text>DOWNLOADS</Text>
                </Th> */}
                <Th>{/* Blank for edit button dropdown */}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {currentInvoices.map((invoice, index) => {
                const validPayers = Array.isArray(invoice.payers)
                  ? invoice.payers.filter(
                    (payer) => payer && typeof payer === "string"
                  )
                  : [];

                let statusClass = "";
                if (invoice.isPaid === "Paid") {
                  statusClass = "status-paid";
                } else if (invoice.isPaid === "Not Paid") {
                  statusClass = "status-not-paid";
                } else if (invoice.isPaid === "Past Due") {
                  statusClass = "status-past-due";
                }

                return (
                  <Tr
                    key={index}
                    cursor="pointer"
                    sx={{
                      "& td:not(:first-of-type)": {
                        color: "#474849",
                        fontFamily: "Inter",
                        fontSize: "14px",
                        fontStyle: "normal",
                        fontWeight: "400",
                        lineHeight: "normal",
                        letterSpacing: "0.07px",
                      },
                    }}
                  >
                    <Td onClick={() => handleRowClick(invoice.id)} style={{
                        color: isPaidColor(invoice),
                        fontWeight:
                          invoice.isPaid === "Past Due" ? "bold" : "normal",
                      }}>
                      <Box className={statusClass}>{invoice.isPaid}</Box>
                    </Td>
                    <Td
                      onClick={() => handleRowClick(invoice.id)}
                      textAlign="center"
                    >
                      <Flex
                        justifyContent="center"
                        align="center"
                      >
                        {invoice.isSent ? (
                          <Icon
                            as={FaCircle}
                            color="#0C824D"
                            boxSize={4}
                          />
                        ) : (
                          <Icon
                            as={FaCircle}
                            color="#EA4335"
                            boxSize={4}
                          />
                        )}
                      </Flex>
                    </Td>
                    <Td onClick={() => handleRowClick(invoice.id)}>
                      {invoice.eventName.length > 30 
                        ? `${invoice.eventName.substring(0, 30)}...` 
                        : invoice.eventName}
                    </Td>
                    <Td onClick={() => handleRowClick(invoice.id)}>
                      {validPayers.length > 1
                        ? `${validPayers[0].trim()},...`
                        : validPayers.length === 1
                          ? validPayers[0].trim()
                          : "N/A"}
                    </Td>
                    <Td onClick={() => handleRowClick(invoice.id)}>
                      {formatSessionDateWithWeekday(invoice.endDate)}
                    </Td>
                    <Td onClick={() => handleRowClick(invoice.id)}>
                      {invoice.lastPaymentDate ? (
                        `$${Number(invoice.lastPaymentAmount).toFixed(2)} (${format(new Date(invoice.lastPaymentDate), "MM/dd/yy")})`
                      ) : invoice.coveredByPaymentDate ? (
                        <VStack
                          align="flex-start"
                          spacing={0}
                        >
                          <Text
                            fontSize="11px"
                            color="gray.600"
                            fontWeight="500"
                            lineHeight="short"
                          >
                            {invoice.coveredByPaymentSource === "later"
                              ? "Paid on a later billing period"
                              : invoice.coveredByPaymentSource === "earlier"
                                ? "Paid on an earlier billing period"
                                : "Covered from another billing period"}
                          </Text>
                          <Text
                            fontSize="14px"
                            color="#474849"
                          >
                            {format(new Date(invoice.coveredByPaymentDate), "MM/dd/yy")}
                          </Text>
                        </VStack>
                      ) : (
                        "—"
                      )}
                    </Td>
                    {/* <Td>
                      <Flex ml="18px">
                        <PDFButtonInvoice onlyIcon={true} id={invoice.id} />
                      </Flex>
                    </Td> */}
                    <td>
                      <Flex
                        width="100%"
                        justify="center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <EditOnlyPopup
                          handleEdit={handleEdit}
                          onDelete={onInvoiceDeleted ? handleDeleteClick : undefined}
                          id={invoice.id}
                        />
                      </Flex>
                    </td>
                  </Tr>
                );
              })}
              {currentInvoices.length === 0 && (
                <Tr>
                  <Td
                    colSpan={7}
                    textAlign="center"
                    py={4}
                  >
                    No invoices found
                  </Td>
                </Tr>
              )}
              {hasMore ? (
                <Tr ref={sentinelRef}>
                  <Td colSpan={7} textAlign="center" py={4}>
                    <Spinner size="sm" />
                  </Td>
                </Tr>
              ) : (
                <Tr ref={sentinelRef}>
                  <Td colSpan={7} />
                </Tr>
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
    </>
  );
}

function InvoicesFilter({ invoices, filter, setFilter }) {
  return (
    <>
      <Popover placement="bottom-start">
        <PopoverTrigger>
          <Button
            backgroundColor="#EDF2F7"
            borderRadius="6px"
            h="48px"
            px="12px"
            textColor="#2D3748"
          >
            <Image
              src={filterIcon}
              alt="Filter"
              boxSize="20px"
              mr="4px"
            />{" "}
            Filters
          </Button>
        </PopoverTrigger>
        <PopoverContent
          h="auto"
          w="sm"
          borderRadius="15px"
          box-shadow="0px 4px 4px 0px rgba(0, 0, 0, 0.25)"
          border="1px solid #D2D2D2"
          padding="16px"
          display="inline-flex"
          flexDirection="column"
          gap="16px"
        >
          <Flex
            alignItems="center"
            gap="8px"
          >
            <CalendarIcon color="#767778" />
            <Text
              size="sm"
              as="b"
              color="#767778"
            >
              Date Range
            </Text>
          </Flex>
          <Flex
            justifyContent="space-evenly"
            alignItems="center"
          >
            <Input
              type="date"
              w="150px"
              backgroundColor="#F6F6F6"
              value={filter.startDate}
              onChange={(e) =>
                setFilter({ ...filter, startDate: e.target.value })
              }
            />
            to
            <Input
              type="date"
              w="150px"
              backgroundColor="#F6F6F6"
              value={filter.endDate}
              onChange={(e) =>
                setFilter({ ...filter, endDate: e.target.value })
              }
            />
          </Flex>

          <Text
            size="sm"
            as="b"
            color="#767778"
          >
            Status
          </Text>
          <Flex
            justifyContent="space-between"
            padding="4px 12px"
          >
            {["All", "Paid", "Not Paid", "Past Due"].map((label, index) => (
              <Button
                key={index}
                borderRadius="30px"
                background="#F6F6F6"
                border={
                  filter.status === label.toLowerCase()
                    ? "1px solid var(--indigo, #4E4AE7)"
                    : "1px solid transparent"
                }
                onClick={() =>
                  setFilter((filter) => ({
                    ...filter,
                    status: label.toLowerCase(),
                  }))
                }
              >
                {label}
              </Button>
            ))}
          </Flex>

          <Flex
            justifyContent="space-between"
            alignItems="center"
            mb={4}
          >
            <Flex alignItems="center">
              <Image
                src={personIcon}
                alt="Instructor"
                boxSize="20px"
                mr="4px"
              />
              <Text
                as="b"
                color="#767778"
              >
                Instructor(s)
              </Text>
            </Flex>
            <Select
              w="50%"
              backgroundColor="#F6F6F6"
              value={filter.instructor}
              onChange={(e) =>
                setFilter({ ...filter, instructor: e.target.value })
              }
            >
              <option>All</option>
              {invoices
                .filter((invoice) => invoice.role === "instructor")
                .reduce((uniqueNames, invoice) => {
                  if (!uniqueNames.includes(invoice.name)) {
                    uniqueNames.push(invoice.name);
                  }
                  return uniqueNames;
                }, [])
                .map((name, index) => (
                  <option key={index}>{name}</option>
                ))}
            </Select>
          </Flex>

          <Flex
            justifyContent="space-between"
            alignItems="center"
          >
            <Flex alignItems="center">
              <Image
                src={personIcon}
                alt="Payee"
                boxSize="20px"
                mr="4px"
              />
              <Text
                as="b"
                color="#767778"
              >
                Payee(s)
              </Text>
            </Flex>
            <Select
              w="50%"
              backgroundColor="#F6F6F6"
              value={filter.payee}
              onChange={(e) => setFilter({ ...filter, payee: e.target.value })}
            >
              <option>All</option>
              {invoices
                .filter((invoice) => invoice.role === "payee")
                .reduce((uniqueNames, invoice) => {
                  if (!uniqueNames.includes(invoice.name)) {
                    uniqueNames.push(invoice.name);
                  }
                  return uniqueNames;
                }, [])
                .map((name, index) => (
                  <option key={index}>{name}</option>
                ))}
            </Select>
          </Flex>
        </PopoverContent>
      </Popover>
    </>
  );
}

export {
  InvoiceTitle,
  InvoiceStats,
  InvoicePayments,
  InvoicesTable,
  InvoicesFilter,
};
