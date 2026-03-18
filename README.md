# Considerit

Premium automotive services – Australia. Next.js App Router, TypeScript, Tailwind, shadcn/ui.

## Setup

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Setup

### Required Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Resend (Required for emails)
RESEND_API_KEY=re_xxxxx
ADMIN_EMAIL=admin@example.com

# App URL (Optional, for email links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `supabase-schema.sql` in your Supabase SQL Editor
3. Copy your project URL and keys from Supabase Settings → API
4. Add them to your `.env.local` file

#### Creating Admin Users

To create admin users for the admin dashboard:

1. Go to your Supabase Dashboard → Authentication → Users
2. Click "Add user" → "Create new user"
3. Enter an email and password
4. Click "Create user"
5. The user can now log in at `/admin/login` with their email and password

**Note:** Make sure email confirmation is disabled or the user confirms their email before logging in.

### Resend Setup

1. Sign up at [resend.com](https://resend.com)
2. Create an API key
3. Add it to your `.env.local` file along with your admin email

**Note:** If Supabase or Resend variables are missing, the app will still work but with limited functionality (no database persistence, no emails).

## 3D experience

The `/experience` page loads a car model from `public/car.glb`. If the file is missing, a procedural car is shown. Add a lightweight `.glb` car to `public/car.glb` for the full 3D model.

## Pages

- `/` – Landing (hero, features, CTAs)
- `/experience` – 3D car scene (auto-rotate, mouse/touch)
- `/book` – Booking form → Server Action → `/success`
- `/contact` – Contact form → Server Action, optional auto-reply
- `/success` – Confirmation (query `?type=booking` or contact)
- `/admin` – Admin dashboard (requires authentication)
  - `/admin/login` – Admin login page (email/password)
  - `/admin/bookings` – Manage bookings, confirm and send emails
  - `/admin/contacts` – Manage contact form submissions, reply to customers
  - `/admin/invoices` – Create, edit, and send invoices via email
  - `/admin/payments` – Payment tracking

## Stack

- Next.js 14 (App Router), React 18, TypeScript
- Tailwind CSS, shadcn/ui (Radix), monochrome + glassmorphism
- @react-three/fiber + @react-three/drei for 3D
- Supabase for database (PostgreSQL)
- Resend for email delivery
- Server Actions for form handling and data mutations
