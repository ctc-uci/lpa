import { React } from "react";

import "./Sorting.css";
import SortingMenu from "./SortingMenu";

const ProgramSortingModal = ({ onSortChange }) => {
  const programSortOptions = [
    { label: "A ‑ Z", value: "title", order: "asc" },
    { label: "Z - A", value: "title", order: "desc" },
  ];

  return (
    <SortingMenu 
      options={programSortOptions}
      onSortChange={onSortChange}
    />
  );
};

export default ProgramSortingModal;
