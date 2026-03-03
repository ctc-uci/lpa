import { React, useEffect, useState } from "react";

import { useBackendContext } from "../../contexts/hooks/useBackendContext";
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
    setFilters((prev) => ({ ...prev, [type]: value }));
  };

  // Apply the filters to the invoices
  const applyFilters = () => {
    let filtered = invoices;

    // Date filter: use invoice.endDate (billing period end), compare as YYYY-MM-DD
    if (filters.startDate || filters.endDate) {
      filtered = filtered.filter((invoice) => {
        if (!invoice.endDate) return false;
        const invoiceDateOnly =
          typeof invoice.endDate === "string" && invoice.endDate.includes("T")
            ? invoice.endDate.split("T")[0]
            : String(invoice.endDate).slice(0, 10);
        if (filters.startDate && invoiceDateOnly < filters.startDate)
          return false;
        if (filters.endDate && invoiceDateOnly > filters.endDate) return false;
        return true;
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
      filtered = filtered.filter((invoice) => {
        if (invoice.payers && invoice.payers.length > 0) {
          return invoice.payers.some((payerName) =>
            filters.payee.some((payeeObj) => payeeObj.name === payerName)
          );
        }
        return false;
      });
    }

    // Filter for lead artists (instructors)
    if (filters.instructor.length > 0) {
      filtered = filtered.filter((invoice) => {
        if (invoice.instructors && invoice.instructors.length > 0) {
          return invoice.instructors.some((instructorName) =>
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
        value={filters.payee}
        onChange={updateFilter}
        type="payee"
      />
      <ClientsFilter
        clientsList={clients}
        value={filters.instructor}
        onChange={updateFilter}
        type="lead"
      />
    </FilterContainer>
  );
};
