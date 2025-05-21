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
import {EmailIcon} from '../../../assets/EmailIcon';
import { AddClient } from '../../clientsearch/AddClient';

export const EmailDropdown = ({emailSearchTerm, searchedEmails, selectedEmails, setEmailSearchTerm, setSelectedEmails, setSearchedEmails, setSelectedPayees}) => {
  const { backend } = useBackendContext();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [addClientModalOpen, setAddClientModalOpen] = useState(false);

  useEffect(() => {
    getEmailResults(emailSearchTerm);
  }, [selectedEmails, emailSearchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const container = document.getElementById("emailBody");
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

  const addTag = (email) => {
    setSelectedEmails((prevItems) => [...prevItems, email]);
    setSelectedPayees((prevPayees) => [...prevPayees, email]);
  }

  const searchEmails = (query) => {
    getEmailResults(query);
    setEmailSearchTerm(query);
    setDropdownVisible(true);
  };

  const getEmailResults = async (search) => {
    try {
      const emailResponse = await backend.get("/clients/search", {
        params: {
          searchTerm: search,
          columns: ["email"]
        }
      });

      filterSelectedEmailsFromSearch(emailResponse.data);
    } catch (error) {
      console.error("Error getting emails:", error);
    }
  };

  const filterSelectedEmailsFromSearch = (emailsData) => {
    const filteredEmails = emailsData.filter(
      (email) => !selectedEmails.some(
        (selectedEmail) => selectedEmail.id === email.id
      )
    );

    setSearchedEmails(filteredEmails);
  };

  function addNewClient(newClient) {
    addTag(newClient);
    setEmailSearchTerm("");
    setSearchedEmails([]);
    getEmailResults(")");
    setDropdownVisible(false);
  }

  return (
    <>
      <HStack gap="12px" id="emailBody">
        <EmailIcon />
        <div id="emailContainer">
          <div id="emails" className="inputElement">
            <div id="emailSelection">
              <Box>
                <div id="emailInputContainer">
                  <Input
                    placeholder="Email address"
                    onChange={(e) => {searchEmails(e.target.value)}}
                    onClick={() => {searchEmails(emailSearchTerm)}}
                    value={emailSearchTerm}
                    id="emailInput"
                    autoComplete="off"
                  />
                  <Box
                    as="button"
                    onClick={() => {
                      if (emailSearchTerm.trim() !== "") {
                        // Find the email from the searched list
                        const email = searchedEmails.find(
                          (p) => p.email.toLowerCase() === emailSearchTerm.toLowerCase()
                        );
                        // If email exists and is not already selected, add it as a tag
                        if (email && !selectedEmails.some(p => p.id === email.id)) {
                          addTag(email);
                        }

                        if (!email) {
                          // use addclient modal
                          setAddClientModalOpen(true);
                        }

                        setEmailSearchTerm("");
                        setSearchedEmails([]);
                        getEmailResults(")")
                      }
                    }}
                    _hover={{ color: emailSearchTerm.trim() !== "" ? "#800080" : "inherit" }}
                  >
                    <PlusFilledIcon
                      color={
                        emailSearchTerm.trim() !== ""
                          ? "#4441C8" : "#718096"
                      }
                    />
                  </Box>
                </div>

                {dropdownVisible && searchedEmails.length > 0 && (
                  <Box id="emailDropdown" w="100%" maxW="195px">
                    {searchedEmails.map((email) => (
                      <Box
                        key={email.id}
                        onClick={() => {
                          setEmailSearchTerm(email.email);
                          setSearchedEmails([]);
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
                        {email.email}
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </div>
          </div>
          <div id="emailTags">
            {selectedEmails.length > 0 ? (
              selectedEmails.map((email, ind) => (
                <div className="emailTag" key={ind}>
                  <Tag value={email.id}>
                    {email.email}
                  </Tag>
                  <Icon
                    fontSize="lg"
                    color="#718096"
                    _hover={{ color: "#4441C8" }}
                    cursor="pointer"
                    onClick={() => {
                      setSelectedEmails(prevItems =>
                        prevItems.filter(item => item.id !== email.id));
                      setSelectedPayees(prevPayees =>
                        prevPayees.filter(payee => payee.id !== email.id));
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
        preFillEmail={emailSearchTerm}
        type="Add Email"
      />
    </>
  )
}
