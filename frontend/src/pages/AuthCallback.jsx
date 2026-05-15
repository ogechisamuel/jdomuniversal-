import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AuthCallback() {
  const { googleSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const processed = useRef(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;
    const hash = location.hash || window.location.hash;
    const params = new URLSearchParams(hash.replace(/^#/, ""));
    const session_id = params.get("session_id");
    if (!session_id) {
      setErr("Missing session id. Redirecting to login…");
      setTimeout(() => navigate("/login", { replace: true }), 1200);
      return;
    }
    (async () => {
      const res = await googleSession(session_id);
      if (res.ok) {
        // strip hash and go to dashboard
        window.history.replaceState({}, "", "/");
        navigate(res.user.role === "admin" ? "/admin" : "/dashboard", { replace: true });
      } else {
        setErr(res.error || "Auth failed.");
        setTimeout(() => navigate("/login", { replace: true }), 1500);
      }
    })();
  }, [googleSession, navigate, location.hash]);

  return (
    <div className="min-h-screen bg-navy text-white flex items-center justify-center" data-testid="auth-callback-screen">
      <div className="text-center">
        <Loader2 className="h-8 w-8 text-gold animate-spin mx-auto" />
        <p className="mt-4 text-sm">{err || "Finishing sign-in…"}</p>
      </div>
    </div>
  );
}
