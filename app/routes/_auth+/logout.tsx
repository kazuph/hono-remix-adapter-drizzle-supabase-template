import { type ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { signOut } from "~/auth.server";

export async function action({ request, context }: ActionFunctionArgs) {
  const { headers } = await signOut(request, context, "/");
  return redirect("/", {
    headers,
  });
}

export async function loader() {
  return redirect("/");
}
