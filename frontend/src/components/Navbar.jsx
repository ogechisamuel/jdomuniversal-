import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, X, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/resources", label: "Resources" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-navy text-white border-b border-white/10" data-testid="site-navbar">
      <div className="container-x flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 group" data-testid="brand-link">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-gold text-navy font-heading font-extrabold">J</span>
          <span className="font-heading font-bold text-lg tracking-wide group-hover:text-gold transition-colors">
            JDOM <span className="text-gold">Universal</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              data-testid={`nav-${l.label.toLowerCase()}`}
              className={({ isActive }) =>
                `px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive ? "text-gold" : "text-white/85 hover:text-gold"
                }`
              }
              end={l.to === "/"}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <Button
              data-testid="open-dashboard-btn"
              onClick={() => navigate(user.role === "admin" ? "/admin" : "/dashboard")}
              className="bg-gold text-navy hover:bg-gold-400 font-semibold"
            >
              <ShieldCheck className="h-4 w-4" /> Dashboard
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                data-testid="nav-login-btn"
                onClick={() => navigate("/login")}
                className="text-white hover:bg-white/10 hover:text-white"
              >
                Sign in
              </Button>
              <Button
                data-testid="nav-getquote-btn"
                onClick={() => navigate("/#lead-form")}
                className="bg-gold text-navy hover:bg-gold-400 font-semibold"
              >
                Get Quote
              </Button>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2 rounded-md text-white"
          onClick={() => setOpen((s) => !s)}
          aria-label="toggle menu"
          data-testid="mobile-menu-toggle"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/10 bg-navy">
          <div className="container-x py-3 flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                data-testid={`mobile-nav-${l.label.toLowerCase()}`}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm ${isActive ? "text-gold" : "text-white/90 hover:text-gold"}`
                }
                end={l.to === "/"}
              >
                {l.label}
              </NavLink>
            ))}
            <div className="flex gap-2 pt-2">
              {user ? (
                <Button onClick={() => navigate(user.role === "admin" ? "/admin" : "/dashboard")} className="flex-1 bg-gold text-navy hover:bg-gold-400">
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={() => { setOpen(false); navigate("/login"); }} className="flex-1 border-white/30 text-white hover:bg-white hover:text-navy">
                    Sign in
                  </Button>
                  <Button onClick={() => { setOpen(false); navigate("/#lead-form"); }} className="flex-1 bg-gold text-navy hover:bg-gold-400">
                    Get Quote
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
