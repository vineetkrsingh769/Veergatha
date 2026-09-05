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
const AdminLogin = lazy(() => import("./pages/AdminLogin.jsx"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.jsx"));

function PageLoader() {
  return <div className="py-24 text-center text-sm text-stone-500">Loading…</div>;
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
          <Route path="admin/login" element={<AdminLogin />} />
          <Route path="admin/dashboard" element={<AdminDashboard />} />
          <Route
            path="*"
            element={<div className="p-16 text-center text-sm text-stone-500">Page not found.</div>}
          />
        </Route>
      </Routes>
    </Suspense>
  );
}
