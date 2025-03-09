import { createContext, ReactNode, useEffect, useState } from "react";

import { Spinner } from "@chakra-ui/react";

import type { User as DbUser, User } from "../types/user";
import { auth } from "../utils/auth/firebase";
import { useBackendContext } from "./hooks/useBackendContext";

type DbUserRole = DbUser["role"];

interface RoleContextProps {
  role: DbUserRole | undefined;
  loading: boolean;
  editPerms: boolean;
}

export const RoleContext = createContext<RoleContextProps | null>(null);

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const { backend } = useBackendContext();

  const [role, setRole] = useState<DbUserRole | undefined>();
  const [loading, setLoading] = useState(true);
  const [editPerms, setEditPerms] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      try {
        if (user) {
          const response = await backend.get(`/users/${user.uid}`);


          setRole((response.data as User[]).at(0)?.role);
          setEditPerms((response.data as User[]).at(0)?.editPerms ?? false);
        } else {
          setRole(undefined);
          setEditPerms(false);
        }
      } catch (e) {
        console.error(`Error setting role: ${e.message}`);
        setRole(undefined);
        setEditPerms(false);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [backend]);

  return (
    <RoleContext.Provider value={{ role, loading, editPerms }}>
      {loading ? <Spinner /> : children}
    </RoleContext.Provider>
  );
};
