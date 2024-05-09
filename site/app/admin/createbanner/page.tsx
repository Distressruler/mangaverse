import { DiscordUser } from "../../../utils/types";
import { parseUser } from "../../../utils/parse-user";
import { config } from "../../../utils/config";
import { NavBar } from "../../../components/NavBar";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SubmitButton } from "../../../components/forms/SubmitButton";
import path from "path";
import { ensureDirectoryExistence } from "../../../crawler/utils/utils";
import { writeFile } from "fs";
import { prisma } from "../../../prisma/client";
import { searchByText } from "../../../components/server/search";

interface AdminBannerProps {
  user: DiscordUser;
  site: {
    name: string;
    logo: string;
    discordURL: string;
    redditURL: string;
    twitterURL: string;
    telegramURL: string;
    adminDiscordIDs: string[];
  };
}

export default async function Index() {
  const user = await parseUser();

  if (!user) return redirect("/api/oauth");

  const props = {
    user,
    site: {
      name: config.siteName,
      logo: config.siteLogo,
      discordURL: config.siteDiscordURL,
      redditURL: config.siteRedditURL,
      twitterURL: config.siteTwitterURL,
      telegramURL: config.siteTelegramURL,
      copyrightStartYear: config.copyrightStartYear,
      adminDiscordIDs: config.adminDiscordIDs,
    },
  };

  const isAllowedAdmin = props.site.adminDiscordIDs.includes(props.user.id);

  async function createOnSubmit(formData: FormData) {
    "use server";

    const title = formData.get("title")?.toString() ?? "";
    const description = formData.get("description")?.toString() ?? "";
    const name = formData.get("name")?.toString().replaceAll(" ", "-").toLowerCase() ?? "";
    const buttonURL = formData.get("url")?.toString() ?? "";

    const filepath = path.join(__dirname, `../../../../../public/banners/${name}.jpg`);
    ensureDirectoryExistence(filepath);
    const buffer = await (formData.get("file") as Blob).arrayBuffer();
    writeFile(filepath, Buffer.from(buffer), "binary", function (err) {
      if (err) {
        console.log("There was an error writing the banner image", err);
      }
    });

    await prisma.banners.upsert({
      where: { name },
      update: {
        title,
        description,
        buttonURL,
        imageURL: `/banners/${name}`,
      },
      create: {
        title,
        description,
        name,
        buttonURL,
        imageURL: `/banners/${name}`,
      },
    });
  }

  return (
    <div>
      <NavBar
        avatar={
          props.user?.avatar
            ? `https://cdn.discordapp.com/avatars/${props.user.id}/${props.user.avatar}.jpg`
            : props.user?.avatar === null
            ? `https://cdn.discordapp.com/embed/avatars/${Number(props.user?.discriminator ?? "1234") % 5}.png`
            : undefined
        }
        siteLogo={props.site.logo}
        siteName={props.site.name}
        discordURL={props.site.discordURL}
        redditURL={props.site.redditURL}
        telegramURL={props.site.telegramURL}
        notifications={[]}
        searchByText={searchByText}
      />

      {isAllowedAdmin ? (
        <form action={createOnSubmit} className="flex flex-col justify-center items-center">
          <div className="form-control w-full max-w-xs">
            <h1>Welcome To The Manual Banner Creator!</h1>
            <input readOnly className="hidden" type="text" id="userId" name="userId" value={props.user.id.toString()} />

            <label className="label">
              <span className="label-text">What is the name of the manga you wish to put as a banner?</span>
            </label>

            <input type="text" id="name" name="name" placeholder="Type here" className="input input-bordered w-full max-w-xs" />

            <label className="label">
              <span className="label-text">What is the url the user should be sent to when clicked?</span>
            </label>

            <input type="text" id="cover" name="url" placeholder="https://example.com" className="input input-bordered w-full max-w-xs" />

            <label className="label">
              <span className="label-text">What is the title of the banner?</span>
            </label>

            <input type="text" id="title" name="title" placeholder="banner title here" className="input input-bordered w-full max-w-xs" />

            <label className="label">
              <span className="label-text">What is the description of the banner?</span>
            </label>

            <input
              type="text"
              id="description"
              name="description"
              placeholder="banner description here"
              className="input input-bordered w-full max-w-xs"
            />

            <label className="label">
              <span className="label-text">What is the image file you would like to set as the banner?</span>
            </label>

            <input type="file" id="file" name="file" placeholder="first chapter url here" className="input w-full max-w-xs" />
          </div>

          <SubmitButton />
        </form>
      ) : (
        <div className="hero min-h-screen bg-base-200">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <h1 className="text-5xl font-bold text-red-400 mb-8">Stop trying to hack! You are just wasting your time.</h1>

              <Link href="/">
                <button className="btn btn-primary">Instead Go Read Some Manga</button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
