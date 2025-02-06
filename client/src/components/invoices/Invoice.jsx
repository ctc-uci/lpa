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

import { InvoicePayments, InvoiceStats, InvoiceDescription } from "./InvoiceComponents";
import Navbar from "../Navbar";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";


export const Invoice = () => {
    const { id } = useParams()
    const { backend } = useBackendContext();
    const navigate = useNavigate();

    const payeeName = "Aya De Leon"
    const payeeEmail = "payee@gmail.com"

    const [total, setTotal] = useState(0);
    const [remainingBalance, setRemainingBalance] = useState(0);
    const [billingPeriod, setBillingPeriod] = useState({});
    const [comments, setComments] = useState([]);
    const [payees, setPayees] = useState([]);
    const [event, setEvent] = useState();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const invoiceTotalResponse = await backend.get("/invoices/total/" + id);
                console.log("Invoice Total: ", invoiceTotalResponse.data.total);
                setTotal(invoiceTotalResponse.data.total)

                const currentInvoiceResponse = await backend.get("/invoices/" + id);
                console.log("Current Invoice: ", currentInvoiceResponse.data);

                const unpaidInvoicesResponse = await backend.get("/events/remaining/" + currentInvoiceResponse.data[0]["eventId"]);
                console.log("Unpaid Invoices: ", unpaidInvoicesResponse.data);

                const unpaidInvoicesTotalResponse = await Promise.all(
                    unpaidInvoicesResponse.data.map(
                        unpaidInvoice => backend.get("/invoices/total/" + unpaidInvoice.id)
                    )
                );
                console.log("Unpaid Invoices Total: ", unpaidInvoicesTotalResponse);
                const unpaidTotal = unpaidInvoicesTotalResponse.reduce(
                    ((accumulator, currentValue) => accumulator + currentValue["data"]["total"]), 0
                );
                console.log("Unpaid Total: ", unpaidTotal);

                const unpaidInvoicesPartiallyPaidResponse = await Promise.all(
                    unpaidInvoicesResponse.data.map(
                        unpaidInvoice => backend.get("/invoices/paid/" + unpaidInvoice.id)
                    )
                );
                console.log("Unpaid Invoices Partially Paid Total: ", unpaidInvoicesPartiallyPaidResponse);
                const unpaidPartiallyPaidTotal = unpaidInvoicesPartiallyPaidResponse.reduce(
                    ((accumulator, currentValue) => accumulator + currentValue["data"]["paid"]), 0
                );
                console.log("Unpaid Partially Paid Total: ", unpaidPartiallyPaidTotal);

                setRemainingBalance(unpaidTotal - unpaidPartiallyPaidTotal);
                console.log("Remaining Balance: ", remainingBalance);

                const billingPeriod = await backend.get("invoices/" + id);
                console.log("Billing Period: ", billingPeriod.data[0]["startDate"]);
                setBillingPeriod(
                    {
                        "startDate": billingPeriod.data[0]["startDate"],
                        "endDate": billingPeriod.data[0]["endDate"]
                    }
                )
                const commentsResponse = await backend.get('/comments/paidInvoices/' + id);
                console.log("Comments: ", commentsResponse.data);
                setComments(commentsResponse.data);

                const payeesResponse = await backend.get("/invoices/payees/" + id);
                console.log("Payees: ", payeesResponse.data);
                setPayees(payeesResponse.data)

                const eventResponse = await backend.get("/invoices/invoiceEvent/" + id);
                setEvent(eventResponse.data)
                console.log("Description: ", eventResponse.data);
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

                    <InvoiceDescription
                        description={event ? event.description : "N/A"}
                    ></InvoiceDescription>

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
