import { useEffect, useRef, useState } from "react";

import { SearchIcon } from "@chakra-ui/icons";
import {
  Box,
  Flex,
  Heading,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useToast,
} from "@chakra-ui/react";

import { useNavigate } from "react-router-dom";

import AlertIcon from "../../assets/alertIcon.svg";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { InvoiceFilter } from "../filters/InvoicesFilter";
import Navbar from "../navbar/Navbar";
import { PaginationComponent } from "../PaginationComponent";
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

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [filter, setFilter] = useState({
    startDate: "",
    endDate: "",
    status: "all",
    instructor: "all",
    payee: "all",
  });

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

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const totalInvoices = filteredInvoices?.length || 0;
  const totalPages = Math.ceil(totalInvoices / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalInvoices);
  const currentPageInvoices = filteredInvoices.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredInvoices]);

  useEffect(() => {
    const calculateRowsPerPage = () => {
      // Always return 12 rows per page for invoices
      return 12;
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

    console.log(invoice);

    if (invoice.paymentStatus === "full") {
      return "Paid";
    }

    if (new Date() < endDate && invoice.paymentStatus !== "full") {
      return "Not Paid";
    }

    return "Past Due";
  };

  const filterInvoices = (invoices, query) => {
    if (!query) return invoices;

    return invoices.filter((invoice) => {
      console.log(invoice);
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

  useEffect(() => {
    const fetchInvoicesData = async () => {
      try {
        const invoicesResponse = await backend.get("/invoicesAssignments/");
        const groupedInvoices = invoicesResponse.data.reduce((acc, invoice) => {
          const key = `${invoice.eventName}-${invoice.endDate}-${invoice.isSent}`;
          if (invoice.role === "instructor") return acc;
          if (!acc[key]) {
            acc[key] = {
              ...invoice,
              payers: [invoice.name], // Store payers in an array
            };
          } else {
            if (!acc[key].payers.includes(invoice.name)) {
              acc[key].payers.push(invoice.name);
            }
          }

          return acc;
        }, {});

        const invoices = Object.values(groupedInvoices).map((invoice) => ({
          ...invoice,
          season: getSeason(invoice),
          isPaid: isPaid(invoice),
          paymentStatus: isPaid(invoice),
        }));

        console.log(invoices);

        setInvoices(invoices);
        setFilteredInvoices(invoices);
        setFilterComponentResults(invoices);
      } catch (err) {
        console.log(err);
      }
    };

    fetchInvoicesData();
  }, [backend, navigate, toast]); // Include dependencies the function uses

  const handleSearch = (value) => {
    setQuery(value);
    if (value === "") {
      setFilteredInvoices(invoices);
      return;
    }

    const searchValue = value.toLowerCase();
    const filtered = invoices.filter((invoice) => {
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
          <Box flex="1" />
          <SearchBar
            handleSearch={handleSearch}
            searchQuery={query}
          />
        </Flex>
        <InvoicesTable
          filteredInvoices={filteredInvoices}
          isPaidColor={isPaidColor}
          seasonColor={seasonColor}
        />
      </Box>
      <PaginationComponent
        totalPages={totalPages}
        goToNextPage={goToNextPage}
        goToPreviousPage={goToPreviousPage}
        currentPage={currentPage}
      />
    </Navbar>
  );
};

export { InvoicesDashboard };
