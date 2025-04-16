import { Text, Flex, Input, Image, InputGroup, InputRightElement, Heading, useToast } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import Navbar from "../navbar/Navbar";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from 'react-router-dom'
import { InvoicesTable, InvoicesFilter } from "./InvoiceComponents";
import AlertIcon from "../../assets/alertIcon.svg"


const InvoicesDashboard = () => {
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
        return "#474849";
    }
    if (!invoice.isSent && new Date() < new Date(invoice.endDate) && invoice.paymentStatus !== "full") {
        return "none";
    }
    return "#90080F";
  };

  const seasonColor = (invoice) => {
    if (invoice.season === "Winter") {
      return ["#EBF8FF", "#3182CE"];
    } else if (invoice.season === "Summer") {
      return ["#FFF5F7", "#D53F8C"];
    } else if (invoice.season === "Fall") {
      return ["#FFFAF0", "#DD6B20"];
    } else {
      return ["#008000", "#22C55E"];
    }
  }

  const getSeason = (invoice) => {
    const month = new Date(invoice.endDate).getMonth();
    if (month >= 1 && month <= 4) {
      return "Winter";
    } else if (month >= 5 && month <= 8) {
      return "Summer";
    } else if (month >= 9 && month <= 12) {
      return "Fall";
    } else {
      return "N/A";
    }
  }

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
            isPaid: isPaid(invoice)
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
      const filteredPastDueInvoices = filteredInvoices.filter(invoice => isPaid(invoice) === "PAST DUE");
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
            <Flex p={3} bg="#FED7D7" borderTop="4px solid" borderTopColor="red.500" onClick={() => navigate("/notification")} padding="12px 16px" gap='12px' w='400px'>
              <Image src={AlertIcon} />
              <Flex flexDirection='column'>
                <Heading size="sm" align-self='stretch'>Unpaid Invoices</Heading>
                <Text align-self='stretch'>

                {notifCounter > 1
                  ? `You have ${notifCounter} past due invoices`
                  : `${filteredPastDueInvoices[0].name} -
                  ${new Date(filteredPastDueInvoices[0].endDate).toLocaleDateString("en-US", {month: "2-digit", day: "2-digit", year: "2-digit",})}`
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
      <Flex w='95%' m='50px 40px' flexDirection='column' padding="20px" border="1px solid var(--medium-light-grey)" borderRadius="12px"> 
        <Flex justifyContent='space-between' mb='40px'>
          <InvoicesFilter filter={filter} setFilter={setFilter} invoices={invoices} />

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
        <InvoicesTable filteredInvoices={filteredInvoices} isPaidColor={isPaidColor} seasonColor={seasonColor}/>
        
      </Flex>
    </Navbar>
  );
}

export { InvoicesDashboard }
