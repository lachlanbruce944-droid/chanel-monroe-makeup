# Consultation calendar

## Design trials

`site/booking-calendar-designs.html` provides three interactive mock layouts: soft tiles (recommended for the mobile chatbot), side by side, and minimal circles. Mock availability is clearly labelled and never creates bookings or sends messages.

## Proposed live flow

The implementation branch replaces the chatbot's consultation datetime field with the soft tiles monthly calendar. Clients choose a day, then an hourly start between 9 am and 4 pm, Monday–Sunday, in Australia/Brisbane time. Calls remain 15 minutes, within the 9 am–5 pm operating day. Requests remain pending Chanel's approval. Short-notice requests retain the existing owner exception requirement.

The availability RPC returns only month slots and availability booleans. It does not expose client names, contact details, booking IDs, service notes or exact busy-event records. Pending/approved incomplete consultations and confirmed makeup calendar time blocks exclude overlapping 15-minute slots. Confirmed makeup bookings without an exact time block protect the entire date. Lost bookings and completed calls release consultation availability. The RPC has a one-month request bound and a one-year scheduling horizon.

The picker checks availability again before accepting a time. A database trigger locks against the existing CRM calendar scheduling lock and rejects stale conflicts when the enquiry is submitted. CRM sync failures must roll back the request rather than silently accepting a time absent from the calendar. Existing enquiry creation still links the client profile and pending call through the CRM triggers.

## Activation status

The database migration request was declined by the approval tool, and a read-only check confirmed `consultation_availability(date)` is not installed. Production enquiry pages remain unchanged. Only the mock design page and its assets have been published. Live integration is prepared separately on `feature/crm-consultation-calendar`.

Before activating: approve and apply `supabase/consultation_availability.sql`, run transaction/rollback tests for opening hours, conflicts, pending requests, cancellation release and makeup time blocks, confirm anonymous availability exposes only slot fields, then publish the prepared enquiry pages. Browser testing of the isolated mock verified date selection, disabled busy times, hourly tiles and pending confirmation. The 18 website tests pass, including fresh-availability checks and failure states. No live enquiry or email was created.
