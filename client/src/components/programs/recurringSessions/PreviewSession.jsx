import { useEffect, useState } from "react";

import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";

import { EllipsisIcon } from "lucide-react";

import { DeleteIconRed } from "../../../assets/DeleteIconRed";
import { FilledOutCalendar } from "../../../assets/FilledOutCalendar";
import {
  sessionsClock,
  sessionsMapPin,
} from "../../../assets/icons/ProgramIcons";
import { MdFeaturedPlayList } from "../../../assets/MdFeaturedPlayList";
import { ReactivateIcon } from "../../../assets/ReactivateIcon";
import DateSortingModal from "../../sorting/DateFilter";

// Function to format date
// to "Mon. 01.01.2023"
const formatDate = (isoString) => {
  const localDateString = isoString.includes("T")
    ? isoString
    : `${isoString}T12:00:00`;
  const date = new Date(localDateString);

  const options = {
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "UTC",
  };

  let formattedDate = new Intl.DateTimeFormat("en-US", options).format(date);
  formattedDate = formattedDate.replace(",", ".");
  return formattedDate;
};

// Function to format time
// to "12:00 a.m." or "12:00 p.m."
const formatTime = (timeString) => {
  const [hours, minutes] = timeString.split(":").map(Number);
  const period = hours >= 12 ? "p.m." : "a.m.";
  const formattedHours = hours % 12 || 12;
  return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
};

