import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  CalendarIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DeleteIcon,
} from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  Grid,
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
import { FaCircle, FaUser } from "react-icons/fa";
import { FiMoreHorizontal } from "react-icons/fi";
import { useParams } from "react-router";
import { useNavigate } from "react-router-dom";

import { CancelIcon } from "../../assets/CancelIcon";
import { DarkPlusIcon } from "../../assets/DarkPlusIcon";
import { DollarIcon } from "../../assets/DollarIcon";
import { EditIcon } from "../../assets/EditIcon";
import filterIcon from "../../assets/filter.svg";
import {
  archiveCalendar,
  sessionsEllipsis,
} from "../../assets/icons/ProgramIcons";
import personIcon from "../../assets/person.svg";
import { useAuthContext } from "../../contexts/hooks/useAuthContext";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import DateSortingModal from "../filters/DateFilter";
import ProgramSortingModal from "../filters/ProgramFilter";
import StatusSortingModal from "../filters/StatusFilter";
import { PaginationComponent } from "../PaginationComponent";
import { PDFButtonInvoice } from "./PDFButtonInvoice";

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
        {title}
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
  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
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
            {amountDue ? `$${Number(amountDue).toFixed(2)}` : "N/A"}
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
              {roomRate !== 0
                ? `$${Number(remainingBalance).toFixed(2)}`
                : "N/A"}
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

