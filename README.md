# PetTracker 🐾

A gamified pet-care tracker built with **Expo / React Native** + **Firebase**.
Log real activities with your pets (walks, meals, grooming, vet visits), keep
daily & weekly routines with streaks, earn XP and coins, level your pet up, and
spend coins on accessories and backdrop scenes in the Treat Shop.

## Running in Expo Go

```bash
npm install
npx expo start
```

Scan the QR code with **Expo Go** on your phone (iOS or Android).

## First-time Firebase setup

The Firebase project is `pettracker-682e8`. The app needs real web credentials
in `src/config/firebase-config.ts`:

```bash
npx firebase-tools login --reauth
# If no web app is registered yet:
npx firebase-tools apps:create WEB PetTracker --project pettracker-682e8
# Print the config and paste the values into src/config/firebase-config.ts:
npx firebase-tools apps:sdkconfig WEB --project pettracker-682e8
# Deploy security rules:
npx firebase-tools deploy --only firestore:rules --project pettracker-682e8
```

Then in [Firebase Console → Authentication → Sign-in method](https://console.firebase.google.com/project/pettracker-682e8/authentication/providers), enable:

- **Email/Password** — sign-up sends a verification email; users are gated at a
  verification screen until they click it. Forgot-password emails work out of the box.
- **Apple** — works immediately in Expo Go on iOS (no extra config in the app).
- **Google** — also create OAuth client IDs in Google Cloud Console
  (APIs & Services → Credentials) and paste them into `src/config/auth-config.ts`.
  The Google button stays hidden until IDs are configured.

## How the game works

| Action | Reward |
| --- | --- |
| Log an activity (walk, feed, play…) | XP + coins per `src/config/game.ts` |
| Complete a routine check-off | 1.5× XP + streak bonus coins |
| Level up | `level × 25` bonus coins |

- Level curve: `xpForLevel(n) = floor(60 × (n−1)^1.55)`, capped at level 50.
- Coins are account-wide; XP/levels are per-pet.
- Shop purchases are shared across pets; equipping is per-pet.

## Architecture

- `src/app/` — expo-router routes: `(auth)` flow, `verify-email` gate, `(tabs)` app, `new-pet` modal
- `src/config/` — all static data + balance numbers (game economy, shop catalog, Firebase/OAuth config)
- `src/lib/` — Firebase init, auth context, live Firestore subscriptions (`data-context`), and `actions.ts` (all writes; XP awards happen in a single Firestore transaction)
- `src/components/` — design system (`ui.tsx`), animated `PetAvatar`, celebration overlays
- Firestore layout: everything under `users/{uid}` (`pets`, `activities`, `routines` subcollections) so security rules are a one-liner.
