import { cleanChapterNumber } from "./index";
import { prisma } from "../../prisma/client";
import path from "path";
import { createChapterInDatabase, createNovelInDatabase, ensureDirectoryExistence } from "../utils/utils";
import { writeFile } from "fs";
import { DESIRED_MANGAS } from "../constants";
import { config } from "../../utils/config";

interface PageURL {
  /** The url of the page. */
  url: string;
  /** The name of the manga */
  name: string;
  /** The chapter number. */
  chapter: number;
  /** The data created or stored in db for this manga */
  // data: mangas;
}

export async function processMangabuddyUpdates(site: string) {
  const mangas = new Map<string, PageURL>();

  const elements = site.split("href=");
  for (const text of elements) {
    if (text[1] !== "/") continue;

    let name = text.substring(2, text.indexOf('">'));
    name = name.endsWith("-manga") ? name.substring(0, name.lastIndexOf("-")) : name;
    if (!name || name.includes(" ")) continue;

    const openSpanIndex = text.indexOf("<span ");
    const closeSpanIndex = text.indexOf("</span");
    if (openSpanIndex < 0 && closeSpanIndex < 0) continue;

    const chaptext = text.substring(openSpanIndex, closeSpanIndex);
    const chap = chaptext
      .substring(chaptext.indexOf(">") + 1)
      .replaceAll(" ", "-")
      .toLowerCase();
    const chapter = cleanChapterNumber(chap);
    const url = `https://mangabuddy.com/${name}/chapter-${chapter}`;

    if (config.requireDesiredManaga && !DESIRED_MANGAS.some((title) => name.startsWith(title.name))) continue;

    const chapterData = await prisma.chapters.findUnique({ where: { manga_number: { manga: name, number: chapter } } });
    if (chapterData) continue;

    // A new chapter is found
    mangas.set(url, { url, name, chapter });

    const mangaData = await prisma.mangas.findUnique({ where: { name } });
    if (mangaData) continue;

    await prisma.mangas.upsert({
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

  for (const manga of mangas.values()) await processMangabuddyChapter(manga.url);
}

export async function processMangaBuddyManga(name: string) {
  const pages = await fetch(`https://mangabuddy.com/${name}`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E150",
      "Accept-Encoding": "gzip, deflate",
      "Cache-Control": "max-age=0",
      "Accept-Language": "vi-VN",
      Referer: "https://mangabuddy.com/",
    },
  })
    .then((res) => res.text())
    .catch(console.log);
  if (!pages) return;

  const genres = new Set<string>();

  let lastChapter = 0;

  for (const word of pages.split(" ")) {
    if (word.includes('href="/genres/')) {
      if (!word.startsWith("href")) continue;
      if (!word.endsWith('"')) continue;

      const genre = word.substring(word.lastIndexOf("/") + 1, word.length - 1);
      genres.add(genre.toUpperCase() === genre ? genre : genre.toLowerCase());
    }

    if (word.startsWith(`href="/${name}/chapter-`)) {
      let chapterText = word.trim().substring(word.indexOf("chapter-"));
      chapterText = chapterText.substring(chapterText.indexOf("-") + 1);
      if (chapterText.includes('"')) chapterText = chapterText.substring(0, chapterText.indexOf('"'));

      const chapter = Number(chapterText.includes("-") ? chapterText.substring(0, chapterText.indexOf("-")) : chapterText);
      if (lastChapter < chapter) lastChapter = chapter;

      await prisma.prefills.upsert({
        where: { id: `${name}-${chapter}` },
        create: {
          id: `${name}-${chapter}`,
          chapter: Number(chapter),
          name,
          urls: [`https://mangabuddy.com/${name}/${chapter}`],
        },
        update: {
          urls: [`https://mangabuddy.com/${name}/${chapter}`],
        },
      });
    }
  }

  const statusText = pages.substring(pages.indexOf("Status :"), pages.indexOf("Status :") + 200);
  const status = statusText.substring(statusText.indexOf("n>") + 2, statusText.indexOf("</span"));

  let alternateNamesText = pages.substring(pages.indexOf(`name box`));
  // eslint-disable-next-line unused-imports/no-unused-vars
  alternateNamesText = alternateNamesText.substring(alternateNamesText.indexOf("<h2>") + 4, alternateNamesText.indexOf("</h2>"));

  let descriptionText = pages.substring(pages.indexOf('data-target="summary'));
  descriptionText = descriptionText.substring(descriptionText.indexOf('class="content'));
  descriptionText = descriptionText.substring(descriptionText.indexOf(">") + 1, descriptionText.indexOf("</p>"));

  const nsfwChapters = ["adult", "smut", "yoai", "mature", "yuri"];
  const isNSFW = nsfwChapters.some((genre) => genres.has(genre));

  await prisma.mangas.upsert({
    where: { name },
    create: {
      name,
      addedAt: new Date(),
      completed: status === "Completed",
      coverURL: "",
      lastChapter,
      updatedAt: new Date(),
      description: descriptionText.trim(),
      genres: [...genres.values()],
      nsfw: isNSFW,
    },
    update: {
      completed: status === "Completed",
      lastChapter,
      description: descriptionText.trim(),
      genres: [...genres.values()],
      nsfw: isNSFW,
    },
  });
}

export async function processMangabuddyChapter(url: string) {
  console.log("[MANGABUDDY] Processing", url);
  const separated = url.substring(url.indexOf(".com/")).split("/");
  separated.shift();

  let [name, chap] = separated;
  name = name.endsWith("-manga") ? name.substring(0, name.lastIndexOf("-")) : name;
  await processMangaBuddyManga(name);

  const chapter = cleanChapterNumber(chap);
  if (isNaN(chapter)) {
    console.log("[ERROR] MangaBuddy NOT A NUMBER");
    console.log("[ERROR] MangaBuddy NOT A NUMBER");
    console.log(chapter, name, chap, separated);
    console.log("[ERROR] MangaBuddy NOT A NUMBER");
    console.log("[ERROR] MangaBuddy NOT A NUMBER");
  }
  console.log(`[MangaBuddy] Processing ${name} #${chapter}`);
  if (config.requireDesiredManaga && !DESIRED_MANGAS.some((title) => name.startsWith(title.name))) return;

  const exists = await prisma.chapters.findUnique({ where: { manga_number: { manga: name, number: chapter } } });
  if (exists) return;

  console.log(`[MangaBuddy] Fetching ${name} #${chapter}`);

  const pages = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E150",
      "Accept-Encoding": "gzip, deflate",
      "Cache-Control": "max-age=0",
      "Accept-Language": "vi-VN",
      Referer: "https://mangabuddy.com/",
    },
  })
    .then((res) => res.text())
    .catch(console.log);
  if (!pages) return;

  console.log(`[MangaBuddy] Fetched ${name} #${chapter}`);

  const images = new Set<string>();
  const prefills = new Set<string>();

  for (const word of pages.split(" ")) {
    // Empty space
    if (!word) continue;

    if (word.includes(`href="/${name}/chapter-`)) {
      if (!word.includes(`href="/${name}/chapter-${chapter}-`)) {
        const prefill = `https://mangabuddy.com${word.substring(word.indexOf('"') + 1, word.lastIndexOf('"'))}`;
        if (prefills.has(prefill)) continue;
        if (prefill.includes("/page-")) continue;

        console.log("FOUND MANGABUDDY PREFILL", prefill);
        prefills.add(prefill);

        const data = await prisma.chapters.findUnique({ where: { manga_number: { manga: name, number: chapter } } });
        if (!data) {
          console.log("SAVING MANGABUDDY PREFILL", prefill);
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
    }

    if (!["mbcdn.xyz", "mbbcdn.com", "mbcdn.xyz"].some((txt) => word.toLowerCase().includes(txt))) continue;

    if (word.includes(",https:")) {
      const urls = word.substring(1, word.length - 1).split(",");
      for (const url of urls) images.add(url);
    }
  }

  const imageData = [];

  for (const [index, url] of [...images.values()].entries()) {
    const buffer = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (X11; CrOS aarch64 15054.98.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36",
        Referer: `https://mangabuddy.com/`,
      },
    }).then((res) => res.arrayBuffer());
    const page = index + 1;
    const filename = `page-${page}`;
    const filepath = path.join(__dirname, `../../public/manga/${name}/chapter-${chapter}/${filename}.jpg`);
    ensureDirectoryExistence(filepath);
    writeFile(filepath, Buffer.from(buffer), "binary", function (err) {
      if (err) {
        console.log("There was an error writing the image", err);
      }
    });

    imageData.push({
      page: imageData.length + 1,
      urls: [filepath, url],
    });
  }

  await createChapterInDatabase(name, chapter, imageData);
}

