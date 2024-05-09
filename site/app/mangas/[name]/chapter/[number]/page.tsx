import { comments } from "@prisma/client";
import { Metadata } from "next";
import Link from "next/link";
import { BsArrowLeftCircle, BsArrowRightCircle } from "react-icons/bs";
import Footer from "../../../../../components/Footer";
import Inputcomment from "../../../../../components/Inputcomment";
import { NavBar } from "../../../../../components/NavBar";
import UserComment from "../../../../../components/UserComment";
import { prisma } from "../../../../../prisma/client";
import { parseUser } from "../../../../../utils/parse-user";
import { DiscordUser, PageProps } from "../../../../../utils/types";
import { config } from "../../../../../utils/config";
import { redirect } from "next/navigation";
import MangaPager from "../../../../../components/MangaPager";
import { searchByText } from "../../../../../components/server/search";

export const metadata: Metadata = {
  title: "Read Free Webtoon's, Manga's, Manhwa's, Manhua's!",
  description:
    "With many genre's to choose from, Enryu let's you read manga's, manhwa's, manhua's, and novel's all for free! With updates daily and over a 100 mangas's with high quality images, Enryu is the best place to read.",
};

export interface MangaPageProps {
  user?: DiscordUser | null;
  site: {
    logo: string;
    name: string;
    discordURL: string;
    redditURL: string;
    telegramURL: string;
    twitterURL: string;
  };
  chapter?: {
    manga: string;
    number: number;
    images: string[];
    comments: comments[];
    likes: number;
  };
}

async function getServerSideProps(ctx: PageProps): Promise<MangaPageProps> {
  const user = await parseUser();
  const site = {
    name: config.siteName,
    logo: config.siteLogo,
    discordURL: config.siteDiscordURL,
    redditURL: config.siteRedditURL,
    telegramURL: config.siteTelegramURL,
    twitterURL: config.siteTwitterURL,
  };
  const manga = Array.isArray(ctx.params.name) ? ctx.params.name[0] : ctx.params.name;
  if (!manga) return redirect("/");

  const number = parseInt(Array.isArray(ctx.params.number) ? ctx.params.number[0]! : ctx.params.number!);

  const chapter = await prisma.chapters.findUnique({ where: { manga_number: { number, manga } }, include: { images: true } });
  if (!chapter) return { user, site };

  await Promise.all([
    prisma.chapters.update({ where: { manga_number: { manga, number } }, data: { lastRead: new Date(), viewCount: { increment: 1 } } }),
    prisma.mangas.update({ where: { name: manga }, data: { views: { increment: 1 } } }),
    user
      ? prisma.reading.upsert({
          where: { userId_manga: { userId: user.id, manga } },
          create: { userId: user.id, manga, chapter: number },
          update: { chapter: number },
        })
      : undefined,
  ]);

  const comments = await prisma.comments.findMany({ where: { manga, chapterId: chapter.id } });

  return {
    user,
    site,
    chapter: {
      manga: chapter.manga
        .split("-")
        .map((word) => `${word[0].toUpperCase()}${word.substring(1)}`)
        .join(" "),
      number: chapter.number,
      images: [...new Set(chapter.images.sort((a, b) => a.page - b.page).map((i) => i.urls[0])).values()],
      comments,
      likes: 0,
    },
  };
}
export default async function MangaPage(ctx: PageProps) {
  const props = await getServerSideProps(ctx);

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

      {props.chapter ? (
        <div>
          <Link href={`/mangas/${props.chapter.manga.toLowerCase().replaceAll(" ", "-")}`}>
            <h1 className="text-5xl font-bold text-center">
              {props.chapter.manga} Chapter {props.chapter.number}
            </h1>
          </Link>

          <MangaPager chapter={props.chapter} site={props.site} />

          <div className="flex items-center justify-center">
            <Link href={`/mangas/${props.chapter.manga.toLowerCase().replaceAll(" ", "-")}/chapter/${props.chapter.number - 1}`}>
              <button className="btn btn-lg m-2">
                <BsArrowLeftCircle size={30} />
              </button>
            </Link>

            <Link href={`/mangas/${props.chapter.manga.toLowerCase().replaceAll(" ", "-")}/chapter/${props.chapter.number + 1}`}>
              <button className="btn btn-lg m-2">
                <BsArrowRightCircle size={30} />
              </button>
            </Link>
          </div>
        </div>
      ) : null}

      <section className="py-8 lg:py-16">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg lg:text-2xl">Comments ({props.chapter?.comments.length ?? 0})</h2>
          </div>

          {props.user ? <Inputcomment /> : null}

          <br />
          {props.chapter?.comments.map((comment, index) => (
            <UserComment
              key={index}
              author={comment.userId}
              authorIcon={comment.userId}
              createdAt={comment.createdAt.toISOString().substring(0, 10)}
              imageURL=""
              text={comment.text}
              likes={comment.upvotes}
              // TODO: fix responses on subcomments
              responses={[]}
            />
          ))}
        </div>
      </section>
      <Footer site={props.site} />
    </div>
  );
}
