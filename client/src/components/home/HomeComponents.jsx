// ProgramsTable.jsx
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

// =============================
// ===  1. Icon Imports    ====
// =============================
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

// =============================
// === 2. Tiny Icon Components
// =============================
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

// =============================
// ===  ProgramsTable     =====
// =============================
export const ProgramsTable = () => {
  const [programs, setPrograms] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [programToDelete, setProgramToDelete] = useState(null);
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [filters, setFilters] = useState({});

  const { backend } = useBackendContext();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const toast = useToast();
  const cancelRef = useRef();

  // =============================
  // ===   Fetch Program Data  ===
  // =============================
  const fetchPrograms = useCallback(async () => {
    try {
      const eventsResponse = await backend.get("/events");
      const bookingsResponse = await backend.get("/bookings");
      const roomsResponse = await backend.get("/rooms");
      const assignmentsResponse = await backend.get("/assignments");
      const clientsResponse = await backend.get("/clients");

      const eventsData = eventsResponse.data;
      const bookingsData = bookingsResponse.data;
      const roomsData = roomsResponse.data;
      const assignmentsData = assignmentsResponse.data;
      const clientsData = clientsResponse.data;

      const currentDate = new Date();

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

      const programsData = eventsData.map((event) => {
        const eventBookings = bookingsData.filter(
          (booking) => booking.eventId === event.id
        );
        const upcomingBookings = eventBookings.filter(
          (booking) => new Date(booking.date) > currentDate
        );
        const pastBookings = eventBookings.filter(
          (booking) => new Date(booking.date) <= currentDate
        );

        let relevantBooking;
        let status;

        if (upcomingBookings.length > 0) {
          relevantBooking = upcomingBookings.reduce((earliest, current) =>
            new Date(current.date) < new Date(earliest.date)
              ? current
              : earliest
          );
          status = "Active";
        } else if (pastBookings.length > 0) {
          relevantBooking = pastBookings.reduce((latest, current) =>
            new Date(current.date) > new Date(latest.date) ? current : latest
          );
          status = "Past";
        } else {
          status = "No bookings";
        }

        const room = relevantBooking
          ? roomsData.find((r) => r.id === relevantBooking.roomId)
          : null;

        const eventAssignments = assignmentsData.filter(
          (assignment) => assignment.eventId === event.id
        );
        const instructorAssignment = eventAssignments.find(
          (assignment) => assignment.role === "instructor"
        );
        const payeeAssignment = eventAssignments.find(
          (assignment) => assignment.role === "payee"
        );

        const instructor = instructorAssignment
          ? clientsData.find(
              (client) => client.id === instructorAssignment.clientId
            )
          : null;

        const payee = payeeAssignment
          ? clientsData.find((client) => client.id === payeeAssignment.clientId)
          : null;

        return {
          id: event.id,
          name: event.name,
          description: event.description,
          status,
          upcomingDate: relevantBooking
            ? formatDate(relevantBooking.date)
            : "No bookings",
          upcomingTime: relevantBooking
            ? `${formatTime(relevantBooking.startTime)} - ${formatTime(
                relevantBooking.endTime
              )}`
            : "N/A",
          room: room ? room.name : "N/A",
          instructor: instructor ? instructor.name : "N/A",
          payee: payee ? payee.name : "N/A",
        };
      });

      setPrograms(programsData);
    } catch (error) {
      console.error("Failed to fetch programs:", error);
    }
  }, [backend]);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  // =============================
  // ===   Filtering Logic    ===
  // =============================
  const applyFilters = useCallback(() => {
    let result = programs;

    if (
      filters.dateRange &&
      (filters.dateRange.start || filters.dateRange.end)
    ) {
      result = result.filter((program) => {
        if (program.upcomingDate === "No bookings") return false;
        const bookingDate = new Date(program.upcomingDate);
        return (
          (!filters.dateRange.start ||
            bookingDate >= new Date(filters.dateRange.start)) &&
          (!filters.dateRange.end ||
            bookingDate <= new Date(filters.dateRange.end))
        );
      });
    }

    if (
      filters.timeRange &&
      (filters.timeRange.start || filters.timeRange.end)
    ) {
      result = result.filter((program) => {
        if (program.upcomingTime === "N/A") return false;
        const [startTime] = program.upcomingTime.split(" - ");
        return (
          (!filters.timeRange.start || startTime >= filters.timeRange.start) &&
          (!filters.timeRange.end || startTime <= filters.timeRange.end)
        );
      });
    }

    if (filters.status && filters.status !== "all") {
      result = result.filter(
        (program) =>
          program.status.toLowerCase() === filters.status.toLowerCase()
      );
    }

    if (filters.room && filters.room !== "all") {
      result = result.filter((program) => program.room === filters.room);
    }

    if (filters.instructor && filters.instructor !== "all") {
      result = result.filter(
        (program) =>
          program.instructor &&
          program.instructor.toLowerCase() === filters.instructor.toLowerCase()
      );
    }

    if (filters.payee && filters.payee !== "all") {
      result = result.filter(
        (program) =>
          program.payee &&
          program.payee.toLowerCase() === filters.payee.toLowerCase()
      );
    }

    // Filter by search term
    result = result.filter((program) =>
      program.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredPrograms(result);
  }, [programs, filters, searchTerm]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // =============================
  // ===     Event Handlers   ===
  // =============================
  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
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

  // =============================
  // ===       RENDERING      ===
  // =============================
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

        {/* Input with Search Icon on the right */}
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
            {filteredPrograms.map((program) => (
              <Tr
                key={program.id}
                onClick={() => handleRowClick(program.id)}
                cursor="pointer"
              >
                <Td>{program.name}</Td>
                <Td>{renderStatusIcon(program.status)}</Td>
                <Td>{program.upcomingDate}</Td>
                <Td>{program.upcomingTime}</Td>
                <Td>{program.room}</Td>
                <Td>{program.instructor}</Td>
                <Td>{program.payee}</Td>
                {/* Actions menu */}
                <Td onClick={(e) => e.stopPropagation()}>
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      aria-label="Options"
                      icon={<ActionsIcon />} // was ThreeDotsIcon
                      variant="outline"
                    />
                    <MenuList>
                      <MenuItem onClick={(e) => handleEdit(program.id, e)}>
                        <EditIcon style={{ marginRight: "6px" }} />
                        Edit
                      </MenuItem>
                      <MenuItem
                        onClick={(e) => handleDeleteClick(program.id, e)}
                      >
                        <CancelIcon style={{ marginRight: "6px" }} />
                        Delete
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
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
      />
    </>
  );
};
