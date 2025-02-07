import { Text, Box, Stack, Table, HStack, Tr, Thead, Th, TableContainer, Tbody, Td, Flex, Button, Input, IconButton, Image, InputGroup, InputRightElement, Heading, useToast } from "@chakra-ui/react";
import { DownloadIcon, SearchIcon } from "@chakra-ui/icons";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import Navbar from "../Navbar";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from 'react-router-dom' 
import { InvoicesTable, InvoicesFilter } from "./InvoiceComponents";


function InvoicesDashboard(){
  const toast = useToast()
  const navigate = useNavigate();
  const { backend } = useBackendContext();
  const [invoices, setInvoices] = useState([]);
  const [query, setQuery] = useState('');
  const hasShownToast = useRef(false);
  const [filter, setFilter] = useState({
    startDate : "",
    endDate : "",
    status : "all",
    instructor : "all",
    payee : "all"
  })

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

    const getUnpaidInvoices = () => {
      const filteredPastDueInvoices = filteredInvoices.filter(invoice => isPaid(invoice) === "Past Due");
      const notifCounter = filteredPastDueInvoices.length;
  
      if (notifCounter > 0) {
        hasShownToast.current = true; // Set ref to true to prevent multiple toasts
        toast({
          title: "Unpaid Invoices",
          description: notifCounter > 1
            ? `You have ${notifCounter} past due invoices`
            : `${filteredPastDueInvoices[0].name} - ${filteredPastDueInvoices[0].endDate.split("T")[0]}`,
          status: "error",
          duration: 9000,
          position: "bottom-right",
          isClosable: true,
          render: () => (
            <Box p={3} bg="#FED7D7" borderTop="4px solid" borderTopColor="red.500" onClick={() => navigate("/notification")}>
              <Heading size="sm">Unpaid Invoices</Heading>
              {notifCounter > 1 
                ? `You have ${notifCounter} past due invoices` 
                : `${filteredPastDueInvoices[0].name} - 
                  ${new Date(filteredPastDueInvoices[0].endDate).toLocaleDateString("en-US", {month: "2-digit", day: "2-digit", year: "2-digit",})}`
              }
            </Box>
          ),
        });
      }
    };
  
    getUnpaidInvoices();
  }, [invoices]);

  const filteredInvoices = invoices
    .filter(invoice => invoice.eventName.toLowerCase().includes(query.toLowerCase()))
    .filter(invoice => {

      // Exclude invoices where the role is "instructor"
      if (invoice.role === "instructor") return false;
      
      // Status filter
      if (filter.status !== 'all' && isPaid(invoice).toLowerCase() !== filter.status.toLowerCase()) return false;

      // Instructor filter
      // Filters for events that have an instructor, and gets the event while ensuring only showing a single events even if they have both instructor and payee
      if (filter.instructor.toLowerCase() !== 'all' && invoice.role !== "instructor" && !invoices.some(inv => inv.eventName === invoice.eventName && inv.role === "instructor" && inv.name.toLowerCase() === filter.instructor.toLowerCase()))
        return false; 

      //Payee filter
      if (filter.payee.toLowerCase() !== 'all' && invoice.role === "payee" && invoice.name.toLowerCase() !== filter.payee.toLowerCase()) return false;

      // Date range filters
      if (filter.startDate && new Date(invoice.endDate) < new Date(filter.startDate)) return false;
      if (filter.endDate && new Date(invoice.endDate) > new Date(new Date(filter.endDate).setDate(new Date(filter.endDate).getDate() + 1))) return false; //to make date range inclusive

      return true; 
  });





  return(
    <Navbar>
      <Flex minH="100vh">
        <Flex w='100vw' m='120px 40px' flexDirection='column' padding="48px">
          <Flex justifyContent='space-between' mb='40px'>
            {/* <Button backgroundColor='transparent' border="1px solid rgba(71, 72, 73, 0.20)" borderRadius='15px' h='48px'> */}
              <InvoicesFilter filter={filter} setFilter={setFilter} invoices={invoices} />
            {/* </Button> */}
            
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

          <InvoicesTable filteredInvoices={filteredInvoices} isPaidColor={isPaidColor} isPaid={isPaid}/>
        </Flex>
      </Flex>
    </Navbar>
  );
}

export { InvoicesDashboard }