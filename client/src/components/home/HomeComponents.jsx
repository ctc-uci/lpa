import React, { useCallback, useEffect, useRef, useState } from "react";

import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";

import { useNavigate } from "react-router-dom";

import actionsSvg from "../../assets/icons/actions.svg";
import activeSvg from "../../assets/icons/active.svg";
import calendarSvg from "../../assets/icons/calendar.svg";
import cancelSvg from "../../assets/icons/cancel.svg";
import clockSvg from "../../assets/icons/clock.svg";
import editSvg from "../../assets/icons/edit.svg";
import filterSvg from "../../assets/icons/filter.svg";
import locationSvg from "../../assets/icons/location.svg";
import pastSvg from "../../assets/icons/past.svg";
import personSvg from "../../assets/icons/person.svg";
import programSvg from "../../assets/icons/program.svg";
import searchSvg from "../../assets/icons/search.svg";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { ProgramFiltersModal } from "./ProgramFiltersModal";
import { ProgramStatusLegend } from "./ProgramStatusLegend";


const ActiveStatusIcon = (props) => (
  <img
    src={activeSvg}
    alt="Active Status"
    style={{ width: 20, height: 20 }}
    {...props}
  />
);

const PastStatusIcon = (props) => (
  <img
    src={pastSvg}
    alt="Past Status"
    style={{ width: 20, height: 20 }}
    {...props}
  />
);

const FiltersIcon = (props) => (
  <img
    src={filterSvg}
    alt="Filters"
    style={{ width: 20, height: 20 }}
    {...props}
  />
);

const ActionsIcon = (props) => (
  <img
    src={actionsSvg}
    alt="Actions Menu"
    style={{ width: 20, height: 20 }}
    {...props}
  />
);

const EditIcon = (props) => (
  <img
    src={editSvg}
    alt="Edit"
    style={{ width: 20, height: 20 }}
    {...props}
  />
);

const CancelIcon = (props) => (
  <img
    src={cancelSvg}
    alt="Cancel"
    style={{ width: 20, height: 20 }}
    {...props}
  />
);

const SearchIcon = (props) => (
  <img
    src={searchSvg}
    alt="Search"
    style={{ width: 20, height: 20 }}
    {...props}
  />
);

const ProgramIcon = (props) => (
  <img
    src={programSvg}
    alt="Program"
    style={{ width: 20, height: 20 }}
    {...props}
  />
);

const CalendarIcon = (props) => (
  <img
    src={calendarSvg}
    alt="Calendar"
    style={{ width: 20, height: 20 }}
    {...props}
  />
);

const ClockIcon = (props) => (
  <img
    src={clockSvg}
    alt="Clock"
    style={{ width: 20, height: 20 }}
    {...props}
  />
);

const LocationIcon = (props) => (
  <img
    src={locationSvg}
    alt="Location"
    style={{ width: 20, height: 20 }}
    {...props}
  />
);

