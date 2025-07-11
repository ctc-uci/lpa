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


export const CancelSessionModal = ({
  isOpen,
  onClose,
  selectedSessions = [],
  setSelectedSessions,
  onConfirm,
  eventType = "Session", // Default value
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
      const waived = waivedFees[session.id];

      if ((!pastDeadline || waived) && selectedAction === "Delete") {
        // Fee is waived / session is deleted
        await backend.delete(`/bookings/${session.id}`);
      } else if ((!pastDeadline || waived) && selectedAction === "Archive") {
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
        // Check if invoice exists before calling backend for program Adjustments
        let programAdjustments = { data: [] };
        if (invoice) {
          programAdjustments = await backend.get(`/comments/program-invoice/${session.eventId}/${invoice.id}`);
        }

        const allInvoiceComments = await backend.get(`/comments/invoice/${invoice.id}`);
        // Filter allInvoiceComments to get only those matching booking_id
        let sessionAdjustments = [];
        if (allInvoiceComments.data.length !== 0) {
          sessionAdjustments = allInvoiceComments.data.filter(comment => comment.bookingId === session.id);
        }

        // Variable that will keep track of the final room rate after adjustments are applied
        let modifiedRate = parseFloat(room.rate);

        // Apply program adjustments
        if (programAdjustments.data.length !== 0) {
          for (const adj of programAdjustments.data) {
            if (adj.adjustmentType === "rate_flat") {
              modifiedRate += Number(adj.adjustmentValue);
            } else if (adj.adjustmentType === "rate_percent") {
              modifiedRate *= 1 + Number(adj.adjustmentValue) / 100;
            }
          }
        }

        // Apply session adjustments
        if (sessionAdjustments.length !== 0) {
          for (const adj of sessionAdjustments.data) {
            if (adj.adjustmentType === "rate_flat") {
              modifiedRate += Number(adj.adjustmentValue);
            } else if (adj.adjustmentType === "rate_percent") {
              modifiedRate *= 1 + Number(adj.adjustmentValue) / 100;
            }
          }
        }

        // Calculate by duration
        const start = new Date(`1970-01-01T${session.startTime}:00`);
        const end = new Date(`1970-01-01T${session.endTime}:00`);
        const duration = (end - start) / (1000 * 60 * 60); // in hours
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
          comment: `Cancellation adjustment for ${formatDate(session.date)}. ${cancellationReason}`,
          adjustment_type: "total",
          adjustment_value: finalCost,
        };

        await backend.post("/comments", comment);

        // Set based on action
        if (selectedAction === "Archive") {
          await backend.put(`/bookings/${session.id}`, {
            archived: true,
          });
        } else if (selectedAction === "Delete") {
          await backend.delete(`/bookings/${session.id}`);
        }

      }
    }
    // Refresh sessions so the table updates
    await refreshSessions();
    // Set selectedSessions back to 0
    setSelectedSessions([]);
    onClose();
  };

  // Format the date from ISO string
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: "2-digit",
      day: "2-digit",
      year: "numeric"
    });
  };

  // Get day of week
  const getDayOfWeek = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  // Determine if a session is past the cancellation deadline (2 weeks prior)
  const isPastDeadline = (isoString) => {
    const sessionDate = new Date(isoString);
    const today = new Date();
    const twoWeeksInMs = 14 * 24 * 60 * 60 * 1000;
    const deadlineDate = new Date(sessionDate.getTime() - twoWeeksInMs);

    return today > deadlineDate;
  };

  const isMultipleSelection = selectedSessions.length > 1;

  // Count sessions past deadline
  const pastDeadlineCount = selectedSessions.filter(session =>
    isPastDeadline(session.date)
  ).length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent borderRadius="md">
        {isMultipleSelection ? (
          // Multiple sessions selected
          <>
            <ModalHeader>
              Cancel {selectedSessions.length} sessions?
            </ModalHeader>
            <ModalBody>
              {pastDeadlineCount > 0 && (
                <Text mb={4}>
                  The cancellation fee deadlines (2 weeks prior) have passed for {pastDeadlineCount} sessions.
                </Text>
              )}

              <Box display="flex" justifyContent="flex-end" alignItems="center" gap="24px" alignSelf="stretch">
                <Text>Waive Fee</Text>
              </Box>
              <Box
                maxH="90px"
                overflowY="auto"
                pr={2}
                mb={4}
              >
                {selectedSessions
                  .slice() // Copy to avoid mutating original
                  .sort((a, b) => {
                    const aIsPast = isPastDeadline(a.date);
                    const bIsPast = isPastDeadline(b.date);
                    return bIsPast - aIsPast; // Show sessions with past deadline first
                  })
                  .map((session) => {
                    const pastDeadline = isPastDeadline(session.date);
                    return (
                      <Flex key={session.id} justify="space-between" align="center" mb={2} px={2}>
                        <Text color={!pastDeadline || waivedFees[session.id] ? "gray.500" : "black"}>
                          {getDayOfWeek(session.date)} {formatDate(session.date)}
                        </Text>

                        <Checkbox
                          isChecked={
                            pastDeadline
                              ? waivedFees[session.id] || false
                              : true
                          }
                          onChange={() => pastDeadline && handleWaiveFee(session.id)}
                          marginRight="13px"
                          isDisabled={false}
                          sx={{
                            ".chakra-checkbox__control": {
                              borderColor: "#A0AEC0",
                              backgroundColor: "#FFFFFF",
                              _checked: {
                                backgroundColor: "#A0AEC0",
                                borderColor: "#A0AEC0",
                              },
                              _hover: {
                                backgroundColor: "#A0AEC0",
                                borderColor: "#A0AEC0",
                              },
                            },
                            ".chakra-checkbox__icon": {
                              svg: {
                                fill: "#FFFFFF",
                              },
                            },
                          }}
                        />
                      </Flex>
                    );
                  })}
              </Box>

              <Box mt={6}>
                <Text mb={2} fontWeight="medium">Reason for cancellation:</Text>
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

              <Box mt={4} display="flex" justifyContent="flex-end">
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
              </Box>
            </ModalBody>
          </>
        ) : (
          // Single session selected
          <>
            <ModalHeader>
              Cancel {eventType}?
            </ModalHeader>
            <ModalBody>
              {selectedSessions.length > 0 && (
                <Text mb={4}>
                  The cancellation fee deadline for this {eventType.toLowerCase()} is {formatDate(selectedSessions[0].date)}.
                </Text>
              )}

              <Box>
                <Text mb={2} fontWeight="medium">Reason for cancellation:</Text>
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

              <Box mt={4} display="flex" justifyContent="flex-end">
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
              </Box>
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
            onClick={handleConfirmAndClose} // Use the new handler that calls onConfirm and onClose
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CancelSessionModal;
