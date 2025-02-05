import { format } from 'date-fns';
import React, { useState } from 'react';
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";

import {
    Button,
    Flex,
    Card,
    Box,
    Text,
    Select,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td
} from '@chakra-ui/react';

export const InvoiceDescription = ({ description }) => {
    return (
        <Flex direction="row" width="100%" alignItems="center">
            <Text fontSize="clamp(1rem, 1.5rem, 2rem)" color="#474849" fontWeight="bold" marginRight="0.5rem">
                Program:
            </Text>
            <Text fontSize="clamp(.75rem, 1.25rem, 1.75rem)" color="#474849">
                {description}
            </Text>
        </Flex>
    );
};

export const InvoiceStats = ({ name, email, amountDue, billingPeriod }) => {
    const formatDate = (isoDate) => {
        const date = new Date(isoDate);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric"
        });
    }

    return (
        <Flex direction="row" h="auto" w="100%" gap="2rem">
            {/* Billed To Section */}
            <Card
                flex={1}
                h="7em"
                width="25%"
                borderRadius={15}
                borderWidth="1px"
                boxShadow="none"
                display="flex"
                justifyContent="center"
                p={4}
                color="#D2D2D2"
            >
                <Text fontSize="clamp(1rem, 1.5rem, 2rem)" fontWeight="bold" color="#474849"> Billed to: </Text>
                <Text fontSize="clamp(.75rem, 1.25rem, 1.75rem)" color="#474849"> {name} </Text>
                <Text fontSize="clamp(.75rem, 1.25rem, 1.75rem)" color="#474849"> {email} </Text>
            </Card>


            {/* Invoice Details Section */}
            <Card
                flex={3}
                h="7em"
                borderRadius={15}
                borderWidth="1px"
                color="#D2D2D2"
                boxShadow="none"
                width="75%"
                padding="1.5em"
                display="flex"
                flexDirection="column"
                justifyContent="center"
            >
                <Flex width="100%" justifyContent="space-between">
                    <Box>
                        <Text fontWeight="bold" fontSize="clamp(1rem, 1.5rem, 2rem)" color="#474849"> Billing Period </Text>
                        <Text color="#474849" fontSize="clamp(.75rem, 1.25rem, 1.75rem)">
                            {formatDate(billingPeriod["startDate"])} - {formatDate(billingPeriod["endDate"])}
                        </Text>
                    </Box>
                    <Box>
                        <Text fontWeight="bold" fontSize="clamp(1rem, 1.5rem, 2rem)" color="#474849"> Amount Due </Text>
                        <Text color="#474849" fontSize="clamp(.75rem, 1.25rem, 1.75rem)"> ${amountDue ? amountDue.toFixed(2) : "N/A"} </Text>
                    </Box>
                    <Box>
                        <Text fontWeight="bold" fontSize="clamp(1rem, 1.5rem, 2rem)" color="#474849"> Remaining Balance </Text>
                        <Text color="#474849" fontSize="clamp(.75rem, 1.25rem, 1.75rem)"> $20.00 </Text>
                    </Box>
                </Flex>
            </Card>
        </Flex>
    );
};

export const InvoicePayments = ({ comments }) => {
    const [commentsPerPage, setCommentsPerPage] = useState(3);
    const [currentPageNumber, setCurrentPageNumber] = useState(1);

    const totalPages = Math.ceil(comments.length / commentsPerPage);
    const currentPageComments = comments.slice(
        (currentPageNumber - 1) * commentsPerPage, currentPageNumber * commentsPerPage
    );

    const handleCommentsPerPageChange = (event) => {
        setCommentsPerPage(Number(event.target.value));
        setCurrentPageNumber(1);
    };

    const handlePrevPage = () => {
        if (currentPageNumber > 1) {
            setCurrentPageNumber(currentPageNumber - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPageNumber < totalPages) {
            setCurrentPageNumber(currentPageNumber + 1);
        }
    };

    return (
        <Flex direction="column" w="100%">
            <Text fontWeight="bold" fontSize="clamp(.75rem, 1.25rem, 1.75rem)">
                Comments
            </Text>

            <Flex
                borderRadius={15}
                borderWidth=".07em"
                borderColor="#E2E8F0"
                p={3}
            >
                <Table
                    variant="striped"
                    color="#EDF2F7"
                >
                    <Thead>
                        <Tr>
                            <Th fontSize="clamp(.5rem, 1rem, 1.5rem)"> Date </Th>
                            <Th fontSize="clamp(.5rem, 1rem, 1.5rem)"> Comment </Th>
                            <Th fontSize="clamp(.5rem, 1rem, 1.5rem)"> Amount </Th>
                        </Tr>
                    </Thead>
                    <Tbody color="#2D3748">
                        {Array.isArray(comments) && comments.length > 0 ? (
                            currentPageComments.map((comment) => (
                                <Tr key={comment.id}>
                                    <Td fontSize="clamp(.75rem, 1.25rem, 1.75rem)">
                                        {format(new Date(comment.datetime), 'M/d/yy')}
                                    </Td>
                                    <Td fontSize="clamp(.75rem, 1.25rem, 1.75rem)">
                                        {comment.comment}
                                    </Td>
                                    <Td fontSize="clamp(.75rem, 1.25rem, 1.75rem)" fontWeight="bold">
                                        ${comment.adjustmentValue ? Number(comment.adjustmentValue).toFixed(2) : "N/A"}
                                    </Td>
                                </Tr>))
                        ) : (
                            <Tr>
                                <Td colSpan={3}>No comments available.</Td>
                            </Tr>
                        )}
                    </Tbody>


                </Table>
                {/* </TableContainer> */}
            </Flex>
            <Flex direction="row" width="100%" alignItems="center">
                <Text fontSize="clamp(.75rem, 1.25rem, 1.75rem)" marginRight="0.5rem"> Show: </Text>
                <Select width="auto" marginRight="0.5rem" value={commentsPerPage} onChange={handleCommentsPerPageChange}>
                    <option value={3}>3</option>
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                </Select>
                <Text>per page</Text>
                <Flex direction="row" marginLeft="auto" alignItems="center">
                    <Text fontSize="clamp(.75rem, 1.25rem, 1.75rem)" marginRight="1rem"> {currentPageNumber} of {totalPages < 1 ? 1 : totalPages} </Text>
                    <Button onClick={handlePrevPage} isDisabled={currentPageNumber === 1} borderLeftRadius={30}>
                        <FaAngleLeft></FaAngleLeft>
                    </Button>
                    <Button onClick={handleNextPage} isDisabled={currentPageNumber === totalPages} borderRightRadius={30}>
                        <FaAngleRight></FaAngleRight>
                    </Button>
                </Flex>
            </Flex>
        </Flex>
    );
}
