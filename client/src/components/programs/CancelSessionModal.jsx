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
    console.log("HERE IS USER:", userId);

    for (const session of selectedSessions) {
      const pastDeadline = isPastDeadline(session.date);
      const waived = waivedFees[session.id];

      if ((!pastDeadline || waived) && selectedAction === "Delete") {
        // Fee is waived / session is deleted
        await backend.delete(`/bookings/${session.id}`);
      } else if ((!pastDeadline || waived) && selectedAction === "Archive") {
        await backend.patch(`/bookings/archive/${session.id}`);
      } else {
        const invoiceData = await backend.get(`/invoices/event/${session.eventId}`);
        const invoice = invoiceData.data[0];
        const roomData = await backend.get(`rooms/${session.roomId}`);
        const room = roomData.data[0];
        const programAdjustments = await backend.get(`/comments/program-invoice/${session.eventId}/${invoice.id}`);
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
          await backend.patch(`/bookings/archive/${session.id}`)
        } else if (selectedAction === "Delete") {
          await backend.delete(`/bookings/${session.id}`);
        }

      }
    }
    // Refresh sessions so the table updates
    await refreshSessions();
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
              {selectedSessions.map(session => (
                <Flex key={session.id} justify="space-between" align="center" mb={2}>
                  <Text>{getDayOfWeek(session.date)} {formatDate(session.date)}</Text>

                  {isPastDeadline(session.date) && (
                    <Checkbox
                      isChecked={waivedFees[session.id] || false}
                      onChange={() => handleWaiveFee(session.id)}
                      colorScheme="purple"
                      marginRight="25px"
                    >
                    </Checkbox>
                  )}
                </Flex>
              ))}

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
            _hover={{ bg: "#7D070D" }}
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
