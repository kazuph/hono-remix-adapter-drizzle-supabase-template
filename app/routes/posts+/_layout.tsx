import { Outlet } from "@remix-run/react";

export default function PostsLayout() {
  return (
    <div className="mx-auto max-w-4xl p-4">
      <Outlet />
    </div>
  );
}
