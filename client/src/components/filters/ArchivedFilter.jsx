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
          if (program.date) {
            const programDay = new Date(program.date).toLocaleString('en-US', { weekday: 'short' });
            return filters.days.includes(programDay);
          }
          return false;
        });
      }

      if (filters.startDate) {
        filtered = filtered.filter(program => program.date && new Date(program.date) >= new Date(filters.startDate));
      }

      if (filters.endDate) {
        filtered = filtered.filter(program => program.date && new Date(program.date) <= new Date(filters.endDate));
      }
      function compareTimeStrings(time1, time2) {
        // Helper function to convert time string to minutes since midnight
        function timeToMinutes(timeStr) {
          let [time, modifier] = timeStr.split(' ');
          let [hours, minutes] = time.split(':');

          hours = parseInt(hours);
          minutes = parseInt(minutes);

          if (hours === 12) {
            hours = 0;
          }

          if (modifier && modifier.toLowerCase() === 'pm') {
            hours = hours + 12;
          }

          return hours * 60 + minutes;
        }

        // Convert both times to minutes and compare
        const minutes1 = timeToMinutes(time1);
        const minutes2 = timeToMinutes(time2);

        if (minutes1 < minutes2) {
          return -1; // time1 is earlier
        } else if (minutes1 > minutes2) {
          return 1;  // time1 is later
        } else {
          return 0;  // times are equal
        }
      }

      function isTimeBefore(time1, time2) {
        return compareTimeStrings(time1, time2) < 0;
      }

      if (filters.startTime) {
        filtered = filtered.filter(program => {
          if (program.upcomingTime !== "N/A") {
            const [start] = program.upcomingTime.split(" - ");
            console.log("start", start);
            console.log(filters.startTime);
            console.log(isTimeBefore(start, filters.startTime));
            return isTimeBefore(start, filters.startTime) <= 0;
          }
          return false;
        });
      }

      if (filters.endTime) {
        filtered = filtered.filter(program => {
          if (program.upcomingTime !== "N/A") {
            const [, end] = program.upcomingTime.split(" - ");
            console.log("end", end);
            console.log(filters.endTime);
            console.log(isTimeBefore(end, filters.endTime));
            return isTimeBefore(end, filters.endTime) <= 0;
          }
          return false;
        });
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
