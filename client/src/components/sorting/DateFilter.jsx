import React from "react";

import "./Sorting.css";
import SortingMenu from "./SortingMenu";

const DateSortingModal = ({ onSortChange }) => {
  const dateSortOptions = [
    { label: "Soonest - Latest", value: "date", order: "asc" },
    { label: "Latest - Soonest", value: "date", order: "desc" },
  ];

  return (
    <SortingMenu 
      options={dateSortOptions}
      onSortChange={onSortChange}
    />
  );
};

export default DateSortingModal;
