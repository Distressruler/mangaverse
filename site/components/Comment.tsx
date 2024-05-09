"use client";

export default function Comment(props: CommentProps) {
  return (
    <article className="p-6 mb-6 text-base bg-white rounded-lg dark:bg-gray-900">
      <footer className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <p className="inline-flex items-center mr-3 text-sm text-gray-900 dark:text-white">
            <img className="mr-2 w-6 h-6 rounded-full" src={props.authorIcon} alt={props.author} />
            {props.author}
          </p>
          <p className="text-sm text-black dark:text-black">
            <p>{props.createdAt}</p>
          </p>
        </div>
        <button
          id="dropdownComment1Button"
          data-dropdown-toggle="dropdownComment1"
          className="inline-flex items-center p-2 text-sm font-medium text-center text-black bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-50 dark:bg-black dark:hover:bg-black dark:focus:ring-black"
          type="button"
        >
          <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"></path>
          </svg>
          <span className="sr-only">Comment settings</span>
        </button>

        <div id="dropdownComment1" className="hidden z-10 w-36 bg-white rounded divide-y divide-gray-100 shadow dark:bg-black dark:divide-black">
          <ul className="py-1 text-sm text-black dark:text-gray-200" aria-labelledby="dropdownMenuIconHorizontalButton">
            <li>
              <a href="#" className="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-black dark:hover:text-white">
                Edit
              </a>
            </li>
            <li>
              <a href="#" className="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-black dark:hover:text-white">
                Remove
              </a>
            </li>
            <li>
              <a href="#" className="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-black dark:hover:text-white">
                Report
              </a>
            </li>
          </ul>
        </div>
      </footer>

      <p className="text-black dark:text-black">{props.text}</p>
      <div className="flex items-center mt-4 space-x-4">
        <button type="button" className="flex items-center text-sm text-black hover:underline dark:text-black">
          <svg aria-hidden="true" className="mr-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            ></path>
          </svg>
          Reply
        </button>
      </div>
    </article>
  );
}

export interface CommentProps {
  author: string;
  authorIcon: string;
  createdAt: string;
  imageURL: string;
  text: string;
  likes: number;
  responses: CommentProps[];
  depth?: number;
}
