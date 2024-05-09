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
import Jimp from "jimp";

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

    const chapter = formData.get("chapter")?.toString() ?? "0";
    const name = formData.get("name")?.toString().replaceAll(" ", "-").toLowerCase() ?? "";

    const blobs = formData.getAll("files") as Blob[];
    const LOGO_MARGIN_PERCENTAGE = 5;
    for (const blob of blobs) {
      const filepath = path.join(__dirname, `../../../../../public/manga/${name}/chapter-${chapter}/${blob.name}`);
      ensureDirectoryExistence(filepath);
      const buffer = await blob.arrayBuffer();

      writeFile(filepath, Buffer.from(buffer), "binary", function (err) {
        if (err) {
          console.log("There was an error writing the banner image", err);
        }
      });

      const watermarkPath = `${filepath.substring(0, filepath.indexOf("public/"))}public/watermark.png`;
      const [image, logo] = await Promise.all([Jimp.read(filepath), Jimp.read(watermarkPath)]);
      console.log(image.bitmap.width);
      const xMargin = (image.bitmap.width * LOGO_MARGIN_PERCENTAGE) / 100;
      const yMargin = (image.bitmap.width * LOGO_MARGIN_PERCENTAGE) / 100;
      let X = image.bitmap.width - logo.bitmap.width - xMargin;
      let Y = image.bitmap.height - logo.bitmap.height - yMargin;
      if (X < 0) X = 0;
      if (Y < 0) Y = 0;
      logo.resize(image.bitmap.width / 1.2, Jimp.AUTO);
      image
        .composite(logo.opacity(0.8), 0, 0)
        .composite(logo.opacity(0.8), 0, Y)
        .composite(logo.opacity(0.5), 0, Y / 2)
        .write(filepath);
      const chapterData = await prisma.chapters.findUnique({ where: { manga_number: { manga: name, number: Number(chapter) } } });
      if (!chapterData) {
        await prisma.chapters.create({
          data: {
            manga: name,
            number: Number(chapter),
            viewCount: 0,
            lastRead: new Date(),
            released: new Date(),
            images: { createMany: { data: [{ page: Number(blob.name.substring(0, blob.name.lastIndexOf("."))), urls: [filepath] }] } },
          },
        });
      } else {
        await prisma.chapters.update({
          where: { manga_number: { manga: name, number: Number(chapter) } },
          data: {
            images: { createMany: { data: [{ page: Number(blob.name.substring(0, blob.name.lastIndexOf("."))), urls: [filepath] }] } },
          },
        });
      }
    }

    await prisma.mangas.upsert({
      where: { name },
      create: {
        name,
        addedAt: new Date(),
        completed: false,
        coverURL: "",
        lastChapter: Number(chapter),
        updatedAt: new Date(),
      },
      update: {
        updatedAt: new Date(),
        lastChapter: Number(chapter),
        exclusive: true,
      },
    });
    console.log("Saved!");

    // return redirect(`/admin/manga?name=${name}&chapter=${chapter}`);
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
            <h1>Welcome To The Manual Chapter Uploader!</h1>
            <input readOnly className="hidden" type="text" id="userId" name="userId" value={props.user.id.toString()} />

            <label className="label">
              <span className="label-text">What is the name of the manga you wish to upload?</span>
            </label>

            <input type="text" required id="name" name="name" placeholder="Martial Peak" className="input input-bordered w-full max-w-xs" />

            <label className="label">
              <span className="label-text">What is the chapter number?</span>
            </label>

            <input type="number" required id="chapter" name="chapter" defaultValue={1} className="input input-bordered w-full max-w-xs" />

            <label className="label">
              <span className="label-text">What are the image file you would like to upload?</span>
            </label>

            <input type="file" required multiple id="files" name="files" placeholder="images here" className="input w-full max-w-xs" />
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
