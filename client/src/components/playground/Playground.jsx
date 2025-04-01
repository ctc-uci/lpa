import { React, useState, useEffect } from 'react';

import {
    VStack,
    FormLabel,
    FormControl,

  } from "@chakra-ui/react";

import Navbar from "../navbar/Navbar";

import { SendEmailButton } from "../email/SendEmailButton";
import { DayFilter, DateFilter, TimeFilter, SeasonFilter, EmailFilter, LeadArtistFilter, RoomFilter, PayerFilter, ProgramStatusFilter } from '../filters/FilterComponents';
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { FilterContainer } from '../filters/FilterContainer';
import { Filter } from 'lucide-react';


export const Playground = () => {
  const [instructorSearchTerm, setInstructorSearchTerm] = useState("");
  const [searchedInstructors, setSearchedInstructors] = useState([]);
  const [selectedInstructors, setSelectedInstructors] = useState([]);
  const [payeeSearchTerm, setPayeeSearchTerm] = useState("");
  const [searchedPayees, setSearchedPayees] = useState([]);
  const [selectedPayees, setSelectedPayees] = useState([]);



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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const roomsResponse = await backend.get("/rooms");
        setRooms(roomsResponse.data);

        const clientsResponse = await backend.get("/clients");
        setClients(clientsResponse.data);
      } catch (error) {
        console.error("Failed to fetch filter data:", error);
      }
    };

    fetchData();
  }, [backend]);
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
      {/* <RoomFilter room={room}></RoomFilter>
      <LeadArtistFilter
      instructorSearchTerm={instructorSearchTerm}
        searchedInstructors={searchedInstructors}
        selectedInstructors={selectedInstructors}
        setSelectedInstructors={setSelectedInstructors}
        setSearchedInstructors={setSearchedInstructors}
        getInstructorResults={getInstructorResults}
        setInstructorSearchTerm={setInstructorSearchTerm}
      ></LeadArtistFilter>
      <PayersFilter
        payeeSearchTerm={payeeSearchTerm}
        searchedPayees={searchedPayees}
        selectedPayees={selectedPayees}
        getPayeeResults={getPayeeResults}
        setPayeeSearchTerm={setPayeeSearchTerm}
        setSelectedPayees={setSelectedPayees}
        setSearchedPayees={setSearchedPayees}
      /> */}
      <FilterContainer pageName={"Program"}>
        <ProgramStatusFilter/>
        <DayFilter/>
        <DateFilter/>
        <TimeFilter/>
        {/* Pass in rooms list */}
        <RoomFilter/>
        <LeadArtistFilter
          instructorSearchTerm={instructorSearchTerm}
          searchedInstructors={searchedInstructors}
          selectedInstructors={selectedInstructors}
          setSelectedInstructors={setSelectedInstructors}
          setSearchedInstructors={setSearchedInstructors}
          getInstructorResults={getInstructorResults}
          setInstructorSearchTerm={setInstructorSearchTerm}
        />
        <PayerFilter
          payeeSearchTerm={payeeSearchTerm}
          searchedPayees={searchedPayees}
          selectedPayees={selectedPayees}
          getPayeeResults={getPayeeResults}
          setPayeeSearchTerm={setPayeeSearchTerm}
          setSelectedPayees={setSelectedPayees}
          setSearchedPayees={setSearchedPayees}
        />
      </FilterContainer>
    </div>
  );
};
