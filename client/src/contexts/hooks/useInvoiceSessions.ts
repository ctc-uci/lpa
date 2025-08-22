import { useEffect } from "react";

import { useBackendContext } from "./useBackendContext";
import { useSessionStore, Session } from "../../stores/useSessionStore";

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
        
        // Sort sessions by datetime
        const sortedSessions = data.slice().sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
        
        // Sort adjustment values within each session by order_index
        const sessionsWithSortedAdjustments = sortedSessions.map(session => ({
          ...session,
          adjustmentValues: session.adjustmentValues
            .slice()
            .sort((a, b) => {
              const aOrderIndex = a.order_index ?? 0;
              const bOrderIndex = b.order_index ?? 0;
              return aOrderIndex - bOrderIndex;
            })
        }));
        console.log("sessionsWithSortedAdjustments", sessionsWithSortedAdjustments)
        setSessions(sessionsWithSortedAdjustments);
      } catch (error) {
        console.error("Error fetching sessions:", error);
        setSessions([]);
      }
    };

    fetchSessions();
  }, [backend, invoiceId, setSessions]);
};


