import { prisma } from "../../prisma/client";
import { DESIRED_MANGAS } from "../constants";

export async function setMangaDescriptions() {
  const missing = await prisma.mangas.findMany({ take: 100, where: { description: "" }, select: { id: true, name: true, description: true } });
  if (!missing.length) return;

  for (const cover of missing) {
    if (!cover.description) {
      const possible = DESIRED_MANGAS.find((manga) => manga.name === cover.name);
      if (possible?.description) {
        console.log(`[DESCRIPTION] Adding description to ${cover.name}.`);
        await prisma.mangas.update({ where: { id: cover.id }, data: { description: possible.description } });
        console.log(`[DESCRIPTION] Finished adding description to ${cover.name}.`);
      }
    }
  }

  setMangaDescriptions();
}

setMangaDescriptions();
