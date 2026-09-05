import { useState } from "react";
import { KeyRound, X, AlertCircle, CheckCircle2 } from "lucide-react";

import { changePassword } from "../../lib/api";
import { saveSession } from "../../lib/auth";
import { getErrorMessage } from "../../hooks/useApi";
import { Button, Field } from "../ui/Field.jsx";

const MIN_LENGTH = 12; // matches the server schema and the User model

const BLANK = { currentPassword: "", newPassword: "", confirmPassword: "" };

export default function ChangePassword({ onClose }) {
  const [form, setForm] = useState(BLANK);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const tooShort = form.newPassword.length > 0 && form.newPassword.length < MIN_LENGTH;
  const mismatch = form.confirmPassword.length > 0 && form.newPassword !== form.confirmPassword;

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (form.newPassword !== form.confirmPassword) {
      return setError("The two new password fields do not match.");
    }
    if (form.newPassword.length < MIN_LENGTH) {
      return setError(`New password must be at least ${MIN_LENGTH} characters.`);
    }

    setBusy(true);
    try {
      const data = await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      // The change invalidates every refresh token, this session's included.
      // Storing the returned pair is what keeps the person who made the change
      // signed in while every other session is dropped.
      saveSession(data);
      setForm(BLANK);
      setDone(true);
    } catch (err) {
      setError(getErrorMessage(err, "Could not change the password"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Change password"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md space-y-4 rounded-2xl border border-stone-300 bg-[#FAF7F2] p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-stone-300 pb-3">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-[#1E431B]">
            <KeyRound className="h-4 w-4 text-[#D96B27]" aria-hidden="true" />
            Change password
          </h2>
          <button onClick={onClose} aria-label="Close" className="text-stone-400 hover:text-stone-700">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {done ? (
          <div className="space-y-4">
            <div className="flex items-start gap-2 rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-900">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                Password changed. You are still signed in here; every other session has been
                signed out.
              </span>
            </div>
            <Button onClick={onClose} className="w-full py-2.5">
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <Field
              label="Current password"
              type="password"
              required
              autoComplete="current-password"
              value={form.currentPassword}
              onChange={set("currentPassword")}
            />

            <Field
              label="New password"
              type="password"
              required
              autoComplete="new-password"
              hint={
                tooShort
                  ? `${MIN_LENGTH - form.newPassword.length} more characters needed`
                  : `At least ${MIN_LENGTH} characters. A passphrase beats a short complex string.`
              }
              value={form.newPassword}
              onChange={set("newPassword")}
            />

            <Field
              label="Confirm new password"
              type="password"
              required
              autoComplete="new-password"
              hint={mismatch ? "The two fields do not match" : undefined}
              value={form.confirmPassword}
              onChange={set("confirmPassword")}
            />

            <Button type="submit" disabled={busy || tooShort || mismatch} className="w-full py-2.5">
              {busy ? "Changing…" : "Change password"}
            </Button>

            <p className="text-[11px] leading-relaxed text-stone-500">
              Changing the password signs out every other session immediately. Your current
              password is required, so a borrowed session cannot lock you out of your own account.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
