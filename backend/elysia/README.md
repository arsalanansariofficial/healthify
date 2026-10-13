# Healthify API

A modern healthcare backend built with TypeScript, Elysia, Bun, and Drizzle ORM. It powers patient, doctor, organization, and appointment workflows with a secure authentication layer and modular API design.

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Elysia](https://img.shields.io/badge/Elysia-API-000000?logo=elysia&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-1.x-FBF0DF?logo=bun&logoColor=black)
![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?logo=sqlite&logoColor=white)

## Overview

Healthify is a healthcare-focused backend for managing:

- Users and profiles
- Doctors and specializations
- Organizations and team membership
- Appointment scheduling and status flows
- Secure authentication and role-based access
- File uploads and user-generated media

The project uses a domain-based modular structure so each healthcare capability can evolve independently while sharing a common authentication, configuration, and persistence layer.

## Features

- Secure authentication with Better Auth
- GitHub OAuth integration
- Email-based account flows and session management
- Organization and membership support
- Doctor and specialization management
- Appointment lifecycle management
- File upload handling for public assets
- Service-oriented API modules with shared validation utilities
- SQLite-first setup with Drizzle migrations
- Developer-friendly Bun workflow with hot reloading

## Tech Stack

- TypeScript
- Bun runtime
- Elysia framework
- Drizzle ORM
- SQLite database
- Better Auth
- Zod validation
- Nodemailer for email delivery
- Static asset hosting via public directory

## Project Structure

```text
backend/elysia/
├── public/                  # Static files and uploaded assets
├── src/
│   ├── lib/                 # Shared config, auth, DB, validation, sessions
│   ├── modules/             # Feature modules
│   │   ├── appointment/
│   │   ├── doctor/
│   │   ├── organization/
│   │   ├── specialization/
│   │   └── user/
│   ├── index.ts             # Process startup entry
│   ├── server.ts            # Elysia app setup
│   └── ...
├── tests/                   # Test fixtures and specs
├── .env.example             # Sample environment configuration
├── .gitignore
├── eslint.config.js
├── package.json
├── tsconfig.json
├── README.md
└── bun.lock
```

## Prerequisites

Before running the project, make sure you have:

- Bun installed
- Node.js 20 or newer
- A configured environment file based on `.env.example`

## Getting Started

1. Install dependencies:

```bash
bun install
```

2. Create your local environment file:

```bash
cp .env.example .env
```

3. Update the values in `.env` to match your local setup.

4. Start the development server:

```bash
bun run dev
```

The server runs with Bun watch mode and exposes the API under the `/api` prefix.

## Database

This backend uses Drizzle with SQLite by default, configured via `src/lib/db/config.ts` and the schema in `src/lib/db/schema.ts`.

Common database commands:

```bash
bun run db:generate
bun run db:migrate
bun run db:push
```

If you want to initialize or reset the local development database, use the configured scripts and environment files as needed.

## Authentication

The project includes Better Auth integration and a GitHub OAuth configuration flow. The default authentication setup includes token management, user sessions, and role-aware logic.

To generate an auth-related artifact or bootstrap admin flows, use:

```bash
bun run auth:generate
bun run auth:generate:admin
```

## Useful Scripts

```bash
bun run dev
bun run build:js
bun run build:bin
bun run db:generate
bun run db:migrate
bun run db:push
bun run secret
bun run fix
bun test
```

## Environment Variables

Use `.env.example` as the reference for required settings, including:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `SMTP_URL`
- `BASE_URL`
- `PORT`
- `UPLOAD_DIR`
- `NODE_ENV`

The project validates environment variables using Zod, so invalid or missing values will fail fast during startup.

## Development Notes

- The API uses a shared `src/lib` layer for configuration, error handling, pagination, and utilities.
- Modules are isolated under `src/modules`, which keeps service logic, payload validation, and models organized by domain.
- Static files and uploads are served from the `public` directory.

## Author

Arsalan Ansari

- Website: https://arsalanansariofficial.github.io/arsalanansariofficial
- LinkedIn: https://www.linkedin.com/in/arsalanansariofficial/
- Email: theansaricompany@gmail.com
