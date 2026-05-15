import { BrowserRouter, Routes, Route, Outlet, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import "@/App.css";

import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import ProtectedRoute from "@/components/ProtectedRoute";

import Home from "@/pages/Home";
import About from "@/pages/About";
import Resources from "@/pages/Resources";
import Contact from "@/pages/Contact";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import AuthCallback from "@/pages/AuthCallback";

import DashboardLayout from "@/pages/dashboard/DashboardLayout";
import ImporterHome from "@/pages/dashboard/ImporterHome";
import ApplyAgent from "@/pages/dashboard/ApplyAgent";
import MyApplications from "@/pages/dashboard/MyApplications";
import DocumentVault from "@/pages/dashboard/DocumentVault";
import TrackShipment from "@/pages/dashboard/TrackShipment";

import AdminHome from "@/pages/admin/AdminHome";
import AdminLeads from "@/pages/admin/AdminLeads";
import AdminApplications from "@/pages/admin/AdminApplications";
import AdminImporters from "@/pages/admin/AdminImporters";
import AdminTestimonials from "@/pages/admin/AdminTestimonials";
import AdminGallery from "@/pages/admin/AdminGallery";

function PublicShell() {
  return (
    <>
      <Navbar />
      <main className="min-h-[60vh]"><Outlet /></main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}

function AppRouter() {
  const location = useLocation();
  // Handle Emergent OAuth redirect first — synchronous in render
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      <Route element={<PublicShell />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      <Route
        path="/dashboard"
        element={<ProtectedRoute><DashboardLayout role="importer" /></ProtectedRoute>}
      >
        <Route index element={<ImporterHome />} />
        <Route path="apply" element={<ApplyAgent />} />
        <Route path="applications" element={<MyApplications />} />
        <Route path="documents" element={<DocumentVault />} />
        <Route path="track" element={<TrackShipment />} />
      </Route>

      <Route
        path="/admin"
        element={<ProtectedRoute role="admin"><DashboardLayout role="admin" /></ProtectedRoute>}
      >
        <Route index element={<AdminHome />} />
        <Route path="leads" element={<AdminLeads />} />
        <Route path="applications" element={<AdminApplications />} />
        <Route path="importers" element={<AdminImporters />} />
        <Route path="testimonials" element={<AdminTestimonials />} />
        <Route path="gallery" element={<AdminGallery />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <AppRouter />
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
