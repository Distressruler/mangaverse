function validateEnv<T extends string = string>(key: keyof NodeJS.ProcessEnv, defaultValue?: T, warnDefault = false): T {
  const value = process.env[key] as T | undefined;

  if (!value) {
    if (typeof defaultValue !== "undefined") {
      if (warnDefault) {
        const message = `validateEnv is using a default value for ${key} and has this warning enabled.`;
        console.warn(new Error(message));
      }

      return defaultValue;
    } else {
      throw new Error(`${key} is not defined in environment variables`);
    }
  }

  return value;
}

export const config = {
  cookieName: "token",
  clientId: validateEnv("CLIENT_ID"),
  clientSecret: validateEnv("CLIENT_SECRET"),
  appUri: validateEnv("APP_URI", "http://localhost:3000", true),
  jwtSecret: validateEnv("JWT_SECRET", "this is a development value that should be changed in production!!!!!", true),
  serverId: validateEnv("SERVER_ID"),
  siteName: validateEnv("SITE_NAME"),
  siteLogo: validateEnv("SITE_LOGO"),
  botToken: validateEnv("BOT_TOKEN"),
  // @ts-expect-error need default to false
  requireSignupToRead: validateEnv("REQUIRE_SIGN_UP_TO_READ", "false") === "true",
  // @ts-expect-error need default to false
  requireDesiredManaga: validateEnv("REQUIRE_DESIRED_MANGA_LIST", "false") === "true",
  siteDiscordURL: validateEnv("SERVER_INVITE", ""),
  siteRedditURL: validateEnv("REDDIT_INVITE", ""),
  siteTwitterURL: validateEnv("TWITTER_INVITE", ""),
  siteTelegramURL: validateEnv("TELEGRAM_INVITE", ""),
  copyrightStartYear: validateEnv("COPYRIGHT_START_YEAR", ""),
  adminDiscordIDs: validateEnv("ADMIN_DISCORD_IDS").split(","),
} as const;
