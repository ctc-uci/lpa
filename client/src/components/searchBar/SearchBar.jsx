import "./SearchBar.css";

import {
  Icon,
} from "@chakra-ui/react";

import {
  archiveMagnifyingGlass,
} from "../../assets/icons/ProgramIcons";

export const SearchBar = ({ handleSearch, searchQuery }) => {
  return (
    <div className="search-wrapper">
      <input
        type="text"
        placeholder="Search..."
        value={searchQuery || ""}
        onChange={(e) => handleSearch(e.target.value)}
        className="search-input"
      />
      <div 
        className="search-icon-container" 
        onClick={() => handleSearch(searchQuery)}
      >
        <Icon as={archiveMagnifyingGlass} />
      </div>
    </div>
  );
};
