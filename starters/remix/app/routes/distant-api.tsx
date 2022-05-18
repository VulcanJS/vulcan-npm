import { Link, Outlet } from "@remix-run/react";

export default function Root() {
  return (
    <div className="distant-api-layout">
      <header>
        <Link to="/">Back home</Link>
      </header>
      <Outlet />
    </div>
  );
}
