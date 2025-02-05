import { React, useEffect, useState} from 'react';
import { useParams } from 'react-router';

import {
    Box,
    Button,
    Card,
    CardBody,
    CardHeader,
    Container,
    Flex,
    Heading,
    Icon,
    IconButton,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Stack,
    Table,
    TableContainer,
    Th,
    Tr,
    Td,
    Thead,
    Tbody,
    Text,
    useColorModeValue,
    Link,
    Slide,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverHeader,
    PopoverBody,
    PopoverFooter,
    PopoverArrow,
    PopoverCloseButton,
    PopoverAnchor,
    useDisclosure,
    FormControl,
    FormLabel,
    FormErrorMessage,
    FormHelperText,
    Input,
    useBoolean,
    Portal,
    HStack
  } from "@chakra-ui/react"

  import {
    TimeIcon,
    DownloadIcon,
    EmailIcon,
    InfoIcon,
    EditIcon,
    AtSignIcon,
    CloseIcon,
    CalendarIcon,
   
  } from '@chakra-ui/icons'

  import { UserIcon, FileTextIcon, EllipsisIcon, Calendar, MapPin, SlidersHorizontal, ChevronsUpDown} from 'lucide-react'

  export const ProgramSummary = ({program, bookingInfo}) => {
    const formatTimeString = (timeString) => {
      if (!timeString) return '';
      if (timeString.includes(':')) {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours, 10);
        const period = hour >= 12 ? 'pm' : 'am';
        const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
        return `${displayHour}:${minutes} ${period}`;
      }
      return timeString;
    };
  
    // Default empty booking info structure
    const defaultBookingInfo = {
      nextSession: null,
      nextRoom: null,
      instructors: [],
      payees: []
    };
  
    const safeBookingInfo = {
      ...defaultBookingInfo,
      ...(bookingInfo || {})
    };
  
    // Make sure program data is fetched before rendering
    if (!program || program.length === 0) {
      return <div>Loading...</div>;
    }
  
    const { nextSession, nextRoom, instructors, payees } = safeBookingInfo;
  
    return (
        <Box minH="10vh" py={8}>
            <Container maxW="90%" >
                <Card shadow="md" border="1px" borderColor="gray.300" borderRadius="15px">
                    <CardBody m={6}>
                        <Flex mb={6} justify="space-between" align="center" >
                            <Flex align="center" gap={2}>
                                <Flex align="center" gap={2}>
                                    <Icon as={FileTextIcon} boxSize={6} color="gray.600" />
                                    <Text fontSize="xl" fontWeight="semibold" color="gray.600">
                                        Summary
                                    </Text>
                                </Flex>
                            </Flex>
  
                            <Flex align="center" gap={2}>
                                <Button leftIcon={<Icon as={DownloadIcon} />} colorScheme="purple" size="sm" borderRadius="20px">
                                    Invoice
                                </Button>
                                <Menu>
                                    <MenuButton as={IconButton} icon={<Icon as={EllipsisIcon} />} aria-label="Options" border="0.5px" bg="gray.50" size="sm" variant="ghost" borderRadius="20px"  />
                                    <MenuList>
                                        <MenuItem icon={<Icon as={EditIcon} />}>Edit</MenuItem>
                                        <MenuItem icon={<Icon as={CloseIcon} />} color="red.500">
                                            Cancel
                                        </MenuItem>
                                    </MenuList>
                                </Menu>
                            </Flex>
                        </Flex>
  
                        <Stack spacing={6}>
                            <Heading as="h2" size="md" textColor="gray.600">
                              {program[0]?.name || 'Untitled Program'}
                            </Heading>
  
                            <Flex align="center" gap={2} color="gray.700">
                                <Icon as={TimeIcon}/>
                                <Text>
                                  {nextSession ? 
                                  `${formatTimeString(nextSession.startTime)} - ${formatTimeString(nextSession.endTime)}` 
                                  : 'No session scheduled'}
                                </Text>
                                <Text color="gray.600">next up on</Text>
                                <Icon as={CalendarIcon} />
                                <Text>
                                  {nextSession?.date ? 
                                    new Date(nextSession.date).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: '2-digit',
                                      day: '2-digit'
                                    })
                                    : 'No date available'
                                  }
                                </Text>
                            </Flex>
  
                            <Flex spacing={2} gap={6}>
                              <Flex align="center" gap={2}>
                                <Icon as={UserIcon} color="gray.600" />
                                <Text color="gray.600">
                                  {payees?.length > 0 ? 
                                    payees.map(payee => payee.clientName).join(', ')
                                    : 'No payees'
                                  }
                                </Text>
                              </Flex>
                              <Flex align="center" gap={2}>
                                <Icon as={UserIcon} color="gray.600" />
                                <Text color="gray.600">
                                  {instructors?.length > 0 ?
                                    instructors.map(instructor => instructor.clientName).join(', ')
                                    : 'No instructors'
                                  }
                                </Text>
                              </Flex>
                            </Flex>
  
                            <Flex spacing={2} gap={6}>
                                <Flex align="center" gap={2}>
                                  <Icon as={EmailIcon} color="gray.600" />
                                  <Text color="gray.600">
                                    {(instructors?.length > 0 || payees?.length > 0) ?
                                      [...(instructors || []), ...(payees || [])]
                                        .map(person => person?.clientEmail)
                                        .filter(Boolean)
                                        .join(', ')
                                      : 'No emails available'
                                    }
                                  </Text>
                                </Flex>
                            </Flex>
  
                            <Flex align="center" gap={8}>
                                <Flex align="center" gap={2}>
                                    <Icon as={InfoIcon} color="gray.600" />
                                    <Text color="gray.600">{nextRoom?.name || "-"}</Text>
                                </Flex>
                                <Flex align="center" gap={2}>
                                    <Text color="gray.600">$</Text>
                                    <Text color="gray.600">{nextRoom?.rate || "-.--"}</Text>
                                    <Text color="gray.600">/ hour</Text>
                                </Flex>
                            </Flex>
  
                            <Stack spacing={6}>
                                <Box spacing={2}>
                                    <Heading size="md" textColor="gray.600">
                                        Room Description
                                    </Heading>
                                    <Text color="gray.600" text="xs" mt={4}>
                                      {nextRoom?.description || 'No description available'}
                                    </Text>
                                </Box>
  
                                <Box>
                                    <Heading size="md" textColor="gray.600">
                                        Class Description
                                    </Heading>
                                    <Text color="gray.600" text="xs" mt={4}>
                                        {program[0]?.description || 'No description available'}
                                    </Text>
                                </Box>
                            </Stack>
                        </Stack>
                    </CardBody>
                </Card>
            </Container>
        </Box>
    );
  };

