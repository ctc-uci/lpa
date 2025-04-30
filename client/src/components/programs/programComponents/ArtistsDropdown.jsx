import { useState, useEffect } from 'react'
import {
  Box,
  HStack,
  Icon,
  Input,
  Tag,
} from "@chakra-ui/react"

import {CloseFilledIcon} from '../../../assets/CloseFilledIcon';
import {PlusFilledIcon} from '../../../assets/PlusFilledIcon';
import BsPaletteFill from "../../../assets/icons/BsPaletteFill.svg";

export const ArtistsDropdown = ( {instructorSearchTerm, searchedInstructors, selectedInstructors, setSelectedInstructors, setSearchedInstructors, getInstructorResults, setInstructorSearchTerm} ) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest("#instructorContainer") && !event.target.closest(".instructorTag")) {
        console.log("classlist: ", event.target.classList);
        setDropdownVisible(false);
      }
    }

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    }
  }, []);

  const search = (searchTerm) => {
    setInstructorSearchTerm(searchTerm);
    getInstructorResults(searchTerm);
    setDropdownVisible(true);
  };

  useEffect(() => {
    search(instructorSearchTerm);
  }, [selectedInstructors, instructorSearchTerm]);

  return (
    <HStack gap="12px">
      <Box as="img" src={BsPaletteFill} boxSize="20px" />
      <div id="instructorContainer" >
        <div id="instructors" className="inputElement">
          <div id="instructorSelection">
            <Box>
              <div id="instructorInputContainer">
                <Input
                  autoComplete="off"
                    placeholder="Lead Artist(s)"
                    _placeholder={{ color: '#CBD5E0' }}
                    onChange={(e) => {
                      search(e.target.value);
                    }}
                    onClick={(e) => {
                      search(e.target.value);
                    }}
                    value={instructorSearchTerm} id="instructorInput"
                    autocomplete="off"
                    />
                  <Box
                    as="button"
                    onClick={() => {
                      if (instructorSearchTerm.trim() !== "") {
                        // Find the instructor from the searched list
                        const instructor = searchedInstructors.find(
                          (instr) => instr.name.toLowerCase() === instructorSearchTerm.toLowerCase()
                        );
                        // If instructor exists and is not already selected, add it as a tag
                        if (instructor && !selectedInstructors.some(instr => instr.id === instructor.id)) {
                          setSelectedInstructors((prevItems) => [...prevItems, instructor]);
                        }
                      }
                    }}
                    disabled={
                      instructorSearchTerm.trim() === "" ||
                      !searchedInstructors.some(instr => instr.name.toLowerCase() === instructorSearchTerm.toLowerCase())
                    }
                    cursor={
                      instructorSearchTerm.trim()==="" ||
                      !searchedInstructors.some(instr => instr.name.toLowerCase() === instructorSearchTerm.toLowerCase())
                      ? "not-allowed" : "pointer"
                    }
                  >
                    <PlusFilledIcon
                      color={
                        instructorSearchTerm.trim() !== "" &&
                          searchedInstructors.some(instr => instr.name.toLowerCase() === instructorSearchTerm.toLowerCase())
                          ? "#4441C8" : "#718096"
                      }
                    />
                  </Box>
                </div>

                {dropdownVisible && searchedInstructors.length > 0 && instructorSearchTerm.length > 0 && (
                  <Box id="instructorDropdown" w="100%" maxW="195px">
                    {searchedInstructors.map((instructor) => (
                      <Box
                        key={instructor.id}
                        onClick={() => {
                          const alreadySelected = selectedInstructors.find(
                            (instr) => instr.id.toString() === instructor.id
                          );
                          if (instructor && !alreadySelected) {
                            setSelectedInstructors((prevItems) => [...prevItems, instructor]);
                            const filteredInstructors = searchedInstructors.filter(
                              (instr) => instructor.id !== instr.id.toString()
                            );
                            setSearchedInstructors(filteredInstructors);
                          }
                        }}
                          style={{
                            padding: "10px",
                            fontSize: "16px",
                            cursor: "pointer",
                            transition: "0.2s",
                            backgroundColor:"#FFF",
                          }}
                          bg="#F6F6F6"
                          _hover={{ bg: "#D9D9D9" }}
                        >
                          {instructor.name}
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              </div>
            </div>
            <div id="instructorTags">
              {selectedInstructors.length > 0 ? (
                selectedInstructors.map((instructor, ind) => (
                  <div className="instructorTag" key={ind}>
                    <Tag value={instructor.id}>
                      {instructor.name}
                    </Tag>
                    <Icon
                        fontSize="lg"
                        color = "#718096"
                        _hover={{ color: "#4441C8" }}
                        cursor="pointer"
                        onClick={() => {
                          setSelectedInstructors(prevItems =>
                          prevItems.filter(item => item.id !== instructor.id));
                        }}
                    >
                        <CloseFilledIcon color="currentColor"/>
                    </Icon>
                  </div>
                ))
            ) : <div></div> }
        </div>
      </div>
    </HStack>
  )
}
