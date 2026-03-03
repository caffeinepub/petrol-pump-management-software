import {
  PERMISSION_HIERARCHY,
  type PermissionLevel,
  canAccess,
  useOwnerStore,
} from "../store/ownerStore";

export { canAccess };
export { PERMISSION_HIERARCHY };

/**
 * Returns the current user's permission level.
 * - If owner setup has NOT been completed → returns "Owner" (bootstrap mode).
 * - Otherwise, finds the active user by ID and returns their permission level.
 * - Falls back to "Viewer" if no active user is found.
 */
export function useCurrentUserRole(): PermissionLevel {
  const ownerSetupDone = useOwnerStore((s) => s.ownerSetupDone);
  const activeUserId = useOwnerStore((s) => s.activeUserId);
  const users = useOwnerStore((s) => s.users);

  // Bootstrap: setup not done yet → treat as Owner
  if (!ownerSetupDone) {
    return "Owner";
  }

  if (!activeUserId) return "Viewer";

  const match = users.find((u) => u.id === activeUserId);
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
