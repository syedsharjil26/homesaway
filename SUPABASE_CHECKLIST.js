#!/usr/bin/env node

/**
 * Supabase Integration Checklist
 * 
 * Run this checklist after setting up the Supabase client configuration
 */

const checks = [
  {
    step: 1,
    title: 'Environment Variables',
    instructions: [
      'Copy .env.local.example to .env.local',
      'Get your credentials from https://app.supabase.com',
      'Fill in EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY',
      'Verify .env.local is in .gitignore (it should be)',
    ],
  },
  {
    step: 2,
    title: 'Supabase Tables Setup',
    instructions: [
      'Log in to your Supabase project at https://app.supabase.com',
      'Go to the SQL Editor tab',
      'Create your tables (e.g., listings, users, bookings)',
      'Enable RLS (Row Level Security) if needed',
      'Set up authentication policies',
    ],
  },
  {
    step: 3,
    title: 'Generate TypeScript Types',
    instructions: [
      'Run: npx supabase gen types typescript --project-id "your-project-id" > src/types/supabase.ts',
      'Replace "your-project-id" with your Supabase project ID',
      'Types are now available for type-safe queries',
    ],
  },
  {
    step: 4,
    title: 'Import and Use',
    instructions: [
      'In your components: import { useSupabaseAuth } from "@/src/hooks/useSupabaseAuth"',
      'For database: import { supabaseDb } from "@/src/services/supabaseHelpers"',
      'For auth: import { supabase } from "@/src/services/supabaseClient"',
      'See SUPABASE_SETUP.md for detailed usage examples',
    ],
  },
  {
    step: 5,
    title: 'Test Connection',
    instructions: [
      'Run: npm start',
      'Add a test component to verify connection',
      'Check console for any auth errors',
      'Make a test query to your database',
    ],
  },
];

console.log('📋 Supabase Setup Checklist\n');

checks.forEach((check) => {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`Step ${check.step}: ${check.title}`);
  console.log('═'.repeat(60));

  check.instructions.forEach((instruction, index) => {
    console.log(`  ${index + 1}. ${instruction}`);
  });
});

console.log(`\n${'═'.repeat(60)}`);
console.log('✅ Need Help?');
console.log('═'.repeat(60));
console.log('  📖 Read: SUPABASE_SETUP.md');
console.log('  📄 Read: SUPABASE_CONFIG_SUMMARY.md');
console.log('  🔗 Docs: https://supabase.com/docs');
console.log('  💬 Support: https://supabase.com/support');
console.log('═'.repeat(60) + '\n');
