import { useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  HStack,
  Text,
} from '@chakra-ui/react';
import { signIn, isSignedIn } from '../../utils/calendar';

const GoogleAuthModal = ({ isOpen, onClose, onSignInSuccess }) => {
  // Check if already signed in when modal opens
  useEffect(() => {
    if (isOpen && isSignedIn()) {
      // If already signed in, close modal and trigger success callback
      onSignInSuccess?.();
      onClose();
    }
  }, [isOpen, onClose, onSignInSuccess]);

  const handleSignIn = async () => {
    try {
      // Double-check if already signed in before attempting sign in
      if (isSignedIn()) {
        onSignInSuccess?.();
        onClose();
        return;
      }

      // If not signed in, proceed with sign in
      await signIn();
      
      // Verify sign in was successful
      if (isSignedIn()) {
        onSignInSuccess?.();
        onClose();
      }
    } catch (error) {
      console.error("Sign in error:", error);
      // Error handling can be added here if needed
      throw error; // Re-throw so parent can handle if needed
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      isCentered
    >
      <ModalOverlay />
      <ModalContent
        borderRadius="6px"
        maxW="464px"
        mx="auto"
      >
        <ModalHeader
          display="flex"
          justifyContent="space-between"
          alignItems="center" 
          marginTop="10px"
          marginBottom="-10px"
        >
          <Text
            fontSize="16px"
            color="#4A5568"
            fontWeight="700"
            fontFamily="Inter"
          >
            Sign in to Google Calendar
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text
            fontFamily="Inter"
            color="#474849"
            fontSize="14px"
            fontWeight="500"
            letterSpacing="0.07px"
            marginBottom="20px"
          >
            To sync your programs with Google Calendar, you need to sign in with your Google account.
          </Text>
          <HStack justifyContent="flex-end" gap="16px" padding="20px 10px 15px 10px">
            <Button
              display="flex"
              height="40px"
              padding="0px 16px"
              justifyContent="center"
              alignItems="center"
              gap="4px"
              borderRadius="6px"
              background="#EDF2F7"
              color="#2D3748"
              fontFamily="Inter"
              fontSize="14px"
              fontWeight="500"
              letterSpacing="0.07px"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              display="flex"
              height="40px"
              padding="0px 16px"
              justifyContent="center"
              alignItems="center"
              gap="4px"
              borderRadius="6px"
              background="#4441C8"
              color="white"
              fontFamily="Inter"
              fontSize="14px"
              fontWeight="500"
              letterSpacing="0.07px"
              onClick={handleSignIn}
            >
              Sign In
            </Button>
          </HStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default GoogleAuthModal;

