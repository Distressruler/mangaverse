import { parseUser } from "../../../../../utils/parse-user";
import { prisma } from "../../../../../prisma/client";
import { config } from "../../../../../utils/config";
import { DiscordUser, PageProps } from "../../../../../utils/types";
import { NavBar } from "../../../../../components/NavBar";
import Link from "next/link";
import { BsArrowLeftCircle } from "react-icons/bs";
import { BsArrowRightCircle } from "react-icons/bs";
import Footer from "../../../../../components/Footer";
import UserComment from "../../../../../components/UserComment";
import Inputcomment from "../../../../../components/Inputcomment";
import { comments } from "@prisma/client";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { searchByText } from "../../../../../components/server/search";

export const metadata: Metadata = {
  title: "Read Free Novel's!",
  description:
    "With many genre's to choose from, Enryu let's you read novel's all for free! With updates daily and over a 100 novel's, Enryu is the best place to read.",
};

export interface NovelPageProps {
  user?: DiscordUser | null;
  site: {
    logo: string;
    name: string;
    discordURL: string;
    redditURL: string;
    telegramURL: string;
    twitterURL: string;
  };
  chapter: {
    novel: string;
    number: number;
    text: string[];
    comments: comments[];
  };
}

async function getServerSideProps(ctx: PageProps): Promise<NovelPageProps> {
  const user = await parseUser();

  const site = {
    name: config.siteName,
    logo: config.siteLogo,
    discordURL: config.siteDiscordURL,
    redditURL: config.siteRedditURL,
    telegramURL: config.siteTelegramURL,
    twitterURL: config.siteTwitterURL,
  };

  const novel = Array.isArray(ctx.params.name) ? ctx.params.name[0] : ctx.params.name;
  if (!novel) {
    return redirect("/");
  }

  const number = parseInt(Array.isArray(ctx.params.number) ? ctx.params.number[0]! : ctx.params.number!);

  const chapter = await prisma.novelChapters.findUnique({ where: { novel_number: { number, novel } } });
  if (!chapter)
    return {
      user,
      site,
      chapter: {
        novel: novel,
        number: number,
        text: [
          'I never believed in the whole "light at the end of the tunnel" folly where people, after experiencing near-death experiences, would startle awake in a cold sweat exclaiming, "I saw the light!" But here I am currently at this so-called "tunnel" facing a glaring light, when the last thing I remember was sleeping in my room (others call it the royal chamber).',
          "Did I die? If so, how? Was I assassinated? I don’t remember wronging anyone, but then again, being a powerful public figure gave others all sorts of reasons to want me dead.",
        ],
        comments: [],
      },
    };

  await Promise.all([
    prisma.novelChapters.update({ where: { novel_number: { novel, number } }, data: { lastRead: new Date(), viewCount: { increment: 1 } } }),
    prisma.novels.update({ where: { name: novel }, data: { views: { increment: 1 } } }),
    user
      ? prisma.reading.upsert({
          where: { userId_manga: { userId: user.id, manga: `${novel}_novel` } },
          create: { userId: user.id, manga: `${novel}_novel`, chapter: number },
          update: { chapter: number },
        })
      : undefined,
  ]);

  const comments = await prisma.comments.findMany({ where: { manga: `${novel}_novel`, chapterId: chapter.id } });

  return {
    user,
    site,
    chapter: {
      novel: chapter.novel
        .split("-")
        .map((word) => `${word[0].toUpperCase()}${word.substring(1)}`)
        .join(" "),
      number: chapter.number,
      text: chapter.text.length
        ? chapter.text
        : [
            'I never believed in the whole "light at the end of the tunnel" folly where people, after experiencing near-death experiences, would startle awake in a cold sweat exclaiming, "I saw the light!" But here I am currently at this so-called "tunnel" facing a glaring light, when the last thing I remember was sleeping in my room (others call it the royal chamber).',
            "Did I die? If so, how? Was I assassinated? I don’t remember wronging anyone, but then again, being a powerful public figure gave others all sorts of reasons to want me dead.",
          ],
      comments: comments ?? [],
    },
  };
}

export default async function MangaPage(context: PageProps) {
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

      <div>
        <h2 className="text-5xl text-center font-serif text-primary  ">{props.chapter.novel}</h2>
        <div className="flex flex-column justify-center items-center mt-6">
          <Link href={`/novels/${props.chapter.novel.toLowerCase().replaceAll(" ", "-")}/chapter/${props.chapter.number - 1}`}>
            <button className="btn btn-lg m-2">
              <BsArrowLeftCircle size={30} />
            </button>
          </Link>
          <audio controls src="/music.mp3" loop />

          <div className="flex flex-column justify-center items-center mt-6 mb-6">
            <Link href={`/novels/${props.chapter.novel.toLowerCase().replaceAll(" ", "-")}/chapter/${props.chapter.number + 1}`}>
              <button className="btn btn-lg m-2">
                <BsArrowRightCircle size={30} />
              </button>
            </Link>
          </div>
        </div>

        <div className="flex flex-col items-center mx-auto sm:w-4/12 w-9/12 novel-title">
          <Link href={`/novels/${props.chapter.novel.toLowerCase().replaceAll(" ", "-")}`}>
            <h1 className="text-3xl text-center text-secondary">Chapter {props.chapter.number}</h1>
          </Link>
          {props.chapter ? (
            <div>
              {props.chapter.text.map((text, index) => (
                <p key={index} className="novel-text">
                  {text}
                </p>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-center ">
          <Link href={`/novels/${props.chapter.novel.toLowerCase().replaceAll(" ", "-")}/chapter/${props.chapter.number - 1}`}>
            <button className="btn btn-lg m-2">
              <BsArrowLeftCircle size={30} />
            </button>
            0
          </Link>

          <Link href={`/novels/${props.chapter.novel.toLowerCase().replaceAll(" ", "-")}/chapter/${props.chapter.number + 1}`}>
            <button className="btn btn-lg m-2">
              <BsArrowRightCircle size={30} />
            </button>
          </Link>
        </div>
      </div>

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
