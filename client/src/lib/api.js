import axios from "axios";
import { getToken } from "./auth";

// In dev, VITE_API_URL is empty and Vite proxies /api to http://localhost:5000
// In production, VITE_API_URL is the Render server URL (e.g., https://veergatha-api.onrender.com)
const BASE_URL = import.meta.env.VITE_API_URL || "";

export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT token for admin routes
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Public API endpoints
export const fetchStats = () => api.get("/stats").then((r) => r.data);
export const fetchFilters = () => api.get("/filters").then((r) => r.data);
export const fetchMartyrs = (params) => api.get("/martyrs", { params }).then((r) => r.data);
export const fetchMartyrBySlug = (slug) => api.get(`/martyrs/${slug}`).then((r) => r.data);
export const fetchMemorials = (params) => api.get("/memorials", { params }).then((r) => r.data);
export const fetchMemorialBySlug = (slug) => api.get(`/memorials/${slug}`).then((r) => r.data);
export const fetchWars = () => api.get("/wars").then((r) => r.data);
export const fetchWarBySlug = (slug) => api.get(`/wars/${slug}`).then((r) => r.data);
export const searchArchive = (q) => api.get("/search", { params: { q } }).then((r) => r.data);

// Auth & Admin endpoints
export const loginAdmin = (credentials) => api.post("/auth/login", credentials).then((r) => r.data);
export const fetchMe = () => api.get("/auth/me").then((r) => r.data);

export const fetchAdminMartyrs = (params) => api.get("/admin/martyrs", { params }).then((r) => r.data);
export const createAdminMartyr = (data) => api.post("/admin/martyrs", data).then((r) => r.data);
export const updateAdminMartyr = (id, data) => api.put(`/admin/martyrs/${id}`, data).then((r) => r.data);
export const deleteAdminMartyr = (id) => api.delete(`/admin/martyrs/${id}`).then((r) => r.data);

export const fetchAdminMemorials = (params) => api.get("/admin/memorials", { params }).then((r) => r.data);
export const createAdminMemorial = (data) => api.post("/admin/memorials", data).then((r) => r.data);
export const updateAdminMemorial = (id, data) => api.put(`/admin/memorials/${id}`, data).then((r) => r.data);
export const deleteAdminMemorial = (id) => api.delete(`/admin/memorials/${id}`).then((r) => r.data);

export const fetchAdminWars = () => api.get("/admin/wars").then((r) => r.data);
export const createAdminWar = (data) => api.post("/admin/wars", data).then((r) => r.data);
export const updateAdminWar = (id, data) => api.put(`/admin/wars/${id}`, data).then((r) => r.data);
export const deleteAdminWar = (id) => api.delete(`/admin/wars/${id}`).then((r) => r.data);

// --- Media ---
export const fetchMedia = (params) => api.get("/media", { params }).then((r) => r.data);
export const fetchAdminMedia = (params) => api.get("/admin/media", { params }).then((r) => r.data);
export const deleteAdminMedia = (id) => api.delete(`/admin/media/${id}`).then((r) => r.data);
export const updateAdminMedia = (id, data) => api.put(`/admin/media/${id}`, data).then((r) => r.data);

/**
 * Upload takes multipart, so Content-Type must be unset here rather than
 * inherited from the instance default of application/json. The browser then
 * writes it itself, including the multipart boundary — which is generated per
 * request and cannot be hardcoded.
 */
export const uploadAdminMedia = (formData, onProgress) =>
  api
    .post("/admin/media", formData, {
      headers: { "Content-Type": undefined },
      onUploadProgress: (e) =>
        onProgress?.(e.total ? Math.round((e.loaded * 100) / e.total) : 0),
    })
    .then((r) => r.data);
