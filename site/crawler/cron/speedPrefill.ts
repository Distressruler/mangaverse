import { prefills } from "@prisma/client";
import { prisma } from "../../prisma/client";
import { MangaSites } from "../../utils/types";
import { fetchPage, processChapter, processPageHTML } from "../utils/utils";
import { DESIRED_MANGAS } from "../constants";

const availableMangas: Map<string, Set<MangaSites>> = new Map();
const unavailableMangas: Map<string, Set<MangaSites>> = new Map();


function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(ms);
    }, ms);
  });
}

const DELAY_PER_CHAPTER_PER_SITE = 5000;

const lists: MangaSites[] = [
  "mangatx.com",
  "1stkissmanga.me",
  "manhuaplus.com",
  "mangaclash.com",
  "manga68.com",
];

const queues = new Map<MangaSites, Set<string>>(lists.map(site => [site, new Set()]));


export async function speedPrefillManga() {
  const allprefills = await prisma.prefills.findMany({ orderBy: { chapter: "asc" }, distinct: "name" });

  // This loop is to determine all the sites each manga can be fetched on
  for (const prefill of allprefills) {
    const exists = await prisma.chapters.findUnique({ where: { manga_number: { manga: prefill.name, number: prefill.chapter } } });
    if (exists) {
      console.log(`[PREFILL] This chapter for this prefill already exists. ${prefill.name} #${prefill.chapter}`);
      await prisma.prefills.delete({ where: { id: prefill.id } }).catch(() => undefined);
      console.log(`[PREFILL] Deleting all prefills for ${prefill.name} that already exist.`);

      const chapters = await prisma.chapters.findMany({ where: { manga: prefill.name } });
      await prisma.prefills.deleteMany({ where: {
        AND: [
          {
            name: prefill.name,
          },
          {
            chapter: {
              in: chapters.map(p => p.number),
            },
          }
        ]
      }})
      continue
    }

    const pages = await Promise.all(lists.map(list => isMangaAvailableOnThisSite(list as MangaSites, prefill.name, prefill.chapter)))
    const index = pages.findIndex(p => p);
    if (index > -1) processPageHTML(pages[index]!, lists[index], prefill.name, prefill.chapter);
    await delay(DELAY_PER_CHAPTER_PER_SITE);
  }

  // This will try to load them all chapters for each manga across all sites it can be fetched on
  for (const prefill of allprefills) {
    console.log('[Round 2]', prefill.name, '#', prefill.chapter, 'started.');
    const relevantPrefills = await prisma.prefills.findMany({ where: { name: prefill.name } });
    const sites = availableMangas.get(prefill.name);
    if (!sites) {
      console.log(`[PREFILL] Failed to find ${prefill.name} on any website.`)
      continue;
    }

    const existing = await prisma.chapters.findMany({ where: {
      AND: [
        {
          manga: prefill.name,
        },
        {
          number: {
            in: relevantPrefills.map(p => p.chapter),
          },
        }
      ]
    }, select: { number: true }})
    const existingChapters = new Set(existing.map(e => e.number))
    const missingPrefills = relevantPrefills.filter((p) => !existingChapters.has(p.chapter) )

    await prisma.prefills.deleteMany({ where: {
      AND: [
        {
          name: prefill.name,
        },
        {
          chapter: {
            in: existing.map(p => p.number),
          },
        }
      ]
    }})

    for (const relevant of missingPrefills) {
      const [shortestQueue] = [...sites.values()].sort((a, b) => {
          const firstQueue = queues.get(a);
          const secondQueue = queues.get(b);
          if (!firstQueue || !secondQueue) console.log(prefill.name, a, b, firstQueue, secondQueue)

          return firstQueue!.size === secondQueue!.size ? 0 : firstQueue!.size > secondQueue!.size ? 1 : -1;
      })

      queues.get(shortestQueue)?.add(`https://${shortestQueue}/manga/${prefill.name}/chapter-${relevant.chapter}`);

    }

    console.log('[Round 2]', prefill.name, '#', prefill.chapter, 'finished.');
  }

  // Finally we begin looping the queues and fetch all the chapters
  queues.forEach(async (queue, site) => {    
    for (const url of queue.values()) {
        await processChapter(url, site);
        await delay(DELAY_PER_CHAPTER_PER_SITE)
    }
  })
}

async function isMangaAvailableOnThisSite(site: MangaSites, manga: string, chapter: number): Promise<string | undefined> {
    const page = await fetchPage(`https://${site}/manga/${manga}/chapter-${chapter}`, site);
    if (!page) return;

    const is404 = page.includes('404.png" alt="404">')
    if (!is404) {
        const available = availableMangas.get(manga);
        if (available) {
            available.add(site);
        } else {
            availableMangas.set(manga, new Set([site]))
        }
        const exists = await prisma.chapters.findUnique({ where: { manga_number: { manga, number: chapter } } });
        if (exists) {
          console.log(`[PREFILL] While checking each site, found a chapter that already exists. ${manga} #${chapter}`);
          return;
        }
        return page;
    } else {
        const unavailable = unavailableMangas.get(manga);
        if (unavailable) {
            unavailable.add(site);
        } else {
            unavailableMangas.set(manga, new Set([site]))
        }
    }
}

speedPrefillManga()
