import { Text, Flex, Input, Image, InputGroup, InputRightElement, Heading, useToast } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import Navbar from "../navbar/Navbar";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from 'react-router-dom'
import { InvoicesTable, InvoicesFilter } from "./InvoiceComponents";
import AlertIcon from "../../assets/alertIcon.svg"
import { InvoiceFilter } from "../filters/InvoicesFilter";
import { getPaymentStatus, getPaymentStatusColor, getSeason, getSeasonColors, formatDate } from "../../utils/invoiceUtils";


const InvoicesDashboard = () => {
  const toast = useToast()
  const navigate = useNavigate();
  const { backend } = useBackendContext();
  const [invoices, setInvoices] = useState([]);
  const [query, setQuery] = useState('');
  const hasShownToast = useRef(false);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [filter, setFilter] = useState({
    startDate : "",
    endDate : "",
    status : "all",
    instructor : "all",
    payee : "all"
  })

  useEffect(() => {
    const fetchInvoicesData = async () => {
      try {
        const invoicesResponse = await backend.get("/invoicesAssignments/");
        const groupedInvoices = invoicesResponse.data.reduce((acc, invoice) => {
          const key = `${invoice.eventName}-${invoice.endDate}-${invoice.isSent}`;
          if (invoice.role === "instructor") return acc;
          if (!acc[key]) {
              // Create a new entry with a payers array
              acc[key] = {
                  ...invoice,
                  payers: [invoice.name] // Store payers in an array
              };
          } else {
              // Append the payer only if it's not already in the list (avoid duplicates)
              if (!acc[key].payers.includes(invoice.name)) {
                  acc[key].payers.push(invoice.name);
              }
          }

          return acc;
        }, {});
        const invoices = Object.values(groupedInvoices).map(invoice => ({
            ...invoice,
            season: getSeason(invoice),
            isPaid: getPaymentStatus(invoice)
          }
        ));
        setInvoices(invoices);
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
      const filteredPastDueInvoices = filteredInvoices.filter(invoice => getPaymentStatus(invoice) === "Past Due");
      const notifCounter = filteredPastDueInvoices.length;

      if (notifCounter > 0) {
        hasShownToast.current = true; // Set ref to true to prevent multiple toasts
        toast({
          title: "Unpaid Invoices",
          description: notifCounter > 1
            ? `You have ${notifCounter} past due invoices`
            : `${filteredPastDueInvoices[0].name} - ${formatDate(filteredPastDueInvoices[0].endDate, {
                month: "2-digit", 
                day: "2-digit", 
                year: "2-digit"
              })}`,
          status: "error",
          duration: 9000,
          position: "bottom-right",
          isClosable: true,
          render: () => (
            <Flex p={3} bg="#FED7D7" borderTop="4px solid" borderTopColor="red.500" onClick={() => navigate("/notification")} padding="12px 16px" gap='12px' w='400px'>
              <Image src={AlertIcon} />
              <Flex flexDirection='column'>
                <Heading size="sm" align-self='stretch'>Unpaid Invoices</Heading>
                <Text align-self='stretch'>

                {notifCounter > 1
                  ? `You have ${notifCounter} past due invoices`
                  : `${filteredPastDueInvoices[0].name} -
                  ${formatDate(filteredPastDueInvoices[0].endDate, {
                    month: "2-digit", 
                    day: "2-digit", 
                    year: "2-digit"
                  })}`
                }
                </Text>
              </Flex>
            </Flex>
          ),
        });
      }
    };

    getUnpaidInvoices();
  }, [invoices]);

  return(
    <Navbar>
      <Flex w='95%' m='50px 40px' flexDirection='column' padding="20px" border="1px solid var(--medium-light-grey)" borderRadius="12px"> 
        <Flex justifyContent='space-between' mb='40px'>
          {/* <InvoicesFilter filter={filter} setFilter={setFilter} invoices={invoices} /> */}
          <InvoiceFilter invoices={invoices} setFilteredInvoices={setFilteredInvoices}/>

          <InputGroup w='400px' borderColor='transparent' >
            <InputRightElement pointerEvents='none' bgColor="#EDF2F7" borderRadius='0px 6px 6px 0px'>
              <SearchIcon color='#767778'/>
            </InputRightElement>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              icon={SearchIcon} borderColor='gray.100'
              bgColor="#F7FAFC"
              borderRadius='6px 0px 0px 6px'
              placeholder="Search..."
              textColor="#718096"
            />
          </InputGroup>
        </Flex>
        <InvoicesTable 
          filteredInvoices={filteredInvoices} 
          isPaidColor={getPaymentStatusColor} 
          seasonColor={getSeasonColors}
        />
        
      </Flex>
    </Navbar>
  );
}

export { InvoicesDashboard }
