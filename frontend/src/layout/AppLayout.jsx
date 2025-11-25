// src/layout/AppLayout.jsx
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import "./app-layout.css";

// Feather-style icons
import {
  FiHome,
  FiFileText,
  FiCheckSquare,
  FiClock,
  FiUsers,
  FiSettings,
  FiSearch,
  FiUser,
} from "react-icons/fi";

import FloatingTools from "../components/FloatingTools";

const MAIN_ITEMS = [
  {
    key: "dashboard",
    label: "Dashboard",
    to: "/app/dashboard",
    icon: FiHome,
  },
  {
    key: "cheques",
    label: "Cheques",
    to: "/app/checks",
    icon: FiFileText,
  },
  {
    key: "approvals",
    label: "Approvals",
    to: "/app/approvals",
    icon: FiCheckSquare,
  },
  {
    key: "history",
    label: "History",
    to: "/app/history",
    icon: FiClock,
  },
  {
    key: "beneficiaries",
    label: "Beneficiaries",
    to: "/app/beneficiaries",
    icon: FiUsers,
  },
];

const SETTINGS_ITEMS = [
  {
    key: "settings",
    label: "Settings",
    to: "/app/settings",
    icon: FiSettings,
  },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  async function handleLogout() {
    await logout();
    setUserMenuOpen(false);
    // 🔁 After logout go to HOME page (brand landing), not /login
    navigate("/", { replace: true });
  }

  return (
    <div className="app-shell">
      {/* TOP BAR */}
      <header className="app-topbar">
        <div className="app-topbar-left">
          <button
            className="app-menu-toggle"
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            ☰
          </button>

          <a href="/app/dashboard" className="app-brand">
            <img
              src="/intermid-01.svg"
              alt="INTERMID"
              className="app-brand-logo"
            />
          </a>
        </div>

        {/* SEARCH – small bar with icon on the RIGHT */}
        <div className="app-topbar-center">
          <div className="app-search">
            <input
              type="text"
              className="app-search-input"
              placeholder="Search cheques, beneficiaries..."
            />
            <FiSearch className="app-search-icon" />
          </div>
        </div>

        {/* USER ICON + DROPDOWN */}
        <div className="app-topbar-right">
          <div className="app-user">
            <button
              type="button"
              className="app-user-button"
              onClick={() => setUserMenuOpen((v) => !v)}
              aria-label="Account menu"
            >
              <FiUser className="app-user-button-icon" />
            </button>

            {userMenuOpen && (
              <div className="app-user-menu">
                <div className="app-user-menu-name">
                  {user?.name || "User"}
                </div>
                <div className="app-user-menu-role">
                  {user?.role || "Admin"}
                </div>
                <button
                  type="button"
                  className="app-user-menu-logout"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* BODY: SIDEBAR + MAIN CONTENT */}
      <div className="app-body">
        {/* BACKDROP FOR MOBILE */}
        {sidebarOpen && (
          <div
            className="app-sidebar-backdrop"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* SIDEBAR */}
        <aside
          className={sidebarOpen ? "app-sidebar is-open" : "app-sidebar"}
        >
          <div className="app-sidebar-inner">
            <div className="app-sidebar-section-label">MAIN NAVIGATION</div>
            <nav className="app-nav">
              {MAIN_ITEMS.map(({ key, label, to, icon: Icon }) => (
                <NavLink
                  key={key}
                  to={to}
                  className={({ isActive }) =>
                    "app-nav-link" + (isActive ? " is-active" : "")
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="app-nav-icon-wrap">
                    <Icon className="app-nav-icon" />
                  </span>
                  <span className="app-nav-label">{label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="app-sidebar-section-label">SETTINGS</div>
            <nav className="app-nav">
              {SETTINGS_ITEMS.map(({ key, label, to, icon: Icon }) => (
                <NavLink
                  key={key}
                  to={to}
                  className={({ isActive }) =>
                    "app-nav-link" + (isActive ? " is-active" : "")
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="app-nav-icon-wrap">
                    <Icon className="app-nav-icon" />
                  </span>
                  <span className="app-nav-label">{label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="app-main">
          <Outlet />
        </main>
      </div>

      {/* Floating WhatsApp + AI agent */}
      <FloatingTools />
    </div>
  );
}
