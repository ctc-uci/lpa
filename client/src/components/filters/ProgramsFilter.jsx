import { React, useState, useEffect } from "react";
import { FilterContainer } from "./FilterContainer";
import { DateFilter, DayFilter, ProgramStatusFilter, TimeFilter, RoomFilter, ClientsFilter } from "./FilterComponents";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";

export const ProgramFilter = ({ programs, setFilteredPrograms }) => {
    const { backend } = useBackendContext();

    const [rooms, setRooms] = useState([]);
    const [roomMap, setRoomMap] = useState([]);
    const [clients, setClients] = useState([]);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const roomsResponse = await backend.get("/rooms");
          setRooms(roomsResponse.data);

          const clientsResponse = await backend.get("/clients");
          setClients(clientsResponse.data);
        } catch (error) {
          console.error("Failed to fetch filter data:", error);
        }
      };

      fetchData();
    }, [backend]);

    useEffect(() => {
      getRoomNames();
    }, [rooms]);

    const getRoomNames = () => {
      try {
        const rMap = new Map();
        for (const room of rooms) {
          rMap.set(room.id, room.name);
        }
        setRoomMap(rMap);
      } catch (error) {
        console.log("From getRoomNames: ", error);
      }
    };

    const [filters, setFilters] = useState({
      status: "all",
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
      setFilters((prev) => ({ ...prev, [type]: value }));
    };

    // Apply the filters to the programs page
    const applyFilters = () => {
      let filtered = programs;

      if (filters.status !== "all") {
        filtered = filtered.filter(program => program.status.toLowerCase() === filters.status.toLowerCase());
      }

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
      
      const isTimeBefore = (time1, time2) => compareTimeStrings(time1, time2) < 0;
      const isTimeAfter = (time1, time2) => compareTimeStrings(time1, time2) > 0;
      
      // Start time filter - keep programs that start AFTER the filter time
      if (filters.startTime) {
        filtered = filtered.filter(program => {
          if (program.upcomingTime !== "N/A") {
            const [start] = program.upcomingTime.split(" - ");
            // console.log("Comparing start:", start, "with", filters.startTime);
            return isTimeAfter(start, filters.startTime) || compareTimeStrings(start, filters.startTime) === 0;
          }
          return false;
        });
      }
      
      // End time filter - keep programs that end BEFORE the filter time
      if (filters.endTime) {
        filtered = filtered.filter(program => {
          if (program.upcomingTime !== "N/A") {
            const [, end] = program.upcomingTime.split(" - ");
            // console.log("Comparing end:", end, "with", filters.endTime);
            return isTimeBefore(end, filters.endTime) || compareTimeStrings(end, filters.endTime) === 0;
          }
          return false;
        });
      }
    

      // Filter for instructor
      if (filters.instructor.length > 0) {
        filtered = filtered.filter(program => {
          if (program.instructor) {
            // Split the program.instructor string into an array of names
            const instructorNames = program.instructor.split(',').map(name => name.trim().toLowerCase());

            // Check if any of the filters.instructor names are in the instructorNames array
            return filters.instructor.some(filterName =>
              instructorNames.includes(filterName.name.toLowerCase())
            );
          }
          return false;
        });
      }

      // Filter for payee
      if (filters.payee.length > 0) {
        filtered = filtered.filter(program => {
          if (program.payee) {
            // Split the program.instructor string into an array of names
            const payeeNames = program.payee.split(',').map(name => name.trim().toLowerCase());

            // Check if any of the filters.instructor names are in the instructorNames array
            return filters.payee.some(filterName =>
              payeeNames.includes(filterName.name.toLowerCase())
            );
          }
          return false;
        });
      }

      setFilteredPrograms(filtered);
      // console.log("Filtered Programs: ", filtered);
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
        instructor: [],
        payee: [],
      });
      setFilteredPrograms(programs);
    }

    return (
      <FilterContainer
        onApply={applyFilters}
        onReset={resetFilter}
        pageName="Program"
      >
        <ProgramStatusFilter
          value={filters.status}
          onChange={updateFilter}
        />
        <DayFilter
          value={filters.days}
          onChange={updateFilter}
        />
        <DateFilter
          startDate={filters.startDate}
          endDate={filters.endDate}
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
          value={filters.instructor}
          onChange={updateFilter}
          type="payee"
        />
      </ FilterContainer>
    );
};
