export interface DiscordUser {
  id: string;
  username: string;
  avatar: string;
  discriminator: string;
  public_flags: number;
  flags: number;
  locale: string;
  mfa_enabled: boolean;
  premium_type: number;
}

export interface DiscordGuild {
  id: string;
  name: string;
  icon?: string;
  owner?: true;
  permissions_new: string;
  features: string[];
}

export type MangaSites =
  | "mangatx.com"
  | "manhuaplus.com"
  | "1stkissmanga.me"
  | "mangaclash.com"
  | "manga68.com"
  | "mangabuddy.com"
  | "novelbuddy.com";

export type PageProps = {
  params: { [slug: string]: string | undefined };
  searchParams: { [key: string]: string | string[] | undefined };
};
