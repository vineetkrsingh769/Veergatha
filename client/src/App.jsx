import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";

// Code-split pages for performance (<3s load target)
const Home = lazy(() => import("./pages/Home.jsx"));
const MartyrsList = lazy(() => import("./pages/MartyrsList.jsx"));
const MartyrDetail = lazy(() => import("./pages/MartyrDetail.jsx"));
const MemorialsList = lazy(() => import("./pages/MemorialsList.jsx"));
const MemorialDetail = lazy(() => import("./pages/MemorialDetail.jsx"));
const WarsList = lazy(() => import("./pages/WarsList.jsx"));
const WarDetail = lazy(() => import("./pages/WarDetail.jsx"));
const Search = lazy(() => import("./pages/Search.jsx"));
const Gallery = lazy(() => import("./pages/Gallery.jsx"));
// Stub — the header links here so the route must resolve. Night 17 writes it.
const About = lazy(() => import("./pages/About.jsx"));
// Stub — every profile's provenance footer links here. Night 20 builds the form.
const Corrections = lazy(() => import("./pages/Corrections.jsx"));
const AdminLogin = lazy(() => import("./pages/AdminLogin.jsx"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.jsx"));
// Design system reference. Deliberately absent from NAV_ITEMS — reachable, not
// advertised, because it documents the tokens rather than the archive.
const StyleGuide = lazy(() => import("./pages/StyleGuide.jsx"));

function PageLoader() {
  return <div className="py-24 text-center text-body text-muted">Loading…</div>;
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="martyrs" element={<MartyrsList />} />
          <Route path="martyrs/:slug" element={<MartyrDetail />} />
          <Route path="memorials" element={<MemorialsList />} />
          <Route path="memorials/:slug" element={<MemorialDetail />} />
          <Route path="wars" element={<WarsList />} />
          <Route path="wars/:slug" element={<WarDetail />} />
          <Route path="search" element={<Search />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="about" element={<About />} />
          <Route path="corrections" element={<Corrections />} />
          <Route path="admin/login" element={<AdminLogin />} />
          <Route path="admin/dashboard" element={<AdminDashboard />} />
          <Route path="style-guide" element={<StyleGuide />} />
          <Route
            path="*"
            element={<div className="p-16 text-center text-body text-muted">Page not found.</div>}
          />
        </Route>
      </Routes>
    </Suspense>
  );
}
