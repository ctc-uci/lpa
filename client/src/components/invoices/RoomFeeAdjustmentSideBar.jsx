import { useRef } from "react";

import {
  Box,
  Button,
  Flex,
  Heading,
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

export default function RoomFeeAdjustmentSideBar({
  isOpen,
  onClose,
  invoice,
  room,
  userId,
  session = {},
  setSessions,
  sessionIndex,
  subtotal = 0.0
}) {
  // console.log("session", session)

  const { backend } = useBackendContext();

  console.log("session.rate", session.rate)

  const calculateNewRate = () => {
    let newRate = Number(session.rate || 0);
  
    session.adjustmentValues.forEach((val) => {
      const isNegative = val.startsWith("-");
      const numericPart = parseFloat(val.replace(/[+$%-]/g, "")) || 0;

  
      let adjustmentAmount = 0;
  
      if (val.includes("$")) {
        adjustmentAmount = numericPart;
      } else if (val.includes("%")) {
        adjustmentAmount = (numericPart / 100) * Number(newRate|| 0);
      }
      
      if (isNegative) {
        newRate -= adjustmentAmount; 
      } else {
        newRate += adjustmentAmount;
      }
    });
    
    return newRate;
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
            {session.datetime
              ? format(new Date(session.datetime), "M/d/yy")
              : "N/A"}{" "}
            Room Fee Adjustment
          </Text>

          <AdjustmentTypeSelector
            onSelect={(type, index) => {
              setSessions((prevSessions) => {
                const newSessions = [...prevSessions];

                if (type === "percent")
                  newSessions[index].adjustmentValues.push("-0%");
                else if (type === "dollar")
                  newSessions[index].adjustmentValues.push("-$0");

                return newSessions;
              });
            }}
            sessionIndex={sessionIndex}
          />
        </Flex>

        {/* Each adjustment value in sidebar */}
        <Box
          marginTop="4px"
          overflowY="auto"
          flex="1"
        >
          {/* each row */}
          {session.adjustmentValues.map((val, index) => (
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
                <IconButton
                  aria-label="Remove adjustment"
                  icon={<Icon as={CancelIcon} />}
                  variant="ghost"
                  _hover="none"
                  size="sm"
                  onClick={() => {
                    setSessions((prevSessions) => {
                      const newSessions = [...prevSessions];
                      const updatedAdjustmentValues =
                        session.adjustmentValues.filter((_, i) => i !== index);
                      newSessions[sessionIndex] = {
                        ...newSessions[sessionIndex],
                        adjustmentValues: updatedAdjustmentValues,
                      };
                      return newSessions;
                    });
                  }}
                />
              </Flex>

              {/* Second row: applied rate + controls */}
              <Flex
                align="center"
                gap={2}
                mt={2}
              >
                <Text
                  fontSize="sm"
                  color="gray.500"
                >
                  {/* Applied to: ${Number(adj.appliedRate || 0).toFixed(2)}/hr */}
                </Text>

                <IconButton
                  aria-label="Negative sign"
                  icon={
                    session.adjustmentValues[index].startsWith("-") ? (
                      <MinusFilledIcon />
                    ) : (
                      <MinusOutlineIcon size="16" />
                    )
                  }
                  variant="ghost"
                  size="xs"
                  _hover="none"
                  _active="none"
                  onClick={() => {
                    setSessions((prevSessions) => {
                      const newSessions = [...prevSessions];

                      // Get the current value
                      const currentValue =
                        newSessions[sessionIndex].adjustmentValues[index];

                      // Remove any existing sign (+ or -) from the value
                      const valueWithoutSign = currentValue.replace(
                        /^[+-]/,
                        ""
                      );

                      // Add the new sign based on isPositive
                      const newValue = "-" + valueWithoutSign;

                      // Update the specific adjustment value
                      newSessions[sessionIndex].adjustmentValues[index] = newValue;

                      return newSessions;
                    });
                  }}
                />

                {val.includes("$") ? (
                  <>
                    <Text>$</Text>
                    <Input
                      value={parseFloat(val.replace(/[+$%]/g, ""))}
                      onChange={(e) => {
                        setSessions((prevSessions) => {
                          const newSessions = [...prevSessions];
                          
                          const currentValue =
                            newSessions[sessionIndex].adjustmentValues[index];

                          console.log("currentValue", currentValue)

                          const type = currentValue.includes("$") ? "$" : "%";
                          const sign = currentValue.trim().startsWith("-")
                            ? "-"
                            : "+";

                          const numericValue =
                            Math.abs(parseFloat(e.target.value)) || 0;

                          newSessions[sessionIndex].adjustmentValues[index] =
                            type === "$"
                              ? `${sign}$${numericValue}`
                              : `${sign}${numericValue}%`;

                          return newSessions;
                        });
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
                        setSessions((prevSessions) => {
                          const newSessions = [...prevSessions];

                          const currentValue =
                            newSessions[sessionIndex].adjustmentValues[index];

                          const type = currentValue.includes("$") ? "$" : "%";
                          const sign = currentValue.trim().startsWith("-")
                            ? "-"
                            : "+";

                          const numericValue =
                            Math.abs(parseFloat(e.target.value)) || 0;

                          newSessions[sessionIndex].adjustmentValues[index] =
                            type === "$"
                              ? `${sign}$${numericValue}`
                              : `${sign}${numericValue}%`;

                          return newSessions;
                        });
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
                    session.adjustmentValues[index].startsWith("+") ? (
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
                  onClick={() => {
                    setSessions((prevSessions) => {
                      const newSessions = [...prevSessions];

                      // Get the current value
                      const currentValue =
                        newSessions[sessionIndex].adjustmentValues[index];

                      // Remove any existing sign (+ or -) from the value
                      const valueWithoutSign = currentValue.replace(
                        /^[+-]/,
                        ""
                      );

                      // Add the new sign based on isPositive
                      const newValue = "+" + valueWithoutSign;

                      // Update the specific adjustment value
                      newSessions[sessionIndex].adjustmentValues[index] = newValue;

                      return newSessions;
                    });
                  }}
                />
              </Flex>
            </Box>
          ))}
          {/* each row */}
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
            {/* <Heading size="md"> ${Number(newRate || 0).toFixed(2)}/hr</Heading> */}
            <Heading size="md">${calculateNewRate()}/hr</Heading>
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
            {/* <Heading size="md">0.00/hr</Heading> */}
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
              // onClick={() => setAdjustments([])}
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
              // onClick={async () => {
              //   try {
              //     // Loop over all adjustments and create a comment for each
              //     for (const adjustment of adjustments) {
              //       const adjustment_type =
              //         adjustment.type === "dollar"
              //           ? "rate_flat"
              //           : "rate_percent";
              //       const adjustment_value = adjustment.isNegative
              //         ? -adjustment.value
              //         : adjustment.value;
              //       const adjustmentComment =
              //         adjustment.type === "dollar"
              //           ? `Room fee adjustment of $${adjustment_value}`
              //           : `Room fee adjustment of ${adjustment_value}%`;

              //       await backend.post("/comments", {
              //         user_id: userId,
              //         booking_id: booking.id,
              //         invoice_id: invoice.id,
              //         comment: adjustmentComment,
              //         adjustment_type: adjustment_type,
              //         adjustment_value: adjustment_value,
              //       });
              //     }

              //     // Update the UI state with the new adjustments
              //     onApplyAdjustments(booking.id, adjustments);
              //     // setActiveRowId(null); // close sidebar
              //     onClose();
              //   } catch (err) {
              //     console.error(
              //       "Failed to apply adjustments and save comments:",
              //       err
              //     );
              //   }
              // }}
            >
              Apply
            </Button>
          </Flex>
        </Box>
      </Box>
    </Slide>
  );
}

export function AdjustmentTypeSelector({ onSelect, sessionIndex }) {
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
