import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

/* =========================
   ICONS
========================= */

const UserIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-4.5 w-4.5"
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);

const MailIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-4.5 w-4.5"
  >
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

const LockIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-4.5 w-4.5"
  >
    <rect x="4" y="10" width="16" height="10" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
);

const GitHubIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-4.5 w-4.5"
  >
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.73.083-.73 1.205.084 1.84 1.237 1.84 1.237 1.07 1.835 2.807 1.305 3.492.998.108-.776.418-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23A11.5 11.5 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.29-1.552 3.296-1.23 3.296-1.23.653 1.653.242 2.873.118 3.176.77.84 1.233 1.91 1.233 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222v3.293c0 .322.216.694.825.576C20.565 21.796 24 17.297 24 12 24 5.37 18.63 0 12 0Z" />
  </svg>
);

/* =========================
   REGISTER
========================= */

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.password
    ) {
      setError("All fields are required.");
      return;
    }

    if (form.password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    try {
      setLoading(true);

      await register(
        form.name.trim(),
        form.email.trim(),
        form.password
      );

      navigate("/", {
        replace: true,
      });
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950">

      {/* Background */}
      <div className="pointer-events-none absolute inset-0">

        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />

        <div className="absolute -right-20 top-10 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />

        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />
      </div>

      {/* Main */}
      <div className="relative flex min-h-screen items-center justify-center px-4 py-6">

        <div className="w-full max-w-md">

          {/* Brand */}
          <div className="mb-5 text-center">

            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 text-sm font-black text-white shadow-lg shadow-blue-500/20">
              AI
            </div>

            <h1 className="mt-3 text-xl font-black text-white">
              AI Dev
            </h1>

            <p className="mt-0.5 text-[11px] text-slate-400">
              Developer Productivity
            </p>

          </div>

          {/* Card */}
          <div className="rounded-2xl border border-white/10 bg-white p-6 shadow-[0_25px_80px_-25px_rgba(0,0,0,0.7)] sm:p-7">

            {/* Heading */}
            <div className="mb-5">

              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-600">
                Get started
              </p>

              <h2 className="mt-1.5 text-2xl font-black tracking-tight text-slate-950">
                Create your account
              </h2>

              <p className="mt-1.5 text-xs leading-5 text-slate-500">
                Start analyzing your GitHub development activity.
              </p>

            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
                <p className="text-xs font-medium text-red-700">
                  {error}
                </p>
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-3.5"
            >

              <InputField
                id="name"
                name="name"
                label="Full name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your name"
                icon={<UserIcon />}
                disabled={loading}
              />

              <InputField
                id="email"
                name="email"
                label="Email address"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                icon={<MailIcon />}
                disabled={loading}
              />

              <div>

                <InputField
                  id="password"
                  name="password"
                  label="Password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  icon={<LockIcon />}
                  disabled={loading}
                />

                <p className="mt-1.5 text-[10px] text-slate-400">
                  Minimum 6 characters
                </p>

              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-blue-600 hover:shadow-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Creating account..."
                  : "Create Account"}
              </button>

            </form>

            {/* Integration */}
            <div className="my-5 flex items-center gap-3">

              <div className="h-px flex-1 bg-slate-200" />

              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                GitHub ready
              </span>

              <div className="h-px flex-1 bg-slate-200" />

            </div>

            <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">

              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
                <GitHubIcon />
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-800">
                  GitHub integration
                </p>

                <p className="text-[10px] text-slate-500">
                  Connect your GitHub after signing in.
                </p>
              </div>

            </div>

            {/* Login */}
            <p className="mt-5 text-center text-xs text-slate-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-blue-600 hover:text-blue-700"
              >
                Sign in
              </Link>
            </p>

          </div>

          <p className="mt-4 text-center text-[10px] text-slate-500">
            © 2026 AI Dev · Developer Productivity Platform
          </p>

        </div>
      </div>
    </main>
  );
}

/* =========================
   INPUT FIELD
========================= */

const InputField = ({
  id,
  name,
  label,
  type,
  value,
  onChange,
  placeholder,
  icon,
  disabled,
}) => (
  <div>

    <label
      htmlFor={id}
      className="mb-1.5 block text-xs font-semibold text-slate-700"
    >
      {label}
    </label>

    <div className="relative">

      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
        {icon}
      </div>

      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required
        disabled={disabled}
        autoComplete={
          type === "password"
            ? "new-password"
            : name
        }
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
      />

    </div>
  </div>
);