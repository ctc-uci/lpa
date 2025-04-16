import { React, useState, useEffect } from 'react';

import {
    Box,
    VStack,
    FormLabel,
    FormControl,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer
  } from "@chakra-ui/react";

import Navbar from "../navbar/Navbar";

import { SendEmailButton } from "../email/SendEmailButton";
import { DayFilter, DateFilter, TimeFilter, SeasonFilter, EmailFilter, ClientsFilter, RoomFilter, ProgramStatusFilter, InvoiceStatusFilter, SessionStatusFilter } from '../filters/FilterComponents';
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { FilterContainer } from '../filters/FilterContainer';
import { Filter } from 'lucide-react';
import {ProgramFilter} from '../filters/ProgramsFilter';
import { SessionFilter } from '../filters/SessionsFilter';


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
            searchTerm: search
          }
        });
        filterSelectedPayeesFromSearch(payeeResponse.data);
      }
      else {
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
            searchTerm: search
          }
        });
        filterSelectedInstructorsFromSearch(instructorResponse.data);
      }
      else {
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
    // <Navbar>
    // <VStack
    //   spacing={8}
    //   width={"100%"}
    // >
    //     <SendEmailButton></SendEmailButton>
    // </VStack>
    // </Navbar>
    // <SeasonFilter></SeasonFilter>
    // <EmailFilter></EmailFilter>
    <div>
      <ClientsFilter/>
    </div>
  );
};
