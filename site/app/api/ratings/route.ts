import { prisma } from "../../../prisma/client";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function POST(req: Request) {
  const referer = headers().get("referer")!;
  const body = await req.json();

  const rating = Number(body.rating);
  if (isNaN(rating)) {
    console.log({ result: `Invalid rating provided. user ${body.userId} for ${body.name}` });
    return redirect(referer);
  }

  await prisma.ratings.upsert({
    where: { userId_name: { userId: body.userId, name: body.name } },
    create: { userId: body.userId, name: body.name, rating },
    update: { rating },
  });

  console.log({ result: `Updated rating for user ${body.userId} for ${body.name}` });
  return redirect(referer);
}
