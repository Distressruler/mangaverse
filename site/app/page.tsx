import { DiscordUser } from "../utils/types";
import { parseUser } from "../utils/parse-user";
import { HomePage } from "../components/HomePage";
import { config } from "../utils/config";
import { prisma } from "../prisma/client";
import { banners, chapters } from "@prisma/client";
import { LandingPage } from "../components/LandingPage";
import { Metadata } from "next";
import { searchByText } from "../components/server/search";

const AMOUNT_OF_MANGA_PER_PAGE = 20;

export const metadata: Metadata = {
  title: `${config.siteName} | Read Free Webtoon's, Manga's, Manhwa's, Manhua's, and Novel's!`,
  description:
    "With many genre's to choose from, Enryu let's you read manga's, manhwa's, manhua's, and novel's all for free! With updates daily and over a 100 mangas's with high quality images, Enryu is the best place to read.",
};

interface Props {
  user?: DiscordUser | null;
  banners: banners[];
  recent: Array<Omit<chapters, "released" | "lastRead"> & { released: number; cover: string }>;
  exclusives: Array<Omit<chapters, "released" | "lastRead"> & { released: number; cover: string }>;
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

async function getServerSideProps(page: number): Promise<Props> {
  const user = await parseUser();

  const exclusives = await prisma.mangas.findMany({ where: { exclusive: true } });
  const exclusiveChapters = await prisma.chapters.findMany({
    take: AMOUNT_OF_MANGA_PER_PAGE,
    orderBy: { released: "desc" },
    select: { id: true, manga: true, number: true, released: true, viewCount: true },
    distinct: ["manga"],
    skip: (page - 1) * AMOUNT_OF_MANGA_PER_PAGE,
    where: { manga: { in: exclusives.map((e) => e.name) } },
  });

  const banners = await prisma.banners.findMany();
  const recent =
    !config.requireSignupToRead || user
      ? await prisma.chapters.findMany({
          take: AMOUNT_OF_MANGA_PER_PAGE,
          orderBy: { released: "desc" },
          select: { id: true, manga: true, number: true, released: true, viewCount: true },
          distinct: ["manga"],
          skip: (page - 1) * AMOUNT_OF_MANGA_PER_PAGE,
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

  for (const sub of mysubs) {
    if (recent.some((r) => r.manga === sub.manga)) continue;
    recent.push(sub);
  }

  const mangas = await Promise.all([
    ...recent.map((r) => prisma.mangas.findFirst({ where: { name: r.manga, nsfw: false }, select: { coverURL: true, name: true, nsfw: true } })),
    ...mysubs
      .filter((s) => !recent.some((r) => r.manga === s.manga))
      .map((r) => prisma.mangas.findFirst({ where: { name: r.manga, nsfw: false }, select: { coverURL: true, name: true, nsfw: true } })),
  ]);

  const safe = recent.filter(r => mangas.some(m => m?.name === r.manga));

  return {
    banners,
    requireSignupToRead: config.requireSignupToRead,
    user,
    recent: safe.map((r) => ({ ...r, released: r.released.getTime(), cover: mangas.find((m) => m?.name === r.manga)?.coverURL ?? "" })),
    exclusives: exclusiveChapters.map((r) => ({
      ...r,
      released: r.released.getTime(),
      cover: exclusives.find((e) => e.name === r.manga)?.coverURL ?? "",
    })),
    subscriptions: mysubs.map((r) => ({
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

export default async function Index({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const page = Math.floor(parseInt(Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page ?? "1") ?? 1);
  const props = await getServerSideProps(page);
  const now = Date.now();

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
      recent={props.recent}
      exclusives={props.exclusives}
      subscriptions={props.subscriptions}
      notifications={props.notifications}
      banners={props.banners}
      timestamp={now}
      page={page}
      searchByText={searchByText}
    />
  );
}
