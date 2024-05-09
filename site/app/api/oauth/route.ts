import fetch from "node-fetch";
import { config } from "../../../utils/config";
import { sign } from "jsonwebtoken";
import { DiscordGuild, DiscordUser } from "../../../utils/types";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const scope = ["identify", "guilds", "guilds.join", "guilds.members.read"].join(" ");
const REDIRECT_URI = `${config.appUri}/api/oauth`;

const OAUTH_QS = new URLSearchParams({
  client_id: config.clientId,
  redirect_uri: REDIRECT_URI,
  response_type: "code",
  scope,
}).toString();

const OAUTH_URI = `https://discord.com/api/oauth2/authorize?${OAUTH_QS}`;

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code") ?? null;
  const error = req.nextUrl.searchParams.get("error") ?? null;

  if (error) return redirect(`/?error=${error}`);

  if (!code || typeof code !== "string") return redirect(OAUTH_URI);

  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: "authorization_code",
    redirect_uri: REDIRECT_URI,
    code,
    scope,
  }).toString();

  // TODO: discordeno - improve typings for this
  // @ts-expect-error missing discord type
  const { access_token = null, token_type = "Bearer" } = await fetch("https://discord.com/api/oauth2/token", {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "POST",
    body,
  }).then((res) => res.json());

  if (!access_token || typeof access_token !== "string") return redirect(OAUTH_URI);

  // TODO: discordeno - improve typings for this
  // @ts-expect-error missing discord type
  const me: DiscordUser | { unauthorized: true } = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `${token_type} ${access_token}` },
  }).then((res) => res.json());

  if (!("id" in me)) {
    return redirect(OAUTH_URI);
  }

  // Get all the users guilds to make sure user is in our server
  const guilds = (await fetch("https://discord.com/api/users/@me/guilds", {
    headers: { Authorization: `${token_type} ${access_token}` },
  }).then((res) => res.json())) as DiscordGuild[];

  // If user is not a member in main server, add them
  if (!guilds.find((g) => g.id === config.serverId)) {
    await fetch(`https://discord.com/api/guilds/${config.serverId}/members/${me.id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bot ${config.botToken}`,
      },
      method: "PUT",
      body: JSON.stringify({
        access_token: `${access_token}`,
      }),
    })
      .then((res) => res.json())
      .catch(console.log);

    // TODO: discord - if it was not added, we re-route
  }

  const token = sign(me, config.jwtSecret, { expiresIn: "24h" });

  cookies().set(config.cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "lax",
    path: "/",
  });

  redirect("/");
}
