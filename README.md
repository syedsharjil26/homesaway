# HomesAwayClean

HomesAwayClean is an Expo Router app for discovering premium student stays in Kolkata.

## Stack

- Expo SDK 54
- React Native 0.81
- React 19
- TypeScript strict mode
- Expo Router tabs
- AsyncStorage for local persistence

## Local Setup

```bash
npm install
npm run start
```

Useful scripts:

```bash
npm run android
npm run ios
npm run web
npm run lint
npm run typecheck
```

## Architecture

```text
app/                  Thin Expo Router entry points
src/data/             Static prototype data and domain types
src/features/         Product features grouped by business area
src/hooks/            Shared app hooks
src/storage/          Local persistence adapters
src/theme/            Design tokens
components/           Shared native UI primitives still used by routing
```

## Current Product Surface

- Premium onboarding
- Kolkata listing feed
- Search and area filtering
- Saved listings
- Recently viewed listings
- Two-listing comparison
- Listing detail pages
- Student login/signup
- Owner login/signup
- Booking request capture
- Locality search for Ballygunge, Park Circus, Salt Lake, New Town, and Gariahat
- Rent and food preference filters
- Contact owner actions
- Persisted favorites
- Dark/light theme toggle
- Local admin lead desk
- Product-specific market intelligence tab
- Local persistence for user/session state
