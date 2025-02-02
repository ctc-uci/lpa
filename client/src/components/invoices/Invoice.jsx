import {
  Heading,
  VStack,
  Text,
  Flex,
  Button,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import { InvoicesTable, InvoicesStats } from "./InvoiceComponents";
import React, { useState, useEffect } from 'react';

import Navbar from "../Navbar";

import {
  useNavigate,
  useParams,

} from "react-router-dom";

import { useBackendContext } from "../../contexts/hooks/useBackendContext";

import { FiEdit } from "react-icons/fi";
import { FaAngleLeft } from "react-icons/fa6";



export const Invoice = () => {
  const { id }= useParams()
  const { backend } = useBackendContext();
  const navigate = useNavigate();
  const payeeName = "Aya De Leon"
  const payeeEmail = "payee@gmail.com"

  const [ comments, setComments ] = useState([]);

  const [ total, setTotoal ] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const commentsResponse = await backend.get('/comments/paidInvoices' + id);
        // TODO
        console.log("COMMENTS: ", commentsResponse.data)
        setComments(commentsResponse.data);

        const totalResponse = await backend.get('/invoices/total' + id);
        console.log("TOTAL: ", commentsResponse)
        setTotoal(commentsResponse.total);


      } catch (error) {
        console.error("Error getting comments:", error);
      }
    };
    fetchData();
  }, [backend]);




  const handleBackClick = () => {
    navigate("/invoices");
  };

  return (

    <Navbar>
    <VStack
      spacing={8}
      sx={{ width: 950, marginX: "auto" }}

    >

      {/* back button */}
      <Flex w="115%" justifyContent="flex-start" mt={50}>
        <IconButton
          icon={<FaAngleLeft />}
          onClick={handleBackClick}
          variant="link"
          color="#474849"
          fontSize="30px"
        />
      </Flex>

      {/* title and buttons */}
      <Flex w="100%" justifyContent="space-between" alignItems="center" pt={5}>
      <Heading color="#4E4AE7">Invoice Details</Heading>
      <Flex gap={7}>
        <Button backgroundColor='#4E4AE7' color='#FFF' borderRadius={30} gap={1}>
          <FiEdit/> Edit
        </Button>
        <Button backgroundColor='#4E4AE7' color='#FFF' borderRadius={30}>Preview</Button>
      </Flex>
      </Flex>

      {/* description */}
      <Flex w="100%" alignItems="center">
        <Text fontWeight="bold" fontSize="22px" color="#474849" mr={2}>Program:</Text>
        <Text fontSize="20px" color="#474849">
          Immigrant Rights Solidarity Week: Become an Immigration Rights Ambassador Workshop
        </Text>
      </Flex>

      {/* invoice stats */}
      <InvoicesStats name={payeeName} email={payeeEmail}/>

      {/* invoice table */}
      <Flex w="100%" alignItems="center">
        <Text fontWeight="bold" fontSize="22px" color="#474849">Comments</Text>
      </Flex>
      <InvoicesTable comments={comments} />

    </VStack>
    </Navbar>
  );
}
