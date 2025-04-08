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
            if (!event.target.closest("#payeeContainer")) {
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
        <Box as="img" src={personSvg} boxSize="20px" />
        <div id="payeeContainer">
            <div id="payees">
                <div id="payeeSelection">
                    <Box>
                        <div id="payeeInputContainer">
                            <Input
                                placeholder="Payee(s)"
                                onChange={(e) => {
                                getPayeeResults(e.target.value);
                                setPayeeSearchTerm(e.target.value);
                                setDropdownVisible(true);
                                }}
                                value={payeeSearchTerm} id="payeeInput"
                                autocomplete="off"
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
                                    setSelectedPayees((prevItems) => [...prevItems, payee]);
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

                        {dropdownVisible && searchedPayees.length > 0 && payeeSearchTerm.length > 0 && (
                            <Box id="payeeDropdown" w="100%" maxW="195px">
                                {searchedPayees.map((payee) => (
                                    <Box
                                        key={payee.id}
                                        onClick={() => {
                                            setPayeeSearchTerm(payee.name); // Fill input field
                                            setDropdownVisible(false); // Hide dropdown after selecting
                                        // const alreadySelected = selectedPayees.find(
                                        //     (pay) => pay.id.toString() === payee.id
                                        // );

                                        // if (!alreadySelected) {
                                        //     setSelectedPayees((prevItems) => [...prevItems, payee]);
                                        //     setPayeeSearchTerm(""); // Clears input
                                        //     setSearchedPayees([]); // Closes dropdown
                                        // }

                                        // if (payee && !alreadySelected) {
                                        //     setSelectedPayees((prevItems) => [...prevItems, payee]);
                                        //     const filteredPayees = searchedPayees.filter(
                                        //     (pay) => payee.id !== pay.id.toString()
                                        //     );
                                        //     setSearchedPayees(filteredPayees);
                                        // }
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
