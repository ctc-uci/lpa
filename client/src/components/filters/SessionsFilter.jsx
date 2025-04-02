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
import { DateFilter, DayFilter, RoomFilter, SessionStatusFilter, TimeFilter } from "./FilterComponents";

export const SessionFilter = ({ sessions, setFilteredSessions, rooms }) => {

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

    // Apply the filters to the sessions page
    const applyFilters = () => {
      console.log("Applying filters:", filters);
      console.log("Original sessions:", sessions);
      let filtered = sessions;

      // Update based on status filter
      if (filters.status !== "all") {
        const now = new Date().toISOString();
        filtered = filtered.filter(session => {
          switch (filters.status) {
            case "active":
              return session.date > now;
            case "past":
              return session.date <= now && !session.archived;
            case "archived":
              return session.archived;
            default:
              return true;
          }
        });
      }
      console.log("filtered:", filtered);
      console.log("roomsList", rooms);

      if (filters.room !== "all") {
        filtered = filtered.filter(session => rooms.get(session.roomId) === filters.room);
      }

      // Day
      if (filters.days.length > 0) {
        filtered = filtered.filter(session => {
          const sessionDate = new Date(session.date);
          const day = sessionDate.toLocaleString('en-US', { weekday: 'short' });
          return filters.days.includes(day);
        });
      }

      // Time
      if (filters.startTime) {
        filtered = filtered.filter(session => session.startTime >= filters.startTime);
      }

      if (filters.endTime) {
        filtered = filtered.filter(session => session.endTime <= filters.endTime);
      }

      // Date
      if (filters.startDate) {
        filtered = filtered.filter(session => session.date >= filters.startDate);
      }

      if (filters.endDate) {
        filtered = filtered.filter(session => session.date <= filters.endDate);
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
        <SessionStatusFilter
          value={filters.status}
          onChange={updateFilter}
        />
        <DayFilter
          value={filters.days}
          onChange={updateFilter}/>
        <DateFilter
          startDate={filters.startDate}
          endDate={filters.endDate}
          onChange={updateFilter}/>
        <TimeFilter
          startTime={filters.startTime}
          endTime={filters.endTime}
          onChange={updateFilter}/>
        <RoomFilter
          roomMap={rooms}
          onChange={updateFilter}
          room={filters.room}/>
      </ FilterContainer>
    );
};

