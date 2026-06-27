# Charter Master Context

## Important Execution Rule

This document defines the product vision and full V1 roadmap.

Do not implement the entire roadmap at once.

Build Charter one sprint at a time. Each sprint must have clear acceptance criteria and must stop before future-sprint work begins.

## Product Vision

We are building Charter.

Charter is a serious, focused, iPhone-first chapter event app for fraternity/sorority chapter event coordination.

This is not a toy prototype.
This is not a broad Greek-life platform.
This is not a vibe-coded demo.

The goal is to build a focused, clean, reliable V1 with excellent architecture, polished UX, and careful attention to product quality.

## Core Product Workflow

Charter helps chapter officers run events cleanly.

The V1 workflow is:

Officer creates an event
-> members see the event
-> members RSVP yes/no/maybe
-> officer sees expected attendance
-> officer starts live check-in
-> app generates a 4-digit code
-> members enter the code
-> attendance is recorded
-> officer sees attendance summary and can manually correct exceptions

Everything in this app should orbit the event.

## Explicit Non-Goals

Do not add:

- payments
- dues
- fundraising
- chat
- social feed
- documents
- alumni features
- elections
- polls
- AI features
- broad chapter operating system behavior
- unnecessary dashboards
- bloated CRM behavior

The goal is not to maximize features. The goal is to make the core event workflow excellent.

## Product Principles

1. Members need simplicity.
2. Officers need control.
3. The event is the central object.
4. Every screen should answer a clear user question.
5. No feature should exist unless it strengthens the event workflow.
6. The app should feel fast, clean, and trustworthy.
7. Empty states, loading states, and error states matter.
8. Avoid clever complexity.
9. Prefer clarity.
10. Mobile cards/lists are better than dense tables on iPhone.

## User Roles

There are two roles:

- officer
- member

The user who creates a chapter becomes an officer automatically.

Users who join by invite code become members by default.

Officers can manage events and attendance.
Members can RSVP and check in for themselves.

## Required V1 Screens

### 1. Auth

Purpose: let users securely enter the app.

Required:

- login
- signup
- logout
- protected routing
- session persistence
- logged-out users cannot access protected screens
- signed-in users should stay signed in

### 2. No Chapter / Chapter Setup

Purpose: handle authenticated users who are not yet in a chapter.

Required:

- create chapter
- join chapter by invite code
- invalid invite code error
- success state after joining
- first chapter creator becomes officer
- invite-code joiners become members

### 3. Member Home

Purpose: answer, "What do I need to do?"

Show:

- upcoming required events
- events needing RSVP
- check-in currently available
- recently completed/missed events
- simple chapter context

### 4. Events List

Purpose: show all relevant chapter events.

Show:

- event title
- date/time
- location
- required/optional badge
- member RSVP status
- check-in status if active
- navigation to event detail

### 5. Event Detail - Member View

Purpose: let the member understand and act on one event.

Show:

- title
- date/time
- location
- description
- required/optional badge
- RSVP buttons: Yes / No / Maybe
- current RSVP state
- check-in code input when check-in is open
- success/error state for check-in
- placeholder Add to Calendar button only; do not build deep calendar integration yet

### 6. Officer Board

Purpose: answer, "What needs my attention?"

Show:

- upcoming events
- RSVP summaries
- expected attendance
- check-in status
- attendance summaries
- create event button
- clear distinction between required and optional events

### 7. Create Event

Purpose: allow officers to create a clean event.

Fields:

- title
- date/time
- location
- description
- required/optional toggle

Validation:

- title required
- date/time required
- location optional but encouraged
- show errors clearly
- avoid allowing broken empty events

### 8. Officer Event Detail

Purpose: let officers manage one event.

Show:

- event details
- RSVP counts: yes/no/maybe/no response
- expected attendance based on RSVP yes count
- Start Check-In button
- active 4-digit check-in code
- check-in open/closed state
- attendance summary: present/absent/late/excused
- member attendance list
- manual correction buttons: Present / Absent / Late / Excused
- clear post-event summary

### 9. Members Screen

Purpose: show the current chapter roster.

Show:

- member names
- role: officer/member
- basic attendance/RSVP context only if simple

Do not overbuild member profiles.

## Data Model

Use Supabase tables for the real V1 data model.

