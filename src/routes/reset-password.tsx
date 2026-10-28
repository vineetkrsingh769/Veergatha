import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { AuthShell, Field, Notice, fail } from "@/components/admin/shared";

// The reset email links here. Supabase reads the one-time token from the URL
// and signs the editor in, so getSession() resolves to that recovery session.
export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Choose a new password | Veergatha" }] }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [state, setState] = useState<"checking" | "ready" | "invalid">("checking");
  const [password, setPassword] = useState("");
  const [again, setAgain] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void supabase.auth
      .getSession()
      .then(({ data }) => setState(data.session ? "ready" : "invalid"));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) return void toast.error("Use at least 8 characters");
    if (password !== again) return void toast.error("The two passwords don't match");
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated");
      await navigate({ to: "/admin" });
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell>
      {state === "checking" ? (
        <p className="text-muted-foreground">Checking your reset link…</p>
      ) : state === "invalid" ? (
        <Notice
          title="This link has expired"
          action={
            <Button variant="outline" asChild>
              <Link to="/auth" search={{ redirect: undefined }}>
                Back to sign in
              </Link>
            </Button>
          }
        >
          Reset links work once and expire after an hour. Request a new one from the sign-in page.
        </Notice>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <h2 className="font-display text-2xl font-semibold">Choose a new password</h2>
          <Field
            label="New password · at least 8 characters"
            type="password"
            value={password}
            onChange={setPassword}
            required
          />
          <Field label="Type it again" type="password" value={again} onChange={setAgain} required />
          <Button className="w-full" disabled={busy}>
            {busy ? "Please wait…" : "Save password"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
