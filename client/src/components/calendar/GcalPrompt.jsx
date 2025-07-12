import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  HStack,
  Icon,
  Text,
  Divider,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const GcalPrompt = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

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
              Sync Google Calendar
          </Text>
        </ModalHeader>
        <ModalBody>
          <Text
            fontFamily="Inter"
            color="#474849"
            fontSize="14px"
            fontWeight="500"
            letterSpacing="0.07px"
            marginBottom="10px"
          >
            This portal is not synced to Google Calendar. <b>Please enter your Google Calendar email in Settings</b> to stay organized.
          </Text>
          <Text
            fontFamily="Inter"
            color="#474849"
            fontSize="14px"
            fontWeight="500"
            letterSpacing="0.07px"
          >
            Google may also log you out after a period of inactivity.
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
              Maybe Later
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
              onClick={() => {
                navigate("/settings/googlecalendar");
              }}
            >
              Go To Settings
            </Button>
          </HStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default GcalPrompt;