import { prefills } from "@prisma/client";
import { prisma } from "../../prisma/client";
import { MangaSites } from "../../utils/types";
import { processChapter } from "../utils/utils";
import { processMangabuddyChapter, processNovelbuddyChapter } from "../scrapers/mangabuddy";

export function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(ms);
    }, ms);
  });
}

export const DELAY_PER_CHAPTER_PER_SITE = 5000;

const lists: Record<string, { processing: boolean; queue: prefills[] }> = {
  // "mangatx.com": { processing: false, queue: [] },
  // "1stkissmanga.me": { processing: false, queue: [] },
  // "manhuaplus.com": { processing: false, queue: [] },
  // "mangaclash.com": { processing: false, queue: [] },
  // "manga68.com": { processing: false, queue: [] },
  "mangabuddy.com": { processing: false, queue: [] },
  // "novelbuddy.com": { processing: false, queue: [] },
};

const PRIORITY_MANGAS = ["unordinary", "tower-of-god", "eleceed", "lookism", "my-in-laws-are-obsessed-with-me"];

export async function prefillManga() {
  if (Object.values(lists).some((list) => list.processing)) {
    return console.log("[PREFILL] Skipping prefill, because prefill is already in process.");
  }

  // lists["mangatx.com"].processing = true;
  // lists["manhuaplus.com"].processing = true;
  // lists["1stkissmanga.me"].processing = true;
  // lists["mangaclash.com"].processing = true;
  // lists["manga68.com"].processing = true;
  lists["mangabuddy.com"].processing = true;
  // lists["novelbuddy.com"].processing = true;

  let allprefills = await prisma.prefills.findMany({ take: 1000, orderBy: { chapter: "asc" }, where: { name: { in: PRIORITY_MANGAS } } });
  if (!allprefills.length) allprefills = await prisma.prefills.findMany({ take: 1000, orderBy: { chapter: "asc" } });
  const websitesScraped = new Set();

  for (const prefill of allprefills) {
    if (prefill.urls.length > 1) {
      const possibleSiteNames = Object.keys(lists).filter((site) => prefill.urls.some((u) => u.startsWith(`https://${site}`))) as MangaSites[];
      let websiteName = possibleSiteNames[0];

      for (const site of possibleSiteNames) {
        if (lists[websiteName].queue.length >= lists[site].queue.length) continue;
        websiteName = site;
      }

      if (!lists[websiteName]) {
        console.log("websiteName", websiteName, lists[websiteName]);
        console.log("[Prefill] Deleting unknown manga site.", websiteName, prefill);
        await prisma.prefills.delete({ where: { id: prefill.id } });
        continue;
      }

      lists[websiteName].queue.push(prefill);
      continue;
    }

    const websiteName = Object.keys(lists).find((site) => prefill.urls.some((u) => u.startsWith(`https://${site}`))) as MangaSites;
    if (!lists[websiteName]) {
      console.log("websiteName", websiteName, lists[websiteName]);
      console.log("[Prefill] Deleting unknown manga site 2.", prefill);
      await prisma.prefills.delete({ where: { id: prefill.id } });
      continue;
    }

    lists[websiteName].queue.push(prefill);
  }

  // for (const manga of allprefills) {
  //   const websiteName = Object.keys(lists).find(key);

  //   if (!lists[websiteName]) {
  //     console.log("[Prefill] Deleting unknown manga site.", manga);
  //     await prisma.prefills.delete({ where: { id: manga.id } });
  //     continue;
  //   }
  //   lists[websiteName].queue.push(manga);
  // }

  Object.entries(lists).forEach(async ([websiteName, prefills]) => {
    console.log(`[PREFILL ${websiteName.toUpperCase()}] Started!`);
    prefills.queue = prefills.queue.sort((a, b) => {
      if (a.name === b.name) {
        return a.chapter < b.chapter ? -1 : 1;
      }

      return a.name < b.name ? -1 : 1;
    });

    for (let index = 0; index <= prefills.queue.length; index++) {
      const manga = prefills.queue[index];
      if (!manga) continue;

      const exists = await prisma.chapters.findUnique({ where: { manga_number: { manga: manga.name, number: manga.chapter } } });
      if (exists) {
        console.log(`[PREFILL ${websiteName.toUpperCase()}] This chapter already exists. ${manga.name} #${manga.chapter}`);
        await prisma.prefills.delete({ where: { id: manga.id } });
        prefills.queue.splice(index, 1);
      }
    }

    while (prefills.queue.length) {
      const manga = prefills.queue[0];
      const url = manga.urls.find((url) => url.startsWith(`https://${websiteName}`));
      if (!url) {
        prefills.queue.shift();
        continue;
      }

      if (!manga) {
        prefills.queue.shift();
        console.log("[PREFILL] Failed to find a manga to fill.");
        continue;
      }

      if (websitesScraped.has(websiteName)) {
        console.log(
          `[PREFILL ${websiteName.toUpperCase()}] Delaying ${websiteName} ${manga.name} #${manga.chapter}. Site recently scraped. Remaining: ${
            prefills.queue.length
          }`
        );
        // prefills.queue.push(prefills.queue.shift()!);
        await delay(DELAY_PER_CHAPTER_PER_SITE);
        continue;
      }

      setTimeout(() => {
        websitesScraped.delete(websiteName);
      }, DELAY_PER_CHAPTER_PER_SITE);

      websitesScraped.add(websiteName);

      console.log(`[PREFILL ${websiteName.toUpperCase()}] Preparing to process ${manga.name} #${manga.chapter}.`);
      switch (websiteName as MangaSites) {
        case "mangatx.com":
        case "manhuaplus.com":
        case "1stkissmanga.me":
        case "mangaclash.com":
        case "manga68.com":
          processChapter(url, websiteName as MangaSites);
          prefills.queue.shift();
          break;
        case "mangabuddy.com":
          processMangabuddyChapter(url);
          prefills.queue.shift();
          break;
        case "novelbuddy.com":
          processNovelbuddyChapter(url);
          prefills.queue.shift();
          break;
        default:
          console.log("Unknown handling for prefill:", manga.id, manga.name, manga.chapter, websiteName, url);
          prefills.queue.shift();
          break;
      }

      console.log(`[PREFILL ${websiteName.toUpperCase()}] Finished processing ${manga.name} #${manga.chapter}.`);
      await prisma.prefills.delete({ where: { id: manga.id } });
    }

    prefills.processing = false;
    console.log(`[PREFILL ${websiteName.toUpperCase()}] Finished!`);
  });
}
