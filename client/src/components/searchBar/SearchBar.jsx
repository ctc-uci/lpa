import "./SearchBar.css";

import {
  Button,
  Flex,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";

import {
  archiveMagnifyingGlass,
} from "../../assets/icons/ProgramIcons";

export const SearchBar = ({ handleSearch, searchQuery }) => {
  return (
    <Flex className="search-wrapper">
      <InputGroup
          size="md"
          variant="outline"
          type="text"
          className="searchbar-container"
      >
          <Input
              placeholder="Search..."
              onChange={(e) => handleSearch(e.target.value)}
              className="searchbar-input"
              _focusVisible={{
                border: "none",
              }}
          />
          <InputRightElement className="searchbar-right-element">
              <Button
                  className="searchbar-icon-container"
                  size="sm"
                  onClick={() => handleSearch(searchQuery)}
              >
                  <Icon as={archiveMagnifyingGlass} />
              </Button>
          </InputRightElement>
      </InputGroup>
    </Flex>
  );
};
