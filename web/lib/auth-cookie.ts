"use client";

import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/lib/constant";
import Cookies from "js-cookie";

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
  Cookies.set(ACCESS_TOKEN_KEY, accessToken, {
    expires: accessTokenExpires ? new Date(accessTokenExpires) : undefined,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
  });

  if (refreshToken) {
    Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
      expires: refreshTokenExpires ? new Date(refreshTokenExpires) : undefined,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
    });
  }
}

export function removeAuthCookie() {
  Cookies.remove(ACCESS_TOKEN_KEY);
  Cookies.remove(REFRESH_TOKEN_KEY);
}

export function getAuthCookie() {
  const accessToken = Cookies.get(ACCESS_TOKEN_KEY);
  const refreshToken = Cookies.get(REFRESH_TOKEN_KEY);

  return {
    accessToken,
    refreshToken,
  };
}
