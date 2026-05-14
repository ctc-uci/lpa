import { useEffect } from "react";

import { useBackendContext } from "./useBackendContext";
import { useSessionStore, Session } from "../../stores/useSessionStore";
import { parseSessionDate } from "../../components/programs/utils";

export const useInvoiceSessions = (invoiceId?: string) => {
  const { backend } = useBackendContext();
  const { setSessions } = useSessionStore();

  useEffect(() => {
    const fetchSessions = async () => {
      if (!invoiceId) {
        setSessions([]);
        return;
      }

      try {
        const response = await backend.get(`comments/invoice/sessions/${invoiceId}`);
        const data: Session[] = response.data ?? [];

        const sorted = data.slice().sort((a, b) => {
          const aDate = parseSessionDate(a?.bookingDate)?.getTime();
          const bDate = parseSessionDate(b?.bookingDate)?.getTime();

          const aValid = typeof aDate === "number" && !Number.isNaN(aDate);
          const bValid = typeof bDate === "number" && !Number.isNaN(bDate);

          if (aValid && bValid && aDate !== bDate) return aDate - bDate;
          if (aValid && !bValid) return -1;
          if (!aValid && bValid) return 1;

          // Same day (or both invalid): sort by start time to keep days chronological.
          const aStart = a?.startTime?.slice(0, 5) || "";
          const bStart = b?.startTime?.slice(0, 5) || "";
          if (aStart && bStart && aStart !== bStart) return aStart.localeCompare(bStart);

          // Final tie-breaker: preserve existing order if possible.
          return (a?.order_index ?? 0) - (b?.order_index ?? 0);
        });

        setSessions(sorted);
      } catch (error) {
        console.error("Error fetching sessions:", error);
        setSessions([]);
      }
    };

    fetchSessions();
  }, [backend, invoiceId, setSessions]);
};


