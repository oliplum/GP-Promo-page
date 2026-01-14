# Neon Database Setup Guide for Vercel Deployment

## Step 1: Create Neon Account and Database

1. Go to https://neon.tech
2. Sign up with your GitHub account (same one linked to Vercel)
3. Click **Create a project**
4. Choose:
   - **Project name:** GP_Promo (or your choice)
   - **Region:** Choose closest to your users (e.g., US East for US users)
   - **Postgres version:** 16 (latest)
5. Click **Create project**

## Step 2: Get Your Connection String

After creation, Neon will show you a connection string:
```
postgresql://username:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**Copy this!** You'll need it for both Vercel and local testing.

## Step 3: Run the Database Schema

### Option A: Using Neon SQL Editor (Easiest)
1. In your Neon dashboard, click **SQL Editor** in the left sidebar
2. Copy the contents of `db/schema.sql`
3. Paste into the SQL Editor
4. Click **Run** (or Ctrl+Enter)
5. You should see "Query executed successfully"

### Option B: Using psql
```bash
# Use the connection string from Neon
psql "postgresql://username:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require" -f db/schema.sql
```

## Step 4: Export Your Local Data

```bash
# Export from your local GP_Promo database
pg_dump -h localhost -U postgres -d GP_Promo --data-only --inserts -t events -t presenters -t event_presenters > db/data.sql
```

## Step 5: Import Data to Neon

### Option A: Using Neon SQL Editor
1. Open `db/data.sql` in a text editor
2. Copy the contents
3. Paste into Neon SQL Editor
4. Click **Run**

### Option B: Using psql
```bash
psql "postgresql://username:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require" -f db/data.sql
```

## Step 6: Add Connection String to Vercel

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name:** `DATABASE_URL`
   - **Value:** Your Neon connection string (from Step 2)
   - **Environment:** Production, Preview, Development (check all)
4. Click **Save**

## Step 7: Add Other Environment Variables to Vercel

Add these from your `.env.local`:

```
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_secret
PAYPAL_MODE=sandbox
PAYPAL_API_URL=https://api-m.sandbox.paypal.com
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_IMAGES=cpdg-images
```

**Important:** Make sure all are set for Production environment.

## Step 8: Deploy

1. Commit and push your latest changes to GitHub:
   ```bash
   git add .
   git commit -m "Add Neon database support"
   git push
   ```

2. Vercel will automatically deploy

3. Check deployment logs for any errors

## Step 9: Verify

1. Visit your deployed site URL
2. Check if events load properly
3. Test the checkout form

## Managing Your Database

### View Data
- Use Neon's **Tables** view in the dashboard
- Or use the **SQL Editor** to run queries

### Backup
Neon automatically backs up your data. You can also manually export:
```bash
pg_dump "your-neon-connection-string" > backup.sql
```

### Connection Pooling
Neon automatically uses connection pooling - your current `lib/db.ts` setup works perfectly!

## Troubleshooting

### "too many connections"
- Neon free tier: 100 concurrent connections
- Your pool max is 20, so you're fine

### SSL errors
- Already handled in `lib/db.ts` with the SSL config

### Can't connect from local
- Update your `.env.local`:
  ```
  DATABASE_URL=your-neon-connection-string
  ```
- Or keep local DB for development

## Local Development Options

### Option 1: Keep using local DB
Keep your `.env.local` pointing to local:
```
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/GP_Promo
```

### Option 2: Use Neon for everything
Update `.env.local` to use Neon connection string. This way local and production use the same database.

**Recommendation:** Use Option 1 for faster development, Option 2 for easier testing.

## Neon Free Tier Limits
- 10 projects
- 10 GB storage per project
- 100 concurrent connections
- Unlimited queries

More than enough for your promo site!
