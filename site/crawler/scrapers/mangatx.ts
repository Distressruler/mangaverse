import { images, mangas } from "@prisma/client";
import { cleanChapterNumber, sendNewChapterAlertToDiscord } from "./index";
import { prisma } from "../../prisma/client";
import { DESIRED_MANGAS } from "../constants";
import { createChapterInDatabase, fetchPage, getMangaNameAndChapterFromURL, handlePossiblePrefills, htmlToImageURLs, processChapter } from "../utils/utils";

interface PageURL {
  /** The url of the page. */
  url: string;
  /** The name of the manga */
  name: string;
  /** The chapter number. */
  chapter: number;
  /** The data created or stored in db for this manga */
  data: mangas;
}

export async function processMangatxUpdates(site: string) {
  const siteData = site.split(" ");

  const mangas = new Map<string, PageURL>();

  for (const text of siteData) {
    // Ignore any irrelvent text
    if (!text.startsWith(`href=\"https://mangatx.com/manga/`)) continue;
    // Remove any urls to mangas instead of new releases
    if (!text.includes("/chapter-")) continue;

    const url = text.substring(6, text.lastIndexOf('/"'));

    const separated = url.substring(url.indexOf("manga/")).split("/");
    separated.shift();

    let [name, chap] = separated;
    name = name.endsWith("-manga") ? name.substring(0, name.lastIndexOf("-")) : name;

    const chapter = cleanChapterNumber(chap);

    let data = await prisma.mangas.findUnique({ where: { name: name.replaceAll("-manga", "") } });
    if (data && data.lastChapter > chapter) continue;

    if (!DESIRED_MANGAS.some((m) => name === m.name)) continue;

    data = await prisma.mangas.upsert({
      where: { name },
      create: {
        name,
        addedAt: new Date(),
        completed: false,
        coverURL: "",
        lastChapter: chapter,
        updatedAt: new Date(),
      },
      update: {
        updatedAt: new Date(),
        lastChapter: chapter,
      },
    });

    // A new chapter is found
    mangas.set(url, { url, name, chapter, data });
  }

  for (const manga of mangas.values()) await processMangatxChapter(manga.url);
}

export async function processMangatxChapter(url: string) {
  return await processChapter(url, "mangatx.com")
}
