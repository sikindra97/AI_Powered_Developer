import { useEffect, useState } from "react";
import api from "../api/axios.js";
import Loading from "../components/Loading.jsx";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/github/profile")
      .then((response) => {
        setProfile(response.data?.data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <p className="text-sm font-semibold text-blue-600">
          Account
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          Profile
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Your connected GitHub profile information.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-4">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.login || "GitHub profile"}
                className="h-20 w-20 rounded-full border border-slate-200"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-2xl font-bold text-slate-500">
                {(profile?.login || "D").charAt(0).toUpperCase()}
              </div>
            )}

            <div className="min-w-0">
              <h2 className="truncate text-xl font-bold text-slate-900">
                {profile?.name || profile?.login || "Developer"}
              </h2>

              <p className="mt-0.5 text-sm text-slate-500">
                @{profile?.login || "not-connected"}
              </p>

              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                GitHub Connected
              </span>
            </div>
          </div>

          <div className="my-6 border-t border-slate-100" />

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              About
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {profile?.bio || "No bio available."}
            </p>
          </div>

          <div className="my-6 border-t border-slate-100" />

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
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
  );
}

const ProfileStat = ({ label, value }) => {
  return (
    <div className="rounded-lg bg-slate-50 px-4 py-3">
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
};