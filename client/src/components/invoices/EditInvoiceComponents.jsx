import React, { useEffect, useRef, useState } from "react";

import {
  AddIcon,
  ChevronDownIcon,
  CloseIcon,
  InfoOutlineIcon,
} from "@chakra-ui/icons";
import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputLeftAddon,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Radio,
  RadioGroup,
  SimpleGrid,
  Slide,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";

import { format } from "date-fns";

import {
  BookWithBookmarkIcon,
  CalendarIcon,
  CancelIcon,
  ClockIcon,
  DollarSignIcon,
  EditDocumentIcon,
  LocationIcon,
  PencilIcon,
  PlusIcon,
} from "../../assets/EditInvoiceIcons";
import commentsIcon from "../../assets/icons/comments.svg";
import plusIcon from "../../assets/icons/plus.svg";
import logo from "../../assets/logo/logo.png";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { getCurrentUser } from "../../utils/auth/firebase";
import {
  RoomFeeAdjustmentSideBar,
  SummaryFeeAdjustmentSideBar,
} from "./RoomFeeAdjustmentSideBar";
import { useSessionStore } from "../../stores/useSessionStore";
import { useSummaryStore } from "../../stores/useSummaryStore";
import { useDeletedIdsStore } from "../../stores/useDeletedIdsStore";

