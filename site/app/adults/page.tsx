import { banners, chapters } from "@prisma/client";
import { Metadata } from "next";
import { HomePage } from "../../components/HomePage";
import { LandingPage } from "../../components/LandingPage";
import { prisma } from "../../prisma/client";
import { parseUser } from "../../utils/parse-user";
import { DiscordUser } from "../../utils/types";
import { config } from "../../utils/config";
import { searchByText } from "../../components/server/search";

export const metadata: Metadata = {
  title: `Read Free Webtoon's, Manga's, Manhwa's, Manhua's, and Novel's!`,
  description:
    "With many genre's to choose from, Enryu let's you read manga's, manhwa's, manhua's, and novel's all for free! With updates daily and over a 100 mangas's with high quality images, Enryu is the best place to read",
};

interface AdultProps {
  banners: banners[];
  user?: DiscordUser | null;
  nsfwList: string[];
  recent: Array<Omit<chapters, "released" | "lastRead"> & { released: number; cover: string }>;
  subscriptions: Array<Omit<chapters, "released" | "lastRead"> & { released: number; cover: string }>;
  notifications: Array<Omit<chapters, "released" | "lastRead"> & { released: number; cover: string }>;
  requireSignupToRead: boolean;
  site: {
    name: string;
    logo: string;
    discordURL: string;
    redditURL: string;
    twitterURL: string;
    telegramURL: string;
    copyrightStartYear: string;
  };
}

async function getServerSideProps(): Promise<AdultProps> {
  const user = await parseUser();

  const banners = await prisma.banners.findMany();
  const recent =
    !config.requireSignupToRead || user
      ? await prisma.chapters.findMany({
          take: 100,
          orderBy: { released: "desc" },
          select: { id: true, manga: true, number: true, released: true, viewCount: true },
          distinct: ["manga"],
        })
      : [];
  const subscriptions = user ? await prisma.subscribers.findMany({ where: { userId: user.id } }) : [];
  const mysubs = subscriptions.length
    ? await prisma.chapters.findMany({
        take: 20,
        orderBy: { released: "desc" },
        select: { id: true, manga: true, number: true, released: true, viewCount: true },
        distinct: ["manga"],
        where: { manga: { in: subscriptions.map((sub) => sub.manga) } },
      })
    : [];
  const lastRead = subscriptions.length
    ? await prisma.reading.findMany({ where: { userId: user!.id, manga: { in: subscriptions.map((s) => s.manga) } } })
    : [];
  const notifications = await Promise.all(
    lastRead.map((read, i) =>
      prisma.chapters.findFirst({
        orderBy: { number: "asc" },
        distinct: ["manga"],
        where: { manga: { in: lastRead.map((s) => s.manga) }, number: { gt: lastRead[i].chapter } },
      })
    )
  );

  notifications[0]?.number;

  for (const sub of mysubs) {
    if (recent.some((r) => r.manga === sub.manga)) continue;
    recent.push(sub);
  }

  const mangas = await Promise.all([
    ...recent.map((r) => prisma.mangas.findUnique({ where: { name: r.manga }, select: { coverURL: true, name: true, nsfw: true } })),
    ...mysubs
      .filter((s) => !recent.some((r) => r.manga === s.manga))
      .map((r) => prisma.mangas.findUnique({ where: { name: r.manga }, select: { coverURL: true, name: true, nsfw: true } })),
  ]);

  return {
    banners,
    requireSignupToRead: config.requireSignupToRead,
    user,
    nsfwList: mangas.filter((m) => m?.nsfw).map((m) => m!.name),
    recent: recent.map((r, i) => ({ ...r, released: r.released.getTime(), cover: mangas[i]?.coverURL ?? "" })),
    subscriptions: mysubs.map((r, i) => ({
      ...r,
      released: r.released.getTime(),
      cover: mangas.find((m) => m?.name === r.manga)?.coverURL ?? "",
    })),
    notifications: notifications
      .filter((n) => n)
      .map((chapter) => ({
        ...chapter,
        id: chapter!.id!,
        manga: chapter!.manga!,
        number: chapter!.number,
        viewCount: chapter!.viewCount!,
        lastRead: chapter!.lastRead.getTime(),
        released: chapter!.released.getTime(),
        cover: mangas.find((m) => m?.name === chapter!.manga)?.coverURL ?? "",
      })),
    site: {
      name: config.siteName,
      logo: config.siteLogo,
      discordURL: config.siteDiscordURL,
      redditURL: config.siteRedditURL,
      twitterURL: config.siteTwitterURL,
      telegramURL: config.siteTelegramURL,
      copyrightStartYear: config.copyrightStartYear,
    },
  };
}
export default async function Index() {
  const props = await getServerSideProps();

  if (!props.user && props.requireSignupToRead) {
    return (
      <div>
        <LandingPage site={props.site} />
      </div>
    );
  }

  return (
    <HomePage
      user={props.user}
      site={props.site}
      banners={props.banners}
      recent={props.recent}
      subscriptions={props.subscriptions}
      notifications={props.notifications}
      timestamp={Date.now()}
      page={1}
      searchByText={searchByText}
      exclusives={[]}
    />
  );
}
