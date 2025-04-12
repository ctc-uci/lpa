import React, { useState, useEffect } from "react";

import { CalendarIcon, CheckCircleIcon} from "@chakra-ui/icons";
import {
  Box,
  Button,
  Grid,
  Flex,
  Icon,
  IconButton,
  Image,
  Input,
  HStack,
  Menu,
  MenuList,
  MenuItem,
  MenuButton,
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
  Table,
  TableContainer,
  Tag,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";

import {
  deleteIcon,
  sessionsEllipsis,
} from "../../assets/icons/ProgramIcons";

import { format } from "date-fns";
import { FaCircle, FaUser } from "react-icons/fa";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import { TbCaretUpDown } from "react-icons/tb";
import { DollarIcon } from "../../assets/DollarIcon";

import filterIcon from "../../assets/filter.svg";
import personIcon from "../../assets/person.svg";
import PDFButtonInvoice from "./PDFButtonInvoice";
import { EditIcon } from "../../assets/EditIcon";
import { CancelIcon } from "../../assets/CancelIcon";
import { DarkPlusIcon } from "../../assets/DarkPlusIcon";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { useParams } from "react-router";

import { useAuthContext } from "../../contexts/hooks/useAuthContext";


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
          backgroundColor={isSent ? "#F0FFF4" : "#FFF5F5"}
          color={isSent ? "#38A169" : "#E53E3E"}
          variant="solid"
        >
          {isSent ? "Sent" : "Not Sent"}
        </Button>

        {/* paymentStatus */}
        <Button
          backgroundColor={isPaid() === "Paid" ? "#F0FFF4" : "#FFF5F5"}
          color={isPaid() === "Paid" ? "#38A169" : "#E53E3E"}
          variant="solid"
        >
          {isPaid() === "Paid" ? "Paid" : (isPaid() === "Not Paid" ? "Not Paid" : "Past Due")}
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
      <Grid templateColumns="1fr 2fr" gap="1rem" alignItems="end">
        {/* billing period */}
        <Box h={7}>
          <Text
            fontWeight="bold"
            fontSize="clamp(.5rem, 1rem, 1.5rem)"
            color="#474849"
          >
            Billing Period
          </Text>
        </Box>
        <Box h={7}>
          {billingPeriod && billingPeriod["startDate"] ? (
            <Text
              color="#474849"
              fontSize="clamp(.5rem, 1rem, 1.5rem)"
            >
              {formatDate(billingPeriod["startDate"])} -{" "}
              {formatDate(billingPeriod["endDate"])}
            </Text>
          ) : (
            <Text
              color="#474849"
              fontSize="clamp(.75rem, 1.25rem, 1.75rem)"
            >
              N/A - N/A
            </Text>
          )}
        </Box>

        {/* amount due */}
        <Box h={7}>
          <Text
            fontWeight="bold"
            fontSize="clamp(.5rem, 1rem, 1.5rem)"
            color="#474849"
          >
            Amount Due
          </Text>
        </Box>
        <Box h={7}>
          <Text
            color="#474849"
            fontSize="clamp(.5rem, 1rem, 1.5rem)"
          >
            {amountDue ? `$${Number(amountDue).toFixed(2)}` : "N/A"}
          </Text>
        </Box>

        {/* remaining balance */}
        <Box h={7}>
          <Text
            fontWeight="bold"
            fontSize="clamp(.5rem, 1rem, 1.5rem)"
            color="#474849"
          >
            Remaining Balance
          </Text>
        </Box>

        <Box h={7}>
          <Flex gap={2} alignItems="start">
            <Text
              color="#474849"
              fontSize="clamp(.5rem, 1rem, 1.5rem)"
            >
              {roomRate !== 0
                ? `$${Number(remainingBalance).toFixed(2)}`
                : "N/A"}
            </Text>
            <Button backgroundColor="#EDF2F7">
              View Previous Invoice
            </Button>
          </Flex>
        </Box>
      </Grid>


      {/* room rate section */}
      <Flex gap={3} alignItems="center">
        <DollarIcon />
        <Text>{roomRate ? `${Number(roomRate).toFixed(2)} / hour` : "N/A"}</Text>
      </Flex>

    </Flex>
  );

};

