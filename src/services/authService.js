import Constants from "expo-constants";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";
import {
  GoogleAuthProvider,
  signInWithCredential,
  signOut,
} from "firebase/auth";

import { auth, googleAuthConfig } from "../config/firebase";

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_DISCOVERY = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  revocationEndpoint: "https://oauth2.googleapis.com/revoke",
};

const GOOGLE_SCOPES = ["openid", "profile", "email"];
const APP_SCHEME = Constants.expoConfig?.scheme ?? "com.nutrimed.ai";
let isNativeGoogleConfigured = false;

function createNonce() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getClientId() {
  if (Platform.OS === "android") {
    return googleAuthConfig.androidClientId || googleAuthConfig.webClientId;
  }

  return googleAuthConfig.webClientId;
}

function getRedirectUri() {
  return AuthSession.makeRedirectUri({
    scheme: APP_SCHEME,
    path: "oauthredirect",
  });
}

function getNativeGoogleSigninModule() {
  return require("@react-native-google-signin/google-signin");
}

function configureNativeGoogleSignin() {
  const { GoogleSignin } = getNativeGoogleSigninModule();

  if (isNativeGoogleConfigured) {
    return GoogleSignin;
  }

  GoogleSignin.configure({
    webClientId: googleAuthConfig.webClientId,
    scopes: ["profile", "email"],
  });

  isNativeGoogleConfigured = true;
  return GoogleSignin;
}

async function getIdTokenFromCode(result, request, clientId, redirectUri) {
  if (!result.params?.code) {
    return null;
  }

  const tokenResponse = await AuthSession.exchangeCodeAsync(
    {
      clientId,
      code: result.params.code,
      redirectUri,
      extraParams: request.codeVerifier
        ? { code_verifier: request.codeVerifier }
        : undefined,
    },
    GOOGLE_DISCOVERY
  );

  return tokenResponse.idToken ?? null;
}

async function signInWithNativeGoogle() {
  const GoogleSignin = configureNativeGoogleSignin();

  if (Platform.OS === "android") {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  }

  const result = await GoogleSignin.signIn();

  if (result.type === "cancelled") {
    return null;
  }

  const idToken =
    result.data?.idToken ?? (await GoogleSignin.getTokens()).idToken ?? null;

  if (!idToken) {
    throw new Error(
      "Google Sign-In did not return an ID token. Check the Firebase web client ID."
    );
  }

  const credential = GoogleAuthProvider.credential(idToken);

  return signInWithCredential(auth, credential);
}

async function signInWithWebGoogle() {
  const clientId = getClientId();
  const redirectUri = getRedirectUri();

  const request = await AuthSession.loadAsync(
    {
      clientId,
      redirectUri,
      scopes: GOOGLE_SCOPES,
      responseType: AuthSession.ResponseType.IdToken,
      usePKCE: false,
      extraParams: {
        prompt: "select_account",
        nonce: createNonce(),
      },
    },
    GOOGLE_DISCOVERY
  );

  const result = await request.promptAsync(GOOGLE_DISCOVERY);

  if (result.type === "cancel" || result.type === "dismiss") {
    return null;
  }

  if (result.type !== "success") {
    throw new Error("Google sign-in did not complete successfully.");
  }

  const idToken =
    result.params?.id_token ??
    result.authentication?.idToken ??
    (await getIdTokenFromCode(result, request, clientId, redirectUri));

  if (!idToken) {
    throw new Error("Google sign-in did not return an ID token.");
  }

  const credential = GoogleAuthProvider.credential(idToken);

  return signInWithCredential(auth, credential);
}

export async function signInWithGoogle() {
  const clientId = getClientId();

  if (!clientId) {
    throw new Error("Google client ID is missing from google-services.json.");
  }

  if (
    Platform.OS === "android" &&
    Constants.expoConfig?.android?.package &&
    googleAuthConfig.androidPackageName &&
    Constants.expoConfig.android.package !== googleAuthConfig.androidPackageName
  ) {
    console.warn(
      `Android package mismatch detected. app.json uses "${Constants.expoConfig.android.package}" but google-services.json uses "${googleAuthConfig.androidPackageName}". Google sign-in can fail until they match.`
    );
  }

  if (Platform.OS !== "web") {
    return signInWithNativeGoogle();
  }

  return signInWithWebGoogle();
}

export async function signOutUser() {
  if (Platform.OS !== "web") {
    try {
      const GoogleSignin = configureNativeGoogleSignin();
      await GoogleSignin.signOut();
    } catch (error) {
      console.warn("Native Google sign-out was skipped:", error);
    }
  }

  await signOut(auth);
}
