import { prisma } from "../../prisma/client";
import { redirect } from "next/navigation";

export default async function Index() {
  const productsCount = await prisma.mangas.count();
  const skip = Math.floor(Math.random() * productsCount);
  const manga = await prisma.mangas.findFirst({
    skip: skip,
    orderBy: {
      views: "desc",
    },
  });

  return redirect(`/mangas/${manga?.name}`);
}
