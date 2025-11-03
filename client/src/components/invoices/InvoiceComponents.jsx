import {
  CalendarIcon,
  CheckCircleIcon,
  ChevronDownIcon,
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
  useState,
} from "react";

import {
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
  Table,
  TableContainer,
  Tag,
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

const InvoiceTitle = ({ title, isSent, paymentStatus, endDate }) => {
  const isPaid = () => {
    if (isSent && paymentStatus === "full") {
      return "Paid";
    }
    if (!isSent && new Date() < new Date(endDate) && paymentStatus !== "full") {
      return "Not Paid";
    }
    return "Past Due";
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
        {/* is sent button */}
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
        >
          {isSent ? "Sent" : "Not Sent"}
        </Button>

        {/* paymentStatus */}
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
          _hover={{ bg: isSent ? "#F0FFF4" : "#FFF5F5" }}
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
  remainingBalance
}) => {
  const { backend } = useBackendContext();
  const { id } = useParams();
  const toast = useToast();
  const navigate = useNavigate();
  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const navigateToPreviousInvoice = async () => {
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
    const previousInvoiceId = previousInvoices.data[0].id;
    navigate(`/invoices/${previousInvoiceId}`);
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
        alignItems="end"
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
        <Box h={7}>
          {billingPeriod && billingPeriod["startDate"] ? (
            <Text
              color="#474849"
              fontSize="14px"
              fontWeight="500"
            >
              {formatDate(billingPeriod["startDate"])} -{" "}
              {formatDate(billingPeriod["endDate"])}
            </Text>
          ) : (
            <Text
              color="#474849"
              fontSize="14px"
              fontWeight="500"
            >
              N/A - N/A
            </Text>
          )}
        </Box>

        {/* amount due */}
        <Box h={7}>
          <Text
            fontWeight="700"
            fontSize="14px"
            color="#474849"
          >
            Amount Due
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
          <Flex
            gap={2}
            alignItems="start"
          >
            <Text
              color="#474849"
              fontSize="14px"
              fontWeight="500"
            >
              ${Number(remainingBalance).toFixed(2)}
            </Text>
            <Button
              backgroundColor="#EDF2F7"
              justifyContent={"center"}
              alignItems={"center"}
              padding={"15px 12px"}
              marginLeft={"8px"}
              height={"32px"}
              gap={"4px"}
              fontWeight={"500"}
              fontSize={"14px"}
              fontFamily={"Inter"}
              onClick={navigateToPreviousInvoice}
            >
              View Previous Invoice
            </Button>
          </Flex>
        </Box>
      </Grid>

      {/* room rate section */}
      <Flex
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
      </Flex>
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
      amountDue,
      handleOtherButtonClick,
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
    const [editID, setEditID] = useState(null);
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
    // Get updated comments
    const commentsResponse = await backend.get(
      "/comments/paidInvoices/" + id
    );
    
    // Update comments state with new data
    setComments(commentsResponse.data);

    // // Calculate new remaining balance using updated comments
    // const paidTotal = commentsResponse.data.reduce((acc, comment) => {
    //   if (comment.adjustmentType === "paid") {
    //     return acc + parseFloat(comment.adjustmentValue);
    //   }
    //   return acc;
    // }, 0);

    const paidTotal = await getAllDue(backend, id);
    
    // const remainingBalanceCalculated = (amountDue - paidTotal) > 0 ? (amountDue - paidTotal) : 0.00;
    setRemainingBalance(paidTotal);
  }

  const handleDeleteComment = async () => {
    setIsProcessing(true);
    try {
      await backend.delete("/comments/" + deleteID);
      const commentsResponse = await backend.get(
        "/comments/paidInvoices/" + id
      );
      setComments(commentsResponse.data);
      onClose();
    } catch (error) {
      console.error("Error deleting:", error);
    }
    finally {
      updateRemainingBalance();
      setIsProcessing(false);
    }
  };
  
  const handleShowDelete = (comment) => {
    try {
      if (hasUnsavedChanges) {
        handleButtonWhileUnsaved(() => {
          setSelectedComment(comment);
          setDeleteID(comment.id);
          onOpen();
        });
      } else {
        setSelectedComment(comment);
        setDeleteID(comment.id);
        onOpen();
      }
    } catch (error) {
      console.error("Error showing modal:", error);
    }
  };

  const handleEditComment = (edit, datetime, adjustmentValue) => {
    try {
      if (hasUnsavedChanges) {
        handleButtonWhileUnsaved(() => {
          setEditID(edit);
          setEditDate(datetime);
          setAdjustValue(adjustmentValue);
          setShowEditRow(true);
          setHasUnsavedChanges(true);
        });
      } else {
        setEditID(edit);
        setShowEditRow(true);
        setAdjustValue(adjustmentValue);
        setHasUnsavedChanges(true);
      }
    } catch (error) {
      console.error("Error editing:", error);
    }
  };

    const handleSaveComment = async () => {
      setIsProcessing(true);
      const editDateObj = new Date(editDate);
      editDateObj.setMinutes(editDateObj.getMinutes() + editDateObj.getTimezoneOffset());
    
      try {
        const adjustmentValue = parseFloat(adjustValue);
        
        const commentsData = {
          user_id: uid,
          invoice_id: id,
          booking_id: null,
          datetime: editDateObj.toISOString(),
          comment: "",
          adjustment_type: "paid",
          adjustment_value: Number(adjustmentValue),
        };

        if (showEditRow) {
          await backend.put("/comments/" + editID, commentsData);
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
          await backend.post("/comments/", commentsData);
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
      } catch (error) {
        console.error("Error saving:", error);
      }
      
      updateRemainingBalance();

      // Reset UI state
      setShowEditRow(false);
      setShowInputRow(false);
      setHasUnsavedChanges(false);
      setIsProcessing(false);
      setAdjustValue("--.--");
    }  
  //   } catch (error) {
  //     console.error("Error saving:", error);
  //   }
  // };

  const handleAddComment = async () => {
    setShowInputRow(true);
    setHasUnsavedChanges(true);
    // Set today's date in YYYY-MM-DD format for the date input
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setEditDate(formattedDate);
    setAdjustValue("0.00");
    setEditID(null);
  };

    const handleButtonWhileUnsaved = (onContinue) => {
      handleOtherButtonClick(onContinue);
    };
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date
        .toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        })
        .replace(/,/g, ".");
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
                      {showEditRow && comment.id === editID ? (
                        <Flex alignItems="center">
                          <Text
                            color="#0C824D"
                            fontWeight="bold"
                          >
                            $
                          </Text>
                          <Input
                            type="number"
                            placeholder="__.__"
                            value={Number(adjustValue).toFixed(2)}
                            w="60px"
                            textAlign="left"
                            padding="0px 0px 0px 5px"
                            margin="0px 0px 0px 5px"
                            fontSize="14px"
                            color="#0C824D"
                            fontWeight="400"
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                                setAdjustValue(value);
                                setEditDate(new Date());
                                setValueEntered(true);
                              }
                            }}
                            onBlur={(e) => {
                              if (e.target.value) {
                                const formattedValue = Number(e.target.value).toFixed(2);
                                setAdjustValue(formattedValue);
                              }
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
                              onClick={() => handleEditComment(comment.id, comment.datetime, comment.adjustmentValue)}
                              width={"149px"}
                              _hover={{ bg: "#E2E8F0" }}
                            >
                              <Box
                                display="flex"
                                alignItems="center"
                                gap="8px"
                              >
                                <Icon as={editBlackIcon} />
                                <Text color="#2D3748">Edit</Text>
                              </Box>
                            </MenuItem>
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
                                <Icon as={redCancelIcon} />
                                <Text color="#90080F">Cancel</Text>
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
                      ? formatDate(selectedComment.datetime)
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
                        type="number"
                        placeholder="__.__"
                        value={adjustValue}
                        w="60px"
                        textAlign="left"
                        padding="0px 0px 0px 5px"
                        margin="0px 0px 0px 5px"
                        fontSize="14px"
                        color="#0C824D"
                        fontWeight="400"
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                            setAdjustValue(value);
                            setValueEntered(true);
                          }
                        }}
                        onBlur={(e) => {
                          if (e.target.value) {
                            const formattedValue = Number(e.target.value).toFixed(2);
                            setAdjustValue(formattedValue);
                          }
                        }}
                      ></Input>
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
                            <Icon as={redCancelIcon} />
                            <Text color="#90080F">Cancel</Text>
                          </Box>
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              )}

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
                      This payment currently being added will be permanently
                      deleted.
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
          </Tbody>
        </Table>
      </Flex>
      </Flex>
    );
  }
);

function InvoicesTable({ filteredInvoices, isPaidColor, seasonColor, sortKey, sortOrder, onSortChange }) {

  const navigate = useNavigate();
  const toast = useToast();

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
  

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date
      .toLocaleDateString("en-US", {
        weekday: "short",
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      })
      .replace(/,/g, ".");
  };

  // Use the filtered invoices directly since sorting is now done in parent
  const currentInvoices = filteredInvoices;

  const handleEdit = useCallback(
    (id, e) => {
      e.stopPropagation();
      navigate(`/invoices/edit/${id}`);
    },
    [navigate]
  );

  return (
    <>
      <Box
        className="invoices-table__container"
        width="100%"
      >
        <TableContainer padding="0">
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
                <Th paddingRight="8px">
                  <Text>SEASON</Text>
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
                const [tagBgColor, tagTextColor] = seasonColor(invoice);

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
                      {formatDate(invoice.endDate)}
                    </Td>
                    <Td onClick={() => handleRowClick(invoice.id)}>
                      <Tag
                        size="md"
                        bg={tagBgColor}
                        color={tagTextColor}
                      >
                        {invoice.season}
                      </Tag>
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
                      >
                        <EditOnlyPopup
                          handleEdit={handleEdit}
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
