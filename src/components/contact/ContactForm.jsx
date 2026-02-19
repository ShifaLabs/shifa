"use client";
import { useState } from "react";

export default function ContactForm() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      e.target.reset();
      alert("আপনার অনুরোধ সফলভাবে পাঠানো হয়েছে।");
    } else {
      alert("সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    }

    setLoading(false);
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
      <h2 className="text-2xl font-semibold mb-2">Submit a Support Request</h2>
      <p className={`text-sm text-muted-foreground mb-8 font-bangla`}>
        আপনার সমস্যার বিস্তারিত লিখুন। আমাদের টিম দ্রুত আপনার সাথে যোগাযোগ করবে।
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="text-sm font-medium font-bangla">পূর্ণ নাম</label>
          <input
            name="name"
            required
            className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="আপনার নাম লিখুন"
          />
        </div>

        <div>
          <label className="text-sm font-medium font-bangla">ইমেইল</label>
          <input
            name="email"
            type="email"
            required
            className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="example@email.com"
          />
        </div>

        <div>
          <label className="text-sm font-medium font-bangla">আপনি কে?</label>
          <select
            name="role"
            required
            className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select role</option>
            <option value="patient">রোগী</option>
            <option value="doctor">ডাক্তার</option>
            <option value="other">অন্যান্য</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium font-bangla">বিষয়</label>
          <input
            name="subject"
            required
            className="font-bangla mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="সমস্যার বিষয় লিখুন"
          />
        </div>

        <div>
          <label className="text-sm font-medium font-bangla">বিস্তারিত</label>
          <textarea
            name="message"
            required
            rows="5"
            className="font-bangla mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="আপনার সমস্যার বিস্তারিত লিখুন..."
          />
        </div>

        <div>
          <label className="text-sm font-medium">Priority</label>
          <select
            name="priority"
            className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="normal">Normal</option>
            <option value="urgent">Urgent (জরুরি)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Sending..." : "অনুরোধ পাঠান"}
        </button>
      </form>
    </div>
  );
}
