import {
  Slide,
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Icon,
  Text,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Input
} from "@chakra-ui/react";
import { CancelIcon, PlusIcon } from "../../assets/EditInvoiceIcons";
import { format } from "date-fns";

export default function RoomFeeAdjustmentSideBar({
  isOpen,
  onClose,
  comment,
  booking,
  room,
  addAdjustment,
  adjustments,
  setAdjustments
}) {
  const calculateNewTotals = () => {
    let newRate = Number(room && room.length > 0 ? room[0].rate : 0);

    adjustments.forEach(adj => {
      const amount = adj.type === "dollar"
        ? Number(adj.value || 0)
        : (Number(adj.value || 0) / 100) * Number(adj.appliedRate || 0);

      newRate += adj.isNegative ? -amount : amount;
    });

    const timeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const startMinutes = booking?.startTime
      ? timeToMinutes(booking.startTime.substring(0, 5))
      : 0;
    const endMinutes = booking?.endTime
      ? timeToMinutes(booking.endTime.substring(0, 5))
      : 0;

    const diffMinutes = endMinutes - startMinutes;
    const hours = Math.ceil(diffMinutes / 60);

    const newTotal = newRate * hours;

    return {
      newRate,
      newTotal
    };
  };

  const { newRate, newTotal } = calculateNewTotals();

  return (
    <Slide direction="right" in={isOpen} style={{ zIndex: 200 }}>
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
        <Flex alignItems="center" gap="26px" alignSelf="stretch" whiteSpace="nowrap">
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
            {comment?.datetime ? format(new Date(comment.datetime), "M/d/yy") : "N/A"} Room Fee Adjustment
          </Text>
          <AdjustmentTypeSelector onSelect={(type) => {
            addAdjustment(type, booking.id);
          }} />
        </Flex>

        <Box
          marginTop="4px"
          overflowY="auto"
          flex="1"
        >
          {adjustments.map((adj, index) => (
            <Box
              key={index}
              borderBottom="1px solid #E2E8F0"
              py={3}
              mt={3}
            >
              <Flex justify="space-between" align="center">
                <Text fontWeight="bold">
                  {adj.type === "dollar" ? "Dollar ($)" : "Percent (%)"}
                </Text>
                <IconButton
                  aria-label="Remove adjustment"
                  icon={<Icon as={CancelIcon} />}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newAdjustments = adjustments.filter((_, i) => i !== index);
                    setAdjustments(newAdjustments);
                  }}
                />
              </Flex>

              {/* Second row: applied rate + controls */}
              <Flex align="center" gap={2} mt={2}>
                <Text fontSize="sm" color="gray.500">
                  Applied to: ${Number(adj.appliedRate || 0).toFixed(2)}/hr
                </Text>

                <IconButton
                  aria-label="Toggle sign"
                  icon={adj.isNegative ? "−" : "+"}
                  variant="ghost"
                  size="xs"
                  onClick={() => {
                    const newAdjustments = adjustments.map((a, i) =>
                      i === index ? { ...a, isNegative: !a.isNegative } : a
                    );
                    setAdjustments(newAdjustments);
                  }}
                />

                {adj.type === "dollar" ? (
                  <>
                    <Text>$</Text>
                    <Input
                      value={adj.value}
                      onChange={(e) => {
                        const newAdjustments = adjustments.map((a, i) =>
                          i === index ? { ...a, value: parseFloat(e.target.value) || 0 } : a
                        );
                        setAdjustments(newAdjustments);
                      }}
                      size="sm"
                      width="80px"
                    />
                  </>
                ) : (
                  <>
                    <Input
                      value={adj.value}
                      onChange={(e) => {
                        const newAdjustments = adjustments.map((a, i) =>
                          i === index ? { ...a, value: parseFloat(e.target.value) || 0 } : a
                        );
                        setAdjustments(newAdjustments);
                      }}
                      size="sm"
                      width="80px"
                    />
                    <Text>%</Text>
                  </>
                )}


              </Flex>
            </Box>
          ))}
        </Box>
        <Box mt={4} p={2}>
          <Flex justifyContent="right" alignItems="center" gap="10px">
            <Heading
              size="xs"
              color="#718096"
              marginRight="15px"
            >
              NEW ROOM FEE
            </Heading>
            <Heading size="md"> ${Number(newRate || 0).toFixed(2)}/hr</Heading>
          </Flex>
          <Flex justifyContent="right" alignItems="center" gap="10px" marginTop="10px">
            <Heading
              size="xs"
              color="#718096"
              marginRight="15px"
            >
              NEW SESSION TOTAL
            </Heading>
            <Heading size="md"> ${Number(newTotal || 0).toFixed(2)}</Heading>
          </Flex>
          <Flex mt="30px" justifyContent="flex-end" alignItems="center" gap="4px">
            <Button
              variant="ghost"
              fontSize="14px"
              fontWeight="500"
              color="#2D3748"
              onClick={() => setAdjustments([])}
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
              onClick={() => {
                console.log("Apply clicked for booking", booking.id);
                console.log("Current adjustments:", adjustments);
              }}
              _hover={{ bg: "#322EAF" }}
            >
              Apply
            </Button>
          </Flex>
        </Box>
      </Box>
    </Slide>
  );
}

export function AdjustmentTypeSelector({ onSelect }) {
  return (
    <Menu>
      <MenuButton
        as={IconButton}
        icon={<Icon as={PlusIcon} />}
        variant="ghost"
        size="sm"
        marginLeft="60px"
      />
      <MenuList minW="120px" w="120px">
        <MenuItem
          onClick={() => onSelect("dollar")}
        >
          Dollar ($)
        </MenuItem>
        <MenuItem
        onClick={() => onSelect("percent")}
        >
          Percent (%)
        </MenuItem>
      </MenuList>
    </Menu>
  );
}

