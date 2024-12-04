import { type ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { signOut } from "~/auth.server";

export async function action({ request, context }: ActionFunctionArgs) {
  await signOut(request, context);
  return redirect("/");
}

export async function loader() {
  return redirect("/");
}
