import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  Box,
  Checkbox,
  Textarea,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Icon,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { ArchiveIcon } from '../../assets/ArchiveIcon';
import { DeleteIcon } from '../../assets/DeleteIcon';
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { getCurrentUser } from "../../utils/auth/firebase";
import { parseSessionDate, formatSessionDateShort, getSessionDayOfWeekLong } from "./utils";

const labelStyle = {
  fontSize: "sm",
  fontWeight: "semibold",
  color: "gray.600",
};

const ActionMenu = ({ selectedAction, selectedIcon, handleSelect }) => (
  <Menu>
    <MenuButton
      as={Button}
      rightIcon={<ChevronDownIcon />}
      bg="#F0F1F4"
      variant="outline"
      width="150px"
      justifyContent="space-between"
    >
      <Flex align="center">
        {typeof selectedIcon === 'function' ? (
          <Icon as={selectedIcon} mr={2} boxSize={4} />
        ) : (
          selectedIcon
        )}
        <Text>{selectedAction}</Text>
      </Flex>
    </MenuButton>
    <MenuList>
      <MenuItem
        icon={
          <Box display="inline-flex" alignItems="center">
            <Icon as={ArchiveIcon} boxSize={4} />
          </Box>
        }
        onClick={() => handleSelect("Archive", ArchiveIcon)}
        display="flex"
        alignItems="center"
      >
        Archive
      </MenuItem>
      <MenuItem
        icon={<DeleteIcon />}
        onClick={() => handleSelect("Delete", DeleteIcon)}
      >
        Delete
      </MenuItem>
    </MenuList>
  </Menu>
);

const checkboxSx = {
  ".chakra-checkbox__control": {
    borderColor: "#A0AEC0",
    backgroundColor: "#FFFFFF",
    _checked: {
      backgroundColor: "#3182CE",
      borderColor: "#3182CE",
    },
    _hover: {
      backgroundColor: "#2B6CB0",
      borderColor: "#2B6CB0",
    },
  },
  ".chakra-checkbox__icon": {
    svg: { fill: "#FFFFFF" },
  },
};

