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
import personSvg from "../../../assets/person.svg";

export const PayeesDropdown = ( {payeeSearchTerm, searchedPayees, selectedPayees, getPayeeResults, setPayeeSearchTerm, setSelectedPayees, setSearchedPayees} ) => {
    const [dropdownVisible, setDropdownVisible] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest("#payeeContainer") && !event.target.closest(".payeeTag")) {
                setDropdownVisible(false);
            }
        }

        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        }
    }, []);

  const search = (searchTerm) => {
    setPayeeSearchTerm(searchTerm);
    getPayeeResults(searchTerm);
    setDropdownVisible(true);
  };

  useEffect(() => {
    search(payeeSearchTerm);
  }, [selectedPayees, payeeSearchTerm]);

    return (
    <HStack gap="12px">
        <Box as="img" src={personSvg} boxSize="20px" />
        <div id="payeeContainer" >
            <div id="payees" className="inputElement">
                <div id="payeeSelection" >
                    <Box >
                        <div id="payeeInputContainer">
                            <Input
                              autoComplete="off"
                              placeholder="Payee(s)"
                              _placeholder={{ color: '#CBD5E0' }}
                              onChange={(e) => {
                                search(e.target.value);
                              }}
                              onClick={(e) => {
                                search(e.target.value);
                              }}
                              value={payeeSearchTerm}
                              id="payeeInput"/>
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
                                    setSelectedPayees((prevItems) => [...prevItems, payee]);
                                    }
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
                                _hover={{ color: payeeSearchTerm.trim() !== "" ? "#312E8A" : "inherit" }}
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

                        {dropdownVisible && searchedPayees.length > 0 && payeeSearchTerm.length > 0 && (
                            <Box id="payeeDropdown" w="100%" maxW="195px">
                                {searchedPayees.map((payee) => (
                                    <Box
                                        key={payee.id}
                                        onClick={() => {
                                        const alreadySelected = selectedPayees.find(
                                            (pay) => pay.id.toString() === payee.id
                                        );

                                        if (payee && !alreadySelected) {
                                            setSelectedPayees((prevItems) => [...prevItems, payee]);
                                            const filteredPayees = searchedPayees.filter(
                                            (pay) => payee.id !== pay.id.toString()
                                            );
                                            setSearchedPayees(filteredPayees);
                                        }
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
