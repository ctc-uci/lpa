import React, { useCallback, useEffect, useRef, useState } from "react";

import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Flex,
  HStack,
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
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";

import { useNavigate } from "react-router-dom";

// Icon imports
import actionsSvg from "../../assets/icons/actions.svg";
import activeSvg from "../../assets/icons/active.svg";
import calendarSvg from "../../assets/icons/calendar.svg";
import cancelSvg from "../../assets/icons/cancel.svg";
import clockSvg from "../../assets/icons/clock.svg";
import editSvg from "../../assets/icons/edit.svg";
import locationSvg from "../../assets/icons/location.svg";
import pastSvg from "../../assets/icons/past.svg";
import personSvg from "../../assets/icons/person.svg";
import programSvg from "../../assets/icons/program.svg";
import searchSvg from "../../assets/icons/search.svg";
import noneSvg from "../../assets/icons/none.svg";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { ProgramFiltersModal } from "./ProgramFiltersModal";
import StatusTooltip from "./StatusIcon";

import "./Home.css";

// Icon components
const ActiveStatusIcon = () => <img src={activeSvg} />;
const PastStatusIcon = () => <img src={pastSvg} />;
const NoneStatusIcon = () => <img src={noneSvg} />;
const ActionsIcon = () => <img src={actionsSvg} />;
const EditIcon = () => <img src={editSvg} />;
const CancelIcon = () => <img src={cancelSvg} />;
const SearchIcon = () => <img src={searchSvg} />;
const CalendarIcon = () => <img src={calendarSvg} />;
const ClockIcon = () => <img src={clockSvg} />;
const LocationIcon = () => <img src={locationSvg} />;
const PersonIcon = () => <img src={personSvg} />;

