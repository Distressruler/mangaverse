import { Metadata } from "next";
import { NavBar } from "../../../components/NavBar";
import { config } from "../../../utils/config";
import { parseUser } from "../../../utils/parse-user";
import { DiscordUser, PageProps } from "../../../utils/types";
import Image from "next/image";
import { FaBell, FaEye, FaHeart, FaReadme } from "react-icons/fa";
import { prisma } from "../../../prisma/client";
import Link from "next/link";
import Footer from "../../../components/Footer";
import { chapters } from "@prisma/client";
import { humanizeMilliseconds } from "../../../utils/time";
import { redirect } from "next/navigation";
import Subscribing from "../../../components/forms/Subscribing";
import Rating from "../../../components/forms/Rating";
import { searchByText } from "../../../components/server/search";

export const metadata: Metadata = {
  title: "Read Free Novel's!",
  description:
    "With many genre's to choose from, Enryu let's you read novel's all for free! With updates daily and over a 100 novel's, Enryu is the best place to read.",
};

export interface NovelsPageProps {
  name: string;
  subscribed: boolean;
  description: string;
  views: number;
  likes: number;
  dislikes: number;
  subscribers: number;
  chapter: number;
  chapters: Array<Pick<chapters, "number" | "viewCount"> & { released: string; date: string }>;
  imageURL: string;
  continueURL: string;
  user?: DiscordUser | null;
  site: {
    name: string;
    logo: string;
    discordURL: string;
    redditURL: string;
    twitterURL: string;
    telegramURL: string;
    copyrightStartYear: string;
  };
  firstChapter: number;
  comments: CommentInterface[];
  ratings: {
    mine: number | null;
    total: number;
  };
}

export interface CommentInterface {
  author: string;
  imageURL: string;
  text: string;
  likes: number;
  depth?: number;
  responses?: CommentInterface;
}

async function getServerSideProps(ctx: PageProps): Promise<NovelsPageProps> {
  const user = await parseUser();
  const query = ctx.params.name!;
  const name = query
    .split("-")
    .map((word) => `${word[0].toUpperCase()}${word.substring(1)}`)
    .join(" ");

  const [novels, chapters, comments, subscribed, ratings] = await Promise.all([
    prisma.novels.findUnique({ where: { name: query } }),
    prisma.novelChapters.findMany({
      orderBy: { number: "asc" },
      select: { number: true, released: true, viewCount: true },
      where: { novel: query },
    }),
    prisma.novelComments.findMany({ take: 10, where: { manga: query }, orderBy: { createdAt: "desc" } }),
    user ? prisma.subscribers.findUnique({ where: { userId_manga: { userId: user.id, manga: `${query}_novel` } } }) : undefined,
    user ? prisma.ratings.findMany({ where: { userId: user.id, name: query } }) : undefined,
  ]);

  if (!novels) return redirect("/");

  const read = user
    ? await prisma.reading
        .findFirst({ where: { userId: user.id, manga: `${query}_novel` } })
        .then((r) => r)
        .catch(() => undefined)
    : undefined;

  const now = Date.now();

  return {
    name,
    user,
    site: {
      name: config.siteName,
      logo: config.siteLogo,
      discordURL: config.siteDiscordURL,
      redditURL: config.siteRedditURL,
      twitterURL: config.siteTwitterURL,
      telegramURL: config.siteTelegramURL,
      copyrightStartYear: config.copyrightStartYear,
    },
    imageURL:
      novels.coverURL ||
      "https://media.discordapp.net/attachments/1086348745811165227/1147287474549297226/dbff5bbf8d667808f20b88187365a812.png?width=625&height=625",
    chapter: chapters[chapters.length - 1].number,
    continueURL: `/mangas/${query}/chapter/${read?.chapter ?? 1}`,
    description: novels.description || "No description available.",
    views: novels.views || 0,
    likes: novels.likes || 0,
    dislikes: novels.dislikes || 0,
    subscribers: novels.subscribers || 0,
    subscribed: !!subscribed,
    firstChapter: chapters[0]?.number ?? 1,
    chapters: chapters.reverse().map((chapter) => ({
      ...chapter,
      released: humanizeMilliseconds(now - chapter.released.getTime()),
      date: new Date().toDateString().substring(3),
    })),
    comments: comments.map((comment) => ({
      author: comment.userId,
      imageURL: "",
      text: comment.text,
      likes: comment.upvotes,
    })),
    ratings: {
      mine: ratings?.find((r) => r.userId === user?.id)?.rating ?? null,
      total: ratings?.length ? Math.round(ratings.reduce((a, b) => a + b.rating, 0) / ratings.length) : 5,
    },
  };
}

