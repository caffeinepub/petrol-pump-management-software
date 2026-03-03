import {
  PERMISSION_HIERARCHY,
  type PermissionLevel,
  canAccess,
  useOwnerStore,
} from "../store/ownerStore";
import { useInternetIdentity } from "./useInternetIdentity";

export { canAccess };
export { PERMISSION_HIERARCHY };

/**
 * Returns the current user's permission level.
 * - If no users have been created yet, returns "Owner" (bootstrap mode).
 * - Otherwise, looks up the logged-in principal in the user list.
 * - Falls back to "Viewer" if the principal is not found.
 */
export function useCurrentUserRole(): PermissionLevel {
  const { identity } = useInternetIdentity();
  const { users } = useOwnerStore();

  // Bootstrap: no users yet → treat as Owner
  if (users.length === 0) {
    return "Owner";
  }

  const principalStr = identity?.getPrincipal().toString();
  if (!principalStr) return "Viewer";

  const match = users.find((u) => u.principalId === principalStr);
  return match?.permissionLevel ?? "Viewer";
}

// Route-level access map (minimum required permission)
export const ROUTE_ACCESS: Record<string, PermissionLevel> = {
  "/user-management": "Owner",
  "/staff": "Manager",
  "/suppliers": "Manager",
  "/billing": "Manager",
  "/expenses": "Manager",
  "/sales": "Staff",
  "/inventory": "Staff",
  "/customers": "Staff",
  "/reports": "Staff",
  "/other": "Manager",
  "/": "Viewer",
};

/**
 * Returns true if the given role may access the given pathname.
 */
export function canAccessRoute(
  role: PermissionLevel,
  pathname: string,
): boolean {
  // Check exact match first, then prefix match for dynamic routes
  const required =
    ROUTE_ACCESS[pathname] ??
    Object.entries(ROUTE_ACCESS).find(
      ([route]) => route !== "/" && pathname.startsWith(route),
    )?.[1] ??
    "Viewer";

  return canAccess(role, required);
}
