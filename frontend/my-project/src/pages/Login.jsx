import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const MailIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-5 w-5"
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
    className="h-5 w-5"
  >
    <rect x="4" y="10" width="16" height="10" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
);

const GitHubIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-5 w-5"
  >
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.73.083-.73 1.205.084 1.84 1.237 1.84 1.237 1.07 1.835 2.807 1.305 3.492.998.108-.776.418-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23A11.5 11.5 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.29-1.552 3.296-1.23 3.296-1.23.653 1.653.242 2.873.118 3.176.77.84 1.233 1.91 1.233 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222v3.293c0 .322.216.694.825.576C20.565 21.796 24 17.297 24 12 24 5.37 18.63 0 12 0Z" />
  </svg>
);

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!formData.email.trim() || !formData.password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setLoading(true);

      await login(
        formData.email.trim(),
        formData.password
      );

      const redirectPath =
        location.state?.from?.pathname || "/";

      navigate(redirectPath, {
        replace: true,
      });
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />

        <div className="absolute right-0 top-20 h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-3xl" />

        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-4 py-10">

        <div className="grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] shadow-[0_30px_100px_-30px_rgba(0,0,0,0.8)] backdrop-blur-xl lg:grid-cols-2">
          <div className="hidden flex-col justify-between bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-10 text-white lg:flex">

            <div>

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-lg font-black backdrop-blur">
                  AI
                </div>

                <div>
                  <p className="font-bold">
                    AI Dev
                  </p>

                  <p className="text-xs text-blue-100">
                    Developer Productivity
                  </p>
                </div>

              </div>

              <div className="mt-20">

                <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-100">
                  Welcome back
                </p>

                <h2 className="mt-4 text-4xl font-black leading-tight">
                  Build better.
                  <br />
                  Ship smarter.
                </h2>

                <p className="mt-5 max-w-sm text-sm leading-7 text-blue-100/80">
                  Access your engineering workspace, analyze GitHub
                  repositories and get AI-powered insights about your code.
                </p>

              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                  <GitHubIcon />
                </div>

                <div>
                  <p className="text-sm font-bold">
                    GitHub workspace
                  </p>

                  <p className="mt-1 text-xs text-blue-100/70">
                    Analyze repositories with AI assistance
                  </p>
                </div>

              </div>
            </div>

          </div>

          <div className="bg-white p-7 sm:p-10">

            <div className="mb-8">

              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-lg font-black text-white lg:hidden">
                AI
              </div>

              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                Welcome back
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                Sign in to your workspace
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Continue managing your GitHub development activity.
              </p>

            </div>

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm font-medium text-red-700">
                  {error}
                </p>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* Email */}

              <InputField
                id="email"
                name="email"
                label="Email address"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                icon={<MailIcon />}
                disabled={loading}
              />

              {/* Password */}

              <InputField
                id="password"
                name="password"
                label="Password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                icon={<LockIcon />}
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-lg transition duration-300 hover:-translate-y-0.5 hover:bg-blue-600 hover:shadow-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Signing in..."
                  : "Sign In"}
              </button>

            </form>

            <div className="my-7 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />

              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Secure access
              </span>

              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
                  <LockIcon />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Secure developer workspace
                  </p>

                  <p className="text-xs text-slate-500">
                    Your account gives access to your connected GitHub data.
                  </p>
                </div>

              </div>

            </div>

            <p className="mt-7 text-center text-sm text-slate-500">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-bold text-blue-600 hover:text-blue-700"
              >
                Create account
              </Link>
            </p>

            <p className="mt-6 text-center text-[11px] text-slate-400">
              AI Developer Productivity Platform
            </p>

          </div>
        </div>
      </div>
    </main>
  );
}


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
      className="mb-2 block text-sm font-semibold text-slate-700"
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
            ? "current-password"
            : "email"
        }
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
      />

    </div>
  </div>
);