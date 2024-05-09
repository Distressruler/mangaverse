"use client";

export default function Inputcomment(props: InputcommentProps) {
  return (
    <div>
      <div className="py-2 px-4 mb-4 bg-white rounded-lg rounded-t-lg border border-gray-200">
        <label htmlFor="comment" className="sr-only">
          Your comment
        </label>
        <textarea
          id="comment"
          rows={6}
          className="px-0 w-full text-sm border-0 focus:ring-0 focus:outline-none bg-white"
          placeholder="Write a comment..."
          required
        ></textarea>
      </div>
      <div className="flex items-end justify-end">
        <button
          type="submit"
          className="btn btn-outline btn-primary inline-flex items-center py-2.5 px-4 text-xs font-medium text-center text-white  rounded-lg focus:ring-4 focus:ring-primary-200 dark:focus:ring-primary-900 "
        >
          Post comment
        </button>
      </div>
    </div>
  );
}

export interface InputcommentProps {}
