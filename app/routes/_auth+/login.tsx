import { type ActionFunctionArgs, json, redirect } from "@remix-run/cloudflare";
import { Form } from "@remix-run/react";
import { signInWithGoogle } from "~/auth.server";

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const provider = formData.get("provider");

  if (provider === "google") {
    const data = await signInWithGoogle(request, context);
    if (!data.error && data.data?.url) {
      return redirect(data.data.url, { headers: data.headers });
    }
    return json({ error: data.error || "ログインに失敗しました" }, { status: 400 });
  }

  return json({ error: "Invalid provider" }, { status: 400 });
}

export default function Login() {
  return (
    <>
      <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">ログイン</h2>
      <Form method="post" className="mt-8 space-y-6">
        <input type="hidden" name="provider" value="google" />
        <div>
          <button
            type="submit"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Googleでログイン
          </button>
        </div>
      </Form>
    </>
  );
}
