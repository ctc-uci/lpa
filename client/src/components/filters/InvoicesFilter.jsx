import { React, useState, useEffect } from "react";
import { FilterContainer } from "./FilterContainer";
import { DateFilter, LeadArtistFilter, InvoiceStatusFilter, SeasonFilter, EmailFilter } from "./FilterComponents";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";

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
      payee: []
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
        filtered = filtered.filter(invoice => invoice.endDate && invoice.endDate >= filters.startDate);
      }

      if (filters.endDate) {
        filtered = filtered.filter(invoice => invoice.endDate && invoice.endDate <= filters.endDate);
      }

      if (filters.season !== "all") {
        filtered = filtered.filter(invoice => invoice.season === filters.season);
      }

      if (filters.status !== "all") {
        filtered = filtered.filter(invoice => invoice.paymentStatus === filters.status);
      }

      if (filters.email !== "all"){
        filtered = filtered.filter(invoice => invoice.isSent === Boolean(filters.email));
      }

      // Filter for payee
      if (filters.payee.length > 0) {
        filtered = filtered.filter(program => {
          if (program.payers && program.payers.length > 0) {
            // Check if any string in program.payers matches the name property of any object in filters.payee
            return program.payers.some(payerName => filters.payee.some(payeeObj => payeeObj.name === payerName));
          }
          return false;
        });
      }

      setFilteredInvoices(filtered);
    };

    const resetFilter = (type, value) => {
      setFilters({
        status: "all",
        startDate: null,
        endDate: null,
        season: "all",
        email: "all",
        payee: []
      });
      setFilteredInvoices(invoices);
    }

    useEffect(() => {
      applyFilters();
    }, [filters, invoices]);

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
          value = {filters.email}
          onChange ={updateFilter}
        />
        <LeadArtistFilter
          clientsList={clients}
          value={filters.payee}
          onChange={updateFilter}
          type="payee"
          />
      </ FilterContainer>
    );
};
