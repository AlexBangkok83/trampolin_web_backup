# Trampolin Web – Architecture Overview

```
+------------+       HTTP        +--------------------+
|  Browser   |  <----------->    | Next.js App Router |
+------------+                   +---------+----------+
                                            |
                                            | Server Components
                                            v
                                   +---------------------+
                                   |  React Components   |
                                   +---------------------+
                                            |
                         ISR / SSR / Static Rendering    |
                                            v
                                   +---------------------+
                                   |   Edge Runtime      |
                                   +---------+-----------+
                                             |
                                             | REST / GraphQL (future)
                                             v
                                   +---------------------+
                                   |  PostgreSQL (db)    |
                                   +---------------------+
```

## Layers

1. **Presentation (Next.js App Router)**
   - File-system based routing in `src/app/`
   - React Server Components for data fetching & rendering

2. **UI Components**
   - `src/components/` houses reusable Tailwind-styled components.

3. **Domain Logic**
   - Encapsulated in `src/lib/` (e.g., `env.ts` helper).

4. **Data Layer**
   - PostgreSQL via Prisma (to be added). Environment variable `DATABASE_URL` defined in `.env`.

## Local Development Stack

- **Next.js dev server** at `http://localhost:3000`
- **PostgreSQL** container via Docker Compose (`db` service).

Run:

```bash
docker compose up --build
```

## Production Deployment

Multi-stage `Dockerfile` builds an optimized image (Node 20-alpine-slim). Use any container platform:

```bash
docker build -t trampolin-web .
docker run -p 3000:3000 -e NODE_ENV=production trampolin-web
```

## Future Enhancements

- Auth (NextAuth.js)
- SaaS billing (Stripe)
- Background jobs (BullMQ + Redis)
- Observability (OpenTelemetry)
