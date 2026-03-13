import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  Box,
  Flex,
  HStack,
  Icon,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import { formatSessionDateWithWeekday } from "../programs/utils";

import { useNavigate } from "react-router-dom";

import { CancelIcon } from "../../assets/CancelIcon";
import { EditIcon } from "../../assets/EditIcon";
import activeSvg from "../../assets/icons/active.svg";
import clockSvg from "../../assets/icons/clock.svg";
import noneSvg from "../../assets/icons/none.svg";
import pastSvg from "../../assets/icons/past.svg";
import personSvg from "../../assets/icons/person.svg";
import { archiveCalendar } from "../../assets/icons/ProgramIcons";
import searchSvg from "../../assets/icons/search.svg";
import { LocationPinIcon } from "../../assets/LocationPinIcon";
import { MenuOptionsIcon } from "../../assets/MenuOptionsIcon";
// Icon imports - consider using React.memo for these components
import { PaintPaletteIcons } from "../../assets/PaintPaletteIcon";
import { ProgramArchiveIcon } from "../../assets/ProgramArchiveIcon";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { CancelProgram } from "../cancelModal/CancelProgramComponent";
import { EditCancelPopup } from "../cancelModal/EditCancelPopup";
import { ProgramFilter } from "../filters/ProgramsFilter";
import { SearchBar } from "../searchBar/SearchBar";
import DateSortingModal from "../sorting/DateFilter";
import ProgramSortingModal from "../sorting/ProgramFilter";
import StatusTooltip from "./StatusIcon";
import { ArchivesIcon } from "../../assets/icons/ArchivesIcon";
import { RoundedButton } from "../filters/FilterComponents";

