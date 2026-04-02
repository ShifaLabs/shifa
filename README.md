# Shifa - Digital Healthcare Platform

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-149ECA)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-4EA94B)](https://www.mongodb.com/)
[![Stream Video](https://img.shields.io/badge/Video-Stream.io-0E76FD)](https://getstream.io/video/)

Shifa is a full-stack healthcare web application for patients, doctors, and admins. It combines appointment booking, doctor onboarding, video consultation, chat, payments, and operational dashboards in one platform.

## Live Links

- Live Demo: <https://shifa-medi.vercel.app>
- GitHub Repo: <https://github.com/ShifaLabs/shifa>
- API Docs: Coming soon
- Demo Video: Not available yet

## Preview

Add screenshots/GIFs here after deployment:

- Landing Page
- Doctor/Patient Dashboard
- Video Consultation Room

Example markdown:

```md
![Landing](public/screenshots/landing.png)
![Dashboard](public/screenshots/dashboard.png)
![Video Call](public/screenshots/video-call.png)
```

## Why This Project

Healthcare workflows are often fragmented between booking, communication, and consultation systems. Shifa brings these flows together in a single product:

- Patients can discover doctors and book consultation slots.
- Doctors can register, get approved, and manage appointments.
- Admins can oversee users, operations, and platform health.
- Consultations can happen directly in-browser through video sessions.

## Core Features

- Doctor registration and admin approval workflow
- Appointment scheduling and slot management
- Video consultations with responsive participant grid
- Real-time communication modules (chat + contact)
- Payment integration with SSLCommerz
- Hospital discovery with map-based UI
- Admin analytics and management modules
- Blog/content sections and public informational pages

## Tech Stack

### Frontend

- Next.js App Router (v16)
- React (v19)
- Tailwind CSS v4
- Framer Motion
- Shadcn UI / Radix UI

### Backend and Data

- Next.js API routes
- MongoDB
- NextAuth (credentials + OAuth support)
- Zod + React Hook Form

### Integrations

- Stream.io Video SDK
- SSLCommerz payments
- Cloudinary media upload
- Google OAuth
- Nodemailer / Resend (email workflows)
- Leaflet / React Leaflet (maps)

## Project Structure

```text
src/
 app/
  (public)/        # marketing, landing, blogs, contact, doctors
  (auth)/          # login, register, password reset, verify-email
  (protected)/     # dashboard, provider, consultation
  api/             # backend route handlers by domain
 modules/           # domain modules: appointment, doctor, auth, payment, video, etc.
 infrastructure/    # auth config, env config, db connection/indexes, shared hooks
 shared/            # shared components, constants, UI primitives, utils
```

## Modules At A Glance

- `appointment`: booking lifecycle, status management, doctor/patient flows
- `doctor`: onboarding, profile, availability and related APIs
- `video`: session/token flows and call-related business logic
- `payment`: SSLCommerz integration and callbacks
- `chat`: communication features for users
- `admin`: analytics and platform governance
- `hospital`: discovery/listing and nearby support
- `auth` and `user`: account lifecycle and profile management

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database (Atlas or local)
- Stream.io account (for video features)
- Cloudinary account (for media upload)
- SSLCommerz merchant credentials (if testing payments)

### Installation

```bash
git clone https://github.com/ShifaLabs/shifa
cd shifa
npm install
```

### Environment Setup

Create `.env.local` in the project root and add:

```env
# Database
MONGO_URI=
DB_NAME=

# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Email
EMAIL_USER=
EMAIL_PASS=

# SSLCommerz
STORE_ID=
STORE_PASSWD=
SSL_MODE=sandbox
SANDBOX_LINK=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_UPLOAD_PRESET=

# Stream.io
STREAM_API_KEY=
STREAM_SECRET=
STREAM_WEBHOOK_SECRET=

# Cron Security
CRON_SECRET=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

Reference: `docs/notes/ENV_EXAMPLE.md`

## Running The App

```bash
# development
npm run dev

# lint
npm run lint

# custom import validation
npm run verify:imports

# production build (runs verify:imports via yarn in script)
npm run build

# production build without import verification
npm run build:raw

# start production server
npm run start
```

Notes:

- `npm run build` uses `yarn verify:imports` inside `package.json`; make sure Yarn is installed or use `npm run build:raw`.
- Local app default: `http://localhost:3000`

## First Test Flow

1. Start app and register a user account.
2. Create or approve a doctor profile (admin workflow).
3. Book an appointment as a patient.
4. Open a consultation/video session.
5. Test payment flow in sandbox mode.

## API Surface (High Level)

Domain API groups are organized under `src/app/api`, including:

- `auth`, `profile`, `users`
- `doctors`, `appointments`, `slots`
- `video`, `chat`
- `payment`
- `hospitals`, `ambulance`, `contact`
- `admin`, `health`

For detailed API documentation, add your API docs link in the Live Links section.

## Documentation Index

Detailed project notes are available in `docs/notes`:

- `DOCTOR_REGISTRATION_SYSTEM.md`
- `VIDEO_CALL_DEMO_README.md`
- `GRID_QUICK_REFERENCE.md`
- `IMPLEMENTATION_SUMMARY.md`
- `ENV_EXAMPLE.md`

## Troubleshooting

- Build/import issues: run `npm run verify:imports`
- Auth callback/sign-in issues: verify `NEXTAUTH_URL` and OAuth credentials
- Video token/session issues: verify Stream keys and webhook secret
- Payment callback issues: verify SSLCommerz credentials and mode
- Upload issues: verify Cloudinary environment variables

## Contribution

If you want to contribute:

1. Fork the repository
2. Create a feature branch
3. Commit focused changes
4. Open a pull request with clear context and screenshots (if UI changes)

## Repository Checklist For GitHub

- Add API docs URL when available
- Add demo video URL when available
- Add screenshots under `public/screenshots`
- Add a LICENSE file if you want explicit open-source licensing
- Add deployment badge(s) after CI/CD is configured

## Author

This is a team project. Maintained by Sojib.

- LinkedIn: <https://www.linkedin.com/in/sojibahmed-me>
- GitHub: <https://github.com/aminur-islam-sojib>
