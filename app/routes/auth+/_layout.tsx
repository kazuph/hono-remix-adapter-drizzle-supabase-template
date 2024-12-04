import { Outlet } from "@remix-run/react";

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h1 className="text-3xl font-bold">認証</h1>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