export const Sessions = ({ sessions, rooms }) => {
  const formatDate = (isoString) => {
    const date = new Date(isoString);


    // Format the date to "Mon 01/17/2025"
    const options = {
      weekday: 'short',  // "Mon"
      year: 'numeric',   // "2025"
      month: '2-digit',  // "01"
      day: '2-digit'
    };
    let formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);
    formattedDate = formattedDate.replace(',', '.');
    return formattedDate;
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);

    // Determine AM or PM suffix
    const period = hours >= 12 ? 'p.m.' : 'a.m.';

    // Convert to 12-hour format
    const formattedHours = hours % 12 || 12; // Convert 0 to 12 for midnight

    // Return formatted time
    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const hasTimePassed = (dateTimeString) => {
    // Function to determine color of status circle
    const givenTime = new Date(dateTimeString);
    const currentTime = new Date();
    return currentTime > givenTime;
  };

  // Make sure sessions data is fetched before rendering
  if (!sessions || sessions.length === 0) {
    return <div>Loading...</div>; // Possibly change loading indicator
  }
  // Make sure rooms is fetched before rendering
  if (!rooms || rooms.length === 0) {
    return <div>Loading...</div>; // Possibly change loading indicator
  }
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box minH="10vh" marginLeft="5vw" marginRight="5vw" marginBottom="4vw">
      <Card shadow="md" border="1px" borderColor="gray.300" borderRadius="15px">
        <CardBody m={6}>
          <Flex direction="column" justify="space-between">
            <Flex align="center" mb="15px">
              <Icon as={CalendarIcon} boxSize={5} color="#474849"/>
              <Text fontSize='xl' fontWeight="semibold" color="#474849" ml="8px"> Sessions </Text>
            </Flex>
            <Flex>
              <Popover>
                <PopoverTrigger>
                <Button color="#767778" variant="outline" size="sm" mb="15px" rounded="xl" onClick={onOpen} leftIcon={<SlidersHorizontal />}> Filters </Button>
                </PopoverTrigger>
                <Portal>
                  <PopoverContent>
                    <PopoverBody>
                      <FormControl id="date">
                        <FormLabel>Date</FormLabel>
                        <HStack>
                          <Input size="xs" borderRadius="5px" width="30%" height="20%" placeholder="MM/DD/YYYY" />
                          <Text> to </Text>
                          <Input size="xs" borderRadius="5px" width="30%" height="20%" placeholder="MM/DD/YYYY" />
                        </HStack>
                      </FormControl>
                      <FormControl id="time">
                        <FormLabel>Time</FormLabel>
                        <Input placeholder="MM/DD/YYYY" />
                      </FormControl>
                      <FormControl id="status">
                        <FormLabel>Status</FormLabel>
                        <Input placeholder="MM/DD/YYYY" />
                      </FormControl>
                      <FormControl id="room">
                        <FormLabel>Room</FormLabel>
                        <Input placeholder="MM/DD/YYYY" />
                      </FormControl>
                    </PopoverBody>
                  </PopoverContent>
                </Portal>
              </Popover>
            </Flex>
            <TableContainer>
              <Table variant="unstyled">
                <Thead>
                  <Tr>
                    <Th>Status</Th>
                    <Th><Icon as={Calendar} boxSize={4} mr={2}/>Date <Icon as={ChevronsUpDown} boxSize={4}/></Th>
                    <Th><Icon as={TimeIcon} boxSize={4} mr={2}/>Time</Th>
                    <Th><Icon as={MapPin} boxSize={4} mr={1}/>Room</Th>
                    <Th> </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {sessions.map((sesh) => (
                    <Tr key={sesh.id}>
                      <Td><Box height="10px" width="10px" borderRadius="50%" bg={hasTimePassed(sesh.date) ? "orange" : "green"}></Box></Td>
                      <Td>{formatDate(sesh.date)}</Td>
                      <Td>{formatTime(sesh.startTime)} - {formatTime(sesh.endTime)}</Td>
                      <Td>{rooms.get(sesh.roomId)}</Td>
                      <Td><IconButton size="sm" rounded="full"><EllipsisIcon /></IconButton></Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Flex>
        </CardBody>
      </Card>
    </Box>
  );
}

// export default ProgramSummary;