const InvoicePayments = ({ comments, setComments, setHasUnsavedChanges }) => {
  const { id } = useParams();
  const { backend } = useBackendContext();
  const [commentsPerPage, setCommentsPerPage] = useState(3);
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [adjustValue, setAdjustValue] = useState("--.--");
  const [showInputRow, setShowInputRow] = useState(false);
  const [showEditRow, setShowEditRow] = useState(false);
  const [valueEntered, setValueEntered] = useState(false);
  const { isOpen: isOpen, onOpen: onOpen, onClose: onClose } = useDisclosure();
  const [selectedComment, setSelectedComment] = useState(null);
  const [editID, setEditID] = useState(null);
  const [deleteID, setDeleteID] = useState(null);

  const { currentUser } = useAuthContext();
  const [uid, setUid] = useState(null);
  const [programName, setProgramName] = useState("");
  const [invoiceMonth, setInvoiceMonth] = useState("");
  const [invoiceYear, setInvoiceYear] = useState("");
  const toast = useToast();

  useEffect(() => {
    const fetchUid = async () => {
      console.log("In fetchUid");
      console.log("In fetchUid", currentUser.email);
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

  const currentPageComments = comments ?? [];

  const handleDeleteComment = async () => {
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

  const handleEditComment = (edit) => {
    try {
      setEditID(edit);
      setShowEditRow(true);
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error("Error editing:", error);
    }
  };

  const handleSaveComment = async () => {
    try {
      const commentsData = {
        user_id: uid,
        invoice_id: id,
        booking_id: null,
        datetime: new Date().toISOString(),
        comment: "",
        adjustment_type: "paid",
        adjustment_value: Number(adjustValue),
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
  };

  const handleAddComment = async () => {
    setShowInputRow(true);
    setHasUnsavedChanges(true);
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
                      {format(new Date(comment.datetime), "EEE. M/d/yy")}
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
                            value={adjustValue}
                            w="60px"
                            color="#0C824D"
                            fontWeight="700"
                            fontSize="14px"
                            variant="unstyled"
                            onChange={(e) => setAdjustValue(e.target.value)}
                          />
                        </Flex>
                      ) : comment.adjustmentValue ? (
                        `$${Number(comment.adjustmentValue).toFixed(0)}`
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
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          minWidth="24px"
                          height="24px"
                          borderRadius={6}
                          backgroundColor="#EDF2F7"
                          icon={<Icon as={sessionsEllipsis} />}
                        />
                        <MenuList>
                          <MenuItem
                            onClick={() => handleEditComment(comment.id)}
                          >
                            <Box
                              display="flex"
                              padding="12px 16px"
                              alignItems="center"
                              gap="8px"
                            >
                              <Icon as={EditIcon} />
                              <Text color="#767778">Edit</Text>
                            </Box>
                          </MenuItem>
                          <MenuItem onClick={() => handleShowDelete(comment)}>
                            <Box
                              display="flex"
                              padding="12px 16px"
                              alignItems="center"
                              gap="8px"
                            >
                              <Icon as={CancelIcon} />
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
                <Td colSpan={3}>No comments available.</Td>
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
                  {selectedComment ? formatDate(selectedComment.datetime) : ""}?
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
                    _hover={{ backgroundColor: "#90080F", opacity: "80%" }}
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
                  paddingInlineStart="8px"
                  paddingInlineEnd="8px"
                >
                  {format(new Date(), "EEE. M/d/yy")}
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
                      fontSize="14px"
                      color="#0C824D"
                      fontWeight="400"
                      variant="unstyled"
                      onChange={(e) => setAdjustValue(e.target.value)}
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
                      minWidth="24px"
                      height="24px"
                      borderRadius={6}
                      backgroundColor="#EDF2F7"
                      icon={<Icon as={sessionsEllipsis} />}
                    />
                  </Menu>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Flex>
    </Flex>
  );
};

function InvoicesTable({ filteredInvoices, isPaidColor, seasonColor }) {
  const [sortKey, setSortKey] = useState("title");
  const [sortOrder, setSortOrder] = useState("asc");

  const navigate = useNavigate();
  const toast = useToast();

  const handleRowClick = useCallback(
    (id) => {
      navigate(`/invoices/${id}`);
    },
    [navigate]
  );

  useEffect(() => {
    filteredInvoices.forEach((invoice, index) => {
      if (invoice.isPaid === "Past Due") {
        const programTitle = invoice.eventName.split(" ").slice(0, 3).join(" ");
        const date = new Date(invoice.endDate);
        const month = date.toLocaleString("default", { month: "long" });
        const year = date.getFullYear();
        const description = `${programTitle}, ${month} ${year} Invoice`;

        setTimeout(() => {
          toast({
            title: "Invoice Past Due",
            description: description,
            status: "error",
            duration: 1000,
            isClosable: true,
            position: "bottom-right",
          });
        }, index * 500);
      }
    });
  }, [filteredInvoices, toast]);
  

  const handleSortChange = useCallback((key, order) => {
    setSortKey(key);
    setSortOrder(order);
  }, []);

  const sortedPrograms = useMemo(() => {
    if (!filteredInvoices.length) return [];

    const sorted = [...filteredInvoices];
    if (sortKey === "title") {
      sorted.sort((a, b) =>
        sortOrder === "asc"
          ? a.eventName.localeCompare(b.eventName)
          : b.eventName.localeCompare(a.eventName)
      );
    } else if (sortKey === "date") {
      sorted.sort((a, b) => {
        const aInvalid = !a.endDate || a.endDate === "N/A";
        const bInvalid = !b.endDate || b.endDate === "N/A";
        if (aInvalid && bInvalid) return 0;
        if (aInvalid) return 1;
        if (bInvalid) return -1;
        const dateA = new Date(a.endDate);
        const dateB = new Date(b.endDate);
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      });
    } else if (sortKey === "status") {
      sorted.sort((a, b) => {
        const priority = {
          "Past Due": 0,
          "Not Paid": 1,
          Paid: 2,
        };
        return sortOrder === "asc"
          ? priority[b.isPaid] - priority[a.isPaid]
          : priority[a.isPaid] - priority[b.isPaid];
      });
    }
    return sorted;
  }, [filteredInvoices, sortKey, sortOrder]);

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

  // Get current page data
  const currentInvoices = sortedPrograms;

  return (
    <>
      <Box position="relative">
        <TableContainer>
          <Table>
            <Thead>
              <Tr>
                <Th
                  textTransform="none"
                  fontSize="md"
                >
                  <HStack
                    spacing={2}
                    alignItems="center"
                  >
                    <Text>STATUS</Text>
                    <StatusSortingModal onSortChange={handleSortChange} />
                  </HStack>
                </Th>
                <Th
                  textTransform="none"
                  fontSize="md"
                >
                  INVOICE SENT
                </Th>
                <Th
                  textTransform="none"
                  fontSize="md"
                >
                  <HStack
                    spacing={2}
                    alignItems="center"
                  >
                    <Text>PROGRAM</Text>
                    <Spacer />
                    <ProgramSortingModal onSortChange={handleSortChange} />
                  </HStack>
                </Th>
                <Th
                  textTransform="none"
                  fontSize="md"
                >
                  <Flex align="center">
                    <FaUser style={{ marginRight: "8px" }} />
                    <Text>PAYER(S)</Text>
                  </Flex>
                </Th>
                <Th
                  textTransform="none"
                  fontSize="md"
                >
                  <HStack
                    spacing={2}
                    alignItems="center"
                  >
                    <Icon as={archiveCalendar} />
                    <Text>DEADLINE</Text>
                    <Spacer />
                    <DateSortingModal onSortChange={handleSortChange} />
                  </HStack>
                </Th>
                <Th
                  textTransform="none"
                  fontSize="md"
                >
                  SEASON
                </Th>
                <Th
                  textTransform="none"
                  fontSize="md"
                >
                  DOWNLOADS
                </Th>
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

                return (
                  <Tr key={index}>
                    <Td
                      style={{
                        color: isPaidColor(invoice),
                        fontWeight:
                          invoice.isPaid === "Past Due" ? "bold" : "normal",
                      }}
                    >
                      {invoice.isPaid}
                    </Td>
                    <Td>
                      <Flex
                        justifyContent="center"
                        align="center"
                        w="60%"
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
                    <Td>{invoice.eventName}</Td>
                    <Td>
                      {validPayers.length > 1
                        ? `${validPayers[0].trim()},...`
                        : validPayers.length === 1
                          ? validPayers[0].trim()
                          : "N/A"}
                    </Td>
                    <Td>{formatDate(invoice.endDate)}</Td>
                    <Td>
                      <Tag
                        bg={tagBgColor}
                        color={tagTextColor}
                      >
                        {invoice.season}
                      </Tag>
                    </Td>
                    <Td>
                      <Flex ml="18px">
                        <PDFButtonInvoice id={invoice.id} />
                      </Flex>
                    </Td>
                    <Td>
                      <IconButton
                        icon={<FiMoreHorizontal />}
                        size="sm"
                        bg="#EDF2F7"
                        color="#000000"
                        borderRadius="md"
                      />
                    </Td>
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
