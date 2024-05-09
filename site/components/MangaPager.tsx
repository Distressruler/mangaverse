"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { AiOutlineArrowDown } from "react-icons/ai";
import { BsArrowLeftCircle, BsArrowRightCircle } from "react-icons/bs";

export interface MangaPagerProps {
  site: {
    logo: string;
    name: string;
    discordURL: string;
    redditURL: string;
    telegramURL: string;
    twitterURL: string;
  };
  chapter: {
    manga: string;
    number: number;
    images: string[];
    likes: number;
  };
}

export default function MangaPager(props: MangaPagerProps) {
  const [page, setPage] = useState(-1);

  return (
    <div>
      <div className="flex flex-column justify-center items-center mt-6">
        <audio controls src="/music.mp3" loop />

        <div className="flex items-center justify-center mt-6">
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

          <div className="form-control w-44">
            <label className="cursor-pointer label">
              <span className="">Show All Pages</span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={page === -1}
                onChange={() => {
                  setPage(page === -1 ? 0 : -1);
                }}
              />
            </label>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center mx-auto w-11/12">
        {props.chapter.images.map((image, index) => {
          if (page > -1 && index > page) return null;

          return (
            <Link
              href={`#${(index + 1).toString()}`}
              className={`w-screen md:max-w-4xl`}
              // Forgot why we did this?
              // className={`w-screen md:max-w-4xl ${index ? "pt-4 bg-white" : ""}`}
              key={index}
              id={index.toString()}
            >
              <Image
                src={image.substring(image.indexOf("/public/") + 7)}
                alt={`page ${index + 1}`}
                width={1200}
                height={800}
                placeholder="blur"
                blurDataURL={props.site.logo}
              />
            </Link>
          );
        })}
      </div>

      {page === -1 ? null : (
        <div className="flex items-center justify-center">
          <button
            className="btn btn-lg m-2"
            onClick={() => {
              setPage(page + 1);
            }}
          >
            <AiOutlineArrowDown size={30} />
          </button>
        </div>
      )}
    </div>
  );
}
