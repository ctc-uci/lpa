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

export const ProgramFilter = ({ onApply, onReset }) => {
    const [filters, setFilters] = useState({
      status: "all",
      days: [],
      dateRange: { start: "", end: "" },
      timeRange: { start: "", end: "" },
      room: "all",
      leadArtists: [],
      payers: [],
    });

    const updateFilter = (type, value) => {
      setFilters((prev) => ({ ...prev, [type]: value }));
    };

    return (

    );
};
