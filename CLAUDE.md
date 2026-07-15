@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install                 # install dependencies
npx expo start              # dev server — scan QR with Expo Go
npx tsc --noEmit            # typecheck (no test suite yet)
npx expo export --platform ios --output-dir /tmp/pt-export   # verify the bundle compiles
npx firebase-tools deploy --only firestore:rules --project pettracker-682e8
```

## Stack

- **Expo SDK 54** (React Native 0.81, React 19.1) with **expo-router** file-based routing, TypeScript strict.
  SDK 54 is deliberate: it's the newest SDK the App Store build of **Expo Go** supports (checked 2026-07-15
  via `curl https://itunes.apple.com/lookup?bundleId=host.exp.Exponent`). Don't upgrade past what Expo Go runs.
- **Firebase JS SDK** — Auth (email/password + Google + Apple) and Firestore
- **react-native-reanimated 4** for animations, **react-native-svg** for the XP ring
- No state library: React context (`auth-context`, `data-context`) + live Firestore `onSnapshot` subscriptions

## Architecture

```
src/
  app/                # expo-router routes
    (auth)/           # welcome, sign-in, sign-up, forgot-password
    (tabs)/           # index (home), routines, journal, shop, profile
    verify-email.tsx  # gate: email/password accounts must verify before entering
    new-pet.tsx       # modal: adopt a pet
    _layout.tsx       # fonts + providers + auth redirect logic
  config/             # ALL static data & balance numbers — edit here, not in screens
    game.ts           # species, activities, XP curve, coin economy
    shop.ts           # shop catalog (accessories + backdrops)
    firebase-config.ts# web credentials (placeholders until filled — see README)
    auth-config.ts    # Google OAuth client IDs (button hidden until set)
  lib/
    firebase.ts       # app/auth/firestore init (RN AsyncStorage persistence)
    auth-context.tsx  # AuthProvider, useAuth, friendlyAuthError
    data-context.tsx  # DataProvider — live subscriptions to profile/pets/routines/activities
    actions.ts        # ALL Firestore writes live here
    use-social-auth.ts# Google (expo-auth-session) + Apple (expo-apple-authentication) hooks
    dates.ts          # day/week period keys, streak continuity helpers
  components/
    ui.tsx            # design system: T (text), Screen, Card, Button, Field, CoinPill…
    pet-avatar.tsx    # animated emoji pet with XP ring, accessories, backdrop
    celebrations.tsx  # RewardToast + LevelUpModal
  theme/index.ts      # colors, fonts (Fraunces display), radii, spacing
```

## Key design decisions

- **XP is awarded inside one Firestore transaction** in `logActivity()` (`src/lib/actions.ts`):
  activity doc + pet xp/level + user coins move together. Never update XP outside it.
- **Firestore layout**: everything under `users/{uid}/…` subcollections (`pets`, `activities`,
  `routines`) so the security rule is simply "you own your tree".
- **Coins are account-wide** (on `users/{uid}`); **XP/levels are per-pet**.
- **Email verification is a hard gate**: `needsVerification` in auth-context is true for
  unverified password accounts; the root layout redirects them to `/verify-email`.
  OAuth (Google/Apple) accounts skip the gate.
- **Routine streaks** use local-time period keys (`YYYY-MM-DD` daily, ISO `YYYY-Wnn` weekly)
  from `src/lib/dates.ts`; a streak continues iff the previous period key was completed.
- **Design language** is "warm field journal": cream paper, ink text, persimmon accent,
  Fraunces display font. Keep new UI on this palette (`src/theme`) — no default blues/grays.
- Everything runs in **Expo Go** — don't add libraries that require custom native code
  (e.g. @react-native-google-signin, react-native-firebase).
