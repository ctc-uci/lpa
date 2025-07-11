import { React, useEffect, useState } from "react";

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react";

import { Filter } from "lucide-react";

import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { createEvent, isSignedIn } from "../../utils/calendar";
import CalendarSelector from "../calendar/CalendarSelector";
import GcalPrompt from "../calendar/GcalPrompt";
import { Test } from "../calendar/Test";
import { AddClient } from "../clientsearch/AddClient";
import { SendEmailButton } from "../email/SendEmailButton";
import {
  ClientsFilter,
  DateFilter,
  DayFilter,
  EmailFilter,
  InvoiceStatusFilter,
  ProgramStatusFilter,
  RoomFilter,
  SeasonFilter,
  SessionStatusFilter,
  TimeFilter,
} from "../filters/FilterComponents";
import { FilterContainer } from "../filters/FilterContainer";
import { ProgramFilter } from "../filters/ProgramsFilter";
import { SessionFilter } from "../filters/SessionsFilter";
import { PDFButtonInvoice } from "../invoices/PDFButtonInvoice";
import Navbar from "../navbar/Navbar";

export const Playground = () => {
  const [instructorSearchTerm, setInstructorSearchTerm] = useState("");
  const [searchedInstructors, setSearchedInstructors] = useState([]);
  const [selectedInstructors, setSelectedInstructors] = useState([]);
  const [payeeSearchTerm, setPayeeSearchTerm] = useState("");
  const [searchedPayees, setSearchedPayees] = useState([]);
  const [selectedPayees, setSelectedPayees] = useState([]);
  const [programs, setPrograms] = useState([]);
  // const [filtered, setFiltered] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showGcalPrompt, setShowGcalPrompt] = useState(false);
  const [room, setRoom] = useState("all");
  const { backend } = useBackendContext();

  useEffect(() => {
    getInstructorResults(instructorSearchTerm);
  }, [selectedInstructors, instructorSearchTerm]);

  useEffect(() => {
    getPayeeResults(payeeSearchTerm);
  }, [selectedPayees, payeeSearchTerm]);

  const getPayeeResults = async (search) => {
    try {
      if (search !== "") {
        const payeeResponse = await backend.get("/clients/search", {
          params: {
            searchTerm: search,
            columns: ["name"],
          },
        });
        filterSelectedPayeesFromSearch(payeeResponse.data);
      } else {
        setSearchedPayees([]);
      }
    } catch (error) {
      console.error("Error getting instructors:", error);
    }
  };

  const getInstructorResults = async (search) => {
    try {
      if (search !== "") {
        const instructorResponse = await backend.get("/clients/search", {
          params: {
            searchTerm: search,
            columns: ["name"],
          },
        });
        filterSelectedInstructorsFromSearch(instructorResponse.data);
      } else {
        setSearchedInstructors([]);
      }
    } catch (error) {
      console.error("Error getting instructors:", error);
    }
  };

  const getAllSessions = async () => {
    try {
      const sessionsResponse = await backend.get(`/bookings/byEvent/213`);
      const sessionsData = sessionsResponse.data;
      setSessions(sessionsData); // programData should have what Events table in DB model contains
      // setIsArchived(programData[0].archived);
      // console.log(sessionsData);
    } catch {
      console.log("From getAllSessions: ", error);
    }
  };

  useEffect(() => {
    getAllSessions();
  });

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const roomsResponse = await backend.get("/rooms");
  //       setRooms(roomsResponse.data);

  //       const clientsResponse = await backend.get("/clients");
  //       setClients(clientsResponse.data);
  //     } catch (error) {
  //       console.error("Failed to fetch filter data:", error);
  //     }
  //   };

  //   fetchData();
  // }, [backend]);

  return (
    <Navbar>
      <VStack
        spacing={8}
        width={"100%"}
      >
        <Button onClick={() => setShowGcalPrompt(true)}>
          Sign in to Google Calendar
        </Button>
        {isSignedIn() ? <Text>Signed in</Text> : <Text>Not signed in</Text>}
        <CalendarSelector />
        <Button
          onClick={() => {
            const event = {
              backendId: 1,
              name: "Test Event",
              start: new Date().toISOString(),
              end: new Date(
                new Date().getTime() + 1000 * 60 * 60 * 2
              ).toISOString(),
              location: "Test Location",
              description: "Test Description",
              roomId: 1,
            };
            console.log(event);
            createEvent(event);
          }}
        >
          Add Test Event
        </Button>
        <Test />
        <Button onClick={() => setShowAddClient(true)}>Add Client</Button>
        <AddClient
          isOpen={showAddClient}
          onClose={() => setShowAddClient(false)}
          type="Payer"
        />
      </VStack>
      <GcalPrompt
        isOpen={showGcalPrompt}
        onClose={() => setShowGcalPrompt(false)}
      />
      <PDFButtonInvoice />
    </Navbar>
  );
};
