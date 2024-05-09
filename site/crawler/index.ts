// import { processMangatxChapter, processMangatxUpdates } from "./scrapers/mangatx";
// import { processManhuaplusUpdates } from "./scrapers/manhuaplus";
import { prefillManga } from "./cron/prefill";
// import { prisma } from "../prisma/client";
import { findCoverImages } from "./cron/covers";
// import { DESIRED_MANGAS } from "./constants";
import { processMangabuddyUpdates } from "./scrapers/mangabuddy";
// import { process1stKissplusChapter } from "./scrapers/1stkissmanga";
// import { processChapter } from "./utils/utils";

const websites = [
  // {
  //   url: "https://mangatx.com/",
  //   chapters: new Map(),
  //   processUpdates: processMangatxUpdates,
  // },
  // {
  //   url: "https://manhuaplus.com/",
  //   chapters: new Map(),
  //   processUpdates: processManhuaplusUpdates,
  // },
  //  {
  //   url: "http://1stkissmanga.me/",
  //   chapters: new Map(),
  //   processUpdates: processManhuaplusUpdates,
  // },
  // {
  //   url: "https://mangaclash.com/",
  //   chapters: new Map(),
  //   processUpdates: (url: string) => processChapter(url, "mangaclash.com"),
  // },
  {
    url: "https://mangabuddy.com/latest",
    chapters: new Map(),
    processUpdates: processMangabuddyUpdates,
  },
  // {
  //   url: 'https://mangaweebs.in/',
  //   chapters: new Map()
  // }
  // {
  //   url: 'https://toonily.com/',
  //   chapters: new Map()
  // },
];

async function fetchManga() {
  // TODO: remove once completed development
  // await prisma.chapters.deleteMany();
  // await prisma.comments.deleteMany();
  // await prisma.images.deleteMany();
  // await prisma.mangas.deleteMany();
  // await prisma.masks.deleteMany();
  // await prisma.prefills.deleteMany();
  // console.log('Reset Database')

  // for (const manga of DESIRED_MANGAS) {
  //   const exists = await prisma.mangas.findUnique({ where: { name: manga.name } });
  //   if (exists) continue;

  //   console.log(`[MANGATX] Finding first chapter for ${manga.name}.`);
  //   await processMangatxChapter(`https://mangatx.com/manga/${manga.name}/chapter-1`);
  //   console.log(`[MANGATX] Added ${manga} to the database.`);
  // }

  // for (const manga of DESIRED_MANGAS) {
  //   const exists = await prisma.chapters.findUnique({ where: { manga_number: { manga: manga.name, number: 1 } } });
  //   if (exists) continue;

  //   console.log(`[MANGATX] Finding first chapter for ${manga.name}.`);
  //   await processMangatxChapter(`https://mangatx.com/manga/${manga.name}/chapter-1`);
  //   console.log(`[MANGATX] Added ${manga} to the database.`);
  // }

  for (const website of websites) {
    fetch(website.url)
      .then((res) => res.text())
      .then((text) => website.processUpdates(text))
      .catch(console.log);

    //     // Some websites mask urls
    //     if (website.url.includes('mangaweebs.in')) {
    //       // Check the name of this url
    //       if (!text.includes('/chapter')) {
    //         const index = site.indexOf(`${text.substring(6)}`)
    //         if (index < 0) continue

    //         const line = site.substring(index, index + 200)
    //         const cleaner = line.substring(line.indexOf('/">') + 3, line.indexOf('</a>'))
    //         if (cleaner.startsWith('https')) continue

    //         const url = text.substring(6, text.lastIndexOf('/"'))
    //         const id = url.substring(url.lastIndexOf('/') + 1)
    //         if (id.includes('-')) continue
    //         if (id.toLowerCase() === cleaner.toLowerCase().split(' ').join('-')) continue
    //         if (id.includes('-')) continue

    //         DATABASE.mangaweebs[id] = cleaner.toLowerCase().replaceAll('&#8217;', "'")
    //         continue
    //       }
    //   }
  }

  // const chapters = await prisma.chapters.findMany({ where: { manga: "unordinary" } });
  // await prisma.images.deleteMany({ where: { chapterId: { in: chapters.map((c) => c.id) } } });
  // await prisma.prefills.deleteMany({ where: { name: "unordinary" } });
  // await prisma.comments.deleteMany({ where: { chapterId: { in: chapters.map((c) => c.id) } } });
  // await prisma.chapters.deleteMany({ where: { manga: "unordinary" } });
  // await prisma.mangas.delete({ where: { name: "unordinary" } });

  // processMangatxChapter("https://mangatx.com/manga/unordinary/chapter-272/");
  // process1stKissplusChapter("https://1stkissmanga.me/manga/unordinary/chapter-0/");
  // processMangabuddyChapter("https://mangabuddy.com/unordinary/chapter-273")
  // processNovelbuddyChapter("https://novelbuddy.com/novel/shadow-slave/chapter-1-nightmare-begins");
  prefillManga();

  setInterval(() => {
    prefillManga();
    findCoverImages();
  }, 60000);
}

fetchManga();