const PersonIcon = (props) => (
  <img
    src={personSvg}
    alt="Person"
    style={{ width: 20, height: 20 }}
    {...props}
  />
);

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

  const fetchPrograms = useCallback(async () => {
    try {
      const response = await backend.get("/programs");
      console.log("API Response:", response.data); 
  
      if (!response.data || response.data.length === 0) {
        console.warn("No programs received from API.");
        setPrograms([]);
        return;
      }
  
      const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = {
          weekday: "short",
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        };
        return date.toLocaleDateString("en-US", options).replace(/,/g, ".");  
      };

      const formatTime = (timeString) => {
        const [hours, minutes] = timeString.split(":");
        const date = new Date(2000, 0, 1, hours, minutes);
        return date
          .toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
          .toLowerCase();
      };

      const programsData = response.data.map((program) => ({ 
        name: program.eventName,  
        status: program.date && new Date(program.date) > new Date() ? "Active" : "Past",
        upcomingDate: program.date ? formatDate(program.date) : "No bookings",
        upcomingTime: program.startTime && program.endTime 
          ? `${formatTime(program.startTime)} - ${formatTime(program.endTime)}`
          : "N/A",
        room: program.roomName || "N/A",
        instructor: program.instructorName || "N/A",
        payee: program.payeeName || "N/A",
      }));
  
      console.log("Formatted Programs:", programsData); 
      setPrograms(programsData);
    } catch (error) {
      console.error("Failed to fetch programs:", error);
    }
  }, [backend]);
  

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  ///////////////
  // Filtering //
  ///////////////

  const applyFilters = useCallback(() => {
    let result = programs;
  
    // Date Range Filtering
    if (filters.dateRange.start || filters.dateRange.end) {
      result = result.filter((program) => {
        if (!program.date) return false;
        const bookingDate = new Date(program.date);
        return (
          (!filters.dateRange.start || bookingDate >= new Date(filters.dateRange.start)) &&
          (!filters.dateRange.end || bookingDate <= new Date(filters.dateRange.end))
        );
      });
    }
  
    // Time Range Filtering
    if (filters.timeRange.start || filters.timeRange.end) {
      result = result.filter((program) => {
        if (program.upcomingTime === "N/A") return false;
        const [startTime] = program.upcomingTime.split(" - ");
        const startTimeObj = new Date(`2000-01-01 ${startTime}`);
        return (
          (!filters.timeRange.start || startTimeObj >= new Date(`2000-01-01 ${filters.timeRange.start}`)) &&
          (!filters.timeRange.end || startTimeObj <= new Date(`2000-01-01 ${filters.timeRange.end}`))
        );
      });
    }
  
    // Other Filters
    if (filters.status !== "all") {
      result = result.filter((program) => program.status.toLowerCase() === filters.status.toLowerCase());
    }
    if (filters.room !== "all") {
      result = result.filter((program) => program.room === filters.room);
    }
    if (filters.instructor !== "all") {
      result = result.filter((program) => program.instructor.toLowerCase() === filters.instructor.toLowerCase());
    }
    if (filters.payee !== "all") {
      result = result.filter((program) => program.payee.toLowerCase() === filters.payee.toLowerCase());
    }

    if (searchTerm.trim() !== "") {
      result = result.filter((program) =>
        program.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  
    setFilteredPrograms(result);
  }, [programs, filters, searchTerm]);
  
  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setIsFiltersModalOpen(false); 
};


  useEffect(() => {
    applyFilters();
  }, [filters, programs, searchTerm, applyFilters]);
    
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
  
  const handleDelete = async () => {
    if (programToDelete) {
      try {
        const response = await backend.delete(`/events/${programToDelete}`);
        if (response.data.result === "success") {
          setPrograms(programs.filter((p) => p.id !== programToDelete));
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

  // Returns the proper status icon
  const renderStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return <ActiveStatusIcon />;
      case "past":
        return <PastStatusIcon />;
      default:
        return null;
    }
  };


  return (
    <>
      {/* Top area: Filters + Search box */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "1rem",
        }}
      >
        <Button
          leftIcon={<FiltersIcon />}
          onClick={() => setIsFiltersModalOpen(true)}
        >
          Filters
        </Button>

        
        <InputGroup style={{ width: "300px" }}>
          <Input
            placeholder="Search programs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <InputRightElement pointerEvents="none">
            <SearchIcon />
          </InputRightElement>
        </InputGroup>

      </div>

      {/* Status legend (Active/Past) */}
      <ProgramStatusLegend />

      {/* The table */}
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              {/* Program Name with icon to the RIGHT */}
              <Th style={{ whiteSpace: "nowrap" }}>
                Program Name
                <ProgramIcon style={{ marginLeft: "6px" }} />
              </Th>
              <Th>Status</Th>
              {/* Upcoming Date with icon to the LEFT */}
              <Th>
                <CalendarIcon style={{ marginRight: "6px" }} />
                Upcoming Date
              </Th>
              {/* Upcoming Time with icon to the LEFT */}
              <Th>
                <ClockIcon style={{ marginRight: "6px" }} />
                Upcoming Time
              </Th>
              {/* Room with icon to the LEFT */}
              <Th>
                <LocationIcon style={{ marginRight: "6px" }} />
                Room
              </Th>
              {/* Instructor with icon to the LEFT */}
              <Th>
                <PersonIcon style={{ marginRight: "6px" }} />
                Instructor
              </Th>
              {/* Payee with icon to the LEFT */}
              <Th>
                <PersonIcon style={{ marginRight: "6px" }} />
                Payee
              </Th>
              {/* Actions column */}
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredPrograms.length === 0 ? (
              <Tr>
                <Td colSpan="7" style={{ textAlign: "center" }}>
                  No programs available.
                </Td>
              </Tr>
            ) : (
              filteredPrograms.map((program) => (
                <Tr key={program.id} onClick={() => handleRowClick(program.id)} cursor="pointer">
                  <Td>{program.name}</Td>
                  <Td>{renderStatusIcon(program.status)}</Td>
                  <Td>{program.upcomingDate}</Td>
                  <Td>{program.upcomingTime}</Td>
                  <Td>{program.room}</Td>
                  <Td>{program.instructor}</Td>
                  <Td>{program.payee}</Td>
                  <Td onClick={(e) => e.stopPropagation()}>
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        aria-label="Options"
                        icon={<ActionsIcon />} // Uses your existing ActionsIcon
                        variant="outline"
                      />
                      <MenuList>
                        <MenuItem onClick={(e) => handleEdit(program.id, e)}>
                          <EditIcon style={{ marginRight: "6px" }} />
                          Edit
                        </MenuItem>
                        <MenuItem
                          onClick={(e) => handleDeleteClick(program.id, e)}
                          color="red.500"
                        >
                          <CancelIcon style={{ marginRight: "6px" }} />
                          Delete
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>

        </Table>
      </TableContainer>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
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

      {/* Filters Modal */}
      <ProgramFiltersModal
        isOpen={isFiltersModalOpen}
        onClose={() => setIsFiltersModalOpen(false)}
        onApplyFilters={handleApplyFilters}
        filters={filters}
        setFilters={setFilters}
      />
    </>
  );
};
