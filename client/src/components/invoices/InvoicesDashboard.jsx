import { useEffect, useRef, useState } from "react";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
} from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useToast,
} from "@chakra-ui/react";

import { useNavigate } from "react-router-dom";

import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import Navbar from "../navbar/Navbar";
import { InvoicesFilter, InvoicesTable } from "./InvoiceComponents";

const InvoicesDashboard = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [query, setQuery] = useState("");
  const hasShownToast = useRef(false);
  const [invoices, setInvoices] = useState([]); // Initialize as empty array instead of undefined
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [filter, setFilter] = useState({
    startDate: "",
    endDate: "",
    status: "all",
    instructor: "all",
    payee: "all",
  });
  const [isLoading, setIsLoading] = useState(true);

  const toast = useToast();
  const navigate = useNavigate();
  const { backend } = useBackendContext();

  // Calculate pagination values
  const totalInvoices = filteredInvoices?.length || 0;
  const totalPages = Math.ceil(totalInvoices / itemsPerPage);

  // Pagination handlers
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Helper functions
  const isPaidColor = (invoice) => {
    if (invoice.isSent && invoice.paymentStatus === "full") {
      return "#474849";
    }
    if (
      !invoice.isSent &&
      new Date() < new Date(invoice.endDate) &&
      invoice.paymentStatus !== "full"
    ) {
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
      return ["#e6f7ec", "#008000"];
    }
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredInvoices]);

  // Responsive rows calculation
  useEffect(() => {
    const calculateRowsPerPage = () => {
      const viewportHeight = window.innerHeight;
      const rowHeight = 56;
      const availableHeight = viewportHeight * 0.5;
      return Math.max(5, Math.floor(availableHeight / rowHeight));
    };

    setItemsPerPage(calculateRowsPerPage());

    const handleResize = () => {
      setItemsPerPage(calculateRowsPerPage());
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Fetch data
  useEffect(() => {
    const fetchInvoicesData = async () => {
      setIsLoading(true);
      try {
        const invoicesResponse = await backend.get("/invoicesAssignments/");
        // Process data and set invoices
        const invoicesData = invoicesResponse.data || [];
        setInvoices(invoicesData);
        setFilteredInvoices(invoicesData);
      } catch (err) {
        console.log(err);
        // Set empty arrays in case of error
        setInvoices([]);
        setFilteredInvoices([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInvoicesData();
  }, [backend]);

  return (
    <Navbar>
      <Flex
        w="95%"
        m="50px 40px"
        flexDirection="column"
        padding="20px"
      >
        <Flex
          border="1px solid var(--medium-light-grey)"
          borderRadius="12px"
          flexDirection="column"
          padding="20px"
        >
          <Flex
            justifyContent="space-between"
            mb="40px"
          >
            {/* Filter Section - pass empty array if invoices is undefined */}
            <InvoicesFilter
              invoices={invoices || []}
              filter={filter}
              setFilter={setFilter}
            />

            {/* Search Section */}
            <InputGroup
              w="400px"
              borderColor="transparent"
            >
              <InputRightElement
                pointerEvents="none"
                bgColor="#EDF2F7"
                borderRadius="0px 6px 6px 0px"
              >
                <SearchIcon color="#767778" />
              </InputRightElement>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                icon={SearchIcon}
                borderColor="gray.100"
                bgColor="#F7FAFC"
                borderRadius="6px 0px 0px 6px"
                placeholder="Search..."
                textColor="#718096"
              />
            </InputGroup>
          </Flex>

          {/* Table Section */}
          <Box
            borderWidth="1px"
            borderColor="gray.200"
            borderRadius="md"
            overflow="hidden"
            mb={4}
          >
            <InvoicesTable
              filteredInvoices={filteredInvoices || []}
              isPaidColor={isPaidColor}
              seasonColor={seasonColor}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
            />
          </Box>
        </Flex>

        {/* Pagination Controls - placed outside the table */}
        {totalPages > 1 && (
          <Flex
            alignItems="center"
            justifyContent="flex-end"
            mt={2}
            pr={4}
          >
            <Text
              mr={2}
              fontSize="sm"
              color="#474849"
              fontFamily="Inter, sans-serif"
            >
              {currentPage} of {totalPages}
            </Text>
            <Button
              onClick={goToPreviousPage}
              isDisabled={currentPage === 1}
              variant="ghost"
              minWidth="auto"
              color="gray.500"
              mr="4px"
              size="md"
            >
              <ChevronLeftIcon />
            </Button>
            <Button
              onClick={goToNextPage}
              isDisabled={currentPage === totalPages}
              size="md"
              variant="ghost"
              minWidth="auto"
              color="gray.500"
            >
              <ChevronRightIcon />
            </Button>
          </Flex>
        )}
      </Flex>
    </Navbar>
  );
};

export { InvoicesDashboard };
