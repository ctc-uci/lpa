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
  const toast = useToast();
  const [type, setType] = useState("all");

  const handleFilterSelect = (type) => {
    setType(type);
    setFilterType((prev) => ({
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
          flexShrink={0}
          borderRadius={6}
          background="#F0F1F4"
          color="#2D3748"
          fontFamily="Inter, sans-serif"
          fontSize="15px"
          fontStyle="bold"
          fontWeight={650}
          lineHeight="normal"
        >
          Filters
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className={styles.modalContent}
        boxShadow="0px 4px 6px -1px rgba(0, 0, 0, 0.1)"
        border="1px solid #E2E2E2"
        w={"auto"}
      >
        <PopoverCloseButton />
        <PopoverBody className={styles.modalBody}>
          <Text className={styles.typeHeader}>Type</Text>

          <div className={styles.filterButtonGroup}>
            <Button
              onClick={() => handleFilterSelect("all")}
              className={`${styles.filterButton} ${currentFilter.type === "all" ? styles.active : ""}`}
            >
              All
            </Button>
            <Button
              onClick={() => handleFilterSelect("highpriority")}
              className={`${styles.filterButton} ${currentFilter.type === "highpriority" ? styles.active : ""}`}
            >
              High Priority
            </Button>
            <Button
              onClick={() => handleFilterSelect("overdue")}
              className={`${styles.filterButton} ${currentFilter.type === "overdue" ? styles.active : ""}`}
            >
              Past Due
            </Button>
            <Button
              onClick={() => handleFilterSelect("neardue")}
              className={`${styles.filterButton} ${currentFilter.type === "neardue" ? styles.active : ""}`}
            >
              Email Not Sent
            </Button>
          </div>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
