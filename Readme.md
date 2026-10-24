# Fundoo Backend

REST API for **Fundoo Keep**, a Google Keep–style note-taking app built on the MERN stack. It handles authentication (email/password and Google), notes, labels, collaboration, reminders, and background email delivery.

> Frontend repository:https://github.com/GauravMittal2712/Fundoo_Frontend_IN_MERN_Stack.git
> Backend repository:https://github.com/GauravMittal2712/Fundoo_Backend_IN_MERN_Stack.git

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [API Reference](#api-reference)
- [Data Models](#data-models)
- [Background Jobs and Email Queue](#background-jobs-and-email-queue)
- [Caching](#caching)
- [Security](#security)
- [Logging and Error Handling](#logging-and-error-handling)
- [Connecting the Frontend](#connecting-the-frontend)
- [Author](#author)

---

## Features

### Authentication and Account
- **Register** with first name, last name, email, and a strong password (8–72 chars with upper, lower, number, and special character)
- **Login** with email and password, returning a JWT (default expiry `7d`)
- **Google Sign-In**: the Google ID token is verified server-side against your client ID. A returning Google user logs straight in, an existing email account is linked to Google (its notes stay intact), and a new user is created automatically
- **Forgot / reset password** via emailed link. The reset token is random, stored only as a SHA-256 hash, and expires in 15 minutes. The forgot-password response is identical for known and unknown emails, so accounts can't be discovered
- **Welcome email** on sign-up
- **Profile**: view and update first name, last name, and profile image
- **Delete account**: permanent, and requires re-confirming identity with the password (or a fresh Google credential for Google accounts). All of the user's data is removed

### Notes
- Create, read, update, and delete notes (title up to 200 chars, description up to 5000 chars)
- **Colors** per note
- **Pin** notes (pinned notes are sorted first, then by most recently updated)
- **Archive**, **Trash**, and **Restore**, plus permanent delete
- **Search** across note titles and descriptions (case-insensitive)
- Filtered lists: active, archived, and trashed notes

### Labels
- Create, rename, and delete labels (unique per user, up to 100 chars)
- Attach or detach a label on a note
- Fetch all notes carrying a given label
- Deleting a label removes it from every note that used it

### Collaboration
- Share a note with another registered user by email
- Collaborators receive an **email notification** when added
- View a note's collaborator list (owner and collaborators only)
- Owner can remove collaborators (by collaborator ID or by email)
- **Shared with me**: list all notes others have shared with you
- **Permission model**: collaborators can edit only a note's **title, description, and color**. Pinning, archiving, trashing, deleting, labels, reminders, and collaborator management are owner-only and return `403` for collaborators

### Reminders
- Set a reminder date/time on a note (must be in the future), then fetch or remove it
- List all notes that have reminders, ordered by reminder time
- A **scheduler runs every minute** and emails the owner when a reminder is due
- Reminders are claimed atomically, so multiple server instances never send duplicate emails

### Reliable Email Delivery
- Emails are published to a **RabbitMQ** queue and sent by a separate worker process
- Failed sends are **retried up to 5 times, one minute apart**, then parked in a `.failed` queue for inspection
- Email types: welcome, password reset, collaborator added, and reminder

### Platform
- **Redis caching** for notes, labels, and profile (5-minute TTL, invalidated on every change)
- Request validation with **Joi** on every write endpoint
- Centralised error handling with a consistent JSON response shape
- File-based logging with **Winston** and HTTP request logging with **Morgan**
- Health-check endpoint at `GET /health`

---

## Tech Stack

| Area | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express 4 |
| Database | MongoDB with Mongoose 8 |
| Cache | Redis (ioredis) |
| Message queue | RabbitMQ (amqplib) |
| Auth | JWT (jsonwebtoken), bcryptjs, Google Auth Library |
| Validation | Joi |
| Email | Nodemailer (Gmail SMTP) |
| Security | Helmet, CORS |
| Logging | Winston, Morgan |
| Config | dotenv |
| Dev tooling | Nodemon |

---

## Architecture

The code follows a layered design, so each layer has one job:

```
Route  ->  Validation  ->  Controller  ->  Service  ->  Repository  ->  MongoDB
                                             |
                                             +-->  Redis cache
                                             +-->  RabbitMQ  ->  Email worker  ->  SMTP
```

- **Routes** define endpoints and attach auth and validation middleware
- **Controllers** handle the HTTP request and response
- **Services** hold business logic, permission checks, caching, and queue publishing
- **Repositories** are the only layer that talks to Mongoose models

---

## Project Structure

```
Fundoo_backend/
├── src/
│   ├── config/          # MongoDB and Redis connections
│   ├── constants/       # Shared response messages
│   ├── controllers/     # auth, note, label, collaborator, profile
│   ├── middlewares/     # auth (JWT), validate (Joi), notFound, error handler
│   ├── models/          # User, Note, Label, Collaborator schemas
│   ├── repositories/    # Database access layer
│   ├── routes/          # Route definitions
│   ├── services/        # Business logic and email job producers
│   ├── utils/           # logger, cache, mailer, rabbitmq, reminderScheduler, ApiError
│   ├── validations/     # Joi schemas
│   ├── workers/         # email.worker.js (RabbitMQ consumer)
│   ├── app.js           # Express app setup
│   └── server.js        # Entry point
├── logs/                # app.log and error.log (git-ignored)
├── .env.example
└── package.json
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ and npm
- [MongoDB](https://www.mongodb.com/) (local or Atlas)
- [Redis](https://redis.io/)
- [RabbitMQ](https://www.rabbitmq.com/)
- A Gmail account with an [App Password](https://support.google.com/accounts/answer/185833) for sending mail
- *(Optional)* A Google OAuth Client ID, if you want Google Sign-In

> The server connects to RabbitMQ on startup, so it must be running before you start the API.

---

## Getting Started

```bash
# 1. Clone
git clone https://github.com/GauravMittal2712/Fundoo_Backend_IN_MERN_Stack.git
cd Fundoo_Backend_IN_MERN_Stack

# 2. Install dependencies
npm install

# 3. Create your env file
cp .env.example .env
# then fill in the values (see below)
```

Quick way to start Redis and RabbitMQ with Docker:

```bash
docker run -d --name redis -p 6379:6379 redis
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

---

## Environment Variables

Create a `.env` file in the project root:

| Variable | Description | Example |
|---|---|---|
| `PORT` | API port | `5000` |
| `NODE_ENV` | `development` or `production`. In development, error responses include stack traces | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/fundoo` |
| `JWT_SECRET` | Secret used to sign tokens. Use a long random string | `your_jwt_secret` |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `REDIS_URL` | Redis connection URL | `redis://127.0.0.1:6379` |
| `RABBITMQ_URL` | RabbitMQ connection URL | `amqp://localhost:5672` |
| `RABBITMQ_EMAIL_QUEUE` | Name of the email queue | `welcome-email` |
| `MAIL_USER` | Gmail address used to send mail | `you@gmail.com` |
| `MAIL_PASSWORD` | Gmail **app password** | `xxxx xxxx xxxx xxxx` |
| `CLIENT_URL` | Frontend URL, used to build links in emails | `http://localhost:5173` |
| `GOOGLE_CLIENT_ID` | *(Optional)* Google OAuth client ID. Without it, `/auth/google` returns `503` | `xxxx.apps.googleusercontent.com` |

> `GOOGLE_CLIENT_ID` is read by the code but is not in `.env.example`, so add it yourself if you use Google Sign-In.
> Never commit your real `.env`. It is already listed in `.gitignore`.

---

## Running the App

The API and the email worker are **two separate processes**. Run both:

```bash
# Terminal 1: API server (with auto-reload)
npm run dev

# Terminal 2: email worker
npm run worker:email
```

For production, use `npm start` instead of `npm run dev`.

| Script | Purpose |
|---|---|
| `npm run dev` | Start the API with nodemon |
| `npm start` | Start the API with node |
| `npm run worker:email` | Start the RabbitMQ email consumer |

The API is available at `http://localhost:5000`. Quick check: `GET http://localhost:5000/health` returns `{ "status": "ok" }`.

---

## API Reference

**Base URL:** `/api/v1`

All routes except those under **Auth** require a header:

```
Authorization: Bearer <jwt_token>
```

### Auth: `/api/v1/auth`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Create an account |
| POST | `/login` | Log in, returns `{ token, user }` |
| POST | `/google` | Log in or sign up with a Google credential (`{ credential }`) |
| POST | `/forgot-password` | Email a reset link (`{ email }`) |
| POST | `/reset-password/:token` | Set a new password (`{ password }`) |

### Notes: `/api/v1/notes`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Create a note |
| GET | `/` | List notes. Use `?type=active` (default), `archived`, or `trash` |
| GET | `/search?q=term` | Search title and description |
| GET | `/reminders` | Notes that have reminders |
| GET | `/:id` | Get one note |
| PUT | `/:id` | Update a note (owner, or collaborator for title/description/color only) |
| DELETE | `/:id` | Permanently delete a note (owner only) |
| PATCH | `/:id/archive` | Archive |
| PATCH | `/:id/trash` | Move to trash |
| PATCH | `/:id/restore` | Restore from archive or trash |
| POST | `/:noteId/reminder` | Set reminder (`{ dateTime }`, ISO date in the future) |
| GET | `/:noteId/reminder` | Get reminder |
| DELETE | `/:noteId/reminder` | Remove reminder |

### Labels: `/api/v1/labels`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Create a label (`{ name }`) |
| GET | `/` | List your labels |
| PUT | `/:labelId` | Rename a label |
| DELETE | `/:labelId` | Delete a label (also removes it from notes) |
| POST | `/:labelId/notes/:noteId` | Add a label to a note |
| DELETE | `/:labelId/notes/:noteId` | Remove a label from a note |
| GET | `/:labelId/notes` | Notes with this label |

### Collaborators: `/api/v1/collaborators`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Add a collaborator (`{ noteId, email }`) |
| GET | `/shared-notes` | Notes shared with you |
| GET | `/:noteId` | List collaborators of a note |
| DELETE | `/:collaboratorId` | Remove a collaborator by ID |
| DELETE | `/:noteId/:email` | Remove a collaborator by email |

### Profile: `/api/v1/profile`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Get your profile |
| PUT | `/` | Update first name, last name, or profile image |
| DELETE | `/` | Delete your account (`{ password }` or `{ credential }`) |

### Example

```bash
# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Asha","lastName":"Rao","email":"asha@example.com","password":"Str0ng#Pass"}'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"asha@example.com","password":"Str0ng#Pass"}'

# Create a note
curl -X POST http://localhost:5000/api/v1/notes \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Groceries","description":"Milk, eggs","color":"#fff475"}'
```

### Error format

```json
{
  "success": false,
  "message": "Note not found",
  "data": null,
  "error": null,
  "timestamp": "2026-10-24T10:00:00.000Z"
}
```

`error` contains a stack trace only when `NODE_ENV=development`.

---

## Data Models

**User**: `firstName`, `lastName`, `email` (unique), `password` (optional for Google accounts), `googleId`, `profileImage`, password-reset token fields (hidden from queries by default)

**Note**: `userId`, `title`, `description`, `color`, `isPinned`, `isArchived`, `isTrashed`, `labels[]`, `reminder { dateTime, status, emailSent }`

**Label**: `userId`, `name` (unique per user)

**Collaborator**: `noteId`, `userId`, `email`, `addedBy` (unique per note and user)

All models include `createdAt` and `updatedAt`.

---

## Background Jobs and Email Queue

```
API / Reminder scheduler  ->  RabbitMQ queue  ->  Email worker  ->  Gmail SMTP
                                  |                   | on failure
                                  |                   v
                                  |             <queue>.retry  (waits 60s, then back to the main queue)
                                  |                   | after 5 failed retries
                                  |                   v
                                  +-------------> <queue>.failed  (kept for inspection)
```

- Queued job types: `WELCOME_EMAIL`, `RESET_PASSWORD_EMAIL`, `COLLABORATOR_ADDED_EMAIL`, `REMINDER_EMAIL`
- A mail-queue problem never blocks sign-up, sign-in, or adding a collaborator. The error is logged and the main action still succeeds
- The RabbitMQ connection auto-reconnects with backoff

---

## Caching

| Cache key | Contents | TTL |
|---|---|---|
| `notes:<userId>:<type>` | Note lists (active / archived / trash) | 5 min |
| `labels:<userId>` | A user's labels | 5 min |
| `profile:<userId>` | A user's profile | 5 min |

The relevant keys are cleared whenever notes, labels, reminders, or profile data change. When a collaborator edits a shared note, the **owner's** cache is cleared too, so they see the update immediately.

---

## Security

- Passwords hashed with **bcrypt**
- **JWT** authentication on all protected routes
- **Helmet** security headers
- **CORS** restricted to the frontend origin
- **Joi** validation on request bodies
- Password-reset tokens are hashed at rest and expire in 15 minutes
- Google ID tokens are verified for signature, expiry, and audience
- Account deletion requires identity re-confirmation
- Secrets live in `.env`, which is git-ignored

> **Note:** the allowed CORS origin is currently set to `http://localhost:5173` in `src/app.js`. Change it there when you deploy the frontend to another domain.

---

## Logging and Error Handling

- **Winston** writes to `logs/app.log` and `logs/error.log`
- **Morgan** pipes HTTP request logs into Winston
- Unknown routes return a `404` through the `notFound` middleware
- All errors pass through a central handler that returns the JSON shape above

---

## Connecting the Frontend

1. Start this backend on port `5000`.
2. In the frontend, set `VITE_API_URL=http://localhost:5000/api/v1`.
3. Make sure `CLIENT_URL` here matches the frontend URL, so email links work.

See the [frontend repository] : https://github.com/GauravMittal2712/Fundoo_Frontend_IN_MERN_Stack.git for UI setup.

---

## Author

**Gaurav Mittal**: [@GauravMittal2712](https://github.com/GauravMittal2712)

## License

This project is for learning and demonstration purposes.
