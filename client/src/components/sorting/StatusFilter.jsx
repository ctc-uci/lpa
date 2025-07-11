import React from "react";

import "./Sorting.css";
import SortingMenu from "./SortingMenu";

const StatusSortingModal = ({ onSortChange }) => {
  const statusSortingOptions = [
    { label: "Most - Least Urgent", value: "status", order: "desc" },
    { label: "Least - Most Urgent", value: "status", order: "asc" },
  ];

  return (
    <SortingMenu 
      options={statusSortingOptions}
      onSortChange={onSortChange}
    />
  );
};

export default StatusSortingModal;