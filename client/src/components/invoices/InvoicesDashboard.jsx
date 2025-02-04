import { Text, Box, Stack, Table, HStack, Tr, Thead, Th, TableContainer, Tbody, Td, Flex, Button, Input, IconButton, Image, InputGroup, InputRightElement} from "@chakra-ui/react";
import filterIcon from  "../../assets/logo/filter.svg";
import { DownloadIcon, SearchIcon } from "@chakra-ui/icons";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import Navbar from "../Navbar";
import { useEffect, useState } from "react";
function InvoicesDashboard(){
  // const items = [
  //   { id: 1, name: "Dance Class", status: "Paid", payee: "John Adams", dateDue: "11/12/25" },
  //   { id: 2, name: "Coffee Maker", status: "Not Paid",payee: "Home Appliances", dateDue: "11/12/25"},
  //   { id: 3, name: "Desk Chair", status: "Past Due", payee: "Furniture", dateDue: "11/12/25"},
  //   { id: 4, name: "Smartphone", status: "Paid", payee: "Electronics", dateDue: "11/12/25" },
  //   { id: 5, name: "Headphones", status: "Paid", payee: "Accessories", dateDue: "11/12/25" },
  // ]

  const { backend } = useBackendContext();
  const [invoices, setInvoices] = useState([]);


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
    // const fetchEventsData = asynnc () => {
    //   const 
    // }

    fetchInvoicesData();
  }, []);


  return(
    <Flex minH="100vh">
      <Navbar style={{display: 'flex', h: "100vh"}}/>
      <Flex 
       w='100vw'
       justifyContent='center'
       flexDirection='column'
       padding="48px"
      >
        <Flex justifyContent='space-between' mb='40px'>
          <Button backgroundColor='transparent' border="1px solid rgba(71, 72, 73, 0.20)" borderRadius='15px' h='48px'>
            <Image src={filterIcon} alt="Filter" boxSize="24px" mt='4px'/>Filter
          </Button>
          <InputGroup w='400px' borderColor='transparent' >
          <InputRightElement pointerEvents='none' bgColor="rgba(71, 72, 73, 0.20)" borderRadius='0px 15px 15px 0px'>
            <SearchIcon color='#767778'/>
          </InputRightElement>
            <Input icon={SearchIcon} borderColor='gray.100' borderRadius='15px 15px 15px 15px' placeholder="Search..."/>
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
              {invoices.map((invoices, index) => (
                <Tr key={index}>
                  <Td textAlign='center'>{invoices.eventName}</Td>
                  <Td 
                    textAlign='center'
                    bg = {
                      // invoices.isSent === true ? "#6CE65C" : invoices.isSent === "Not Paid" 
                      // ? "grey.100" : invoices.isSent === "Past Due" 
                      // ? "#FF4D4D" : "transparent"
                      // }
                      invoices.isSent === true ? "#6CE65C" : "gray.100"
                      }
                  >
                    {invoices.isSent ? "Paid" : "Not Paid"}
                    </Td>
                  <Td textAlign='center'>{invoices.name}</Td>
                  <Td textAlign='center'>{invoices.endDate.substring(0, invoices.endDate.indexOf("T"))}</Td>
                  <Td><Flex justifyContent = "center"><IconButton icon={<DownloadIcon boxSize='20px'/>} backgroundColor='transparent' >DownloadIcon</IconButton></Flex></Td>
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