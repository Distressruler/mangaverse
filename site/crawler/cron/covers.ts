import { writeFile } from "fs";
import path from "path";
import { prisma } from "../../prisma/client";
import { DESIRED_MANGAS } from "../constants";
import { ensureDirectoryExistence } from "../utils/utils";

const checked: string[] = [];

export async function findCoverImages() {
  const missingCovers = await prisma.mangas.findMany({
    take: 5,
    where: { coverURL: "", name: { notIn: checked } },
    select: { id: true, name: true, description: true },
  });
  if (!missingCovers.length) return;

  for (const cover of missingCovers) {
    checked.push(cover.name);

    if (!cover.description) {
      const possible = DESIRED_MANGAS.find((manga) => manga.name === cover.name);
      if (possible?.description) {
        await prisma.mangas.update({ where: { id: cover.id }, data: { description: possible.description } });
      }
    }

    const buffer = await fetch(`https://thumb.youmadcdn.xyz/thumb/${cover.name.replaceAll(" ", "-")}.png`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E150",
        "Accept-Encoding": "gzip, deflate",
        "Cache-Control": "max-age=0",
        "Accept-Language": "vi-VN",
        Referer: "https://mangabuddy.com/",
      },
    })
      .then((res) => res.arrayBuffer())
      .catch(console.log);
    if (!buffer) continue;

    const filepath = path.join(__dirname, `../../public/covers/${cover.name.replaceAll(" ", "-")}.jpg`);
    ensureDirectoryExistence(filepath);
    writeFile(filepath, Buffer.from(buffer), "binary", function (err) {
      if (err) {
        console.log("There was an error writing the image", err);
      }
    });

    console.log(`[Cover] Found for ${cover.name} on mangabuddy`);
    await prisma.mangas.update({
      where: { id: cover.id },
      data: { coverURL: `/covers/${cover.name.replaceAll(" ", "-")}.jpg` },
    });
  }

  findCoverImages();
}

export async function setPreferredCovers() {
  for (const manga of DESIRED_MANGAS) {
    const exists = await prisma.mangas.findUnique({ where: { name: manga.name } });
    if (!exists) continue;

    await prisma.mangas.update({ where: { name: manga.name }, data: { coverURL: manga.coverURL, description: manga.description } });
  }
}

findCoverImages();
setPreferredCovers();
