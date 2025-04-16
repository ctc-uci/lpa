import React, { useState } from 'react';
import { Box, Flex, Popover, Button, useDisclosure } from '@chakra-ui/react';
import CancelSessionModal from './CancelSessionModal'; // Import the modal we just created

// CancelIcon SVG component
const CancelIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8.00065 1.3335C4.31398 1.3335 1.33398 4.3135 1.33398 8.00016C1.33398 11.6868 4.31398 14.6668 8.00065 14.6668C11.6873 14.6668 14.6673 11.6868 14.6673 8.00016C14.6673 4.3135 11.6873 1.3335 8.00065 1.3335ZM11.334 10.3935L10.394 11.3335L8.00065 8.94016L5.60732 11.3335L4.66732 10.3935L7.06065 8.00016L4.66732 5.60683L5.60732 4.66683L8.00065 7.06016L10.394 4.66683L11.334 5.60683L8.94065 8.00016L11.334 10.3935Z" fill="white"/>
  </svg>
);

const SessionsToolbar = () => {
  // States for the component
  const [isSelected, setIsSelected] = useState(false);
  const [selectMenuOpen, setSelectMenuOpen] = useState(false);
  const [selectedSessions, setSelectedSessions] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // This would be replaced with your real data
  const eventType = "Workshop"; // Example for single session case

  // Handle opening the cancel modal
  const handleCancelClick = () => {
    if (selectedSessions.length > 0) {
      onOpen();
    }
  };

  // Handle the confirmation action from the modal
  const handleConfirmCancel = (action, reason, waivedFees) => {
    // This is where you would implement the cancellation functionality
    console.log("Action:", action);
    console.log("Reason:", reason);
    console.log("Waived Fees:", waivedFees);
    console.log("Sessions to cancel:", selectedSessions);
    
    // Reset states after cancellation
    setSelectedSessions([]);
    setIsSelected(false);
    onClose();
  };

  return (
    <Flex gap="12px" alignItems="center">
      {/* Select Button */}
      <Box position="relative">
        <button
          style={{
            display: "flex",
            height: "40px",
            padding: "0px 16px",
            justifyContent: "center",
            alignItems: "center",
            gap: "4px",
            flex: "1 0 0",
            borderRadius: "6px",
            backgroundColor: "var(--Secondary-2-Default, #EDF2F7)",
            color: isSelected ? "#4441C8" : "inherit",
            fontFamily: "Inter",
            fontSize: "14px",
            fontStyle: "normal",
            fontWeight: "700",
            lineHeight: "normal",
            letterSpacing: "0.07px",
          }}
          onClick={() => {
            setSelectMenuOpen(!selectMenuOpen);
            setIsSelected(!isSelected);
          }}
          data-select-menu="true"
        >
          Select
        </button>
        
        {/* Select dropdown menu would go here */}
      </Box>
      
      {/* Cancel button - only shows when isSelected is true */}
      {isSelected && (
        <button
          style={{
            display: "flex",
            height: "40px",
            padding: "0px 16px",
            justifyContent: "center",
            alignItems: "center",
            gap: "4px",
            borderRadius: "6px",
            background: "var(--destructive, #90080F)",
            color: "white",
            fontFamily: "Inter",
            fontSize: "14px",
            fontStyle: "normal",
            fontWeight: "700",
            lineHeight: "normal",
            letterSpacing: "0.07px",
            border: "none",
            cursor: "pointer",
          }}
          onClick={handleCancelClick}
          disabled={selectedSessions.length === 0}
        >
          <CancelIcon /> Cancel
        </button>
      )}

      {/* Filter Button */}
      <Popover>
        <Button
          display="flex"
          height="40px"
          padding="0px 16px"
          justifyContent="center"
          alignItems="center"
          gap="4px"
          borderRadius="6px"
          bg="var(--Secondary-2-Default, #EDF2F7)"
          color="#2D3748"
          fontFamily="Inter"
          fontSize="14px"
        >
          Filters
        </Button>
      </Popover>

      {/* The Cancel Session Modal */}
      <CancelSessionModal
        isOpen={isOpen}
        onClose={onClose}
        selectedSessions={selectedSessions}
        onConfirm={handleConfirmCancel}
        eventType={selectedSessions.length === 1 ? eventType : "Sessions"}
      />
    </Flex>
  );
};

export default SessionsToolbar;