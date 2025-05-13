import React, { useEffect, useRef, useState } from "react";

import { AddIcon, ChevronDownIcon, CloseIcon } from "@chakra-ui/icons";
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
import { RoomFeeAdjustmentSideBar, SummaryFeeAdjustmentSideBar } from "./RoomFeeAdjustmentSideBar";
import { collapseTextChangeRangesAcrossMultipleVersions } from "typescript";

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
    return invoice["startDate"];
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
          {getGeneratedDate(comments, invoice, false)}
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
                    {instructor.name} - {instructor.email}
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

// TODO
// ! - Fix Current Statement Total in EditInvoice being different that SavedInvoice
// ! - Save Edits to Invoice alert modal
// ! - Fix summary room fee changing session rate -> needs to be passed into sessions with the summary adjustment values -> should be local state
const StatementComments = ({
  invoice,
  compactView = false,
  sessions = [],
  setSessions,
  setSubtotal
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
  const editRowRef = useRef(null);

  // console.log("sessions", sessions);

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
          handleSaveCustomRow(editingCustomRow);
        }
      }
    };

    if (editingCustomRow !== null) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [editingCustomRow, editCustomDate, editCustomText, editCustomAmount]);

  const calculateTotalBookingRow = (startTime, endTime, rate, adjustmentValues) => {
    if (!startTime || !endTime || !rate) return "0.00";

    const timeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const rawStart = timeToMinutes(startTime.substring(0, 5));
    const rawEnd = timeToMinutes(endTime.substring(0, 5));
    const endAdjusted = rawEnd <= rawStart ? rawEnd + 24 * 60 : rawEnd;
    const durationInHours = (endAdjusted - rawStart) / 60;

    const baseRate = Number(rate);

    const adjustedRate = adjustmentValues.reduce((currentRate, val) => {
      const isNegative = val.startsWith("-");
      const numericPart = parseFloat(val.replace(/[+$%-]/g, ""));
      if (isNaN(numericPart)) return currentRate;

      const adjustmentAmount = val.includes("$")
        ? numericPart
        : val.includes("%")
          ? (numericPart / 100) * currentRate
          : 0;

      return isNegative ? currentRate - adjustmentAmount : currentRate + adjustmentAmount;
    }, baseRate);

    const total = adjustedRate * durationInHours;
    return total.toFixed(2);
  };

  const calculateSubtotal = (sessions) => {
    if (!sessions || sessions.length === 0) return "0.00";

    const totalSum = sessions.reduce((acc, session) => {
      // For total adjustment sessions, use the total value directly
      if (session.id && session.id.toString().startsWith('total-')) {
        return acc + parseFloat(session.total || 0);
      }
      
      // For regular sessions, calculate as before
      const total = parseFloat(
        calculateTotalBookingRow(
          session.startTime,
          session.endTime,
          session.rate,
          session.adjustmentValues
        )
      );
      return acc + total;
    }, 0);

    const total = totalSum.toFixed(2);
    setSubtotal(total);
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

  // Room Fee Per Hour After Adjustments
  const calculateNewRate = (session) => {
    let newRate = Number(session.rate || 0);

    session.adjustmentValues.forEach((val) => {
      const isNegative = val.startsWith("-");
      const numericPart = parseFloat(val.replace(/[+$%-]/g, "")) || 0;

      let adjustmentAmount = 0;

      if (val.includes("$")) {
        adjustmentAmount = numericPart;
      } else if (val.includes("%")) {
        adjustmentAmount = (numericPart / 100) * Number(newRate || 0);
      }

      if (isNegative) {
        newRate -= adjustmentAmount;
      } else {
        newRate += adjustmentAmount;
      }
    });

    return newRate;
  };

  const saveComment = (sessionId, commentIndex = null) => {
    if (!commentText.trim()) {
      setActiveCommentId(null);
      setCommentText("");
      return;
    }

    setSessions(prevSessions => {
      return prevSessions.map(session => {
        if (session.id === sessionId) {
          const comments = session.comments || [];
          if (commentIndex !== null) {
            // Edit existing comment
            const newComments = [...comments];
            newComments[commentIndex] = commentText;
            return {
              ...session,
              comments: newComments
            };
          } else {
            // Add new comment
            return {
              ...session,
              comments: [...comments, commentText]
            };
          }
        }
        return session;
      });
    });
    setActiveCommentId(null);
    setCommentText("");
  };

  const handleAddComment = (sessionId) => {
    if (activeCommentId === sessionId) {
      saveComment(sessionId);
    } else {
      setCommentText("");
      setActiveCommentId(sessionId);
    }
  };

  const handleEditComment = (sessionId, commentIndex) => {
    const session = sessions.find(s => s.id === sessionId);
    setCommentText(session?.comments[commentIndex] || "");
    setActiveCommentId(`${session.id}-${commentIndex}`);
  };

  const handleKeyDown = (e, sessionId, commentIndex = null) => {
    if (e.key === 'Enter') {
      saveComment(sessionId, commentIndex);
    }
  };

  const handleBlur = (e, sessionId, commentIndex = null) => {
    // Small timeout to allow clicking on buttons
    setTimeout(() => {
      if (activeCommentId) {
        saveComment(sessionId, commentIndex);
      }
    }, 100);
  };

  const handleDeleteComment = (sessionId, commentIndex) => {
    setSessions(prevSessions => {
      return prevSessions.map(session => {
        if (session.id === sessionId) {
          const newComments = [...(session.comments || [])];
          newComments.splice(commentIndex, 1);
          return {
            ...session,
            comments: newComments
          };
        }
        return session;
      });
    });
  };

  const handleAddCustomRow = (session) => {
    const newSession = {
      // TODO Can change id to be more like other sessions, just need to find max of all other ids and increment
      id: `custom-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      datetime: new Date().toISOString().split('T')[0],
      comments: [editCustomText],
      rate: editCustomAmount,
      adjustmentType: "total",
      // Keeping the start time and end time to allow calculation of the subtotal
      userId: session.userId,
      startTime: "00:00",
      endTime: "01:00",
      adjustmentValues: [],
      archived: session.archived,
      bookingId: session.bookingId,
      name: "",
    };

    setSessions(prev => [...prev, newSession]);
    setEditingCustomRow(newSession.id);
    setEditCustomDate(newSession.date);
    setEditCustomText('');
    setEditCustomAmount('0');
  };

  const handleEditCustomRow = (session) => {
    setEditingCustomRow(session.id);
    const date = new Date(session.date);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    setEditCustomDate(date.toISOString().split('T')[0]);
    setEditCustomText(session.comments[0]);
    setEditCustomAmount(session.rate.toString());
  };

  const handleSaveCustomRow = (sessionId) => {
    if (!editCustomDate || !editCustomText || !editCustomAmount) return;

    setSessions(prevSessions => prevSessions.map(session => {
      if (session.id === sessionId) {
        const date = new Date(editCustomDate);
        date.setMinutes(date.getMinutes() + date.getTimezoneOffset());

        return {
          ...session,
          date: date,
          datetime: date,
          startTime: "00:00",
          endTime: "01:00",
          bookingId: session.bookingId,
          comments: [editCustomText],
          rate: parseFloat(editCustomAmount)
        };
      }
      return session;
    }));
    setEditingCustomRow(null);
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
        <Flex border="1px solid #D2D2D2" borderRadius="9.57px" minH="24" px="12px">
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
                      <CalendarIcon width={compactView && "8"} />
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
                        height={compactView && "10"}
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
                        height={compactView && "10"}
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
                {sessions && sessions.length > 0 ? (
                  sessions.map((session, index) => {
                    // Check if this is a total adjustment session
                    if (session.id && session.id.toString().startsWith('total-')) {
                      return (
                        <React.Fragment key={session.id || index}>
                            <Tr ref={editRowRef}>
                              <Td colSpan={6} py={2}>
                                <Flex gap={4} alignItems="flex-end">
                                  <Text
                                    type="date"
                                    size="sm"
                                    width="fit-content"
                                    py="6"
                                    rounded="md"
                                    textAlign="center"
                                  >{format(new Date(session.date), "EEE. M/d/yy")}</Text>
                                  <Text
                                    size="sm"
                                    flex={1}
                                    py="6"
                                    rounded="md"
                                    border="none"
                                  >{session.comments[0]}</Text>
                                  <HStack alignItems="center" gap="0">
                                    <Text>$</Text>
                                    <Text
                                      value={editCustomAmount}
                                      width="9ch"
                                      py="6"
                                      rounded="md"
                                      textAlign="center"
                                    >{Number(session.adjustmentValues[0]).toFixed(2)}</Text>
                                  </HStack>
                                </Flex>
                              </Td>
                            </Tr>
                        </React.Fragment>
                      );
                    } else if (String(session.id).includes("custom")) {
                      // Handle existing custom rows
                      return (
                        <React.Fragment key={session.id || index}>
                          {editingCustomRow === session.id ? (
                            <Tr ref={editRowRef}>
                              <Td colSpan={6} py={2}>
                                <Flex gap={4} alignItems="flex-end">
                                  <Input
                                    type="date"
                                    value={editCustomDate}
                                    onChange={(e) => setEditCustomDate(e.target.value)}
                                    size="sm"
                                    width="fit-content"
                                    py="6"
                                    rounded="md"
                                    textAlign="center"
                                  />
                                  <Input
                                    placeholder="Description"
                                    value={editCustomText}
                                    onChange={(e) => setEditCustomText(e.target.value)}
                                    size="sm"
                                    flex={1}
                                    py="6"
                                    rounded="md"
                                    border="none"
                                  />
                                  <InputGroup size="sm" width="fit-content" alignItems="center">
                                    <Text>$</Text>
                                    <Input
                                      type="number"
                                      value={editCustomAmount}
                                      onChange={(e) => setEditCustomAmount(e.target.value)}
                                      width="9ch"
                                      py="6"
                                      rounded="md"
                                      textAlign="center"
                                    />
                                  </InputGroup>
                                </Flex>
                              </Td>
                            </Tr>
                          ) : (
                            <Tr
                              position="relative"
                              cursor="pointer"
                              onClick={() => handleEditCustomRow(session)}
                              _hover={{ bg: "gray.50" }}
                            >
                              <Td py="6">{format(new Date(session.datetime), "EEE. M/d/yy")}</Td>
                              <Td colSpan={4}>{session.comments[0]}</Td>
                              <Td textAlign="right">$ {Number(session.rate).toFixed(2)}</Td>
                            </Tr>
                          )}
                        </React.Fragment>
                      );
                    }
                    
                    // Handle regular session rows
                    return (
                      <React.Fragment key={session.id || index}>
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
                              opacity={hoveredRowIndex === index || activeCommentId === session.id ? 1 : 0}
                              transition="opacity 0.2s"
                              alignItems="flex-end"
                              width="100px"
                            >
                              <Button
                                leftIcon={<AddIcon />}
                                size="sm"
                                colorScheme="gray"
                                onClick={() => handleAddComment(session.id)}
                                width="100%"
                              >
                                Comment
                              </Button>
                              <Button
                                leftIcon={<AddIcon />}
                                size="sm"
                                colorScheme="gray"
                                width="100%"
                                onClick={() => handleAddCustomRow(session)}
                              >
                                Custom
                              </Button>
                            </VStack>
                            {format(new Date(session.datetime), "EEE. M/d/yy")}
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
                              <Text>{formatTimeString(session.startTime)}</Text>
                              <Text>-</Text>
                              <Text>{formatTimeString(session.endTime)}</Text>
                            </Flex>
                          </Td>

                          <Td
                            py={compactView ? 0 : 4}
                            fontSize={compactView ? "6.38" : "sm"}
                            borderBottom={
                              session.comments.length > 0 ? "none" : undefined
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
                              onClick={() => setActiveRowId(session.id)}
                              isDisabled={
                                activeRowId !== null &&
                                activeRowId !== session.id
                              }
                            >
                              Adjust
                            </Button>

                            {/* Room fee adjustments from sidebar */}
                            {session.adjustmentValues.length === 0 ? (
                              "None"
                            ) : (
                              <Box display="inline-block" marginLeft="10px">
                                <Tooltip
                                  label={session.adjustmentValues.join(", ")}
                                  placement="top"
                                  bg="gray"
                                  w="auto"
                                >
                                  <Text>
                                    {session.adjustmentValues
                                      .slice(0, 3)
                                      .join(", ")}
                                    {session.adjustmentValues.length > 3
                                      ? ", ..."
                                      : ""}
                                  </Text>
                                </Tooltip>
                              </Box>
                            )}

                            {/* Adjust Sidebar */}
                            <RoomFeeAdjustmentSideBar
                              isOpen={activeRowId === session.id}
                              onClose={() => setActiveRowId(null)}
                              invoice={invoice[0]}
                              userId={userId}
                              session={session}
                              setSessions={setSessions}
                              sessionIndex={index}
                              subtotal={calculateTotalBookingRow(
                                session.startTime,
                                session.endTime,
                                session.rate,
                                session.adjustmentValues
                              )}
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
                              ${calculateNewRate(session).toFixed(2)}/hr
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
                                {calculateTotalBookingRow(
                                  session.startTime,
                                  session.endTime,
                                  session.rate,
                                  session.adjustmentValues
                                )}
                              </Text>
                            </Flex>
                          </Td>
                        </Tr>

                        {/* Display all comments */}
                        {session.comments?.map((comment, commentIndex) => (
                          <React.Fragment key={`comment-${commentIndex}`}>
                            {activeCommentId === `${session.id}-${commentIndex}` ? (
                              <Tr>
                                <Td colSpan={6} py={2}>
                                  <Input
                                    placeholder="Edit your comment..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, session.id, commentIndex)}
                                    onBlur={(e) => handleBlur(e, session.id, commentIndex)}
                                    size="sm"
                                    autoFocus
                                    borderColor="#A0AEC0"
                                    height="40px"
                                    _hover={{ borderColor: "#A0AEC0" }}
                                    _focus={{ borderColor: "#A0AEC0", boxShadow: "none" }}
                                    rounded="lg"
                                    sx={{
                                      '&': {
                                        paddingY: '8'
                                      }
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
                                      onClick={() => handleEditComment(session.id, commentIndex)}
                                      flex="1"
                                      pr={4}
                                      py="4"
                                      borderRadius="8"
                                    >
                                      {comment}
                                    </Box>
                                    <IconButton
                                      icon={<CloseIcon boxSize={3} />}
                                      size="xs"
                                      variant="ghost"
                                      colorScheme="gray"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteComment(session.id, commentIndex);
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
                        {activeCommentId === session.id && (
                          <Tr>
                            <Td colSpan={6} py={2}>
                              <Input
                                placeholder="Add your comment here..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, session.id)}
                                onBlur={(e) => handleBlur(e, session.id)}
                                size="sm"
                                autoFocus
                                borderColor="#A0AEC0"
                                height="40px"
                                _hover={{ borderColor: "#A0AEC0" }}
                                _focus={{ borderColor: "#A0AEC0", boxShadow: "none" }}
                                rounded="lg"
                                sx={{
                                  '&': {
                                    paddingY: '8'
                                  }
                                }}
                              />
                            </Td>
                          </Tr>
                        )}
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
  sessions = [],
  setSessions,
  summary = [],
  setSummary,
}) => {

  const { isOpen, onOpen, onClose } = useDisclosure();

  const calculateTotalBookingRow = (rate, adjustmentValues) => {
    if (!rate) return "0.00";

    const baseRate = parseFloat(rate);
    if (isNaN(baseRate)) return "0.00";

    const adjustedTotal = (adjustmentValues || []).reduce((acc, val) => {
      const sign = val[0];
      const isPercent = val.includes("%");
      const cleanStr = val.slice(1).replace("$", "").replace("%", "");
      const num = parseFloat(cleanStr);

      if (isNaN(num)) return acc;

      if (isPercent) {
        const factor = 1 + (sign === "+" ? num : -num) / 100;
        return acc * factor;
      } else {
        return sign === "+" ? acc + num : acc - num;
      }
    }, baseRate);


    return adjustedTotal.toFixed(2);
  };

  // Summary Sidebar total calculations
  const originalSessionRateRef = useRef(null);

  useEffect(() => {
    if (sessions?.length > 0 && originalSessionRateRef.current === null) {
      originalSessionRateRef.current = sessions[0]?.rate;
    }
  }, [sessions]);

  useEffect(() => {
    if (!summary?.[0]?.adjustmentValues || sessions.length === 0 || originalSessionRateRef.current === null) return;

    const originalSessionRate = originalSessionRateRef.current;

    const updatedSessions = sessions.map((session) => {

      const adjustedRate = calculateTotalBookingRow(
        originalSessionRate,
        summary[0]?.adjustmentValues
      );

      if (session.rate !== adjustedRate) {
        return {
          ...session,
          rate: adjustedRate,
        };
      }

      return session;
    });

    setSessions(updatedSessions)

  }, [summary]);



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
                      height={compactView && "10"}
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
                  <Button
                    // onClose={() => setActiveRowId(null)}
                    leftIcon={<PencilIcon color="black" />}
                    colorScheme="gray"
                    borderRadius="md"
                    px="3"
                    py="2"
                    fontSize="small"
                    height="32px"
                    // opacity={
                    //   activeRowId === null ||
                    //   activeRowId === session.id
                    //     ? 1
                    //     : 0.3
                    // }
                    // onClick={() => setActiveRowId(session.id)}
                    // isDisabled={
                    //   activeRowId !== null &&
                    //   activeRowId !== session.id
                    // }
                    onClick={onOpen}
                  >
                    Adjust
                  </Button>
                </Td>
              </Tr>
              {/* Room Fee Body Row */}

              {/* Custom rows don't have room names, so that's why we filter them out to avoid showing custom rows in the summary */}
              {sessions?.filter((session) => session.name?.length > 0).map((session, key) => (
                <Tr key={key}>
                  <Td
                    pl="16"
                    fontSize={compactView ? "6.38px" : "sm"}
                    py={compactView ? 2 : 4}
                    borderBottom={
                      key === sessions.length - 1 ? undefined : "none"
                    }
                    colSpan={4}
                  >
                    {session.name}
                  </Td>
                  <Td
                    fontSize={compactView ? "6.38px" : "sm"}
                    py={compactView ? 2 : 4}
                    borderBottom={
                      key === sessions.length - 1 ? undefined : "none"
                    }
                  >
                    {summary[0]?.adjustmentValues.length === 0 ? (
                      "None"
                    ) : (
                      <Box display="inline-block">
                        <Tooltip
                          label={summary[0]?.adjustmentValues.join(", ")}
                          placement="top"
                          bg="gray"
                          w="auto"
                        >
                          <Text
                            textOverflow="ellipsis"
                            // whiteSpace="nowrap"
                            overflow="hidden"
                          >
                            {summary[0]?.adjustmentValues.join(", ")}
                          </Text>
                        </Tooltip>
                      </Box>
                    )}

                  </Td>
                  <Td
                    textAlign="end"
                    py={compactView ? 0 : 4}
                    fontSize={compactView ? "6.38px" : "sm"}
                    borderBottom={
                      key === sessions.length - 1 ? undefined : "none"
                    }
                  >
                    <HStack
                      spacing={1}
                      justify="end"
                    >
                      <Box as="span">$</Box>
                      <Input
                        value={parseFloat(session.rate).toFixed(2)}
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
                  {`$ ${subtotal.toFixed(2)}`}
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
                  {`$ ${(parseFloat(pastDue) + parseFloat(subtotal)).toFixed(2)}`}
                </Td>
              </Tr>
            </Tbody>
          </Table>
          <SummaryFeeAdjustmentSideBar
            isOpen={isOpen}
            onClose={onClose}
            summary={summary[0]}
            setSummary={setSummary}
            sessionIndex={0}
            subtotal={subtotal}
            session={sessions[0]}
          />
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
