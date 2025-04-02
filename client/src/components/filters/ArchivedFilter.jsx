import React, { useState } from "react";
import { FilterContainer } from "./FilterContainer";
import { DateFilter, TimeFilter, DayFilter, RoomFilter, LeadArtistFilter, PayerFilter } from "./FilterComponents";

export const ArchivedFilter = ({ archived, setArchivedPrograms, roomMap }) => {

    const [filters, setFilters] = useState({
      days: [],
      startTime: null,
      endTime: null,
      startDate: null,
      endDate: null,
      room: "all",
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
        let [time, offset] = timeStr.split('+');
        let [hours, minutes, seconds] = time.split(':').map(Number);

        // If there's no offset, we assume it's in the same timezone as the other time
        if (offset) {
          // Adjust for timezone if needed
          let offsetHours = Number(offset.slice(0, 2));
          let offsetMinutes = Number(offset.slice(2));
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

      if (filters.instructor && filters.instructor !== "all") {
        const instructorLower = filters.instructor.toLowerCase();
        filtered = filtered.filter(program =>
          program.instructor &&
          program.instructor.toLowerCase().includes(instructorLower)
        );
      }

      if (filters.payee && filters.payee !== "all") {
        const payeeLower = filters.payee.toLowerCase();
        filtered = filtered.filter(program =>
          program.payee &&
          program.payee.toLowerCase().includes(payeeLower)
        );
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
        instructor: "all",
        payee: "all",
      });
      setArchivedPrograms(archived);
    }

    return (
      <FilterContainer
        onApply={applyFilters}
        onReset={resetFilter}
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
