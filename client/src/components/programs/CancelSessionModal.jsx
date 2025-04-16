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

export const CancelSessionModal = ({ 
  isOpen, 
  onClose, 
  selectedSessions = [], 
  onConfirm,
  eventType = "Session" // Default value
}) => {
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
  
  const handleConfirmAndClose = () => {
    onConfirm(selectedAction, cancellationReason, waivedFees);
    onClose(); // Close the modal after confirming
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
              
              {selectedSessions.map(session => (
                <Flex key={session.id} justify="space-between" align="center" mb={2}>
                  <Text>{getDayOfWeek(session.date)} {formatDate(session.date)}</Text>
                  
                  {isPastDeadline(session.date) && (
                    <Checkbox 
                      isChecked={waivedFees[session.id] || false}
                      onChange={() => handleWaiveFee(session.id)}
                      colorScheme="purple"
                    >
                      Waive Fee
                    </Checkbox>
                  )}
                </Flex>
              ))}
              
              <Box mt={6}>
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