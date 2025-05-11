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
}) => {
  const { backend } = useBackendContext();
  const [tempSession, setTempSession] = useState(session || {});

  useEffect(() => {
    if (session) {
      setTempSession(JSON.parse(JSON.stringify(session)));
    }
  }, [session, isOpen]);

  const calculateNewRate = () => {
    let newRate = Number(session.rate || 0);

    tempSession.adjustmentValues.forEach((val) => {
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

  const handleNegativeClick = (index) => {
    setTempSession(prev => {
      const newSession = JSON.parse(JSON.stringify(prev));
      const currentValue = newSession.adjustmentValues[index];
      const valueWithoutSign = currentValue.replace(/^[+-]/, '');
      newSession.adjustmentValues[index] = '-' + valueWithoutSign;
      return newSession;
    });
  };

  const handlePositiveClick = (index) => {
    setTempSession(prev => {
      const newSession = JSON.parse(JSON.stringify(prev));
      const currentValue = newSession.adjustmentValues[index];
      const valueWithoutSign = currentValue.replace(/^[+-]/, '');
      newSession.adjustmentValues[index] = '+' + valueWithoutSign;
      return newSession;
    });
  };

  const handleValueChange = (index, newValue, type) => {
    setTempSession(prev => {
      const newSession = JSON.parse(JSON.stringify(prev));
      const currentValue = newSession.adjustmentValues[index];
      const sign = currentValue.trim().startsWith("-") ? "-" : "+";
      const numericValue = Math.abs(parseFloat(newValue)) || 0;
      
      newSession.adjustmentValues[index] = type === "$" 
        ? `${sign}$${numericValue}`
        : `${sign}${numericValue}%`;
      
      return newSession;
    });
  };

  const handleRemoveAdjustment = (index) => {
    setTempSession(prev => ({
      ...prev,
      adjustmentValues: prev.adjustmentValues.filter((_, i) => i !== index)
    }));
  };

  const handleClearAll = () => {
    setTempSession(prev => ({
      ...prev,
      adjustmentValues: []
    }));
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
    <Slide direction="right" in={isOpen} style={{ zIndex: 200 }}>
      <Box w="400px" h="100vh" bg="white" p={6} boxShadow="lg" position="fixed" right={0} top={0} 
        display="flex" flexDirection="column" flex="1">
        <Flex alignItems="center" gap="26px" alignSelf="stretch" whiteSpace="nowrap">
          <IconButton
            onClick={onClose}
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
                  ...prev.adjustmentValues,
                  type === "percent" ? "-0%" : "-$0"
                ]
              }));
            }}
            sessionIndex={sessionIndex}
          />
        </Flex>

        <Box marginTop="4px" overflowY="auto" flex="1">
          {tempSession.adjustmentValues.map((val, index) => (
            <Box key={index} borderBottom="1px solid #E2E8F0" py={3} mt={3}>
              <Flex justify="space-between" align="center">
                <Text fontWeight="bold">
                  {val.includes("$") ? "Dollar ($)" : "Percent (%)"}
                </Text>
              </Flex>

              <HStack justifyContent="space-between">
                <Flex align="center" gap={2} mt={2}>
                  <IconButton
                    aria-label="Negative sign"
                    icon={val.startsWith("-") ? <MinusFilledIcon /> : <MinusOutlineIcon size="16" />}
                    variant="ghost"
                    size="xs"
                    _hover="none"
                    _active="none"
                    onClick={() => handleNegativeClick(index)}
                  />

                  {val.includes("$") ? (
                    <>
                      <Text>$</Text>
                      <Input
                        value={parseFloat(val.replace(/[+$%]/g, ""))}
                        onChange={(e) => handleValueChange(index, e.target.value, "$")}
                        size="sm"
                        width="80px"
                      />
                    </>
                  ) : (
                    <>
                      <Input
                        value={parseFloat(val.replace(/[+$%]/g, "")) || 0}
                        onChange={(e) => handleValueChange(index, e.target.value, "%")}
                        size="sm"
                        width="80px"
                      />
                      <Text>%</Text>
                    </>
                  )}

                  <IconButton
                    aria-label="Plus sign"
                    icon={val.startsWith("+") ? 
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
            <Heading size="md"> ${Number(subtotal || 0).toFixed(2)}</Heading>
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
    </Slide>
  );
};

const SummaryFeeAdjustmentSideBar = ({
  isOpen,
  onClose,
  summary,
  setSummary,
  sessionIndex,
  subtotal = 0.0,
  session
}) => {
  const { backend } = useBackendContext();
  const [tempSummary, setTempSummary] = useState(summary || {});
  const originalRate = useRef(null);

  useEffect(() => {
    if (session && originalRate.current === null) {
      const baseRate = Number(session.rate);
      const existingAdjustments = summary?.adjustmentValues || [];
      
      let originalValue = baseRate;
      existingAdjustments.forEach((val) => {
        const isNegative = val.startsWith("-");
        const numericPart = parseFloat(val.replace(/[+$%-]/g, "")) || 0;

        let adjustmentAmount = 0;
        if (val.includes("$")) {
          adjustmentAmount = numericPart;
        } else if (val.includes("%")) {
          adjustmentAmount = (numericPart / 100) * originalValue;
        }

        if (isNegative) {
          originalValue += adjustmentAmount;
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
      tempSummary.adjustmentValues.forEach((val) => {
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
    }

    return newRate;
  };

  const handleNegativeClick = (index) => {
    setTempSummary(prev => {
      const newSummary = JSON.parse(JSON.stringify(prev));
      const currentValue = newSummary.adjustmentValues[index];
      const valueWithoutSign = currentValue.replace(/^[+-]/, '');
      newSummary.adjustmentValues[index] = '-' + valueWithoutSign;
      return newSummary;
    });
  };

  const handlePositiveClick = (index) => {
    setTempSummary(prev => {
      const newSummary = JSON.parse(JSON.stringify(prev));
      const currentValue = newSummary.adjustmentValues[index];
      const valueWithoutSign = currentValue.replace(/^[+-]/, '');
      newSummary.adjustmentValues[index] = '+' + valueWithoutSign;
      return newSummary;
    });
  };

  const handleClearAll = () => {
    setTempSummary(prev => ({
      ...prev,
      adjustmentValues: []
    }));
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
    <Slide
      direction="right"
      in={isOpen}
      style={{ zIndex: 200 }}
    >
      <Box
        w="400px"
        h="100vh"
        bg="white"
        p={6}
        boxShadow="lg"
        position="fixed"
        right={0}
        top={0}
        display="flex"
        flexDirection="column"
        flex="1"
      >
        <Flex
          alignItems="center"
          gap="26px"
          alignSelf="stretch"
          whiteSpace="nowrap"
        >
          <IconButton
            onClick={onClose}
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
            onSelect={(type, index) => {
              setSummary((prevSummary) => {
                const newSummary = [...prevSummary];

                if (type === "percent")
                  newSummary[index].adjustmentValues.push("-0%");
                else if (type === "dollar")
                  newSummary[index].adjustmentValues.push("-$0");

                return newSummary;
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
          {tempSummary.adjustmentValues && tempSummary?.adjustmentValues.map((val, index) => (
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
                  {val.includes("$") ? "Dollar ($)" : "Percent (%)"}
                </Text>
              </Flex>

              <HStack justifyContent="space-between">
                <Flex
                  align="center"
                  gap={2}
                  mt={2}
                >
                  <Text
                    fontSize="sm"
                    color="gray.500"
                  >
                  </Text>

                  <IconButton
                    aria-label="Negative sign"
                    icon={
                      val.startsWith("-") ? (
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

                  {val.includes("$") ? ( 
                    <>
                      <Text>$</Text>
                      <Input
                        value={parseFloat(val.replace(/[+$%]/g, ""))}
                        onChange={(e) => {
                          setTempSummary((prev) => ({
                            ...prev,
                            adjustmentValues: prev.adjustmentValues.map((v, i) =>
                              i === index ? e.target.value : v
                            )
                          }));
                        }}
                        size="sm"
                        width="80px"
                      />
                    </>
                  ) : ( 
                    <>
                      <Input
                        value={parseFloat(val.replace(/[+$%]/g, "")) || 0}
                        onChange={(e) => {
                          setTempSummary((prev) => ({
                            ...prev,
                            adjustmentValues: prev.adjustmentValues.map((v, i) =>
                              i === index ? e.target.value : v
                            )
                          }));
                        }}
                        size="sm"
                        width="80px"
                      />

                      <Text>%</Text>
                    </> 
                  )} 
                  <IconButton
                    aria-label="Plus sign"
                    icon={
                      val.startsWith("+") ? (
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
                  onClick={() => {
                    setTempSummary((prev) => ({
                      ...prev,
                      adjustmentValues: prev.adjustmentValues.filter((_, i) => i !== index)
                    }));
                  }}
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
    </Slide>
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