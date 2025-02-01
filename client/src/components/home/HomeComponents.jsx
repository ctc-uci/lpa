// notes::
// idk if we ned to remove a program if theres no upcoming bookings
// also if there's multiple instructors this only does 1 unfortunately
// also do fuzzy search on name or nah?

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

import { FiFilter, FiMoreVertical } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { ProgramFiltersModal } from "./ProgramFiltersModal";
import { StatusKey } from './StatusIcons';
import {
  FiltersIcon,
  ThreeDotsIcon,
  EditIcon,
  CancelIcon,
  SearchIcon,
  PastStatusIcon,
  ActiveStatusIcon
} from "./TableIcons";

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
          ? roomsData.find((room) => room.id === relevantBooking.roomId)
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
          status: status,
          upcomingDate: relevantBooking
            ? formatDate(relevantBooking.date)
            : "No bookings",
          upcomingTime: relevantBooking
            ? `${formatTime(relevantBooking.startTime)} - ${formatTime(relevantBooking.endTime)}`
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
      console.log("Filtering by room:", filters.room);
      result = result.filter((program) => {
        console.log(`Program ${program.id} room:`, program.room);
        return program.room === filters.room;
      });
      console.log("Filtered programs by room:", result);
    }

    if (filters.instructor && filters.instructor !== "all") {
      console.log("Filtering by instructor:", filters.instructor);
      result = result.filter((program) => {
        console.log(`Program ${program.id} instructor:`, program.instructor);
        return (
          program.instructor &&
          program.instructor.toLowerCase() === filters.instructor.toLowerCase()
        );
      });
      console.log("Filtered programs by instructor:", result);
    }

    if (filters.payee && filters.payee !== "all") {
      console.log("Filtering by payee:", filters.payee);
      result = result.filter((program) => {
        console.log(`Program ${program.id} payee:`, program.payee);
        return (
          program.payee &&
          program.payee.toLowerCase() === filters.payee.toLowerCase()
        );
      });
      console.log("Filtered programs by payee:", result);
    }

    result = result.filter((program) =>
      program.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredPrograms(result);
  }, [programs, filters, searchTerm]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

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
          setPrograms(
            programs.filter((program) => program.id !== programToDelete)
          );
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
    switch (status.toLowerCase()) {
      case 'active':
        return <ActiveStatusIcon />;
      case 'past':
        return <PastStatusIcon />;
      default:
        return null;
    }
  };

  // Filter programs by search term with the includes method
  // const filteredPrograms = programs.filter(program =>
  //   program.name.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  return (
    <>
      <div>
        <Button leftIcon={<FiltersIcon />} onClick={() => setIsFiltersModalOpen(true)}>
          Filters
        </Button>
        <Input
          placeholder="Search programs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <StatusKey />
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Program Name</Th>
              <Th>Status</Th>
              <Th>Upcoming Date</Th>
              <Th>Upcoming Time</Th>
              <Th>Room</Th>
              <Th>Instructor</Th>
              <Th>Payee</Th>
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
                <Td>
                  {renderStatusIcon(program.status)}
                </Td>
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
                      icon={<ThreeDotsIcon />} // <== using your custom 3-dots
                      variant="outline"
                    />
                    <MenuList>
                      <MenuItem onClick={(e) => handleEdit(program.id, e)}>
                        Edit
                      </MenuItem>
                      <MenuItem
                        onClick={(e) => handleDeleteClick(program.id, e)}
                      >
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
              Are you sure? You can't undo this action afterwards.
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
      <ProgramFiltersModal
        isOpen={isFiltersModalOpen}
        onClose={() => setIsFiltersModalOpen(false)}
        onApplyFilters={handleApplyFilters}
      />
    </>
  );
};

// What We Need From Tables

// Assignment (client_id, role), Events (id, name, archived), Bookings (date, start_time, end_time, room_id), Rooms (name), Client (name)
