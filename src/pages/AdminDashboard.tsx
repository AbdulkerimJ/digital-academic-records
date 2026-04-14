// src/AdminDashboard.jsx
// Single-file React + Tailwind admin dashboard for NILARVS (dark theme).
// Dependencies: react, react-dom, react-router-dom, framer-motion, lucide-react, chart.js, react-chartjs-2
// Tailwind CSS must be configured in your project. Install dependencies before running.

import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield, Bell, LogOut, Users, Building2, FileText, LifeBuoy, Clock, Plus, ChevronRight,
  UserPlus, CheckCircle2, AlertTriangle, Search, X, PieChart, BarChart, LineChart
} from "lucide-react";

type AdminSection = "dashboard" | "institutions" | "registrars" | "logs" | "support" | "settings";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  section: AdminSection;
  unread: boolean;
};

type SearchResult = {
  id: string;
  type: "Institution" | "Registrar" | "Log";
  title: string;
  subtitle: string;
  detail: string;
};

import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from "chart.js";
import { Line, Bar, Pie } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

// ---------- Utility: mock audit logger ----------
const auditLogPush = (logsSetter, entry) => {
  logsSetter(prev => {
    const newEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      user: entry.user || "system.admin",
      action: entry.action,
      description: entry.description || "",
      status: entry.status || "info",
      meta: entry.meta || {}
    };
    return [newEntry, ...prev].slice(0, 1000);
  });
};

const SUPPORT_REQUESTS_KEY = "nilarvs-admin-support-requests";
const SUPPORT_MESSAGES_KEY = "nilarvs-admin-support-messages";

const loadSupportRequests = () => {
  try {
    return JSON.parse(window.localStorage.getItem(SUPPORT_REQUESTS_KEY) || "[]");
  } catch {
    return [];
  }
};

const loadSupportMessages = () => {
  try {
    return JSON.parse(window.localStorage.getItem(SUPPORT_MESSAGES_KEY) || "[]");
  } catch {
    return [];
  }
};

const escapePdfText = (value: string) =>
  value
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n");

const buildPdfBlob = (title: string, rows: any[]) => {
  const lines = [title, "", ...rows.map((row, index) => `${index + 1}. ${row.timestamp} | ${row.user} | ${row.action} | ${row.status} | ${row.description}`)];
  const limitedLines = lines.slice(0, 40);
  const textStream = limitedLines
    .map((line, index) => {
      const escaped = escapePdfText(line);
      return index === 0
        ? `BT /F1 10 Tf 50 760 Td (${escaped}) Tj`
        : `T* (${escaped}) Tj`;
    })
    .join("\n");

  const stream = `${textStream}`;
  const streamLength = new TextEncoder().encode(stream).length;

  const objects = [
    `1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj`,
    `2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj`,
    `3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj`,
    `4 0 obj << /Length ${streamLength} >> stream
${stream}
endstream
endobj`,
    `5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj`,
  ];

  let offset = 0;
  const xref = ["xref", `0 ${objects.length + 1}`, "0000000000 65535 f "];
  const body = objects
    .map((obj) => {
      const line = `${obj}\n`;
      xref.push(`${offset.toString().padStart(10, "0")} 00000 n `);
      offset += new TextEncoder().encode(line).length;
      return line;
    })
    .join("");

  const trailer = `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${offset}\n%%EOF`;
  const pdf = `%PDF-1.4\n${body}${xref.join("\n")}\n${trailer}`;

  return new Blob([pdf], { type: "application/pdf" });
};

// ---------- Global styles note: ensure Tailwind config uses dark theme and text colors are white/light-gray ----------

