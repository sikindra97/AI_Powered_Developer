import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <h1 className="text-7xl font-extrabold tracking-tight text-slate-900">
        404
      </h1>

      <p className="mt-3 text-lg text-slate-500">
        Page not found.
      </p>

      <Link
        to="/"
        className="mt-6 inline-flex items-center justify-center rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
      >
        Go Home
      </Link>
    </div>
  );
}