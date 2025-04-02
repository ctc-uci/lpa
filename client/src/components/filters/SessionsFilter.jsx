import React, { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  HStack,
  Input,
  VStack,
  Tag,
  Text,
  IconButton,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { FilterContainer } from "./FilterContainer";
import { DateFilter, SessionStatusFilter, TimeFilter } from "./FilterComponents";

export const SessionFilter = ({ sessions, setFilteredSessions }) => {

    const [filters, setFilters] = useState({
      status: "all",
      days: [],
      startTime: null,
      endTime: null,
      startDate: null,
      endDate: null,
      room: "all",
    });

    const updateFilter = (type, value) => {
      console.log(`Updating filter: ${type} with value:`, value);
      setFilters((prev) => ({ ...prev, [type]: value }));
    };

    // const handleInputChange = (event) => {
    //     const { type, value } = event.target;

    //     setFilters((prev) => ({
    //         ...prev,
    //         [name] : value ? new Date('1970-01-01T${value}') : null
    //     }));
    // };

    // Apply the filters to the sessions page
    const applyFilters = () => {
      console.log("Applying filters:", filters);
      console.log("Original sessions:", sessions);
      let filtered = sessions;

      // Update based on status filter
      if (filters.status !== "all") {
        filtered = filtered.filter(session => session.status === filters.status);
      }

      if (filters.room !== "all") {
        filtered = filtered.filter(session => session.roomId === filters.room);
      }

      // Time
      if (filters.startTime) {
        filtered = filtered.filter(session => session.startTime >= filters.startTime);
      }

      if (filters.endTime) {
        filtered = filtered.filter(session => session.endTime <= filters.endTime);
      }

      if (filters.startDate) {
        filtered = filtered.filter(session => new Date(session.date) >= new Date(filters.startDate));
      }

      if (filters.endDate) {
        filtered = filtered.filter(session => new Date(session.date) <= new Date(filters.endDate));
      }
      setFilteredSessions(filtered);
    };

    const resetFilter = (type, value) => {
      setFilters({
        status: "all",
        days: [],
        startTime: null,
        endTime: null,
        startDate: null,
        endDate: null,
        room: "all",
      });
      setFilteredSessions(sessions);
    }

    return (
      <FilterContainer
        onApply={applyFilters}
        onReset={resetFilter}
        pageName="Session"
      >
        {/* <SessionStatusFilter
          value={filters.status}
          onChange={(value) => updateFilter('status', value)}
        /> */}

        <TimeFilter
          startTime={filters.startTime}
          endTime={filters.endTime}
          onChange={updateFilter}/>
      </ FilterContainer>
    );
};

