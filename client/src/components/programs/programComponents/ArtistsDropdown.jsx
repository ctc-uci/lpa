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
      if (!event.target.closest("#instructorContainer")) {
          setDropdownVisible(false);
      }
    }

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    }
  }, []);

  return (
    <HStack>
      <Box as="img" src={BsPaletteFill} boxSize="20px" />
      <div id="instructorContainer">
        <div id="instructors">
          <div id="instructorSelection">
            <Box>
              <div id="instructorInputContainer">
                <Input
                    placeholder="Lead Artist(s)"
                    onChange={(e) => {
                      getInstructorResults(e.target.value);
                      setInstructorSearchTerm(e.target.value);
                      setDropdownVisible(true);
                    }}
                    value={instructorSearchTerm} id="instructorInput"/>
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
                        setInstructorSearchTerm("");
                        setSearchedInstructors([]);
                        getInstructorResults(")")
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
                          setInstructorSearchTerm(instructor.name); // Populate input field
                          setDropdownVisible(false);
                          // const alreadySelected = selectedInstructors.find(
                          //   (instr) => instr.id.toString() === instructor.id
                          // );
                          // console.log("ran");
                          // if (!alreadySelected) {
                          //   console.log("ran here");
                          //   setSelectedInstructors((prevItems) => [...prevItems, instructor]);
                          //   setInstructorSearchTerm(""); // Clears input
                          //   setSearchedInstructors([]); // Closes dropdown
                          // }
                          // if (instructor && !alreadySelected) {
                          //   setSelectedInstructors((prevItems) => [...prevItems, instructor]);
                          //   const filteredInstructors = searchedInstructors.filter(
                          //     (instr) => instructor.id !== instr.id.toString()
                          //   );
                          //   setSearchedInstructors(filteredInstructors);
                          // }
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
