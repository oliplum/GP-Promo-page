# Vercel Postgres Setup Guide

## Step 1: Create Vercel Postgres Database

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Navigate to your project (promo_site)
3. Click on the **Storage** tab
4. Click **Create Database**
5. Select **Postgres**
6. Choose a region close to your users
7. Click **Create**

## Step 2: Connect Database to Project

1. After creation, Vercel will automatically add these environment variables to your project:
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
   - `POSTGRES_USER`
   - `POSTGRES_HOST`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_DATABASE`

2. Update your `lib/db.ts` to use the Vercel environment variable:
   - The current setup already uses `process.env.DATABASE_URL`
   - Vercel sets `POSTGRES_URL` by default, so either:
     - Keep using `DATABASE_URL` and set it to `POSTGRES_URL` in Vercel
     - Or change your code to use `POSTGRES_URL` directly

## Step 3: Run Database Schema

### Option A: Using Vercel Dashboard (Recommended)
1. In Vercel Storage, click on your Postgres database
2. Click on the **Query** tab
3. Copy the contents of `db/schema.sql` and paste into the query editor
4. Click **Run Query**

### Option B: Using Vercel CLI
```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Pull environment variables (including database URL)
vercel env pull .env.local

# Then use a PostgreSQL client to run the schema:
psql <POSTGRES_URL> -f db/schema.sql
```

## Step 4: Export and Import Your Local Data

### Export from local database:
```bash
# Export data from your local GP_Promo database
pg_dump -h localhost -U postgres -d GP_Promo --data-only --inserts -t events -t presenters -t event_presenters > db/data.sql
```

### Import to Vercel Postgres:
1. Copy the `POSTGRES_URL` from Vercel dashboard
2. Run the import:
```bash
psql "<POSTGRES_URL>" -f db/data.sql
```

Or manually insert via Vercel Query interface.

## Step 5: Set Additional Environment Variables in Vercel

Go to Project Settings → Environment Variables and add:

- `NEXT_PUBLIC_PAYPAL_CLIENT_ID` (your PayPal client ID)
- `PAYPAL_CLIENT_SECRET` (your PayPal secret)
- `PAYPAL_MODE` = `sandbox` or `production`
- `PAYPAL_API_URL` (PayPal API URL)
- `AWS_ACCESS_KEY_ID` (your AWS key)
- `AWS_SECRET_ACCESS_KEY` (your AWS secret)
- `AWS_REGION` = `us-east-1`
- `AWS_S3_BUCKET_VIDEOS` = `cpdg-video`
- `AWS_S3_BUCKET_IMAGES` = `cpdg-images`

**Note:** All NEXT_PUBLIC_* variables are exposed to the browser.

## Step 6: Verify Configuration

After setup:
1. Go to your Vercel deployment
2. Check the logs for any database connection errors
3. Test the `/api/events` endpoint

## Step 7: Update lib/db.ts (if needed)

If you want to use connection pooling:

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export default pool;
```

## Troubleshooting

- **Connection timeout**: Make sure to use `POSTGRES_URL` (pooled connection)
- **SSL errors**: Add `ssl: { rejectUnauthorized: false }` for production
- **Too many connections**: Use Vercel's pooled connection URL

## Local Development

Keep your `.env.local` with local database for development:
```
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/GP_Promo
```

The `DATABASE_URL` from Vercel will only be used in production.
