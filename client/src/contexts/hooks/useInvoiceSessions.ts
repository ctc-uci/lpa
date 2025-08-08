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
        setSessions(data);
      } catch (error) {
        console.error("Error fetching sessions:", error);
        setSessions([]);
      }
    };

    fetchSessions();
  }, [backend, invoiceId, setSessions]);
};