const InvoicePayments = ({ comments, setComments, onEditRowChange}) => {
  const { id } = useParams()
  const { backend } = useBackendContext();
  const [commentsPerPage, setCommentsPerPage] = useState(3);
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [adjustValue, setAdjustValue] = useState("--.--");
  const [showInputRow, setShowInputRow] = useState(false);
  const [showEditRow, setShowEditRow] = useState(false);
  const [valueEntered, setValueEntered] = useState(false);
  const { isOpen: isOpen, onOpen: onOpen, onClose: onClose } = useDisclosure();
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
      console.log("In fetchUid")
      console.log("In fetchUid", currentUser.email)
      try {
        const uidResponse = await backend.get("/users/email/" + currentUser.email);
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
        setInvoiceMonth(date.toLocaleString("default", { month: "long" }))
        setInvoiceYear(date.getFullYear())
        const programNameResponse = await backend.get(
          "/events/" + currentInvoice.eventId
        );
        setProgramName(programNameResponse.data[0].name.split(' ').slice(0, 3).join(' '));
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } 
    }
    fetchData();
  }, [backend, id]);



  // const totalPages = Math.ceil((comments ?? []).length / commentsPerPage) || 1;
  // const currentPageComments = (comments ?? []).slice(
  //   (currentPageNumber - 1) * commentsPerPage,
  //   currentPageNumber * commentsPerPage
  // );

  const currentPageComments = comments ?? []

  // const handleCommentsPerPageChange = (event) => {
  //   setCommentsPerPage(Number(event.target.value));
  //   setCurrentPageNumber(1);
  // };

  // const handlePrevPage = () => {
  //   if (currentPageNumber > 1) {
  //     setCurrentPageNumber(currentPageNumber - 1);
  //   }
  // };

  // const handleNextPage = () => {
  //   if (currentPageNumber < totalPages) {
  //     setCurrentPageNumber(currentPageNumber + 1);
  //   }
  // };

  const handleDeleteComment = async () => {
    try {
      await backend.delete("/comments/" + deleteID);
      const commentsResponse = await backend.get('/comments/paidInvoices/' + id);
      setComments(commentsResponse.data);
      onClose();
    }catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const handleShowDelete = (commentID) => {
    try {
      setDeleteID(commentID);
      onOpen();
    } catch (error){
      console.error("Error showing modal:", error);
    }
  };

  const handleEditComment = (edit) => {
    try {
      setEditID(edit);
      setShowEditRow(true);
      if (onEditRowChange) onEditRowChange(true);
    } catch (error) {
      console.error("Error editing:", error);
    }
  }


  const handleSaveComment = async () => {
    try {
      const commentsData = {
        user_id: uid,
        invoice_id: id, 
        booking_id: null,
        datetime: (new Date()).toISOString(),
        comment: "",
        adjustment_type: "paid",
        adjustment_value: Number(adjustValue)
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
                  borderLeft = "6px solid"
                  borderColor="green.500"
                  spacing={3}
                  align="center"
                >
                  <Icon as={CheckCircleIcon} color="green.600" boxSize={5} />
                  <VStack align="left" spacing={0}>
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
      }
      const commentsResponse = await backend.get('/comments/paidInvoices/' + id);
      setComments(commentsResponse.data);
      setShowEditRow(false);
      setShowInputRow(false);
      if (onEditRowChange) onEditRowChange(false);
      setAdjustValue("--.--");

    } catch (error) {
      console.error("Error saving:", error);
    }
  };

  const handleAddComment = async () => {
    setShowInputRow(true);
  }
  
  return (
    <Flex
      direction="column"
      w="100%"
    >
      <Flex 
        direction="row"
        width="100%" justifyContent="space-between"
        marginBottom="12px"
        marginTop="26px">
        <Text
          fontWeight="bold"
          fontSize="clamp(.75rem, 1.25rem, 1.75rem)"
          color="#474849"
          mb={3}
        >
          Payments
        </Text>
        {!showInputRow && !showEditRow ? (
          <Button onClick={handleAddComment} leftIcon={<DarkPlusIcon />}>
            Add
          </Button>
        ) : (
          <Button onClick={handleSaveComment} disabled={!valueEntered}>
            Save
          </Button>
        )}
      </Flex>
      
      <Flex
        borderRadius={15}
        borderWidth=".07em"
        borderColor="#E2E8F0"
        p={3}
        mb={3}
      >
        <Table
          color="#EDF2F7"
        >
          <Tbody color="#2D3748" width="100%">
            {comments && comments.length > 0 ? (
              [...currentPageComments]
              .sort((a, b) => a.id - b.id)
              .map((comment) => (
                <Tr position="relative" justifyContent="space-between" key={comment.id} >
                  <Td fontSize="clamp(.5rem, 1rem, 1.5rem)">
                    {format(new Date(comment.datetime), "EEE. M/d/yy")}
                  </Td>
                  <Td fontSize="clamp(.5rem, 1rem, 1.5rem)" color="#0C824D" fontWeight="bold">
                  {showEditRow && comment.id === editID ? (
                    <Flex alignItems="center">
                      <Text color="#0C824D" fontWeight="bold">$</Text>
                      <Input 
                        type="number" 
                        placeholder="__.__" 
                        value={adjustValue} 
                        w="60px"
                        color="#0C824D"
                        fontWeight="bold"
                        variant="unstyled"
                        onChange={(e) => setAdjustValue(e.target.value)}
                      />
                    </Flex>
                  ) : (
                    comment.adjustmentValue
                      ? `$${Number(comment.adjustmentValue).toFixed(0)}`
                      : "N/A"
                  )} 
                  </Td>
                  <Td position="absolute" right={0} marginLeft="auto">
                    <Menu>
                              <MenuButton
                                as={IconButton}
                                height="24px"
                                width="24px"
                                variant="ghost"
                                borderRadius={6}
                                color="#EDF2F"
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
                                <MenuItem
                                  onClick={() => handleShowDelete(comment.id)}
                                >
                                  <Box
                                    display="flex"
                                    padding="12px 16px"
                                    alignItems="center"
                                    gap="8px"
                                  >
                                    <Icon as={CancelIcon} />
                                    <Text color="#90080F">Delete</Text>
                                  </Box>
                                </MenuItem>
                              </MenuList>
                    </Menu>
                    <Modal
              isOpen={isOpen}
              onClose={onClose}
            >
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Delete Comment?</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <div id="deactivateReason">
                    Reason for Deletion
                    <Input placeholder="..." />
                  </div>
                  <div
                    id="archive"
                    style={{ display: "flex", justifyContent: "flex-end" }}
                  >
                  </div>
                </ModalBody>

                <ModalFooter
                  style={{ display: "flex", justifyContent: "flex-end" }}
                >
                  <Button
                    variant="ghost"
                    onClick={onClose}
                  >
                    Exit
                  </Button>
                  <Button
                    colorScheme="red"
                    mr={3}
                    id="deactivateConfirm"
                    onClick={() => {
                      handleDeleteComment()
                    }}
                  >
                    Confirm
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={3}>No comments available.</Td>
              </Tr>
            )}
            {showInputRow && (
            <Tr position="relative" justifyContent="space-between" tableLayout="fixed">
              <Td fontSize="clamp(.5rem, 1rem, 1.5rem)">
                {format(new Date(), "EEE. M/d/yy")}
              </Td>
              <Td fontSize="clamp(.5rem, 1rem, 1.5rem)" fontWeight="bold">
                <Flex alignItems="center" >
                  <Text color="#0C824D" fontWeight="bold">$</Text>
                  <Input 
                    type="number" 
                    placeholder="__.__" 
                    value={adjustValue} 
                    w="60px"
                    color="#0C824D"
                    fontWeight="bold"
                    variant="unstyled"
                    onChange={(e) => setAdjustValue(e.target.value)}>
                  </Input>
                </Flex>
              </Td>
              <Td position="absolute" right={0} marginLeft="auto">
                    <Menu>
                        <MenuButton
                          as={IconButton}
                          height="24px"
                          width="24px"
                          variant="ghost"
                          borderRadius={6}
                          icon={<Icon as={sessionsEllipsis} />}
                        />
                    </Menu>
              </Td>
            </Tr>
            )}
          </Tbody>
        </Table>
      </Flex>
      {/* <Flex
        direction="row"
        width="100%"
        alignItems="center"
        mb={5}
      >
        <Text
          fontSize="clamp(.5rem, 1rem, 1.5rem)"
          marginRight="0.5rem"
        >
          {" "}
          Show:{" "}
        </Text>
        <Select
          width="auto"
          marginRight="0.5rem"
          value={commentsPerPage}
          onChange={handleCommentsPerPageChange}
        >
          <option value={3}>3</option>
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </Select>
        <Text fontSize="clamp(.5rem, 1rem, 1.5rem)">per page</Text>
        <Flex
          direction="row"
          marginLeft="auto"
          alignItems="center"
        >
          <Text
            fontSize="clamp(.5rem, 1rem, 1.5rem)"
            marginRight="1rem"
          >
            {" "}
            {currentPageNumber} of {totalPages < 1 ? 1 : totalPages}{" "}
          </Text>
          <Button
            onClick={handlePrevPage}
            isDisabled={currentPageNumber === 1}
            borderLeftRadius={30}
          >
            <FaAngleLeft></FaAngleLeft>
          </Button>
          <Button
            onClick={handleNextPage}
            isDisabled={currentPageNumber === totalPages || totalPages === 0}
            borderRightRadius={30}
          >
            <FaAngleRight></FaAngleRight>
          </Button>
        </Flex>
      </Flex> */}
    </Flex> 
  );
};

function InvoicesTable({ filteredInvoices, isPaidColor, seasonColor }) {
  return (
    <TableContainer
      paddingTop="8px"
      border="1px solid var(--gray-200, #E2E8F0)"
      borderRadius="12px"
    >
      <Table>
        <Thead>
          <Tr>
            <Th
              textTransform="none"
              fontSize="md"
            >
              <Flex align="center">
                <Text>Status</Text>
                <TbCaretUpDown style={{ marginLeft: "8px" }} />
              </Flex>
            </Th>
            <Th
              textTransform="none"
              fontSize="md"
            >
              Invoice Sent
            </Th>
            <Th
              textTransform="none"
              fontSize="md"
            >
              <Flex align="center">
                <Text>Program</Text>
                <TbCaretUpDown style={{ marginLeft: "8px" }} />
              </Flex>
            </Th>
            <Th
              textTransform="none"
              fontSize="md"
            >
              <Flex align="center">
                <FaUser style={{ marginRight: "8px" }} />
                <Text>Payer(s)</Text>
              </Flex>
            </Th>
            <Th
              textTransform="none"
              fontSize="md"
            >
              <Flex align="center">
                <CalendarIcon
                  color="#767778"
                  style={{ marginRight: "8px" }}
                />
                <Text>Deadline</Text>
                <TbCaretUpDown style={{ marginLeft: "8px" }} />
              </Flex>
            </Th>
            <Th
              textTransform="none"
              fontSize="md"
            >
              Season
            </Th>
            <Th
              textTransform="none"
              fontSize="md"
            >
              Download
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredInvoices.map((invoice, index) => {
            const validPayers = Array.isArray(invoice.payers)
              ? invoice.payers.filter(
                  (payer) => payer && typeof payer === "string"
                )
              : [];
            return (
              <Tr key={index}>
                <Td
                  style={{
                    color: isPaidColor(invoice),
                    textDecoration:
                      invoice.isPaid === "Past Due" ? "underline" : "none",
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
                <Td>
                  {new Date(invoice.endDate).toLocaleDateString("en-US", {
                    month: "2-digit",
                    day: "2-digit",
                    year: "numeric",
                  })}
                </Td>
                <Td>
                  <Tag
                    bg={seasonColor(invoice)}
                    color="white"
                  >
                    {invoice.season}
                  </Tag>
                </Td>
                <Td>
                  <Flex ml="18px">
                    <PDFButtonInvoice invoice={invoice} />
                  </Flex>
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </TableContainer>
  );
}

function InvoicesFilter({ invoices, filter, setFilter }) {
  return (
    <>
      <Popover placement="bottom-start">
        <PopoverTrigger>
          <Button
            backgroundColor="#F0F1F4"
            borderRadius="15px"
            h="48px"
            px="12px"
            textColor="#767778"
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
