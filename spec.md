# Specification

## Summary
**Goal:** Build a Fuel Station Sales Tracker app where anyone can log fuel sales, view history, and see reporting summaries — no login required.

**Planned changes:**
- Backend: Create a persistent data model for fuel sale records (date/time, fuel type, quantity, price per litre, total amount, vehicle plate number, attendant name, payment method) with functions to create and retrieve records that survive canister upgrades.
- Frontend: Add a sales log form page with all required fields, auto-calculated total, and immediate post-submit history refresh.
- Frontend: Display a full sales history table sorted by most recent first, showing all 8 fields.
- Frontend: Add a reporting/summary section with daily totals (litres + revenue), fuel type breakdown, and a CSV export button.
- Frontend: Apply a consistent industrial theme — dark navy/charcoal background, amber/orange accents, bold sans-serif typography, card-based layout throughout.

**User-visible outcome:** Users can open the app without logging in, submit new fuel sale records via a form, browse the full persisted sales history, view daily and fuel-type summaries, and export all records as a CSV file — all styled with a dark industrial fuel-station theme.