export const CancelSessionModal = ({
  isOpen,
  onClose,
  selectedSessions = [],
  setSelectedSessions,
  onConfirm,
  eventType = "Session",
  refreshSessions
}) => {
  const { backend } = useBackendContext();
  const [selectedAction, setSelectedAction] = useState("Archive");
  const [selectedIcon, setSelectedIcon] = useState(ArchiveIcon);
  const [cancellationReason, setCancellationReason] = useState("");
  const [waivedFees, setWaivedFees] = useState({});

  const handleSelect = (action, iconSrc) => {
    setSelectedAction(action);
    setSelectedIcon(iconSrc);
  };

  const handleWaiveFee = (sessionId) => {
    setWaivedFees({
      ...waivedFees,
      [sessionId]: !waivedFees[sessionId]
    });
  };

  const handleConfirmAndClose = async () => {
    const currentFirebaseUser = await getCurrentUser();
    const firebaseUid = currentFirebaseUser?.uid;

    if (!firebaseUid) {
      console.error("No logged in user");
      return;
    }

    const userRes = await backend.get(`/users/${firebaseUid}`);
    const userId = userRes.data[0].id;

    for (const session of selectedSessions) {
      const pastDeadline = isPastDeadline(session.date);
      const waived = waivedFees[session.id] ?? !pastDeadline;

      const invoiceData = await backend.get(`/invoices/event/${session.eventId}`, {
        params: { date: session.date },
      });
      const invoice = invoiceData.data?.[0];

      if (invoice) {
        let finalCost = 0;

        if (!waived) {
          const roomData = await backend.get(`rooms/${session.roomId}`);
          const room = roomData.data[0];
          const programAdjustments = await backend.get(`/comments/program-invoice/${session.eventId}/${invoice.id}`);

          const allInvoiceComments = await backend.get(`/comments/invoice/${invoice.id}`);
          const sessionAdjustments = allInvoiceComments.data.filter(comment => comment.bookingId === session.id);

          let modifiedRate = parseFloat(room.rate);

          for (const adj of programAdjustments.data) {
            if (adj.adjustmentType === "rate_flat") {
              modifiedRate += Number(adj.adjustmentValue);
            } else if (adj.adjustmentType === "rate_percent") {
              modifiedRate *= 1 + Number(adj.adjustmentValue) / 100;
            }
          }

          for (const adj of sessionAdjustments) {
            if (adj.adjustmentType === "rate_flat") {
              modifiedRate += Number(adj.adjustmentValue);
            } else if (adj.adjustmentType === "rate_percent") {
              modifiedRate *= 1 + Number(adj.adjustmentValue) / 100;
            }
          }

          const start = new Date(`1970-01-01T${session.startTime}:00`);
          const end = new Date(`1970-01-01T${session.endTime}:00`);
          const duration = (end - start) / (1000 * 60 * 60);
          const baseCost = modifiedRate * duration;

          const totalAdds = sessionAdjustments
            .filter(adj => adj.adjustmentType === "total")
            .reduce((acc, curr) => acc + Number(curr.adjustmentValue), 0);

          finalCost = Math.abs(baseCost + totalAdds);
        }

        await backend.post("/comments", {
          user_id: userId,
          invoice_id: invoice.id,
          datetime: new Date(),
          comment: `Cancellation fee for ${formatSessionDateShort(session.date)}${cancellationReason ? `. ${cancellationReason}` : ""}`,
          adjustment_type: "total",
          adjustment_value: finalCost,
        });
      } else {
        console.warn("No invoice found for session — cancellation row not added.");
      }

      if (selectedAction === "Archive") {
        await backend.put(`/bookings/${session.id}`, { archived: true });
      } else if (selectedAction === "Delete") {
        await backend.delete(`/bookings/${session.id}`);
      }
    }
    await refreshSessions();
    setSelectedSessions([]);
    onClose();
  };

  const isPastDeadline = (isoString) => {
    const sessionDate = parseSessionDate(isoString);
    if (!sessionDate) return false;
    const today = new Date();
    const twoWeeksInMs = 14 * 24 * 60 * 60 * 1000;
    const deadlineDate = new Date(sessionDate.getTime() - twoWeeksInMs);
    return today > deadlineDate;
  };

  const isMultipleSelection = selectedSessions.length > 1;

  const pastDeadlineCount = selectedSessions.filter(session =>
    isPastDeadline(session.date)
  ).length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent borderRadius="md">
        {isMultipleSelection ? (
          <>
            <ModalHeader>Cancel {selectedSessions.length} sessions?</ModalHeader>
            <ModalBody>
              <Flex direction="column" gap={4}>

                {/* Action */}
                <Box>
                  <Text {...labelStyle} mb={2}>Action</Text>
                  <ActionMenu
                    selectedAction={selectedAction}
                    selectedIcon={selectedIcon}
                    handleSelect={handleSelect}
                  />
                </Box>

                {/* Action description */}
                {selectedAction === "Delete" ? (
                  <Text fontSize="sm" fontStyle="italic" color="gray.500">
                    Deleted sessions will no longer appear in the sessions table.
                  </Text>
                ) : (
                  <Text fontSize="sm" fontStyle="italic" color="gray.500">
                    Archived sessions will remain visible in the sessions table with a cancelled status.
                  </Text>
                )}


                {/* Waive Fee */}
                <Box>
                  <Text {...labelStyle} mb={2}>Waive Fee</Text>
                  <Box
                    maxH="120px"
                    overflowY="auto"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                    p={2}
                  >
                    {selectedSessions
                      .slice()
                      .sort((a, b) => {
                        const dateA = parseSessionDate(a.date)?.getTime() ?? 0;
                        const dateB = parseSessionDate(b.date)?.getTime() ?? 0;
                        return dateA - dateB;
                      })
                      .map((session) => {
                        const pastDeadline = isPastDeadline(session.date);
                        const isWaived = waivedFees[session.id] ?? !pastDeadline;
                        return (
                          <Flex key={session.id} justify="space-between" align="center" py={1} px={2}>
                            <Box>
                              <Text fontSize="sm" color="gray.800">
                                {getSessionDayOfWeekLong(session.date)} {formatSessionDateShort(session.date)}
                              </Text>
                              <Text fontSize="xs" color={isWaived ? "green.500" : "red.500"}>
                                {isWaived ? "Fee waived" : "Fee charged"}
                              </Text>
                            </Box>
                            <Checkbox
                              isChecked={isWaived}
                              onChange={() => handleWaiveFee(session.id)}
                              sx={checkboxSx}
                            />
                          </Flex>
                        );
                      })}
                  </Box>
                </Box>

                

                {/* Reason */}
                <Box>
                  <Text {...labelStyle} mb={2}>Reason for cancellation</Text>
                  <Textarea
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    size="md"
                    bg="#F8F9FA"
                    borderRadius="md"
                    resize="vertical"
                    minH="100px"
                  />
                </Box>

              </Flex>
            </ModalBody>
          </>
        ) : (
          <>
            <ModalHeader>
              Cancel Session?
              {selectedSessions.length > 0 && (
                <Text fontSize="sm" fontWeight="normal" color="gray.600" mt={1}>
                  {getSessionDayOfWeekLong(selectedSessions[0].date)} {formatSessionDateShort(selectedSessions[0].date)}
                </Text>
              )}
            </ModalHeader>
            <ModalBody>
              <Flex direction="column" gap={4}>

                {/* Action */}
                <Box>
                  <Text {...labelStyle} mb={2}>Action</Text>
                  <ActionMenu
                    selectedAction={selectedAction}
                    selectedIcon={selectedIcon}
                    handleSelect={handleSelect}
                  />
                </Box>

                {/* Action description */}
                {selectedAction === "Delete" ? (
                  <Text fontSize="sm" fontStyle="italic" color="gray.500">
                    Deleted sessions will no longer appear in the sessions table.
                  </Text>
                ) : (
                  <Text fontSize="sm" fontStyle="italic" color="gray.500">
                    Archived sessions will remain visible in the sessions table with a cancelled status.
                  </Text>
                )}

                {/* Waive Fee */}
                {selectedSessions.length > 0 && (() => {
                  const session = selectedSessions[0];
                  const pastDeadline = isPastDeadline(session.date);
                  const isWaived = waivedFees[session.id] ?? !pastDeadline;
                  return (
                    <Flex align="center" justify="space-between">
                      <Box>
                        <Text {...labelStyle}>Waive Fee</Text>
                        <Text fontSize="xs" color={isWaived ? "green.500" : "red.500"} mt={0.5}>
                          {isWaived ? "Fee waived" : "Fee charged"}
                        </Text>
                      </Box>
                      <Checkbox
                        isChecked={isWaived}
                        onChange={() => handleWaiveFee(session.id)}
                        sx={checkboxSx}
                      />
                    </Flex>
                  );
                })()}

                {/* Reason */}
                <Box>
                  <Text {...labelStyle} mb={2}>Reason for cancellation</Text>
                  <Textarea
                    placeholder="Enter reason for cancellation..."
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    size="md"
                    bg="#F8F9FA"
                    borderRadius="md"
                    resize="vertical"
                    minH="100px"
                  />
                </Box>

              </Flex>
            </ModalBody>
          </>
        )}

        <ModalFooter>
          <Button
            onClick={onClose}
            mr={3}
            variant="outline"
            color="gray.600"
            borderRadius="30px"
            fontWeight="normal"
          >
            Exit
          </Button>
          <Button
            bg="#90080F"
            color="white"
            borderRadius="30px"
            onClick={handleConfirmAndClose}
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CancelSessionModal;

export const UncancelSessionModal = ({ isOpen, onClose, selectedSessions = [], setSelectedSessions, onConfirm }) => {
  const { backend } = useBackendContext();
  const [cancellationFees, setCancellationFees] = useState([]);
  const [removeFee, setRemoveFee] = useState(true);

  useEffect(() => {
    if (!isOpen || selectedSessions.length === 0) return;
    const fetchFees = async () => {
      const allFees = [];
      for (const session of selectedSessions) {
        const invoiceData = await backend.get(`/invoices/event/${session.eventId}`, {
          params: { date: session.date },
        });
        const invoice = invoiceData.data?.[0];
        if (!invoice) continue;
        const res = await backend.get(`/comments/invoice/summary/${invoice.id}`);
        const dateLabel = formatSessionDateShort(session.date);
        const fees = (res.data || [])
          .flatMap((group) => group.total || [])
          .filter((c) => c.comment?.startsWith(`Cancellation fee for ${dateLabel}`));
        allFees.push(...fees);
      }
      setCancellationFees(allFees);
      setRemoveFee(allFees.length > 0);
    };
    fetchFees();
  }, [isOpen, selectedSessions]);

  const handleConfirm = async () => {
    if (selectedSessions.length === 0) return;
    if (removeFee && cancellationFees.length > 0) {
      await Promise.all(cancellationFees.map((fee) => backend.delete(`/comments/${fee.id}`)));
    }
    await Promise.all(
      selectedSessions.map((session) => backend.put(`/bookings/${session.id}`, { archived: false }))
    );
    setSelectedSessions([]);
    onClose();
    if (onConfirm) onConfirm();
  };

  const isMultiple = selectedSessions.length > 1;
  const totalFeeAmount = cancellationFees.reduce((sum, f) => sum + Number(f.value ?? f.adjustmentValue), 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent borderRadius="md">
        <ModalHeader>
          {isMultiple ? `Uncancel ${selectedSessions.length} Sessions?` : "Uncancel Session?"}
          {!isMultiple && selectedSessions[0] && (
            <Text fontSize="sm" fontWeight="normal" color="gray.600" mt={1}>
              {getSessionDayOfWeekLong(selectedSessions[0].date)} {formatSessionDateShort(selectedSessions[0].date)}
            </Text>
          )}
        </ModalHeader>
        <ModalBody>
          <Flex direction="column" gap={4}>
            {cancellationFees.length > 0 ? (
              <Flex align="center" justify="space-between">
                <Box>
                  <Text {...labelStyle}>Remove Cancellation Fee{isMultiple ? "s" : ""}</Text>
                  <Text fontSize="xs" color="gray.500" mt={0.5}>
                    ${totalFeeAmount.toFixed(2)} will be removed from the invoice
                  </Text>
                </Box>
                <Checkbox
                  isChecked={removeFee}
                  onChange={() => setRemoveFee((prev) => !prev)}
                  sx={checkboxSx}
                />
              </Flex>
            ) : (
              <Text fontSize="sm" color="gray.500" fontStyle="italic">
                No cancellation fee{isMultiple ? "s" : ""} found on the invoice for {isMultiple ? "these sessions" : "this session"}.
              </Text>
            )}
          </Flex>
        </ModalBody>
        <ModalFooter>
          <Button
            onClick={onClose}
            mr={3}
            variant="outline"
            color="gray.600"
            borderRadius="30px"
            fontWeight="normal"
          >
            Exit
          </Button>
          <Button
            bg="#0C824D"
            color="white"
            borderRadius="30px"
            onClick={handleConfirm}
          >
            Uncancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
