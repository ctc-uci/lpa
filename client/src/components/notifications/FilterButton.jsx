import { useEffect, useState } from "react";
import {
  Button,
  HStack,
  Popover,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Text,
  useToast,
} from "@chakra-ui/react";

import { CalendarIcon } from "./CalendarIcon";
import styles from "./FilterButton.module.css";
import { FilterIcon } from "./FilterIcon";

export const FilterButton = ({ setFilterType, currentFilter }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const toast = useToast();
  const [type, setType] = useState("all");

  // Watch for changes in both dates
  useEffect(() => {
    console.log(startDate, endDate);
    if (startDate.substring(0,1) === "2" && endDate.substring(0,1) === "2") { // checking if the date is filled out completely
      const start = new Date(startDate);
      const end = new Date(endDate);

      console.log(start, end);
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

      // Update filter with new dates
      setFilterType(prev => ({
        ...prev,
        type: type,
        startDate: startDate, // The date input already returns YYYY-MM-DD format
        endDate: endDate
      }));
    }
  }, [startDate, endDate, type, toast]);

  const handleFilterSelect = (type) => {
    setType(type);
    setFilterType(prev => ({
      ...prev,
      type,
    }));
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
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={styles.dateInput}
            />
            <Text className={styles.toText}>to</Text>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={styles.dateInput}
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