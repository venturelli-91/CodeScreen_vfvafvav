# Red Planet Staffing

A full-stack workforce management application for the Martian colony. Manage workers, workplaces, and shifts — all in one place.

## Stack

| Layer        | Technology                     |
| ------------ | ------------------------------ |
| Frontend     | React 18 + Vite + TypeScript   |
| UI           | Material UI v6 + Framer Motion |
| State / Data | TanStack Query v5              |
| Routing      | React Router v6                |
| Backend      | NestJS 10 + TypeScript         |
| ORM          | Prisma 6                       |
| Database     | SQLite                         |
| Testing      | Vitest + Testing Library + MSW |

## Prerequisites

- Node.js ≥ 18
- npm ≥ 9

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/venturelli-91/Red_planet_shifts.git
cd Red_planet_shifts
```

### 2. Start the backend

```bash
cd server
npm install
npx prisma migrate dev --name init   # creates ./prisma/dev.db
npx ts-node prisma/seed/index.ts     # seed sample data (optional)
npm run start:dev                    # http://localhost:3000
```

### 3. Start the frontend

```bash
cd client
npm install
npm run dev                          # http://localhost:5173
```

The Vite dev server proxies all `/api` requests to `localhost:3000` automatically.

## Available Scripts

### Client (`cd client`)

| Script               | Description                         |
| -------------------- | ----------------------------------- |
| `npm run dev`        | Start development server            |
| `npm run build`      | Type-check and build for production |
| `npm test`           | Run all tests (Vitest, single run)  |
| `npm run test:watch` | Run tests in watch mode             |

### Server (`cd server`)

| Script              | Description                   |
| ------------------- | ----------------------------- |
| `npm run start:dev` | Start server with hot-reload  |
| `npm run build`     | Compile TypeScript to `dist/` |
| `npm start`         | Run compiled production build |

## API Routes

| Method   | Path                       | Description                               |
| -------- | -------------------------- | ----------------------------------------- |
| `GET`    | `/workplaces`              | List all workplaces                       |
| `POST`   | `/workplaces`              | Create a workplace                        |
| `PATCH`  | `/workplaces/:id`          | Update a workplace                        |
| `DELETE` | `/workplaces/:id`          | Delete a workplace (no active shifts)     |
| `GET`    | `/workers`                 | List all workers                          |
| `POST`   | `/workers`                 | Create a worker                           |
| `PATCH`  | `/workers/:id`             | Update a worker                           |
| `DELETE` | `/workers/:id`             | Delete a worker                           |
| `GET`    | `/workers/claims?workerId` | List shifts claimed by a worker           |
| `GET`    | `/shifts`                  | List all shifts (with worker & workplace) |
| `POST`   | `/shifts`                  | Create a shift                            |
| `POST`   | `/shifts/:id/claim`        | Claim a shift for a worker                |
| `POST`   | `/shifts/:id/cancel`       | Cancel a claimed shift                    |

## Project Structure

```
Red_planet_shifts/
├── client/                  # React frontend
│   ├── src/
│   │   ├── api/             # Typed API client
│   │   ├── pages/           # Dashboard, Shifts, Workers, Workplaces + tests
│   │   ├── test/            # MSW handlers, test wrapper, global setup
│   │   └── ErrorBoundary.tsx
│   ├── vite.config.ts
│   └── package.json
└── server/                  # NestJS backend
    ├── src/
    │   ├── shifts/          # Controller, Service, DTO (end > start validation)
    │   ├── workers/         # Controller, Service, DTO (CRUD)
    │   └── workplaces/      # Controller, Service, DTO (CRUD, delete guard)
    └── prisma/
        ├── schema.prisma
        └── seed/            # Sample data seeder
```

## Data Model

```
Worker    { id, name, trade, createdAt }
Workplace { id, name, address, createdAt }
Shift     { id, start, end, trade, workplaceId, workerId?, cancelled, createdAt }
```

A shift is **open** when `workerId` is null and `cancelled` is false. Only workers whose `trade` matches the shift are eligible to claim it.
