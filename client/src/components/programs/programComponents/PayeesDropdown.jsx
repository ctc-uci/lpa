import { useState, useEffect } from 'react'
import '../EditProgram.css';
import {
    Box,
    HStack,
    Icon,
    Input,
    Tag,
} from '@chakra-ui/react';
import { useBackendContext } from "../../../contexts/hooks/useBackendContext";

import {CloseFilledIcon} from '../../../assets/CloseFilledIcon';
import {PlusFilledIcon} from '../../../assets/PlusFilledIcon';
import personSvg from "../../../assets/person.svg";

export const PayeesDropdown = ( {payeeSearchTerm, searchedPayees, selectedPayees, setPayeeSearchTerm, setSelectedPayees, setSearchedPayees, setSelectedEmails} ) => {
  const { backend } = useBackendContext();
  const [dropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    getPayeeResults(payeeSearchTerm);
  }, [selectedPayees, payeeSearchTerm]);

  useEffect(() => {
      const handleClickOutside = (event) => {
      const container = document.getElementById("payeeBody");
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

  const addTag = (payee) => {
    setSelectedEmails((prevItems) => [...prevItems, payee]);
    setSelectedPayees((prevPayees) => [...prevPayees, payee]);
  }

  const searchPayees = (query) => {
    getPayeeResults(query);
    setPayeeSearchTerm(query);
    setDropdownVisible(true);
  };

  const getPayeeResults = async (search) => {
    try {
      const payeeResponse = await backend.get("/clients/search", {
        params: {
          searchTerm: search,
          columns: ["name"]
        }
      });
      filterSelectedPayeesFromSearch(payeeResponse.data);
    } catch (error) {
        console.error("Error getting instructors:", error);
    }
  };

  const filterSelectedPayeesFromSearch = (payeesData) => {
    const filteredPayees = payeesData.filter(
      (payee) => !selectedPayees.some(
        (selectedPayee) => selectedPayee.id === payee.id
      )
    );

    setSearchedPayees(filteredPayees);
  };

  return (
  <HStack gap="12px" id="payeeBody">
      <Box as="img" src={personSvg} boxSize="20px" />
      <div id="payeeContainer">
          <div id="payees">
              <div id="payeeSelection">
                  <Box>
                      <div id="payeeInputContainer">
                          <Input
                              placeholder="Payee(s)"
                              onChange={(e) => {searchPayees(e.target.value)}}
                              onClick={(e) => {searchPayees(payeeSearchTerm)}}
                              value={payeeSearchTerm}
                              id="payeeInput"
                              autoComplete="off"
                              />
                          <Box
                              as="button"
                              onClick={() => {
                              if (payeeSearchTerm.trim() !== "") {
                                  // Find the instructor from the searched list
                                  const payee = searchedPayees.find(
                                  (p) => p.name.toLowerCase() === payeeSearchTerm.toLowerCase()
                                  );
                                  // If instructor exists and is not already selected, add it as a tag
                                  if (payee && !selectedPayees.some(p => p.id === payee.id)) {
                                    addTag(payee);
                                  }
                                  setPayeeSearchTerm("");
                                  setSearchedPayees([]);
                                  getPayeeResults(")")
                              }
                              }}
                              disabled={
                              payeeSearchTerm.trim() === "" ||
                              !searchedPayees.some(p => p.name.toLowerCase() === payeeSearchTerm.toLowerCase())
                              }
                              cursor={
                              payeeSearchTerm.trim()==="" ||
                              !searchedPayees.some(p => p.name.toLowerCase() === payeeSearchTerm.toLowerCase())
                              ? "not-allowed" : "pointer"
                              }
                              _hover={{ color: payeeSearchTerm.trim() !== "" ? "#800080" : "inherit" }}
                          >
                              <PlusFilledIcon
                                  color={
                                      payeeSearchTerm.trim() !== "" &&
                                        searchedPayees.some(p => p.name.toLowerCase() === payeeSearchTerm.toLowerCase())
                                        ? "#4441C8" : "#718096"
                                  }
                              />
                          </Box>
                      </div>

                      {dropdownVisible && searchedPayees.length > 0 && (
                          <Box id="payeeDropdown" w="100%" maxW="195px">
                              {searchedPayees.map((payee) => (
                                  <Box
                                      key={payee.id}
                                      onClick={() => {
                                          // setPayeeSearchTerm(payee.name);
                                          addTag(payee);

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
                                      {payee.name}
                                  </Box>
                              ))}
                          </Box>
                      )}
                  </Box>
              </div>
          </div>
              <div id="payeeTags">
                  {selectedPayees.length > 0 ? (
                      selectedPayees.map((payee, ind) => (
                      <div className="payeeTag" key={ind}>
                          <Tag value={payee.id}>
                              {payee.name}
                          </Tag>
                          <Icon
                              fontSize="lg"
                              color = "#718096"
                              _hover={{ color: "#4441C8" }}
                              cursor="pointer"
                              onClick={() => {
                                  setSelectedPayees(prevItems =>
                                  prevItems.filter(item => item.id !== payee.id));
                                  setSelectedEmails(prevItems =>
                                  prevItems.filter(item => item.id !== payee.id));
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