export const ProgramsTable = () => {
  const [programs, setPrograms] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [programToDelete, setProgramToDelete] = useState(null);
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: { start: null, end: null },
    timeRange: { start: null, end: null },
    status: "all",
    room: "all",
    instructor: "all",
    payee: "all",
  });

  const { backend } = useBackendContext();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const toast = useToast();
  const cancelRef = useRef();

  // Fetch Programs
  const fetchPrograms = useCallback(async () => {
    try {
      const response = await backend.get("/programs");
      console.log("API Response:", response.data);

      if (!response.data || response.data.length === 0) {
        console.warn("No programs received from API.");
        setPrograms([]);
        return;
      }

      // Format date and time
      const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date
          .toLocaleDateString("en-US", {
            weekday: "short",
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
          })
          .replace(/,/g, ".");
      };

      const formatTime = (timeString) => {
        const [hours, minutes] = timeString.split(":");
        const date = new Date(2000, 0, 1, hours, minutes);
        return date
          .toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
          .toLowerCase();
      };

      // Format programs data for display
      const programsData = response.data.map((program) => {
        // Handle multiple instructors or payees:
        const instructor = Array.isArray(program.instructorName)
          ? program.instructorName.join(", ")
          : program.instructorName || "N/A";

        const payee = Array.isArray(program.payeeName)
          ? program.payeeName.join(", ")
          : program.payeeName || "N/A";

        return {
          id: program.id,
          name: program.eventName,
          // Preserve the original date for filtering:
          date: program.date,
          status:
            program.date ?
            (program.date && new Date(program.date) > new Date()
              ? "Active"
              : "Past") : 
              "No Bookings",
          upcomingDate: program.date ? formatDate(program.date) : "No bookings",
          upcomingTime:
            program.startTime && program.endTime
              ? `${formatTime(program.startTime)} - ${formatTime(program.endTime)}`
              : "N/A",
          room: program.roomName || "N/A",
          instructor, // possibly a comma-separated list
          payee, // possibly a comma-separated list
        };
      });

      console.log("Formatted Programs:", programsData);
      setPrograms(programsData);
    } catch (error) {
      console.error("Failed to fetch programs:", error);
    }
  }, [backend]);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  // Truncate long lists of instructors/payees
  const truncateNames = (names, maxLength = 30) => {
    if (names.length <= maxLength) return names;
    return `${names.substring(0, maxLength)}...`;
  };

  // Apply Filters
  const applyFilters = useCallback(() => {
    let result = programs;

    // Date Range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      result = result.filter((program) => {
        if (!program.date) return false;
        const bookingDate = new Date(program.date);
        return (
          (!filters.dateRange.start ||
            bookingDate >= new Date(filters.dateRange.start)) &&
          (!filters.dateRange.end ||
            bookingDate <= new Date(filters.dateRange.end))
        );
      });
    }

    // Time Range filter
    if (filters.timeRange.start || filters.timeRange.end) {
      result = result.filter((program) => {
        if (program.upcomingTime === "N/A") return false;
        const [startTime] = program.upcomingTime.split(" - ");
        const startTimeObj = new Date(`2000-01-01 ${startTime}`);
        return (
          (!filters.timeRange.start ||
            startTimeObj >=
              new Date(`2000-01-01 ${filters.timeRange.start}`)) &&
          (!filters.timeRange.end ||
            startTimeObj <= new Date(`2000-01-01 ${filters.timeRange.end}`))
        );
      });
    }

    // Status filter
    if (filters.status !== "all") {
      result = result.filter(
        (program) =>
          program.status.toLowerCase() === filters.status.toLowerCase()
      );
    }

    // Room filter
    if (filters.room !== "all") {
      result = result.filter((program) => program.room === filters.room);
    }

    // Instructor filter
    if (filters.instructor !== "all") {
      result = result.filter(
        (program) =>
          program.instructor &&
          program.instructor.toLowerCase().includes(filters.instructor.toLowerCase())
      );
    }

    // Payee filter
    if (filters.payee !== "all") {
      result = result.filter(
        (program) =>
          program.payee &&
          program.payee.toLowerCase().includes(filters.payee.toLowerCase())
      );
    }

    // Search filter
    if (searchTerm.trim() !== "") {
      result = result.filter((program) =>
        program.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPrograms(result);
  }, [programs, filters, searchTerm]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setIsFiltersModalOpen(false);
  };

  const handleRowClick = (id) => {
    navigate(`/programs/${id}`);
  };

  const handleEdit = (id, e) => {
    e.stopPropagation();
    navigate(`/programs/${id}`);
  };

  const handleDeleteClick = (id, e) => {
    e.stopPropagation();
    setProgramToDelete(id);
    onOpen();
  };

  // Delete Program and all related records
  const handleDelete = async () => {
    if (programToDelete) {
      try {
        const response = await backend.delete(`/events/${programToDelete}`);
        if (response.data.result === "success") {
          setPrograms((prev) => prev.filter((p) => p.id !== programToDelete));
          toast({
            title: "Program deleted",
            description:
              "The program and all related records have been successfully deleted.",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
        } else {
          throw new Error("Failed to delete program");
        }
      } catch (error) {
        console.error("Failed to delete program:", error);
        toast({
          title: "Delete failed",
          description:
            error.response?.data?.message ||
            "An error occurred while deleting the program.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
    onClose();
  };

  const renderStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return <ActiveStatusIcon />;
      case "past":
        return <PastStatusIcon />;
      default:
        return <NoneStatusIcon />;
    }
  };

  return (
    <>
      {/* Container for the table + filter/search row */}
      <Box className="programs-table">
        <Flex className="programs-table__filter-row">
          <ProgramFiltersModal onApplyFilters={handleApplyFilters} />
          {/* Spacer to push search bar to the right */}
          <Box flex="1" />

          <div className="search-wrapper">
            <div className="searchbar-container">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="searchbar-icon-container">
              <SearchIcon />
            </div>
          </div>
        </Flex>

        {/* Table container */}
        <TableContainer className="programs-table__container">
          <Table
            variant="simple"
            size="sm"
            className="programs-table__table"
          >
            <Thead>
              <Tr>
                {/* Program Name */}
                <Th>
                  <HStack
                    spacing={2}
                    alignItems="center"
                  >
                    <Text className="table-header-text">Program</Text>
                    <VStack>
                      <Box
                        as="img"
                        src={programSvg}
                        boxSize="10px"
                      />
                      <Box
                        as="img"
                        src={programSvg}
                        boxSize="10px"
                        mt={-2}
                        transform="rotate(180deg)"
                      />
                    </VStack>
                  </HStack>
                </Th>

                {/* Status Column */}
                <Th>
                  <StatusTooltip />
                </Th>

                {/* Upcoming Date */}
                <Th>
                  <HStack
                    spacing={2}
                    alignItems="center"
                  >
                    <CalendarIcon />
                    <Text className="table-header-text">Upcoming Date</Text>
                    <VStack alignItems="center">
                      <Box
                        as="img"
                        src={programSvg}
                        boxSize="10px"
                      />
                      <Box
                        as="img"
                        src={programSvg}
                        boxSize="10px"
                        mt={-2}
                        transform="rotate(180deg)"
                      />
                    </VStack>
                  </HStack>
                </Th>

                {/* Upcoming Time */}
                <Th>
                  <HStack>
                    <ClockIcon />
                    <Text className="table-header-text">Upcoming Time</Text>
                  </HStack>
                </Th>

                {/* Room */}
                <Th>
                  <HStack>
                    <LocationIcon />
                    <Text
                      ml={-1}
                      className="table-header-text"
                    >
                      Room
                    </Text>
                  </HStack>
                </Th>

                {/* Instructor */}
                <Th>
                  <HStack>
                    <PersonIcon />
                    <Text className="table-header-text">Instructor</Text>
                  </HStack>
                </Th>

                {/* Payee */}
                <Th>
                  <HStack>
                    <PersonIcon />
                    <Text className="table-header-text">Payee</Text>
                  </HStack>
                </Th>

                {/* Actions Column */}
                <Th></Th>
              </Tr>
            </Thead>

            <Tbody>
              {filteredPrograms.length === 0 ? (
                <Tr>
                  <Td
                    colSpan={8}
                    textAlign="center"
                  >
                    No programs available.
                  </Td>
                </Tr>
              ) : (
                filteredPrograms.map((program, idx) => {
                  const rowClass = "programs-table__row--even";
                  return (
                    <Tr
                      key={program.id}
                      onClick={() => handleRowClick(program.id)}
                      cursor="pointer"
                      className={rowClass}
                    >
                      <Td borderLeftRadius="12px">{program.name}</Td>
                      <Td>{renderStatusIcon(program.status)}</Td>
                      <Td>{program.upcomingDate}</Td>
                      <Td>{program.upcomingTime}</Td>
                      <Td>{program.room}</Td>
                      <Td>{truncateNames(program.instructor)}</Td>
                      <Td>{truncateNames(program.payee)}</Td>
                      <Td
                        borderRightRadius="12px"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            aria-label="Options"
                            icon={<ActionsIcon />}
                            variant="ghost"
                            bg="transparent"
                            _hover={{ bg: "transparent" }}
                            className="actions-container"
                          />
                          <MenuList className="menu-list-custom">
                            <MenuItem
                              onClick={(e) => handleEdit(program.id, e)}
                              className="menu-item menu-item--edit"
                            >
                              <EditIcon style={{ marginRight: "6px" }} />
                              <Text>Edit</Text>
                            </MenuItem>
                            <MenuItem
                              onClick={(e) => handleDeleteClick(program.id, e)}
                              className="menu-item menu-item--delete"
                            >
                              <CancelIcon style={{ marginRight: "6px" }} />
                              <Text>Delete</Text>
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Td>
                    </Tr>
                  );
                })
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent className="edit-cancel-frame">
            <AlertDialogHeader
              fontSize="lg"
              fontWeight="bold"
            >
              Delete Program
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure? You can&apos;t undo this action afterwards.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDelete}
                ml={3}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};