import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── Types ───────────────────────────────────────────────────────────────────

export type PermissionLevel =
  | "Owner"
  | "Admin"
  | "Manager"
  | "Staff"
  | "Viewer";

export interface AppUser {
  id: string;
  name: string;
  permissionLevel: PermissionLevel;
  createdAt: string; // ISO date string
  principalId?: string; // optional: Internet Identity principal
}

// Permission hierarchy: Owner > Admin > Manager > Staff > Viewer
export const PERMISSION_HIERARCHY: PermissionLevel[] = [
  "Viewer",
  "Staff",
  "Manager",
  "Admin",
  "Owner",
];

/**
 * Returns true if the user's level meets or exceeds the required level.
 */
export function canAccess(
  userLevel: PermissionLevel,
  requiredLevel: PermissionLevel,
): boolean {
  return (
    PERMISSION_HIERARCHY.indexOf(userLevel) >=
    PERMISSION_HIERARCHY.indexOf(requiredLevel)
  );
}

// ─── Store State & Actions ────────────────────────────────────────────────────

interface OwnerState {
  users: AppUser[];
  addUser: (user: Omit<AppUser, "id" | "createdAt">) => void;
  updateUser: (id: string, updates: Partial<Omit<AppUser, "id">>) => void;
  deleteUser: (id: string) => void;
}

export const useOwnerStore = create<OwnerState>()(
  persist(
    (set) => ({
      users: [],

      addUser: (user) =>
        set((state) => ({
          users: [
            ...state.users,
            {
              ...user,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updateUser: (id, updates) =>
        set((state) => ({
          users: state.users.map((u) =>
            u.id === id ? { ...u, ...updates } : u,
          ),
        })),

      deleteUser: (id) =>
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
        })),
    }),
    {
      name: "owner-store",
    },
  ),
);
