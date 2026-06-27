# Charter

Charter is an iPhone-first chapter event app for fraternity and sorority chapter event coordination.

V1 focuses on one workflow:

event creation -> RSVP -> live check-in -> attendance visibility

Sprint 1 establishes the Expo React Native, TypeScript, Expo Router, and Supabase auth foundation. It does not include chapter setup, events, RSVP, check-in, attendance, or officer workflows yet.

## Run Locally

Copy the environment template and fill in your Supabase project values:

```sh
cp .env.example .env
```

Install dependencies and start Expo:

```sh
pnpm install
pnpm start
```

For web during local development:

```sh
pnpm web
```
