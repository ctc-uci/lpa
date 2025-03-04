import React from 'react'
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
  return (
    <HStack>
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
                                }}
                                value={payeeSearchTerm} id="payeeInput"/>
                            <PlusFilledIcon />
                        </div>

                        {searchedPayees.length > 0 && (
                            <Box id="payeeDropdown">
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
                            <Icon fontSize="lg" onClick={() => {
                                setSelectedPayees(prevItems =>
                                prevItems.filter(item => item.id !== payee.id));
                            }}><CloseFilledIcon /></Icon>
                        </div>
                    ))
                ) : <div></div> }
            </div>
        </div>
    </HStack>
    )
}
