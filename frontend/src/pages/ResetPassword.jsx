import { useState, useMemo } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Loader2, KeyRound, CheckCircle2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api, { formatApiError } from "@/lib/api";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = useMemo(() => params.get("token") || "", [params]);
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (pw.length < 6) return toast.error("Password must be at least 6 characters.");
    if (pw !== confirm) return toast.error("Passwords do not match.");
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password: pw });
      setDone(true);
      toast.success("Password updated. Please sign in with your new password.");
      setTimeout(() => navigate("/login", { replace: true }), 1500);
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="max-w-md text-center" data-testid="reset-no-token">
          <h1 className="font-heading text-2xl text-navy">Invalid reset link</h1>
          <p className="text-navy/65 text-sm mt-2">This link is missing or malformed. Please request a new reset email.</p>
          <Link to="/forgot-password" className="inline-block mt-6 btn-gold" data-testid="reset-request-new-link">
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      <div className="hidden lg:flex flex-col justify-between bg-navy text-white p-12 relative overflow-hidden">
        <Link to="/" className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-gold text-navy font-extrabold">J</span>
          <span className="font-heading font-bold text-lg">JDOM <span className="text-gold">Universal</span></span>
        </Link>
        <div className="relative z-10">
          <p className="label-eyebrow text-gold">Secure reset</p>
          <h2 className="font-heading text-4xl mt-3 max-w-md leading-tight">Choose a strong new password.</h2>
          <p className="text-white/70 text-sm mt-4 max-w-sm">Your password is hashed with bcrypt before it ever touches our database.</p>
        </div>
        <div className="text-xs text-white/40">© {new Date().getFullYear()} JDOM Universal Concept</div>
        <div className="absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-navy/60 hover:text-gold-700 mb-6" data-testid="reset-back-link">
            <ArrowLeft className="h-4 w-4" /> Back to sign in
          </Link>

          {done ? (
            <div data-testid="reset-success">
              <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7 text-emerald-600" />
              </div>
              <h1 className="font-heading text-3xl text-navy mt-5">Password updated</h1>
              <p className="text-navy/70 text-sm mt-2">Redirecting you to sign in…</p>
            </div>
          ) : (
            <>
              <h1 className="font-heading text-3xl text-navy">Set a new password</h1>
              <p className="text-navy/65 text-sm mt-1">Make it at least 6 characters. Longer is stronger.</p>

              <form onSubmit={submit} className="mt-8 space-y-5">
                <div>
                  <Label className="text-navy">New password</Label>
                  <Input
                    data-testid="reset-password-input"
                    type="password"
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                    required
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label className="text-navy">Confirm new password</Label>
                  <Input
                    data-testid="reset-confirm-input"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    className="mt-1.5"
                  />
                </div>
                <Button type="submit" disabled={loading || !pw || !confirm} className="w-full h-11 bg-gold text-navy hover:bg-gold-400 font-semibold" data-testid="reset-submit-btn">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><KeyRound className="h-4 w-4" /> Update password</>}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
