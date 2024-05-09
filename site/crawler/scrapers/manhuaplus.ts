import { images, mangas } from "@prisma/client";
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

export async function processManhuaplusUpdates(site: string) {
  const siteData = site.split(" ");

  const mangas = new Map<string, PageURL>();

  for (const text of siteData) {
    // Ignore any irrelvent text
    if (!text.startsWith(`href=\"https://manhuaplus.com/manga/`)) continue;
    // Remove any urls to mangas instead of new releases
    if (!text.includes("/chapter-")) continue;
    const url = text.substring(6, text.lastIndexOf('/"'));

    const separated = url.substring(url.indexOf("manga/")).split("/");
    separated.shift();

    const [name, chap] = separated;
    const chapter = parseInt(chap.substring(chap.indexOf("-") + 1));
    if (!DESIRED_MANGAS.some((m) => name === m.name)) continue;
    console.log(`[MANHUAPLUS] some possible url found 2`, text);

    let data = await prisma.mangas.findUnique({ where: { name } });
    // This chapter already exists in our records.
    if (!data || data.lastChapter < chapter) {
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
    }

    console.log(`[MANHUAPLUS] some possible url found 3`, text);

    // A new chapter is found
    mangas.set(url, { url, name, chapter, data });
  }

  for (const manga of mangas.values()) {
    await processManhuaplusChapter(manga.url);
  }
}

export async function processManhuaplusChapter(url: string) {
  return await processChapter(url, "manhuaplus.com")
}
