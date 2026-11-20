# Chanel Monroe chatbot review — 21 November 2026 (Brisbane)

Scope: public embedded and standalone enquiry interfaces, all seven booking categories, search, gallery selection, artist selection, question logic, estimates, calendar, validation, editing, reset, persistence, submission and notification handoff. This combines live UI observations with source review and automated tests; it is not a claim of exhaustive device or email-client certification.

## Original findings

Remediation: the booking-hours contract, shared CRM timing, group-size ordering, fee notice, reset recovery, tab-local drafts, phone validation, photo upload recovery, email retry/layout, accessible labels and confirmation wording have now been updated. See `chatbot-reliability-fixes.md` for validation and limits.

The table below records the original review.

## Confirmed findings

| Priority | Area | Finding and evidence | Recommended correction |
| --- | --- | --- | --- |
| High | Early appointments | Live bridal enquiry for 24 November, ready by 06:00, passes both pickers but final submit reports the slot unavailable. `buildRow()` sends `appointment_hours: early_3am_to_noon`; the SQL validator only recognises `extended` and otherwise requires a standard-hours start. Noon enquiry submitted successfully. | Align the payload and server hours contract; verify early and standard submissions. |
| High | Duration | Picker and database use three hours plus a one-hour buffer, but `calendarEvent()` calculates different durations by service, quantity, and bride. Full day is eight hours; four-person bridal is 4.5 hours. The picker is also shown before headcount. | Use the same duration and buffer in availability, validation, CRM and exported events; collect headcount before final availability. |
| Medium | Fees and hours | `activeQs()` explicitly omits `start_window`, so the configured additional-fee warning is never asked. The client forces start hours 03:00–12:00, while server generation extends later. | Make the intended hours clear and display the fee notice before choosing a non-standard slot. |
| Medium | Error recovery | Live slot rejection leaves Reset disabled. `submit()` disables it, then returns through the slot-error branch before re-enabling it. | Restore controls on every failed submission. |
| Medium | Draft recovery | Refreshing a standalone unfinished enquiry lost name, answers, photo references and artist picks. Only the sent record is persisted. | Provide an explicit, appropriately limited draft-resume mechanism. |
| Medium | Phone validation | The actual validator accepts `12345678` through its generic international fallback. Normal Australian formats work and alphabetic text is rejected. | Validate Australian mobiles and intentional international formats more precisely. |
| Medium | Notifications | The enquiry is considered sent before the email call completes; email HTTP error responses are not checked and rejected fetches are ignored. | Track delivery errors and provide a retry path without creating a duplicate enquiry. |
| Medium | Selfies | Upload errors only log warnings; the answer still reads Added and a failed upload can be omitted silently. Replacement upload callbacks refer to mutable `S.selfie`, potentially assigning an old path to a newer image. Source reviewed; camera/upload not live-tested. | Tie uploads to an immutable selection and show upload status, retry and failure. |
| Medium | Email layout | Notification table uses `white-space:nowrap` for a long consultation label; nested 24px padding reduces narrow-screen space. Reference image URLs are not normalised like the website gallery. Source-reviewed likely layout and image causes; recipient inbox rendering not inspected. | Use wrapping or stacked detail rows and absolute image links; verify actual received email on phone. |
| Low | Accessibility | Text inputs are created without explicit labels; calendar day group always says consultation, including makeup dates; add/remove selection toggles do not update their original accessible label. | Associate labels, identify the relevant calendar, and synchronise selection labels/state. |
| Low | Pending requests | A successfully submitted pending enquiry immediately blocks overlapping times in subsequent enquiries. Observed live. | Confirm this is the intended hold policy and provide expiry/release rules if needed. |
| Low | Confirmation wording | Sent view uses booking-confirmation language for a pending phone consultation. | Clearly distinguish enquiry receipt, consult approval, and confirmed makeup booking. |

## Checks that passed

- Standard glam enquiry saved and displayed a pending phone consultation confirmation.
- Short-notice consult selection allowed an explicit approval exception.
- Busy times greyed out; past dates and after-makeup consults rejected by calendar checks.
- Reset worked before submission; back navigation allowed changing appointment date.
- All seven booking categories and their catalogue styles were present.
- Style keyword search, case/punctuation handling, partial words and unknown-query handling passed tests.
- Gallery reference and artist selection appeared together under My picks with correct counts.
- Sample selected photographer linked to their Instagram profile.
- Lesson focus supported selecting multiple preferences.
- Name and email rejection and email typo suggestions behaved as configured.
- Pricing service-prefill, reference-navigation and retired Cal.com checks passed automated tests.
- Expanded aliases resolve to existing catalogue entries without changing prices or booking selection rules.

## Change delivered during review

Expanded the style phrase dictionary across all catalogue styles, including lessons, with everyday descriptions, occasions, colours, techniques, spelling variations and useful conversational filler handling. Source and published copies match. Added representative query coverage for each style.

## Limits and next steps

- One clearly labelled fictional standard enquiry was saved in production during the initial review. The rejected early enquiry was not reported as saved. Further selection tests used local practice mode.
- Actual iPhone/Android keyboard, camera permissions, screen-reader operation, narrow viewport rendering and received-email clients remain unverified. Responsive CSS and relevant UI code were inspected.
- No payment was made. Stripe webhooks, staff approval actions, Apple/Google calendar delivery and email inbox delivery were not exercised in this chatbot review.
- The availability defect and other findings above are documented, not fixed by the search update.
