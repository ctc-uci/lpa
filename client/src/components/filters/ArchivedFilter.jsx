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

export const ArchivedFilter = ({ sessions, filtered }) => {
    // const [programs, setPrograms] = useState([]); // TO contain original program data
    // const [filteredPrograms, setFilteredPrograms] = useState([]); // To contain filteredPrograms (will be displayed if filters applied

    const [filters, setFilters] = useState({
      days: [],
      startTime: null,
      endTime: null,
      startDate: null,
      endDate: null,
      room: "all",
      leadArtists: [],
      payers: [],
    });

    const updateFilter = (type, value) => {
      setFilters((prev) => ({ ...prev, [type]: value }));
    };

    // Apply the filters to the programs page
    const applyFilters = () => {
      let filtered = programs;


    };

    const resetFilter = (type, value) => {
      setFilters({
        days: [],
        dateRange: { start: "", end: "" },
        timeRange: { start: "", end: "" },
        room: "all",
        leadArtists: [],
        payers: [],
      });
      onReset?.();
    }

    return (
      <FilterContainer
        onApply={applyFilters}
        onReset={resetFilter}
      >
        <ProgramStatusFilter
          value={filters.status}
          onChange={(value) => updateFilter('status', value)}
        />
      </ FilterContainer>
    );
};
