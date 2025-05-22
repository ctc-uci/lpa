import { React, useEffect, useState } from "react";

import { useBackendContext } from "../../contexts/hooks/useBackendContext";
import { ArtistsDropdown } from "../programs/programComponents/ArtistsDropdown";
import { PayeesDropdown } from "../programs/programComponents/PayeesDropdown";
import {
  ClientsFilter,
  DateFilter,
  EmailFilter,
  InvoiceStatusFilter,
  SeasonFilter,
} from "./FilterComponents";
import { FilterContainer } from "./FilterContainer";

export const InvoiceFilter = ({ invoices, setFilteredInvoices }) => {
  const { backend } = useBackendContext();
  const [clients, setClients] = useState([]);
  const [instructorSearchTerm, setInstructorSearchTerm] = useState("");
  const [payeeSearchTerm, setPayeeSearchTerm] = useState("");
  const [selectedInstructors, setSelectedInstructors] = useState([]);
  const [selectedPayees, setSelectedPayees] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientsResponse = await backend.get("/clients");
        setClients(clientsResponse.data);
      } catch (error) {
        console.error("Failed to fetch filter data:", error);
      }
    };

    fetchData();
  }, [backend]);

  const [filters, setFilters] = useState({
    status: "all",
    startDate: null,
    endDate: null,
    season: "all",
    email: "all",
    payee: [],
    instructor: [],
  });

  const updateFilter = (type, value) => {
    console.log(`Updating filter: ${type} with value:`, value);
    setFilters((prev) => ({ ...prev, [type]: value }));

  };

  // Apply the filters to the programs page
  const applyFilters = () => {
    console.log("Applying filters:", filters);
    console.log("Original programs:", invoices);
    let filtered = invoices;

    if (filters.startDate) {
      filtered = filtered.filter(
        (invoice) => invoice.endDate && invoice.endDate >= filters.startDate
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter((program) => {
        if (!program.date) return false;

        // Create date objects using year, month, day only to remove time component
        const programDate = new Date(program.date);
        const endDate = new Date(filters.endDate);

        // Set both dates to midnight to compare date only
        const programDateOnly = new Date(
          programDate.getFullYear(),
          programDate.getMonth(),
          programDate.getDate()
        );

        const endDateOnly = new Date(
          endDate.getFullYear(),
          endDate.getMonth(),
          endDate.getDate() + 1
        );

        // Include programs up to and including the end date
        return programDateOnly <= endDateOnly;
      });
    }

    if (filters.season !== "all") {
      filtered = filtered.filter(
        (invoice) => invoice.season === filters.season
      );
    }

    if (filters.status !== "all") {
      filtered = filtered.filter(
        (invoice) => invoice.paymentStatus === filters.status
      );
    }

    if (filters.email !== "all") {
      filtered = filtered.filter(
        (invoice) => invoice.isSent === Boolean(filters.email)
      );
    }

    // Filter for payee
    if (filters.payee.length > 0) {
      filtered = filtered.filter((program) => {
        if (program.payers && program.payers.length > 0) {
          // Check if any string in program.payers matches the name property of any object in filters.payee
          return program.payers.some((payerName) =>
            filters.payee.some((payeeObj) => payeeObj.name === payerName)
          );
        }
        return false;
      });
    }

    // Filter for instructor
    if (filters.instructor.length > 0) {
      filtered = filtered.filter((program) => {
        if (program.instructors && program.instructors.length > 0) {
          return program.instructors.some((instructorName) =>
            filters.instructor.some(
              (instructorObj) => instructorObj.name === instructorName
            )
          );
        }
        return false;
      });
    }

    setFilteredInvoices(filtered);
  };

  const resetFilter = () => {
    setFilters({
      status: "all",
      startDate: null,
      endDate: null,
      season: "all",
      email: "all",
      payee: [],
      instructor: [],
    });
    setFilteredInvoices(invoices);
    setInstructorSearchTerm("")
    setPayeeSearchTerm("")
    setSelectedInstructors([])
    setSelectedPayees([])
  };

  useEffect(() => {
    applyFilters();
  }, [invoices]);

  return (
    <FilterContainer
      onApply={applyFilters}
      onReset={resetFilter}
      pageName="Invoice"
    >
      <InvoiceStatusFilter
        value={filters.status}
        onChange={updateFilter}
      />
      <DateFilter
        startDate={filters.startDate}
        endDate={filters.endDate}
        onChange={updateFilter}
      />
      <SeasonFilter
        value={filters.season}
        onChange={updateFilter}
      />

      <EmailFilter
        value={filters.email}
        onChange={updateFilter}
      />
      
      <ClientsFilter
        clientsList={clients}
        value={filters.instructor}
        onChange={updateFilter}
        type="lead"
        instructorSearchTerm={instructorSearchTerm}
        setInstructorSearchTerm={setInstructorSearchTerm}
        selectedInstructors={selectedInstructors}
        setSelectedInstructors={setSelectedInstructors}
      />
      <ClientsFilter
        clientsList={clients}
        value={filters.payee}
        onChange={updateFilter}
        type="payee"
        instructorSearchTerm={payeeSearchTerm}
        setInstructorSearchTerm={setPayeeSearchTerm}
        selectedInstructors={selectedPayees}
        setSelectedInstructors={setSelectedPayees}
      />
    </FilterContainer>
  );
};
