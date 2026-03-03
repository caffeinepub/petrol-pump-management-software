# Petrol Pump Management Software

## Current State
The app has a User Management page (`/user-management`) where the Owner can create users with a name, a 5-level permission dropdown (Owner, Admin, Manager, Staff, Viewer), and an optional Internet Identity Principal ID. The current user role hook grants Owner access in bootstrap mode (no users) and falls back to Viewer for unrecognized principals.

## Requested Changes (Diff)

### Add
- A simple "Can Edit & Make Modifications" toggle/checkbox in the Add/Edit User form, displayed directly below the user name field.
- When the toggle is ON → user gets "Admin" permission (full access except User Management).
- When the toggle is OFF → user gets "Viewer" permission (read-only, Dashboard only).
- A clear label explaining what the toggle does ("Allow this user to edit data and make modifications").
- The Owner role is always preserved for the logged-in owner; the toggle only applies to other users.

### Modify
- Replace the 5-level permission dropdown in the user form with the simple toggle approach.
  - The internal `PermissionLevel` type and store remain unchanged (backward compat).
  - The form no longer exposes the raw permission dropdown to the owner when creating non-owner users.
  - The permission reference card at the bottom of the page is updated to reflect the simplified two-level model (Owner = full access, Edit-enabled user = can modify, View-only user = read-only).
- The "Permission Level" column in the users table is updated to show a friendly label: "Can Edit" or "View Only" (badge), with Owner remaining amber/special.

### Remove
- The raw "Permission Level" select dropdown from the Add/Edit User form (replaced by the toggle).

## Implementation Plan
1. Update `UserFormModal` in `UserManagement.tsx`:
   - Remove the `Select` for permission level.
   - Add a `Switch` (or `Checkbox`) toggle below the name field labeled "Allow this user to edit data and make modifications".
   - Map toggle state → `permissionLevel`: ON = "Admin", OFF = "Viewer".
   - Pre-populate toggle correctly when editing a user (Admin/Manager/Owner/Staff → ON, Viewer → OFF; Owner users keep their level untouched).
2. Update the permission badge / table column to show "Can Edit", "View Only", or "Owner" labels instead of the raw level names.
3. Update the Permission Level Reference card to reflect the simplified two-tier model.
4. No backend or store changes needed.
