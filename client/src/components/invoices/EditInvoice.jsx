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
    Box,
    IconButton,
    VStack,
    HStack,
    Image,
    Text,
    SimpleGrid,
    Input,
    
    
} from "@chakra-ui/react";

import { InvoicePayments, InvoiceStats, InvoiceTitle } from "./InvoiceComponents";
import { StatementComments, EditInvoiceTitle, EditInvoiceDetails, InvoiceSummary } from "./EditInvoiceComponents";

import Navbar from "../navbar/Navbar";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";

import InvoiceBackground from '../../assets/background/InvoiceBackground.png';


export const EditInvoice = () => {
    const { id } = useParams()
    const { backend } = useBackendContext();
    const navigate = useNavigate();

    const [invoice, setInvoice] = useState([]);
    const [comments, setComments] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [programName, setProgramName] = useState("")
    const [payees, setPayees] = useState([])
    const [subtotal, setSubtotal] = useState(0)
    const [pastDue, setPastDue] = useState(0)

    useEffect(() => {
        const fetchData = async () => {
            try {
                // get current invoice
                const currentInvoiceResponse = await backend.get("/invoices/" + id);
                setInvoice(currentInvoiceResponse);
            } catch (error) {
              // Invoice/field does not exist
              console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, [backend, id]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // If no invoice is found, set everything to null
                if (!invoice.data || invoice.status === 404) {
                  setComments([]);
                  setInstructors([])
                  setProgramName("")
                  setPayees(null);
                  setPastDue(0);
                  return;
                }
                
                // get instructors
                const instructorResponse = await backend.get('/assignments/instructors/' + invoice.data[0].eventId);
                setInstructors(instructorResponse.data);
                
                // get comments
                const commentsResponse = await backend.get('/comments/details/' + id);
                setComments(commentsResponse.data);
                
                // get program name
                const programNameResponse = await backend.get('/events/' + invoice.data[0].eventId);
                setProgramName(programNameResponse.data[0].name);

                // get payees
                const payeesResponse = await backend.get("/invoices/payees/" + id);
                setPayees(payeesResponse.data)

                // get subtotal
                const subtotalResponse = await backend.get("/invoices/total/" + id);
                setSubtotal(subtotalResponse.data.total)


                // get the unpaid/remaining invoices
                const unpaidInvoicesResponse = await backend.get("/events/remaining/" + invoice.data[0]["eventId"]);

                // calculate sum of unpaid/remaining invoices
                const unpaidTotals = await Promise.all(
                  unpaidInvoicesResponse.data.map(invoice => backend.get(`/invoices/total/${invoice.id}`))
                );
                const partiallyPaidTotals = await Promise.all(
                    unpaidInvoicesResponse.data.map(invoice => backend.get(`/invoices/paid/${invoice.id}`))
                );
                const unpaidTotal = unpaidTotals.reduce((sum, res) => sum + res.data.total, 0);
                const unpaidPartiallyPaidTotal = partiallyPaidTotals.reduce((sum, res) => sum + res.data.paid, 0);
                const remainingBalance = unpaidTotal - unpaidPartiallyPaidTotal;
                setPastDue(remainingBalance);


                
            } catch (error) {
              // Invoice/field does not exist
              console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, [invoice]);

    return (
        <Navbar>
            <Flex direction="row" height="100%" width="100%">
                <Flex direction="column" height="100%" width="100%" padding="2.5vw" gap="1.25vw">
                    <Flex width="100%">
                        
                        <HStack align="flex-start">
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

                    
                            {/*Edit Area*/}
                            <VStack
                                direction="column"
                                pt={200}
                                backgroundImage={`url(${InvoiceBackground})`}
                                backgroundSize="cover" 
                                backgroundPosition="center"
                                
                                
                            >
                                <div h="10px" overflow="auto">
                                    <EditInvoiceTitle/>
                                    <EditInvoiceDetails instructors={instructors} programName={programName} payees={payees}/>
                                    <StatementComments comments={comments} subtotal={subtotal}/>
                                    <InvoiceSummary pastDue= {pastDue} subtotal={subtotal}/>
                                </div>
                            </VStack>

                            {/*Save Changes Button*/}
                            <Flex direction="row" marginLeft="auto" gap={5}>
                                <Button height="2.5em" borderRadius={10} backgroundColor="#4E4AE7" color="#FFF" fontSize="clamp(.75rem, 1.25rem, 1.75rem)" gap={1}>
                                    Save Changes
                                </Button>
                            </Flex>

                        </HStack>

                    </Flex>

                </Flex>
            </Flex>
        </Navbar>
    );
}
