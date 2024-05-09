import { processMangabuddyChapter } from "./scrapers/mangabuddy";

async function beginTest() {
    console.log("testing", );
    await processMangabuddyChapter("https://mangabuddy.com/unordinary/chapter-327");
    console.log("FINISHED");
}

beginTest();