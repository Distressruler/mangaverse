"use client";

import Image from "next/image";
import Link from "next/link";
import { IoLogoDiscord, IoLogoTwitter } from "react-icons/io5";
import { SiReddit, SiTelegram } from "react-icons/si";
import { themeChange } from "theme-change";

export interface FooterProps {
  site: {
    logo: string;
    name: string;
    discordURL: string;
    redditURL: string;
    twitterURL: string;
    telegramURL: string;
    copyrightStartYear?: string;
  };
}

export function Footer(props: FooterProps) {
  return (
    <div>
      <footer className="footer p-10 bg-base-200 text-base-content lg:flex lg:items-center lg:justify-around flex flex-row flex-nowrap justify-around items-center">
        <div>
          <span className="footer-title">Pages</span>
          <a className="link link-hover">Search Manga</a>
          <Link href="/surpriseme" className="link link-hover">
            Random Manga
          </Link>
          <a className="link link-hover">Settings</a>
        </div>

        <div>
          <span className="footer-title">Our Team</span>
          <Link href="/team#moderators" className="link link-hover">
            Moderators
          </Link>
          <Link href="/team#translators" className="link link-hover">
            Translators
          </Link>
          <Link href="/team#joinus" className="link link-hover">
            Join Us!
          </Link>
        </div>

        <div>
          <span className="footer-title">Other</span>
          <div className="dropdown dropdown-top dropdown-end">
            <label tabIndex={0} className="capitalize cursor-pointer">
              Select Theme
            </label>
            <ul tabIndex={0} className="menu dropdown-content p-2 shadow bg-base-100 rounded-box w-36 mt-4">
              {["rosefighter", "emerald"].map((name, index) => (
                <li key={index}>
                  <button
                    data-set-theme={name}
                    onClick={() => {
                      // @ts-ignore this libs typins suck but this is how it works
                      themeChange(name);
                    }}
                  >
                    {`${name.charAt(0).toUpperCase()}${name.slice(1)}`}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <a className="link link-hover">Advertise</a>
          <a className="link link-hover">Cookie policy</a>
        </div>
      </footer>
      <footer className="footer px-10 py-4 border-t bg-base-200 text-base-content border-base-300">
        <div className="items-center grid-flow-col">
          <div className="flex-1">
            <Link href="/" className="btn btn-ghost normal-case text-xl">
              <div>
                {props.site.logo ? (
                  <Image src={props.site.logo} alt="website logo" width={50} height={50} />
                ) : (
                  <p>{props.site.name ?? "Top Manga Reader"}</p>
                )}
              </div>
            </Link>
          </div>
          <p>
            {props.site.name} {props.site.copyrightStartYear ? `` : new Date().getFullYear()}
            <br />
          </p>
        </div>
        <div className="md:place-self-center md:justify-self-end">
          <div className="grid grid-flow-col gap-4">
            {props.site.discordURL ? (
              <a href={props.site.discordURL} target="_blank" rel="noopener noreferrer">
                <IoLogoDiscord size={24} />
              </a>
            ) : null}
            {props.site.twitterURL ? (
              <a href={props.site.twitterURL} target="_blank" rel="noopener noreferrer">
                <IoLogoTwitter size={24} />
              </a>
            ) : null}
            {props.site.redditURL ? (
              <a href={props.site.redditURL} target="_blank" rel="noopener noreferrer">
                <SiReddit size={24} />
              </a>
            ) : null}
            {props.site.telegramURL ? (
              <a href={props.site.telegramURL} target="_blank" rel="noopener noreferrer">
                <SiTelegram size={24} />
              </a>
            ) : null}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Footer;
