# Nxteraa Website

Next.js storefront for Nxteraa with Prisma-backed data, custom auth routes, admin tools, and PhonePe checkout.

## Setup

1. Install dependencies:

```bash
npm.cmd install
```

2. Copy the example environment file and fill in your values:

```bash
Copy-Item .env.example .env.local
```

3. Initialize the database:

```bash
npm.cmd run db:setup
```

## Run Locally

Start the latest app in development mode:

```bash
npm.cmd run dev
```

Open [http://localhost:3000](http://localhost:3000). The root route redirects to `/home`.

## Required Environment Variables

- `DATABASE_URL`: Prisma database connection string
- `SESSION_SECRET`: secret used for session signing
- `ADMIN_EMAIL`: email allowed to access admin screens
- See `.env.example` for all required environment variables

## Useful Scripts

- `npm.cmd run dev`: start the dev server
- `npm.cmd run build`: generate Prisma client and create a production build
- `npm.cmd run lint`: run ESLint on app and lib code
- `npm.cmd run db:setup`: push Prisma schema and seed the database
