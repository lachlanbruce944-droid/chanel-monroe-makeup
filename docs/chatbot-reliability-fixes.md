# Chatbot reliability fixes — 21 November 2026 (Brisbane)

The website keeps makeup start times at 03:00–12:00 Brisbane time. The public calendar, final database validation and CRM event now share service durations from `crm_services` and the `appointmentBufferMins` setting. The existing one-hour website buffer is the initial stored setting; Chanel can change it in CRM Services. Four-person bridal combines one bride with three bridal-party services for both timing and estimate. Half-day and full-day services retain four and eight hours.

Group size now precedes availability. Ranges and “or more” ask for an exact count. A fee acknowledgement precedes the calendar. Ready-by times may have 15- or 30-minute values when the service duration requires them; appointment starts still use hourly increments.

Both database migrations are stored in the CRM repository. They preserve calendar locking, conflict checks, owner-only consultation approval, and the rule that the phone consultation finishes before makeup. The original public calendar endpoint remains for cached clients. The new endpoint returns candidate times and service timing only, never client records.

Failed inserts restore Reset and the editable summary. Retries reuse the same enquiry ID to recover safely when a save response is lost. Unfinished answers and selected references/artists survive a refresh in the same tab for up to 24 hours; Reset and successful submission clear that draft. A selfie is restored only if its upload completed. Upload failures offer retry, reselection or explicit continuation without the photo; old uploads cannot replace the current selfie path.

Email delivery is tracked independently from enquiry saving. A failure offers an email-only retry, without asking for another enquiry. The server stores delivery timestamps and uses provider idempotency keys. Emails use stacked wrapping rows, absolute image URLs, responsive container sizing and plain text. Approval language explicitly refers to the phone consultation and distinguishes the unconfirmed makeup booking.

Validation: 34 website tests pass. Database tests accept an early bridal start, reserve 270 minutes for a four-person bridal group, reserve 480 minutes for full-day service and reject overlaps including the buffer. Database fixtures ran in rolled-back transactions. No extra production enquiries were retained by these checks.

Limits: actual recipient email-client rendering and delivery are separate from template tests; phone camera permissions require a real-device check. Existing pending enquiries continue to reserve their requested slots until staff change their status; no expiry policy was imposed. No payment or consultation approval was executed by these fixes.
