import { useState, useEffect, useRef } from 'react'
import '../EditProgram.css';
import {
    Box,
    HStack,
    Icon,
    Input,
    Tag,
    Flex,
    Text,
    Button
} from '@chakra-ui/react';
import { useBackendContext } from "../../../contexts/hooks/useBackendContext";

import {CloseFilledIcon} from '../../../assets/CloseFilledIcon';
import {EditIcon} from '../../../assets/EditIcon';
import {PlusFilledIcon} from '../../../assets/PlusFilledIcon';
import personSvg from "../../../assets/person.svg";
import { AddClient } from '../../clientsearch/AddClient';

export const PayeesDropdown = ( {payeeSearchTerm, searchedPayees, selectedPayees, setPayeeSearchTerm, setSelectedPayees, setSearchedPayees, setSelectedEmails} ) => {
  const { backend } = useBackendContext();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [addClientModalOpen, setAddClientModalOpen] = useState(false);
  const [prefilledEmail, setPrefilledEmail] = useState(null);
  const [editId, setEditId] = useState(null);
  const tagsRef = useRef(null);

  function resetState() {
    setPayeeSearchTerm("");
    setDropdownVisible(false);
    setEditId(null);
    setPrefilledEmail(null);
  }

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

  // Add effect to check scrollability
  useEffect(() => {
    const checkScrollable = () => {
      if (tagsRef.current) {
        const isScrollable = tagsRef.current.scrollHeight > tagsRef.current.clientHeight;
        tagsRef.current.classList.toggle('scrollable', isScrollable);
      }
    };

    // Check initially and after any changes to selected payees
    checkScrollable();
    
    // Create a ResizeObserver to check when the container size changes
    const resizeObserver = new ResizeObserver(checkScrollable);
    if (tagsRef.current) {
      resizeObserver.observe(tagsRef.current);
    }

    return () => {
      if (tagsRef.current) {
        resizeObserver.unobserve(tagsRef.current);
      }
    };
  }, [selectedPayees]);

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

  function addNewClient(newClient) {
    // console.log("new", newClient);
    resetState();
    setPayeeSearchTerm(newClient.name);
  }

  function updateClient(updatedClient) {
    // console.log("updated", updatedClient);
    resetState();
    setPayeeSearchTerm(updatedClient.name);
    searchPayees(updatedClient.name);
    setDropdownVisible(false);
  }

  return (
  <>
    <HStack gap="12px" id="payeeBody">
        <Box as="img" src={personSvg} boxSize="20px" />
        <div id="payeeContainer">
            <div id="payees">
                <div id="payeeSelection">
                    <Box>
                        <div id="payeeInputContainer">
                            <Input
                                placeholder="Payer(s)"
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

                                    if (!payee) {
                                      // use addclient modal
                                      setEditId(null);
                                      setPrefilledEmail(null);
                                      setAddClientModalOpen(true);
                                    }

                                    setPayeeSearchTerm("");
                                    setSearchedPayees([]);
                                    getPayeeResults(")")
                                }
                                }}
                                _hover={{ color: payeeSearchTerm.trim() !== "" ? "#800080" : "inherit" }}
                            >
                                <PlusFilledIcon
                                    color={
                                        payeeSearchTerm.trim() !== ""
                                          // searchedPayees.some(p => p.name.toLowerCase() === payeeSearchTerm.toLowerCase())
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
                                            setPayeeSearchTerm(payee.name);
                                            setSearchedPayees([]);
                                            setDropdownVisible(false);
                                            // addTag(payee);

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
                                        <Flex justifyContent="space-between">
                                            <Text overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap" w="150px">{payee.name}</Text>
                                            <Button variant="ghost" size="sm" color="#718096" padding="0px" marginTop="-4px"
                                                onClick={() => {
                                                    setEditId(payee.id);
                                                    setPrefilledEmail(payee.email);
                                                    setPayeeSearchTerm(payee.name);
                                                    setAddClientModalOpen(true);
                                                }}
                                            >
                                                <EditIcon color="#718096" />
                                            </Button>
                                        </Flex>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>
                </div>
            </div>
            <div id="payeeTags" ref={tagsRef}>
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
    <AddClient
      isOpen={addClientModalOpen}
        onClose={() => {
          setAddClientModalOpen(false);
          resetState();
        }}
        onAdd={addNewClient}
        onUpdate={updateClient}
        preFillName={payeeSearchTerm}
        preFillEmail={prefilledEmail}
        mode={editId ? "Edit" : "Add"}
        type={`${editId ? "Edit" : "Add"} Payer`}
        editId={editId}
    />
  </>
  )
}
