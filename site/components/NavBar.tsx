import { chapters } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { BsSearch } from "react-icons/bs";
import { SiDiscord, SiReddit, SiTelegram } from "react-icons/si";
import { TiThMenu } from "react-icons/ti";

export interface NavBarProps {
  avatar?: string;
  query?: string;
  siteLogo?: string;
  siteName?: string;
  discordURL: string;
  redditURL?: string;
  twitterURL?: string;
  telegramURL?: string;
  notifications?: Array<Omit<chapters, "released" | "lastRead"> & { released: number; cover: string }>;
  searchByText: (form: FormData) => Promise<void>;
}

export function NavBar(props: NavBarProps) {
  // const [searchText, setSearchText] = useState(props.query ?? "");

  return (
    <div className="navbar bg-base-100">
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost normal-case text-xl">
          <div>
            {props.siteLogo ? (
              <Image src={props.siteLogo} alt="website logo" width={50} height={50} />
            ) : (
              <p>{props.siteName ?? "Top Manga Reader"}</p>
            )}
          </div>
        </Link>
      </div>

      <div className="hidden md:contents">
        {props.discordURL ? (
          <a href={props.discordURL} target="_blank" rel="noopener noreferrer" className="mr-3">
            <SiDiscord size={32} color="#5865F2" className="mt-1" />
          </a>
        ) : null}

        {props.redditURL ? (
          <a href={props.redditURL} target="_blank" rel="noopener noreferrer" className="mr-3">
            <SiReddit size={32} color="#FF4500" className="mt-1" />
          </a>
        ) : null}

        {props.telegramURL ? (
          <a href={props.telegramURL} target="_blank" rel="noopener noreferrer" className="mr-3">
            <SiTelegram size={32} color="#229ED9" className="mt-1" />
          </a>
        ) : null}
      </div>

      <div className="form-control mr-1 md:mr-3 ">
        <div className="input-group">
          <form action={props.searchByText} className="flex">
            <div className="z-10 -mr-6">
              <button type="submit">
                <BsSearch size={15} color="black" className="mt-4 ml-2" />
              </button>
            </div>

            <input
              type="text"
              id="query"
              name="query"
              placeholder="Search…"
              // value={searchText}
              className="input bg-white text-black focus:outline-none pl-8 w-36 sm:w-44 md:w-auto"
              // onChange={(e) => {
              //   setSearchText(e.target.value);
              // }}
            />
          </form>
        </div>
      </div>

      <div className="dropdown dropdown-end md:hidden">
        <label tabIndex={0} className="btn m-1">
          <TiThMenu size={25} />
        </label>
        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
          <li>
            {props.discordURL ? (
              <a href={props.discordURL} target="_blank" rel="noopener noreferrer" className="mr-3">
                <SiDiscord size={32} color="#5865F2" className="mt-1" />
                Discord
              </a>
            ) : null}
          </li>
          <li>
            {props.redditURL ? (
              <a href={props.redditURL} target="_blank" rel="noopener noreferrer" className="mr-3">
                <SiReddit size={32} color="#FF4500" className="mt-1" />
                Reddit
              </a>
            ) : null}
          </li>
          <li>
            {props.telegramURL ? (
              <a href={props.telegramURL} target="_blank" rel="noopener noreferrer" className="mr-3">
                <SiTelegram size={32} color="#229ED9" className="mt-1" />
                Telegram
              </a>
            ) : null}
          </li>

          <li>
            <div className="btn btn-secondary flex justify-center items-center mt-2">
              <div className="h-4">
                <Link href="/list">
                  <p>Manga List</p>
                </Link>
              </div>
            </div>
          </li>

          <li>
            <div className="btn btn-secondary flex justify-center items-center mt-2">
              <div className="h-4">
                <Link href="/login">
                  <p>Log In</p>
                </Link>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <div tabIndex={0} className="hidden md:flex btn btn-outline mr-3 btn-secondary">
        <div className="h-4">
          <Link href="/list">
            <p>Manga List</p>
          </Link>
        </div>
      </div>

      <div className="hidden md:contents">
        {props.avatar ? (
          <div className="flex-none">
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-circle">
                <div className="indicator">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {props.notifications?.length ? (
                    <span className="badge badge-sm indicator-item bg-red-400 text-white">{props.notifications.length}</span>
                  ) : null}
                </div>
              </label>
              <div tabIndex={0} className="mt-3 card card-compact dropdown-content w-96 bg-base-100 shadow">
                <div className="flex flex-col">
                  {props.notifications?.map((chapter, i) => (
                    <Link
                      href={`/${chapter.manga ? "mangas" : "novels"}/${chapter.manga}/chapter/${chapter.number}`}
                      className={`flex py-4 px-2 ${i % 2 ? "bg-gray-700" : "bg-gray-800"}`}
                      key={i}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="avatar mr-4 ml-2 mt-2">
                          <div className="mask mask-squircle w-16 h-16">
                            <Image src={chapter.cover} width={100} height={100} alt="cover" />
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">
                            {chapter.manga
                              .split("-")
                              .map((word) => `${word[0].toUpperCase()}${word.substring(1)}`)
                              .join(" ")}
                          </div>
                          <div className="text-sm opacity-50">Chapter: {chapter.number.toLocaleString()}</div>
                          <div className="text-sm opacity-50">Views: {chapter.viewCount.toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="divider"></div>
                    </Link>
                  ))}
                </div>

                {/* <div className="card-body"> */}
                {/* <span className="font-bold text-lg">Notification here</span>
                <span className="text-info">Subtotal: $999</span>
                <div className="card-actions">
                  <button className="btn btn-primary btn-block">View cart</button>
                </div> */}
                {/* </div> */}
              </div>
            </div>

            {/* TODO: profile - Make this a link to /profile/userid */}
            {/* TODO: skillz - need u to fix props to have the discord link */}

            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full">
                  <Image src={props.avatar} alt="user avatar" width={40} height={40} />
                </div>
              </label>
            </div>
          </div>
        ) : (
          <div className="btn btn-outline btn-primary">
            <div className="w-10 h-4">
              <Link href="/login">
                <h1>Login</h1>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
