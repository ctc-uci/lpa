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

  import {FileTextIcon, EllipsisIcon, Calendar, MapPin, SlidersHorizontal} from 'lucide-react'

export const ProgramSummary = () => {

    const [program, setProgram] = useState(null);
    const { id } = useParams();

    useEffect(() => {

        const fetchProgram = async () => {
            try{
                const response = await fetch(`http://localhost:3001/events/${id}`);
                console.log("REsponse: ", response);

                const data = await response.json();
                console.log("Program data: ", data);
                setProgram(data[0] || data);
            }catch (err){
                console.error(err);
            }
        }
        if (id) {
            fetchProgram();
          }

      }, [id]);



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
                                Immigrant Rights Solidarity Week: Become an Immigration Rights Ambassador Workshop
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

export const Sessions = () => {
  return (
    <Box>
      <Card shadow="md" m="20">
        <CardBody m={6}>
          <Flex direction="column" justify="space-between">
            <Flex align="center" mb="15px">
              <Icon as={Calendar} boxSize={5} color="#474849"/>
              <Text fontSize='xl' fontWeight="semibold" color="#474849" ml="8px"> Sessions </Text>
            </Flex>
            <Flex>

              <Button color="#767778" variant="outline" size="sm" mb="15px" rounded="xl" leftIcon={<SlidersHorizontal />}> Filters </Button>
            </Flex>
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Status</Th>
                    <Th><Icon as={Calendar} boxSize={4} mr={2}/>Date</Th>
                    <Th><Icon as={TimeIcon} boxSize={4} mr={2}/>Time</Th>
                    <Th><Icon as={MapPin} boxSize={4} mr={1}/>Room</Th>
                    <Th> </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td><Box w="12px" h="12px" borderRadius="50%" bg="green"/></Td>
                    <Td>Thu. 01/16/2025</Td>
                    <Td>10:00 a.m. - 1:00 p.m.</Td>
                    <Td>Community</Td>
                    <Td><IconButton size="md" rounded="full"><EllipsisIcon /></IconButton></Td>
                  </Tr>
                  <Tr>
                    <Td><Box w="12px" h="12px" borderRadius="50%" bg="orange"/></Td>
                    <Td>Thu. 01/16/2024</Td>
                    <Td>10:00 a.m. - 1:00 p.m.</Td>
                    <Td>Lounge</Td>
                    <Td><IconButton size="md" rounded="full"><EllipsisIcon /></IconButton></Td>
                  </Tr>
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

