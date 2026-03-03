# Specification

## Summary
**Goal:** Fix form reset logic so that initializing or mounting form modals only clears local React form state and never deletes or overwrites saved records in the Zustand store or database.

**Planned changes:**
- Fix `PurchaseOrderFormModal` reset logic to only clear local component state on mount, not global store collections.
- Fix `SupplierFormModal` reset logic to only clear local component state on mount, not global store collections.
- Fix `StaffFormModal` reset logic to only clear local component state on mount, not global store collections.
- Fix `ShiftFormModal` reset logic to only clear local component state on mount, not global store collections.
- Fix `Expenses` form reset logic to only clear local component state on mount, not global store collections.
- Ensure no Zustand store actions that overwrite or empty record arrays are called during form initialization or page load.

**User-visible outcome:** All form modals open with blank fields for new entries on page load, while all previously saved records (purchase orders, suppliers, staff, shifts, expenses) remain visible and intact.
