import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters.");
    setLoading(true);
    const res = await register(form);
    setLoading(false);
    if (res.ok) {
      toast.success("Account created. Welcome to JDOM.");
      navigate("/dashboard", { replace: true });
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
        <Link to="/" className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-gold text-navy font-extrabold">J</span>
          <span className="font-heading font-bold text-lg">JDOM <span className="text-gold">Universal</span></span>
        </Link>
        <div className="relative z-10">
          <p className="label-eyebrow text-gold">Become an importer</p>
          <h2 className="font-heading text-4xl mt-3 max-w-md leading-tight">Onboard in 60 seconds. Clear your first container this week.</h2>
        </div>
        <div className="text-xs text-white/40">© {new Date().getFullYear()} JDOM Universal Concept Ltd</div>
        <div className="absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h1 className="font-heading text-3xl text-navy">Create your account</h1>
          <p className="text-navy/65 text-sm mt-1">Get instant access to the JDOM clearing platform.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <div>
              <Label className="text-navy">Full name</Label>
              <Input data-testid="register-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="mt-1.5" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-navy">Email</Label>
                <Input data-testid="register-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="mt-1.5" />
              </div>
              <div>
                <Label className="text-navy">Phone</Label>
                <Input data-testid="register-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1.5" />
              </div>
            </div>
            <div>
              <Label className="text-navy">Password</Label>
              <Input data-testid="register-password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required className="mt-1.5" />
              <p className="text-xs text-navy/50 mt-1">Minimum 6 characters.</p>
            </div>
            <Button type="submit" disabled={loading} data-testid="register-submit-btn" className="w-full bg-gold text-navy hover:bg-gold-400 h-11 font-semibold">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><UserPlus className="h-4 w-4" /> Create account</>}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-navy/40">
            <div className="h-px bg-border flex-1" /> OR <div className="h-px bg-border flex-1" />
          </div>

          <Button onClick={googleLogin} variant="outline" data-testid="register-google-btn" className="w-full h-11 border-navy/20 text-navy hover:bg-navy hover:text-white">
            Continue with Google
          </Button>

          <p className="mt-6 text-sm text-navy/65">
            Already have an account?{" "}
            <Link to="/login" className="text-gold-700 font-semibold hover:underline" data-testid="register-login-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