import "./Home.css";

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
    onClose,
  }) => {
    const rowClass = "programs-table__row--even";

    return (
      <Tr
        key={program.id}
        onClick={() => handleRowClick(program.id)}
        cursor="pointer"
        className={rowClass}
      >
        <Td>
          <Box paddingLeft="8px">
            {truncateNames(program.name)}
          </Box>
        </Td>
        <Td>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
            width="100%"
          >
            {program.status?.toLowerCase() === "active" ? (
              <ActiveStatusIcon />
            ) : program.status?.toLowerCase() === "past" ? (
              <PastStatusIcon />
            ) : (
              <NoneStatusIcon />
            )}
          </Box>
        </Td>
        <Td>
          <Box paddingLeft="8px">
            {program.upcomingDate}
          </Box>
        </Td>
        <Td>{program.upcomingTime}</Td>
        <Td>{truncateNames(program.room, true)}</Td>
        <Td>
          <Box className="programs-ellipsis-box">
            {truncateNames(program.instructor)}
          </Box>
        </Td>
        <Td>
          <Box className="programs-ellipsis-box">
            {truncateNames(program.payee)}
          </Box>
        </Td>
        <Td
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

const TableHeaders = React.memo(({ handleSortChange, sortOrder }) => (
  <Thead>
    <Tr>
      <Th>
        <HStack
          width="100%"
          justifyContent="space-between"
          paddingLeft="8px"
          paddingRight="8px"
        >
          <Text className="table-header-text">PROGRAM</Text>
          <ProgramSortingModal
            sortOption={sortOrder}
            onSortChange={handleSortChange}
          />
        </HStack>
      </Th>
      <Th>
        <Box textAlign="center">
          <Text className="table-header-text">STATUS</Text>
        </Box>
      </Th>
      <Th>
        <Flex
          width="100%"
          paddingLeft="8px"
          paddingRight="8px"
          alignItems="center"
        >
          <Icon as={archiveCalendar} />
          <Box ml="4px">
            <Text className="table-header-text">DATE</Text>
          </Box>
          <Box ml="4px" marginLeft="auto">
            <DateSortingModal onSortChange={handleSortChange} />
          </Box>
        </Flex>
      </Th>
      <Th>
        <HStack spacing="12px">
          <ClockIcon />
          <Text className="table-header-text">UPCOMING TIME</Text>
        </HStack>
      </Th>
      <Th>
        <HStack spacing="12px">
          <LocationPinIcon />
          <Text className="table-header-text">ROOM</Text>
        </HStack>
      </Th>
      <Th>
        <HStack spacing="12px">
          <PaintPaletteIcons />
          <Text className="table-header-text">LEAD ARTIST(S)</Text>
        </HStack>
      </Th>
      <Th>
        <HStack spacing="12px">
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

  const PAGE_SIZE = 20;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef(null);

  const { backend } = useBackendContext();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "No bookings";
    return formatSessionDateWithWeekday(dateString);
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

  const fetchPrograms = useCallback(async () => {
    try {
      const response = await backend.get("/programs");

      if (!response.data || response.data.length === 0) {
        console.warn("No programs received from API.");
        setPrograms([]);
        return;
      }

      const activePrograms = response.data.filter(
        (program) => program.archived === false
      );
      const programsData = activePrograms.map((program) => {
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
      setFilteredPrograms(programsData);
      setVisibleCount(PAGE_SIZE);
    } catch (error) {
      console.error("Failed to fetch programs:", error);
    }
  }, [backend, formatDate, formatTime]);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  // Truncate long lists of instructors/payees - memoized
  const truncateNames = useCallback((names, isRoom = false, maxLength = 30) => {
    if (isRoom) {
      maxLength = 10;
    }
    if (!names || names.length <= maxLength) return names;
    return `${names.substring(0, maxLength)}...`;
  }, []);

  const applyFilters = useCallback(() => {
    if (!programs.length) return [];

    let result = [...programs];
    const hasSearchTerm = searchTerm.trim() !== "";

    if (hasSearchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter((program) =>
        program.name.toLowerCase().includes(searchLower)
      );
    }

    if (result.length > 0) {
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

      if (filters.status !== "all") {
        const statusLower = filters.status.toLowerCase();
        result = result.filter(
          (program) => program.status.toLowerCase() === statusLower
        );
      }

      if (filters.room !== "all") {
        result = result.filter((program) => program.room === filters.room);
      }

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

      if (filters.instructor !== "all") {
        const instructorLower = filters.instructor.toLowerCase();
        result = result.filter(
          (program) =>
            program.instructor &&
            program.instructor.toLowerCase().includes(instructorLower)
        );
      }

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

  useEffect(() => {
    const filteredResults = applyFilters();
    setFilteredPrograms(filteredResults);
    setVisibleCount(PAGE_SIZE);
  }, [applyFilters]);

  const sortedPrograms = useMemo(() => {
    if (!filteredPrograms.length) return [];

    const sorted = [...filteredPrograms];
    if (sortKey === "title") {
      sorted.sort((a, b) =>
        sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      );
    } if (sortKey === "date") {
      sorted.sort((a, b) => {
        const aInvalid = !a.date || a.date === "N/A";
        const bInvalid = !b.date || b.date === "N/A";
        if (aInvalid && bInvalid) return 0;
        if (aInvalid) return 1;
        if (bInvalid) return -1;
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      });
    } else if (sortKey === "default") {
      sorted.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
        
        const aIsFuture = dateA >= today;
        const bIsFuture = dateB >= today;
        
        // If one is future and one is past, future comes first
        if (aIsFuture && !bIsFuture) return -1;
        if (!aIsFuture && bIsFuture) return 1;
        
        // If both are in the same section (both future or both past)
        if (aIsFuture && bIsFuture) {
          // Future dates: most recent to most distant (ascending order)
          return dateA - dateB;
        } else {
          // Past dates: most recent to most distant in the past (descending order)
          return dateB - dateA;
        }
      });
    }
    return sorted;
  }, [filteredPrograms, sortKey, sortOrder]);

  const visiblePrograms = sortedPrograms.slice(0, visibleCount);
  const hasMore = visibleCount < sortedPrograms.length;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setVisibleCount((prev) => prev + PAGE_SIZE);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore]);

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
    <Box>
      <CancelProgram
        id={programToDelete}
        setPrograms={setPrograms}
        onOpen={onOpen}
        isOpen={isOpen}
        onClose={onClose}
        type={"Program"}
      />
      <Box className="programs-table" width={"95%"}>
        <Flex className="programs-table__filter-row">
          <div
            className="archive"
            onClick={() => {
              navigate("/programs/archived");
            }}
          >
            <ArchivesIcon />
            <span
              className="archive-text"
            >
              Archives
            </span>
          </div>
          <ProgramFilter
            programs={programs}
            setFilteredPrograms={setFilteredPrograms}
          />
          {(sortKey !== "title" || sortOrder !== "asc") && (
          <>
            <Box ml="20px" />
            <RoundedButton
              onClick={() => {
                setSortKey("title");
                setSortOrder("asc");
              }}
              isActive={false}
            >
              Reset Sorting
            </RoundedButton>
          </>
          )}
          <Box flex="1" />
          <SearchBar
            handleSearch={handleSearchChange}
            searchQuery={searchTerm}
          />
        </Flex>

        <TableContainer
          className="programs-table__container"
          width="100%"
          padding="0"
          overflowY="auto"
          maxHeight="75vh"
        >
          <Table
            variant="simple"
            size="sm"
            className="programs-table__table"
            width="100%"
          >
            <TableHeaders
              handleSortChange={handleSortChange}
              sortOrder={sortOrder}
            />
            <Tbody>
              {visiblePrograms.length === 0 ? (
                <Tr>
                  <Td
                    colSpan={8}
                    textAlign="center"
                  >
                    No programs available.
                  </Td>
                </Tr>
              ) : (
                visiblePrograms.map((program) => (
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
              {hasMore && (
                <Tr ref={sentinelRef}>
                  <Td colSpan={8} textAlign="center" py={4}>
                    <Spinner size="sm" />
                  </Td>
                </Tr>
              )}
              {!hasMore && visiblePrograms.length > 0 && (
                <Tr ref={sentinelRef}>
                  <Td colSpan={8} />
                </Tr>
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};
