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
        <Flex direction="row" height="100vh" width="100vw">
            <Navbar />
            <Flex direction="column" height="100%" width="100%" padding="2.5vw" gap="1.25vw">
                <Flex direction="row" width="100%">
                    <IconButton
                        icon={<FaAngleLeft />}
                        onClick={() => {
                            navigate("/invoices");
                        }}
                        variant="link"
                        color="#474849"
                        fontSize="2.5rem"
                    >
                    </IconButton>
                </Flex>
                <Flex direction="column" height="100%" width="100%" paddingLeft="2.5vw" paddingRight="2.5vw" gap="1.25vw">
                    <Flex direction="row" width="100%">
                        <Heading fontSize="clamp(2rem, 3vw, 3vw)" color="#4E4AE7">
                            Invoice Details
                        </Heading>
                        <Flex direction="row" marginLeft="auto" gap="1rem">
                            <Button height="100%" borderRadius="30px" backgroundColor="#4E4AE7" color="#FFFFFF" fontSize="clamp(1rem, 2vw, 2vw)" gap="0.5rem">
                                <FiEdit></FiEdit>
                                Edit
                            </Button>
                            <Button height="100%" borderRadius="30px" backgroundColor="#4E4AE7" color="#FFFFFF" fontSize="clamp(1rem, 2vw, 2vw)" gap="0.5rem">
                                <FiExternalLink></FiExternalLink>
                                Preview
                            </Button>
                        </Flex>
                    </Flex>
                    <Flex direction="row" width="100%" alignItems="center">
                        <Text fontSize="2.5vw" color="#474849" fontWeight="bold" marginRight="0.5rem">
                            Program:
                        </Text>
                        <Text fontSize="2.5vw" color="#474849">
                            Immigrant Rights Solidarity Week: Become an Immigration Rights Ambassador Workshop
                        </Text>
                    </Flex>
                    <InvoiceStats
                        name={payeeName}
                        email={payeeEmail}
                        amountDue={total.total}
                        height="auto"
                        width="100%"
                        padding="1.25vw"
                        headerSize="2.5vw"
                        textSize="clamp(1rem, 2vw, 2vw)"
                        color="#474849"
                    >
                    </InvoiceStats>
                    <InvoicePayments
                        comments={comments}
                        height="auto"
                        width="100%"
                        headerSize="2.5vw"
                        textSize="clamp(1rem, 1vw, 1vw)"
                        gap="0.625vw"
                    >
                    </InvoicePayments>
                    {/* <InvoicePayments
                comments = { comments }
            >
            </InvoicePayments> */}
                </Flex>
            </Flex>
        </Flex>
        // <Navbar>
        //     <VStack
        //         spacing={8}
        //         sx={{ width: 950, marginX: "auto" }}
        //     >
        //     {/* back button */}
        //     <Flex w="115%" justifyContent="flex-start" mt={50}>
        //         <IconButton
        //         icon={<FaAngleLeft />}
        //         onClick={handleBackClick}
        //         variant="link"
        //         color="#474849"
        //         fontSize="30px"
        //         />
        //     </Flex>

        //     {/* title and buttons */}
        //     <Flex w="100%" justifyContent="space-between" alignItems="center" pt={5}>
        //     <Heading color="#4E4AE7">Invoice Details</Heading>
        //     <Flex gap={7}>
        //         <Button backgroundColor='#4E4AE7' color='#FFF' borderRadius={30} gap={1}>
        //         <FiEdit/> Edit
        //         </Button>
        //         <Button backgroundColor='#4E4AE7' color='#FFF' borderRadius={30}>Preview</Button>
        //     </Flex>
        //     </Flex>

        //     {/* description */}
        //     <Flex w="100%" alignItems="center">
        //         <Text fontWeight="bold" fontSize="22px" color="#474849" mr={2}>Program:</Text>
        //         <Text fontSize="20px" color="#474849">
        //         Immigrant Rights Solidarity Week: Become an Immigration Rights Ambassador Workshop
        //         </Text>
        //     </Flex>

        //     {/* invoice stats */}
        //     <InvoicesStats name={payeeName} email={payeeEmail}/>

        //     {/* invoice table */}
        //     <Flex w="100%" alignItems="center">
        //         <Text fontWeight="bold" fontSize="22px" color="#474849">Comments</Text>
        //     </Flex>
        //     <InvoicesTable comments={comments} />
        //     </VStack>
        // </Navbar>
    );
}
