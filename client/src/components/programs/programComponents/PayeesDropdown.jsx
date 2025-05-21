import { useState, useEffect } from 'react'
import '../EditProgram.css';
import {
  Box,
  Flex,
  HStack,
  Icon,
  IconButton,
  Input,
  Tag,
} from '@chakra-ui/react';
import { useBackendContext } from "../../../contexts/hooks/useBackendContext";

import { CloseFilledIcon } from '../../../assets/CloseFilledIcon';
import { PlusFilledIcon } from '../../../assets/PlusFilledIcon';
import personSvg from "../../../assets/person.svg";
import { AddClient } from "../../../components/clientsearch/AddClient";
import { EditClientIcon } from "../../../assets/EditClientIcon";

export const PayeesDropdown = ( {payeeSearchTerm, searchedPayees, selectedPayees, setPayeeSearchTerm, setSelectedPayees, setSearchedPayees, setSelectedEmails} ) => {
  const { backend } = useBackendContext();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);
  const [selectedPayeeToEdit, setSelectedPayeeToEdit] = useState(null);


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
                              onClick={() => {searchPayees(payeeSearchTerm)}}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  const payee = searchedPayees.find(
                                    (p) =>
                                      p.name.toLowerCase() === payeeSearchTerm.toLowerCase()
                                  );
                                  if (payee) {
                                    setSelectedPayees((prevItems) => [...prevItems, payee]);
                                  }
                                  if (!payee) {
                                    setShowAddClient(true);
                                  }
                                }
                              }}
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
                          </Box>
                          <IconButton
                            variant="ghost"
                            color="#718096"
                            onClick={() => setShowAddClient(true)}
                            _hover={{ color: "#4441C8", boxShadow: "none" }} // also removes shadow on hover
                            _focus={{ boxShadow: "none" }} // removes shadow on focus
                            icon={<PlusFilledIcon/>}
                          />
                          <AddClient
                            isOpen={showAddClient}
                            onClose={() => setShowAddClient(false)}
                            onSave={(newPayee) => {
                              // Add newly created payer as tag
                              setSelectedPayees((prevItems) => [...prevItems, newPayee]);
                              setSelectedEmails((prevItems) => [...prevItems, newPayee]);
                              setShowAddClient(false);
                            }}
                            type="Payer"
                            firstNameUserInput={payeeSearchTerm.trim().split(" ")[0] || ""}
                            lastNameUserInput={payeeSearchTerm.trim().split(" ").slice(1).join(" ") || ""}
                          />
                      </div>

                      {dropdownVisible && searchedPayees.length > 0 && (
                          <Box id="payeeDropdown" w="100%" maxW="198px">
                              {searchedPayees.map((payee) => (
                                  <Flex
                                      key={payee.id}
                                      align="center"
                                      justify="space-between"
                                      padding="6px 8px"
                                      fontSize="16px"
                                      cursor="pointer"
                                      backgroundColor="#FFF"
                                      _hover={{ bg: "#EDF2F7" }}
                                      role="group"
                                      onClick={() => {
                                        setSelectedPayees((prevItems) => [...prevItems, payee]);
                                      }}
                                    >
                                      {payee.name}
                                      <IconButton
                                        icon={<EditClientIcon />}
                                        size="sm"
                                        variant="ghost"
                                        opacity={0} // hide by default
                                        _groupHover={{ opacity: 1, boxShadow: "none" }} // show on row hover
                                        _focus={{ boxShadow: "none"}}
                                        transition="opacity 0.2s"
                                        onClick={(e) => {
                                          e.stopPropagation(); // prevent row click
                                          setSelectedPayeeToEdit(payee);
                                          setShowAddClient(true);
                                        }}
                                      />
                                  </Flex>
                              ))}
                          </Box>
                      )}
                  </Box>
                  {selectedPayeeToEdit && (
                  <AddClient
                    isOpen={showAddClient}
                    onClose={() => setShowAddClient(false)}
                    onSave={(newPayee) => {
                      setSelectedPayees((prev) => [...prev, newPayee]);
                      setSelectedEmails((prevItems) => [...prevItems, newPayee]);
                      setShowAddClient(false);
                    }}
                    type="Edit"
                    firstNameUserInput={selectedPayeeToEdit.name.trim().split(" ")[0] || ""}
                    lastNameUserInput={selectedPayeeToEdit.name.trim().split(" ").slice(1).join(" ") || ""}
                    emailUserInput={selectedPayeeToEdit.email.trim()}
                    client={selectedPayeeToEdit}
                  />
                )}
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
