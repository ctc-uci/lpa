import { useState } from "react";

import {
  Button,
  Popover,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Text,
} from "@chakra-ui/react";

import styles from "./FilterButton.module.css";
import { FilterIcon } from "./FilterIcon";

export const FilterButton = ({ setFilterType, currentFilter }) => {
  const [type, setType] = useState("all");

  const handleFilterSelect = (type) => {
    setType(type);
    setFilterType((prev) => ({
      ...prev,
      type,
    }));
  };

  const FilterButtonIcon = () => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M2.66667 8.66699C3.03486 8.66699 3.33333 8.96547 3.33333 9.33366V14.0003C3.33333 14.3685 3.03486 14.667 2.66667 14.667C2.29848 14.667 2 14.3685 2 14.0003V9.33366C2 8.96547 2.29848 8.66699 2.66667 8.66699Z"
          fill="#2D3748"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M2.66667 1.33301C3.03486 1.33301 3.33333 1.63148 3.33333 1.99967V6.66634C3.33333 7.03453 3.03486 7.33301 2.66667 7.33301C2.29848 7.33301 2 7.03453 2 6.66634V1.99967C2 1.63148 2.29848 1.33301 2.66667 1.33301Z"
          fill="#2D3748"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M7.99967 7.33301C8.36786 7.33301 8.66634 7.63148 8.66634 7.99967V13.9997C8.66634 14.3679 8.36786 14.6663 7.99967 14.6663C7.63148 14.6663 7.33301 14.3679 7.33301 13.9997V7.99967C7.33301 7.63148 7.63148 7.33301 7.99967 7.33301Z"
          fill="#2D3748"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M7.99967 1.33301C8.36786 1.33301 8.66634 1.63148 8.66634 1.99967V5.33301C8.66634 5.7012 8.36786 5.99967 7.99967 5.99967C7.63148 5.99967 7.33301 5.7012 7.33301 5.33301V1.99967C7.33301 1.63148 7.63148 1.33301 7.99967 1.33301Z"
          fill="#2D3748"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M13.3337 10C13.7018 10 14.0003 10.2985 14.0003 10.6667V14C14.0003 14.3682 13.7018 14.6667 13.3337 14.6667C12.9655 14.6667 12.667 14.3682 12.667 14V10.6667C12.667 10.2985 12.9655 10 13.3337 10Z"
          fill="#2D3748"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M13.3337 1.33301C13.7018 1.33301 14.0003 1.63148 14.0003 1.99967V7.99967C14.0003 8.36786 13.7018 8.66634 13.3337 8.66634C12.9655 8.66634 12.667 8.36786 12.667 7.99967V1.99967C12.667 1.63148 12.9655 1.33301 13.3337 1.33301Z"
          fill="#2D3748"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M0 9.33366C0 8.96547 0.298477 8.66699 0.666667 8.66699H4.66667C5.03486 8.66699 5.33333 8.96547 5.33333 9.33366C5.33333 9.70185 5.03486 10.0003 4.66667 10.0003H0.666667C0.298477 10.0003 0 9.70185 0 9.33366Z"
          fill="#2D3748"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M5.33301 5.33366C5.33301 4.96547 5.63148 4.66699 5.99967 4.66699H9.99967C10.3679 4.66699 10.6663 4.96547 10.6663 5.33366C10.6663 5.70185 10.3679 6.00033 9.99967 6.00033H5.99967C5.63148 6.00033 5.33301 5.70185 5.33301 5.33366Z"
          fill="#2D3748"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M10.667 10.6667C10.667 10.2985 10.9655 10 11.3337 10H15.3337C15.7018 10 16.0003 10.2985 16.0003 10.6667C16.0003 11.0349 15.7018 11.3333 15.3337 11.3333H11.3337C10.9655 11.3333 10.667 11.0349 10.667 10.6667Z"
          fill="#2D3748"
        />
      </svg>
    );
  };

  return (
    <Popover placement="bottom-end">
      <PopoverTrigger>
        <Button
          leftIcon={<FilterButtonIcon />}
          display="flex"
          height="40px"
          padding="0px 16px"
          justifyContent="center"
          alignItems="center"
          gap="4px"
          borderRadius="6px"
          border="1px solid #E2E2E2"
          background="#F0F1F4"
          color="#2D3748"
          fontFamily="Inter, sans-serif"
          fontSize="15px"
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
              Both
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