export const PreviewSession = ({
  allSessions,
  sortOrder,
  setSortOrder,
  allRooms,
  onSaveSessionModalOpen,
  handleArchiveSession,
  handleDeleteSession,
  onDeleteSessionModalOpen,
  setIsChanged,
  setDeleteSessionDate,
  setDeleteSessionId,
}) => {
  const [sortedSessions, setSortedSessions] = useState([]);

  // pagination controls
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(sortedSessions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, sortedSessions.length);
  const currentPageSessions = sortedSessions?.slice(startIndex, endIndex) || [];

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  useEffect(() => {
    const sorted = [...allSessions]
      .filter((session) => !session.isDeleted)
      .sort((a, b) =>
        sortOrder === "asc"
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date)
      );

    setSortedSessions(sorted);
  }, [allSessions, sortOrder]);

  return (
    <Box
      minH="10vh"
      width="100%"
      minW="100%"
      py={8}
      paddingTop="1rem"
    >
      <Card
        shadow="md"
        border="1px"
        borderColor="gray.300"
        borderRadius="15px"
      >
        <CardBody
          m={6}
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
        >
          <Box
            display="flex"
            alignItems="center"
            padding="8px"
            justifyContent="space-between"
            gap="8px"
          >
            <Flex
              align="center"
              mb="15px"
              gap="10px"
            >
              <MdFeaturedPlayList />
              <Text
                fontSize="24px"
                fontWeight="700"
                color="#2D3748"
              >
                Preview
              </Text>
            </Flex>
            <Button
              backgroundColor="#4441C8"
              onClick={onSaveSessionModalOpen}
              // isDisabled={sortedSessions.length === 0}
            >
              <Text color="#FFFFFF">Save Changes</Text>
            </Button>
          </Box>

          <TableContainer>
            <Table variant="unstyled">
              <Thead
                borderBottom="1px"
                color="#D2D2D2"
              >
                <Tr>
                  <Th>
                    <Box
                      display="flex"
                      padding="8px"
                      alignItems="center"
                      gap="8px"
                    >
                      <FilledOutCalendar />
                      <Text
                        textTransform="none"
                        color="#767778"
                        fontSize="16px"
                        fontStyle="normal"
                      >
                        DATE
                      </Text>
                      <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="flex-start"
                        gap="2px"
                        marginLeft={"100px"}
                      >
                        <DateSortingModal onSortChange={setSortOrder} />
                      </Box>
                    </Box>
                  </Th>
                  <Th>
                    <Box
                      display="flex"
                      padding="8px"
                      alignItems="center"
                      gap="8px"
                    >
                      <Icon as={sessionsClock} />
                      <Text
                        textTransform="none"
                        color="#767778"
                        fontSize="16px"
                        fontStyle="normal"
                        // onClick={() => {
                        //   console.log(sortedSessions);
                        //   console.log(sortOrder);
                        // }}
                      >
                        UPCOMING TIME
                      </Text>
                    </Box>
                  </Th>
                  <Th>
                    <Box
                      display="flex"
                      padding="8px"
                      alignItems="center"
                      gap="8px"
                    >
                      <Icon
                        as={sessionsMapPin}
                        boxSize={4}
                        mr={1}
                      />
                      <Text
                        textTransform="none"
                        color="#767778"
                        fontSize="16px"
                        fontStyle="normal"
                      >
                        ROOM
                      </Text>
                    </Box>
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {currentPageSessions
                  .filter((session) => !session.isDeleted)
                  .map((session) => (
                    <Tr
                      key={session.id + session.date}
                      textColor={
                        session.archived === true ? "#A0AEC0" : "#2D3748"
                      }
                      backgroundColor={
                        session.isNew || session.isUpdated ? "#F8F8FF" : "white"
                      }
                    >
                      <Td>
                        <Box
                          display="flex"
                          alignItems="center"
                        >
                          <Text
                            textTransform="none"
                            fontSize="16px"
                            fontStyle="normal"
                          >
                            {formatDate(session.date)}
                          </Text>
                        </Box>
                      </Td>
                      <Td>
                        <Box
                          display="flex"
                          alignItems="center"
                        >
                          <Text
                            textTransform="none"
                            fontSize="16px"
                            fontStyle="normal"
                          >
                            {formatTime(session.startTime)} -{" "}
                            {formatTime(session.endTime)}
                          </Text>
                        </Box>
                      </Td>
                      <Td>
                        <Box
                          display="flex"
                          alignItems="center"
                        >
                          <Text
                            textTransform="none"
                            fontSize="16px"
                            fontStyle="normal"
                          >
                            {allRooms.find(
                              (room) => room.id === Number(session.roomId)
                            )?.name || "N/A"}
                          </Text>
                        </Box>
                      </Td>
                      <Td>
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            boxSize="7"
                            icon={<EllipsisIcon />}
                            backgroundColor="#EDF2F7"
                            color="#2D3748"
                            textColor="#2D3748"
                            cursor="pointer"
                            minWidth="24px"
                            minHeight="24px"
                            borderRadius={6}
                          />
                          <MenuList
                            padding="4px"
                            minWidth="139px"
                          >
                            <MenuItem
                              onClick={() => {
                                handleArchiveSession(session.id);
                                setIsChanged(true);
                              }}
                              display="flex"
                              padding="6px 8px"
                              alignItems="center"
                              gap="8px"
                              width="131px"
                              height="32px"
                              variant="ghost"
                            >
                              <Icon
                                as={ReactivateIcon}
                                boxSize="4"
                              />
                              <Text
                                color="#2D3748"
                                fontSize="14px"
                              >
                                {session.archived ? "Unarchive" : "Archive"}
                              </Text>
                            </MenuItem>

                            <MenuItem
                              onClick={() => {
                                setDeleteSessionDate(
                                  formatDate(session.date).split(" ")[1]
                                );
                                setDeleteSessionId(session.id);
                                if (session.isNew) {
                                  onDeleteSessionModalOpen();
                                } else {
                                  onCancelProgramModalOpen();
                                }
                                setIsChanged(true);
                              }}
                              display="flex"
                              padding="6px 8px"
                              alignItems="center"
                              gap="8px"
                              width="131px"
                              height="32px"
                              variant="ghost"
                            >
                              <Icon
                                as={DeleteIconRed}
                                boxSize="4"
                              />
                              <Text
                                color="#90080F"
                                fontSize="14px"
                              >
                                Delete
                              </Text>
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Td>
                    </Tr>
                  ))}
              </Tbody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>

      {/* Pagination Controls - moved to bottom right */}
      <Box
        width="100%"
        display="flex"
        justifyContent="flex-end"
        mt="auto"
        pt={4}
      >
        {totalPages > 1 && (
          <Flex
            alignItems="center"
            justifyContent="center"
            mb={2}
          >
            <Text
              mr={2}
              fontSize="sm"
              color="#474849"
              fontFamily="Inter, sans-serif"
            >
              {currentPage} of {totalPages}
            </Text>
            <Button
              onClick={goToPreviousPage}
              isDisabled={currentPage === 1}
              size="sm"
              variant="ghost"
              padding={0}
              minWidth="auto"
              color="gray.500"
            >
              <ChevronLeftIcon />
            </Button>
            <Button
              onClick={goToNextPage}
              isDisabled={currentPage === totalPages}
              size="sm"
              variant="ghost"
              padding={0}
              minWidth="auto"
              color="gray.500"
            >
              <ChevronRightIcon />
            </Button>
          </Flex>
        )}
      </Box>
    </Box>
  );
};
