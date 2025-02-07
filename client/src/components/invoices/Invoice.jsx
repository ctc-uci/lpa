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

import { InvoicePayments, InvoiceStats, InvoiceTitle } from "./InvoiceComponents";
import Navbar from "../Navbar";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";


export const Invoice = () => {
    const { id } = useParams()
    const { backend } = useBackendContext();
    const navigate = useNavigate();

    const [total, setTotal] = useState(0);
    const [remainingBalance, setRemainingBalance] = useState(0);
    const [billingPeriod, setBillingPeriod] = useState({});
    const [comments, setComments] = useState([]);
    const [payees, setPayees] = useState([]);
    const [event, setEvent] = useState();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // get invoice total
                const invoiceTotalResponse = await backend.get("/invoices/total/" + id);
                setTotal(invoiceTotalResponse.data.total)

                // get current invoice
                const currentInvoiceResponse = await backend.get("/invoices/" + id);

                // get the unpaid/remaining invoices
                const unpaidInvoicesResponse = await backend.get("/events/remaining/" + currentInvoiceResponse.data[0]["eventId"]);
                console.log("Unpaid Invoices: ", unpaidInvoicesResponse.data);

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
                setRemainingBalance(remainingBalance);

                // set billing period
                setBillingPeriod(
                    {
                        "startDate": currentInvoiceResponse.data[0]["startDate"],
                        "endDate": currentInvoiceResponse.data[0]["endDate"]
                    }
                )

                // get comments
                const commentsResponse = await backend.get('/comments/paidInvoices/' + id);
                setComments(commentsResponse.data);

                // get payees
                const payeesResponse = await backend.get("/invoices/payees/" + id);
                setPayees(payeesResponse.data)

                // get corresponding event
                const eventResponse = await backend.get("/invoices/invoiceEvent/" + id);
                setEvent(eventResponse.data)
                console.log(eventResponse)
            } catch (error) {
              // error if invoice doesn't exist
              setTotal(null);
              setRemainingBalance(null);
              setBillingPeriod(null);
              setComments(null);
              setPayees(null);
              setEvent(null);
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

                    <InvoiceTitle
                        title={event ? event.name : "N/A"}
                    ></InvoiceTitle>

                    <InvoiceStats
                        payees={payees}
                        billingPeriod={billingPeriod}
                        amountDue={total}
                        remainingBalance={remainingBalance}
                    ></InvoiceStats>

                        <InvoicePayments
                            comments={comments}
                        ></InvoicePayments>

                    </Flex>
                </Flex>
            </Flex>
        </Navbar>
    );
}
