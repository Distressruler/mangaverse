import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  return redirect(`/list?query=${req.nextUrl.search}`);
}
