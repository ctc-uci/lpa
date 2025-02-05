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
    TableContainer,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td
} from '@chakra-ui/react';


export const InvoiceStats = ({ name, email, amountDue, padding, height, width, headerSize, textSize, color }) => {
    return (
        <Flex direction="row" height={height} width={width} gap="2rem">
            {/* Billed To Section */}
            {/* <Card
        flex={1}
        h="7em"
        borderRadius={15}
        borderWidth=".07em"
        color="#D2D2D2"
        boxShadow="none"
        display="flex"
        justifyContent="center"
        p={4}
      >
        <Text fontWeight="bold" fontSize="22px" color="#474849">Billed to:</Text>
        <Text fontSize="20px" color="#474849">{name}</Text>
        <Text fontSize="20px" color="#474849">{email}</Text>
      </Card> */}
            <Card
                width="25%"
                padding={padding}
                borderRadius="15px"
                borderWidth="1px"
                color="#D2D2D2"
            >
                <Text fontSize={headerSize} fontWeight="bold" color={color}> Billed to: </Text>
                <Text fontSize={textSize} color={color}> {name} </Text>
                <Text fontSize={textSize} color={color}> {email} </Text>
            </Card>


            {/* Invoice Details Section */}
            {/* <Card
        flex={3}
        h="7em"
        borderRadius={15} 
        borderWidth=".07em"
        color="#D2D2D2"
        boxShadow="none"

        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="flex-start"
        p={4}
      >
        <Flex w="100%" justifyContent="space-between">
          <Box>
            <Text fontWeight="bold" fontSize="22px" color="#474849">Billing Period</Text>
            <Text color="#474849" fontSize="20px" >Jan 1 - Jan 31</Text>
          </Box>

          <Box>
            <Text fontWeight="bold" fontSize="22px" color="#474849">Amount Due</Text>
            <Text color="#474849" fontSize="20px" >$100.00</Text>
          </Box>

          <Box>
            <Text fontWeight="bold" fontSize="22px" color="#474849">Remaining Balance</Text>
            <Text color="#474849" fontSize="20px" >$20.00</Text>
          </Box>
        </Flex>
      </Card> */}
            <Card
                width="75%"
                padding={padding}

                display="flex"
                flexDirection="column"
                justifyContent="center"

                borderRadius="15px"
                borderWidth="1px"
                color="#D2D2D2"
            >
                <Flex width="100%" justifyContent="space-between">
                    <Box>
                        <Text fontWeight="bold" fontSize={headerSize} color={color}> Billing Period </Text>
                        <Text color={color} fontSize={textSize}> Jan 1 - Jan 31 </Text>
                    </Box>
                    <Box>
                        <Text fontWeight="bold" fontSize={headerSize} color={color}> Amount Due </Text>
                        <Text color={color} fontSize={textSize}> ${amountDue} </Text>
                    </Box>
                    <Box>
                        <Text fontWeight="bold" fontSize={headerSize} color={color}> Remaining Balance </Text>
                        <Text color={color} fontSize={textSize}> $20.00 </Text>
                    </Box>
                </Flex>
            </Card>
        </Flex>
    );
};

