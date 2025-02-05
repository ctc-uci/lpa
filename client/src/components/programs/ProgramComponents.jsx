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
    ChevronLeftIcon,
    TimeIcon,
    DownloadIcon,
    AttachmentIcon,
    EmailIcon,
    InfoIcon,
    HamburgerIcon,
    EditIcon,
    AtSignIcon,
    CloseIcon,
    CalendarIcon,
    CopyIcon,
    ArrowUpDownIcon,
  } from '@chakra-ui/icons'

  import {FileTextIcon, EllipsisIcon, Calendar, MapPin, SlidersHorizontal, ChevronsUpDown} from 'lucide-react'

export const ProgramSummary = ({program, nextRoom, sessions}) => {

  // Make sure program data is fetched before rendering
  if (!program || program.length === 0) {
    return <div>Loading...</div>; // Possibly change loading indicator
  }
  // console.log("programs", program[0])
  // console.log("sessions: ",  nextRoom)
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
                            {program[0].name}
                          </Heading>

                          <Flex align="center" gap={2} color="gray.700">
                              <Icon as={TimeIcon}/>
                              <Text>10:00 am - 1:00 am</Text>
                              <Text color="gray.600">next up on</Text>
                              <Icon as={CalendarIcon} />
                              <Text>Thu. 01/16/2025</Text>
                          </Flex>

                          <Flex spacing={2} gap={6}>
                              <Flex align="center" gap={2}>
                              <Icon as={AtSignIcon} color="gray.600" />
                              <Text color="gray.600">Aya de Leon, Jane Doe</Text>
                              </Flex>
                              <Flex align="center" gap={2}>
                              <Icon as={AtSignIcon} color="gray.600" />
                              <Text color="gray.600">Aya de Leon</Text>
                              </Flex>
                          </Flex>

                          <Flex spacing={2} gap={6}>
                              <Flex align="center" gap={2}>
                              <Icon as={EmailIcon} color="gray.600" />
                              <Text color="gray.600">AyadeLeon@gmail.com, JaneDoe@email.com</Text>
                              </Flex>
                          </Flex>

                          <Flex  align="center" gap={8}>
                              <Flex align="center" gap={2}>
                                  <Icon as={InfoIcon} color="gray.600" />
                                  <Text color="gray.600">Theater</Text>
                              </Flex>
                              <Flex align="center" gap={2}>
                                  <Text color="gray.600">$</Text>

                                  <Text color="gray.600">60.00</Text>
                                  <Text color="gray.600">/ hour</Text>
                              </Flex>

                          </Flex>

                          <Stack spacing={6}>
                              <Box spacing={2}>
                                  <Heading size="md" textColor="gray.600">
                                      Room Description
                                  </Heading>
                                  <Text color="gray.600" text="xs" mt={4}>
                                  {program?.description || 'No description available'}

                                  </Text>
                              </Box>

                              <Box>
                                  <Heading size="md" textColor="gray.600">
                                      Class Description
                                  </Heading>
                                  <Text color="gray.600" text="xs" mt={4}>
                                      Lorem ipsum dolor szt amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
                                      et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                                      aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
                                      cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
                                      culpa qui officia deserunt mollit anim id est laborum.
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

