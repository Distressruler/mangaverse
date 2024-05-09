"use client";

import { MrMiyagi } from "@uiball/loaders";
import { useState } from "react";

export interface SubscribingProps {
    userId: string;
    name: string;
    subscribed: boolean;
}

export default function Subscribing(props: SubscribingProps) {
  const [subscribing, setSubscribing] = useState(false);

  return (
    <form action="/api/subscribe" method="post">
      <input readOnly className="hidden" type="text" id="userId" name="userId" value={props.userId.toString()} />
      <input readOnly className="hidden" type="text" id="manga" name="manga" value={props.name.toString()} />
      <input readOnly className="hidden" type="text" id="subscribed" name="subscribed" value={props.subscribed.toString()} />
      <button className="btn btn-secondary btn-outline" type="submit" onClick={() => setSubscribing(true)}>
        {subscribing ? <MrMiyagi size={35} color="#FFF" /> : props.subscribed ? "Unsubscribe" : "Subscribe"}
      </button>
    </form>
  );
}
