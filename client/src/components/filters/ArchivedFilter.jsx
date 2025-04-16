import React, { useState, useEffect } from "react";
import { FilterContainer } from "./FilterContainer";
import { DateFilter, TimeFilter, DayFilter, RoomFilter, LeadArtistFilter } from "./FilterComponents";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";

export const ArchivedFilter = ({ archived, setArchivedPrograms, roomMap }) => {
    const {backend} = useBackendContext();
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
      days: [],
      startTime: null,
      endTime: null,
      startDate: null,
      endDate: null,
      room: "all",
      instructor: [],
      payee: []
    });

    const updateFilter = (type, value) => {
      console.log(`Updating filter: ${type} with value:`, value);
      setFilters((prev) => ({ ...prev, [type]: value }));
    };

    // Apply the filters to the programs page
    const applyFilters = () => {
      console.log("Applying filters:", filters);
      console.log("Original archived:", archived);
      let filtered = archived;

      if (filters.room !== "all"){
        filtered = filtered.filter(program =>
          program.room.toLowerCase() === filters.room.toLowerCase()
        );
      }

      // Day
      if (filters.days.length > 0) {
        filtered = filtered.filter(program => {
          if (program.sessionDate) {
            const programDay = new Date(program.sessionDate).toLocaleString('en-US', { weekday: 'short' });
            return filters.days.includes(programDay);
          }
          return false;
        });
      }

      // Update date filters
      if (filters.startDate) {
        filtered = filtered.filter(program => program.sessionDate && new Date(program.sessionDate) >= new Date(filters.startDate));
      }

      if (filters.endDate) {
        filtered = filtered.filter(program => program.sessionDate && new Date(program.sessionDate) <= new Date(filters.endDate));
      }


      function timeToMinutes(timeStr) {
        const [time, offset] = timeStr.split('+');
        [hours, minutes, seconds] = time.split(':').map(Number);

        // If there's no offset, we assume it's in the same timezone as the other time
        if (offset) {
          // Adjust for timezone if needed
          const offsetHours = Number(offset.slice(0, 2));
          const offsetMinutes = Number(offset.slice(2));
          hours -= offsetHours; // Subtract because +00 means ahead of UTC
          minutes -= offsetMinutes;
        }

        // Ensure hours are within 0-23 range
        hours = (hours + 24) % 24;

        return hours * 60 + minutes;
      }


      if (filters.startTime) {
        filtered = filtered.filter(program => timeToMinutes(program.sessionStart) >= timeToMinutes(filters.startTime));
      }

      if (filters.endTime) {
        filtered = filtered.filter(program => timeToMinutes(program.sessionEnd) <= timeToMinutes(filters.endTime));
      }

      // Filter for instructor
      if (filters.instructor.length > 0) {
        filtered = filtered.filter(program => {
          if (program.instructors && Object.keys(program.instructors).length > 0) {
            return Object.values(program.instructors).some(instructor =>
              filters.instructor.some(filterInstructor =>
                instructor.clientName.toLowerCase() === filterInstructor.name.toLowerCase()
              )
            );
          }
          return false;
      });
    }
      // Filter for payee
        if (filters.payee.length > 0) {
          filtered = filtered.filter(program => {
            if (program.payees && Object.keys(program.payees).length > 0) {
              return Object.values(program.payees).some(payee =>
                filters.payee.some(filterPayee =>
                  payee.clientName.toLowerCase() === filterPayee.name.toLowerCase()
                )
              );
            }
            return false;
        });
      }

      console.log("NEW FILTERED", filtered);
      setArchivedPrograms(filtered);
    };

    const resetFilter = (type, value) => {
      setFilters({
        days: [],
        startTime: null,
        endTime: null,
        startDate: null,
        endDate: null,
        room: "all",
        instructor: [],
        payee: [],
      });
      setArchivedPrograms(archived);
    }

    return (
      <FilterContainer
        onApply={applyFilters}
        onReset={resetFilter}
        pageName="Archived"
      >
        <DateFilter
          startDate={filters.startDate}
          endDate={filters.endDate}
          onChange={updateFilter}
        />
        <DayFilter
          value={filters.days}
          onChange={updateFilter}
        />
        <TimeFilter
          startTime={filters.startTime}
          endTime={filters.endTime}
          onChange={updateFilter}/>
        <RoomFilter
          roomMap={roomMap}
          onChange={updateFilter}
          room={filters.room}/>
        <LeadArtistFilter
          clientsList={clients}
          value={filters.instructor}
          onChange={updateFilter}
          type="lead"
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
