"use client";

import { useEffect, useMemo, useState } from "react";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    role: "",
    phone: "",
    gender: "",
    age: "",
    street: "",
    city: "",
    country: "",
    zipCode: "",
  });

  const initials = useMemo(() => {
    const n = form.fullName?.trim?.() || "U";
    return n.charAt(0).toUpperCase();
  }, [form.fullName]);

  // Load profile
  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/profile", { cache: "no-store" });
        const data = await res.json();

        if (!res.ok) {
          setLoading(false);
          return;
        }

        setProfile(data);

        setForm({
          fullName: data.fullName || "",
          email: data.email || "",
          role: data.role || "",
          phone: data.phone || "",
          gender: data.gender || "",
          age: data.age?.toString?.() || "",
          street: data.address?.street || "",
          city: data.address?.city || "",
          country: data.address?.country || "",
          zipCode: data.address?.zipCode || "",
        });

        setLoading(false);
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    };

    run();
  }, []);

  const onChange = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.error || "Failed to update profile");
        setSaving(false);
        return;
      }

      alert("Profile updated!");
    } catch (e2) {
      console.error(e2);
      alert("Something went wrong");
    }

    setSaving(false);
  };

  if (loading) {
    return <div className="text-sm text-slate-500">Loading profile...</div>;
  }

  if (!profile) {
    return (
      <div className="border border-slate-200 rounded-2xl bg-white p-6">
        <h1 className="text-xl font-semibold text-slate-900">My Profile</h1>
        <p className="text-sm text-slate-500 mt-1">
          Could not load profile. Make sure you’re logged in.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">My Profile</h1>
        <p className="text-sm text-slate-500 mt-1">
          View and update your personal information.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left summary card */}
        <div className="border border-slate-200 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-700">
              {initials}
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {form.fullName || "User"}
              </p>
              <p className="text-xs text-slate-500 truncate">{form.email}</p>

              <span className="inline-flex mt-2 text-xs px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-700">
                Role: {form.role || "user"}
              </span>
            </div>
          </div>

          <div className="mt-5 border-t border-slate-200 pt-4 space-y-2">
            <div className="flex justify-between gap-3 text-sm">
              <span className="text-slate-500">Phone</span>
              <span className="text-slate-900 font-medium truncate">
                {form.phone || "—"}
              </span>
            </div>
            <div className="flex justify-between gap-3 text-sm">
              <span className="text-slate-500">City</span>
              <span className="text-slate-900 font-medium truncate">
                {form.city || "—"}
              </span>
            </div>
            <div className="flex justify-between gap-3 text-sm">
              <span className="text-slate-500">Country</span>
              <span className="text-slate-900 font-medium truncate">
                {form.country || "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Right form */}
        <form
          onSubmit={onSave}
          className="lg:col-span-2 border border-slate-200 rounded-2xl bg-white p-6 shadow-sm space-y-5"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600">Full Name</label>
              <input
                value={form.fullName}
                onChange={onChange("fullName")}
                className="mt-2 w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600">Email</label>
              <input
                value={form.email}
                readOnly
                className="mt-2 w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 text-slate-500"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-600">Phone</label>
              <input
                value={form.phone}
                onChange={onChange("phone")}
                className="mt-2 w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600">Age</label>
              <input
                value={form.age}
                onChange={onChange("age")}
                className="mt-2 w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="e.g. 22"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600">Gender</label>
              <select
                value={form.gender}
                onChange={onChange("gender")}
                className="mt-2 w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-slate-200 bg-white"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600">Zip Code</label>
              <input
                value={form.zipCode}
                onChange={onChange("zipCode")}
                className="mt-2 w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">Street</label>
            <input
              value={form.street}
              onChange={onChange("street")}
              className="mt-2 w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600">City</label>
              <input
                value={form.city}
                onChange={onChange("city")}
                className="mt-2 w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600">Country</label>
              <input
                value={form.country}
                onChange={onChange("country")}
                className="mt-2 w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}