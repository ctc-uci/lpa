import { Text, Flex, Input, Image, InputGroup, InputRightElement, Heading, useToast, Spacer, Box } from "@chakra-ui/react";
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
    if (invoices.length === 0) return;

    const getUnpaidInvoices = () => {
      // Only show toast once when the page loads, not on filter changes
      if (hasShownToast.current) return;

      const filteredPastDueInvoices = filteredInvoices.filter(invoice => getPaymentStatus(invoice) === "Past Due");
      const notifCounter = filteredPastDueInvoices.length;

      if (notifCounter > 0) {
        hasShownToast.current = true; // Set ref to true to prevent multiple toasts

        toast({
          title: "Unpaid Invoices",
          status: "error",
          duration: 9000,
          position: "bottom-right",
          isClosable: true,
          render: () => (
            <Flex
              width="375px"
              height="63px"
              padding="0"
              alignItems="center"
              borderRadius="6px"
              borderLeft="4px solid var(--red-500, #E53E3E)"
              bg="var(--red-100, #FED7D7)"
              onClick={() => navigate("/notification")}
              position="relative"
            >
              <Flex padding="0 0 0 16px" alignItems="center" height="100%">
                <Image src={AlertIcon} />
                <Flex flexDirection="column" justifyContent="center">
                  <Heading
                    fontFamily="Inter"
                    fontSize="16px"
                    fontWeight="700"
                    lineHeight="normal"
                    letterSpacing="0.08px"
                    mb="2px"
                  >
                    Unpaid Invoices
                  </Heading>
                  <Text fontSize="14px">
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
              <Spacer />
              <Box
                position="absolute"
                right="102px"
                height="100%"
                width="1px"
                borderLeft="1px solid var(--red-500, #E53E3E)"
              />
              <Flex
                width="102px"
                height="100%"
                padding="0"
                justifyContent="center"
                alignItems="center"
                flexShrink="0"
              >
                <Text
                  color="#EA4335"
                  fontFamily="Inter"
                  fontSize="16px"
                  fontWeight="700"
                  lineHeight="normal"
                  letterSpacing="0.08px"
                >
                  View
                </Text>
              </Flex>
            </Flex>
          ),
        });
      }
    };

    getUnpaidInvoices();
  }, [invoices]); // Only depend on invoices initial load, not filteredInvoices

  // Search functionality
  useEffect(() => {
    if (!query || query.trim() === '') {
      // If query is empty, don't filter - show complete list from filter component
      return;
    }

    const lowercaseQuery = query.toLowerCase();
    // Only filter based on program name (eventName)
    const results = invoices.filter(invoice =>
      invoice.eventName.toLowerCase().includes(lowercaseQuery)
    );

    setFilteredInvoices(results);
  }, [query, invoices]);

  return(
    <Navbar>
      <Flex w='95%' m='50px 40px' flexDirection='column' padding="20px" border="1px solid var(--medium-light-grey)" borderRadius="12px">
        <Flex justifyContent='space-between' alignItems='center' mb='40px'>
          {/* <InvoicesFilter filter={filter} setFilter={setFilter} invoices={invoices} /> */}
          <InvoiceFilter invoices={invoices} setFilteredInvoices={setFilteredInvoices}/>
          <InputGroup
            w='311px'
            h='40px'
            border='1px solid var(--Secondary-3, #E2E8F0)'
            borderRadius='6px'
            display='flex'
            alignItems='center'
          >
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              bgColor="var(--Secondary-1, #F7FAFC)"
              borderRadius='6px 0px 0px 6px'
              padding='12px 16px'
              fontFamily='Inter'
              fontSize='14px'
              fontWeight='400'
              lineHeight='normal'
              letterSpacing='0.07px'
              color='var(--Secondary-6, #718096)'
              height='100%'
              border='none'
              _placeholder={{
                color: 'var(--Secondary-6, #718096)'
              }}
            />
            <InputRightElement
              h='100%'
              bgColor="#EDF2F7"
              borderRadius='0px 6px 6px 0px'
              display='flex'
              alignItems='center'
              justifyContent='center'
              cursor='pointer'
              onClick={() => {
                // Simple program name search on icon click
                if (!query || query.trim() === '') return;

                const lowercaseQuery = query.toLowerCase();
                const results = invoices.filter(invoice =>
                  invoice.eventName.toLowerCase().includes(lowercaseQuery)
                );
                setFilteredInvoices(results);
              }}
            >
              <SearchIcon color='#767778'/>
            </InputRightElement>
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
