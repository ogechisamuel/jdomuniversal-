import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import Logo from "@/components/Logo";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || null;
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(form.email, form.password);
    setLoading(false);
    if (res.ok) {
      toast.success(`Welcome back, ${res.user.name}`);
      const fallback = res.user.role === "admin" ? "/admin" : "/dashboard";
      // Don't send admin to importer routes (or importer to admin routes) via stale `from`
      const safeFrom = from && (
        (res.user.role === "admin" && from.startsWith("/admin")) ||
        (res.user.role !== "admin" && from.startsWith("/dashboard"))
      ) ? from : null;
      navigate(safeFrom || fallback, { replace: true });
    } else {
      toast.error(res.error);
    }
  };

  const googleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/auth/callback";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      <div className="hidden lg:flex flex-col justify-between bg-navy text-white p-12 relative overflow-hidden">
        <Logo testId="login-brand-link" wordmarkClassName="font-heading font-extrabold text-base tracking-wide text-white" />
        <div className="relative z-10">
          <p className="label-eyebrow text-gold">Importer Portal</p>
          <h2 className="font-heading text-4xl mt-3 max-w-md leading-tight">Track every container. File from anywhere.</h2>
          <p className="text-white/70 text-sm mt-4 max-w-sm">Submit clearing requests, upload PAAR &amp; Form M, and watch status updates in real time.</p>
        </div>
        <div className="text-xs text-white/40">© {new Date().getFullYear()} JDOM UNIVERSAL CONCEPT LTD</div>
        <div className="absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-white p-1 shadow-sm">
              <img src="https://customer-assets.emergentagent.com/job_clearing-express/artifacts/jl2nerad_jdom.png" alt="JDOM" className="h-full w-full object-contain" />
            </span>
            <span className="font-heading font-bold text-navy text-sm">JDOM UNIVERSAL CONCEPT LTD</span>
          </Link>
          <h1 className="font-heading text-3xl text-navy">Welcome back</h1>
          <p className="text-navy/65 text-sm mt-1">Sign in to your importer dashboard.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <div>
              <Label className="text-navy">Email</Label>
              <Input data-testid="login-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="mt-1.5" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label className="text-navy">Password</Label>
                <Link to="/forgot-password" className="text-xs text-gold-700 hover:underline" data-testid="login-forgot-link">Forgot password?</Link>
              </div>
              <Input data-testid="login-password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required className="mt-1.5" />
            </div>
            <Button type="submit" disabled={loading} data-testid="login-submit-btn" className="w-full bg-navy hover:bg-navy-600 text-white h-11">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><LogIn className="h-4 w-4" /> Sign in</>}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-navy/40">
            <div className="h-px bg-border flex-1" /> OR <div className="h-px bg-border flex-1" />
          </div>

          <Button onClick={googleLogin} variant="outline" data-testid="login-google-btn" className="w-full h-11 border-navy/20 text-navy hover:bg-navy hover:text-white">
            <svg viewBox="0 0 24 24" className="h-4 w-4"><path fill="currentColor" d="M21.35 11.1H12v3.2h5.35c-.23 1.24-1.62 3.64-5.35 3.64-3.22 0-5.85-2.66-5.85-5.94S8.78 6.06 12 6.06c1.83 0 3.06.78 3.76 1.45l2.57-2.48C16.7 3.55 14.55 2.6 12 2.6 6.92 2.6 2.8 6.72 2.8 11.8s4.12 9.2 9.2 9.2c5.31 0 8.83-3.73 8.83-8.98 0-.6-.07-1.05-.16-1.52z"/></svg>
            Continue with Google
          </Button>

          <p className="mt-6 text-sm text-navy/65">
            Don't have an account?{" "}
            <Link to="/register" className="text-gold-700 font-semibold hover:underline" data-testid="login-register-link">Register as importer</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
