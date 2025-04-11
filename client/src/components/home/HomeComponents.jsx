import React, { useCallback, useEffect, useMemo, useState } from "react";

import { ChevronDownIcon, DeleteIcon } from "@chakra-ui/icons";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Box,
  Button,
  Checkbox,
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

// Icon imports - consider using React.memo for these components
import { PaintPaletteIcons } from "../../assets/PaintPaletteIcon";
import { ProgramArchiveIcon } from "../../assets/ProgramArchiveIcon";
import {LocationPinIcon} from '../../assets/LocationPinIcon';
import { EditCancelPopup } from "../cancelModal/EditCancelPopup";
import { MenuOptionsIcon } from "../../assets/MenuOptionsIcon";
import activeSvg from "../../assets/icons/active.svg";
import { CancelIcon } from "../../assets/CancelIcon";
import clockSvg from "../../assets/icons/clock.svg";
import { EditIcon } from "../../assets/EditIcon";
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
import { ArchiveIcon } from "../../assets/ArchiveIcon";
import { CancelProgram } from "../cancelModal/CancelProgramComponent";
import { SearchBar } from "../searchBar/SearchBar";

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
  <Icon
    as={MenuOptionsIcon}
    alt="Actions"
  />
));
const EditPencilIcon = React.memo(() => (
  <Icon
    as={EditIcon}
    alt="Edit"
  />
));
const CancelXIcon = React.memo(() => (
  <Icon
    as={CancelIcon}
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
    selectedIcon,
    selectedAction,
    onOpen,
    isOpen,
    onClose
  }) => {
    const rowClass = "programs-table__row--even";

    return (
      <Tr
        key={program.id}
        onClick={() => handleRowClick(program.id)}
        cursor="pointer"
        className={rowClass}
      >
        <Td style={{ width: "20rem", maxWidth: "20rem", boxSizing: "border-box" }}>{program.name}</Td>
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
        <Td><Box maxWidth="5rem">{program.room}</Box></Td>
        <Td>
          <Box className="programs-ellipsis-box">{truncateNames(program.instructor)}</Box>
        </Td>
        <Td>
          <Box className="programs-ellipsis-box">{truncateNames(program.payee)}</Box>
        </Td>
        <Td
          borderRightRadius="12px"
          onClick={(e) => e.stopPropagation()}
        >
          <EditCancelPopup
            handleEdit={handleEdit}
            handleDeactivate={handleDeactivate}
            id={program.id}
          />
        </Td>
      </Tr>
    );
  }
);

// Memoize table headers for better performance
const TableHeaders = React.memo(({ handleSortChange, sortOrder }) => (
  <Thead>
    <Tr>
      <Th style={{ width: "20rem", maxWidth: "20rem", boxSizing: "border-box" }}>
        <HStack
          spacing={2}
          alignItems="center"
        >
          <Text className="table-header-text">PROGRAM</Text>
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
            <Text className="table-header-text">DATE</Text>
          </Box>
          <Box flexShrink={0}>
            <DateSortingModal onSortChange={handleSortChange} />
          </Box>
        </Flex>
      </Th>
      <Th justifyContent="center">
        <HStack>
          <ClockIcon />
          <Text className="table-header-text">UPCOMING TIME</Text>
        </HStack>
      </Th>
      <Th justifyContent="center">
        <HStack>
          <LocationPinIcon />
          <Text
            ml={-1}
            className="table-header-text"
          >
            ROOM
          </Text>
        </HStack>
      </Th>
      <Th justifyContent="center" maxWidth="8rem">
        <HStack>
          <PaintPaletteIcons />
          <Text className="table-header-text">LEAD ARTIST(S)</Text>
        </HStack>
      </Th>
      <Th justifyContent="center"  maxWidth="10rem">
        <HStack>
          <PersonIcon />
          <Text className="table-header-text">PAYER(S)</Text>
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
  // const [selectedAction, setSelectedAction] = useState("Archive");
  // const [selectedIcon, setSelectedIcon] = useState(ArchiveIcon);

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
      navigate(`/programs/edit/${id}`);
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

  const handleSortChange = useCallback((key, order) => {
    setSortKey(key);
    setSortOrder(order);
  }, []);

  const handleSearchChange = (query) => {
    setSearchTerm(query);
  };

  return (
    <>
      <CancelProgram
        id={programToDelete}
        setPrograms={setPrograms}
        onOpen={onOpen}
        isOpen={isOpen}
        onClose={onClose}
        type={"Program"}
      />
      <Box className="programs-table">
        <Flex className="programs-table__filter-row">
          <div className="archive">
            <Icon
              as={ProgramArchiveIcon}
              alt="Archived"
              className="archive-icon"
            />
            <span className="archive-text" onClick={() => {navigate('/programs/archived')}}>Archived</span>
          </div>
          <ProgramFiltersModal onApplyFilters={handleApplyFilters} />
          <Box flex="1" />
          <SearchBar
             handleSearch={handleSearchChange}
             searchQuery={searchTerm}
          />
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
                    onOpen={onOpen}
                    isOpen={isOpen}
                    onClose={onClose}
                  />
                ))
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
    </>
  );
};
