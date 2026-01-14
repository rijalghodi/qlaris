"use client";

import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/lib/constant";

function addSecondsToCurrentDate(seconds: number): Date {
  return new Date(Date.now() + seconds * 1000);
}

function setCookie(key: string, value: string, expires?: Date) {
  const cookieParts = [`${key}=${encodeURIComponent(value)}`];

  if (expires) {
    cookieParts.push(`expires=${expires.toUTCString()}`);
  }

  cookieParts.push("path=/");
  cookieParts.push("SameSite=Strict");

  if (process.env.NODE_ENV === "production") {
    cookieParts.push("Secure");
  }

  document.cookie = cookieParts.join("; ");
}

function removeCookie(key: string) {
  document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

function setCookieWithExpiration(key: string, value: string, expires?: string | Date | number) {
  const expiresDate =
    typeof expires === "number"
      ? addSecondsToCurrentDate(expires)
      : expires
      ? new Date(expires)
      : undefined;

  setCookie(key, value, expiresDate);
}

type AuthCookie = {
  accessToken: string;
  refreshToken?: string;
  accessTokenExpires?: string | Date | number;
  refreshTokenExpires?: string | Date | number;
};

export function setAuthCookie({
  accessToken,
  refreshToken,
  accessTokenExpires,
  refreshTokenExpires,
}: AuthCookie) {
  setCookieWithExpiration(ACCESS_TOKEN_KEY, accessToken, accessTokenExpires);

  if (refreshToken) {
    setCookieWithExpiration(REFRESH_TOKEN_KEY, refreshToken, refreshTokenExpires);
  }
}

export function removeAuthCookie() {
  removeCookie(ACCESS_TOKEN_KEY);
  removeCookie(REFRESH_TOKEN_KEY);
}
