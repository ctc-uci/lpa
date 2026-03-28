import React, { useState } from 'react';
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

      if (waived && selectedAction === "Delete") {
        await backend.delete(`/bookings/${session.id}`);
      } else if (waived && selectedAction === "Archive") {
        await backend.put(`/bookings/${session.id}`, {
          archived: true,
        });
      } else {
        const invoiceData = await backend.get(`/invoices/event/${session.eventId}`);
        const invoice = invoiceData.data?.[0];
        if (!invoice) {
          console.warn("This session cannot be archived/deleted because no invoice exists. The session;s data may have been inputted manually with an invalid eventID.")
        }
        const roomData = await backend.get(`rooms/${session.roomId}`);
        const room = roomData.data[0];
        let programAdjustments = { data: [] };
        if (invoice) {
          programAdjustments = await backend.get(`/comments/program-invoice/${session.eventId}/${invoice.id}`);
        }

        const allInvoiceComments = await backend.get(`/comments/invoice/${invoice.id}`);
        let sessionAdjustments = [];
        if (allInvoiceComments.data.length !== 0) {
          sessionAdjustments = allInvoiceComments.data.filter(comment => comment.bookingId === session.id);
        }

        let modifiedRate = parseFloat(room.rate);

        if (programAdjustments.data.length !== 0) {
          for (const adj of programAdjustments.data) {
            if (adj.adjustmentType === "rate_flat") {
              modifiedRate += Number(adj.adjustmentValue);
            } else if (adj.adjustmentType === "rate_percent") {
              modifiedRate *= 1 + Number(adj.adjustmentValue) / 100;
            }
          }
        }

        if (sessionAdjustments.length !== 0) {
          for (const adj of sessionAdjustments.data) {
            if (adj.adjustmentType === "rate_flat") {
              modifiedRate += Number(adj.adjustmentValue);
            } else if (adj.adjustmentType === "rate_percent") {
              modifiedRate *= 1 + Number(adj.adjustmentValue) / 100;
            }
          }
        }

        const start = new Date(`1970-01-01T${session.startTime}:00`);
        const end = new Date(`1970-01-01T${session.endTime}:00`);
        const duration = (end - start) / (1000 * 60 * 60);
        const baseCost = modifiedRate * duration;

        const totalAdds = sessionAdjustments
          .filter(adj => adj.adjustment_type === "total")
          .reduce((acc, curr) => acc + Number(curr.adjustment_value), 0);

        const finalCost = baseCost + totalAdds;
        const comment = {
          user_id: userId,
          session_id: session.id,
          invoice_id: invoice.id,
          datetime: new Date(),
          comment: `Cancellation fee for ${formatSessionDateShort(session.date)}. ${cancellationReason}`,
          adjustment_type: "total",
          adjustment_value: finalCost,
        };

        await backend.post("/comments", comment);

        if (selectedAction === "Archive") {
          await backend.put(`/bookings/${session.id}`, {
            archived: true,
          });
        } else if (selectedAction === "Delete") {
          await backend.delete(`/bookings/${session.id}`);
        }
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

                {/* Past deadline notice */}
                {pastDeadlineCount > 0 && (
                  <Text fontSize="sm" color="gray.600">
                    The cancellation fee deadlines (2 weeks prior) have passed for {pastDeadlineCount} session{pastDeadlineCount > 1 ? "s" : ""}.
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
                        const aIsPast = isPastDeadline(a.date);
                        const bIsPast = isPastDeadline(b.date);
                        return bIsPast - aIsPast;
                      })
                      .map((session) => {
                        const pastDeadline = isPastDeadline(session.date);
                        return (
                          <Flex key={session.id} justify="space-between" align="center" py={1} px={2}>
                            <Text
                              fontSize="sm"
                              color={(waivedFees[session.id] ?? !pastDeadline) ? "gray.500" : "gray.800"}
                            >
                              {getSessionDayOfWeekLong(session.date)} {formatSessionDateShort(session.date)}
                            </Text>
                            <Checkbox
                              isChecked={waivedFees[session.id] ?? !pastDeadline}
                              onChange={() => handleWaiveFee(session.id)}
                              isDisabled={false}
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
                {selectedSessions.length > 0 && (
                  <Flex align="center" justify="space-between">
                    <Box>
                      <Text {...labelStyle}>Waive Fee</Text>
                      {isPastDeadline(selectedSessions[0].date) && (
                        <Text fontSize="xs" color="gray.500" mt={0.5}>
                          Cancellation deadline has passed
                        </Text>
                      )}
                    </Box>
                    <Checkbox
                      isChecked={waivedFees[selectedSessions[0].id] ?? !isPastDeadline(selectedSessions[0].date)}
                      onChange={() => handleWaiveFee(selectedSessions[0].id)}
                      sx={checkboxSx}
                    />
                  </Flex>
                )}

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
