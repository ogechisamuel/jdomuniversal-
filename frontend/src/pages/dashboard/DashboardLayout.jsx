import { Link, NavLink, useNavigate, Outlet } from "react-router-dom";
import { LayoutDashboard, FilePlus2, Files, FolderOpen, Truck, LogOut, Users, MessagesSquare, Images, ShieldCheck, ClipboardList, ArrowLeftRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Logo from "@/components/Logo";

const importerLinks = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/dashboard/apply", label: "Apply Agent", icon: FilePlus2 },
  { to: "/dashboard/applications", label: "My Applications", icon: Files },
  { to: "/dashboard/documents", label: "Document Vault", icon: FolderOpen },
  { to: "/dashboard/track", label: "Track Shipment", icon: Truck },
];

const adminLinks = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/leads", label: "Leads", icon: MessagesSquare },
  { to: "/admin/applications", label: "Applications", icon: ClipboardList },
  { to: "/admin/importers", label: "Importers", icon: Users },
  { to: "/admin/templates", label: "Templates", icon: MessageSquareText },
  { to: "/admin/testimonials", label: "Testimonials", icon: ShieldCheck },
  { to: "/admin/gallery", label: "Gallery", icon: Images },
];

export default function DashboardLayout({ role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const links = role === "admin" ? adminLinks : importerLinks;

  const doLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen flex bg-[#F8F9FA]">
      <aside className={`fixed lg:static z-40 inset-y-0 left-0 w-72 bg-navy text-white flex flex-col transition-transform ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="p-6 border-b border-white/10">
          <Logo
            testId="dashboard-brand"
            wordmarkClassName={`font-heading font-extrabold text-sm tracking-wide text-white`}
          />
          <div className="mt-2 text-xs text-gold uppercase tracking-widest pl-14">{role === "admin" ? "Admin Console" : "Importer Portal"}</div>
        </div>

        <div className="p-4">
          <div className="rounded-lg bg-white/5 border border-white/10 p-3 mb-4" data-testid="dashboard-user">
            <div className="text-xs text-white/55 uppercase tracking-widest">Signed in as</div>
            <div className="font-heading text-sm mt-1 truncate">{user?.name}</div>
            <div className="text-xs text-gold mt-0.5 capitalize">{user?.role}</div>
          </div>
          <nav className="space-y-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                onClick={() => setOpen(false)}
                data-testid={`side-${l.label.toLowerCase().replace(/\s/g, "-")}`}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive ? "bg-gold text-navy" : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <l.icon className="h-4 w-4" /> {l.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-4 space-y-2">
          {user?.role === "admin" && (
            <button onClick={() => navigate("/dashboard")} className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-white/70 hover:bg-white/10" data-testid="switch-to-importer-btn">
              <ArrowLeftRight className="h-4 w-4" /> Switch view
            </button>
          )}
          <button
            onClick={doLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm bg-white/5 hover:bg-white/10 text-white"
            data-testid="logout-btn"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-border sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            <button className="lg:hidden p-2 text-navy" onClick={() => setOpen((s) => !s)} data-testid="dashboard-menu-toggle">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="font-heading text-navy text-lg hidden sm:block">{role === "admin" ? "Admin Console" : "Importer Dashboard"}</div>
            <Link to="/" className="text-sm text-navy/65 hover:text-gold-700" data-testid="back-to-site-link">← Back to site</Link>
          </div>
        </header>
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>

      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}
    </div>
  );
}