const getGeneratedDate = (comments = [], invoice = null, includeDay = true) => {
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

const EditInvoiceTitle = ({ comments, invoice, compactView }) => {
  return (
    <Flex
      justifyContent="space-between"
      fontFamily="Inter"
      color="#2D3748"
      gap={20}
      mb={"29.26px"}
    >
      <Stack>
        <Heading
          color="#2D3748"
          fontWeight="600"
          fontSize={compactView ? "20.932px" : "5xl"}
        >
          INVOICE
        </Heading>
        <Text
          color="#718096"
          fontSize={compactView && "6.509px"}
          whiteSpace="nowrap"
        >
          Generated on {getGeneratedDate(comments, invoice, true)}
        </Text>
      </Stack>
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="end"
        align="center"
        gap="4"
      >
        <VStack
          align="flex-end"
          spacing={0}
        >
          <Text fontSize={compactView ? "7.509px" : "sm"}>
            La Peña Cultural Center
          </Text>
          <Text
            fontSize={compactView ? "7.509px" : "sm"}
            whiteSpace="nowrap"
          >
            3105 Shattuck Ave., Berkeley, CA 94705
          </Text>
          <Text fontSize={compactView ? "7.509px" : "sm"}>lapena.org</Text>
        </VStack>
        <Image
          src={logo}
          alt="La Peña Logo"
          w={100}
        />
      </Flex>
    </Flex>
  );
};

const EditInvoiceDetails = ({
  instructors,
  programName,
  payees,
  comments,
  invoice,
  compactView = false,
}) => {
  return (
    <VStack
      spacing={6}
      align="stretch"
      mb={8}
      fontFamily="Inter"
      color="#2D3748"
    >
      <VStack gap="0">
        <Heading
          textAlign="center"
          fontWeight={"600"}
          fontSize={compactView ? "13.827px" : "2xl"}
        >
          Classroom Rental Monthly Statement
        </Heading>
        <Heading
          fontSize={compactView ? "8.509px" : "sm"}
          textAlign="center"
          color="#2D3748"
          fontWeight="500"
          mt={"5.85px"}
        >
          {getGeneratedDate([], invoice, false)}
        </Heading>
      </VStack>

      <SimpleGrid
        columns={{ base: 1, md: 2 }}
        spacing={6}
      >
        {/* Left column */}
        <VStack
          align="stretch"
          flex={1}
        >
          <Text
            fontWeight="500"
            color={"#718096"}
            margin={"0 0"}
            padding={0}
            fontSize={compactView ? "8.509px" : "sm"}
          >
            Recurring Program:
          </Text>
          <Text fontSize={compactView ? "8.509px" : "sm"}>
            {programName || "No program name found"}
          </Text>
          <VStack
            align="stretch"
            flex={1}
            maxH="120px"
          >
            <Text
              fontWeight="500"
              color={"#718096"}
              fontSize={compactView ? "8.509px" : "sm"}
            >
              Designated Payer(s):
            </Text>
            {payees && payees.length > 0 ? (
              payees.map((payee, index) => (
                <Text
                  key={index}
                  mr={2}
                  borderRadius="0"
                  fontSize={compactView ? "8.509px" : "sm"}
                >
                  {payee.name} - {payee.email}
                </Text>
              ))
            ) : (
              <Text
                mr={2}
                borderRadius="0"
                fontSize={compactView ? "8.509px" : "sm"}
              >
                No payees found.
              </Text>
            )}
          </VStack>
        </VStack>

        {/* Right column */}
        <HStack align="flex-start">
          <VStack
            align="stretch"
            flex={1}
            maxH="195px"
            overflowY="auto"
          >
            <Text
              fontWeight="500"
              color={"#718096"}
              fontSize={compactView ? "8.509px" : "sm"}
            >
              Lead Artist(s):
            </Text>
            {instructors && instructors.length > 0 ? (
              instructors.map((instructor, index) => (
                <HStack key={index}>
                  <Text
                    mr={2}
                    fontSize={compactView ? "8.509px" : "sm"}
                  >
                    {instructor?.name} - {instructor?.email}
                  </Text>
                </HStack>
              ))
            ) : (
              <Text
                mr={2}
                borderRadius="0"
                fontSize={compactView ? "8.509px" : "sm"}
              >
                No instructors found.
              </Text>
            )}
          </VStack>
        </HStack>
      </SimpleGrid>
    </VStack>
  );
};

const StatementComments = ({
  invoice,
  compactView = false,
  setSubtotal,
}) => {
  const { backend } = useBackendContext();
  const [activeRowId, setActiveRowId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [activeCommentId, setActiveCommentId] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [hoveredRowIndex, setHoveredRowIndex] = useState(null);
  const [editingCustomRow, setEditingCustomRow] = useState(null);
  const [editCustomDate, setEditCustomDate] = useState("");
  const [editCustomText, setEditCustomText] = useState("");
  const [editCustomAmount, setEditCustomAmount] = useState("");
  const [editCustomId, setEditCustomId] = useState(null);
  const editRowRef = useRef(null);
  const { deletedIds, setDeletedIds, addDeletedId } = useDeletedIdsStore();

  const { sessions,
    setSessions,
    addSession,
    deleteSession,
    addComment,
    setComment,
    deleteComment,
    addCustomRow,
    setCustomRow,
    deleteCustomRow
  } = useSessionStore();


  const { summary, setSummary, summaryTotal, setSummaryTotal } = useSummaryStore();

  const formatDateForInput = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value.split("T")[0];
    try {
      return new Date(value).toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  useEffect(() => {
    const fetchUserId = async () => {
      const currentFirebaseUser = await getCurrentUser();
      const firebaseUid = currentFirebaseUser?.uid;
      if (!firebaseUid) return;
      const userRes = await backend.get(`/users/${firebaseUid}`);
      setUserId(userRes.data[0].id);
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (editRowRef.current && !editRowRef.current.contains(event.target)) {
        if (editingCustomRow !== null) {
          const [sessionIndex, totalIndex] = editingCustomRow.split("-");
          handleSaveCustomRow(
            parseInt(sessionIndex),
            parseInt(totalIndex)
          );
        }
      }
    };

    if (editingCustomRow !== null) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [editingCustomRow, editCustomDate, editCustomText, editCustomAmount, editCustomId]);

  const calculateSummaryTotal = (rate, adjustmentValues) => {
    if (!rate) return "0.00";

    const baseRate = Number(rate);
    if (isNaN(baseRate)) return "0.00";

    const adjustedTotal = (adjustmentValues || []).reduce((acc, val) => {
      if (isNaN(val.value) || val.type === "total") return acc;

      if (val.type === "rate_percent") {
        const factor = 1 + val.value / 100;
        return acc * factor;
      } else {
        return acc + Number(val.value);
      }
    }, baseRate);

    return Number(adjustedTotal).toFixed(2);
  };

  const calculateTotalBookingRow = (
    startTime,
    endTime,
    rate,
    adjustmentValues
  ) => {
    if (!rate) return "0.00";

    // Make sure we're working with a valid array of adjustment values
    const currentAdjustmentValues = Array.isArray(adjustmentValues)
      ? adjustmentValues.filter((adj) => adj && adj.type)
      : [];

    const timeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const rawStart = timeToMinutes(startTime.substring(0, 5));
    const rawEnd = timeToMinutes(endTime.substring(0, 5));
    const endAdjusted = rawEnd <= rawStart ? rawEnd + 24 * 60 : rawEnd;
    const durationInHours = (endAdjusted - rawStart) / 60;

    const baseRate = Number(rate);

    const adjustedRate = currentAdjustmentValues.reduce((currentRate, adj) => {
      if (!adj || !adj.type || adj.value === undefined) return currentRate;

      const numericValue = Number(adj.value);
      if (isNaN(numericValue)) return currentRate;

      const numericPart = Math.abs(numericValue);
      let adjustmentAmount = 0;

      if (adj.type === "rate_flat") {
        adjustmentAmount = numericPart;
      } else if (adj.type === "rate_percent") {
        adjustmentAmount = (numericPart / 100) * currentRate;
      }

      return numericValue < 0
        ? currentRate - adjustmentAmount
        : currentRate + adjustmentAmount;
    }, baseRate);

    const total = adjustedRate * durationInHours;
    return total.toFixed(2);
  };

  const calculateSubtotal = (sessions) => {
    if (!sessions || sessions.length === 0) return "0.00";

    const adjSum = sessions.reduce((acc, session) => {
      // Check if session has adjustmentValues and it's not empty
      if (!session.adjustmentValues || session.adjustmentValues.length === 0) {
        // Calculate without adjustments
        const total = parseFloat(
          calculateTotalBookingRow(
            session.startTime,
            session.endTime,
            calculateSummaryTotal(session?.rate, summary[0]?.adjustmentValues),
            []
          )
        );
        return acc + total;
      }

      const total = parseFloat(
        calculateTotalBookingRow(
          session.startTime,
          session.endTime,
          calculateSummaryTotal(session?.rate, summary[0]?.adjustmentValues),
          session.adjustmentValues
        )
      );
      return acc + total;
    }, 0);

    const totalSum = sessions.reduce((acc, session) => {
      const total = parseFloat(
        session.total.reduce((sum, item) => sum + Number(item.value || 0), 0)
      );
      return acc + total;
    }, 0);

    const finalTotal = adjSum + totalSum;

    const total = finalTotal.toFixed(2);
    setSubtotal(Number(total));
    return total;
  };

  const formatTimeString = (timeStr) => {
    if (!timeStr) {
      return "N/A";
    }
    const timePart = timeStr.split("-")[0]?.substring(0, 5); // Added optional chaining
    if (!timePart) {
      return "N/A";
    }

    const [hours, minutes] = timePart.split(":").map(Number);
    const period = hours >= 12 ? "pm" : "am";
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  const saveComment = (index, commentIndex = null) => {
    if (!commentText.trim()) {
      setActiveCommentId(null);
      setCommentText("");
      return;
    }

    if (commentIndex !== null) {
      // Edit existing comment locally for now
      setComment(index, commentIndex, commentText);
    } else {
      // Add new comment via global store
      addComment(index, commentText.trim());
    }
    setActiveCommentId(null);
    setCommentText("");
  };

  const handleAddComment = (index) => {
    if (activeCommentId === index) {
      saveComment(index);
    } else {
      setCommentText("");
      setActiveCommentId(index);
    }
  };

  const handleEditComment = (sessionIndex, commentIndex) => {
    setComment(sessionIndex, commentIndex, commentText);

    setActiveCommentId(`${sessionIndex}-${commentIndex}`);
  };

  const handleKeyDown = (e, index, commentIndex = null) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      saveComment(index, commentIndex);
    }
  };

  const handleCustomRowKeyDown = (e, sessionIndex, totalIndex) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      handleSaveCustomRow(sessionIndex, totalIndex);
    }
  };

  const handleBlur = (e, index, commentIndex = null) => {
    // Small timeout to allow clicking on buttons
    setTimeout(() => {
      if (activeCommentId) {
        saveComment(index, commentIndex);
      }
    }, 100);
  };

  const handleDeleteComment = (sessionIndex, commentIndex) => {
    const comment = sessions?.[sessionIndex]?.comments?.[commentIndex];
    // console.log("delete comment", comment);
    deleteComment(sessionIndex, commentIndex);
    // Only add to deletedIds if the comment has a valid ID (exists in backend)
    if (comment && comment.id) {
      addDeletedId(comment.id);
    }
  };

  const handleAddCustomRow = (index) => {
    if (editingCustomRow !== null) return;

    addCustomRow(index, {
      date: new Date().toISOString().split("T")[0],
      value: 0,
      comment: "",
    });

    setEditingCustomRow(`${index}-${sessions[index].total.length}`);
    setEditCustomDate(new Date().toISOString().split("T")[0]);
    setEditCustomText("");
    setEditCustomAmount("0");
    setEditCustomId(null); // Reset ID for new rows
  };

  const handleEditCustomRow = (session, index, totalIndex) => {
    if (editingCustomRow !== null) return;

    setEditingCustomRow(`${index}-${totalIndex}`);

    const date = new Date(session.datetime);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());

    setEditCustomDate(formatDateForInput(session.total[totalIndex].date));
    setEditCustomText(session.total[totalIndex]?.comment || "");
    setEditCustomAmount(session.total[totalIndex].value.toString());

    // Store the ID of the row being edited to preserve it
    setEditCustomId(session.total[totalIndex]?.id || null);
  };

  const handleSaveCustomRow = (sessionIndex, totalIndex) => {
    if (!editCustomDate || !editCustomText || !editCustomAmount) return;

    setCustomRow(sessionIndex, totalIndex, {
      id: editCustomId, // Preserve the original ID
      date: editCustomDate,
      value: editCustomAmount,
      comment: editCustomText,
    });

    setEditingCustomRow(null);
    setEditCustomDate(new Date().toISOString().split("T")[0]);
    setEditCustomText("");
    setEditCustomAmount("");
    setEditCustomId(null); // Reset the ID
  };

  const handleDeleteCustomRow = (sessionIndex, totalIndex) => {
    deleteCustomRow(sessionIndex, totalIndex);

    // Reset editing state
    setEditingCustomRow(null);
    setEditCustomDate(new Date().toISOString().split("T")[0]);
    setEditCustomText("");
    setEditCustomAmount("");
    setEditCustomId(null); // Reset the ID

    // If the total item had an ID, add it to deletedIds
    const totalItem = sessions[sessionIndex]?.total[totalIndex];
    
    if (totalItem?.id) {
      addDeletedId(totalItem.id);
    }
  };

  return (
    <Flex
      direction="column"
      minH="24"
      fontFamily="Inter"
      color="#2D3748"
    >
      <HStack align="baseline">
        <BookWithBookmarkIcon />
        <Heading
          size={compactView ? "1.2em" : "md"}
          mb="2"
        >
          Sessions
        </Heading>
      </HStack>
      <Box position="relative">
        <Flex
          border="1px solid #D2D2D2"
          borderRadius="9.57px"
          minH="24"
          px="12px"
        >
          <Box width="100%">
            <Table
              color="#EDF2F7"
              textAlign="center"
              variant="simple"
              size="sm"
            >
              {/* header row */}
              <Thead>
                <Tr color="#4A5568">
                  <Th
                    fontSize={compactView ? "6" : "12px"}
                    py={compactView ? "4" : "8"}
                  >
                    <Flex align="center">
                      <CalendarIcon width={compactView ? "8" : undefined} />
                      <Text
                        marginLeft="4px"
                        fontSize={compactView ? "6" : "sm"}
                        color="#718096"
                      >
                        Date
                      </Text>
                    </Flex>
                  </Th>
                  <Th fontSize={compactView ? "6" : "12px"}>
                    <Flex align="center">
                      <LocationIcon
                        width={compactView ? "8" : "12"}
                        height={compactView ? "10" : undefined}
                      />
                      <Text
                        marginLeft="4px"
                        color="#718096"
                      >
                        Classroom
                      </Text>
                    </Flex>
                  </Th>
                  <Th fontSize={compactView ? "6" : "12px"}>
                    <Flex align="center">
                      <ClockIcon
                        width={compactView ? "8" : "24"}
                        height={compactView ? "10" : "16"}
                      />
                      <Text
                        marginLeft="4px"
                        color="#718096"
                        whiteSpace="nowrap"
                      >
                        Rental Hours
                      </Text>
                    </Flex>
                  </Th>
                  <Th
                    fontSize={compactView ? "6" : "12px"}
                    whiteSpace="nowrap"
                  >
                    <Flex align="center">
                      <EditDocumentIcon
                        width={compactView ? "8" : "16"}
                        height={compactView ? "10" : undefined}
                      />
                      <Text
                        marginLeft="4px"
                        color="#718096"
                      >
                        Room Fee Adjustment
                      </Text>
                    </Flex>
                  </Th>
                  <Th
                    fontSize={compactView ? "6" : "12px"}
                    whiteSpace="nowrap"
                  >
                    <Flex align="center">
                      <DollarSignIcon
                        width={compactView ? "12" : "20"}
                        height={compactView ? "12" : "20"}
                      />
                      <Text
                        marginLeft="4px"
                        color="#718096"
                      >
                        Room Fee
                      </Text>
                    </Flex>
                  </Th>
                  <Th
                    textAlign="end"
                    fontSize={compactView ? "6" : "12px"}
                    color="#718096"
                  >
                    Total
                  </Th>
                </Tr>
              </Thead>

              <Tbody color="#2D3748">
                {Array.isArray(sessions) && sessions.length > 0 ? (
                  sessions.filter((session) => session?.name?.length > 0)
                    .map((session, index) => {
                      // For regular sessions, use the existing code
                      return (

                        <React.Fragment key={index}>
                          <Tr
                            position="relative"
                            onMouseEnter={() => setHoveredRowIndex(index)}
                            onMouseLeave={() => setHoveredRowIndex(null)}
                          >
                            <Td
                              py={compactView ? 0 : 4}
                              fontSize={compactView ? "6.38" : "sm"}
                              whiteSpace="nowrap"
                              borderBottom={
                                session.comments.length > 0 ? "none" : undefined
                              }
                            >
                              <VStack
                                position="absolute"
                                left="-100px"
                                top="50%"
                                transform="translateY(-50%)"
                                zIndex="1"
                                opacity={
                                  hoveredRowIndex === index ||
                                    activeCommentId === session.id
                                    ? 1
                                    : 0
                                }
                                transition="opacity 0.2s"
                                alignItems="flex-end"
                                width="100px"
                              >
                                <Button
                                  leftIcon={<AddIcon />}
                                  size="sm"
                                  colorScheme="gray"
                                  onClick={() => {
                                    if (activeCommentId !== null) return;
                                    handleAddComment(index)
                                  }
                                  }
                                  width="100%"
                                >
                                  Comment
                                </Button>
                                <Button
                                  leftIcon={<AddIcon />}
                                  size="sm"
                                  colorScheme="gray"
                                  width="100%"
                                  onClick={() => handleAddCustomRow(index)}
                                >
                                  Custom
                                </Button>
                              </VStack>
                              {format(
                                new Date(session.bookingDate),
                                "EEE. M/d/yy"
                              )}
                            </Td>

                            {/* Classroom */}
                            <Td
                              py={compactView ? 0 : 4}
                              fontSize={compactView ? "6.38" : "sm"}
                              borderBottom={
                                session.comments.length > 0 ? "none" : undefined
                              }
                            >
                              {session.name}
                            </Td>

                            {/* Rental hours */}
                            <Td
                              py={compactView ? 0 : 4}
                              fontSize={compactView ? "6.38" : "sm"}
                              borderBottom={
                                session.comments.length > 0 ? "none" : undefined
                              }
                            >
                              <Flex
                                align="center"
                                whiteSpace="nowrap"
                                overflow="hidden"
                                textOverflow="ellipsis"
                              >
                                <Text>
                                  {formatTimeString(session.startTime)}
                                </Text>
                                <Text>-</Text>
                                <Text>{formatTimeString(session.endTime)}</Text>
                              </Flex>
                            </Td>

                            <Td
                              py={compactView ? 0 : 4}
                              fontSize={compactView ? "6.38" : "sm"}
                              borderBottom={
                                session?.comments?.length > 0 ? "none" : undefined
                              }
                            >
                              {/* Adjust Button  */}
                              <Button
                                leftIcon={<PencilIcon color="black" />}
                                colorScheme="gray"
                                borderRadius="md"
                                px="3"
                                py="2"
                                fontSize="small"
                                height="32px"
                                opacity={
                                  activeRowId === null ||
                                    activeRowId === session.id
                                    ? 1
                                    : 0.3
                                }
                                onClick={() => setActiveRowId(index)}
                                isDisabled={
                                  activeRowId !== null && activeRowId !== index
                                }
                              >
                                Adjust
                              </Button>

                              {/* Room fee adjustments from sidebar */}
                              {session.adjustmentValues.filter(
                                (adj) =>
                                  adj.value !== 0 &&
                                  !Object.is(adj.value, -0)
                              ).length === 0 ? (
                                <Box
                                  display="inline-block"
                                  marginLeft="10px"
                                >
                                  None
                                </Box>
                              ) : (
                                <Box
                                  display="inline-block"
                                  marginLeft="10px"
                                >
                                  <Tooltip
                                    label={session.adjustmentValues
                                      .filter(
                                        (adj) =>
                                          adj.type !== "total" &&
                                          adj.value !== 0 &&
                                          !Object.is(adj.value, -0)
                                      )
                                      .map((adj) => {
                                        const value = Number(adj.value);
                                        const sign = value >= 0 ? "+" : "-";
                                        const isFlat = adj.type === "rate_flat";
                                        const absValue = Math.abs(value);
                                        return isFlat
                                          ? `${sign}$${absValue}`
                                          : `${sign}${absValue}%`;
                                      })
                                      .join(", ")}
                                    placement="top"
                                    bg="gray"
                                    w="auto"
                                  >
                                    <Text>
                                      {session.adjustmentValues
                                        .filter(
                                          (adj) =>
                                            adj.value !== 0 &&
                                            !Object.is(adj.value, -0)
                                        )
                                        .slice(0, 3)
                                        .map((adj) => {
                                          const value = Number(adj.value);
                                          const sign = value >= 0 ? "+" : "-";
                                          const isFlat =
                                            adj.type === "rate_flat";
                                          const absValue = Math.abs(value);
                                          return isFlat
                                            ? `${sign}$${absValue}`
                                            : `${sign}${absValue}%`;
                                        })
                                        .join(", ")}
                                      {session.adjustmentValues.filter(
                                        (adj) =>
                                          adj.value !== 0 &&
                                          !Object.is(adj.value, -0)
                                      ).length > 3
                                        ? ", ..."
                                        : ""}
                                    </Text>
                                  </Tooltip>
                                </Box>
                              )}

                              {/* Adjust Sidebar */}
                              <RoomFeeAdjustmentSideBar
                                isOpen={activeRowId === index}
                                onClose={() => setActiveRowId(null)}
                                userId={userId}
                                session={session}
                                sessions={sessions}
                                setSessions={setSessions}
                                sessionIndex={index}
                                subtotal={
                                  //   calculateTotalBookingRow(
                                  //   session.startTime,
                                  //   session.endTime,
                                  //   session.rate,
                                  //   session.adjustmentValues
                                  // )
                                  0
                                }
                                deletedIds={deletedIds}
                                setDeletedIds={setDeletedIds}
                              />
                            </Td>

                            {/* Adjustment type */}
                            <Td
                              py={compactView ? 0 : 4}
                              fontSize={compactView ? "6.38" : "sm"}
                              borderBottom={
                                session.comments.length > 0 ? "none" : undefined
                              }
                            >
                              <Text
                                h="40px"
                                p={compactView ? "0" : "2"}
                                display="flex"
                                alignItems="center"
                              >
                                ${calculateTotalBookingRow(
                                  "00:00:00+00",
                                  "01:00:00+00",
                                  calculateSummaryTotal(session?.rate, summary[0]?.adjustmentValues),
                                  session.adjustmentValues
                                )}/hr
                              </Text>
                            </Td>

                            {/* Total */}
                            <Td
                              py={compactView ? 0 : 4}
                              fontSize={compactView ? "6.38" : "sm"}
                              borderBottom={
                                session.comments.length > 0 ? "none" : undefined
                              }
                            >
                              <Flex
                                justifyContent="center"
                                alignItems="center"
                                gap={2}
                              >
                                <Text>$</Text>
                                <Text textAlign="center">
                                  {
                                    calculateTotalBookingRow(
                                      session.startTime,
                                      session.endTime,
                                      calculateSummaryTotal(session?.rate, summary[0]?.adjustmentValues),
                                      session.adjustmentValues
                                    )
                                  }
                                </Text>
                              </Flex>
                            </Td>
                          </Tr>

                          {/* Display all comments */}
                          {session.comments?.map((comment, commentIndex) => (
                            <React.Fragment key={`comment-${commentIndex}`}>
                              {activeCommentId ===
                                `${index}-${commentIndex}` ? (
                                <Tr>
                                  <Td
                                    colSpan={6}
                                    py={2}
                                  >
                                    <Input
                                      placeholder="Edit your comment..."
                                      value={commentText}
                                      onChange={(e) =>
                                        setCommentText(e.target.value)
                                      }
                                      onKeyDown={(e) =>
                                        handleKeyDown(e, index, commentIndex)
                                      }
                                      onBlur={(e) =>
                                        handleBlur(e, index, commentIndex)
                                      }
                                      size="sm"
                                      autoFocus
                                      borderColor="#A0AEC0"
                                      height="40px"
                                      _hover={{ borderColor: "#A0AEC0" }}
                                      _focus={{
                                        borderColor: "#A0AEC0",
                                        boxShadow: "none",
                                      }}
                                      rounded="lg"
                                      sx={{
                                        "&": {
                                          paddingY: "8",
                                        },
                                      }}
                                    />
                                  </Td>
                                </Tr>
                              ) : (
                                <Tr>
                                  <Td
                                    colSpan={6}
                                    py={2}
                                    textAlign="left"
                                    fontSize="sm"
                                    color="gray.600"
                                    position="relative"
                                    role="group"
                                  >
                                    <Flex
                                      alignItems="center"
                                      justifyContent="space-between"
                                    >
                                      <Box
                                        cursor="pointer"
                                        onClick={() => {
                                          if (activeCommentId !== null) return;
                                          setCommentText(comment.comment);
                                          handleEditComment(index, commentIndex)
                                        }
                                        }
                                        flex="1"
                                        pr={4}
                                        py="4"
                                        borderRadius="8"
                                      >
                                        {comment.comment}
                                      </Box>
                                      <IconButton
                                        icon={<CloseIcon boxSize={3} />}
                                        size="xs"
                                        variant="ghost"
                                        colorScheme="gray"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteComment(
                                            index,
                                            commentIndex
                                          );
                                        }}
                                        opacity="0"
                                        _groupHover={{ opacity: 1 }}
                                        aria-label="Delete comment"
                                        ml={2}
                                        minW="20px"
                                        height="20px"
                                      />
                                    </Flex>
                                  </Td>
                                </Tr>
                              )}
                            </React.Fragment>
                          ))}

                          {/* New comment input */}
                          {activeCommentId === index && (
                            <Tr>
                              <Td
                                colSpan={6}
                                py={2}
                              >
                                <Flex alignItems="center" gap={4}>
                                  <Input
                                    placeholder="Add your comment here..."
                                    value={commentText}
                                    onChange={(e) =>
                                      setCommentText(e.target.value)
                                    }
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    onBlur={(e) => handleBlur(e, index)}
                                    size="sm"
                                    autoFocus
                                    borderColor="#A0AEC0"
                                    height="40px"
                                    _hover={{ borderColor: "#A0AEC0" }}
                                    _focus={{
                                      borderColor: "#A0AEC0",
                                      boxShadow: "none",
                                    }}
                                    rounded="lg"
                                    sx={{
                                      "&": {
                                        paddingY: "8",
                                      },
                                    }}
                                  />
                                  <IconButton
                                    icon={<CloseIcon boxSize={3} />}
                                    size="xs"
                                    variant="ghost"
                                    colorScheme="gray"
                                    onClick={() => setActiveCommentId(null)}
                                  />
                                </Flex>
                              </Td>

                            </Tr>
                          )}

                          {session?.total?.map((total, totalIndex) => {
                            if (editingCustomRow === `${index}-${totalIndex}`) {
                              return (
                                <Tr ref={editRowRef}>
                                  <Td
                                    colSpan={6}
                                    py={2}
                                  >
                                    <Flex
                                      gap={4}
                                      alignItems="center"
                                    >
                                      <Input
                                        type="date"
                                        value={editCustomDate}
                                        onChange={(e) =>
                                          setEditCustomDate(e.target.value)
                                        }
                                        size="sm"
                                        width="fit-content"
                                        py="6"
                                        rounded="md"
                                        textAlign="center"
                                        onKeyDown={(e) =>
                                          handleCustomRowKeyDown(e, index, totalIndex)
                                        }
                                      />
                                      <Input
                                        placeholder="Description"
                                        value={editCustomText}
                                        onChange={(e) =>
                                          setEditCustomText(e.target.value)
                                        }
                                        size="sm"
                                        flex={1}
                                        py="6"
                                        rounded="md"
                                        border="none"
                                        onKeyDown={(e) =>
                                          handleCustomRowKeyDown(e, index, totalIndex)
                                        }
                                        onBlur={(e) => {
                                          if (editCustomText.trim() === "") {
                                            handleDeleteCustomRow(index, totalIndex)
                                          } else {
                                            handleSaveCustomRow(index, totalIndex)
                                          }
                                        }}
                                      />
                                      <InputGroup
                                        size="sm"
                                        width="fit-content"
                                        alignItems="center"
                                      >
                                        <Text mr={2}>$</Text>
                                        <Input
                                          type="number"
                                          value={editCustomAmount}
                                          onChange={(e) =>
                                            setEditCustomAmount(e.target.value)
                                          }
                                          width="9ch"
                                          py="6"
                                          rounded="md"
                                          textAlign="center"
                                          onKeyDown={(e) =>
                                            handleCustomRowKeyDown(e, index, totalIndex)
                                          }
                                        />
                                      </InputGroup>
                                      <IconButton
                                        icon={<CloseIcon boxSize={3} />}
                                        size="xs"
                                        variant="ghost"
                                        colorScheme="gray"
                                        onClick={() => handleDeleteCustomRow(index, totalIndex)}
                                      />
                                    </Flex>
                                  </Td>
                                </Tr>
                              );
                            } else {
                              return (
                                <Tr
                                  position="relative"
                                  cursor="pointer"
                                  _hover={{ bg: "gray.50" }}
                                  role="group"
                                  onClick={() =>
                                    handleEditCustomRow(
                                      session,
                                      index,
                                      totalIndex
                                    )
                                  }
                                >
                                  <Td
                                    py="6"
                                  >
                                    {(() => {
                                      const date = new Date(
                                        session.total[totalIndex].date
                                      );
                                      date.setMinutes(
                                        date.getMinutes() +
                                        date.getTimezoneOffset()
                                      );
                                      return format(date, "EEE. M/d/yy");
                                    })()}
                                  </Td>
                                  <Td
                                    colSpan={4}
                                  >
                                    {session.total[totalIndex]?.comment}
                                  </Td>
                                  <Td
                                    textAlign="right"
                                    position="relative"
                                  >
                                    <Flex
                                      justifyContent="flex-end"
                                      alignItems="center"
                                    >
                                      <Text mr={1}>$</Text>
                                      <Text
                                      >
                                        {Number(
                                          session?.total?.[totalIndex]?.value || 0
                                        ).toFixed(2)}
                                      </Text>
                                      <IconButton
                                        icon={<CloseIcon boxSize={3} />}
                                        size="xs"
                                        variant="ghost"
                                        colorScheme="gray"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteCustomRow(
                                            index,
                                            totalIndex
                                          );
                                        }}
                                        display="none"
                                        _groupHover={{ display: "inline-flex", width: "20px" }}
                                        aria-label="Delete custom row"
                                        ml={2}
                                      />
                                    </Flex>

                                  </Td>
                                </Tr>
                              );
                            }
                          })}
                        </React.Fragment>
                      );
                    })
                ) : (
                  <Tr py="4">
                    <Td
                      colSpan={6}
                      textAlign="center"
                      fontSize={compactView && "8.509px"}
                    >
                      No comments available.
                    </Td>
                  </Tr>
                )}

                <Tr py={compactView ? 0 : 4}>
                  <Td
                    textAlign="right"
                    colSpan={5}
                    fontWeight="bold"
                    fontSize={compactView ? "6.38" : "sm"}
                  >
                    Subtotal
                  </Td>
                  <Td
                    borderBottom="none"
                    py={compactView ? "0" : "8"}
                    textAlign="center"
                    fontSize={compactView ? "6.38" : "sm"}
                  >
                    {`$ ${calculateSubtotal(sessions)}`}
                  </Td>
                </Tr>
              </Tbody>
            </Table>
          </Box>
        </Flex>
      </Box>
    </Flex>
  );
};

