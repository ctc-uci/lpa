import React, { useState, useEffect } from "react";
import { FaAngleLeft } from "react-icons/fa6";
import { FiEdit, FiExternalLink } from "react-icons/fi";
import {
    useNavigate,
    useParams
} from "react-router-dom";

import {
    Heading,
    Flex,
    Button,
    IconButton,
} from "@chakra-ui/react";

import { InvoicePayments, InvoiceStats, InvoiceTitle } from "./InvoiceComponents";
import { EmailHistory } from "./EmailHistory";

import Navbar from "../navbar/Navbar";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";


export const EditInvoice = () => {
    const { id } = useParams()
    const { backend } = useBackendContext();
    const navigate = useNavigate();

    return (
        <Navbar>
            <Flex direction="row" height="100%" width="100%">
                <Flex direction="column" height="100%" width="100%" padding="2.5vw" gap="1.25vw">
                    <Flex width="100%">
                        {/* back button */}
                        <IconButton
                            icon={<FaAngleLeft />}
                            onClick={() => {
                                navigate(`/invoices/${id}`);
                            }}
                            variant="link"
                            color="#474849"
                            fontSize="1.5em"
                        >
                        </IconButton>

                        <Flex direction="row" marginLeft="auto" gap={5}>
                            <Button height="2.5em" borderRadius={30} backgroundColor="#4E4AE7" color="#FFF" fontSize="clamp(.75rem, 1.25rem, 1.75rem)" gap={1}>
                                Save Changes
                            </Button>
                        </Flex>

                    </Flex>

                </Flex>
            </Flex>
        </Navbar>
    );
}
