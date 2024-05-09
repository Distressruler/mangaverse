import { mangas } from "@prisma/client";
import { Metadata } from "next";
import Footer from "../../components/Footer";
import { ListBox } from "../../components/ListBox";
import { NavBar } from "../../components/NavBar";
import { prisma } from "../../prisma/client";
import { parseUser } from "../../utils/parse-user";
import { humanizeMilliseconds } from "../../utils/time";
import { DiscordUser } from "../../utils/types";
import { config } from "../../utils/config";
import { searchByText } from "../../components/server/search";

export const metadata: Metadata = {
  title: `List of Manga, Manhwa, Webtoons, and Novel's`,
  description:
    "With thousands of choices to choose from and every genre available, choose one yourself or let us choose for you by clicking the random button and start reading now.",
};

export const dynamic = "force-dynamic";

interface ListProps {
  user?: DiscordUser | null;
  recent: Array<Omit<mangas, "updatedAt" | "addedAt"> & { updatedAt: number; count: number; addedAt: number }>;
  query: string;
  site: {
    name: string;
    logo: string;
    discordURL: string;
    redditURL: string;
    telegramURL: string;
    twitterURL: string;
  };
}
async function getServerSideProps({ query }: { query?: string }): Promise<ListProps> {
  const user = await parseUser();

  const recent = await prisma.mangas.findMany({
    take: 100,
    where: query ? { name: { contains: query } } : {},
    orderBy: { lastChapter: "desc" },
  });

  const mangas = await Promise.all(
    recent.map((r) =>
      prisma.chapters.count({
        where: {
          manga: r.name,
        },
      })
    )
  );

  return {
    user,
    recent: recent.map((r, i) => ({ ...r, updatedAt: r.updatedAt.getTime(), addedAt: r.addedAt.getTime(), count: mangas[i] ?? 1 })),
    site: {
      name: config.siteName,
      logo: config.siteLogo,
      discordURL: config.siteDiscordURL,
      redditURL: config.siteRedditURL,
      telegramURL: config.siteTelegramURL,
      twitterURL: config.siteTwitterURL,
    },
    query: "",
  };
}

export default async function Index({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const search = searchParams.query;

  const props = await getServerSideProps({
    query: Array.isArray(search) ? search.join("") : search,
  });

  const now = Date.now();

  return (
    <div>
      <NavBar
        avatar={
          props.user?.avatar
            ? `https://cdn.discordapp.com/avatars/${props.user.id}/${props.user.avatar}.jpg`
            : props.user?.avatar === null
            ? `https://cdn.discordapp.com/embed/avatars/${Number(props.user.discriminator) % 5}.png`
            : undefined
        }
        siteLogo={props.site.logo}
        siteName={props.site.name}
        discordURL={props.site.discordURL}
        redditURL={props.site.redditURL}
        telegramURL={props.site.telegramURL}
        query={props.query}
        searchByText={searchByText}
      />
      <h2 className="text-center text-3xl mt-6 font-serif font-bold text-white">Manga List</h2>
      <div className="divider"></div>
      <div className="flex justify-center items-center flex-wrap">
        {props.recent.map((manga, index) => (
          <div key={index}>
            <ListBox
              imageURL={manga.coverURL}
              name={manga.name
                .split("-")
                .map((word) => `${word[0].toUpperCase()}${word.substring(1)}`)
                .join(" ")}
              chapter={manga.lastChapter}
              released={humanizeMilliseconds(now - manga.updatedAt, false)}
              views={manga.views}
              likes={manga.likes}
              manga={true}
            />
          </div>
        ))}
      </div>
      {/* <div className="flex justify-center">
        {props.recent.length ? (
          <table className="text-primary overflow-auto">
      
            <thead>
              <tr className="text-secondary text-justify py-12 indent-10">
                <th className="py-12 indent-20">Name</th>
                <th className="px-12 ">Total Chapters</th>
                <th className="px-12 ">Views</th>
                <th className="px-12 ">Completed</th>
                <th className="px-20 ">Likes</th>
              </tr>
            </thead>
            <tbody>
              {props.recent.map((manga, index) => (
                <tr key={index}>
                  <td className="py-3 px-16">
                    <div className="flex items-center space-x-5">
                      <div className="avatar">
                        <div className="mask mask-squircle w-20 h-20">
                          <Image src={manga.coverURL} width={100} height={100} alt="cover" />
                        </div>
                      </div>
                      <div>
                        <div className="font-normal">
                          {manga.name
                            .split("-")
                            .map((word) => `${word[0].toUpperCase()}${word.substring(1)}`)
                            .join(" ")}
                        </div>
                        <div className="text-sm opacity-70">Latest Chapter: {manga.lastChapter.toLocaleString()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="mx-3 px-24">{manga.count.toLocaleString()}</td>
                  <td className="px-24">{manga.views.toLocaleString()}</td>
                  <td className="px-24 ">{manga.completed ? "✅" : <AiOutlineCloseCircle color="#FA0005"></AiOutlineCloseCircle>}</td>
                  <td className="px-24">{manga.likes.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <h2 className="mt-12 text-xl">No Mangas Found. Try searching for something else.</h2>
        )}
      </div> */}
      <Footer site={props.site} />
    </div>
  );
}
