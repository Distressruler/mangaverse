"use client";

import { chapters } from "@prisma/client";
import { humanizeMilliseconds } from "../utils/time";
import { DiscordUser } from "../utils/types";
import { NavBar } from "./NavBar";
import { UpdatedBox } from "./UpdatedBox";
import Footer from "./Footer";
import Banner from "./Banner";
import Link from "next/link";

export interface HomePageProps {
  user?: DiscordUser | null;
  banners: Array<{
    imageURL: string;
    title: string;
    description: string;
    name: string;
    buttonURL: string;
  }>;
  recent: Array<Omit<chapters, "released" | "lastRead"> & { released: number; cover: string }>;
  exclusives: Array<Omit<chapters, "released" | "lastRead"> & { released: number; cover: string }>;
  subscriptions: Array<Omit<chapters, "released" | "lastRead"> & { released: number; cover: string }>;
  notifications: Array<Omit<chapters, "released" | "lastRead"> & { released: number; cover: string }>;
  site: {
    name: string;
    logo: string;
    discordURL: string;
    redditURL: string;
    twitterURL: string;
    telegramURL: string;
  };
  timestamp: number;
  page: number;
  searchByText: (form: FormData) => Promise<void>;
}

export function HomePage(props: HomePageProps) {
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
        notifications={props.notifications}
        searchByText={props.searchByText}
      />

      <Banner banners={props.banners} />

      {props.subscriptions.length ? (
        <div>
          <h2 className="text-center text-3xl">My Subscriptions</h2>
          <div className="divider"></div>
          <div className="flex justify-center items-center flex-wrap">
            {props.subscriptions.map((chapter, index) => (
              <UpdatedBox
                key={index}
                imageURL={
                  chapter.cover ||
                  "data:image/jpeg;base64,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"
                }
                name={chapter.manga
                  .split("-")
                  .map((word) => `${word[0].toUpperCase()}${word.substring(1)}`)
                  .join(" ")}
                chapter={chapter.number}
                released={humanizeMilliseconds(props.timestamp - chapter.released, false)}
                hot
                new
                manga
                colored
              />
            ))}
          </div>
        </div>
      ) : null}

      <h2 className="text-center text-3xl mt-6 font-serif font-bold text-white">Exclusive Series</h2>
      <div className="divider"></div>
      <div className="flex justify-center items-center flex-wrap">
        {props.exclusives.map((chapter, index) => (
          <UpdatedBox
            key={index}
            imageURL={
              chapter.cover ||
              "https://media.discordapp.net/attachments/1086348745811165227/1147287474549297226/dbff5bbf8d667808f20b88187365a812.png?width=625&height=625"
            }
            name={chapter.manga
              .split("-")
              .map((word) => `${word[0].toUpperCase()}${word.substring(1)}`)
              .join(" ")}
            chapter={chapter.number}
            released={humanizeMilliseconds(props.timestamp - chapter.released, false)}
            hot
            new
            manga
            colored
          />
        ))}
      </div>

      <h2 className="text-center text-3xl mt-6 font-serif font-bold text-white">Latest Releases</h2>
      <div className="divider"></div>
      <div className="flex justify-center items-center flex-wrap">
        {props.recent.map((chapter, index) => (
          <UpdatedBox
            key={index}
            imageURL={
              chapter.cover ||
              "https://media.discordapp.net/attachments/1086348745811165227/1147287474549297226/dbff5bbf8d667808f20b88187365a812.png?width=625&height=625"
            }
            name={chapter.manga
              .split("-")
              .map((word) => `${word[0].toUpperCase()}${word.substring(1)}`)
              .join(" ")}
            chapter={chapter.number}
            released={humanizeMilliseconds(props.timestamp - chapter.released, false)}
            hot
            new
            manga
            colored
          />
        ))}
      </div>

      <div className="flex justify-center items-center flex-wrap mt-6">
        <div className="join">
          <Link href={`/?page=${1}`}>
            <button className={`join-item btn btn-sm md:btn-md lg:btn-lg ${props.page === 1 ? "btn-active bg-cyan-600" : "bg-gray-500"}`}>1</button>
          </Link>
          <Link href={`/?page=${2}`}>
            <button className={`join-item btn btn-sm md:btn-md lg:btn-lg ${props.page === 2 ? "btn-active bg-cyan-600" : "bg-gray-500"}`}>2</button>
          </Link>
          <Link href={`/?page=${3}`}>
            <button className={`join-item btn btn-sm md:btn-md lg:btn-lg ${props.page === 3 ? "btn-active bg-cyan-600" : "bg-gray-500"}`}>3</button>
          </Link>
          <Link href={`/?page=${4}`}>
            <button className={`join-item btn btn-sm md:btn-md lg:btn-lg ${props.page === 4 ? "btn-active bg-cyan-600" : "bg-gray-500"}`}>4</button>
          </Link>
          <Link href={`/?page=${5}`}>
            <button className={`join-item btn btn-sm md:btn-md lg:btn-lg ${props.page === 5 ? "btn-active bg-cyan-600" : "bg-gray-500"}`}>5</button>
          </Link>
          <Link href={`/?page=${6}`}>
            <button className={`join-item btn btn-sm md:btn-md lg:btn-lg ${props.page === 6 ? "btn-active bg-cyan-600" : "bg-gray-500"}`}>6</button>
          </Link>
          <Link href={`/?page=${7}`}>
            <button className={`join-item btn btn-sm md:btn-md lg:btn-lg ${props.page === 7 ? "btn-active bg-cyan-600" : "bg-gray-500"}`}>7</button>
          </Link>
          <Link href={`/?page=${8}`}>
            <button className={`join-item btn btn-sm md:btn-md lg:btn-lg ${props.page === 8 ? "btn-active bg-cyan-600" : "bg-gray-500"}`}>8</button>
          </Link>
          <Link href={`/?page=${9}`}>
            <button className={`join-item btn btn-sm md:btn-md lg:btn-lg ${props.page === 9 ? "btn-active bg-cyan-600" : "bg-gray-500"}`}>9</button>
          </Link>
          <Link href={`/?page=${10}`}>
            <button className={`join-item btn btn-sm md:btn-md lg:btn-lg ${props.page === 10 ? "btn-active bg-cyan-600" : "bg-gray-500"}`}>10</button>
          </Link>
        </div>
      </div>

      <Footer site={props.site} />
    </div>
  );
}
