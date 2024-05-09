import { prisma } from "../../../prisma/client";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function POST(req: Request) {
  const body = await req.json();
  const referer = headers().get("referer");

  const manga = body.manga.replaceAll(" ", "-").toLowerCase();

  if (body.subscribed === "true") {
    await Promise.all([
      prisma.subscribers.delete({ where: { userId_manga: { userId: body.userId, manga } } }),
      prisma.mangas.update({ where: { name: manga }, data: { subscribers: { decrement: 1 } } }),
    ]);
    console.log({ result: `Unsubscribed user ${body.userId} from ${manga}` });
    return redirect(referer!);
  }

  const exists = await prisma.subscribers.findUnique({ where: { userId_manga: { userId: body.userId, manga } } });
  if (exists) {
    console.log({ result: `User  ${body.userId} is already subscribed to ${manga}` });
    return redirect(referer!);
  }

  await Promise.all([
    prisma.subscribers.create({
      data: { userId: body.userId, manga },
    }),
    prisma.mangas.update({ where: { name: manga }, data: { subscribers: { increment: 1 } } }),
  ]);

  console.log({ result: `Subscribed user ${body.userId} to ${manga}` });
  return redirect(referer!);
}
