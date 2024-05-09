"use client";
import Link from "next/link";
import Image from "next/image";
import { BsFillEyeFill } from "react-icons/bs";
import { BsFillSuitHeartFill } from "react-icons/bs";

export function ListBox(props: ListBoxProps) {
  return (
    <div className="card card-compact w-32 sm:w-56 bg-base-300 shadow-xl m-3 h-96 hover:border-teal-500 hover:border-4 cursor-pointer">
      <div className="h-56 relative rounded-t-lg overflow-hidden">
        <Link href={`/${props.manga ? "mangas" : "novels"}/${props.name.toLowerCase().split(" ").join("-")}`}>
          <Image src={props.imageURL} alt={props.name} fill />
        </Link>
        {props.hot ? <div className="badge badge-warning absolute top-0 right-0 mr-3 mt-3 p-2 py-5 font-bold text-sm">HOT</div> : null}
        {props.new ? (
          <div className={`badge absolute top-0 right-0 mr-3 ${props.hot ? "mt-16 badge-error" : "mt-3 badge-warning"} p-2 py-5 font-bold text-xs`}>
            NEW
          </div>
        ) : null}
      </div>

      <div className="card-body bg-gray-900 rounded-b-xl">
        <h2 className={`card-title text-primary text-xs`}>{props.name}</h2>

        <p className="text-secondary">
          <Link href={`/${props.manga ? "mangas" : "novels"}/${props.name.toLowerCase().split(" ").join("-")}/chapter/${props.chapter}`}>
            Chapter {props.chapter.toLocaleString()}
          </Link>
        </p>
        <p className="text-info">{props.released} ago</p>

        <div className="flex items-center justify-center mr-20">
          <BsFillEyeFill />
          <p className="text-secondary ml-2">{props.views.toLocaleString()}</p>
        </div>

        <div className="flex items-center justify-center">
          <BsFillSuitHeartFill color="rgb(222, 11, 78)" />
          <p className="text-secondary ml-2">{props.likes.toLocaleString()}</p>
        </div>

        <div className="card-actions justify-end">
          {props.manga ? <p className="badge badge-info text-xs">Manga</p> : null}
          {props.colored ? <p className="badge badge-success text-xs">Colored</p> : null}
        </div>
      </div>
    </div>
  );
}

export interface ListBoxProps {
  imageURL: string;
  name: string;
  hot?: boolean;
  new?: boolean;
  chapter: number;
  released: string;
  manga?: boolean;
  colored?: boolean;
  views: number;
  likes: number;
}
