import { images } from "@prisma/client";
import { prisma } from "../../prisma/client";
import { MangaSites } from "../../utils/types";
import { cleanChapterNumber, sendNewChapterAlertToDiscord } from "../scrapers";
import { existsSync, mkdirSync, writeFile, writeFileSync } from "fs";
import path from "path";
import { DESIRED_MANGAS } from "../constants";

const prefilling = new Set();

export async function handlePossiblePrefills(possiblePrefills: Set<string>, manga: string, website: MangaSites) {
  console.log(`[${website.toUpperCase()}] Possible prefills for`, manga, possiblePrefills.size);

  for (const prefill of possiblePrefills.values()) {
    if (prefilling.has(prefill)) continue;

    const words = prefill.substring(prefill.indexOf("manga/")).split("/");
    words.shift();

    const [name, chap] = words;
    const chapter = parseInt(
      chap
        .substring(chap.indexOf("-") + 1)
        .replaceAll("-", ".")
        .replaceAll("_", ".")
    );

    const data = await prisma.chapters.findUnique({ where: { manga_number: { manga: name, number: chapter } } });
    if (data) continue;

    prefilling.add(prefill);

    await prisma.prefills.upsert({
      where: { id: `${name}-${chapter}` },
      update: { urls: { push: prefill } },
      create: {
        id: `${name}-${chapter}`,
        name,
        chapter,
        urls: [prefill],
      },
    });
  }
}

export function getMangaNameAndChapterFromURL(url: string, site: MangaSites) {
  const separated = url.substring(url.indexOf("manga/")).split("/");
  separated.shift();

  let [name, chap] = separated;
  name = name.endsWith("-manga") ? name.substring(0, name.lastIndexOf("-")) : name;

  const chapter = cleanChapterNumber(chap);
  if (isNaN(chapter)) {
    console.log(`[ERROR] ${site.toUpperCase()} NOT A NUMBER`);
    console.log(`[ERROR] ${site.toUpperCase()} NOT A NUMBER`);
    console.log(chapter, name, chap, separated);
    console.log(`[ERROR] ${site.toUpperCase()} NOT A NUMBER`);
    console.log(`[ERROR] ${site.toUpperCase()} NOT A NUMBER`);
  }
  console.log(`[${site.toUpperCase()}] Processing ${name} #${chapter}`);

  return {
    name,
    chapter,
  };
}

export async function fetchPage(url: string, site: MangaSites) {
  return await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (X11; CrOS aarch64 15054.98.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36",
      // Referer: `https://${site}`,
    },
  })
    .then((res) => res.text())
    .catch(console.log);
}

export function ensureDirectoryExistence(filePath: string) {
  var dirname = path.dirname(filePath);
  if (existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  mkdirSync(dirname);
}

export async function htmlToImageURLs(
  pageData: string,
  site: MangaSites,
  options: { manga: string; chapter: number; images: Array<Omit<images, "id" | "chapterId">> }
) {
  console.log(`[${site.toUpperCase()}] Downloading images for ${options.manga} #${options.chapter}`);

  const prefills = new Set<string>();

  for (const text of pageData.split(" ")) {
    // Ignore any irrelvent text
    if (!text.includes("https:")) continue;

    if (text.includes("/chapter-")) {
      if (text.startsWith("data-redirect")) {
        prefills.add(text.substring(text.indexOf('"') + 1, text.lastIndexOf("/")));
        continue;
      }
    }

    if (!text.includes(`src=`)) continue;
    if (text.includes("themes/")) continue;
    if (!text.includes("WP-manga")) continue;

    const format = [".jpg", ".jpeg", ".png", ".gif", ".webp"].find((fmt) => text.includes(fmt));
    if (!format) continue;

    const imageURL = text.substring(text.indexOf("https"), text.lastIndexOf(format) + format.length);
    const buffer = await fetch(imageURL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (X11; CrOS aarch64 15054.98.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36",
        Referer: `https://${site}`,
      },
    }).then((res) => res.arrayBuffer());
    const page = options.images.length + 1;
    const filename = `page-${page}`;
    const filepath = path.join(__dirname, `../../public/manga/${options.manga}/chapter-${options.chapter}/${filename}.jpg`);
    ensureDirectoryExistence(filepath);
    writeFile(filepath, Buffer.from(buffer), "binary", function (err) {
      if (err) {
        console.log("There was an error writing the image", err);
      }
    });

    options.images.push({
      page: options.images.length + 1,
      urls: [filepath, imageURL],
    });
  }

  handlePossiblePrefills(prefills, options.manga, site);
}

export async function createChapterInDatabase(manga: string, number: number, images: Array<Omit<images, "id" | "chapterId">>) {
  console.log(`[DATABASE] Creating chapter in the database for ${manga} #${number}`);

  const exists = await prisma.chapters.findUnique({ where: { manga_number: { manga, number } } });
  if (exists) return;

  await prisma.chapters.create({
    data: {
      manga,
      number,
      images: {
        createMany: {
          data: images,
        },
      },
      viewCount: 0,
      lastRead: new Date(),
      released: new Date(),
    },
  });

  // Mark new chapter released at
  const data = await prisma.mangas.findUnique({ where: { name: manga } });

  await sendNewChapterAlertToDiscord(manga, number, data?.coverURL ?? "");

  if (!data || data.lastChapter > number) {
    await prisma.mangas.upsert({
      where: { name: manga },
      create: {
        name: manga,
        addedAt: new Date(),
        completed: false,
        coverURL: "",
        lastChapter: number,
        updatedAt: new Date(),
      },
      update: {
        updatedAt: new Date(),
        lastChapter: number,
      },
    });
  }
}

export async function createNovelInDatabase(novel: string, number: number, texts: string[]) {
  console.log(`[DATABASE] Creating novel chapter in the database for ${novel} #${number}`);

  await prisma.novelChapters.create({
    data: {
      novel,
      number,
      text: texts,
      viewCount: 0,
      lastRead: new Date(),
      released: new Date(),
    },
  });

  // Mark new chapter released at
  const data = await prisma.novels.findUnique({ where: { name: novel } });

  await sendNewChapterAlertToDiscord(novel, number, data?.coverURL ?? "");

  if (!data || data.lastChapter > number) {
    await prisma.novels.upsert({
      where: { name: novel },
      create: {
        name: novel,
        addedAt: new Date(),
        completed: false,
        coverURL: "",
        lastChapter: number,
        updatedAt: new Date(),
      },
      update: {
        updatedAt: new Date(),
        lastChapter: number,
      },
    });
  }
}

export async function processChapter(url: string, site: MangaSites) {
  const { name, chapter } = getMangaNameAndChapterFromURL(url, site);
  if (!DESIRED_MANGAS.some((m) => name === m.name.replaceAll("'", ""))) return;

  console.log("processing chapter 1", url);
  const exists = await prisma.chapters.findUnique({ where: { manga_number: { manga: name, number: chapter } } });
  if (exists) return;

  console.log("processing chapter 2", url);
  const pages = await fetchPage(url, site);
  if (!pages) return;

  console.log("processing chapter 3", url);
  await processPageHTML(pages, site, name, chapter);
}

export async function processPageHTML(html: string, site: MangaSites, manga: string, chapter: number) {
  console.log(`[${site.toUpperCase()}] Processing page html ${manga} #${chapter}`);

  if (!DESIRED_MANGAS.some((m) => manga === m.name)) return;

  const pageImages: Array<Omit<images, "id" | "chapterId">> = [];
  await htmlToImageURLs(html, site, { manga, chapter, images: pageImages });
  await createChapterInDatabase(manga, chapter, pageImages);
}
