require('dotenv').config({ path: '.env.local' });

const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID ?? '4d40e992-c0a6-4a79-82fd-8c5e8278cffc';

module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...(config.extra ?? {}),
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
    supabaseBucketName: process.env.EXPO_PUBLIC_SUPABASE_BUCKET_NAME ?? '',
    eas: {
      ...((config.extra && config.extra.eas) ?? {}),
      projectId,
    },
  },
});
