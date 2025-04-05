import React, { useCallback, useEffect, useMemo, useState } from "react";

import { ChevronDownIcon, DeleteIcon } from "@chakra-ui/icons";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Box,
  Button,
  Checkbox,
  filter,
  Flex,
  HStack,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";

import { Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { ArchiveIcon } from "../../assets/ArchiveIcon";
// Icon imports - consider using React.memo for these components
import actionsSvg from "../../assets/icons/actions.svg";
import activeSvg from "../../assets/icons/active.svg";
import cancelSvg from "../../assets/icons/cancel.svg";
import clockSvg from "../../assets/icons/clock.svg";
import editSvg from "../../assets/icons/edit.svg";
import locationSvg from "../../assets/icons/location.svg";
import noneSvg from "../../assets/icons/none.svg";
import pastSvg from "../../assets/icons/past.svg";
import personSvg from "../../assets/icons/person.svg";
import { archiveCalendar } from "../../assets/icons/ProgramIcons";
import searchSvg from "../../assets/icons/search.svg";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import DateSortingModal from "../filters/DateFilter";
import ProgramSortingModal from "../filters/ProgramFilter";
import { ProgramFiltersModal } from "./ProgramFiltersModal";
import StatusTooltip from "./StatusIcon";
import { ProgramFilter } from "../filters/ProgramsFilter";

import "./Home.css";

// Memoize icon components
const ActiveStatusIcon = React.memo(() => (
  <img
    src={activeSvg}
    alt="Active"
  />
));
const PastStatusIcon = React.memo(() => (
  <img
    src={pastSvg}
    alt="Past"
  />
));
const NoneStatusIcon = React.memo(() => (
  <img
    src={noneSvg}
    alt="None"
  />
));
const ActionsIcon = React.memo(() => (
  <img
    src={actionsSvg}
    alt="Actions"
  />
));
const EditIcon = React.memo(() => (
  <img
    src={editSvg}
    alt="Edit"
  />
));
const CancelIcon = React.memo(() => (
  <img
    src={cancelSvg}
    alt="Cancel"
  />
));
const SearchIcon = React.memo(() => (
  <img
    src={searchSvg}
    alt="Search"
  />
));
const ClockIcon = React.memo(() => (
  <img
    src={clockSvg}
    alt="Clock"
  />
));
const LocationIcon = React.memo(() => (
  <img
    src={locationSvg}
    alt="Location"
  />
));
const PersonIcon = React.memo(() => (
  <img
    src={personSvg}
    alt="Person"
  />
));

// Memoize the TableRow component to prevent unnecessary re-renders
const TableRow = React.memo(
  ({
    program,
    handleRowClick,
    handleEdit,
    handleDeactivate,
    truncateNames,
  }) => {
    const rowClass = "programs-table__row--even";

    return (
      <Tr
        key={program.id}
        onClick={() => handleRowClick(program.id)}
        cursor="pointer"
        className={rowClass}
      >
        <Td borderLeftRadius="12px">{program.name}</Td>
        <Td>
          {program.status?.toLowerCase() === "active" ? (
            <ActiveStatusIcon />
          ) : program.status?.toLowerCase() === "past" ? (
            <PastStatusIcon />
          ) : (
            <NoneStatusIcon />
          )}
        </Td>
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
                icon={<Icon as={CancelIcon} />}
                onClick={() => handleDeactivate(program.id)}
              >
                Deactivate
              </MenuItem>
            </MenuList>
          </Menu>
        </Td>
      </Tr>
    );
  }
);

// Memoize table headers for better performance
const TableHeaders = React.memo(({ handleSortChange, sortOrder }) => (
  <Thead>
    <Tr>
      <Th>
        <HStack
          spacing={2}
          alignItems="center"
        >
          <Text className="table-header-text">Program</Text>
          <ProgramSortingModal
            sortOption={sortOrder}
            onSortChange={handleSortChange}
          />
        </HStack>
      </Th>
      <Th>
        <StatusTooltip />
      </Th>
      <Th>
        <Flex
          align="center"
          gap="8px"
          whiteSpace="nowrap"
        >
          <Box>
            <Icon as={archiveCalendar} />
          </Box>
          <Box>
            <Text
              textTransform="none"
              color="#767778"
              fontSize="16px"
              fontStyle="normal"
            >
              Upcoming Date
            </Text>
          </Box>
          <Box flexShrink={0}>
            <DateSortingModal onSortChange={handleSortChange} />
          </Box>
        </Flex>
      </Th>
      <Th>
        <HStack>
          <ClockIcon />
          <Text className="table-header-text">Upcoming Time</Text>
        </HStack>
      </Th>
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
      <Th>
        <HStack>
          <PersonIcon />
          <Text className="table-header-text">Instructor</Text>
        </HStack>
      </Th>
      <Th>
        <HStack>
          <PersonIcon />
          <Text className="table-header-text">Payee</Text>
        </HStack>
      </Th>
      <Th></Th>
    </Tr>
  </Thead>
));

export const ProgramsTable = () => {
  const [sortKey, setSortKey] = useState("title");
  const [sortOrder, setSortOrder] = useState("asc");
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
  const [selectedAction, setSelectedAction] = useState("Archive");
  const [selectedIcon, setSelectedIcon] = useState(ArchiveIcon);

  // Memoize expensive functions
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "No bookings";
    const date = new Date(dateString);
    return date
      .toLocaleDateString("en-US", {
        weekday: "short",
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      })
      .replace(/,/g, ".");
  }, []);

  const formatTime = useCallback((startTime, endTime) => {
    if (!startTime || !endTime) return "N/A";

    const formatSingleTime = (timeString) => {
      const [hours, minutes] = timeString.split(":");
      const date = new Date(2000, 0, 1, hours, minutes);
      return date
        .toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
        .toLowerCase();
    };

    return `${formatSingleTime(startTime)} - ${formatSingleTime(endTime)}`;
  }, []);

  // Fetch Programs with optimized mapping
  const fetchPrograms = useCallback(async () => {
    try {
      const response = await backend.get("/programs");

      if (!response.data || response.data.length === 0) {
        console.warn("No programs received from API.");
        setPrograms([]);
        return;
      }

      // Filter active programs first to reduce mapping work
      const activePrograms = response.data.filter(
        (program) => program.archived === false
      );

      // Format programs data for display - optimized mapping
      const programsData = activePrograms.map((program) => {
        // Handle multiple instructors or payees with a single operation
        const instructor = Array.isArray(program.instructorName)
          ? program.instructorName.join(", ")
          : program.instructorName || "N/A";

        const payee = Array.isArray(program.payeeName)
          ? program.payeeName.join(", ")
          : program.payeeName || "N/A";

        const date = program.date;
        const now = new Date();
        const programDate = date ? new Date(date) : null;
        const status = !date
          ? "No Bookings"
          : programDate > now
            ? "Active"
            : "Past";

        return {
          id: program.id,
          name: program.eventName,
          date: date,
          status: status,
          upcomingDate: formatDate(date),
          upcomingTime: formatTime(program.startTime, program.endTime),
          room: program.roomName || "N/A",
          instructor,
          payee,
        };
      });

      setPrograms(programsData);
      setFilteredPrograms(programsData); // Initialize filtered programs
    } catch (error) {
      console.error("Failed to fetch programs:", error);
    }
  }, [backend, formatDate, formatTime]);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  // Truncate long lists of instructors/payees - memoized
  const truncateNames = useCallback((names, maxLength = 30) => {
    if (!names || names.length <= maxLength) return names;
    return `${names.substring(0, maxLength)}...`;
  }, []);

  // Apply Filters - optimized with early returns
  const applyFilters = useCallback(() => {
    if (!programs.length) return [];

    let result = [...programs];
    const hasSearchTerm = searchTerm.trim() !== "";

    // Apply search filter first as it's likely to filter out many items
    if (hasSearchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter((program) =>
        program.name.toLowerCase().includes(searchLower)
      );
    }

    // Only apply other filters if we have a non-empty result
    if (result.length > 0) {
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

      // Status filter (faster than time range filter)
      if (filters.status !== "all") {
        const statusLower = filters.status.toLowerCase();
        result = result.filter(
          (program) => program.status.toLowerCase() === statusLower
        );
      }

      // Room filter (simple equality check)
      if (filters.room !== "all") {
        result = result.filter((program) => program.room === filters.room);
      }

      // Time Range filter (more expensive)
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

      // Instructor filter
      if (filters.instructor !== "all") {
        const instructorLower = filters.instructor.toLowerCase();
        result = result.filter(
          (program) =>
            program.instructor &&
            program.instructor.toLowerCase().includes(instructorLower)
        );
      }

      // Payee filter
      if (filters.payee !== "all") {
        const payeeLower = filters.payee.toLowerCase();
        result = result.filter(
          (program) =>
            program.payee && program.payee.toLowerCase().includes(payeeLower)
        );
      }
    }

    return result;
  }, [programs, filters, searchTerm]);

  // Apply filters when dependencies change
  useEffect(() => {
    const filteredResults = applyFilters();
    setFilteredPrograms(filteredResults);
  }, [applyFilters]);

  // Memoize sorted programs to avoid recalculation
  const sortedPrograms = useMemo(() => {
    if (!filteredPrograms.length) return [];

    const sorted = [...filteredPrograms];
    if (sortKey === "title") {
      sorted.sort((a, b) =>
        sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      );
    } else if (sortKey === "date") {
      sorted.sort((a, b) => {
        const aInvalid = !a.date || a.date === "N/A";
        const bInvalid = !b.date || b.date === "N/A";
        if (aInvalid && bInvalid) return 0;
        if (aInvalid) return 1; // a is invalid, push to end
        if (bInvalid) return -1; // b is invalid, push to end
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      });
    }
    return sorted;
  }, [filteredPrograms, sortKey, sortOrder]);

  // Handlers - memoized to prevent recreation on each render
  const handleApplyFilters = useCallback((newFilters) => {
    setFilters(newFilters);
    setIsFiltersModalOpen(false);
  }, []);

  const handleRowClick = useCallback(
    (id) => {
      navigate(`/programs/${id}`);
    },
    [navigate]
  );

  const handleEdit = useCallback(
    (id, e) => {
      e.stopPropagation();
      navigate(`/programs/${id}`);
    },
    [navigate]
  );

  const handleDeactivate = useCallback(
    (id) => {
      setProgramToDelete(id);
      onOpen();
    },
    [onOpen]
  );

  const handleSelect = useCallback((action, iconSrc) => {
    setSelectedAction(action);
    setSelectedIcon(iconSrc);
  }, []);

  const handleArchive = useCallback(async () => {
    try {
      await backend.put(`/events/${programToDelete}`, {
        archived: true,
      });
      setPrograms((prev) => prev.filter((p) => p.id !== programToDelete));
      onClose();
      toast({
        title: "Program archived",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.log("Couldn't archive", error);
      toast({
        title: "Archive failed",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [backend, programToDelete, onClose, toast]);

  const handleDelete = useCallback(async () => {
    try {
      const response = await backend.delete(`/events/${programToDelete}`);
      if (response.data.result === "success") {
        setPrograms((prev) => prev.filter((p) => p.id !== programToDelete));
        toast({
          title: "Program deleted",
          description:
            "The program and all related records have been successfully deleted.",
          status: "success",
          duration: 3000,
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
        duration: 3000,
        isClosable: true,
      });
    }
    onClose();
  }, [backend, programToDelete, onClose, toast]);

  const handleConfirm = useCallback(async () => {
    if (selectedAction === "Archive") {
      await handleArchive();
    } else if (selectedAction === "Delete") {
      await handleDelete();
    }
  }, [selectedAction, handleArchive, handleDelete]);

  const handleSortChange = useCallback((key, order) => {
    setSortKey(key);
    setSortOrder(order);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  // console.log("filterprograms", filteredPrograms);

  return (
    <>
      <Box className="programs-table">
        <Flex className="programs-table__filter-row">
          {/* <ProgramFiltersModal onApplyFilters={handleApplyFilters} /> */}
          <ProgramFilter programs={programs} setFilteredPrograms={setFilteredPrograms}/>
          <Box flex="1" />
          <div className="search-wrapper">
            <div className="searchbar-container">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <div className="searchbar-icon-container">
              <SearchIcon />
            </div>
          </div>
        </Flex>

        <TableContainer className="programs-table__container">
          <Table
            variant="simple"
            size="sm"
            className="programs-table__table"
          >
            <TableHeaders
              handleSortChange={handleSortChange}
              sortOrder={sortOrder}
            />
            <Tbody>
              {sortedPrograms.length === 0 ? (
                <Tr>
                  <Td
                    colSpan={8}
                    textAlign="center"
                  >
                    No programs available.
                  </Td>
                </Tr>
              ) : (
                sortedPrograms.map((program) => (
                  <TableRow
                    key={program.id}
                    program={program}
                    handleRowClick={handleRowClick}
                    handleEdit={handleEdit}
                    handleDeactivate={handleDeactivate}
                    truncateNames={truncateNames}
                  />
                ))
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Deactivate Program?</ModalHeader>
          <ModalBody>
            <Alert
              status="error"
              borderRadius="md"
              p={4}
              display="flex"
              flexDirection="column"
            >
              <Box color="#90080F">
                <Flex alignitems="center">
                  <Box
                    color="#90080F0"
                    mr={2}
                    display="flex"
                    alignItems="center"
                  >
                    <Info />
                  </Box>
                  <AlertTitle
                    color="#90080F"
                    fontSize="md"
                    fontWeight="500"
                  >
                    The deactivation fee deadline for this program is{" "}
                    <AlertDescription
                      fontSize="md"
                      fontWeight="bold"
                    >
                      Thu. 1/2/2025.
                    </AlertDescription>
                  </AlertTitle>
                </Flex>
                <Flex
                  mt={4}
                  align="center"
                  justify="center"
                  width="100%"
                >
                  <Checkbox
                    fontWeight="500"
                    sx={{
                      ".chakra-checkbox__control": {
                        bg: "white",
                        border: "#D2D2D2",
                      },
                    }}
                  >
                    Waive fee
                  </Checkbox>
                </Flex>
              </Box>
            </Alert>
            <Box mt={4}>
              <Text
                fontWeight="medium"
                mb={2}
              >
                Reason for Deactivation:
              </Text>
              <Textarea
                bg="#F0F1F4"
                placeholder="..."
                size="md"
                borderRadius="md"
              />
            </Box>
            <Box
              mt={4}
              display="flex"
              justifyContent="right"
            >
              <Menu>
                <MenuButton
                  as={Button}
                  rightIcon={<ChevronDownIcon />}
                  bg="#F0F1F4"
                  variant="outline"
                  width="50%"
                  justify="right"
                >
                  {selectedIcon} {selectedAction}
                </MenuButton>
                <MenuList>
                  <MenuItem
                    icon={
                      <Box
                        display="inline-flex"
                        alignItems="center"
                      >
                        <Icon
                          as={ArchiveIcon}
                          boxSize={4}
                        />
                      </Box>
                    }
                    onClick={() => handleSelect("Archive", ArchiveIcon)}
                    display="flex"
                    alignItems="center"
                  >
                    Archive
                  </MenuItem>
                  <MenuItem
                    icon={<DeleteIcon />}
                    onClick={() => handleSelect("Delete", <DeleteIcon />)}
                  >
                    Delete
                  </MenuItem>
                </MenuList>
              </Menu>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button
              bg="transparent"
              onClick={onClose}
              color="#767778"
              borderRadius="30px"
              mr={3}
            >
              Exit
            </Button>
            <Button
              onClick={handleConfirm}
              style={{ backgroundColor: "#90080F" }}
              colorScheme="white"
              borderRadius="30px"
            >
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