export default async function NovelsPage(context: PageProps) {
  const props = await getServerSideProps(context);

  return (
    <div>
      <NavBar
        avatar={
          props.user?.avatar
            ? `https://cdn.discordapp.com/avatars/${props.user.id}/${props.user.avatar}.jpg`
            : props.user?.avatar === null
            ? `https://cdn.discordapp.com/embed/avatars/${Number(props.user?.discriminator ?? "1234") % 5}.png`
            : undefined
        }
        siteLogo={props.site.logo}
        siteName={props.site.name}
        discordURL={props.site.discordURL}
        redditURL={props.site.redditURL}
        telegramURL={props.site.telegramURL}
        searchByText={searchByText}
      />

      <div className="hero min-h-screen bg-base-200 md:-mt-20">
        <div className="hero-content flex-col lg:flex-row">
          <Image
            src={props.imageURL}
            alt="Novel cover"
            className="w-5/6 lg:w-auto max-w-sm max-h-max rounded-lg shadow-2xl"
            height={500}
            width={500}
          />
          <div className="max-w-4xl">
            <h1 className="text-5xl font-bold text-primary-focus">{props.name}</h1>
            <Rating mine={props.ratings.mine} total={props.ratings.total} userId={props.user?.id} name={props.name} />
            <p className="py-2 text-secondary">{props.description}</p>

            <div>
              <div className="stats shadow flex flex-wrap justify-center items-center w-11/12 lg:w-min lg:flex-nowrap">
                <div className="stat">
                  <div className="stat-figure text-error">
                    <FaReadme className="inline-block w-8 h-8 stroke-current" width={24} height={24} />
                  </div>
                  <div className="stat-title">Total Chapters</div>
                  <div className="stat-value text-error">{props.chapter.toLocaleString()}</div>
                </div>

                <div className="stat">
                  <div className="stat-figure text-info">
                    <FaHeart className="inline-block w-8 h-8 stroke-current" width={24} height={24} />
                  </div>
                  <div className="stat-title">Total Likes</div>
                  <div className="stat-value text-info">
                    {props.likes.toLocaleString()} / {props.dislikes.toLocaleString()}
                  </div>
                </div>

                <div className="stat">
                  <div className="stat-figure text-success">
                    <FaBell className="inline-block w-8 h-8 stroke-current" width={24} height={24} />
                  </div>

                  <div className="stat-title">Total Subscribers</div>
                  <div className="stat-value text-success">{props.subscribers.toLocaleString()}</div>
                </div>

                <div className="stat">
                  <div className="stat-figure text-warning">
                    <FaEye className="inline-block w-8 h-8 stroke-current" width={24} height={24} />
                  </div>
                  <div className="stat-title">Total Views</div>
                  <div className="stat-value text-warning">{props.views.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div className="flex mt-4">
              {props.user ? <Subscribing name={props.name} userId={props.user.id} subscribed={props.subscribed} /> : null}

              <Link href={`${props.name.toLowerCase().replaceAll(" ", "-")}/chapter/${props.firstChapter}`}>
                <button className="btn btn-secondary btn-outline ml-2">First Chapter</button>
              </Link>
              <Link href={props.continueURL}>
                <button className="btn btn-primary ml-2">Continue Reading</button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="w-screen">
        <div>
          <table className="table table-lg table-zebra">
            <thead>
              <tr>
                <th className="text-center">Action</th>
                <th className="text-center">Chapter</th>
                <th className="text-center">Views</th>
                <th className="text-center">Released</th>
                <th className="text-center">Date</th>
              </tr>
            </thead>
            <tbody className="text-center min-w-full">
              {props.chapters.map((chapter, index) => {
                const isRead = parseInt(props.continueURL.substring(props.continueURL.lastIndexOf("/") + 1)) > chapter.number;

                return (
                  <tr key={index} className={isRead ? "text-gray-500" : ""}>
                    <td>
                      <Link href={`/novels/${props.name.toLowerCase().replaceAll(" ", "-")}/chapter/${chapter.number}`}>
                        <button className={`btn btn-outline ml-2 ${isRead ? "px-7 py-4" : ""}`}>{isRead ? "Read" : "Unread"}</button>
                      </Link>
                    </td>
                    <td>Chapter {chapter.number.toLocaleString()}</td>
                    <td>{chapter.viewCount.toLocaleString()}</td>
                    <td>{chapter.released}</td>
                    <td>{chapter.date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Footer site={props.site} />
    </div>
  );
}
