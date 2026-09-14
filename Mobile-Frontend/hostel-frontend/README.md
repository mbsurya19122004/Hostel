# Hostelly — Hostel Management frontend

A mobile-first React app for the hostel management backend (Express + MongoDB,
routes mounted under `/user`). Covers admin, student, and worker roles: OTP
login, dashboards, complaints, fees & installments, rooms, mess menu, bus
schedule, KYC, announcements, lunchbox booking/collection, and outings.

## Setup

```bash
npm install
cp .env.example .env   # then set VITE_API_URL to your backend, e.g.
                        # http://localhost:3000/user
npm run dev
```

Build for production with `npm run build` (outputs to `dist/`).

## Backend requirements

- The backend must send `Access-Control-Allow-Credentials: true` and set
  `origin` to your frontend's exact URL (not `*`) in its CORS config, since
  this app sends the auth cookie with every request (`withCredentials: true`).
- Login is OTP-based: submit an email on the login screen, then the 6-digit
  code emailed to you. Admins and students each have their own login
  endpoint; workers log in the same way once an admin has registered them.
- Registering students and workers, and most write actions, require an
  admin session — sign in as an admin first to set up rooms, register
  students/workers, post the mess menu, etc.

## Notes on a few flows

- **Student/user IDs**: a few admin actions (removing a student, editing
  their course/guardian info) need the underlying user's Mongo `_id`, which
  the backend doesn't return from every endpoint. The app carries that id
  along when you navigate from the Students list — if you land on a student's
  detail page any other way, those two actions will ask you to reopen it
  from the list.
- **Outings**: the backend doesn't expose a "my current outing" lookup, so
  the app remembers your active outing locally on the device you applied
  from, so you can mark yourself back.

## Structure

- `src/api/api.js` — one function per backend endpoint
- `src/context/AuthContext.jsx` — session state (role + basic profile)
- `src/components/Layout.jsx` — top bar, drawer nav, bottom tab bar
- `src/pages/*` — one file per feature area, role-aware where a feature is
  shared between admin/student/worker
