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
  username: string;
  passwordHash: string; // simple SHA-256 hex string
  permissionLevel: PermissionLevel;
  createdAt: string;
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

/** Simple non-cryptographic hash (good enough for local-only auth). */
export async function hashPassword(password: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(password),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ─── Store State & Actions ────────────────────────────────────────────────────

interface OwnerState {
  users: AppUser[];
  /** ID of the currently logged-in user (null = logged out). */
  activeUserId: string | null;
  /** Whether first-time owner setup has been completed. */
  ownerSetupDone: boolean;

  // Auth actions
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;

  // User management actions (owner only)
  addUser: (
    user: Omit<AppUser, "id" | "createdAt" | "passwordHash">,
    plainPassword: string,
  ) => Promise<void>;
  updateUser: (
    id: string,
    updates: Partial<Omit<AppUser, "id" | "createdAt">>,
    newPlainPassword?: string,
  ) => Promise<void>;
  deleteUser: (id: string) => void;

  /** Called once to create the owner account during first-time setup. */
  setupOwner: (
    name: string,
    username: string,
    password: string,
  ) => Promise<void>;
}

export const useOwnerStore = create<OwnerState>()(
  persist(
    (set, get) => ({
      users: [],
      activeUserId: null,
      ownerSetupDone: false,

      login: async (username, password) => {
        const hash = await hashPassword(password);
        const user = get().users.find(
          (u) =>
            u.username.toLowerCase() === username.toLowerCase() &&
            u.passwordHash === hash,
        );
        if (user) {
          set({ activeUserId: user.id });
          return true;
        }
        return false;
      },

      logout: () => set({ activeUserId: null }),

      setupOwner: async (name, username, password) => {
        const hash = await hashPassword(password);
        const owner: AppUser = {
          id: crypto.randomUUID(),
          name,
          username,
          passwordHash: hash,
          permissionLevel: "Owner",
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          users: [...state.users, owner],
          ownerSetupDone: true,
          activeUserId: owner.id,
        }));
      },

      addUser: async (user, plainPassword) => {
        const hash = await hashPassword(plainPassword);
        set((state) => ({
          users: [
            ...state.users,
            {
              ...user,
              passwordHash: hash,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
            },
          ],
        }));
      },

      updateUser: async (id, updates, newPlainPassword) => {
        const hash = newPlainPassword
          ? await hashPassword(newPlainPassword)
          : undefined;
        set((state) => ({
          users: state.users.map((u) =>
            u.id === id
              ? {
                  ...u,
                  ...updates,
                  ...(hash ? { passwordHash: hash } : {}),
                }
              : u,
          ),
        }));
      },

      deleteUser: (id) =>
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
          activeUserId: state.activeUserId === id ? null : state.activeUserId,
        })),
    }),
    {
      name: "owner-store",
    },
  ),
);
