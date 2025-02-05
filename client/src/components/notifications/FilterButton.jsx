import {
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverCloseButton,
  HStack,
  Input,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useState } from 'react';
import styles from './FilterButton.module.css';
import { FilterIcon } from "./FilterIcon";
import { CalendarIcon } from "./CalendarIcon";

export const FilterButton = ({ setFilterType, currentFilter }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const toast = useToast();

  const validateDate = (dateString) => {
    // Check if date matches MM/DD/YYYY format
    const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;
    if (!dateRegex.test(dateString)) return false;

    // Convert to Date object and check if valid
    const [month, day, year] = dateString.split('/').map(num => parseInt(num, 10));
    const date = new Date(year, month - 1, day);
    return date.getMonth() === month - 1 && 
           date.getDate() === day && 
           date.getFullYear() === year;
  };

  const formatDateForBackend = (dateString) => {
    if (!dateString) return null;
    const [month, day, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (value, setDate) => {
    // Allow empty input for clearing
    if (!value) {
      setDate('');
      return;
    }

    // Auto-format as user types
    const cleaned = value.replace(/\D/g, '');
    let formatted = cleaned;

    if (cleaned.length >= 4) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
    } else if (cleaned.length >= 2) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }

    setDate(formatted);
  };

  const handleFilterSelect = (type) => {
    // If dates are provided, validate them
    if ((startDate || endDate) && !(startDate && endDate)) {
      toast({
        title: "Date Range Error",
        description: "Please provide both start and end dates",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (startDate && endDate) {
      if (!validateDate(startDate) || !validateDate(endDate)) {
        toast({
          title: "Invalid Date Format",
          description: "Please use MM/DD/YYYY format",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const start = new Date(formatDateForBackend(startDate));
      const end = new Date(formatDateForBackend(endDate));
      
      if (start > end) {
        toast({
          title: "Invalid Date Range",
          description: "Start date must be before end date",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
    }

    setFilterType({
      type,
      startDate: formatDateForBackend(startDate),
      endDate: formatDateForBackend(endDate)
    });
  };

  return (
    <Popover placement="bottom-end">
      <PopoverTrigger>
        <Button
          leftIcon={<FilterIcon />}
          display="inline-flex"
          height="54.795px"
          padding="8px 16px"
          justifyContent="center"
          alignItems="center"
          gap="4px"
          flexShrink={0}
          borderRadius={15}
          border="1px solid var(--medium-light-grey, #D2D2D2)"
          background="var(--white, #FFF)"
          color="var(--medium-grey, #767778)"
          fontFamily="Inter"
          fontSize="16px"
          fontStyle="normal"
          fontWeight={400}
          lineHeight="normal"
        >
          Filters
        </Button>
      </PopoverTrigger>

      <PopoverContent 
        className={styles.modalContent}
        boxShadow="0px 4px 6px -1px rgba(0, 0, 0, 0.1)"
        border="1px solid #E2E2E2"
      >
        <PopoverCloseButton />
        <PopoverBody className={styles.modalBody}>
          <HStack spacing={2} className={styles.dateRangeHeader}>
            <CalendarIcon />
            <Text>Date Range</Text>
          </HStack>

          <div className={styles.dateInputContainer}>
            <Input 
              value={startDate}
              onChange={(e) => handleDateChange(e.target.value, setStartDate)}
              placeholder="MM/DD/YYYY"
              className={styles.dateInput}
              bg="#F6F6F6"
              _placeholder={{ color: '#767778' }}
            />
            <Text className={styles.toText}>to</Text>
            <Input 
              value={endDate}
              onChange={(e) => handleDateChange(e.target.value, setEndDate)}
              placeholder="MM/DD/YYYY"
              className={styles.dateInput}
              bg="#F6F6F6"
              _placeholder={{ color: '#767778' }}
            />
          </div>

          <Text className={styles.typeHeader}>Type</Text>
          
          <div className={styles.filterButtonGroup}>
            <Button
              onClick={() => handleFilterSelect("all")}
              className={`${styles.filterButton} ${currentFilter.type === "all" ? styles.active : ""}`}
            >
              All
            </Button>
            <Button
              onClick={() => handleFilterSelect("overdue")}
              className={`${styles.filterButton} ${currentFilter.type === "overdue" ? styles.active : ""}`}
            >
              Overdue
            </Button>
            <Button
              onClick={() => handleFilterSelect("neardue")}
              className={`${styles.filterButton} ${currentFilter.type === "neardue" ? styles.active : ""}`}
            >
              Near Due
            </Button>
          </div>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};