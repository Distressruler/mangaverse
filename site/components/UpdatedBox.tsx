import Link from "next/link";
import Image from "next/image";

export function UpdatedBox(props: UpdatedBoxProps) {
  return (
    <div className="card card-compact w-40 sm:w-80 bg-base-300 shadow-xl m-3 h-96 cursor-pointer">
      <Link href={`/${props.manga ? "mangas" : "novels"}/${props.name.toLowerCase().split(" ").join("-")}`}>
        <div className="h-56 relative rounded-t-lg overflow-hidden">
          <Image src={props.imageURL} alt={props.name} fill />
          {/* {props.hot ? <div className="badge badge-warning absolute top-0 right-0 mr-3 mt-3 p-2 py-5 font-bold text-sm">HOT</div> : null} */}
          {/* {props.new ? (
          <div className={`badge absolute top-0 right-0 mr-3 ${props.hot ? "mt-16 badge-error" : "mt-3 badge-warning"} p-2 py-5 font-bold text-xs`}>
          NEW
          </div>
        ) : null} */}
        </div>

        <div className="card-body bg-gray-900 rounded-b-xl">
          <h2 className={`card-title text-primary text-xs`}>{props.name}</h2>

          <p className="text-secondary">
            <Link href={`/${props.manga ? "mangas" : "novels"}/${props.name.toLowerCase().split(" ").join("-")}/chapter/${props.chapter}`}>
              Chapter {props.chapter.toLocaleString()}
            </Link>
          </p>
          <p className="text-info">{props.released} ago</p>

          <div className="card-actions justify-end">
            {props.manga ? <p className="badge badge-info text-xs">Manga</p> : null}
            {props.colored ? <p className="badge badge-success text-xs">Colored</p> : null}
          </div>
        </div>
      </Link>
    </div>
  );
}

export interface UpdatedBoxProps {
  imageURL: string;
  name: string;
  hot?: boolean;
  new?: boolean;
  chapter: number;
  released: string;
  manga?: boolean;
  colored?: boolean;
}
