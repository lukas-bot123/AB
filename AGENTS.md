# Charter Agent Instructions

## Product

This repository is for Charter.

Charter is a serious, focused, iPhone-first chapter event app for fraternity/sorority chapter event coordination.

Use `CHARTER_MASTER_CONTEXT.md` for the full product vision and V1 roadmap. That roadmap is context only; it does not authorize building future sprints early.

Charter V1 is only about one core workflow:

event creation -> RSVP -> live check-in -> attendance visibility

Everything in the app should orbit the event.

## Hard Scope Boundary

Do not add unrelated features:

- no payments
- no dues
- no fundraising
- no chat
- no social feed
- no documents
- no alumni features
- no elections
- no polls
- no AI features
- no broad chapter operating system
- no unnecessary dashboards
- no fake platform expansion

The goal is not to maximize features. The goal is to make the core event workflow excellent.

## Build Discipline

Do not attempt to build the whole product at once.

Implement one sprint at a time.

If asked to work on Sprint 1, do not build Sprint 2.
If asked to work on Sprint 2, do not build Sprint 3.
Never jump ahead unless explicitly instructed.

Do not add placeholder features that pretend future functionality exists.
Do not leave fake product data in place once real data integration begins.
Do not expand the product beyond the sprint acceptance criteria.

## Tech Stack

Use:

- Expo React Native
- TypeScript
- Expo Router
- Supabase for auth/database
- clean reusable components
- service functions for data access
- clear domain types

## Architecture Standards

Use a clean project structure:

- app/
- components/
- lib/
- services/
- types/
- supabase/

Screens should compose components and call service functions.

Do not cram business logic directly into screens.

Prefer:

- typed models
- reusable UI primitives
- small focused components
- clear service files
- explicit permission checks
- readable naming
- simple state management

Avoid:

- giant files
- scattered hardcoded logic
- duplicated query logic
- generic admin-dashboard UI
- overabstracted architecture
- premature libraries
- clever complexity

## UX Standards

The app should feel native, calm, fast, and iPhone-first.

Members need simplicity.
Officers need control.

Every screen should answer a clear user question.

Important states must be obvious:

- RSVP state
- required/optional state
- check-in not open
- check-in open
- already checked in
- wrong code
- check-in closed
- attendance status

Every async action must handle:

- loading state
- success state
- error state

## Security and Permissions

Only authenticated users can use protected app screens.

Users should only see their own chapter's data.

Officers can:

- create events
- start/close check-in
- view RSVP summaries
- view attendance summaries
- manually correct attendance

Members can:

- view chapter events
- RSVP only for themselves
- check in only for themselves

Members cannot:

- create events
- modify other members' RSVPs
- modify other members' attendance
- access officer actions

Use Supabase Row Level Security when implementing real tables and data access.

## Implementation Process

Before coding:

1. Inspect the existing project structure.
2. Briefly explain the implementation plan.
3. List the major files that will be created or modified.
4. Confirm the sprint boundary.

While coding:

1. Implement small, coherent changes.
2. Keep files focused.
3. Prefer fixing architecture instead of patching around problems.
4. Do not add future-sprint features.

After coding:

1. Run TypeScript checks if available.
2. Run lint checks if available.
3. Run the app if possible.
4. Report what changed.
5. Report any remaining issues honestly.

## Success Standard

This should be built like a real startup product, not a hackathon demo.

Quality matters more than feature count.

Charter V1 succeeds when:

A real officer can create a required event.
A real member can see it and RSVP.
The officer can see expected attendance.
The officer can start check-in.
The member can enter the code and be marked present.
The officer can see actual attendance and correct exceptions.