const InvoiceSummary = ({
  pastDue,
  subtotal,
  onSubtotalChange,
  room,
  setRoom,
  compactView = false,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { sessions,
    setSessions,
    addSession,
    deleteSession,
    addComment,
    setComment,
    deleteComment,
    addCustomRow,
    setCustomRow,
    deleteCustomRow,
  } = useSessionStore();
  const { summary, setSummary, summaryTotal, setSummaryTotal, addTotal, setTotal, deleteTotal } = useSummaryStore();
  const { addDeletedId, deletedIds } = useDeletedIdsStore();
  const [editingCustomRow, setEditingCustomRow] = useState(null);
  const [editCustomDate, setEditCustomDate] = useState("");
  const [editCustomText, setEditCustomText] = useState("");
  const [editCustomAmount, setEditCustomAmount] = useState("");
  const [editCustomId, setEditCustomId] = useState(null);
  const editRowRef = useRef(null);

  const calculateTotalBookingRow = (rate, adjustmentValues) => {
    if (!rate) return "0.00";

    const baseRate = Number(rate);
    if (isNaN(baseRate)) return "0.00";

    const adjustedTotal = (adjustmentValues || []).reduce((acc, val) => {
      if (isNaN(val.value)) return acc;

      if (val.type === "rate_percent") {
        const factor = 1 + val.value / 100;
        return acc * factor;
      } else {
        return acc + Number(val.value);
      }
    }, baseRate);

    return Number(adjustedTotal).toFixed(2);
  };

  const handleEditCustomRow = (session, index, totalIndex) => {
    if (editingCustomRow !== null) return;

    setEditingCustomRow(`summary-total-${totalIndex}`);

    const date = new Date(summary[0].total[totalIndex].date);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());

    setEditCustomDate(formatDateForInput(summary[0].total[totalIndex].date));
    setEditCustomText(summary[0].total[totalIndex]?.comment || "");
    setEditCustomAmount(summary[0].total[totalIndex].value.toString());

    // Store the ID of the row being edited to preserve it
    setEditCustomId(summary[0].total[totalIndex]?.id || null);
  };

  const formatDateForInput = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value.split("T")[0];
    try {
      return new Date(value).toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  const handleSaveCustomRow = (totalIndex) => {
    if (!editCustomDate || !editCustomText || !editCustomAmount) return;
    
    setTotal({
      id: editCustomId, // Preserve the original ID
      date: editCustomDate,
      value: editCustomAmount,
      comment: editCustomText,
    }, totalIndex);

    setEditingCustomRow(null);
    setEditCustomDate(new Date().toISOString().split("T")[0]);
    setEditCustomText("");
    setEditCustomAmount("");
    setEditCustomId(null); // Reset the ID
  };

  const handleCustomRowKeyDown = (e, totalIndex) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      handleSaveCustomRow(totalIndex);
    }
  };

  const handleDeleteCustomRow = (totalIndex) => {
    deleteTotal(summary[0].total[totalIndex].id);

    // Reset editing state
    setEditingCustomRow(null);
    setEditCustomDate(new Date().toISOString().split("T")[0]);
    setEditCustomText("");
    setEditCustomAmount("");
    setEditCustomId(null); // Reset the ID

    // If the total item had an ID, add it to deletedIds
    const totalItem = summary[0]?.total[totalIndex];
    if (totalItem?.id && !isNaN(totalItem.id)) {
      addDeletedId(totalItem.id);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (editRowRef.current && !editRowRef.current.contains(event.target)) {
        if (editingCustomRow !== null) {
          const [sessionIndex, totalIndex] = editingCustomRow.split("-");
          handleSaveCustomRow(
            parseInt(sessionIndex),
            parseInt(totalIndex)
          );
        }
      }
    };

    if (editingCustomRow !== null) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [editingCustomRow, editCustomDate, editCustomText, editCustomAmount, editCustomId]);

  const totalCustomRow = summary[0]?.total?.reduce((acc, total) => {
    return acc + Number(total.value);
  }, 0) || 0;

  return (
    <Flex
      direction="column"
      w="100%"
      minH="24"
      fontFamily="Inter"
      color="#2D3748"
      mt={8}
    >
      <HStack align="baseline">
        <BookWithBookmarkIcon />
        <Heading
          mb="2"
          size={compactView ? "11.7px" : "md"}
        >
          Summary
        </Heading>
      </HStack>
      <Flex
        border="1px solid #D2D2D2"
        borderRadius="9.57px"
        minH="24"
        px="12px"
      >
        <Box width="100%">
          <Table
            color="#EDF2F7"
            width="100%"
            textAlign="center"
            size="sm"
          >
            {/* header row */}
            <Thead color="#4A5568">
              <Tr>
                <Th
                  colSpan={4}
                  textTransform="none"
                  fontSize={compactView ? "6.38px" : "sm"}
                  py={compactView ? "4" : "8"}
                >
                  <Flex
                    color="#718096"
                    align="center"
                  >
                    <DollarSignIcon
                      width={compactView ? "12" : "20"}
                      height={compactView ? "12" : "20"}
                    />
                    <Text fontSize={compactView ? "6.38px" : "sm"}>
                      DESCRIPTION
                    </Text>
                  </Flex>
                </Th>
                <Th
                  textTransform="none"
                  fontSize={compactView ? "6.38px" : "sm"}
                >
                  <Flex
                    color="#718096"
                    align="center"
                  >
                    <EditDocumentIcon
                      width={compactView ? "8" : "16"}
                      height={compactView ? "10" : undefined}
                    />
                    <Text
                      fontSize={compactView ? "6.38px" : "sm"}
                      ml="4px"
                    >
                      ROOM FEE ADJUSTMENT
                    </Text>
                  </Flex>
                </Th>
                <Th
                  textTransform="none"
                  textAlign="end"
                  py={compactView ? 0 : 4}
                  fontSize={compactView ? "6.38px" : "sm"}
                  color="#718096"
                >
                  TOTAL
                </Th>
              </Tr>
            </Thead>

            <Tbody color="#2D3748">
              {/* Room Fee Header Row */}
              <Tr p="40">
                <Td
                  borderBottom="none"
                  fontSize={compactView ? "6.38px" : "sm"}
                  py={compactView ? "2" : "8"}
                  colSpan={4}
                >
                  Room Fee
                </Td>
                <Td borderBottom="none">
                  <Flex gap={2} align="center">
                    <Button
                      // onClose={() => setActiveRowId(null)}
                      leftIcon={<PencilIcon color="black" />}
                      colorScheme="gray"
                      borderRadius="md"
                      px="3"
                      py="2"
                      fontSize="small"
                      height="32px"
                      onClick={onOpen}
                    >
                      Adjust
                    </Button>
                    <Button
                      // onClose={() => setActiveRowId(null)}
                      leftIcon={<AddIcon color="black" />}
                      colorScheme="gray"
                      borderRadius="md"
                      px="3"
                      py="2"
                      fontSize="small"
                      height="32px"
                      onClick={() => {
                        addTotal({
                          id: `summary-total-${summary[0]?.total?.length || 0}`,
                          value: "0.00",
                          comment: "Custom Row",
                          date: new Date().toISOString()
                        });
                      }}
                    >
                      Add Custom Row
                    </Button>
                    {summary?.[0] && (
                      <SummaryFeeAdjustmentSideBar
                        isOpen={isOpen}
                        onClose={onClose}
                        summary={summary?.[0]}
                        // setSummary={setSummary}
                        subtotal={subtotal}
                        session={sessions[0]}
                      />
                    )}
                    <Tooltip
                      label="Room fee adjustments in Summary will be apply to all Sessions."
                      placement="top"
                      bg="gray"
                    >
                      <InfoOutlineIcon ml={2} />
                    </Tooltip>
                  </Flex>
                </Td>
              </Tr>
              {/* Room Fee Body Row */}

              {/* Custom rows don't have room names, so that's why we filter them out to avoid showing custom rows in the summary */}
              {Object.values(
                (Array.isArray(sessions) ? sessions : [])
                  .filter(
                    (session) =>
                      session.name?.length > 0 &&
                      session.adjustmentValues[0]?.type !== "total" &&
                      session.adjustmentValues[0]?.type !== "none"
                  )
                  .reduce((acc, session) => {
                    // Use session name as key to remove duplicates
                    if (!acc[session.name]) {
                      acc[session.name] = {
                        ...session,
                        rate: session.rate
                      };
                    }
                    return acc;
                  }, {})
              ).map((session, key, array) => (
                <Tr key={key}>
                  <Td
                    pl="16"
                    fontSize={compactView ? "6.38px" : "sm"}
                    py={compactView ? 2 : 4}
                    borderBottom={key === array.length - 1 ? undefined : "none"}
                    colSpan={4}
                  >
                    {session.name}
                  </Td>
                  <Td
                    fontSize={compactView ? "6.38px" : "sm"}
                    py={compactView ? 2 : 4}
                    borderBottom={key === array.length - 1 ? undefined : "none"}
                  >
                    {!summary || summary[0]?.adjustmentValues.filter(
                      (adj) =>
                        adj.value !== 0 &&
                        !Object.is(adj.value, -0) &&
                        Number(adj.value) !== 0
                    ).length === 0 ? (
                      "None"
                    ) : (
                      <Box display="inline-block">
                        <Tooltip
                          label={summary[0]?.adjustmentValues.filter(
                            (adj) =>
                              adj.value !== 0 &&
                              !Object.is(adj.value, -0) &&
                              Number(adj.value) !== 0
                          ).length > 0
                            ? summary[0]?.adjustmentValues

                              .map((adj) => {
                                const sign = adj.value < 0 ? "-" : "+";
                                const isFlat = adj.type === "rate_flat";
                                const absValue = Math.abs(adj.value);
                                if (absValue === 0) return "None";
                                return isFlat
                                  ? `${sign}$${absValue}`
                                  : `${sign}${absValue}%`;
                              })
                              .join(", ") : "None"}
                          placement="top"
                          bg="gray"
                          w="auto"
                        >
                          <Text textOverflow="ellipsis" overflow="hidden">
                            {summary[0]?.adjustmentValues.filter(
                              (adj) =>
                                adj.value !== 0 &&
                                !Object.is(adj.value, -0) &&
                                Number(adj.value) !== 0
                            ).length > 0
                              ? summary[0]?.adjustmentValues
                                .filter((adj) => adj.value !== 0 && !Object.is(adj.value, -0) && Number(adj.value) !== 0)
                                .map((adj) => {
                                  const sign = adj.value < 0 ? "-" : "+";
                                  const isFlat = adj.type === "rate_flat";
                                  const absValue = Math.abs(adj.value);
                                  return isFlat
                                    ? `${sign}$${absValue}`
                                    : `${sign}${absValue}%`;
                                })
                                .join(", ") : "None"}
                          </Text>
                        </Tooltip>
                      </Box>
                    )}
                  </Td>
                  <Td
                    textAlign="end"
                    py={compactView ? 0 : 4}
                    fontSize={compactView ? "6.38px" : "sm"}
                    borderBottom={key === array.length - 1 ? undefined : "none"}
                  >
                    <HStack spacing={1} justify="end">
                      <Box as="span">$</Box>
                      <Input
                        value={calculateTotalBookingRow(session.rate, summary[0]?.adjustmentValues)}
                        readOnly={true}
                        w="8ch"
                        textAlign="center"
                        px={1}
                      />
                      <Box as="span">/hr</Box>
                    </HStack>
                  </Td>
                </Tr>
              ))}
              {/* past due balance row */}

              {summary[0]?.total?.map((total, totalIndex) => {
                if (editingCustomRow === `summary-total-${totalIndex}`) {
                  return (
                    <Tr key={totalIndex} ref={editRowRef}>
                      <Td
                        colSpan={6}
                        py={2}
                      >
                        <Flex
                          gap={4}
                          alignItems="center"
                        >
                          <Input
                            type="date"
                            value={editCustomDate}  
                            onChange={(e) =>
                              setEditCustomDate(e.target.value)
                            }
                            size="sm"
                            width="fit-content"
                            py="6"
                            rounded="md"
                            textAlign="center"
                            onKeyDown={(e) =>
                              handleCustomRowKeyDown(e, totalIndex)
                            }
                          />
                          <Input
                            placeholder="Description"
                            value={editCustomText}
                            onChange={(e) =>
                              setEditCustomText(e.target.value)
                            }
                            size="sm"
                            flex={1}
                            py="6"
                            rounded="md"
                            border="none"
                            onKeyDown={(e) =>
                              handleCustomRowKeyDown(e, 0, totalIndex)
                            }
                            onBlur={(e) => {
                              if (editCustomText.trim() === "") {
                                handleDeleteCustomRow(totalIndex)
                              } else {
                                handleSaveCustomRow(totalIndex)
                              }
                            }}
                          />
                          <InputGroup
                            size="sm"
                            width="fit-content"
                            alignItems="center"
                          >
                            <Text mr={2}>$</Text>
                            <Input
                              type="number"
                              value={editCustomAmount}
                              onChange={(e) =>
                                setEditCustomAmount(e.target.value)
                              }
                              width="9ch"
                              py="6"
                              rounded="md"
                              textAlign="center"
                              onKeyDown={(e) =>
                                handleCustomRowKeyDown(e, totalIndex)
                              }
                            />
                          </InputGroup>
                          <IconButton
                            icon={<CloseIcon boxSize={3} />}
                            size="xs"
                            variant="ghost"
                            colorScheme="gray"
                            onClick={() => handleDeleteCustomRow(totalIndex)}
                          />
                        </Flex>
                      </Td>
                    </Tr>
                  );
                } else {
                  return (
                    <Tr
                      position="relative"
                      cursor="pointer"
                      _hover={{ bg: "gray.50" }}
                      role="group"
                      onClick={() =>
                        handleEditCustomRow(
                          summary[0],
                          0,
                          totalIndex
                        )
                      }
                    >
                      <Td
                        py="6"
                      >
                        {(() => {
                          const date = new Date(
                            summary[0]?.total[totalIndex].date
                          );
                          date.setMinutes(
                            date.getMinutes() +
                            date.getTimezoneOffset()
                          );
                          return format(date, "EEE. M/d/yy");
                        })()}
                      </Td>
                      <Td
                        colSpan={4}
                      >
                        {summary[0]?.total[totalIndex]?.comment}
                      </Td>
                      <Td
                        textAlign="right"
                        position="relative"
                      >
                        <Flex
                          justifyContent="flex-end"
                          alignItems="center"
                        >
                          <Text mr={1}>$</Text>
                          <Text
                          >
                            {Number(
                              summary[0]?.total?.[totalIndex]?.value || 0
                            ).toFixed(2)}
                          </Text>
                          <IconButton
                            icon={<CloseIcon boxSize={3} />}
                            size="xs"
                            variant="ghost"
                            colorScheme="gray"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCustomRow(totalIndex)
                            }}
                            display="none"
                            _groupHover={{ display: "inline-flex", width: "20px" }}
                            aria-label="Delete custom row"
                            ml={2}
                          />
                        </Flex>

                      </Td>
                    </Tr>
                  );
                }
              })}

              <Tr>
                <Td
                  colSpan={4}
                  fontSize={compactView ? "6.38px" : "sm"}
                  py={compactView ? "2" : "8"}
                >
                  Past Due Balance
                </Td>
                <Td></Td>
                <Td
                  textAlign="end"
                  py={compactView ? 0 : 4}
                  fontSize={compactView ? "6.38px" : "sm"}
                >
                  $ {pastDue.toFixed(2)}
                </Td>
              </Tr>

              {/* current statement balance row */}
              <Tr>
                <Td
                  colSpan={4}
                  py={compactView ? 0 : 4}
                  fontSize={compactView ? "6.38px" : "sm"}
                >
                  Current Statement Subtotal
                </Td>
                <Td
                  py={compactView ? 0 : 4}
                  fontSize={compactView ? "6.38px" : "sm"}
                ></Td>
                <Td
                  textAlign="end"
                  py={compactView ? 0 : 4}
                  fontSize={compactView ? "6.38px" : "sm"}
                >
                  {`$ ${(Number(subtotal) + Number(totalCustomRow)).toFixed(2)}`}
                </Td>
              </Tr>

              {/* total row */}
              <Tr>
                <Td
                  textAlign="right"
                  colSpan={5}
                  fontWeight="700"
                  fontSize={compactView ? "6.38px" : "sm"}
                  color="#718096"
                >
                  TOTAL AMOUNT DUE
                </Td>
                <Td
                  fontWeight="700"
                  borderBottom="none"
                  textAlign="end"
                  fontSize={compactView ? "6.38px" : "2xl"}
                  py={compactView ? 0 : 8}
                >
                  {`$ ${(parseFloat(pastDue) + parseFloat(subtotal) + parseFloat(totalCustomRow)).toFixed(2)}`}
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </Box>
      </Flex>
    </Flex>
  );
};

