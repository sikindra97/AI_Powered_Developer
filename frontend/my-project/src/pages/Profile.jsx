import { useEffect, useState } from "react";
import api from "../api/axios.js";
import Loading from "../components/Loading.jsx";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/github/profile");
        setProfile(response.data?.data);
      } catch (error) {
        console.error("Failed to fetch GitHub profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <main className="min-h-[calc(100vh-65px)] bg-slate-50">
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        {/* Page Header */}
        <div className="mx-auto mb-8 max-w-3xl">
          <p className="text-sm font-semibold text-blue-600">
            Account
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Profile
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Your connected GitHub profile information.
          </p>
        </div>

        {/* Profile Card */}
        <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="p-6 sm:p-8">

            {/* Profile Header */}
            <div className="flex items-center gap-5">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.login || "GitHub profile"}
                  className="h-20 w-20 shrink-0 rounded-full border border-slate-200 object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-slate-100 text-2xl font-bold text-slate-500">
                  {(profile?.login || "D")
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}

              <div className="min-w-0">
                <h2 className="truncate text-xl font-bold text-slate-900">
                  {profile?.name ||
                    profile?.login ||
                    "Developer"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  @{profile?.login || "not-connected"}
                </p>

                <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  GitHub Connected
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="my-7 border-t border-slate-100" />

            {/* About */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                About
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {profile?.bio || "No bio available."}
              </p>
            </div>

            {/* Divider */}
            <div className="my-7 border-t border-slate-100" />

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <ProfileStat
                label="Public Repositories"
                value={profile?.public_repos || 0}
              />

              <ProfileStat
                label="Followers"
                value={profile?.followers || 0}
              />

              <ProfileStat
                label="Following"
                value={profile?.following || 0}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

const ProfileStat = ({ label, value }) => {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 px-5 py-4">
      <p className="text-xs font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
};