// ---------- Sidebar Component ----------
function Sidebar({ activeSection, onSectionChange, onLogout, supportBadgeCount = 0, alertsCount = 0 }: { activeSection: AdminSection; onSectionChange: (section: AdminSection) => void; onLogout: () => void; supportBadgeCount?: number; alertsCount?: number; }) {
  const links: Array<{ key: AdminSection; label: string; icon: typeof Shield; badge?: number }> = [
    { key: "dashboard", label: "Dashboard", icon: Shield },
    { key: "institutions", label: "Manage Institutions", icon: Building2 },
    { key: "registrars", label: "Manage Registrars", icon: Users },
    { key: "logs", label: "System Logs & Reports", icon: FileText },
    { key: "support", label: "Support Requests", icon: LifeBuoy, badge: supportBadgeCount },
    { key: "settings", label: "Settings", icon: Clock },
  ];

  return (
    <aside className="w-72 bg-gradient-to-b from-[#0b1220] to-[#0f1724] fixed h-full border-r border-gray-800 text-gray-100">
      <div className="p-5 flex items-center gap-3 border-b border-gray-800">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="text-white font-semibold">NILARVS</div>
          <div className="text-xs text-gray-300">Admin Control Center</div>
        </div>
      </div>

      <nav className="p-4 space-y-1" aria-label="Main navigation">
        {links.map(({ key, label, icon: Icon, badge }) => {
          const active = activeSection === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSectionChange(key)}
              className={`w-full text-left flex items-center justify-between gap-3 px-3 py-2 rounded-md transition-colors ${
                active ? "bg-gray-700 text-white" : "text-gray-200 hover:bg-gray-800"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-gray-100" />
                <span className="text-sm">{label}</span>
              </div>
              {badge ? (
                <span className="bg-red-600 text-xs text-white px-2 py-0.5 rounded-full">{badge}</span>
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-4 pb-4 pt-2 border-t border-gray-800">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-2 justify-center rounded-md border border-red-600 bg-red-600/10 px-3 py-2 text-sm text-red-100 hover:bg-red-600/20"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>

      <div className="absolute bottom-6 w-full px-4">
        <div className="text-xs text-gray-400 mb-2">System Health</div>
        <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
          <div className="h-2 bg-green-500" style={{ width: "98%" }} />
        </div>
        <div className="mt-3 text-xs text-gray-400">Uptime: <span className="text-gray-200">99.97%</span></div>
      </div>
    </aside>
  );
}

// ---------- Header Component ----------
function Header({ notifications = [], unreadCount = 0, isNotificationsOpen = false, onToggleNotifications, onOpenNotification, onMarkAllRead }) {
  return (
    <header className="h-14 bg-[#0b1220] border-b border-gray-800 sticky top-0 z-30 ml-72">
      <div className="max-w-[1200px] mx-auto h-full flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="text-white font-semibold">NILARVS – Admin Control Center</div>
        </div>

        <div className="flex items-center gap-4 relative">
          <button
            aria-label="Notifications"
            onClick={onToggleNotifications}
            className="relative p-2 rounded hover:bg-gray-800"
          >
            <Bell className="h-5 w-5 text-gray-100" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-[10px] text-white rounded-full px-1.5">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 top-full mt-2 w-96 rounded-xl border border-gray-800 bg-[#071025] shadow-xl">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                <div>
                  <div className="text-sm font-semibold text-white">Notifications</div>
                  <div className="text-xs text-gray-400">Important alerts since last visit</div>
                </div>
                <button onClick={onMarkAllRead} className="text-xs text-indigo-400 hover:text-white">Mark all read</button>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-sm text-gray-400">No notifications yet.</div>
                ) : (
                  notifications.slice(0, 6).map((note) => (
                    <button
                      key={note.id}
                      type="button"
                      onClick={() => onOpenNotification?.(note)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-900"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm text-white font-medium">{note.title}</div>
                        {note.unread && <span className="h-2 w-2 rounded-full bg-indigo-500" />}
                      </div>
                      <div className="text-xs text-gray-400">{note.body}</div>
                      <div className="text-[11px] text-gray-500 mt-1">{note.time}</div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 bg-gray-800 px-3 py-1 rounded">
            <img src="https://ui-avatars.com/api/?name=Admin&background=111827&color=fff" alt="Admin" className="h-8 w-8 rounded-full" />
            <div className="text-left">
              <div className="text-sm text-white">Admin</div>
              <div className="text-xs text-gray-400">Super Admin</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

// ---------- Dashboard Page ----------
function DashboardPage({ stats, searchQuery, searchFilter, searchResults, onSearch, onClearSearch }) {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const filterOptions = ["Institutions", "Registrars", "Logs"] as const;

  const handleQueryChange = (value: string) => {
    onSearch(value, searchFilter);
    const trimmed = value.trim();
    if (trimmed && !recentSearches.includes(trimmed)) {
      setRecentSearches((prev) => [trimmed, ...prev].slice(0, 5));
    }
  };

  const handleFilterChange = (value: typeof filterOptions[number]) => {
    onSearch(searchQuery, value);
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="grid gap-4 lg:grid-cols-[1.8fr,0.8fr] items-center">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              aria-label="Global search"
              value={searchQuery}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search institutions, registrars, or logs..."
              className="w-full bg-[#071025] text-gray-100 placeholder-gray-500 pl-12 pr-10 py-3 rounded-full border border-gray-800 focus:outline-none focus:border-indigo-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  onClearSearch();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-400">Filter</label>
            <select
              value={searchFilter}
              onChange={(e) => handleFilterChange(e.target.value as typeof filterOptions[number])}
              className="w-full bg-[#071025] border border-gray-800 text-white rounded-full px-4 py-3"
            >
              {filterOptions.map((option) => (
                <option key={option} value={option} className="bg-[#071025]">
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {searchQuery ? (
        <Card title={`Search results (${searchResults.length})`}>
          {searchResults.length === 0 ? (
            <div className="text-sm text-gray-400">No results matched your search.</div>
          ) : (
            <div className="space-y-3">
              {searchResults.map((result) => (
                <div key={result.id} className="rounded-xl border border-gray-800 bg-[#0f1724] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-white">{result.title}</div>
                      <div className="text-xs text-gray-400">{result.subtitle}</div>
                    </div>
                    <div className="text-[11px] uppercase tracking-[0.12em] text-gray-400">{result.type}</div>
                  </div>
                  <p className="mt-2 text-sm text-gray-300">{result.detail}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      ) : (
        recentSearches.length > 0 && (
          <Card title="Recent searches">
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => handleQueryChange(term)}
                  className="rounded-full bg-gray-800 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700"
                >
                  {term}
                </button>
              ))}
            </div>
          </Card>
        )
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {stats.map((s) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <div className="p-4 rounded-lg bg-gradient-to-r from-[#0f1724] to-[#111827] border border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-indigo-700">
                    <s.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-white">{s.value}</div>
                    <div className="text-sm text-gray-300">{s.label}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-400">{s.change || ""}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent Activity">
          <RecentActivity />
        </Card>

        <Card title="System Health">
          <SystemHealth />
        </Card>
      </div>
    </div>
  );
}

// ---------- Institutions Page ----------
function InstitutionsPage({ institutions, onAddInstitution, onEditInstitution, onToggleInstitution }) {
  const [showForm, setShowForm] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState(null);
  const [form, setForm] = useState({ name: "", location: "", phone: "", email: "" });
  const [error, setError] = useState("");

  const openNewForm = () => {
    setEditingInstitution(null);
    setForm({ name: "", location: "", phone: "", email: "" });
    setError("");
    setShowForm(true);
  };

  const openEditForm = (institution) => {
    setEditingInstitution(institution);
    setForm({
      name: institution.name,
      location: institution.location,
      phone: institution.phone || "",
      email: institution.email || "",
    });
    setError("");
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.name || !form.location) {
      setError("Please fill in the required fields.");
      return;
    }
    const exists = institutions.some((item) => item.name.toLowerCase() === form.name.toLowerCase() && item.name !== editingInstitution?.name);
    if (exists) {
      setError("Institution with this name already exists.");
      return;
    }

    const payload = { ...form, status: editingInstitution?.status || "Active" };
    if (editingInstitution) {
      onEditInstitution(payload);
    } else {
      onAddInstitution(payload);
    }

    setForm({ name: "", location: "", phone: "", email: "" });
    setEditingInstitution(null);
    setShowForm(false);
    setError("");
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Manage Institutions</h2>
        <button onClick={openNewForm} className="bg-indigo-600 px-3 py-2 rounded text-white flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Institution
        </button>
      </div>

      <div className="bg-[#071025] border border-gray-800 rounded overflow-hidden">
        <table className="w-full text-left">
          <thead className="text-gray-300">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {institutions.map((inst) => (
              <tr key={inst.name} className="border-t border-gray-800 hover:bg-gray-800">
                <td className="px-4 py-3 text-white">{inst.name}</td>
                <td className="px-4 py-3 text-gray-200">{inst.location}</td>
                <td className="px-4 py-3 text-gray-200">{inst.email || inst.phone || "-"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${inst.status === "Active" ? "bg-emerald-600 text-white" : "bg-red-700 text-white"}`}>
                    {inst.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => openEditForm(inst)} className="text-indigo-400 text-sm">Edit</button>
                    <button onClick={() => onToggleInstitution(inst)} className="text-red-400 text-sm">
                      {inst.status === "Active" ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {institutions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">No institutions available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <Modal onClose={() => setShowForm(false)} title={editingInstitution ? "Edit Institution" : "Add Institution"}>
          <div className="space-y-3">
            <label className="block text-sm text-gray-200">Institution Name *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 bg-[#071025] border border-gray-700 rounded text-white" />
            <label className="block text-sm text-gray-200">Location *</label>
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full px-3 py-2 bg-[#071025] border border-gray-700 rounded text-white" />
            <label className="block text-sm text-gray-200">Contact Email</label>
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 bg-[#071025] border border-gray-700 rounded text-white" />
            <label className="block text-sm text-gray-200">Phone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 bg-[#071025] border border-gray-700 rounded text-white" />
            {error && <div className="text-sm text-red-400">{error}</div>}
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="px-3 py-2 rounded bg-gray-700 text-gray-200">Cancel</button>
              <button onClick={handleSubmit} className="px-3 py-2 rounded bg-indigo-600 text-white flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> {editingInstitution ? "Save" : "Register"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ---------- Registrars Page ----------
function RegistrarsPage({ registrars, institutions, onAddRegistrar, onEditRegistrar, onToggleRegistrar, onDeleteRegistrar }) {
  const [showForm, setShowForm] = useState(false);
  const [editingRegistrar, setEditingRegistrar] = useState(null);
  const [form, setForm] = useState({ name: "", username: "", password: "", institution: "" });
  const [error, setError] = useState("");

  const openNewForm = () => {
    setEditingRegistrar(null);
    setForm({ name: "", username: "", password: "", institution: "" });
    setError("");
    setShowForm(true);
  };

  const openEditForm = (registrar) => {
    setEditingRegistrar(registrar);
    setForm({ name: registrar.name, username: registrar.username, password: "", institution: registrar.institution });
    setError("");
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.name || !form.username || !form.institution) {
      setError("Please fill required fields.");
      return;
    }
    const exists = registrars.some((item) => item.username.toLowerCase() === form.username.toLowerCase() && item.username !== editingRegistrar?.username);
    if (exists) {
      setError("Registrar username already exists.");
      return;
    }
    const payload = { ...form, status: editingRegistrar?.status || "Active" };
    if (editingRegistrar) {
      onEditRegistrar(payload);
    } else {
      onAddRegistrar(payload);
    }
    setForm({ name: "", username: "", password: "", institution: "" });
    setEditingRegistrar(null);
    setShowForm(false);
    setError("");
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Manage Registrars</h2>
        <button onClick={openNewForm} className="bg-indigo-600 px-3 py-2 rounded text-white flex items-center gap-2">
          <UserPlus className="h-4 w-4" /> Add Registrar
        </button>
      </div>

      <div className="bg-[#071025] border border-gray-800 rounded overflow-hidden">
        <table className="w-full text-left">
          <thead className="text-gray-300">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Institution</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {registrars.map((r) => (
              <tr key={r.username} className="border-t border-gray-800 hover:bg-gray-800">
                <td className="px-4 py-3 text-white">{r.name}</td>
                <td className="px-4 py-3 text-gray-200">{r.username}</td>
                <td className="px-4 py-3 text-gray-200">{r.institution}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${r.status === "Active" ? "bg-emerald-600 text-white" : "bg-red-700 text-white"}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => openEditForm(r)} className="text-indigo-400 text-sm">Edit</button>
                    <button onClick={() => onToggleRegistrar(r)} className="text-red-400 text-sm">
                      {r.status === "Active" ? "Deactivate" : "Activate"}
                    </button>
                    <button onClick={() => onDeleteRegistrar(r)} className="text-red-600 text-sm">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {registrars.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">No registrars available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <Modal onClose={() => setShowForm(false)} title={editingRegistrar ? "Edit Registrar" : "Create Registrar"}>
          <div className="space-y-3">
            <label className="block text-sm text-gray-200">Full Name *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 bg-[#071025] border border-gray-700 rounded text-white" />
            <label className="block text-sm text-gray-200">Username *</label>
            <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="w-full px-3 py-2 bg-[#071025] border border-gray-700 rounded text-white" />
            <label className="block text-sm text-gray-200">Password {editingRegistrar ? "(leave blank to keep current)" : "*"}</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-3 py-2 bg-[#071025] border border-gray-700 rounded text-white" />
            <label className="block text-sm text-gray-200">Assign Institution *</label>
            <select value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} className="w-full px-3 py-2 bg-[#071025] border border-gray-700 rounded text-white">
              <option value="">Select institution</option>
              {institutions.map(i => <option key={i.name} value={i.name}>{i.name}</option>)}
            </select>
            {error && <div className="text-sm text-red-400">{error}</div>}
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="px-3 py-2 rounded bg-gray-700 text-gray-200">Cancel</button>
              <button onClick={handleSubmit} className="px-3 py-2 rounded bg-indigo-600 text-white flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> {editingRegistrar ? "Save" : "Create"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ---------- Logs & Reports Page ----------
function LogsReportsPage({ logs, onExportPDF }) {
  const [query, setQuery] = useState("");
  const filteredLogs = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return logs.filter((log) => {
      if (!normalized) return true;
      return [log.user, log.action, log.description, log.status]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }, [logs, query]);

  const pieData = useMemo(() => ({
    labels: ["Success", "Failed"],
    datasets: [{ data: [filteredLogs.filter((l) => l.status === "success").length, filteredLogs.filter((l) => l.status === "critical").length], backgroundColor: ["#10b981", "#ef4444"] }]
  }), [filteredLogs]);

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Institutions" value={logs.filter((log) => log.action.toLowerCase().includes("institution")).length.toString()} />
        <StatCard title="Active Registrars" value={logs.filter((log) => log.action.toLowerCase().includes("registrar")).length.toString()} />
        <StatCard title="Support Actions" value={logs.filter((log) => log.action.toLowerCase().includes("support")).length.toString()} />
        <StatCard title="Password Events" value={logs.filter((log) => log.action.toLowerCase().includes("password")).length.toString()} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Verification Results">
          <Pie data={pieData} options={{ responsive: true, plugins: { legend: { position: "bottom" } } }} />
        </Card>

        <Card title="Active System Summary">
          <div className="space-y-3 text-sm text-gray-200">
            <div className="rounded-lg bg-[#0f1724] p-4">
              <div className="text-xs uppercase text-gray-400 mb-1">Current log count</div>
              <div className="text-2xl font-semibold text-white">{filteredLogs.length}</div>
            </div>
            <div className="rounded-lg bg-[#0f1724] p-4">
              <div className="text-xs uppercase text-gray-400 mb-1">Critical alerts</div>
              <div className="text-2xl font-semibold text-white">{filteredLogs.filter((log) => log.status === "critical").length}</div>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Audit Log">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 flex-1">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter logs by user, action, description or status"
              className="w-full px-3 py-2 bg-[#071025] border border-gray-700 rounded text-white"
            />
          </div>
          <button onClick={() => onExportPDF(filteredLogs)} className="px-3 py-2 bg-indigo-600 rounded text-white">Export PDF</button>
        </div>

        <div className="overflow-auto max-h-96">
          <table className="w-full text-left">
            <thead className="text-gray-300 sticky top-0 bg-[#071025]">
              <tr>
                <th className="px-3 py-2">Timestamp</th>
                <th className="px-3 py-2">User</th>
                <th className="px-3 py-2">Action</th>
                <th className="px-3 py-2">Description</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 && (
                <tr><td colSpan={5} className="px-3 py-6 text-center text-gray-400">No logs match your filter</td></tr>
              )}
              {filteredLogs.map((l) => (
                <tr key={l.id} className={`border-t border-gray-800 hover:bg-gray-800 ${l.status === "critical" ? "bg-red-900/20" : ""}`}>
                  <td className="px-3 py-2 text-gray-200">{new Date(l.timestamp).toLocaleString()}</td>
                  <td className="px-3 py-2 text-gray-200">{l.user}</td>
                  <td className="px-3 py-2 text-white">{l.action}</td>
                  <td className="px-3 py-2 text-gray-200">{l.description}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded text-xs ${l.status === "success" ? "bg-green-700 text-white" : l.status === "warning" ? "bg-yellow-700 text-white" : l.status === "critical" ? "bg-red-700 text-white" : "bg-gray-700 text-white"}`}>
                      {l.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function SettingsPage({ currentPassword, onChangePassword }) {
  const [form, setForm] = useState({ current: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = () => {
    setSuccess("");
    if (!form.current || !form.password || !form.confirm) {
      setError("Please complete all password fields.");
      return;
    }
    if (form.current !== currentPassword) {
      setError("Current password is incorrect.");
      return;
    }
    if (form.password.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("New password and confirmation do not match.");
      return;
    }

    onChangePassword(form.password);
    setForm({ current: "", password: "", confirm: "" });
    setError("");
    setSuccess("Password updated successfully.");
  };

  return (
    <div className="max-w-[600px] mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">Settings</h2>
        <p className="text-gray-400">Manage admin credentials and keep access secure.</p>
      </div>
      <div className="bg-[#071025] border border-gray-800 rounded p-6 space-y-4">
        <div>
          <label className="block text-sm text-gray-200">Current Password</label>
          <input
            type="password"
            value={form.current}
            onChange={(e) => setForm({ ...form, current: e.target.value })}
            className="w-full px-3 py-2 bg-[#071025] border border-gray-700 rounded text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-200">New Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-3 py-2 bg-[#071025] border border-gray-700 rounded text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-200">Confirm Password</label>
          <input
            type="password"
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            className="w-full px-3 py-2 bg-[#071025] border border-gray-700 rounded text-white"
          />
        </div>
        {error && <div className="text-sm text-red-400">{error}</div>}
        {success && <div className="text-sm text-green-400">{success}</div>}
        <div className="flex justify-end">
          <button onClick={handleSubmit} className="px-4 py-2 rounded bg-indigo-600 text-white">Update Password</button>
        </div>
      </div>
    </div>
  );
}

// ---------- Support Page ----------
function SupportPage({ requests, messages, onOpenRequest, onSendResponse, onResolveRequest }) {
  const [activeRequest, setActiveRequest] = useState(null);
  const [response, setResponse] = useState("");

  const openThread = (request) => {
    setActiveRequest(request);
    onOpenRequest?.(request);
  };

  const closeThread = () => {
    setActiveRequest(null);
    setResponse("");
  };

  const handleSend = () => {
    if (!response.trim() || !activeRequest) return;
    onSendResponse(activeRequest.id, response.trim());
    setResponse("" );
  };

  const threadMessages = activeRequest ? messages.filter((m) => m.requestId === activeRequest.id) : [];

  return (
    <div className="max-w-[1200px] mx-auto space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Support Requests</h2>
          <p className="text-sm text-gray-400">Manage student inquiries, respond instantly, and keep threads in one place.</p>
        </div>
      </div>

      <div className="bg-[#071025] border border-gray-800 rounded overflow-hidden">
        <table className="w-full text-left">
          <thead className="text-gray-300">
            <tr>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Subject</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">No support requests</td></tr>
            )}
            {requests.map((req) => (
              <tr key={req.id} className="border-t border-gray-800 hover:bg-gray-800">
                <td className="px-4 py-3 text-white">{req.studentName}</td>
                <td className="px-4 py-3 text-gray-200">{req.subject}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${req.status === "new" ? "bg-red-700 text-white" : req.status === "resolved" ? "bg-slate-700 text-white" : "bg-green-700 text-white"}`}>
                    {req.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-200">{new Date(req.updatedAt).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => openThread(req)} className="text-indigo-400 text-sm">Open thread</button>
                    {req.status !== "resolved" && (
                      <button onClick={() => onResolveRequest(req.id)} className="text-green-400 text-sm">Resolve</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {activeRequest && (
        <Modal onClose={closeThread} title={`Conversation: ${activeRequest.subject}`}>
          <div className="space-y-4">
            <div className="max-h-96 overflow-y-auto rounded-lg border border-gray-800 bg-[#0b1220] p-4 space-y-3">
              {threadMessages.length === 0 && (
                <div className="text-sm text-gray-400">No conversation yet. Start by replying to the student.</div>
              )}
              {threadMessages.map((message) => (
                <div key={message.id} className={`rounded-2xl p-3 ${message.sender === "admin" ? "bg-indigo-600/10 text-white self-end" : "bg-gray-800 text-gray-200"}`}>
                  <div className="text-[11px] text-gray-400 mb-1">{message.sender === "admin" ? "Admin" : "Student"} • {new Date(message.timestamp).toLocaleString()}</div>
                  <div>{message.text}</div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-gray-200">Reply message</label>
              <textarea
                rows={4}
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                className="w-full resize-none rounded border border-gray-700 bg-[#071025] px-3 py-2 text-white"
              />
              <div className="flex justify-end gap-2">
                <button onClick={closeThread} className="px-3 py-2 rounded bg-gray-700 text-gray-200">Close</button>
                <button onClick={handleSend} className="px-3 py-2 rounded bg-indigo-600 text-white">Send reply</button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ---------- Logout Page ----------
function LogoutPage({ onConfirm }) {
  const navigate = useNavigate();
  return (
    <div className="max-w-[600px] mx-auto bg-[#071025] border border-gray-800 rounded p-6">
      <h2 className="text-lg font-semibold text-white mb-2">Confirm Logout</h2>
      <p className="text-gray-300 mb-4">Are you sure you want to log out? This action will be recorded in the audit trail.</p>
      <div className="flex gap-2">
        <button onClick={() => { onConfirm(); navigate("/"); }} className="px-3 py-2 bg-red-600 rounded text-white">Logout</button>
        <Link to="/" className="px-3 py-2 bg-gray-700 rounded text-gray-200">Cancel</Link>
      </div>
    </div>
  );
}

// ---------- Small UI Primitives ----------
function Card({ title, children }) {
  return (
    <div className="bg-[#071025] border border-gray-800 rounded p-4 text-white">
      {title && <div className="text-sm text-gray-300 font-semibold mb-3">{title}</div>}
      <div>{children}</div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="p-4 rounded bg-gradient-to-r from-[#0f1724] to-[#111827] border border-gray-800">
      <div className="text-sm text-gray-300">{title}</div>
      <div className="text-2xl font-semibold text-white">{value}</div>
    </div>
  );
}

function Modal({ children, onClose, title }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10 w-full max-w-lg bg-[#071025] border border-gray-800 rounded p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold text-white">{title}</div>
          <button onClick={onClose} className="text-gray-400">Close</button>
        </div>
        <div>{children}</div>
      </motion.div>
    </div>
  );
}

function ConfirmDialog({ title, description, open, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md rounded-xl border border-gray-800 bg-[#071025] p-6 shadow-xl">
        <div className="text-lg font-semibold text-white mb-2">{title}</div>
        <p className="text-sm text-gray-300 mb-5">{description}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-2 rounded bg-gray-700 text-gray-200">Cancel</button>
          <button onClick={onConfirm} className="px-3 py-2 rounded bg-indigo-600 text-white">Yes, continue</button>
        </div>
      </motion.div>
    </div>
  );
}

// ---------- Recent Activity & System Health small components ----------
function RecentActivity() {
  return (
    <div className="space-y-3 text-sm text-gray-200">
      <div className="flex items-start gap-3">
        <div className="h-2 w-2 rounded-full bg-indigo-500 mt-2" />
        <div>
          <div className="font-medium">Registrar account created</div>
          <div className="text-gray-400">Dr. Meron Assefa — AAU • 3 hours ago</div>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <div className="h-2 w-2 rounded-full bg-yellow-500 mt-2" />
        <div>
          <div className="font-medium">Security alert</div>
          <div className="text-gray-400">Multiple failed login attempts • 5 hours ago</div>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <div className="h-2 w-2 rounded-full bg-green-500 mt-2" />
        <div>
          <div className="font-medium">System backup completed</div>
          <div className="text-gray-400">Full DB backup • 12 hours ago</div>
        </div>
      </div>
    </div>
  );
}

function SystemHealth() {
  return (
    <div className="space-y-3 text-sm text-gray-200">
      <div>API Latency: <span className="text-white">120ms</span></div>
      <div>DB Connections: <span className="text-white">42</span></div>
      <div>Errors (24h): <span className="text-white">2</span></div>
      <div className="mt-3">
        <div className="w-full bg-gray-800 rounded h-2">
          <div className="h-2 bg-green-500" style={{ width: "92%" }} />
        </div>
      </div>
    </div>
  );
}

// ---------- App Root (single-file) ----------
export default function AdminDashboardApp() {
  const navigate = useNavigate();

  // Mock state
  const [institutions, setInstitutions] = useState([
    { name: "Addis Ababa University", location: "Addis Ababa", email: "info@aau.edu.et", status: "Active" },
    { name: "Bahir Dar University", location: "Bahir Dar", email: "info@bdu.edu.et", status: "Active" },
    { name: "Jimma University", location: "Jimma", email: "info@ju.edu.et", status: "Inactive" },
  ]);

  const [registrars, setRegistrars] = useState([
    { name: "Dr. Meron Assefa", username: "meron", institution: "Addis Ababa University", status: "Active" },
    { name: "Ato Yonas Bekele", username: "yonas", institution: "Bahir Dar University", status: "Active" },
  ]);

  const [logs, setLogs] = useState([
    { id: "1", timestamp: new Date().toISOString(), user: "system", action: "System started", description: "NILARVS backend started", status: "success" },
    { id: "2", timestamp: new Date(Date.now() - 3600 * 1000).toISOString(), user: "admin", action: "Institution added", description: "Jimma University added", status: "info" },
  ]);

  const [supportRequests, setSupportRequests] = useState(loadSupportRequests);
  const [supportMessages, setSupportMessages] = useState(loadSupportMessages);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: "n1", title: "New support request", body: "Samuel T submitted a support request", time: "2 hours ago", section: "support", unread: true },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState<"Institutions" | "Registrars" | "Logs">("Institutions");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");
  const [adminPassword, setAdminPassword] = useState("Admin@123");
  const [confirmPayload, setConfirmPayload] = useState(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(SUPPORT_REQUESTS_KEY, JSON.stringify(supportRequests));
  }, [supportRequests]);

  useEffect(() => {
    window.localStorage.setItem(SUPPORT_MESSAGES_KEY, JSON.stringify(supportMessages));
  }, [supportMessages]);

  const unreadCount = notifications.filter((note) => note.unread).length;

  const addNotification = (note: Omit<NotificationItem, "id" | "unread" | "time"> & { time?: string }) => {
    setNotifications((prev) => [
      { id: `n-${Date.now()}`, unread: true, time: note.time ?? "Just now", ...note },
      ...prev,
    ].slice(0, 12));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((note) => ({ ...note, unread: false })));
  };

  const handleOpenNotification = (note: NotificationItem) => {
    setNotifications((prev) => prev.map((item) => item.id === note.id ? { ...item, unread: false } : item));
    setIsNotificationsOpen(false);
    setActiveSection(note.section);
  };

  const normalizeQuery = (value: string) => value.trim().toLowerCase();

  const handleSearch = (query: string, filter: "Institutions" | "Registrars" | "Logs") => {
    const normalized = normalizeQuery(query);
    setSearchQuery(query);
    setSearchFilter(filter);

    if (!normalized) {
      setSearchResults([]);
      return;
    }

    const results: SearchResult[] = [];

    if (filter === "Institutions" || filter === "Logs") {
      institutions.forEach((inst) => {
        const haystack = [inst.name, inst.location, inst.email || "", inst.status].join(" ").toLowerCase();
        if (haystack.includes(normalized)) {
          results.push({
            id: `institution-${inst.name}`,
            type: "Institution",
            title: inst.name,
            subtitle: inst.location,
            detail: inst.status,
          });
        }
      });
    }

    if (filter === "Registrars" || filter === "Logs") {
      registrars.forEach((reg) => {
        const haystack = [reg.name, reg.username, reg.institution, reg.status].join(" ").toLowerCase();
        if (haystack.includes(normalized)) {
          results.push({
            id: `registrar-${reg.username}`,
            type: "Registrar",
            title: reg.name,
            subtitle: reg.username,
            detail: reg.institution,
          });
        }
      });
    }

    if (filter === "Logs") {
      logs.forEach((log) => {
        const haystack = [log.user, log.action, log.description, log.status].join(" ").toLowerCase();
        if (haystack.includes(normalized)) {
          results.push({
            id: `log-${log.id}`,
            type: "Log",
            title: log.action,
            subtitle: log.user,
            detail: log.description,
          });
        }
      });
    }

    setSearchResults(results.slice(0, 12));
  };

  const addInstitution = (inst) => {
    setInstitutions((prev) => [inst, ...prev]);
    auditLogPush(setLogs, { user: "admin", action: "Institution added", description: inst.name, status: "success" });
    addNotification({ title: "Institution added", body: inst.name, section: "institutions" });
  };

  const editInstitution = (inst) => {
    setInstitutions((prev) => prev.map((item) => (item.name === inst.name ? inst : item)));
    auditLogPush(setLogs, { user: "admin", action: "Institution edited", description: inst.name, status: "success" });
    addNotification({ title: "Institution updated", body: inst.name, section: "institutions" });
  };

  const doToggleInstitution = (inst) => {
    setInstitutions((prev) => prev.map((item) => (item.name === inst.name ? { ...item, status: item.status === "Active" ? "Inactive" : "Active" } : item)));
    auditLogPush(setLogs, {
      user: "admin",
      action: inst.status === "Active" ? "Institution deactivated" : "Institution activated",
      description: inst.name,
      status: "success",
    });
    addNotification({ title: "Institution status updated", body: inst.name, section: "institutions" });
  };

  const addRegistrar = (reg) => {
    setRegistrars((prev) => [reg, ...prev]);
    auditLogPush(setLogs, { user: "admin", action: "Registrar added", description: `${reg.name} (${reg.username})`, status: "success" });
    addNotification({ title: "Registrar added", body: reg.username, section: "registrars" });
  };

  const editRegistrar = (reg) => {
    setRegistrars((prev) => prev.map((item) => (item.username === reg.username ? reg : item)));
    auditLogPush(setLogs, { user: "admin", action: "Registrar edited", description: reg.username, status: "success" });
    addNotification({ title: "Registrar updated", body: reg.username, section: "registrars" });
  };

  const doToggleRegistrar = (reg) => {
    setRegistrars((prev) => prev.map((item) => (item.username === reg.username ? { ...item, status: item.status === "Active" ? "Inactive" : "Active" } : item)));
    auditLogPush(setLogs, {
      user: "admin",
      action: reg.status === "Active" ? "Registrar deactivated" : "Registrar activated",
      description: reg.username,
      status: "success",
    });
    addNotification({ title: "Registrar status updated", body: reg.username, section: "registrars" });
  };

  const deleteRegistrar = (reg) => {
    setRegistrars((prev) => prev.filter((item) => item.username !== reg.username));
    auditLogPush(setLogs, { user: "admin", action: "Registrar deleted", description: reg.username, status: "critical" });
    addNotification({ title: "Registrar deleted", body: reg.username, section: "registrars" });
  };

  const openSupportRequest = (request) => {
    setSupportRequests((prev) => prev.map((item) => (item.id === request.id ? { ...item, status: item.status === "new" ? "responded" : item.status, updatedAt: new Date().toISOString() } : item)));
  };

  const sendSupportResponse = (requestId, text) => {
    setSupportMessages((prev) => [
      ...prev,
      { id: `m-${Date.now()}`, requestId, sender: "admin", text, timestamp: new Date().toISOString() },
    ]);
    setSupportRequests((prev) => prev.map((item) => (item.id === requestId ? { ...item, status: "responded", updatedAt: new Date().toISOString() } : item)));
    auditLogPush(setLogs, { user: "admin", action: "Support responded", description: requestId, status: "success" });
    addNotification({ title: "Support reply sent", body: `Response sent for ${requestId}`, section: "support" });
  };

  const resolveSupportRequest = (requestId) => {
    setSupportRequests((prev) => prev.map((item) => (item.id === requestId ? { ...item, status: "resolved", updatedAt: new Date().toISOString() } : item)));
    auditLogPush(setLogs, { user: "admin", action: "Support resolved", description: requestId, status: "success" });
    addNotification({ title: "Support request resolved", body: `Request ${requestId} resolved`, section: "support" });
  };

  const exportPDF = (filteredLogs) => {
    const blob = buildPdfBlob("NILARVS Audit Log Export", filteredLogs);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `nilarvs-audit-${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    auditLogPush(setLogs, { user: "admin", action: "Export Logs PDF", description: `Exported ${filteredLogs.length} rows`, status: "success" });
  };

  const changePassword = (newPassword) => {
    setAdminPassword(newPassword);
    auditLogPush(setLogs, { user: "admin", action: "Password changed", description: "Admin password updated", status: "success" });
  };

  const requestConfirmation = (payload) => setConfirmPayload(payload);
  const clearConfirmation = () => setConfirmPayload(null);
  const confirmAction = () => {
    if (confirmPayload?.action) {
      confirmPayload.action();
    }
    clearConfirmation();
  };

  const openLogoutConfirmation = () => {
    requestConfirmation({
      title: "Confirm logout",
      description: "Are you sure you want to logout from the admin console?",
      action: () => {
        auditLogPush(setLogs, { user: "admin", action: "Logout", description: "Admin logged out", status: "info" });
        window.localStorage.removeItem("nilarvs-admin-session");
        window.localStorage.removeItem("nilarvs-auth-token");
        setActiveSection("dashboard");
        navigate("/");
      },
    });
  };

  const confirmLogout = () => {
    auditLogPush(setLogs, { user: "admin", action: "Logout", description: "Admin logged out", status: "info" });
    window.localStorage.removeItem("nilarvs-admin-session");
    window.localStorage.removeItem("nilarvs-auth-token");
    setActiveSection("dashboard");
    navigate("/");
  };

  const stats = [
    { label: "Institutions", value: institutions.length, icon: Building2 },
    { label: "Registrars", value: registrars.length, icon: Users },
    { label: "Support threads", value: supportRequests.length, icon: LifeBuoy },
    { label: "Audit entries", value: logs.length, icon: FileText },
  ];

  return (
    <div className="flex min-h-screen bg-[#05070a] text-white">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onLogout={openLogoutConfirmation}
        supportBadgeCount={supportRequests.filter((r) => r.status === "new").length}
        alertsCount={logs.filter((l) => l.status === "critical").length}
      />
      <div className="flex-1 ml-72">
        <Header
          notifications={notifications}
          unreadCount={unreadCount}
          isNotificationsOpen={isNotificationsOpen}
          onToggleNotifications={() => setIsNotificationsOpen((prev) => !prev)}
          onOpenNotification={(note) => handleOpenNotification(note)}
          onMarkAllRead={markAllNotificationsRead}
        />

        <main className="p-6">
          {activeSection === "dashboard" && (
            <DashboardPage
              stats={stats}
              searchQuery={searchQuery}
              searchFilter={searchFilter}
              searchResults={searchResults}
              onSearch={handleSearch}
              onClearSearch={() => handleSearch("", searchFilter)}
            />
          )}
          {activeSection === "institutions" && (
            <InstitutionsPage
              institutions={institutions}
              onAddInstitution={addInstitution}
              onEditInstitution={editInstitution}
              onToggleInstitution={(inst) => requestConfirmation({
                title: `${inst.status === "Active" ? "Deactivate" : "Activate"} institution?`,
                description: `Confirm ${inst.status === "Active" ? "deactivation" : "activation"} for ${inst.name}.`,
                action: () => doToggleInstitution(inst),
              })}
            />
          )}
          {activeSection === "registrars" && (
            <RegistrarsPage
              registrars={registrars}
              institutions={institutions}
              onAddRegistrar={addRegistrar}
              onEditRegistrar={editRegistrar}
              onToggleRegistrar={(reg) => requestConfirmation({
                title: `${reg.status === "Active" ? "Deactivate" : "Activate"} registrar?`,
                description: `Confirm ${reg.status === "Active" ? "deactivation" : "activation"} for ${reg.username}.`,
                action: () => doToggleRegistrar(reg),
              })}
              onDeleteRegistrar={(reg) => requestConfirmation({
                title: "Delete registrar?",
                description: `This will permanently remove ${reg.username}.`,
                action: () => deleteRegistrar(reg),
              })}
            />
          )}
          {activeSection === "logs" && <LogsReportsPage logs={logs} onExportPDF={exportPDF} />}
          {activeSection === "support" && (
            <SupportPage
              requests={supportRequests}
              messages={supportMessages}
              onOpenRequest={openSupportRequest}
              onSendResponse={sendSupportResponse}
              onResolveRequest={resolveSupportRequest}
            />
          )}
          {activeSection === "settings" && <SettingsPage currentPassword={adminPassword} onChangePassword={changePassword} />}
        </main>
      </div>

      <ConfirmDialog
        open={Boolean(confirmPayload)}
        title={confirmPayload?.title}
        description={confirmPayload?.description}
        onConfirm={confirmAction}
        onCancel={clearConfirmation}
      />
    </div>
  );
}