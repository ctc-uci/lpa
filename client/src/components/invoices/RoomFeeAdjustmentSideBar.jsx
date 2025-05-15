import { useRef } from "react";

import {
  Box,
  Button,
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
  Drawer,
  DrawerOverlay,
  DrawerContent,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";

import { format } from "date-fns";

import { CancelIcon, PlusIcon } from "../../assets/EditInvoiceIcons";
import { MinusFilledIcon } from "../../assets/MinusFilledIcon";
import { MinusOutlineIcon } from "../../assets/MinusOutlineIcon";
import { PlusFilledIcon } from "../../assets/PlusFilledIcon";
import { PlusOutlineIcon } from "../../assets/PlusOutlineIcon";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { useState, useEffect } from "react";

const RoomFeeAdjustmentSideBar = ({
  isOpen,
  onClose,
  session = {},
  setSessions,
  sessionIndex,
  subtotal = 0.0,
  sessions = [],
  deletedIds,
  setDeletedIds
}) => {
  const { backend } = useBackendContext();
  const [tempSession, setTempSession] = useState(session || {});
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const cancelRef = useRef();

  useEffect(() => {
    if (session) {
      setTempSession(JSON.parse(JSON.stringify(session)));
    }
  }, [session, isOpen]);

  const calculateNewRate = () => {
    let newRate = Number(session.rate || 0);

    if (!tempSession.adjustmentValues) return newRate;

    tempSession.adjustmentValues.forEach((adj) => {
      if (!adj.value) return;
      
      const val = Number(adj.value);
      let adjustmentAmount = 0;

      if (adj.type === "rate_flat") {
        adjustmentAmount = val;
      } else if (adj.type === "rate_percent") {
        adjustmentAmount = (val / 100) * Number(newRate || 0);
      }

      if (val < 0) {
        newRate -= Math.abs(adjustmentAmount);
      } else {
        newRate += adjustmentAmount;
      }
    });

    return newRate;
  };

  const calculateSessionTotal = () => {
    if (tempSession && tempSession.startTime && tempSession.endTime) {
      const timeToMinutes = (timeStr) => {
        const [hours, minutes] = timeStr.split(":").map(Number);
        return hours * 60 + minutes;
      };

      const newRate = calculateNewRate();
      const rawStart = timeToMinutes(tempSession.startTime.substring(0, 5));
      const rawEnd = timeToMinutes(tempSession.endTime.substring(0, 5));
      const endAdjusted = rawEnd <= rawStart ? rawEnd + 24 * 60 : rawEnd;
      const durationInHours = (endAdjusted - rawStart) / 60;

      return newRate * durationInHours;
    }
  };
  

  const handleNegativeClick = (index) => {
    setTempSession(prev => {
      const newSession = JSON.parse(JSON.stringify(prev));
      if (!newSession.adjustmentValues || !newSession.adjustmentValues[index]) return prev;
      
      const currentValue = newSession.adjustmentValues[index].value;
      const valueWithoutSign = String(currentValue).replace(/^[+-]/, '');
      newSession.adjustmentValues[index].value = -Math.abs(Number(valueWithoutSign));
      return newSession;
    });
  };

  const handlePositiveClick = (index) => {
    setTempSession(prev => {
      const newSession = JSON.parse(JSON.stringify(prev));
      if (!newSession.adjustmentValues || !newSession.adjustmentValues[index]) return prev;
      
      const currentValue = newSession.adjustmentValues[index].value;
      const valueWithoutSign = String(currentValue).replace(/^[+-]/, '');
      newSession.adjustmentValues[index].value = Math.abs(Number(valueWithoutSign));
      return newSession;
    });
  };

  const handleValueChange = (index, newValue, type) => {
    setTempSession(prev => {
      const newSession = JSON.parse(JSON.stringify(prev));
      if (!newSession.adjustmentValues || !newSession.adjustmentValues[index]) return prev;
      
      const currentValue = newSession.adjustmentValues[index].value;
      const isNegative = Number(currentValue) < 0;
      const numericValue = Math.abs(parseFloat(newValue)) || 0;
      
      newSession.adjustmentValues[index].id = prev.adjustmentValues[index].id;
      newSession.adjustmentValues[index].value = isNegative ? -numericValue : numericValue;
      newSession.adjustmentValues[index].type = type === "$" ? "rate_flat" : "rate_percent";
      
      return newSession;
    });
  };

  const handleRemoveAdjustment = (index) => {
    setTempSession(prev => ({
      ...prev,
      adjustmentValues: prev.adjustmentValues.filter((_, i) => i !== index)
    }));
    if (tempSession.adjustmentValues[index].id) {
      setDeletedIds(prevDeletedIds => [...prevDeletedIds, tempSession.adjustmentValues[index].id]);
    }
  };

  const handleClearAll = () => {
    setTempSession(prev => ({
      ...prev,
      adjustmentValues: []
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
    setSessions(prevSessions => {
      const newSessions = [...prevSessions];
      newSessions[sessionIndex] = tempSession;
      return newSessions;
    });

    onClose();
  };


  return (
    <>
      <Drawer isOpen={isOpen} placement="right" onClose={handleClose} size="sm">
        <DrawerContent>
          <Box p={6} h="100vh" display="flex" flexDirection="column" flex="1">
            <Flex alignItems="center" gap="26px" alignSelf="stretch" whiteSpace="nowrap">
              <IconButton
                onClick={handleClose}
                variant="ghost"
                size="sm"
                p={0}
                minW="auto"
                icon={<Icon as={CancelIcon} />}
              />
              <Text fontWeight="500" color="#4A5568" fontSize="14px" whiteSpace="nowrap">
                {session.datetime ? format(new Date(session.datetime), "M/d/yy") : "N/A"}{" "}
                Room Fee Adjustment
              </Text>

              <AdjustmentTypeSelector
                onSelect={(type) => {
                  setTempSession(prev => ({
                    ...prev,
                    adjustmentValues: [
                      ...(prev.adjustmentValues || []),
                      {
                        id: prev.adjustmentValues[prev.adjustmentValues.length - 1]?.id + 1 || 0,
                        type: type === "percent" ? "rate_percent" : "rate_flat",
                        value: -0
                      }
                    ]
                  }));
                }}
                sessionIndex={sessionIndex}
              />
            </Flex>

            <Box marginTop="4px" overflowY="auto" flex="1">
              {tempSession.adjustmentValues && tempSession.adjustmentValues.map((adj, index) => (
                <Box key={index} borderBottom="1px solid #E2E8F0" py={3} mt={3}>
                  <Flex justify="space-between" align="center">
                    <Text fontWeight="bold">
                      {adj.type === "rate_flat" ? "Dollar ($)" : "Percent (%)"}
                    </Text>
                  </Flex>

                  <HStack justifyContent="space-between">
                    <Flex align="center" gap={2} mt={2}>
                      <IconButton
                        aria-label="Negative sign"
                        icon={Number(adj.value) < 0 ? <MinusFilledIcon /> : <MinusOutlineIcon size="16" />}
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
                            onChange={(e) => handleValueChange(index, e.target.value, "$")}
                            size="sm"
                            width="80px"
                          />
                        </>
                      ) : (
                        <>
                          <Input
                            value={Math.abs(Number(adj.value)) || 0}
                            onChange={(e) => handleValueChange(index, e.target.value, "%")}
                            size="sm"
                            width="80px"
                          />
                          <Text>%</Text>
                        </>
                      )}

                      <IconButton
                        aria-label="Plus sign"
                        icon={Number(adj.value) >= 0 ?
                          <PlusFilledIcon color="#4441C8" size="20" /> :
                          <PlusOutlineIcon />
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

            <Box mt={4} p={2}>
              <Flex justifyContent="right" alignItems="center" gap="10px">
                <Heading size="xs" color="#718096" marginRight="15px">
                  NEW ROOM FEE
                </Heading>
                <Heading size="md">${calculateNewRate().toFixed(2)}/hr</Heading>
              </Flex>
              <Flex justifyContent="right" alignItems="center" gap="10px" marginTop="10px">
                <Heading size="xs" color="#718096" marginRight="15px">
                  NEW SESSION TOTAL
                </Heading>
                <Heading size="md"> ${calculateSessionTotal().toFixed(2)}</Heading>
              </Flex>
              <Flex mt="30px" justifyContent="flex-end" alignItems="center" gap="4px">
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
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Leave without saving changes?
            </AlertDialogHeader>

            <AlertDialogFooter>
              <Button onClick={handleConfirmClose}>
                Don't Save
              </Button>
              <Button bg="#4441C8" color="white" ml={3} ref={cancelRef} onClick={() => {handleApply(); handleConfirmClose()}}>
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
  summary,
  setSummary,
  sessionIndex,
  subtotal = 0.0,
  session,
  deletedIds,
  setDeletedIds
}) => {
  const { backend } = useBackendContext();
  const [tempSummary, setTempSummary] = useState(summary || {});
  const originalRate = useRef(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const cancelRef = useRef();

  useEffect(() => {
    if (session && originalRate.current === null) {
      const baseRate = Number(session.rate);
      const existingAdjustments = summary?.adjustmentValues || [];

      let originalValue = baseRate;
      existingAdjustments.forEach((adj) => {
        if (!adj.value) return;
        
        const val = Number(adj.value);
        let adjustmentAmount = 0;

        if (adj.type === "rate_flat") {
          adjustmentAmount = val;
        } else if (adj.type === "rate_percent") {
          adjustmentAmount = (val / 100) * originalValue;
        }

        if (val < 0) {
          originalValue += Math.abs(adjustmentAmount);
        } else {
          originalValue -= adjustmentAmount;
        }
      });

      originalRate.current = originalValue;
    }
  }, [session, summary]);

  useEffect(() => {
    if (summary) {
      setTempSummary(JSON.parse(JSON.stringify(summary)));
    }
  }, [summary, isOpen]);

  const calculateTempRate = () => {
    if (originalRate.current === null) return 0;

    let newRate = originalRate.current;

    if (tempSummary?.adjustmentValues) {
      tempSummary.adjustmentValues.forEach((adj) => {
        if (!adj.value) return;
        
        const val = Number(adj.value);
        let adjustmentAmount = 0;

        if (adj.type === "rate_flat") {
          adjustmentAmount = val;
        } else if (adj.type === "rate_percent") {
          adjustmentAmount = (val / 100) * Number(newRate || 0);
        }

        if (val < 0) {
          newRate -= Math.abs(adjustmentAmount);
        } else {
          newRate += adjustmentAmount;
        }
      });
    }
    return newRate;
  };

  const handleNegativeClick = (index) => {
    setTempSummary(prev => {
      const newSummary = JSON.parse(JSON.stringify(prev));
      if (!newSummary.adjustmentValues || !newSummary.adjustmentValues[index]) return prev;
      
      const currentValue = newSummary.adjustmentValues[index].value;
      const valueWithoutSign = String(currentValue).replace(/^[+-]/, '');
      newSummary.adjustmentValues[index].value = -Math.abs(Number(valueWithoutSign));
      return newSummary;
    });
  };

  const handlePositiveClick = (index) => {
    setTempSummary(prev => {
      const newSummary = JSON.parse(JSON.stringify(prev));
      if (!newSummary.adjustmentValues || !newSummary.adjustmentValues[index]) return prev;
      
      const currentValue = newSummary.adjustmentValues[index].value;
      const valueWithoutSign = String(currentValue).replace(/^[+-]/, '');
      newSummary.adjustmentValues[index].value = Math.abs(Number(valueWithoutSign));
      return newSummary;
    });
  };

  const handleValueChange = (index, newValue, type) => {
    setTempSummary(prev => {
      const newSummary = JSON.parse(JSON.stringify(prev));
      if (!newSummary.adjustmentValues || !newSummary.adjustmentValues[index]) return prev;
      
      const currentValue = newSummary.adjustmentValues[index].value;
      const isNegative = Number(currentValue) < 0;
      const numericValue = Math.abs(parseFloat(newValue)) || 0;
      
      newSummary.adjustmentValues[index].value = isNegative ? -numericValue : numericValue;
      newSummary.adjustmentValues[index].type = type === "$" ? "rate_flat" : "rate_percent";
      
      return newSummary;
    });
  };

  const handleRemoveAdjustment = (index) => {
    setTempSummary(prev => ({
      ...prev,
      adjustmentValues: prev.adjustmentValues.filter((_, i) => i !== index)
    }));
    if (tempSummary.adjustmentValues[index].id) {
      setDeletedIds(prevDeletedIds => [...prevDeletedIds, tempSummary.adjustmentValues[index].id]);
    }
  };

  const handleClearAll = () => {
    setTempSummary(prev => ({
      ...prev,
      adjustmentValues: []
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
    setSummary(prevSummary => {
      const newSummary = [...prevSummary];
      newSummary[sessionIndex] = tempSummary;
      return newSummary;
    });
    onClose();
  };

  return (
    <>
      <Drawer isOpen={isOpen} placement="right" onClose={handleClose} size="sm">
        <DrawerContent>
          <Box p={6} h="100vh" display="flex" flexDirection="column" flex="1">
            <Flex
              alignItems="center"
              gap="26px"
              alignSelf="stretch"
              whiteSpace="nowrap"
            >
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
                {summary?.datetime ? format(new Date(summary?.datetime), "M/d/yy") : "N/A" }{" "}Room Fee Adjustment
              </Text>

              <AdjustmentTypeSelector
                onSelect={(type) => {
                  setTempSummary(prev => ({
                    ...prev,
                    adjustmentValues: [
                      ...(prev.adjustmentValues || []),
                      {
                        id: prev.adjustmentValues?.[prev.adjustmentValues?.length - 1]?.id + 1 || 0,
                        type: type === "percent" ? "rate_percent" : "rate_flat",
                        value: -0
                      }
                    ]
                  }));
                }}
                sessionIndex={sessionIndex}
              />
            </Flex>

            <Box
              marginTop="4px"
              overflowY="auto"
              flex="1"
            >
              {tempSummary.adjustmentValues && tempSummary.adjustmentValues.map((adj, index) => (
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
                      {adj.type === "rate_flat" ? "Dollar ($)" : "Percent (%)"}
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
                        icon={Number(adj.value) < 0 ? <MinusFilledIcon /> : <MinusOutlineIcon size="16" />}
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
                            onChange={(e) => handleValueChange(index, e.target.value, "$")}
                            size="sm"
                            width="80px"
                          />
                        </>
                      ) : (
                        <>
                          <Input
                            value={Math.abs(Number(adj.value)) || 0}
                            onChange={(e) => handleValueChange(index, e.target.value, "%")}
                            size="sm"
                            width="80px"
                          />
                          <Text>%</Text>
                        </>
                      )}
                      <IconButton
                        aria-label="Plus sign"
                        icon={Number(adj.value) >= 0 ?
                          <PlusFilledIcon color="#4441C8" size="20" /> :
                          <PlusOutlineIcon />
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
                  NEW ROOM FEE
                </Heading>
                <Heading size="md">${calculateTempRate().toFixed(2)}/hr</Heading>
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
                  NEW SESSION TOTAL
                </Heading>
                <Heading size="md"> ${Number(subtotal || 0).toFixed(2)}</Heading>
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
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Leave without saving changes?
            </AlertDialogHeader>

            <AlertDialogFooter>
              <Button onClick={handleConfirmClose}>
                Don't Save
              </Button>
              <Button bg="#4441C8" color="white" ml={3} ref={cancelRef} onClick={() => {handleApply(); handleConfirmClose()}}>
                Save
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}

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
}

export {
  RoomFeeAdjustmentSideBar,
  SummaryFeeAdjustmentSideBar,
  AdjustmentTypeSelector
};
