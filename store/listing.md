# App Store listing — Tend

Copy-paste source for App Store Connect. Keep this file in sync with what's
actually live.

## Name (30 chars max)

Tend: Pet Care Tracker

## Subtitle (30 chars max)

Routines, streaks & rewards

## Category

Primary: Lifestyle · Secondary: Health & Fitness

## Description

Tend turns everyday pet care into something you'll actually look forward to.

Log the real things you do for your pets — walks, meals, playtime, grooming,
vet visits — and watch their in-app avatar level up as you go. Every logged
activity earns XP for your pet and coins for you.

BUILD ROUTINES THAT STICK
Set up the care schedule your pet actually needs: feed the dog every day at
9:00, walk on Monday, Wednesday and Friday, bath once a week. Tend tracks
your streaks, and optional reminders nudge you at just the right time —
15 or 30 minutes early if you like a head start.

A PET THAT GROWS WITH YOU
Every pet gets a hand-drawn avatar in your choice of coat — golden or
chocolate lab, gray tabby or tuxedo cat, bay or palomino horse, and more
across ten species. Checking off routines and logging care earns XP; levels
bring coin bonuses.

SPEND YOUR COINS
Dress your pet in caps, crowns, scarves and shades that actually fit, give
them a companion, or swap in a new backdrop — from a spring meadow to a
starry night. Every pet keeps its own collection.

A JOURNAL YOU'LL KEEP
The week view shows what got done and what's still due, day by day. The
journal keeps your full care history — and long-pressing removes an
accidental entry, no harm done.

Tend is calm, warm, and honest: no ads, no analytics profiles, no selling
your data. Your pets' story belongs to you.

## Keywords (100 chars max)

pet,care,tracker,routine,dog,cat,walk,feeding,reminder,streak,journal,habit

## Support URL

https://github.com/BraydenRic/PetTracker

## Support email

tendpettracker@gmail.com (also the App Review contact address)

## Privacy Policy URL

https://braydenric.github.io/PetTracker/

## App Privacy questionnaire (Data Collection)

- **Contact Info → Email Address**: collected, linked to identity, used for
  App Functionality (account). Not used for tracking.
- **Contact Info → Name**: collected (display name, optional), linked to
  identity, App Functionality. Not used for tracking.
- **User Content → Other User Content**: collected (pet names, care logs,
  routines), linked to identity, App Functionality. Not used for tracking.
- Everything else: not collected. No tracking. No third-party advertising.

## Age rating

4+ (no objectionable content)

## Sign-in note for App Review

Reviewer can create an account with any email address (email verification
required — use a real inbox), or sign in with Apple. The app requires an
account because data syncs via Firebase. Account deletion is in
Profile → Delete account.

## Release checklist

1. `npx eas build --platform ios --profile production`
2. Create the app in App Store Connect (bundle id `com.brayden.tend`),
   then add `ascAppId` to eas.json's submit block.
3. `npx eas submit --platform ios`
4. Screenshots: 6.7" (iPhone 15 Pro Max) and 6.1" required — home with pet,
   routines week view, shop, journal, adopt screen.
5. Fill App Privacy from the questionnaire above; paste description/keywords.
6. Submit for review with the sign-in note.
