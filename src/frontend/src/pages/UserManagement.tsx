import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit2, Plus, Shield, Trash2, Users } from "lucide-react";
import { motion } from "motion/react";
import React, { useState } from "react";
import {
  type AppUser,
  type PermissionLevel,
  useOwnerStore,
} from "../store/ownerStore";

// ─── Permission badge colours ─────────────────────────────────────────────────

function PermissionBadge({ level }: { level: PermissionLevel }) {
  if (level === "Owner") {
    return (
      <Badge
        variant="outline"
        className="text-xs font-semibold bg-amber-500/20 text-amber-400 border-amber-500/40 hover:bg-amber-500/30"
      >
        Owner
      </Badge>
    );
  }
  if (level === "Viewer") {
    return (
      <Badge
        variant="outline"
        className="text-xs font-semibold bg-slate-500/20 text-slate-400 border-slate-500/40 hover:bg-slate-500/30"
      >
        View Only
      </Badge>
    );
  }
  // Admin, Manager, Staff → "Can Edit"
  return (
    <Badge
      variant="outline"
      className="text-xs font-semibold bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30"
    >
      Can Edit
    </Badge>
  );
}

// ─── Add/Edit modal ───────────────────────────────────────────────────────────

interface UserFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editUser?: AppUser | null;
}

function canEditFromLevel(level: PermissionLevel): boolean {
  return (
    level === "Owner" ||
    level === "Admin" ||
    level === "Manager" ||
    level === "Staff"
  );
}