export const InvoicePayments = ({ comments, height, width, headerSize, textSize, gap }) => {
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
        <Flex direction="column" height={height} width={width} gap={gap}>
            <Text fontWeight="bold" fontSize={headerSize}>
                Comments
            </Text>
            <TableContainer
                borderRadius="12px"
                borderWidth="1px"
                borderColor="#E2E8F0"
            >
                <Table
                    variant="striped"
                    color="#EDF2F7"
                >
                    <Thead>
                        <Tr>
                            <Th fontSize={textSize}> Date </Th>
                            <Th fontSize={textSize}> Comment </Th>
                            <Th fontSize={textSize}> Amount </Th>
                        </Tr>
                    </Thead>
                    <Tbody color="#2D3748">
                        {Array.isArray(comments) && comments.length > 0 ? (
                            currentPageComments.map((comment) => (
                                <Tr key={comment.id}>
                                    <Td fontSize={textSize}>
                                        {format(new Date(comment.datetime), 'M/d/yy')}
                                    </Td>
                                    <Td fontSize={textSize}>
                                        {comment.comment}
                                    </Td>
                                    <Td fontSize={textSize} fontWeight="bold">
                                        ${Number(comment.adjustmentValue).toFixed(2)}
                                    </Td>
                                </Tr>))
                        ) : (
                            <Tr>
                                <Td> No comments available. </Td>
                            </Tr>
                        )}
                    </Tbody>
                </Table>
            </TableContainer>
            <Flex direction="row" width="100%" alignItems="center">
                <Text fontSize={textSize} marginRight="0.5rem"> Show: </Text>
                <Select width="auto" marginRight="0.5rem" value={commentsPerPage} onChange={handleCommentsPerPageChange}>
                    <option value={3}>3</option>
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                </Select>
                <Text>per page</Text>
                <Flex direction="row" marginLeft="auto" alignItems="center">
                    <Text fontSize={textSize} marginRight="1rem"> {currentPageNumber} of {totalPages} </Text>
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


// export const InvoicePayments = ({ comments }) => {
//   const [pageSize, setPageSize] = useState(3);
//   const [currentPage, setCurrentPage] = useState(1);

//   const handlePageSizeChange = (event) => {
//     setPageSize(Number(event.target.value)); n
//     setCurrentPage(1);
//   };

//   const totalPages = Math.ceil(comments.length / pageSize);
//   const paginatedComments = comments.slice((currentPage - 1) * pageSize, currentPage * pageSize);


//   const handleNextPage = () => {
//     if (currentPage < totalPages) {
//       setCurrentPage(currentPage + 1);
//     }
//   };

//   const handlePrevPage = () => {
//     if (currentPage > 1) {
//       setCurrentPage(currentPage - 1);
//     }
//   };


//   return (
//     <>
//     <Flex
//       w="100%"
//         borderRadius={15}
//         borderWidth=".07em"
//         borderColor="#D2D2D2"
//         p={3}
//       >
//         <Table
//           variant="striped"
//           color="$EDF2F7"
//         >
//           <Thead>
//             <Tr>
//               <Th>Date</Th>
//               <Th>Comment</Th>
//               <Th>Amount</Th>
//             </Tr>
//           </Thead>
//           <Tbody>
// {Array.isArray(comments) && comments.length > 0 ? (
//   paginatedComments.map((comment) => (
//     <Tr key={comment.id}>
//       <Td>{format(new Date(comment.date), 'M/d/yy')}</Td>
//       <Td>{comment.comment}</Td>
//       <Td fontWeight="bold">{comment.amount}</Td>
//     </Tr>
//   ))
// ) : (
//   <Tr>
//     <Td colSpan="3">No comments available.</Td>
//   </Tr>
// )}

//           </Tbody>
//         </Table>

//       </Flex>

//       {/* pagination */}
//       <Flex w="100%" justifyContent="space-between">
//         <Flex align="center">
//           <Text mr={3}>Show: </Text>
//           <Select value={pageSize} onChange={handlePageSizeChange} width="auto">
//             <option value={3}>3</option>
//             <option value={5}>5</option>
//             <option value={10}>10</option>
//             <option value={20}>20</option>
//           </Select>
//           <Text ml={3}>per page</Text>
//         </Flex>

//         <Flex align="center" >
//           <Text mr={3}>{currentPage} of {totalPages}</Text>
//   <Button onClick={handlePrevPage} isDisabled={currentPage === 1} borderLeftRadius={30} >
//     Prev
//   </Button>
//   <Button onClick={handleNextPage} isDisabled={currentPage === totalPages} borderRightRadius={30}>
//     Next
//   </Button>
//         </Flex>
//       </Flex>


// </>
//   );
// };
