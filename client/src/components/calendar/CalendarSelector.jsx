import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  useToast,
  Spinner,
  VStack,
  HStack,
  Icon,
  Tag,
} from '@chakra-ui/react';
import { FaCalendarAlt, FaCheckCircle } from 'react-icons/fa';
import { getAvailableCalendars, initializeGoogleCalendar } from '../../utils/calendar';
import { useSelectedCalendar, isSignedIn } from '../../utils/calendar';
import GoogleAuthModal from './GoogleAuthModal';

/**
 * Component that displays available calendars and allows selection
 */
const CalendarSelector = () => {
  const [calendars, setCalendars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCalendar, setSelectedCalendar] = useSelectedCalendar();
  const [isInitialized, setIsInitialized] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const toast = useToast();

  // Initialize Google Calendar API
  useEffect(() => {
    const initApi = async () => {
      try {
        // Initialize without triggering silent auth to prevent auto-redirect
        await initializeGoogleCalendar({ skipSilentAuth: true });
        setIsInitialized(true);
      } catch (err) {
        console.error('Failed to initialize Google Calendar API:', err);
        setError('Failed to initialize Google Calendar. Please try again.');
        setLoading(false);
      }
    };

    initApi();
  }, []);

  // Fetch calendars when API is initialized
  useEffect(() => {
    const fetchCalendars = async () => {
      if (!isInitialized) return;

      try {
        setLoading(true);
        setError(null);

        // Check if user is signed in - only show modal if not signed in
        // Don't auto-open modal, let user choose to sign in
        if (!isSignedIn()) {
          setLoading(false);
          return;
        }

        const availableCalendars = await getAvailableCalendars();
        setCalendars(availableCalendars);
        
        // If no calendar is selected yet, select the primary calendar
        if (!selectedCalendar && availableCalendars.length > 0) {
          const primaryCalendar = availableCalendars.find(cal => cal.primary) || availableCalendars[0];
          setSelectedCalendar(primaryCalendar);
          toast({
            title: "Calendar Selected",
            description: `Primary calendar "${primaryCalendar.summary}" has been selected.`,
            status: "success",
            duration: 3000,
            isClosable: true,
            position: "bottom-right",
          });
        }
      } catch (err) {
        console.error('Error fetching calendars:', err);
        if (err.message.includes('not initialized')) {
          return;
        }
        setError('Failed to load calendars. Please try again.');
        toast({
          title: "Error Loading Calendars",
          description: "Please try again or refresh the page.",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom-right",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCalendars();
  }, [isInitialized, selectedCalendar, toast, setSelectedCalendar]);

  // Refetch calendars after successful sign in
  const handleSignInSuccess = async () => {
    try {
      setLoading(true);
      const availableCalendars = await getAvailableCalendars();
      setCalendars(availableCalendars);
      
      // If no calendar is selected yet, select the primary calendar
      if (!selectedCalendar && availableCalendars.length > 0) {
        const primaryCalendar = availableCalendars.find(cal => cal.primary) || availableCalendars[0];
        setSelectedCalendar(primaryCalendar);
        toast({
          title: "Calendar Selected",
          description: `Primary calendar "${primaryCalendar.summary}" has been selected.`,
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "bottom-right",
        });
      }
    } catch (err) {
      console.error('Error fetching calendars after sign in:', err);
      setError('Failed to load calendars. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isInitialized) {
    return (
      <Flex justify="center" align="center" p={8}>
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text color="#474849" fontSize="16px" fontWeight="500">Initializing Google Calendar...</Text>
        </VStack>
      </Flex>
    );
  }

  if (!isSignedIn()) {
    return (
      <>
        <GoogleAuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)}
          onSignInSuccess={handleSignInSuccess}
        />
        <Flex justify="center" align="center" p={8}>
          <VStack spacing={4}>
            <Text color="#474849" fontSize="16px" fontWeight="500">Please sign in to Google to use this feature.</Text>
            <Button
              onClick={() => setShowAuthModal(true)}
              backgroundColor="#4E4AE7"
              color="white"
              _hover={{ backgroundColor: "#3B3AC7" }}
              fontFamily="Inter"
              fontSize="14px"
              fontWeight="500"
              padding="8px 16px"
            >
              Sign In to Google Calendar
            </Button>
          </VStack>
        </Flex>
      </>
    );
  }

  if (loading) {
    return (
      <Flex justify="center" align="center" p={8}>
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text color="#474849" fontSize="16px" fontWeight="500">Loading calendars...</Text>
        </VStack>
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex direction="column" align="center" p={8} gap={4}>
        <Text color="#E53E3E" fontSize="16px" fontWeight="500">{error}</Text>
        <Button
          onClick={() => {
            setError(null);
            setLoading(true);
            setIsInitialized(false);
          }}
          backgroundColor="#4E4AE7"
          color="white"
          _hover={{ backgroundColor: "#3B3AC7" }}
          fontFamily="Inter"
          fontSize="14px"
          fontWeight="500"
          padding="8px 16px"
        >
          Retry
        </Button>
      </Flex>
    );
  }

  // Sort calendars to put selected calendar first
  const sortedCalendars = [...calendars].sort((a, b) => {
    if (a.id === selectedCalendar?.id) return -1;
    if (b.id === selectedCalendar?.id) return 1;
    if (a.primary) return -1;
    if (b.primary) return 1;
    return a.summary.localeCompare(b.summary);
  });

  return (
    <>
      <GoogleAuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onSignInSuccess={handleSignInSuccess}
      />
      <Box maxW="1000px" mx="auto">
        <VStack spacing={6} align="stretch">
          <Heading
            fontSize="clamp(1rem, 1.5rem, 2rem)"
            color="#2D3748"
            fontWeight="bold"
            fontFamily="Inter"
          >
            Calendar Selection
          </Heading>

        <Box
          borderRadius="15px"
          borderWidth="1px"
          borderColor="#E2E8F0"
          overflow="hidden"
          maxHeight="500px"
          overflowY="scroll"
        >
          <Table variant="simple">
            <Thead backgroundColor="#F7FAFC">
              <Tr>
                <Th fontFamily="Inter" fontSize="14px" fontWeight="700" color="#474849">Calendar Name</Th>
                <Th fontFamily="Inter" fontSize="14px" fontWeight="700" color="#474849">Status</Th>
                <Th fontFamily="Inter" fontSize="14px" fontWeight="700" color="#474849">Type</Th>
                <Th fontFamily="Inter" fontSize="14px" fontWeight="700" color="#474849">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {sortedCalendars.map((calendar) => (
                <Tr
                  key={calendar.id}
                  backgroundColor={calendar.id === selectedCalendar?.id ? "#F0F7FF" : "white"}
                  _hover={{ backgroundColor: calendar.id === selectedCalendar?.id ? "#F0F7FF" : "#F7FAFC" }}
                >
                  <Td>
                    <HStack spacing={3}>
                      <Icon as={FaCalendarAlt} color="#4E4AE7" />
                      <Text
                        fontFamily="Inter"
                        fontSize="14px"
                        fontWeight={calendar.id === selectedCalendar?.id ? "600" : "400"}
                        color="#474849"
                      >
                        {calendar.summary}
                      </Text>
                      {calendar.id === selectedCalendar?.id && (
                        <Icon as={FaCheckCircle} color="#0C824D" />
                      )}
                    </HStack>
                  </Td>
                  <Td>
                    <Tag
                      size="md"
                      backgroundColor={calendar.id === selectedCalendar?.id ? "#E6F6FF" : "#EDF2F7"}
                      color={calendar.id === selectedCalendar?.id ? "#2B6CB0" : "#4A5568"}
                      fontFamily="Inter"
                      fontSize="12px"
                      fontWeight="500"
                    >
                      {calendar.id === selectedCalendar?.id ? "Selected" : "Available"}
                    </Tag>
                  </Td>
                  <Td>
                    <Tag
                      size="md"
                      backgroundColor={calendar.primary ? "#F0FFF4" : "#EDF2F7"}
                      color={calendar.primary ? "#38A169" : "#4A5568"}
                      fontFamily="Inter"
                      fontSize="12px"
                      fontWeight="500"
                    >
                      {calendar.primary ? "Primary" : "Secondary"}
                    </Tag>
                  </Td>
                  <Td>
                    {calendar.id !== selectedCalendar?.id && (
                      <Button
                        onClick={() => setSelectedCalendar(calendar)}
                        size="sm"
                        backgroundColor="#4E4AE7"
                        color="white"
                        _hover={{ backgroundColor: "#3B3AC7" }}
                        fontFamily="Inter"
                        fontSize="14px"
                        fontWeight="500"
                        padding="8px 16px"
                      >
                        Select
                      </Button>
                    )}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </VStack>
    </Box>
    </>
  );
};

export default CalendarSelector;