function UserFormModal({ open, onOpenChange, editUser }: UserFormModalProps) {
  const { addUser, updateUser } = useOwnerStore();

  const [name, setName] = useState(editUser?.name ?? "");
  const [canEdit, setCanEdit] = useState<boolean>(
    canEditFromLevel(editUser?.permissionLevel ?? "Admin"),
  );
  const [principalId, setPrincipalId] = useState(editUser?.principalId ?? "");
  const [errors, setErrors] = useState<{ name?: string }>({});

  // Sync form when editUser changes
  React.useEffect(() => {
    if (open) {
      setName(editUser?.name ?? "");
      setCanEdit(canEditFromLevel(editUser?.permissionLevel ?? "Admin"));
      setPrincipalId(editUser?.principalId ?? "");
      setErrors({});
    }
  }, [open, editUser]);

  const validate = () => {
    const errs: typeof errors = {};
    if (!name.trim()) errs.name = "Name is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    // Determine final permission level
    // If editing an Owner, keep them as Owner (no downgrade)
    const resolvedLevel: PermissionLevel =
      editUser?.permissionLevel === "Owner"
        ? "Owner"
        : canEdit
          ? "Admin"
          : "Viewer";

    if (editUser) {
      updateUser(editUser.id, {
        name: name.trim(),
        permissionLevel: resolvedLevel,
        principalId: principalId.trim() || undefined,
      });
    } else {
      addUser({
        name: name.trim(),
        permissionLevel: resolvedLevel,
        principalId: principalId.trim() || undefined,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md bg-card border-border"
        data-ocid="user.dialog"
      >
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {editUser ? "Edit User" : "Add New User"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="user-name" className="text-foreground text-sm">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="user-name"
              placeholder="e.g. Rahul Mehta"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background border-border text-foreground"
              data-ocid="user.input"
            />
            {errors.name && (
              <p
                className="text-xs text-destructive"
                data-ocid="user.error_state"
              >
                {errors.name}
              </p>
            )}
          </div>

          {/* Edit Permissions Toggle */}
          {editUser?.permissionLevel !== "Owner" && (
            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
              <Switch
                id="user-can-edit"
                checked={canEdit}
                onCheckedChange={setCanEdit}
                className="mt-0.5 shrink-0"
                data-ocid="user.toggle"
              />
              <div className="space-y-0.5">
                <Label
                  htmlFor="user-can-edit"
                  className="text-foreground text-sm font-medium cursor-pointer"
                >
                  Allow this user to edit data and make modifications
                </Label>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  When enabled, the user can add, edit, and delete records. When
                  disabled, the user can only view the dashboard.
                </p>
              </div>
            </div>
          )}
          {editUser?.permissionLevel === "Owner" && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
              <Shield className="h-4 w-4 text-amber-400 shrink-0" />
              <p className="text-xs text-amber-400 font-medium">
                Owner accounts always have full access and cannot be downgraded.
              </p>
            </div>
          )}

          {/* Principal ID (optional) */}
          <div className="space-y-1.5">
            <Label htmlFor="user-principal" className="text-foreground text-sm">
              Internet Identity Principal{" "}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="user-principal"
              placeholder="e.g. abcd1-efgh2-..."
              value={principalId}
              onChange={(e) => setPrincipalId(e.target.value)}
              className="bg-background border-border text-foreground font-mono text-xs"
              data-ocid="user.input"
            />
            <p className="text-xs text-muted-foreground">
              Link this user to an Internet Identity principal for automatic
              role detection.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-border text-foreground hover:bg-muted"
            data-ocid="user.cancel_button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            data-ocid="user.save_button"
          >
            {editUser ? "Save Changes" : "Add User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function UserManagement() {
  const { users, deleteUser } = useOwnerStore();

  const [formOpen, setFormOpen] = useState(false);
  const [editUser, setEditUser] = useState<AppUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AppUser | null>(null);

  const openAdd = () => {
    setEditUser(null);
    setFormOpen(true);
  };

  const openEdit = (user: AppUser) => {
    setEditUser(user);
    setFormOpen(true);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteUser(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/20 border border-primary/30">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              User Management
            </h1>
            <p className="text-sm text-muted-foreground">
              Create and manage user accounts and permissions
            </p>
          </div>
        </div>

        <Button
          onClick={openAdd}
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 self-start sm:self-auto"
          data-ocid="user.open_modal_button"
        >
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </motion.div>

      {/* Stats card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {(
          [
            {
              label: "Total Users",
              value: users.length,
              color: "text-foreground",
              icon: Users,
            },
            {
              label: "Owners",
              value: users.filter((u) => u.permissionLevel === "Owner").length,
              color: "text-amber-400",
              icon: Shield,
            },
            {
              label: "Can Edit",
              value: users.filter(
                (u) =>
                  u.permissionLevel === "Admin" ||
                  u.permissionLevel === "Manager" ||
                  u.permissionLevel === "Staff",
              ).length,
              color: "text-emerald-400",
              icon: Shield,
            },
            {
              label: "View Only",
              value: users.filter((u) => u.permissionLevel === "Viewer").length,
              color: "text-slate-400",
              icon: Users,
            },
          ] as const
        ).map((stat) => (
          <div
            key={stat.label}
            className="bg-card border border-border rounded-xl p-4"
          >
            <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="bg-card border border-border rounded-xl overflow-hidden"
      >
        {users.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 px-4 text-center"
            data-ocid="user.empty_state"
          >
            <div className="p-4 rounded-full bg-muted mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-base font-medium text-foreground mb-1">
              No users yet
            </p>
            <p className="text-sm text-muted-foreground mb-5">
              Add your first user to get started.
            </p>
            <Button
              onClick={openAdd}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              data-ocid="user.primary_button"
            >
              <Plus className="h-4 w-4" />
              Add First User
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto" data-ocid="user.table">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-semibold">
                    #
                  </TableHead>
                  <TableHead className="text-muted-foreground font-semibold">
                    Name
                  </TableHead>
                  <TableHead className="text-muted-foreground font-semibold">
                    Permission Level
                  </TableHead>
                  <TableHead className="text-muted-foreground font-semibold hidden md:table-cell">
                    Principal ID
                  </TableHead>
                  <TableHead className="text-muted-foreground font-semibold hidden sm:table-cell">
                    Created Date
                  </TableHead>
                  <TableHead className="text-muted-foreground font-semibold text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user, idx) => (
                  <TableRow
                    key={user.id}
                    className="border-border hover:bg-muted/40 transition-colors"
                    data-ocid={`user.item.${idx + 1}`}
                  >
                    <TableCell className="text-muted-foreground text-sm w-10">
                      {idx + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                          <span className="text-primary text-xs font-bold">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-foreground font-medium text-sm">
                          {user.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <PermissionBadge level={user.permissionLevel} />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {user.principalId ? (
                        <span className="text-xs font-mono text-muted-foreground truncate max-w-[160px] block">
                          {user.principalId}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground/50">
                          —
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm hidden sm:table-cell">
                      {new Date(user.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                          onClick={() => openEdit(user)}
                          aria-label={`Edit ${user.name}`}
                          data-ocid={`user.edit_button.${idx + 1}`}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteTarget(user)}
                          aria-label={`Delete ${user.name}`}
                          data-ocid={`user.delete_button.${idx + 1}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </motion.div>

      {/* Permission reference */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, delay: 0.2 }}
        className="bg-card border border-border rounded-xl p-4"
      >
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          Permission Level Reference
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {(
            [
              {
                level: "Owner" as PermissionLevel,
                desc: "Full access including User Management",
              },
              {
                level: "Admin" as PermissionLevel,
                desc: "Can add, edit, and delete all records",
              },
              {
                level: "Viewer" as PermissionLevel,
                desc: "Dashboard access only (read-only)",
              },
            ] as const
          ).map(({ level, desc }) => (
            <div
              key={level}
              className="flex flex-col gap-1 p-2.5 rounded-lg bg-muted/40 border border-border"
            >
              <PermissionBadge level={level} />
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Add/Edit Modal */}
      <UserFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        editUser={editUser}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent
          className="bg-card border-border"
          data-ocid="user.dialog"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Delete User
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete{" "}
              <span className="text-foreground font-medium">
                {deleteTarget?.name}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-border text-foreground hover:bg-muted"
              data-ocid="user.cancel_button"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
              data-ocid="user.confirm_button"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
