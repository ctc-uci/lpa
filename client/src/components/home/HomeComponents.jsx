import React, { useCallback, useEffect, useRef, useState } from "react";

import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Box,
  Flex,
  HStack,
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
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
  VStack
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
import StatusTooltip from "./StatusIcon";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { ProgramFiltersModal } from "./ProgramFiltersModal";


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
        id: program.id,
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
      {/* The table */}
      <Box w="90%" mx="auto" mt="10" alignItems="center" justifyContent="center" border="1px solid" borderRadius="20px" borderColor="gray.300" >
          <Flex maxW="100%" mt="10" mx="auto" align="center" gap="35%">
            <Button
              leftIcon={<FiltersIcon />}
              onClick={() => setIsFiltersModalOpen(true)}
              ml="4"
            >
              Filters
            </Button>
            <InputGroup maxW="500px" flexGrow={1}>
              <Input 
                w="500px"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <InputRightElement pointerEvents="none">
                <SearchIcon />
              </InputRightElement>
            </InputGroup>
          </Flex>
        <TableContainer maxW="100%" mx="auto" p="4" >
          <Table variant="simple" size="sm" mt="5" sx={{ borderSpacing: "0 10px", borderCollapse: "separate" }}>
            <Thead>
              <Tr>
                {/* Program Name with icon to the RIGHT */}
                <Th>
                  <HStack spacing={2} alignItems="center">
                    <Text fontSize="sm" fontWeight="medium">Program</Text>
                    <VStack>
                      <Box as="img" src={programSvg} alt="Program Icon" boxSize="10px" />
                      <Box as="img" src={programSvg} alt="Program Icon" boxSize="10px" mt={-2} transform="rotate(180deg)"/>
                    </VStack>
                  </HStack>
                </Th>
                <Th><StatusTooltip/></Th>
                {/* Upcoming Date with icon to the LEFT */}
                <Th>
                  <HStack spacing={2} alignItems="center">
                    <CalendarIcon/>
                    <Text>Upcoming Date</Text>
                    <VStack alignItems="center">
                      <Box as="img" src={programSvg} alt="Program Icon" boxSize="10px" />
                      <Box as="img" src={programSvg} alt="Program Icon" boxSize="10px" mt={-2} transform="rotate(180deg)"/>
                    </VStack>
                  </HStack>
                </Th>
                {/* Upcoming Time with icon to the LEFT */}
                <Th>
                  <HStack>
                    <ClockIcon/>
                    <Text>Upcoming Time</Text>
                  </HStack>
                </Th>
                {/* Room with icon to the LEFT */}
                <Th>
                  <HStack>
                    <LocationIcon/>
                    <Text ml={-1}>Room</Text>
                  </HStack>
                </Th>
                {/* Instructor with icon to the LEFT */}
                <Th>
                  <HStack>
                    <PersonIcon/>
                    <Text>Instructor</Text>
                  </HStack>
                </Th>
                {/* Payee with icon to the LEFT */}
                <Th>
                  <HStack>
                    <PersonIcon/>
                    <Text>Payee</Text>
                  </HStack>
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
                  <Tr 
                    key={program.id} 
                    onClick={() => handleRowClick(program.id)} 
                    cursor="pointer"
                    sx={{ _odd: { bg: "gray.100" }}} 
                  >
                    <Td borderLeftRadius="12px">{program.name}</Td>
                    <Td>{renderStatusIcon(program.status)}</Td>
                    <Td>{program.upcomingDate}</Td>
                    <Td>{program.upcomingTime}</Td>
                    <Td>{program.room}</Td>
                    <Td>{program.instructor}</Td>
                    <Td>{program.payee}</Td>
                    <Td borderRightRadius="12px" onClick={(e) => e.stopPropagation()}>
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          aria-label="Options"
                          icon={<ActionsIcon />} 
                          variant="ghost"
                          bg="transparent"
                          _hover={{ bg: "purple.100" }}
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
      </Box>

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
