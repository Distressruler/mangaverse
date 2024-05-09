"use server";

import { DiscordUser } from "./types";
import { verify } from "jsonwebtoken";
import { config } from "./config";
import { cookies } from "next/headers";

export async function parseUser(): Promise<DiscordUser | null> {
  const token = cookies().get(config.cookieName)?.value;

  if (!token) {
    return null;
  }

  try {
    const { iat, exp, ...user } = verify(token, config.jwtSecret) as DiscordUser & { iat: number; exp: number };
    return user;
  } catch (e) {
    return null;
  }
}
