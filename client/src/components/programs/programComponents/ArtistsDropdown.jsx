import React from 'react'
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
                    }}
                    value={instructorSearchTerm} id="instructorInput"/>
                  <PlusFilledIcon />
                </div>

                {searchedInstructors.length > 0 && (
                  <Box id="instructorDropdown">
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
                    <Icon fontSize="lg" onClick={() => {
                        setSelectedInstructors(prevItems =>
                          prevItems.filter(item => item.id !== instructor.id));
                      }}><CloseFilledIcon /></Icon>
                    <Tag value={instructor.id}>
                      {instructor.name}
                    </Tag>
                  </div>
                ))
            ) : <div></div> }
        </div>
      </div>
    </HStack>
  )
}
