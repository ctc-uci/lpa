import { Text, Box, Stack, Table, HStack, Tr, Thead, Th, TableContainer, Tbody, Td, Flex, Button, Input, IconButton, Image, InputGroup, InputRightElement, Heading} from "@chakra-ui/react";
import filterIcon from  "../../assets/logo/filter.svg";
import { DownloadIcon, SearchIcon } from "@chakra-ui/icons";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import Navbar from "../Navbar";
import { useToast } from '@chakra-ui/react'
import { useEffect, useState, useRef } from "react";
import { useNavigate } from 'react-router-dom' 
import PDFButtonInvoice from "./PDFButtonInvoice"


function InvoicesDashboard(){
  const toast = useToast()
  const navigate = useNavigate();
  const { backend } = useBackendContext();
  const [invoices, setInvoices] = useState([]);
  const [query, setQuery] = useState('');
  const hasShownToast = useRef(false);

  const isPaidColor = (invoice) => {
    if (invoice.isSent && invoice.paymentStatus === "full") {
        return "#6CE65C";
    } 
    if (!invoice.isSent && new Date() < new Date(invoice.endDate) && invoice.paymentStatus !== "full") {
        return "transparent";
    } 
    return "#FF4D4D"; 
  };

  const isPaid = (invoice) => {
    if (invoice.isSent && invoice.paymentStatus === "full") {
        return "Paid";
    } 
    if (!invoice.isSent && new Date() < new Date(invoice.endDate) && invoice.paymentStatus !== "full") {
        return "Not Paid";
    } 
    return "Past Due"; 
  };

  
  useEffect(() => {
    const fetchInvoicesData = async () => {
      try {
        const invoicesResponse = await backend.get("/invoicesAssignments/");
        setInvoices(invoicesResponse.data);
      }
      catch (err) {
        console.log(err);
      }
    }
    fetchInvoicesData();
  }, []);

  useEffect(() => {
    if (invoices.length === 0 || hasShownToast.current) return; 
    
    const callToast = () => {
      toast({
        title: "Unpaid Invoices",
        description: notifCounter > 1
          ? `You have ${notifCounter} past due invoices`
          : `${pastDueInvoices[0].name} - ${pastDueInvoices[0].endDate.split("T")[0]}`,
        status: "error",
        duration: 9000,
        position: "bottom-right",
        isClosable: true,
        render: () => (
          <Box p={3} bg="#FED7D7" borderTop="4px solid" borderTopColor="red.500" onClick={() => navigate("/notification")}>
            <Heading size="sm">Unpaid Invoices</Heading>
            {notifCounter > 1 
              ? `You have ${notifCounter} past due invoices` 
              : `${pastDueInvoices[0].name} - 
                ${new Date(pastDueInvoices[0].endDate).toLocaleDateString("en-US", {month: "2-digit", day: "2-digit", year: "2-digit",})}`
            }
          </Box>
        ),
      });
    }

    const getUnpaidInvoices = () => {
      const pastDueInvoices = invoices.filter(invoice => isPaid(invoice) === "Past Due");
      const notifCounter = pastDueInvoices.length;
  
      if (notifCounter > 0) {
        hasShownToast.current = true; // Set ref to true to prevent multiple toasts
  
        callToast();
      }
    };
  
    getUnpaidInvoices();
  }, [invoices]);


  return(
    <Flex minH="100vh">
      <Navbar style={{display: 'flex', h: "100vh"}}/>
      <Flex w='100vw' m='120px 40px' flexDirection='column' padding="48px">
        <Flex justifyContent='space-between' mb='40px'>
          <Button backgroundColor='transparent' border="1px solid rgba(71, 72, 73, 0.20)" borderRadius='15px' h='48px'>
            <Image src={filterIcon} alt="Filter" boxSize="24px" mt='4px'/>Filter
          </Button>
          
          <InputGroup w='400px' borderColor='transparent' >
          <InputRightElement pointerEvents='none' bgColor="rgba(71, 72, 73, 0.20)" borderRadius='0px 15px 15px 0px'>
            <SearchIcon color='#767778'/>
          </InputRightElement>
            <Input 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              icon={SearchIcon} borderColor='gray.100' 
              borderRadius='15px 15px 15px 15px' 
              placeholder="Search..."
            />
          </InputGroup>
        </Flex>
        <TableContainer paddingTop="8px" border='1px solid var(--gray-200, #E2E8F0)' borderRadius='12px' >
          
          <Table variant='simple'>
            <Thead>
              <Tr>
                <Th textAlign='center'>Program</Th>
                <Th textAlign='center'>Status</Th>
                <Th textAlign='center'>Payee</Th>
                <Th textAlign='center'>Date Due</Th>
                <Th textAlign='center'>Download</Th>
              </Tr>
            </Thead>
            <Tbody>
              {invoices
                .filter(invoice => invoice.eventName.toLowerCase().includes(query.toLowerCase()))
                .map((invoice, index) => (
                <Tr key={index}>
                  <Td textAlign='center'>{invoice.eventName}</Td>
                  <Td 
                    textAlign='center'
                    bg = {isPaidColor(invoice)}
                  >
                    {isPaid(invoice)}
                    </Td>
                  <Td textAlign='center'>{invoice.name}</Td>
                  <Td textAlign="center">
                    {new Date(invoice.endDate).toLocaleDateString("en-US", {
                      month: "2-digit",
                      day: "2-digit",
                      year: "numeric",
                    })}
                  </Td>
                  <Td>
                    <Flex justifyContent = "center">
                      <PDFButtonInvoice invoice={invoice} />
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Flex>
    </Flex>
  );
}

export { InvoicesDashboard }