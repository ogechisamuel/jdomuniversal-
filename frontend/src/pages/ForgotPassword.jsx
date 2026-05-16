import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api, { formatApiError } from "@/lib/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email, origin: window.location.origin });
      setSent(true);
      toast.success("If an account exists for that email, a reset link is on its way.");
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      <div className="hidden lg:flex flex-col justify-between bg-navy text-white p-12 relative overflow-hidden">
        <Link to="/" className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-gold text-navy font-extrabold">J</span>
          <span className="font-heading font-bold text-lg">JDOM <span className="text-gold">Universal</span></span>
        </Link>
        <div className="relative z-10">
          <p className="label-eyebrow text-gold">Account recovery</p>
          <h2 className="font-heading text-4xl mt-3 max-w-md leading-tight">Locked out? We'll get you back in within minutes.</h2>
        </div>
        <div className="text-xs text-white/40">© {new Date().getFullYear()} JDOM Universal Concept</div>
        <div className="absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-navy/60 hover:text-gold-700 mb-6" data-testid="back-to-login-link">
            <ArrowLeft className="h-4 w-4" /> Back to sign in
          </Link>

          {!sent ? (
            <>
              <h1 className="font-heading text-3xl text-navy">Forgot password?</h1>
              <p className="text-navy/65 text-sm mt-1">Enter your account email and we'll send you a secure reset link.</p>

              <form onSubmit={submit} className="mt-8 space-y-5">
                <div>
                  <Label className="text-navy">Email address</Label>
                  <Input
                    data-testid="forgot-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1.5"
                  />
                </div>
                <Button type="submit" disabled={loading || !email} className="w-full h-11 bg-navy hover:bg-navy-600 text-white" data-testid="forgot-submit-btn">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Mail className="h-4 w-4" /> Send reset link</>}
                </Button>
              </form>
              <p className="text-xs text-navy/50 mt-4">Links expire in 30 minutes for your security.</p>
            </>
          ) : (
            <div data-testid="forgot-success">
              <div className="h-14 w-14 rounded-full bg-gold/20 flex items-center justify-center">
                <Mail className="h-7 w-7 text-gold-700" />
              </div>
              <h1 className="font-heading text-3xl text-navy mt-5">Check your inbox</h1>
              <p className="text-navy/70 text-sm mt-2 leading-relaxed">
                If an account exists for <strong>{email}</strong>, we've sent a password reset link. It expires in <strong>30 minutes</strong>.
              </p>
              <p className="text-xs text-navy/50 mt-6">Didn't receive it? Check spam, or <button type="button" className="text-gold-700 underline" onClick={() => setSent(false)} data-testid="forgot-retry-btn">try a different email</button>.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