const FooterDescription = ({ compactView = false }) => {
  return (
    <Flex
      mt={compactView ? "4" : "16"}
      justifyContent="space-between"
      gap={10}
      color="black"
      mx={compactView ? "2" : "16"}
    >
      {/* left text */}
      <VStack
        pt={3}
        pb={2}
        spacing={0}
        align="start"
        mb={10}
      >
        <Text
          fontWeight="bold"
          fontSize={compactView ? "6.51px" : "md"}
        >
          Payments are due at the end of each month.
        </Text>
        <Text
          fontWeight="bold"
          fontSize={compactView ? "6.51px" : "md"}
        >
          You can make your payment at:{" "}
          <Link
            color="blue.500"
            href="https://lapena.org/payment"
          >
            lapena.org/payment
          </Link>
        </Text>
      </VStack>

      {/* right text */}
      <VStack
        pt={3}
        pb={2}
        spacing={0}
        align="start"
        mb={10}
      >
        <Text
          fontWeight="bold"
          fontSize={compactView ? "6.51px" : "md"}
        >
          For any questions,
        </Text>
        <Text
          fontWeight="bold"
          fontSize={compactView ? "6.51px" : "md"}
        >
          please contact:{" "}
          <Link
            href="mailto:classes@lapena.org"
            style={{ textDecoration: "underline" }}
            color="blue.500"
            fontSize={compactView ? "6.51px" : "md"}
          >
            classes@lapena.org
          </Link>
        </Text>
      </VStack>
    </Flex>
  );
};

export {
  StatementComments,
  EditInvoiceTitle,
  EditInvoiceDetails,
  InvoiceSummary,
  FooterDescription,
};
