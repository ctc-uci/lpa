import { Navigate } from "react-router-dom";

import { useAuthContext } from "../contexts/hooks/useAuthContext";
import { useRoleContext } from "../contexts/hooks/useRoleContext";

interface ProtectedRouteProps {
  element: JSX.Element;
  allowedRoles?: string | string[];
}

export const ProtectedRoute = ({
  element,
  allowedRoles = [],
}: ProtectedRouteProps) => {
  const { currentUser } = useAuthContext();
  const { role, editPerms } = useRoleContext();

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  const isValidRole = getIsValidRole(roles, role, editPerms);
  return currentUser && isValidRole ? (
    element
  ) : currentUser ? (
    role === "admin" && editPerms ? (
      <Navigate to={"/programs"} />
    ) : (
      <Navigate to={"/dashboard"} />
    )
  ) : (
    <Navigate to={"/"} />
  );
};

/**
 * Helper function for determining if a user may access a route based on their role.
 * If no allowed roles are specified, or if the user is an admin, they are authorized. Otherwise, their role must be within the list of allowed roles.
 *
 * @param roles a list of roles which may access this route
 * @param role the current user's role
 */
function getIsValidRole(roles: string[], role: string | undefined, editPerms: boolean) {
  if (roles.includes('admin')) {
    return editPerms === true
  }

  return (
    roles.length === 0 ||
    (role !== undefined && roles.includes(role)) ||
    role === "admin"
  );
}
