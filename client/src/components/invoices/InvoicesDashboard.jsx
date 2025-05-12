import { useEffect, useRef, useState } from "react";

import { SearchIcon } from "@chakra-ui/icons";
import {
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
import { InvoicesFilter, InvoicesTable } from "./InvoiceComponents";

const InvoicesDashboard = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const { backend } = useBackendContext();
  const [invoices, setInvoices] = useState([]);
  const [query, setQuery] = useState("");
  const hasShownToast = useRef(false);
  const [filteredInvoices, setFilteredInvoices] = useState([]);

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

  // Calculate total pages
  const totalInvoices = filteredInvoices?.length || 0;
  const totalPages = Math.ceil(totalInvoices / itemsPerPage);

  // Calculate current page items
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalInvoices);
  const currentPageInvoices = filteredInvoices.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredInvoices]);

  // Adjust itemsPerPage based on viewport height
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
    if (invoice.isSent && invoice.paymentStatus === "full") {
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
              payers: [invoice.name], // Store payers in an array
            };
          } else {
            // Append the payer only if it's not already in the list (avoid duplicates)
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
        }));
        setInvoices(invoices);
      } catch (err) {
        console.log(err);
      }
    };
    fetchInvoicesData();
  }, []);

  useEffect(() => {
    if (invoices.length === 0 || hasShownToast.current) return;

    const getUnpaidInvoices = () => {
      const filteredPastDueInvoices = filteredInvoices.filter(
        (invoice) => isPaid(invoice) === "PAST DUE"
      );
      const notifCounter = filteredPastDueInvoices.length;

      if (notifCounter > 0) {
        hasShownToast.current = true; // Set ref to true to prevent multiple toasts
        toast({
          title: "Unpaid Invoices",
          description:
            notifCounter > 1
              ? `You have ${notifCounter} past due invoices`
              : `${filteredPastDueInvoices[0].name} - ${filteredPastDueInvoices[0].endDate.split("T")[0]}`,
          status: "error",
          duration: 9000,
          position: "bottom-right",
          isClosable: true,
          render: () => (
            <Flex
              p={3}
              bg="#FED7D7"
              borderTop="4px solid"
              borderTopColor="red.500"
              onClick={() => navigate("/notification")}
              padding="12px 16px"
              gap="12px"
              w="400px"
            >
              <Image src={AlertIcon} />
              <Flex flexDirection="column">
                <Heading
                  size="sm"
                  align-self="stretch"
                >
                  Unpaid Invoices
                </Heading>
                <Text align-self="stretch">
                  {notifCounter > 1
                    ? `You have ${notifCounter} past due invoices`
                    : `${filteredPastDueInvoices[0].name} -
                  ${new Date(filteredPastDueInvoices[0].endDate).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" })}`}
                </Text>
              </Flex>
            </Flex>
          ),
        });
      }
    };

    getUnpaidInvoices();
  }, [invoices]);

  return (
    <Navbar>
      <Flex
        w="95%"
        m="50px 30px 20px 30px"
        flexDirection="column"
        padding="20px"
        border="1px solid var(--medium-light-grey)"
        borderRadius="12px"
      >
        <Flex
          justifyContent="space-between"
          mb="40px"
        >
          {/* <InvoicesFilter filter={filter} setFilter={setFilter} invoices={invoices} /> */}
          <InvoiceFilter
            invoices={invoices}
            setFilteredInvoices={setFilteredInvoices}
          />

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
        <InvoicesTable
          filteredInvoices={currentPageInvoices}
          isPaidColor={isPaidColor}
          seasonColor={seasonColor}
        />
      </Flex>
      <Flex marginRight={"30px"}>
        <PaginationComponent
          totalPages={totalPages}
          goToNextPage={goToNextPage}
          goToPreviousPage={goToPreviousPage}
          currentPage={currentPage}
        />
      </Flex>
    </Navbar>
  );
};

export { InvoicesDashboard };
