import React, { useState, useEffect } from "react";
import { FaAngleLeft } from "react-icons/fa6";
import { FiEdit, FiExternalLink } from "react-icons/fi";
import {
    useNavigate,
    useParams
} from "react-router-dom";

import {
    Heading,
    Text,
    Flex,
    Button,
    IconButton,
} from "@chakra-ui/react";

import { InvoicePayments, InvoiceStats } from "./InvoiceComponents";
import Navbar from "../Navbar";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";


export const Invoice = () => {
    const { id } = useParams()
    const { backend } = useBackendContext();
    const navigate = useNavigate();

    const payeeName = "Aya De Leon"
    const payeeEmail = "payee@gmail.com"

    const [total, setTotal] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [comments, setComments] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const invoiceTotalResponse = await backend.get("/invoices/total/" + id);
                console.log("Invoice Total: ", invoiceTotalResponse.data);
                setTotal(invoiceTotalResponse.data)

                const invoicesResponse = await backend.get("/invoices")
                console.log("Invoices", invoicesResponse.data);
                setInvoices(invoicesResponse.data);

                const commentsResponse = await backend.get('/comments/invoice/' + id);
                console.log("Comments: ", commentsResponse.data);
                setComments(commentsResponse.data);
            } catch (error) {
                console.error("Error fetching comments:", error);
            }
        };
        fetchData();
    }, [backend, id]);

    return (
      <Navbar>
        <Flex direction="row" height="100vh" width="100vw">
            <Flex direction="column" height="100%" width="100%" padding="2.5vw" gap="1.25vw">
                <Flex width="100%">
                    {/* back button */}
                    <IconButton
                        icon={<FaAngleLeft />}
                        onClick={() => {
                            navigate("/invoices");
                        }}
                        variant="link"
                        color="#474849"
                        fontSize="1.5em"
                    >
                    </IconButton>
                </Flex>

                <Flex direction="column" height="100%" width="100%" paddingLeft="2.5vw" paddingRight="2.5vw" gap="1.25vw">
                    {/* title*/}
                    <Flex direction="row" width="100%">
                        <Heading color="#4E4AE7">Invoice Details</Heading>

                        {/* buttons */}
                        <Flex direction="row" marginLeft="auto" gap={5}>
                            <Button height="100%" borderRadius={30} backgroundColor="#4E4AE7" color="#FFF" fontSize="clamp(.75rem, 1.25rem, 1.75rem)" gap={1}>
                                <FiEdit></FiEdit>
                                Edit
                            </Button>

                            <Button height="100%" borderRadius={30} backgroundColor="#4E4AE7" color="#FFF" fontSize="clamp(.75rem, 1.25rem, 1.75rem)" gap={1}>
                                <FiExternalLink></FiExternalLink>
                                Preview
                            </Button>

                        </Flex>
                    </Flex>


                    <Flex direction="row" width="100%" alignItems="center">
                        <Text fontSize="clamp(1rem, 1.5rem, 2rem)" color="#474849" fontWeight="bold" marginRight="0.5rem">
                            Program:
                        </Text>
                        <Text fontSize="clamp(.75rem, 1.25rem, 1.75rem)" color="#474849">
                            Immigrant Rights Solidarity Week: Become an Immigration Rights Ambassador Workshop
                        </Text>
                    </Flex>

                    <InvoiceStats
                        name={payeeName}
                        email={payeeEmail}
                        amountDue={total.total}
                    >
                    </InvoiceStats>
                    <InvoicePayments
                        comments={comments}
                    >
                    </InvoicePayments>
                </Flex>
            </Flex>
        </Flex>
      </Navbar>
    );
}
