"use client";

export type CognitoTokens = {
  idToken?: string;
  accessToken?: string;
  refreshToken?: string;
};

const AUTH_COOKIE_NAME = "cognito_auth";

function setAuthCookie(maxAgeSeconds = 60 * 60 * 24 * 7) {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_COOKIE_NAME}=1; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
}

function clearAuthCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export function saveCognitoTokens(tokens: CognitoTokens) {
  if (typeof window === "undefined") return;
  if (tokens.idToken) localStorage.setItem("cognito_id_token", tokens.idToken);
  if (tokens.accessToken)
    localStorage.setItem("cognito_access_token", tokens.accessToken);
  if (tokens.refreshToken)
    localStorage.setItem("cognito_refresh_token", tokens.refreshToken);

  if (tokens.idToken || tokens.accessToken) {
    setAuthCookie();
  }

  window.dispatchEvent(new Event("auth-change"));
}

export function getCognitoIdToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("cognito_id_token");
}

export function clearCognitoTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("cognito_id_token");
  localStorage.removeItem("cognito_access_token");
  localStorage.removeItem("cognito_refresh_token");
  clearAuthCookie();
  window.dispatchEvent(new Event("auth-change"));
}

export function getCognitoUsername(): string | null {
  const token = getCognitoIdToken();
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  const username = payload?.["cognito:username"];
  if (typeof username === "string") return username;
  const email = payload?.email;
  return typeof email === "string" ? email : null;
}

export function getCognitoUserId(): string | null {
  const token = getCognitoIdToken();
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  const subject = payload?.sub;
  return typeof subject === "string" ? subject : null;
}