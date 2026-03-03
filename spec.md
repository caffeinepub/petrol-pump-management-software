# Specification

## Summary
**Goal:** Automatically reset all "new entry" form fields to blank when each form or modal mounts, ensuring no pre-populated values appear during fresh data entry.

**Planned changes:**
- Reset all fields to empty defaults on mount in PurchaseOrderFormModal (new entry mode)
- Reset all fields to empty defaults on mount in RecordSaleModal
- Reset all fields to empty defaults on mount in SupplierFormModal (new entry mode)
- Reset all fields to empty defaults on mount in StaffFormModal (new entry mode)
- Reset all fields to empty defaults on mount in RegisterCustomerModal (new entry mode)
- Reset all fields to empty defaults on mount in ShiftFormModal
- Reset all fields to empty defaults on mount in the Expense entry form
- Ensure edit/update forms opened for an existing record still pre-populate with that record's current values
- Leave all saved records in the store and database untouched

**User-visible outcome:** When opening any form to create a new record, all input fields are blank and ready for fresh data entry. Editing an existing record still shows that record's current data correctly.
