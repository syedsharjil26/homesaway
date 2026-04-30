# Supabase Configuration Guide

## Setup Instructions

### 1. Installation
The Supabase client has already been configured. Make sure the `@supabase/supabase-js` package is installed:

```bash
npm install @supabase/supabase-js
```

### 2. Environment Variables
Create a `.env.local` file in the project root (copy from `.env.local.example`):

```bash
cp .env.local.example .env.local
```

Then fill in your credentials from your Supabase project:
- `EXPO_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Your anonymous key (safe to expose)

### 3. Get Your Credentials
1. Visit [supabase.com](https://supabase.com)
2. Go to your project dashboard
3. Navigate to **Project Settings** → **API**
4. Copy the URL and anonymous key

### 4. Usage in Your Code

**Importing the client:**
```typescript
import { supabase } from '@/src/services/supabaseClient';
```

**Sign up:**
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
});
```

**Sign in:**
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});
```

**Get current session:**
```typescript
const { data: { session } } = await supabase.auth.getSession();
```

**Listen to auth state:**
```typescript
const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
  console.log(event, session);
});
```

**Database queries:**
```typescript
// Select
const { data, error } = await supabase
  .from('table_name')
  .select();

// Insert
const { data, error } = await supabase
  .from('table_name')
  .insert([{ column: 'value' }]);

// Update
const { data, error } = await supabase
  .from('table_name')
  .update({ column: 'updated_value' })
  .eq('id', 1);

// Delete
const { data, error } = await supabase
  .from('table_name')
  .delete()
  .eq('id', 1);
```

**File storage:**
```typescript
// Upload
const { data, error } = await supabase.storage
  .from(process.env.EXPO_PUBLIC_SUPABASE_BUCKET_NAME!)
  .upload('listings/image.jpg', file);

// Download
const { data, error } = await supabase.storage
  .from(process.env.EXPO_PUBLIC_SUPABASE_BUCKET_NAME!)
  .download('listings/image.jpg');
```

### 5. Environment Variable Warnings
- ⚠️ **NEVER commit `.env.local` to Git** — it contains sensitive keys
- ✅ **Only `.env.local.example` should be in Git**
- The `EXPO_PUBLIC_` prefix exposes these variables to the client (this is intentional for the anon key)
- For server-side secrets, use different environment variables on your backend

### 6. TypeScript Support
The Supabase client includes full TypeScript support. For better type safety, generate types from your database:

```bash
npx supabase gen types typescript --project-id "your-project-id" > src/types/supabase.ts
```

Then import types:
```typescript
import type { Database } from '@/src/types/supabase';

// Use in queries
const { data } = await supabase
  .from('listings')
  .select()
  .returns<Database['public']['Tables']['listings']['Row'][]>();
```

### 7. Initial Supabase Schema
The repository includes an initial Supabase schema migration at `supabase/migrations/20260427_initial_schema.sql`.

Run that SQL in your Supabase project to create the core tables and indexes for:
- `profiles`
- `listings`
- `listing_amenities`
- `listing_images`
- `favorites`
- `inquiries`
- `reviews`
- `notifications`
- `owner_documents`

This migration also adds a reusable trigger for `updated_at` maintenance.

### 8. Seed data
The repository also includes a sample Kolkata seed file at `supabase/migrations/20260427_seed_kolkata_listings.sql`.
Run that file after the schema migration to populate demo listings and owner profiles for local testing.
