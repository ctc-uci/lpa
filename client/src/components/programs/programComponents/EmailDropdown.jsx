import { useState, useEffect } from 'react'
import '../EditProgram.css';
import {
    Box,
    HStack,
    Icon,
    Input,
    Tag,
} from '@chakra-ui/react'

import {CloseFilledIcon} from '../../../assets/CloseFilledIcon';
import {PlusFilledIcon} from '../../../assets/PlusFilledIcon';
import {EmailIcon} from '../../../assets/EmailIcon';

export const EmailDropdown = ({emailSearchTerm, searchedEmails, selectedEmails, getEmailResults, setEmailSearchTerm, setSelectedEmails, setSearchedEmails, setSelectedPayees}) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest("#emailContainer")) {
                setDropdownVisible(false);
            }
        }

        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        }
    }, []);

  return (
    <HStack gap="12px">
        <EmailIcon />
        <div id="emailContainer">
            <div id="emails">
                <div id="emailSelection">
                    <Box>
                        <div id="emailInputContainer">
                            <Input
                                placeholder="Email address"
                                onChange={(e) => {
                                getEmailResults(e.target.value);
                                setEmailSearchTerm(e.target.value);
                                setDropdownVisible(true);
                                }}
                                value={emailSearchTerm}
                                id="emailInput"
                                autoComplete="off"
                                />
                            <Box
                                as="button"
                                onClick={() => {
                                if (emailSearchTerm.trim() !== "") {
                                    // Find the instructor from the searched list
                                    const email = searchedEmails.find(
                                    (p) => p.email.toLowerCase() === emailSearchTerm.toLowerCase()
                                    );
                                    // If instructor exists and is not already selected, add it as a tag
                                    if (email && !selectedEmails.some(p => p.id === email.id)) {
                                    setSelectedEmails((prevItems) => [...prevItems, email]);
                                    setSelectedPayees((prevPayees) => [...prevPayees, email]);
                                    }
                                    setEmailSearchTerm("");
                                    setSearchedEmails([]);
                                    getEmailResults(")")
                                }
                                }}
                                disabled={
                                emailSearchTerm.trim() === "" ||
                                !searchedEmails.some(p => p.email.toLowerCase() === emailSearchTerm.toLowerCase())
                                }
                                cursor={
                                emailSearchTerm.trim()==="" ||
                                !searchedEmails.some(p => p.email.toLowerCase() === emailSearchTerm.toLowerCase())
                                ? "not-allowed" : "pointer"
                                }
                                _hover={{ color: emailSearchTerm.trim() !== "" ? "#800080" : "inherit" }}
                            >
                                <PlusFilledIcon
                                    color={
                                        emailSearchTerm.trim() !== "" &&
                                          searchedEmails.some(p => p.email.toLowerCase() === emailSearchTerm.toLowerCase())
                                          ? "#4441C8" : "#718096"
                                    }
                                />
                            </Box>
                        </div>

                        {dropdownVisible && searchedEmails.length > 0 && emailSearchTerm.length > 0 && (
                            <Box id="emailDropdown" w="100%" maxW="195px">
                                {searchedEmails.map((email) => (
                                    <Box
                                        key={email.id}
                                        onClick={() => {
                                            setEmailSearchTerm(email.email);
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
                                color = "#718096"
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
                ) : <div></div> }
            </div>
        </div>
    </HStack>
  )
}