export async function processNovelbuddyChapter(url: string) {
  console.log("[NOVELBUDDY] Processing", url);
  const separated = url.substring(url.indexOf("novel/")).split("/");
  separated.shift();

  let [name, chap] = separated;
  name = name.endsWith("-manga") ? name.substring(0, name.lastIndexOf("-")) : name;

  const chapter = cleanChapterNumber(chap);
  if (isNaN(chapter)) {
    console.log("[ERROR] NOVELBUDDY NOT A NUMBER");
    console.log("[ERROR] NOVELBUDDY NOT A NUMBER");
    console.log(chapter, name, chap, separated);
    console.log("[ERROR] NOVELBUDDY NOT A NUMBER");
    console.log("[ERROR] NOVELBUDDY NOT A NUMBER");
  }
  console.log(`[NOVELBUDDY] Processing ${name} #${chapter}`);
  if (config.requireDesiredManaga && !DESIRED_MANGAS.some((title) => name.startsWith(title.name))) return;

  const exists = await prisma.novelChapters.findUnique({ where: { novel_number: { novel: name, number: chapter } } });
  if (exists) return;

  const pages = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E150",
      "Accept-Encoding": "gzip, deflate",
      "Cache-Control": "max-age=0",
      "Accept-Language": "vi-VN",
      Referer: "https://novelbuddy.com/",
    },
  })
    .then((res) => res.text())
    .catch(console.log);
  if (!pages) return;

  const prefills = new Set<string>();

  for (const word of pages.split(" ")) {
    if (word.includes(`href="/novel/${name}/chapter-`)) {
      if (!word.includes(`href="/novel/${name}/chapter-${chapter}-`)) {
        const prefill = `https://novelbuddy.com/novel/${word.substring(word.indexOf('"') + 1, word.lastIndexOf('"'))}`;
        if (prefills.has(prefill)) continue;

        prefills.add(prefill);

        const data = await prisma.chapters.findUnique({ where: { manga_number: { manga: name, number: chapter } } });
        if (data) {
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
    }
  }

  const texts = pages.split("<p>");
  // Remove the LOGIN WItH texts
  texts.pop();
  texts.pop();

  const text = texts.map((txt) => txt.substring(0, txt.indexOf("</p>"))).filter((t) => t);

  await createNovelInDatabase(name, chapter, text);
}
