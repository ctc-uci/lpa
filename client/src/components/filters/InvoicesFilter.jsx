import { React, useState, useEffect } from "react";
import { FilterContainer } from "./FilterContainer";
import { DateFilter, DayFilter, ProgramStatusFilter, TimeFilter, RoomFilter, LeadArtistFilter, PayerFilter, InvoiceStatusFilter, SeasonFilter } from "./FilterComponents";
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
      instructor: "all",
      payee: "all"
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
        filtered = filtered.filter(invoice => invoice.date && new Date(invoice.date) >= new Date(filters.startDate));
      }

      if (filters.endDate) {
        filtered = filtered.filter(invoice => invoice.date && new Date(invoice.date) <= new Date(filters.endDate));
      }

      if (filters.season !== "all") {
        filtered = filtered.filter(invoice => invoice.season === filters.season);
      }

      // if (filters.instructor && filters.instructor !== "all") {
      //   const instructorLower = filters.instructor.toLowerCase();
      //   filtered = filtered.filter(program =>
      //     program.instructor &&
      //     program.instructor.toLowerCase().includes(instructorLower)
      //   );
      // }

      // if (filters.payee && filters.payee !== "all") {
      //   const payeeLower = filters.payee.toLowerCase();
      //   filtered = filtered.filter(program =>
      //     program.payee &&
      //     program.payee.toLowerCase().includes(payeeLower)
      //   );
      // }

      setFilteredInvoices(filtered);
      console.log("updated with filters", filtered);
    };

    const resetFilter = (type, value) => {
      setFilters({
        status: "all",
        startDate: null,
        endDate: null,
        season: "all",
        email: "all",
        instructor: "all",
        payee: "all"
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

        {/* <LeadArtistFilter
          clientsList={clients}
          value={filters.instructor}
          onChange={updateFilter}
        />
        <PayerFilter
          clientsList={clients}
          value={filters.payee}
          onChange={updateFilter}
          /> */}
      </ FilterContainer>
    );
};
