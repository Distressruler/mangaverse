import { parseUser } from "../../../utils/parse-user";
import { redirect } from "next/navigation";

export default async function DiscordLogin() {
  const user = await parseUser();
  return redirect(user ? "/" : "/api/oauth");
}
