"use server";

import { redirect } from "next/navigation";

export async function searchByText(form: FormData) {
  const query = form.get("query");
  console.log("got the qyery", query);

  return redirect(`/list?query=${query}`);
}
