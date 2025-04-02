import { React, useState, useEffect, useCallback } from "react";
import { FilterContainer } from "./FilterContainer";
import { DateFilter, DayFilter, ProgramStatusFilter, TimeFilter, RoomFilter, LeadArtistFilter, PayerFilter } from "./FilterComponents";
import { useBackendContext } from "../../contexts/hooks/useBackendContext";

export const ProgramFilter = ({ programs, setFilteredPrograms }) => {
    // const [programs, setPrograms] = useState([]); // TO contain original program data
    // const [filteredPrograms, setFilteredPrograms] = useState([]); // To contain filteredPrograms (will be displayed if filters applied
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
      console.log("Original programs:", programs);
      let filtered = programs;

      // Update based on status filter
      if (filters.status !== "all") {
        filtered = filtered.filter(program =>
          program.status.toLowerCase() === filters.status.toLowerCase()
        );
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
        filtered = filtered.filter(program => program.date && new Date(program.date) <= new Date(filters.endDate));
      }

      if (filters.startTime) {
        filtered = filtered.filter(program => {
          if (program.upcomingTime !== "N/A") {
            const [start] = program.upcomingTime.split(" - ");
            return start >= filters.startTime;
          }
          return false;
        });
      }

      if (filters.endTime) {
        filtered = filtered.filter(program => {
          if (program.upcomingTime !== "N/A") {
            const [, end] = program.upcomingTime.split(" - ");
            return end <= filters.endTime;
          }
          return false;
        });
      }

      // if (filters.instructor !== "all") {
      //   filtered = filtered.filter(program => program.instructor.includes(filters.instructor));
      // }

      // if (filters.payee !== "all") {
      //   filtered = filtered.filter(program => program.payee.includes(filters.payee));
      // }

      setFilteredPrograms(filtered);
      console.log("updated with filters", filtered);
    };

    const resetFilter = (type, value) => {
      setFilters({
        status: "all",
        days: [],
        dateRange: { start: "", end: "" },
        timeRange: { start: "", end: "" },
        room: "all",
        leadArtists: [],
        payers: [],
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
        {/* <LeadArtistFilter
          clientsList={clients}
          value={filters.leadArtists}
          onChange={updateFilter}/>
        <PayerFilter
          clientsList={clients}
          value={filters.payers}
          onChange={updateFilter}/> */}
      </ FilterContainer>
    );
};
