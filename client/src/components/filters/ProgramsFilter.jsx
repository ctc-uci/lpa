import { React, useState, useEffect } from "react";
import { FilterContainer } from "./FilterContainer";
import { DateFilter, DayFilter, ProgramStatusFilter, TimeFilter, RoomFilter, LeadArtistFilter } from "./FilterComponents";
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
      console.log(`Updating filter: ${type} with value:`, value);
      setFilters((prev) => ({ ...prev, [type]: value }));
    };

    // Apply the filters to the programs page
    const applyFilters = () => {
      console.log("Applying filters:", filters);
      console.log("Original programs:", programs);
      let filtered = programs;

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
      console.log("updated with filters", filtered);
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

    useEffect(() => {
      applyFilters();
    }, [filters, programs]);

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
        <LeadArtistFilter
          clientsList={clients}
          value={filters.instructor}
          onChange={updateFilter}
          type="lead"
        />
        <LeadArtistFilter
          clientsList={clients}
          value={filters.instructor}
          onChange={updateFilter}
          type="payee"
        />

        {/* <PayerFilter
          clientsList={clients}
          value={filters.payee}
          onChange={updateFilter}
          /> */}
      </ FilterContainer>
    );
};
