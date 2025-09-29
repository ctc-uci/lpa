import { useEffect, useRef, useState } from "react";

import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Slide,
  Text,
} from "@chakra-ui/react";

import { format } from "date-fns";

import { CancelIcon, PlusIcon } from "../../assets/EditInvoiceIcons";
import { MinusFilledIcon } from "../../assets/MinusFilledIcon";
import { MinusOutlineIcon } from "../../assets/MinusOutlineIcon";
import { PlusFilledIcon } from "../../assets/PlusFilledIcon";
import { PlusOutlineIcon } from "../../assets/PlusOutlineIcon";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { useDeletedIdsStore } from "../../stores/useDeletedIdsStore";
import { useSummaryStore } from "../../stores/useSummaryStore";
import { useSessionStore } from "../../stores/useSessionStore";

const RoomFeeAdjustmentSideBar = ({
  isOpen,
  onClose,
  session = {},
  setSessions,
  sessionIndex,
  subtotal = 0.0,
  sessions = [],
}) => {
  const { backend } = useBackendContext();
  const [tempSession, setTempSession] = useState(session || {});
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const cancelRef = useRef();
  const { deletedIds, setDeletedIds, addDeletedId } = useDeletedIdsStore();
  const { setAdjustmentValue } = useSessionStore();
  const { summary, setSummary, summaryTotal, setSummaryTotal } = useSummaryStore();

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
    if (!startTime || !endTime || !rate) return "0.00";

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
    return Number(total).toFixed(2);
  };

  const handleNegativeClick = (index) => {
    setTempSession((prev) => {
      const newSession = JSON.parse(JSON.stringify(prev));
      if (!newSession.adjustmentValues || !newSession.adjustmentValues[index]){
        return prev;
      }

      const currentValue = newSession.adjustmentValues[index].value;
      const valueWithoutSign = String(currentValue).replace(/^[+-]/, "");
      // For 0 values, set to negative, otherwise keep the same logic
      if (Number(valueWithoutSign) === 0) {
        newSession.adjustmentValues[index].value = -0;
      } else {
        newSession.adjustmentValues[index].value = -Math.abs(
          Number(valueWithoutSign)
        );
      }
      return newSession;
    });
  };

  const handlePositiveClick = (index) => {
    setTempSession((prev) => {
      const newSession = JSON.parse(JSON.stringify(prev));
      if (!newSession.adjustmentValues || !newSession.adjustmentValues[index])
        return prev;

      const currentValue = newSession.adjustmentValues[index].value;
      const valueWithoutSign = String(currentValue).replace(/^[+-]/, "");
      // For 0 values, set to positive, otherwise keep the same logic
      if (Number(valueWithoutSign) === 0) {
        newSession.adjustmentValues[index].value = 0;
      } else {
        newSession.adjustmentValues[index].value = Math.abs(
          Number(valueWithoutSign)
        );
      }
      return newSession;
    });
  };

  const handleValueChange = (index, newValue, type) => {
    setTempSession((prev) => {
      const newSession = JSON.parse(JSON.stringify(prev));
      if (!newSession.adjustmentValues || !newSession.adjustmentValues[index])
        return prev;

      const currentValue = newSession.adjustmentValues[index].value;
      const isNegative = Number(currentValue) < 0 || Object.is(currentValue, -0);
      const numericValue = Math.abs(parseFloat(newValue)) || 0;

      newSession.adjustmentValues[index].id = prev.adjustmentValues[index].id;
      newSession.adjustmentValues[index].value = isNegative
        ? -numericValue
        : numericValue;
      newSession.adjustmentValues[index].type =
        type === "$" ? "rate_flat" : "rate_percent";

      return newSession;
    });
  };

  const handleRemoveAdjustment = (index) => {
    if (tempSession.adjustmentValues[index].id) {
      addDeletedId(tempSession.adjustmentValues[index].id);
    }
    setTempSession((prev) => ({
      ...prev,
      adjustmentValues: prev.adjustmentValues.filter((_, i) => i !== index),
    }));
  };

  const handleClearAll = () => {
    if (tempSession.adjustmentValues) {
      for (const adj of tempSession.adjustmentValues) {
        addDeletedId(adj.id);
      }
    }

    setTempSession((prev) => ({
      ...prev,
      adjustmentValues: [],
    }));

  };

  const handleClose = () => {
    if (JSON.stringify(tempSession) !== JSON.stringify(session)) {
      setIsConfirmationOpen(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    setIsConfirmationOpen(false);
    onClose();
  };

  const handleApply = () => {
    setAdjustmentValue(sessionIndex, tempSession.adjustmentValues);
    onClose();
  };


  return (
    <>
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={handleClose}
        size="sm"
      >
        <DrawerContent>
          <Box
            p={6}
            h="100vh"
            display="flex"
            flexDirection="column"
            flex="1"
          >
            <Flex
              alignItems="center"
              gap="26px"
              alignSelf="stretch"
              whiteSpace="nowrap"
              justifyContent="space-between"
            >
              <Flex alignItems="center" gap="20px">
                <IconButton
                  onClick={handleClose}
                  variant="ghost"
                  size="sm"
                  p={0}
                  minW="auto"
                  icon={<Icon as={CancelIcon} />}
                />
                <Text
                  fontWeight="500"
                  color="#4A5568"
                  fontSize="14px"
                  whiteSpace="nowrap"
                >
                  Room Fee Adjustment
                </Text>
              </Flex>
              <AdjustmentTypeSelector
                onSelect={(type) => {
                  setTempSession((prev) => {
                    // Get all existing IDs from different sources across all sessions
                    // const adjustmentIds = sessions
                    //   .map(
                    //     (session) =>
                    //       session.adjustmentValues?.map((adj) => adj.id) || []
                    //   )
                    //   .flat();
                    // const commentIds = sessions
                    //   .map(
                    //     (session) =>
                    //       session.comments?.map((comment) => comment.id) || []
                    //   )
                    //   .flat();
                    // const totalIds = sessions
                    //   .map(
                    //     (session) =>
                    //       session.totals?.map((total) => total.id) || []
                    //   )
                    //   .flat();

                    // // Find the maximum ID across all sources
                    // console.log("sessions.length", sessions.length);
                    // const maxId = Math.max(
                    //   -1, // fallback if all arrays are empty
                    //   ...adjustmentIds,
                    //   ...commentIds,
                    //   ...totalIds
                    // );

                    return {
                      ...prev,
                      adjustmentValues: [
                        ...(prev.adjustmentValues || []),
                        {
                          // id: maxId + 1,
                          type:
                            type === "percent" ? "rate_percent" : "rate_flat",
                          value: -0,
                        },
                      ],
                    };
                  });
                }}
                sessionIndex={sessionIndex}
              />
            </Flex>

            <Box
              marginTop="4px"
              overflowY="auto"
              flex="1"
            >
              {tempSession.adjustmentValues &&
                tempSession.adjustmentValues.map((adj, index) => (
                  <Box
                    key={index}
                    borderBottom="1px solid #E2E8F0"
                    py={3}
                    mt={3}
                  >
                    <Flex
                      justify="space-between"
                      align="center"
                    >
                      <Text fontWeight="bold">
                        {adj.type === "rate_flat"
                          ? "Dollar ($)"
                          : "Percent (%)"}
                      </Text>
                    </Flex>

                    <HStack justifyContent="space-between">
                      <Flex
                        align="center"
                        gap={2}
                        mt={2}
                      >
                        <IconButton
                          aria-label="Negative sign"
                          icon={
                            Number(adj.value) < 0 || Object.is(adj.value, -0) ? (
                              <MinusFilledIcon />
                            ) : (
                              <MinusOutlineIcon size="16" />
                            )
                          }
                          variant="ghost"
                          size="xs"
                          _hover="none"
                          _active="none"
                          onClick={() => handleNegativeClick(index)}
                        />

                        {adj.type === "rate_flat" ? (
                          <>
                            <Text>$</Text>
                            <Input
                              value={Math.abs(Number(adj.value))}
                              onChange={(e) =>
                                handleValueChange(index, e.target.value, "$")
                              }
                              size="sm"
                              width="80px"
                            />
                          </>
                        ) : (
                          <>
                            <Input
                              value={Math.abs(Number(adj.value)) || 0}
                              onChange={(e) =>
                                handleValueChange(index, e.target.value, "%")
                              }
                              size="sm"
                              width="80px"
                            />
                            <Text>%</Text>
                          </>
                        )}
                        <IconButton
                          aria-label="Plus sign"
                          icon={
                            Number(adj.value) > 0 || (Number(adj.value) === 0 && !Object.is(adj.value, -0)) ? (
                              <PlusFilledIcon
                                color="#4441C8"
                                size="20"
                              />
                            ) : (
                              <PlusOutlineIcon />
                            )
                          }
                          _hover="none"
                          _active="none"
                          variant="ghost"
                          size="xs"
                          onClick={() => handlePositiveClick(index)}
                        />
                      </Flex>

                      <IconButton
                        aria-label="Remove adjustment"
                        icon={<Icon as={CancelIcon} />}
                        variant="ghost"
                        _hover="none"
                        size="sm"
                        onClick={() => handleRemoveAdjustment(index)}
                      />
                    </HStack>
                  </Box>
                ))}
            </Box>
            <Box
              mt={4}
              p={2}
            >
              <Flex
                justifyContent="right"
                alignItems="center"
                gap="10px"
              >
                
                <Heading
                  size="xs"
                  color="#718096"
                  marginRight="15px"
                >
                  {JSON.stringify(tempSession.adjustmentValues) !== JSON.stringify(session.adjustmentValues) ? `NEW` : `CURRENT`} ROOM FEE
                </Heading>

                <Heading size="md">${calculateTotalBookingRow("00:00:00+00", "01:00:00+00", calculateSummaryTotal(session?.rate, summary[0]?.adjustmentValues), tempSession?.adjustmentValues)}/hr</Heading>
              </Flex>
              <Flex
                justifyContent="right"
                alignItems="center"
                gap="10px"
                marginTop="10px"
              >
                <Heading
                  size="xs"
                  color="#718096"
                  marginRight="15px"
                >
                  {JSON.stringify(tempSession.adjustmentValues) !== JSON.stringify(session.adjustmentValues) ? `NEW` : `CURRENT`} SESSION TOTAL
                </Heading>
                <Heading size="md">
                  {" "}
                  ${calculateTotalBookingRow(session.startTime, session.endTime, calculateSummaryTotal(session?.rate, summary[0]?.adjustmentValues), tempSession?.adjustmentValues)}
                </Heading>
              </Flex>
              <Flex
                mt="30px"
                justifyContent="flex-end"
                alignItems="center"
                gap="4px"
              >
                <Button
                  variant="ghost"
                  fontSize="14px"
                  fontWeight="500"
                  color="#2D3748"
                  onClick={handleClearAll}
                >
                  Clear All
                </Button>
                <Button
                  bg="#4441C8"
                  color="white"
                  px={4}
                  py={2}
                  borderRadius="md"
                  fontWeight="bold"
                  _hover={{ bg: "#312E8A" }}
                  onClick={handleApply}
                >
                  Apply
                </Button>
              </Flex>
            </Box>
          </Box>
        </DrawerContent>
      </Drawer>

      <AlertDialog
        isOpen={isConfirmationOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsConfirmationOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader
              fontSize="lg"
              fontWeight="bold"
            >
              Leave without saving changes?
            </AlertDialogHeader>

            <AlertDialogFooter>
              <Button onClick={handleConfirmClose}>Don't Save</Button>
              <Button
                bg="#4441C8"
                color="white"
                ml={3}
                ref={cancelRef}
                onClick={() => {
                  handleApply();
                  handleConfirmClose();
                }}
              >
                Save
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

const SummaryFeeAdjustmentSideBar = ({
  isOpen,
  onClose,
  subtotal = 0.0,
  session,
  summary,
  setSummary,
}) => {
  const originalRate = useRef(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const cancelRef = useRef();
  const { deletedIds, setDeletedIds, addDeletedId } = useDeletedIdsStore();
  const { setAdjustmentValue } = useSummaryStore();
  const [tempSummary, setTempSummary] = useState(summary);  
  const [tempSummaryTotal, setTempSummaryTotal] = useState(0);

  const calculateTempRate = (rate, adjustmentValues) => {
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

  useEffect(() => {
    setTempSummaryTotal(calculateTempRate(session?.rate, tempSummary?.adjustmentValues));
  }, [tempSummary, session]);

  const handleNegativeClick = (index) => {
    setTempSummary((prev) => {
      const newSummary = JSON.parse(JSON.stringify(prev));
      if (!newSummary.adjustmentValues || !newSummary.adjustmentValues[index])
        return prev;

      const currentValue = newSummary.adjustmentValues[index].value;
      const valueWithoutSign = String(currentValue).replace(/^[+-]/, "");
      // For 0 values, set to negative, otherwise keep the same logic
      if (Number(valueWithoutSign) === 0) {
        newSummary.adjustmentValues[index].value = -0;
      } else {
        newSummary.adjustmentValues[index].value = -Math.abs(
          Number(valueWithoutSign)
        );
      }
      return newSummary;
    });
  };

  const handlePositiveClick = (index) => {
    setTempSummary((prev) => {
      const newSummary = JSON.parse(JSON.stringify(prev));
      if (!newSummary.adjustmentValues || !newSummary.adjustmentValues[index])
        return prev;

      const currentValue = newSummary.adjustmentValues[index].value;
      const valueWithoutSign = String(currentValue).replace(/^[+-]/, "");
      // For 0 values, set to positive, otherwise keep the same logic
      if (Number(valueWithoutSign) === 0) {
        newSummary.adjustmentValues[index].value = 0;
      } else {
        newSummary.adjustmentValues[index].value = Math.abs(
          Number(valueWithoutSign)
        );
      }
      return newSummary;
    });
  };

  const handleValueChange = (index, newValue, type) => {
    setTempSummary((prev) => {
      const newSummary = JSON.parse(JSON.stringify(prev));
      if (!newSummary.adjustmentValues || !newSummary.adjustmentValues[index])
        return prev;

      const currentValue = newSummary.adjustmentValues[index].value;
      const isNegative = Number(currentValue) < 0 || Object.is(currentValue, -0);
      const numericValue = Math.abs(parseFloat(newValue)) || 0;

      newSummary.adjustmentValues[index].value = isNegative
        ? -numericValue
        : numericValue;
      newSummary.adjustmentValues[index].type =
        type === "$" ? "rate_flat" : "rate_percent";

      return newSummary;
    });
  };

  const handleRemoveAdjustment = (index) => {
    if (tempSummary.adjustmentValues[index].id) {
      addDeletedId(tempSummary.adjustmentValues[index].id);
    }
    setTempSummary((prev) => ({
      ...prev,
      adjustmentValues: prev.adjustmentValues.filter((_, i) => i !== index),
    }));
  };

  const handleClearAll = () => {
    if (tempSummary.adjustmentValues) {
      for (const adj of tempSummary.adjustmentValues) {
        addDeletedId(adj.id);
      }
    }
    setTempSummary((prev) => ({
      ...prev,
      adjustmentValues: [],
    }));
  };

  const handleClose = () => {
    if (JSON.stringify(tempSummary) !== JSON.stringify(summary)) {
      setIsConfirmationOpen(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    setIsConfirmationOpen(false);
    onClose();
  };

  const handleApply = () => {
    setAdjustmentValue(tempSummary.adjustmentValues, 0);
    onClose();
  };

  return (
    <>
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={handleClose}
        size="sm"
      >
        <DrawerContent>
          <Box
            p={6}
            h="100vh"
            display="flex"
            flexDirection="column"
            flex="1"
          >
            <Flex
              alignItems="center"
              gap="26px"
              alignSelf="stretch"
              whiteSpace="nowrap"
              justifyContent="space-between"
            >
              <Flex alignItems="center" gap="20px">
                <IconButton
                  onClick={handleClose}
                  variant="ghost"
                  size="sm"
                  p={0}
                  minW="auto"
                  icon={<Icon as={CancelIcon} />}
                  />
                <Text
                  fontWeight="500"
                  color="#4A5568"
                  fontSize="14px"
                  whiteSpace="nowrap"
                  >
                  Room Fee Adjustment
                </Text>
              </Flex>

              <AdjustmentTypeSelector
                onSelect={(type) => {
                  setTempSummary((prev) => {
                  //   // Get all existing IDs from different sources across all sessions
                  //   const adjustmentIds = sessions
                  //     .map(
                  //       (session) =>
                  //         session.adjustmentValues?.map((adj) => adj.id) || []
                  //     )
                  //     .flat();
                  //   const commentIds = sessions
                  //     .map(
                  //       (session) =>
                  //         session.comments?.map((comment) => comment.id) || []
                  //     )
                  //     .flat();
                  //   const totalIds = sessions
                  //     .map(
                  //       (session) =>
                  //         session.totals?.map((total) => total.id) || []
                  //     )
                  //     .flat();
                    
                  //   console.log("adjustmentIds", adjustmentIds);
                  //   console.log("commentIds", commentIds);
                  //   console.log("totalIds", totalIds);
                  //   // Find the maximum ID across all sources
                  //   const maxId = Math.max(
                  //     -1, // fallback if all arrays are empty
                  //     ...adjustmentIds,
                  //     ...commentIds,
                  //     ...totalIds
                  //   );

                    return {
                      ...prev,
                      adjustmentValues: [
                        ...(prev.adjustmentValues || []),
                        {
                          // id: maxId + 1,
                          type:
                            type === "percent" ? "rate_percent" : "rate_flat",
                          value: -0,
                        },
                      ],
                    };
                  });
                }}
                sessionIndex={0}
              />
            </Flex>

            <Box
              marginTop="4px"
              overflowY="auto"
              flex="1"
            >
              {tempSummary?.adjustmentValues &&
                tempSummary?.adjustmentValues.map((adj, index) => (
                  <Box
                    key={index}
                    borderBottom="1px solid #E2E8F0"
                    py={3}
                    mt={3}
                  >
                    <Flex
                      justify="space-between"
                      align="center"
                    >
                      <Text fontWeight="bold">
                        {adj.type === "rate_flat"
                          ? "Dollar ($)"
                          : "Percent (%)"}
                      </Text>
                    </Flex>

                    <HStack justifyContent="space-between">
                      <Flex
                        align="center"
                        gap={2}
                        mt={2}
                      >
                        <IconButton
                          aria-label="Negative sign"
                          icon={
                            Number(adj.value) < 0 || Object.is(adj.value, -0) ? (
                              <MinusFilledIcon />
                            ) : (
                              <MinusOutlineIcon size="16" />
                            )
                          }
                          variant="ghost"
                          size="xs"
                          _hover="none"
                          _active="none"
                          onClick={() => handleNegativeClick(index)}
                        />

                        {adj.type === "rate_flat" ? (
                          <>
                            <Text>$</Text>
                            <Input
                              value={Math.abs(Number(adj.value))}
                              onChange={(e) =>
                                handleValueChange(index, e.target.value, "$")
                              }
                              size="sm"
                              width="80px"
                            />
                          </>
                        ) : (
                          <>
                            <Input
                              value={Math.abs(Number(adj.value)) || 0}
                              onChange={(e) =>
                                handleValueChange(index, e.target.value, "%")
                              }
                              size="sm"
                              width="80px"
                            />
                            <Text>%</Text>
                          </>
                        )}
                        <IconButton
                          aria-label="Plus sign"
                          icon={
                            Number(adj.value) > 0 || (Number(adj.value) === 0 && !Object.is(adj.value, -0)) ? (
                              <PlusFilledIcon
                                color="#4441C8"
                                size="20"
                              />
                            ) : (
                              <PlusOutlineIcon />
                            )
                          }
                          _hover="none"
                          _active="none"
                          variant="ghost"
                          size="xs"
                          onClick={() => handlePositiveClick(index)}
                        />
                      </Flex>
                      <IconButton
                        aria-label="Remove adjustment"
                        icon={<Icon as={CancelIcon} />}
                        variant="ghost"
                        _hover="none"
                        size="sm"
                        onClick={() => handleRemoveAdjustment(index)}
                      />
                    </HStack>
                  </Box>
                ))}
            </Box>

            <Box
              mt={4}
              p={2}
            >
              <Flex
                justifyContent="right"
                alignItems="center"
                gap="10px"
              >
                <Heading
                  size="xs"
                  color="#718096"
                  marginRight="15px"
                >
                  {JSON.stringify(tempSummary?.adjustmentValues) === JSON.stringify(summary?.adjustmentValues) ? `CURRENT` : `NEW`} ROOM FEE
                </Heading>
                <Heading size="md">
                  ${Number(tempSummaryTotal).toFixed(2)}/hr
                </Heading>
              </Flex>
              <Flex
                justifyContent="right"
                alignItems="center"
                gap="10px"
                marginTop="10px"
              >
                <Heading
                  size="xs"
                  color="#718096"
                  marginRight="15px"
                >
                  {JSON.stringify(tempSummary?.adjustmentValues) === JSON.stringify(summary?.adjustmentValues) ? `CURRENT` : `NEW`} SESSION TOTAL
                </Heading>
                <Heading size="md">
                  {" "}
                  ${Number(tempSummaryTotal).toFixed(2)}
                </Heading>
              </Flex>
              <Flex
                mt="30px"
                justifyContent="flex-end"
                alignItems="center"
                gap="4px"
              >
                <Button
                  variant="ghost"
                  fontSize="14px"
                  fontWeight="500"
                  color="#2D3748"
                  onClick={handleClearAll}
                >
                  Clear All
                </Button>
                <Button
                  bg="#4441C8"
                  color="white"
                  px={4}
                  py={2}
                  borderRadius="md"
                  fontWeight="bold"
                  _hover={{ bg: "#312E8A" }}
                  onClick={handleApply}
                >
                  Apply
                </Button>
              </Flex>
            </Box>
          </Box>
        </DrawerContent>
      </Drawer>

      <AlertDialog
        isOpen={isConfirmationOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsConfirmationOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader
              fontSize="lg"
              fontWeight="bold"
            >
              Leave without saving changes?
            </AlertDialogHeader>

            <AlertDialogFooter>
              <Button onClick={handleConfirmClose}>Don't Save</Button>
              <Button
                bg="#4441C8"
                color="white"
                ml={3}
                ref={cancelRef}
                onClick={() => {
                  handleApply();
                  handleConfirmClose();
                }}
              >
                Save
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

const AdjustmentTypeSelector = ({ onSelect, sessionIndex }) => {
  return (
    <Menu>
      <MenuButton
        as={IconButton}
        icon={<Icon as={PlusIcon} />}
        variant="ghost"
        size="sm"
        marginLeft="60px"
      />
      <MenuList
        minW="120px"
        w="120px"
      >
        <MenuItem onClick={() => onSelect("dollar", sessionIndex)}>
          Dollar ($)
        </MenuItem>
        <MenuItem onClick={() => onSelect("percent", sessionIndex)}>
          Percent (%)
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export {
  RoomFeeAdjustmentSideBar,
  SummaryFeeAdjustmentSideBar,
  AdjustmentTypeSelector,
};
