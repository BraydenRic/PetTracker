/**
 * OAuth client IDs for social sign-in.
 *
 * Google: create OAuth clients in Google Cloud Console for this Firebase project
 * (APIs & Services → Credentials). The *web* client ID is the one Firebase Auth
 * needs to mint credentials; iOS/Android IDs let native flows skip the proxy.
 * Leave as empty strings to hide the Google button until configured.
 *
 * Apple sign-in needs no IDs here — `expo-apple-authentication` works out of the
 * box in Expo Go on iOS (enable the Apple provider in Firebase Console).
 */
export const GOOGLE_AUTH = {
  // Firebase's auto-provisioned web client for pettracker-682e8.
  webClientId: '308784679328-7i32mabkgep295geid4lcm5fq515fi1j.apps.googleusercontent.com',
  // Auto-provisioned when the iOS app was registered on the Firebase project.
  // Its reversed form must stay in app.json's "scheme" array — that's how
  // Google's redirect re-opens the standalone app.
  iosClientId: '308784679328-2o0ppph4d9acjcvilichgmk3vbttbeg0.apps.googleusercontent.com',
  androidClientId: '',
};

export const isGoogleAuthConfigured = GOOGLE_AUTH.webClientId.length > 0;