### profiles

- id
- full_name
- email
- created_at

### chapters

- id
- name
- university
- invite_code
- created_at

### chapter_members

- id
- chapter_id
- profile_id
- role: officer/member
- created_at

### events

- id
- chapter_id
- created_by
- title
- description
- location
- starts_at
- ends_at
- is_required
- checkin_code
- checkin_opens_at
- checkin_closes_at
- created_at

### rsvps

- id
- event_id
- profile_id
- status: yes/no/maybe
- created_at
- updated_at
- unique event_id + profile_id

### attendance

- id
- event_id
- profile_id
- status: present/absent/late/excused
- checked_in_at
- method: code/manual
- created_at
- updated_at
- unique event_id + profile_id

## Permission Rules

Only authenticated users can use the app.

Users should only see their own chapter's events.

Officers can:

- create events
- manage events
- start check-in
- close check-in
- view RSVP counts
- view attendance
- manually correct attendance

Members can:

- RSVP only for themselves
- check in only for themselves
- view events for their chapter

Members cannot:

- modify other members' RSVPs
- modify other members' attendance
- create events
- access officer actions

## Check-In Rules

When an officer starts check-in:

- generate a 4-digit code from 1000-9999
- save the code on the event
- set checkin_opens_at
- show the code clearly to the officer
- members can submit the code while check-in is open

When a member submits a code:

- if code is correct, upsert attendance as present
- if code is wrong, show a clear error
- if check-in is closed, show a clear error
- if member is already checked in, show already-checked-in state
- wrong code should not create attendance

Officers can manually mark:

- present
- absent
- late
- excused

## Edge Cases

Handle:

- logged-in user has no chapter
- invalid invite code
- event has no RSVPs yet
- event has no attendance yet
- check-in is not open
- check-in code is wrong
- check-in is closed
- member already checked in
- non-officer tries to access officer action
- database request fails
- empty loading states
- failed mutations
- missing optional event location

## Architecture

Use a clean folder structure.

Suggested structure:

- app/
- components/
- lib/
- services/
- types/
- supabase/

Screens should compose components and call service functions.

Do not cram all logic into screens.

## V1 Sprint Roadmap

### Sprint 1: Foundation

Goal: clean app shell, auth wiring, routing, and reusable UI primitives.

Build:

- Expo Router navigation
- Supabase client setup
- login/signup
- protected routing
- auth session persistence
- basic dashboard placeholder after login
- logout
- reusable UI primitives

Do not build chapter, event, RSVP, check-in, or attendance functionality yet.

### Sprint 2: Chapter System

Goal: authenticated users can create or join a chapter.

Build:

- no-chapter state
- create chapter flow
- join chapter by invite code
- generate invite code
- create chapter_members rows
- first creator becomes officer
- invite-code joiners become members
- members screen
- active chapter loading

### Sprint 3: Events

Goal: officers can create events and members can view events.

Build:

- create event screen
- event validation
- events list
- member event detail
- officer event detail shell
- required/optional badge
- Supabase event service functions

### Sprint 4: RSVP

Goal: members can RSVP and officers can see expected attendance.

Build:

- RSVP buttons
- RSVP upsert
- current RSVP state
- RSVP counts
- no-response count
- expected attendance calculation

### Sprint 5: Live Check-In

Goal: officers can start check-in and members can check in with a code.

Build:

- Start Check-In button
- 4-digit code generation
- check-in open/closed state
- member code input
- present attendance upsert
- wrong code error
- already checked-in handling

### Sprint 6: Officer Attendance Board

Goal: officers can manage actual attendance.

Build:

- member attendance list
- RSVP status beside each member
- attendance status beside each member
- manual correction buttons
- attendance summary
- post-event summary

### Sprint 7: Quality Pass

Goal: make the app ready for a small TestFlight pilot.

Build/fix:

- visual polish
- loading states
- empty states
- error states
- permission checks
- navigation polish
- remove dead buttons
- remove fake unused logic
- TypeScript cleanup
- runtime issue cleanup

## V1 Success Definition

A real officer can create a required event.
A real member can see it and RSVP.
The officer can see expected attendance.
The officer can start check-in.
The member can enter the code and be marked present.
The officer can see actual attendance and correct exceptions.

That is Charter V1.
