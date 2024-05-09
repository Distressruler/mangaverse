import { parseUser } from "../../utils/parse-user";
import { config } from "../../utils/config";
import { NavBar } from "../../components/NavBar";
import { DiscordUser } from "../../utils/types";
import Footer from "../../components/Footer";
import { Metadata } from "next";
import { searchByText } from "../../components/server/search";

export const metadata: Metadata = {
  title: `Team, Crew, Staff, and Amazing People`,
  description: "Meet the team behind bringing Enryu to life. Want to join the team? Come reach out to us!",
};

interface TeamProps {
  user?: DiscordUser | null;
  site: {
    name: string;
    logo: string;
    discordURL: string;
    redditURL: string;
    twitterURL: string;
    telegramURL: string;
    copyrightStartYear: string;
  };
}

const MODERATORS: { name: string; description: string; imageURL: string; title: string }[] = [
  {
    name: "Dokto",
    description: "I do stuff to make Enryu the best site to read manga.",
    title: "Da Boss, owner",
    imageURL: "https://cdn.discordapp.com/avatars/130136895395987456/5fff867ae5f666fcd0626bd84f5e69c0.jpg?size=2048",
  },
];

const TRANSLATORS: { name: string; description: string; imageURL: string; title: string }[] = [
  {
    name: "Dokto",
    description: "I do stuff to make Enryu the best site to read manga.",
    title: "Da Boss, owner",
    imageURL: "https://cdn.discordapp.com/avatars/130136895395987456/5fff867ae5f666fcd0626bd84f5e69c0.jpg?size=2048",
  },
];

async function getServerSideProps(): Promise<TeamProps> {
  const user = await parseUser();

  return {
    user,
    site: {
      name: config.siteName,
      logo: config.siteLogo,
      discordURL: config.siteDiscordURL,
      redditURL: config.siteRedditURL,
      twitterURL: config.siteTwitterURL,
      telegramURL: config.siteTelegramURL,
      copyrightStartYear: config.copyrightStartYear,
    },
  };
}

export default async function Team() {
  const props = await getServerSideProps();

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

      <div className="flex flex-col justify-center items-center text-primary">
        <h2 id="#moderators">Moderators</h2>
        <div className="flex flex-wrap justify-center items-center m-4">
          {MODERATORS.map((mod, index) => {
            return (
              <div className="card card-side bg-gray-700 shadow-xl max-w-xl m-4" key={index}>
                <figure className="rounded-xl p-8 dark:bg-slate-800">
                  <img className="w-24 h-24 rounded-full mx-auto" src={mod.imageURL} alt="moderator" width="384" height="512" />
                  <div className="pt-6 text-center space-y-4">
                    <blockquote>
                      <p className="text-lg font-medium">“{mod.description}”</p>
                    </blockquote>
                    <figcaption className="font-medium">
                      <div className="text-sky-500 dark:text-sky-400">{mod.name}</div>
                      <div className="text-white">{mod.title}</div>
                    </figcaption>
                  </div>
                </figure>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col justify-center items-center text-primary">
        <h2 id="#translators">Translators</h2>
        <div className="flex flex-wrap justify-center items-center m-4">
          {TRANSLATORS.map((mod, index) => {
            return (
              <div className="card card-side bg-gray-700 shadow-xl max-w-xl m-4" key={index}>
                <figure className="rounded-xl p-8 dark:bg-slate-800">
                  <img className="w-24 h-24 rounded-full mx-auto" src={mod.imageURL} alt="moderator" width="384" height="512" />
                  <div className="pt-6 text-center space-y-4">
                    <blockquote>
                      <p className="text-lg font-medium">“{mod.description}”</p>
                    </blockquote>
                    <figcaption className="font-medium">
                      <div className="text-sky-500 dark:text-sky-400">{mod.name}</div>
                      <div className="text-white">{mod.title}</div>
                    </figcaption>
                  </div>
                </figure>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col justify-center items-center">
        <h2 id="#joinus">Join Us!</h2>
        <div>
          You think you got what it takes to be part of our team? <a href="https://www.discord.gg/anya"> Join Here! </a>{" "}
        </div>
      </div>

      <Footer site={props.site} />
    </div>
  );
}
