import { useCallback, useEffect, useRef, useState, useMemo } from "react";

import { SearchIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useToast,
  HStack,
  ButtonGroup,
  Tooltip,
} from "@chakra-ui/react";

import { useNavigate } from "react-router-dom";

import AlertIcon from "../../assets/alertIcon.svg";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { InvoiceFilter } from "../filters/InvoicesFilter";
import { RoundedButton } from "../filters/FilterComponents";
import Navbar from "../navbar/Navbar";
import { SearchBar } from "../searchBar/SearchBar";
import { InvoicesFilter, InvoicesTable } from "./InvoiceComponents";

import "./Invoices.css";

const InvoicesDashboard = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const { backend } = useBackendContext();
  const [invoices, setInvoices] = useState([]);
  const [query, setQuery] = useState("");
  const hasShownToast = useRef(false);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [filterComponentResults, setFilterComponentResults] = useState([]);
  const [relevantInvoices, setRelevantInvoices] = useState(true);
  const [sortKey, setSortKey] = useState("title");
  const [sortOrder, setSortOrder] = useState("asc");

  const [filter, setFilter] = useState({
    startDate: "",
    endDate: "",
    status: "all",
    instructor: "all",
    payee: "all",
  });

  // Sort the filtered invoices
  const sortedInvoices = useMemo(() => {
    if (!filteredInvoices.length) return [];

    const sorted = [...filteredInvoices];
    if (sortKey === "title") {
      sorted.sort((a, b) => {
        const nameCompare = sortOrder === "asc"
          ? a.eventName.localeCompare(b.eventName)
          : b.eventName.localeCompare(a.eventName);
        if (nameCompare !== 0) return nameCompare;
        const aInvalid = !a.endDate || a.endDate === "N/A";
        const bInvalid = !b.endDate || b.endDate === "N/A";
        if (aInvalid && bInvalid) return 0;
        if (aInvalid) return 1;
        if (bInvalid) return -1;
        return new Date(a.endDate) - new Date(b.endDate);
      });
    } else if (sortKey === "date") {
      sorted.sort((a, b) => {
        const aInvalid = !a.endDate || a.endDate === "N/A";
        const bInvalid = !b.endDate || b.endDate === "N/A";
        if (aInvalid && bInvalid) return 0;
        if (aInvalid) return 1;
        if (bInvalid) return -1;
        const dateA = new Date(a.endDate);
        const dateB = new Date(b.endDate);
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      });
    } else if (sortKey === "status") {
      sorted.sort((a, b) => {
        const priority = {
          "Past Due": 0,
          "Not Paid": 1,
          Paid: 2,
        };
        return sortOrder === "asc"
          ? priority[b.isPaid] - priority[a.isPaid]
          : priority[a.isPaid] - priority[b.isPaid];
      });
    }
    return sorted;
  }, [filteredInvoices, sortKey, sortOrder]);

  const isPaidColor = (invoice) => {
    const paidStatus = isPaid(invoice);

    if (paidStatus === "Paid") {
      return "#474849";
    }

    if (paidStatus === "Not Paid") {
      return "none";
    }

    if (paidStatus === "Past Due") {
      return "#90080F";
    }
  };

  const seasonColor = (invoice) => {
    if (invoice.season === "Winter") {
      return ["#EBF8FF", "#3182CE"];
    } else if (invoice.season === "Summer") {
      return ["#FFF5F7", "#D53F8C"];
    } else if (invoice.season === "Fall") {
      return ["#FFFAF0", "#DD6B20"];
    } else {
      return ["#e6f7ec", "#008000"];
    }
  };

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
  };

  const isPaid = (invoice) => {
    const endDate = new Date(invoice.endDate);


    if (invoice.paymentStatus === "full") {
      return "Paid";
    }
    if (
      !invoice.isSent &&
      new Date() < new Date(invoice.endDate) &&
      invoice.paymentStatus !== "full"
    ) {
      return "Not Paid";
    }

    return "Past Due";
  };

  const filterInvoices = (invoices, query) => {
    if (!query) return invoices;

    return invoices.filter((invoice) => {
      const invoiceName = invoice.name?.toLowerCase() || "";
      const invoiceEventName = invoice.eventName?.toLowerCase() || "";
      const invoicePayer = Array.isArray(invoice.payers)
        ? invoice.payers
            .filter((payer) => typeof payer === "string")
            .map((payer) => payer.toLowerCase())
            .join(", ")
        : "";
      return (
        invoiceName.includes(query.toLowerCase()) ||
        invoiceEventName.includes(query.toLowerCase()) ||
        invoicePayer.includes(query.toLowerCase())
      );
    });
  };

  const refetchInvoices = useCallback(async () => {
    try {
      const invoicesResponse = await backend.get("/invoicesAssignments/");
      const groupedInvoices = invoicesResponse.data.reduce((acc, row) => {
        const key = `${row.eventName}-${row.endDate}-${row.isSent}`;
        if (!acc[key]) {
          acc[key] = {
            ...row,
            payers: [],
            instructors: [],
          };
        }
        if (row.role === "payee" && row.name && !acc[key].payers.includes(row.name)) {
          acc[key].payers.push(row.name);
        }
        if (row.role === "instructor" && row.name && !acc[key].instructors.includes(row.name)) {
          acc[key].instructors.push(row.name);
        }
        return acc;
      }, {});

      const invoices = Object.values(groupedInvoices).map((invoice) => ({
        ...invoice,
        season: getSeason(invoice),
        isPaid: isPaid(invoice),
        paymentStatus: isPaid(invoice),
      }));

      setInvoices(invoices);
      setFilterComponentResults(invoices);
      if (relevantInvoices) {
        const relevantFiltered = invoices.filter((invoice) => {
          const invoiceDate = new Date(invoice.endDate);
          const currentDate = new Date();
          const isCurrentMonth =
            invoiceDate.getMonth() === currentDate.getMonth() &&
            invoiceDate.getFullYear() === currentDate.getFullYear();
          const isPastDue = invoice.paymentStatus === "Past Due";
          return isCurrentMonth || isPastDue;
        });
        setFilteredInvoices(relevantFiltered);
      } else {
        setFilteredInvoices(invoices);
      }
    } catch (err) {
      console.log(err);
    }
  }, [backend, relevantInvoices]);

  useEffect(() => {
    refetchInvoices();
  }, [backend, navigate, toast]);
  
  const handleSearch = (value) => {
    setQuery(value);
    if (value === "") {
      setFilteredInvoices(filterComponentResults);
      handleRelevantInvoicesToggle(relevantInvoices);
      return;
    }

    const searchValue = value.toLowerCase();
    const filtered = filteredInvoices.filter((invoice) => {
      return (
        (invoice.eventName &&
          invoice.eventName.toLowerCase().includes(searchValue)) ||
        (invoice.payers &&
          invoice.payers.some(
            (payer) => payer && payer.toLowerCase().includes(searchValue)
          ))
      );
    });

    setFilteredInvoices(filtered);
  };

  const handleRelevantInvoicesToggle = (forceValue = null) => {
    const newValue = forceValue !== null ? forceValue : !relevantInvoices;
    // console.log("relevantInvoices", newValue);

    if (newValue) {
      // Show relevant invoices (current month or past due)
      const relevantFiltered = filterComponentResults.filter((invoice) => {
        // Check if invoice is for current month
        const invoiceDate = new Date(invoice.endDate);
        const currentDate = new Date();
        const isCurrentMonth = 
          invoiceDate.getMonth() === currentDate.getMonth() &&
          invoiceDate.getFullYear() === currentDate.getFullYear();
        
        // Check if invoice is past due
        const isPastDue = invoice.paymentStatus === "Past Due";

        return isCurrentMonth || isPastDue;
      });
      setFilteredInvoices(relevantFiltered);
    } else {
      // Show all invoices
      setFilteredInvoices(filterComponentResults);
    }
  };

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

  // Add this useEffect to handle the filtering logic
  useEffect(() => {
    if (filterComponentResults.length > 0) {
      if (relevantInvoices) {
        // Show relevant invoices (current month or past due)
        const relevantFiltered = filterComponentResults.filter((invoice) => {
          // Check if invoice is for current month
          const invoiceDate = new Date(invoice.endDate);
          const currentDate = new Date();
          const isCurrentMonth = 
            invoiceDate.getMonth() === currentDate.getMonth() &&
            invoiceDate.getFullYear() === currentDate.getFullYear();
          
          // Check if invoice is past due
          const isPastDue = invoice.paymentStatus === "Past Due";

          return isCurrentMonth || isPastDue;
        });
        setFilteredInvoices(relevantFiltered);
      } else {
        // Show all invoices
        setFilteredInvoices(filterComponentResults);
      }
    }
  }, [relevantInvoices, filterComponentResults]);

  return (
    <Navbar>
      {/* <Box className="home-inner"> */}
      <Box className="invoices-table">
        <Flex className="invoices-filter-row">
          <InvoiceFilter
            invoices={invoices}
            setFilteredInvoices={(results) => {
              setFilterComponentResults(results);
              setFilteredInvoices(results);
            }}
          />
          <HStack alignItems="center" spacing={3}>
            <ButtonGroup
              variant="outline"
              spacing={3}
              colorScheme="purple"
            >
              <Tooltip
                label={relevantInvoices 
                  ? "Currently showing invoices from current month or past due." 
                  : "Currently showing all invoices."
                }
                hasArrow
                placement="top"
                bgColor="#718096"
                padding="8px"
                borderRadius="6px"
                maxWidth="300px"
                textAlign="center"
              >
                <Box>
                  <RoundedButton
                    onClick={() => {
                      setRelevantInvoices(!relevantInvoices); 
                      handleRelevantInvoicesToggle(!relevantInvoices);
                    }}
                    isActive={relevantInvoices}
                  >
                    {relevantInvoices ? "Showing Relevant" : "Showing All"}
                  </RoundedButton>
                </Box>
              </Tooltip>
            </ButtonGroup>
          </HStack>
          <Box flex="1" />
          <SearchBar
            handleSearch={handleSearch}
            searchQuery={query}
          />
        </Flex>
        <InvoicesTable
          filteredInvoices={sortedInvoices}
          isPaidColor={isPaidColor}
          seasonColor={seasonColor}
          sortKey={sortKey}
          sortOrder={sortOrder}
          onSortChange={(key, order) => {
            setSortKey(key);
            setSortOrder(order);
          }}
          onInvoiceDeleted={refetchInvoices}
        />
      </Box>
    </Navbar>
  );
};

export { InvoicesDashboard };
