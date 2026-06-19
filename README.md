# TaskPilot

TaskPilot is a study and task planning app built with Next.js, Prisma, and Tailwind CSS. It helps users turn goals into actionable tasks, schedule focused study sessions, and compare planned work against actual progress.

## Features

- Dashboard with task columns for Backlog, Today, In Progress, and Done
- Manual task creation with title, description, deadline, estimate, priority, and status
- Task status updates and task deletion through API routes
- AI Planner for turning a free-form goal into a structured task preview
- OpenRouter integration using the OpenAI SDK with server-side API key handling
- Schedule generator that distributes Backlog and Today tasks across available study days
- Study session tracking with planned and completed minutes
- Plan vs Reality page with weekly progress metrics
- Daily Review form for logging completed minutes and notes
- Prisma seed data for local demos

## Tech Stack

- Next.js App Router
- TypeScript
- React
- Tailwind CSS
- Prisma
- SQLite for local development
- Zod for request and response validation
- OpenRouter via the OpenAI SDK

## Screenshots

Screenshots will be added here as the UI stabilizes.

- Dashboard
- AI Planner
- Schedule
- Plan vs Reality
- Daily Review

## Setup

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Run Prisma migrations:

```bash
npx prisma migrate dev
```

Seed local demo data:

```bash
npm run seed
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Create a `.env` file in the project root. Do not commit real secrets.

```bash
DATABASE_URL="file:./dev.db"
OPENROUTER_API_KEY="your-openrouter-api-key"
# Optional:
OPENROUTER_MODEL="your-preferred-openrouter-model"
```

`OPENROUTER_MODEL` is optional. If it is missing, the app uses the default model configured in `src/lib/openrouter.ts`.

## Prisma Migrations

Create and apply a new migration after changing `prisma/schema.prisma`:

```bash
npx prisma migrate dev --name your_migration_name
```

Apply existing migrations locally:

```bash
npx prisma migrate dev
```

Regenerate the Prisma client if needed:

```bash
npx prisma generate
```

## Seed Data

TaskPilot includes a Prisma seed script with realistic demo tasks and current-week study sessions.

Run:

```bash
npm run seed
```

The seed script is safe to rerun. It updates the fixed demo tasks and recreates only their demo study sessions.

## Development Commands

```bash
npm run dev
```

Start the local development server.

```bash
npm run lint
```

Run ESLint.

```bash
npm run build
```

Create a production build.

```bash
npm run start
```

Start the production server after building.

```bash
npm run seed
```

Load demo data into the local database.

## Known Limitations

- No authentication or user accounts yet
- No multi-user data separation yet
- No drag-and-drop task movement yet
- AI Planner output is previewed before saving, but still depends on model quality
- Scheduling uses simple local rules rather than calendar integration
- Local development uses SQLite
- No deployed production URL is configured in this README

## Future Improvements

- Add authentication and per-user workspaces
- Add drag-and-drop task movement
- Add recurring tasks and recurring study sessions
- Add calendar export or calendar provider sync
- Add richer analytics for plan accuracy over time
- Add automated tests for API routes and critical UI flows
- Add production deployment documentation once hosting is configured
