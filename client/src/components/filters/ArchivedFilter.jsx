import React, { useState, useEffect } from "react";
import { FilterContainer } from "./FilterContainer";
import { DateFilter, TimeFilter, DayFilter, RoomFilter, ClientsFilter } from "./FilterComponents";
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
          console.log("Comparing session start:", sessionStartTime, "with filter:", filters.startTime);
          return compareTimeStrings(sessionStartTime, filters.startTime) >= 0;
        });
      }
      
      if (filters.endTime) {
        filtered = filtered.filter(session => {
          // Convert both times to comparable format and then compare
          const sessionEndTime = session.endTime; // Assuming this is a string
          console.log("Comparing session end:", sessionEndTime, "with filter:", filters.endTime);
          return compareTimeStrings(sessionEndTime, filters.endTime) <= 0;
        });
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
        <ClientsFilter
          clientsList={clients}
          value={filters.instructor}
          onChange={updateFilter}
          type="lead"
        />
        <ClientsFilter
          clientsList={clients}
          value={filters.payee}
          onChange={updateFilter}
          type="payee"
        />
      </ FilterContainer>
    );
};
