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
  webClientId: '',
  iosClientId: '',
  androidClientId: '',
};

export const isGoogleAuthConfigured = GOOGLE_AUTH.webClientId.length > 0;
