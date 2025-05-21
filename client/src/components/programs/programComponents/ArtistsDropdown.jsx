import { useState, useEffect } from 'react'
import {
  Box,
  HStack,
  Icon,
  Input,
  Tag,
} from "@chakra-ui/react";
import { useBackendContext } from "../../../contexts/hooks/useBackendContext";

import {CloseFilledIcon} from '../../../assets/CloseFilledIcon';
import {PlusFilledIcon} from '../../../assets/PlusFilledIcon';
import BsPaletteFill from "../../../assets/icons/BsPaletteFill.svg";
import { AddClient } from '../../clientsearch/AddClient';

export const ArtistsDropdown = ( {instructorSearchTerm, searchedInstructors, selectedInstructors, setSelectedInstructors, setSearchedInstructors, setInstructorSearchTerm} ) => {
  const { backend } = useBackendContext();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [addClientModalOpen, setAddClientModalOpen] = useState(false);

  useEffect(() => {
    getInstructorResults(instructorSearchTerm);
  }, [selectedInstructors, instructorSearchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const container = document.getElementById("instructorContainer");
      const path = event.composedPath && event.composedPath();

      if (container && path && !path.includes(container)) {
        setDropdownVisible(false);
      }
    }

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    }
  }, []);

  const addTag = (instructor) => {
    setSelectedInstructors((prevItems) => [...prevItems, instructor]);
  }

  const searchInstructors = (query) => {
    getInstructorResults(query);
    setInstructorSearchTerm(query);
    setDropdownVisible(true);
  };

  const getInstructorResults = async (search) => {
    try {
      const instructorResponse = await backend.get("/clients/search", {
        params: {
          searchTerm: search,
          columns: ["name"]
        }
      });
      filterSelectedInstructorsFromSearch(instructorResponse.data);
    } catch (error) {
      console.error("Error getting instructors:", error);
    }
  };

  const filterSelectedInstructorsFromSearch = (instructorData) => {
    const filteredInstructors = instructorData.filter(
      instructor => !selectedInstructors.some(
        selected => selected.id === instructor.id
      )
    );
    setSearchedInstructors(filteredInstructors);
  };

  function addNewClient(newClient) {
    addTag(newClient);
    setInstructorSearchTerm("");
    setSearchedInstructors([]);
    getInstructorResults(")");
    setDropdownVisible(false);
  }

  return (
    <>
      <HStack gap="12px">
        <Box as="img" src={BsPaletteFill} boxSize="20px" />
        <div id="instructorContainer">
          <div id="instructors" className="inputElement">
            <div id="instructorSelection">
              <Box>
                <div id="instructorInputContainer">
                  <Input
                    autoComplete="off"
                    placeholder="Lead Artist(s)"
                    onChange={(e) => {searchInstructors(e.target.value)}}
                    onClick={() => {searchInstructors(instructorSearchTerm)}}
                    value={instructorSearchTerm}
                    id="instructorInput"
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
                          addTag(instructor);
                        }

                        if (!instructor) {
                          // use addclient modal
                          setAddClientModalOpen(true);
                        }

                        setInstructorSearchTerm("");
                        setSearchedInstructors([]);
                        getInstructorResults(")")
                      }
                    }}
                    _hover={{ color: instructorSearchTerm.trim() !== "" ? "#800080" : "inherit" }}
                  >
                    <PlusFilledIcon
                      color={
                        instructorSearchTerm.trim() !== ""
                          ? "#4441C8" : "#718096"
                      }
                    />
                  </Box>
                </div>

                {dropdownVisible && searchedInstructors.length > 0 && (
                  <Box id="instructorDropdown" w="100%" maxW="195px">
                    {searchedInstructors.map((instructor) => (
                      <Box
                        key={instructor.id}
                        onClick={() => {
                          setInstructorSearchTerm(instructor.name);
                          setSearchedInstructors([]);
                          setDropdownVisible(false);
                        }}
                        style={{
                          padding: "10px",
                          fontSize: "16px",
                          cursor: "pointer",
                          transition: "0.2s",
                          backgroundColor: "#FFF"
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
                    color="#718096"
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
            ) : <div></div>}
          </div>
        </div>
      </HStack>
      <AddClient
        isOpen={addClientModalOpen}
        onClose={() => setAddClientModalOpen(false)}
        onAdd={addNewClient}
        preFillName={instructorSearchTerm}
        type="Add Lead Artist"
      />
    </>
  )
}
