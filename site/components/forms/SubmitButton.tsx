"use client";

import { useState } from "react";

export function SubmitButton() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <button
      className="btn btn-secondary btn-outline mt-6"
      type="submit"
      onClick={() => {
        setSubmitted(!submitted);
      }}
    >
      {!submitted ? "Submit" : "Uploading..."}
    </button>
  );
}
