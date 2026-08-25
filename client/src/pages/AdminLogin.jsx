import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, AlertCircle } from "lucide-react";

import { loginAdmin } from "../lib/api";
import { saveSession } from "../lib/auth";
import { getErrorMessage } from "../hooks/useApi";
import { Button, Field } from "../components/ui/Field.jsx";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const data = await loginAdmin(form);
      // Persist the refresh token too — the /auth/refresh endpoint exists, but
      // the old flow discarded it, so sessions died silently after 15 minutes.
      saveSession(data);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(getErrorMessage(err, "Login failed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-16">
      <div className="space-y-2 text-center">
        <img
          src="/logo.png"
          alt="Veergatha emblem"
          width={56}
          height={56}
          className="mx-auto h-14 w-14"
        />
        <h1 className="font-display text-3xl font-bold text-[#1E431B]">
          Editorial Authentication
        </h1>
        <p className="text-xs text-stone-600">
          Gated access for archive editors and administrators.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-stone-300 bg-white/85 p-6 shadow-xs"
      >
        {error && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800"
          >
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <Field
          label="Email address"
          icon={Mail}
          type="email"
          required
          autoComplete="username"
          placeholder="editor@veergatha.in"
          value={form.email}
          onChange={set("email")}
        />

        <Field
          label="Password"
          icon={Lock}
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••••••"
          value={form.password}
          onChange={set("password")}
        />

        <Button type="submit" disabled={submitting} className="w-full py-2.5">
          {submitting ? "Authenticating…" : "Sign In"}
        </Button>
      </form>
    </div>
  );
}
