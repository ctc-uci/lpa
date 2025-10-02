import React, { useState } from "react";
import { FilterContainer } from "./FilterContainer";
import { DateFilter, DayFilter, RoomFilter, SessionStatusFilter, TimeFilter } from "./FilterComponents";

export const SessionFilter = ({ sessions, setFilteredSessions, rooms, isArchived=false }) => {

    const [filters, setFilters] = useState({
      status: "all",
      days: [],
      startTime: null,
      endTime: null,
      startDate: null,
      endDate: null,
      room: "all",
    });

    const updateFilter = (type, value) => {
      // console.log(`Updating filter: ${type} with value:`, value);
      setFilters((prev) => ({ ...prev, [type]: value }));
    };

    // Apply the filters to the sessions page
    const applyFilters = () => {
      // console.log("Applying filters:", filters);
      // console.log("Original sessions:", sessions);
      let filtered = sessions;

      // Update based on status filter
      if (filters.status !== "all") {
        const now = new Date().toISOString();
        filtered = filtered.filter(session => {
          switch (filters.status) {
            case "active":
              return session.date > now;
            case "past":
              return session.date <= now && !session.archived;
            case "archived":
              return session.archived;
            default:
              return true;
          }
        });
      }
      // console.log("filtered:", filtered);
      // console.log("roomsList", rooms);

      if (filters.room !== "all") {
        filtered = filtered.filter(session => rooms.get(session.roomId) === filters.room);
      }

      // Day
      if (filters.days.length > 0) {
        filtered = filtered.filter(session => {
          const sessionDate = new Date(session.date);
          const day = sessionDate.toLocaleString('en-US', { weekday: 'short' });
          return filters.days.includes(day);
        });
      }

      // Time
      // Time string comparison utility functions
      const compareTimeStrings = (time1, time2) => {
      // Helper to convert time string to minutes since midnight
      const timeToMinutes = (timeStr) => {
        let hours, minutes;

        // Check if timeStr is in 24-hour format (e.g., "21:00")
        if (timeStr.includes(":") && !timeStr.includes(" ")) {
          const [h, m] = timeStr.split(":");
          hours = parseInt(h);
          minutes = parseInt(m);
        }
        // Otherwise, handle the 12-hour time format (e.g., "12:00 am", "03:00 pm")
        else {
          const timeParts = timeStr.split(" ");
          const modifier = timeParts[1] ? timeParts[1].toLowerCase() : null;
          const [h, m] = timeParts[0].split(":");

          hours = parseInt(h);
          minutes = parseInt(m);

          if (hours === 12) {
            hours = modifier === "am" ? 0 : 12; // 12 AM = 0 hours, 12 PM = 12 hours
          } else if (modifier === "pm") {
            hours = hours + 12; // Convert PM to 24-hour format
          }
        }

        return hours * 60 + minutes;
      };

      const minutes1 = timeToMinutes(time1);
      const minutes2 = timeToMinutes(time2);

      if (minutes1 < minutes2) return -1; // time1 is earlier
      if (minutes1 > minutes2) return 1;  // time1 is later
      return 0;  // times are equal
      };

      // Time filter for sessions
      if (filters.startTime) {
      filtered = filtered.filter(session => {
        // Convert both times to comparable format and then compare
        const sessionStartTime = session.startTime; // Assuming this is a string
        // console.log("Comparing session start:", sessionStartTime, "with filter:", filters.startTime);
        return compareTimeStrings(sessionStartTime, filters.startTime) >= 0;
      });
    }

      if (filters.endTime) {
      filtered = filtered.filter(session => {
        // Convert both times to comparable format and then compare
        const sessionEndTime = session.endTime; // Assuming this is a string
        // console.log("Comparing session end:", sessionEndTime, "with filter:", filters.endTime);
        return compareTimeStrings(sessionEndTime, filters.endTime) <= 0;
      });
    }

      // Date
      if (filters.startDate) {
        filtered = filtered.filter(session => session.date >= filters.startDate);
      }

      if (filters.endDate) {
        filtered = filtered.filter(program => {
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
            endDate.getDate()+1
          );

          // Include programs up to and including the end date
          return programDateOnly <= endDateOnly;
        });
      }

      setFilteredSessions(filtered);
    };

    const resetFilter = (type, value) => {
      setFilters({
        status: "all",
        days: [],
        startTime: null,
        endTime: null,
        startDate: null,
        endDate: null,
        room: "all",
      });
      setFilteredSessions(sessions);
    }

    return (
      <FilterContainer
        onApply={applyFilters}
        onReset={resetFilter}
        pageName="Session"
      >
        {!isArchived && (
          <SessionStatusFilter
            value={filters.status}
            onChange={updateFilter}
          />
        )}
        <DayFilter
          value={filters.days}
          onChange={updateFilter}/>
        <DateFilter
          startDate={filters.startDate}
          endDate={filters.endDate}
          onChange={updateFilter}/>
        <TimeFilter
          startTime={filters.startTime}
          endTime={filters.endTime}
          onChange={updateFilter}/>
        <RoomFilter
          roomMap={rooms}
          onChange={updateFilter}
          room={filters.room}/>
      </FilterContainer>
    );
};

