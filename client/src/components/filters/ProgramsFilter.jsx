import { React, useState, useEffect } from "react";
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
import { ProgramStatusFilter } from "./FilterComponents";

export const ProgramFilter = ({ programs, roomsList, setFilteredPrograms }) => {
    // const [programs, setPrograms] = useState([]); // TO contain original program data
    // const [filteredPrograms, setFilteredPrograms] = useState([]); // To contain filteredPrograms (will be displayed if filters applied
    
    const [filters, setFilters] = useState({
      status: "all",
      days: [],
      // dateRange: { start: "", end: "" },
      // timeRange: { start: "", end: "" },
      startTime: null,
      endTime: null,
      startDate: null,
      endDate: null,
      rooms: "all",
      leadArtists: [],
      payers: [],
    });

    const updateFilter = (type, value) => {
      setFilters((prev) => ({ ...prev, [type]: value }));
    };

    // Apply the filters to the programs page
    const applyFilters = () => {
      let filtered = programs;

      // Update based on status filter
      if (filters.status !== "all") {
        filtered = filtered.filter(program => program.status === filters.status);
      }
      if (filters.rooms !== "all"){
        filtered = filtered.filter(program => program.rooms === filters.rooms);
      }

      setFilteredPrograms(filtered);
    };

    const resetFilter = (type, value) => {
      setFilters({
        status: "all",
        days: [],
        dateRange: { start: "", end: "" },
        timeRange: { start: "", end: "" },
        room: "all",
        leadArtists: [],
        payers: [],
      });
      setFilteredPrograms(programs);
    }

    useEffect(() => {
      applyFilters();
    }, [filters, programs]);

    return (
      <FilterContainer
        onApply={applyFilters}
        onReset={resetFilter}
        pageName="Program"
      >
        <ProgramStatusFilter
          value={filters.status}
          onChange={(value) => updateFilter('status', value)}
        />
      </ FilterContainer>
    );
};
