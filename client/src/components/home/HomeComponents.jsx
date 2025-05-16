import React, { useCallback, useEffect, useMemo, useState } from "react";

import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
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
} from "@chakra-ui/react";

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
import { PaginationComponent } from "../PaginationComponent";
import { SearchBar } from "../searchBar/SearchBar";
import DateSortingModal from "../sorting/DateFilter";
import ProgramSortingModal from "../sorting/ProgramFilter";
import StatusTooltip from "./StatusIcon";

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

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { backend } = useBackendContext();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

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
      setCurrentPage(1);
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
    setCurrentPage(1);
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
    } else if (sortKey === "date") {
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
    }
    return sorted;
  }, [filteredPrograms, sortKey, sortOrder]);

  const totalPrograms = sortedPrograms.length;
  const totalPages = Math.ceil(totalPrograms / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalPrograms);

  // Get current page data
  const currentPagePrograms = sortedPrograms.slice(startIndex, endIndex);

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

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

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


  useEffect(() => {
    const calculateRowsPerPage = () => {
      const viewportHeight = window.innerHeight;
      const rowHeight = 56;

      const availableHeight = viewportHeight * 0.4;

      console.log(availableHeight / rowHeight);
      return Math.max(5, Math.floor(availableHeight / rowHeight));
    };

    setItemsPerPage(calculateRowsPerPage());

    const handleResize = () => {
      setItemsPerPage(calculateRowsPerPage());
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
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
      <Box className="programs-table" >
        <Flex className="programs-table__filter-row">
          <div 
            className="archive"
            onClick={() => {
              navigate("/programs/archived");
            }}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 16 16" 
              fill="none"
              style={{ flexShrink: 0, marginRight: '4px' }}
            >
              <path d="M13.6933 3.48667L12.7667 2.36667C12.5867 2.14 12.3133 2 12 2H4C3.68667 2 3.41333 2.14 3.22667 2.36667L2.30667 3.48667C2.11333 3.71333 2 4.01333 2 4.33333V12.6667C2 13.4 2.6 14 3.33333 14H12.6667C13.4 14 14 13.4 14 12.6667V4.33333C14 4.01333 13.8867 3.71333 13.6933 3.48667ZM8 11.6667L4.33333 8H6.66667V6.66667H9.33333V8H11.6667L8 11.6667ZM3.41333 3.33333L3.95333 2.66667H11.9533L12.58 3.33333H3.41333Z" fill="#2D3748"/>
            </svg>
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
              {currentPagePrograms.length === 0 ? (
                <Tr>
                  <Td
                    colSpan={8}
                    textAlign="center"
                  >
                    No programs available.
                  </Td>
                </Tr>
              ) : (
                currentPagePrograms.map((program) => (
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

      <PaginationComponent
        totalPages={totalPages}
        goToNextPage={goToNextPage}
        goToPreviousPage={goToPreviousPage}
        currentPage={currentPage}
      />
    </Box>
  );
};
