import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../lib/api";
import { Shield, Lock, Mail, AlertCircle } from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@veergatha.in");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginAdmin({ email, password });
      if (data.accessToken) {
        localStorage.setItem("veergatha_token", data.accessToken);
        navigate("/admin/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16 px-4 max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-full bg-amber-950/60 border border-amber-600/40 flex items-center justify-center text-amber-500 mx-auto">
          <Shield className="w-6 h-6" />
        </div>
        <h1 className="font-display text-3xl font-bold text-zinc-100">Editorial Authentication</h1>
        <p className="text-xs text-zinc-400">Gated access for archive editors and administrators.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-2xl space-y-4">
        {error && (
          <div className="bg-red-950/60 border border-red-800/60 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-300">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-600"
              placeholder="editor@veergatha.in"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-300">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-600"
              placeholder="••••••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-zinc-950 font-semibold text-xs rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? "Authenticating..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
