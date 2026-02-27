# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Add flutter to PATH first (always required in this environment)
export PATH="$PATH:/home/lm1/flutter/bin"

# Install dependencies
flutter pub get

# Run code generation (freezed models + riverpod providers) — required after editing models/providers
dart run build_runner build --delete-conflicting-outputs

# Watch mode for code generation during development
dart run build_runner watch --delete-conflicting-outputs

# Run all tests
flutter test

# Run a single test file
flutter test test/unit/xp_calculator_test.dart

# Run on Chrome (web)
flutter run -d chrome

# Run on Android emulator
flutter run -d android

# Build for web
flutter build web
```

## Firebase Setup (first-time)

`lib/firebase_options.dart` is a stub. Before running the app, configure a Firebase project and run:
```bash
dart pub global activate flutterfire_cli
flutterfire configure
```
This regenerates `firebase_options.dart` with real credentials. Also deploy security rules:
```bash
firebase deploy --only firestore:rules,firestore:indexes
```

## Architecture

### Stack
- **Flutter** (iOS + Android + Web from one codebase)
- **Firebase** — Auth, Firestore, Cloud Storage
- **Riverpod 2** with `@riverpod` codegen (`riverpod_generator`) for state management
- **GoRouter** for routing with auth redirect
- **freezed** for immutable models (requires `build_runner`)
- **flutter_svg** for breed/accessory SVG assets

### Concept
Gamified pet care tracker — owners select a cartoon avatar per dog breed, log real activities (walks, bathroom, meals, vet, play), earn XP, level up, and unlock cosmetic accessories/badges. Like a Tamagotchi tied to real pet care.

### Folder Structure
```
lib/
  app/          # AppTheme, GoRouter config, MaterialApp root
  config/       # Static data: breeds, activity XP, level thresholds, perks
  core/
    constants/  # FirestorePaths
    utils/      # xp_calculator.dart — core game logic
    widgets/    # Shared widgets (AppScaffold, ErrorView, PrimaryButton, etc.)
  services/     # Firebase wrappers: AuthService, PetService, ActivityService
  models/       # Freezed models: UserModel, PetModel, ActivityModel
  features/
    auth/       # Login, Register, ForgotPassword, SplashScreen
    onboarding/ # New-pet wizard (breed picker → name pet)
    home/       # VirtualPetDisplay, XpProgressBar, QuickLogBar, HomeScreen
    activity/   # LogActivityScreen, ActivityHistoryScreen
    pets/       # PetsList, PetDetail, EditPet
    perks/      # PerksScreen (badges + accessories)
    profile/    # ProfileScreen (sign out, links)

assets/
  avatars/breeds/       # 16 SVGs — labrador.svg, golden_retriever.svg, etc.
  avatars/accessories/  # 7 SVGs — bandana.svg, crown.svg, etc.
  animations/           # Lottie JSON files (idle_wag, level_up_confetti, etc.)
```

### Firestore Collections
- `users/{uid}` — user profile + `activePetId` (which pet is shown on home screen)
- `pets/{petId}` — pet data: `breedKey`, `xp`, `level`, `unlockedPerkIds`, `equippedPerkIds`
- `activities/{activityId}` — activity logs: `petId`, `type`, `xpAwarded`, `loggedAt`, `durationMinutes`

**Required index:** `activities` on `(petId ASC, loggedAt DESC)` — defined in `firestore.indexes.json`.

### Key Design Decisions
- **XP is written via Firestore transaction** in `ActivityService.logActivity()` — atomically writes the activity doc and increments `pet.xp`/`pet.level` together. Never update XP outside this transaction.
- **Breed is immutable** after pet creation — no breed-change flow exists.
- **`activePetId` lives on the Firestore user doc** (not local storage) so it persists across devices.
- **`activities` is a top-level collection** (not a subcollection under pets) for simpler security rules.
- **Codegen**: Models in `lib/models/` use `part 'name.freezed.dart'` and `part 'name.g.dart'`. Providers use `part 'name.g.dart'`. Always run `build_runner` after editing these files.

### XP / Leveling
- Level formula: `xpRequired(n) = floor(50 × (n−1)^1.6)`, pre-computed in `lib/config/level_config.dart`
- All XP math lives in `lib/core/utils/xp_calculator.dart` — has full unit test coverage
- Perk unlocks detected in `detectNewlyUnlockedPerks(oldLevel, newLevel)` in the same file

### Assets (not yet sourced)
The `assets/avatars/breeds/` and `assets/avatars/accessories/` directories exist but contain no SVG files yet. The app gracefully falls back to a `Icons.pets` placeholder. Source 16 breed SVGs and 7 accessory SVGs in a consistent cartoon style before Phase 5 (home screen) is complete.
