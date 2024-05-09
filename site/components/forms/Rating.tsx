"use client";
import { useState } from "react";

export interface RatingsProps {
  mine: number | null;
  total: number;
  userId?: string;
  name: string;
}

export default function Ratings(props: RatingsProps) {
  const [rating] = useState(props.mine ?? props.total ?? 1);

  return (
    <form action="/api/ratings" method="post" className="flex">
      <div className="rating mt-4">
        <input readOnly className="hidden" type="text" id="userId" name="userId" value={props.userId?.toString()} />
        <input readOnly className="hidden" type="text" id="manga" name="manga" value={`${props.name.toString()}_novel`} />

        {[1, 2, 3, 4, 5].map((i) =>
          rating === i ? (
            <input
              key={i}
              type={props.userId ? "submit" : "radio"}
              name="rating"
              className="mask mask-star-2 bg-orange-400 text-orange-400"
              defaultChecked
              value={i}
            />
          ) : (
            <input
              key={i}
              type={props.userId ? "submit" : "radio"}
              name="rating"
              className="mask mask-star-2 bg-orange-400  text-orange-400"
              value={i}
            />
          )
        )}
      </div>
    </form>
  );
}
