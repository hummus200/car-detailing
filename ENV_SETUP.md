# Environment Variables Setup Guide

## ⚠️ IMPORTANT: Variable Naming

**All environment variables MUST be named EXACTLY as shown below.** The code looks for these exact names:
- `NEXT_PUBLIC_SUPABASE_URL` (not `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL_`)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (not `SUPABASE_ANON_KEY`)
- `SUPABASE_SERVICE_ROLE_KEY` (not `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`)
- `RESEND_API_KEY` (not `NEXT_PUBLIC_RESEND_API_KEY`)
- `ADMIN_EMAIL` (not `NEXT_PUBLIC_ADMIN_EMAIL`)

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Supabase Configuration

```env
# Public keys (safe to expose to client)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# ⚠️ SECRET: Server-side only - Never expose to client!
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Where to get these:**
1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy the Project URL and keys

### Resend Email Configuration

```env
# ⚠️ SECRET: Server-side only - Never expose to client!
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ADMIN_EMAIL=admin@example.com
```

**Where to get these:**
1. Sign up at [resend.com](https://resend.com)
2. Go to API Keys section
3. Create a new API key
4. Add your admin email address

### App Configuration (Optional)

```env
# Public URL for email links
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Security Verification

### ✅ Safe to Expose (Client-Side)
- `NEXT_PUBLIC_SUPABASE_URL` - Public project URL (safe to expose)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anon key (protected by Row Level Security/RLS)
  - **Note:** This key is MEANT to be public. It's protected by Supabase's RLS policies.
  - Even if someone sees it, they can only access data your RLS policies allow.
  - The service role key is what's secret and bypasses RLS.
- `NEXT_PUBLIC_APP_URL` - Public app URL (safe to expose)

### ⚠️ SECRET (Server-Side Only - NEVER Expose!)
- `SUPABASE_SERVICE_ROLE_KEY` - **CRITICAL SECRET** - Bypasses all RLS, server-only
  - This key has full database access and bypasses all security
  - Only used in `createServiceClient()` which is server-side only
  - **NEVER** prefix with `NEXT_PUBLIC_` or use in client components
- `RESEND_API_KEY` - Email API key, server-only
- `ADMIN_EMAIL` - Admin email, server-only

## Usage Locations

### Server-Side Only (Safe)
- `SUPABASE_SERVICE_ROLE_KEY` → `src/lib/supabase/server.ts` (createServiceClient)
- `RESEND_API_KEY` → `src/lib/resend.ts`
- `ADMIN_EMAIL` → `src/lib/resend.ts`

### Client-Side (Public)
- `NEXT_PUBLIC_SUPABASE_URL` → `src/lib/supabase/client.ts`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → `src/lib/supabase/client.ts`
- `NEXT_PUBLIC_APP_URL` → Server actions (for email links)

## Quick Verification

Run this command to check your environment variables:

```bash
npm run check-env
# or
node scripts/check-env.js
```

This will:
- ✅ Check if `.env.local` exists
- ✅ Verify all required variables are set
- ✅ Check for incorrectly named variables
- ✅ Verify security (no secrets with `NEXT_PUBLIC_` prefix)
- ✅ Show which variables are missing

## Verification Checklist

- [x] All sensitive variables use `process.env` (not `NEXT_PUBLIC_*`)
- [x] Sensitive variables only used in server-side code
- [x] `.env.local` is in `.gitignore`
- [x] No sensitive variables in client components
- [x] Public variables properly prefixed with `NEXT_PUBLIC_`

## Troubleshooting

### Error: "Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL"

**Possible causes:**
1. `.env.local` file doesn't exist - Create it in the root directory
2. Variable name is incorrect - Must be exactly `NEXT_PUBLIC_SUPABASE_URL` (not `SUPABASE_URL`)
3. File not in root directory - Must be at project root (same level as `package.json`)
4. Typo in variable name - Check for extra spaces, dashes instead of underscores, etc.
5. Restart needed - After creating/updating `.env.local`, restart your dev server

**Quick fix:**
```bash
# 1. Create .env.local in root directory
# 2. Add all required variables (see above)
# 3. Restart dev server: Ctrl+C then npm run dev
```

### Variable names must match EXACTLY

❌ **Wrong:**
```env
SUPABASE_URL=https://...           # Missing NEXT_PUBLIC_ prefix
NEXT_PUBLIC_SUPABASE_SERVICE_KEY=... # Service key should NOT have NEXT_PUBLIC_
```

✅ **Correct:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://...  # Public variable
SUPABASE_SERVICE_ROLE_KEY=...         # Secret variable (no NEXT_PUBLIC_)
```

## Important Notes

1. **Never commit `.env.local`** - It's in `.gitignore`
2. **Never expose service role key** - It bypasses all security
3. **Anon key is safe** - It's protected by Row Level Security (RLS)
4. **Resend API key is secret** - Keep it server-side only
