import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api, { formatApiError } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // null = checking, false = unauthenticated, object = user
  const [user, setUser] = useState(null);

  const checkAuth = useCallback(async () => {
    // If returning from Emergent OAuth, let AuthCallback exchange first
    if (window.location.hash?.includes("session_id=")) {
      setUser(false);
      return;
    }
    const token = localStorage.getItem("jdom_token");
    if (!token) { setUser(false); return; }
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
    } catch {
      localStorage.removeItem("jdom_token");
      localStorage.removeItem("jdom_token_type");
      setUser(false);
    }
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  const login = async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("jdom_token", data.access_token);
      localStorage.setItem("jdom_token_type", "jwt");
      setUser(data.user);
      return { ok: true, user: data.user };
    } catch (e) {
      return { ok: false, error: formatApiError(e) };
    }
  };

  const register = async (payload) => {
    try {
      const { data } = await api.post("/auth/register", payload);
      localStorage.setItem("jdom_token", data.access_token);
      localStorage.setItem("jdom_token_type", "jwt");
      setUser(data.user);
      return { ok: true, user: data.user };
    } catch (e) {
      return { ok: false, error: formatApiError(e) };
    }
  };

  const googleSession = async (session_id) => {
    try {
      const { data } = await api.post("/auth/google/session", { session_id });
      localStorage.setItem("jdom_token", data.session_token);
      localStorage.setItem("jdom_token_type", "session");
      setUser(data.user);
      return { ok: true, user: data.user };
    } catch (e) {
      return { ok: false, error: formatApiError(e) };
    }
  };

  const logout = async () => {
    try { await api.post("/auth/logout"); } catch { /* ignore */ }
    localStorage.removeItem("jdom_token");
    localStorage.removeItem("jdom_token_type");
    setUser(false);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, googleSession, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
