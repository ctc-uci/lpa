import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import Navbar from "../navbar/Navbar";
import {
  Box,
  Button,
  Card,
  CardBody,
  Container,
  Flex,
  FormControl,
  Heading,
  Icon,
  IconButton,
  Input,
  InputGroup,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import {
  filterButton,
  filterDateCalendar,
  sessionsDownArrow,
  sessionsEllipsis,
  sessionsFilterClock,
  sessionsFilterMapPin,
  sessionsMapPin,
  sessionsUpArrow,
  archiveBox,
  archiveCalendar,
  archiveClock,
  archiveMapPin,
  archivePerson,
} from "../../assets/icons/ProgramIcons";

export const ArchivedPrograms = () => {
  return (
    <Navbar>
      <Box margin="40px">
        <Card shadow="md" border="1px" borderColor="gray.300" borderRadius="15px">
          <CardBody margin="6px">
            <Flex direction="column" justify="space-between">
              <Flex align="center" mb="15px">
                <Icon as={archiveBox} />
                <Text fontSize="25px" fontWeight="semibold" color="#474849" ml="8px">
                  Archived
                </Text>
              </Flex>
              <Box display="flex" justify-content="space-between" align-items="flex-start" align-self="stretch">
                <Box marginRight="auto">
                  <Text>Filters</Text>
                </Box>
                <Box>
                  <Text>Search Bar</Text>
                </Box>
              </Box>
              <TableContainer>
                <Table variant="unstyled">
                  <Thead
                    borderBottom="1px"
                    color="#D2D2D2"
                  >
                    <Tr>
                      <Th>
                        <Box display="flex" padding="8px" justifyContent="center" alignItems="center" gap="8px">
                          <Text textTransform="none" color="#767778" fontSize="16px" fontStyle="normal">
                            Program
                          </Text>
                          <Box display="flex" flexDirection="column" alignItems="flex-start" gap="2px">
                            <Icon as={sessionsUpArrow} />
                            <Icon as={sessionsDownArrow} />
                          </Box>
                        </Box>
                      </Th>
                      <Th>
                        <Box display="flex" padding="8px" justifyContent="center" alignItems="center" gap="8px">
                          <Icon as={archiveCalendar} />
                          <Text textTransform="none" color="#767778" fontSize="16px" fontStyle="normal">
                            Date
                          </Text>
                          <Box display="flex" flexDirection="column" alignItems="flex-start" gap="2px">
                            <Icon as={sessionsUpArrow} />
                            <Icon as={sessionsDownArrow} />
                          </Box>
                        </Box>
                      </Th>
                      <Th>
                        <Box display="flex" padding="8px" justifyContent="center" alignItems="center" gap="8px">
                          <Icon as={archiveClock} />
                          <Text textTransform="none" color="#767778" fontSize="16px" fontStyle="normal">
                            Time
                          </Text>
                        </Box>
                      </Th>
                      <Th>
                        <Box display="flex" padding="8px" justifyContent="center" alignItems="center" gap="8px">
                          <Icon as={archiveMapPin} />
                          <Text textTransform="none" color="#767778" fontSize="16px" fontStyle="normal">
                            Room
                          </Text>
                        </Box>
                      </Th>
                      <Th>
                        <Box display="flex" padding="8px" justifyContent="center" alignItems="center" gap="8px">
                          <Icon as={archivePerson} />
                          <Text textTransform="none" color="#767778" fontSize="16px" fontStyle="normal">
                            Lead Artist(s)
                          </Text>
                        </Box>
                      </Th>
                      <Th>
                        <Box display="flex" padding="8px" justifyContent="center" alignItems="center" gap="8px">
                          <Icon as={archivePerson} />
                          <Text textTransform="none" color="#767778" fontSize="16px" fontStyle="normal">
                            Payer(s)
                          </Text>
                        </Box>
                      </Th>
                    </Tr>
                  </Thead>
                </Table>
              </TableContainer>
            </Flex>
          </CardBody>
        </Card>
      </Box>
    </Navbar>
  );
};
