// src/layout/AppLayout.jsx
import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import "./app-layout.css";

import {
  FiHome,
  FiFileText,
  FiCheckSquare,
  FiClock,
  FiUsers,
  FiSettings,
  FiSearch,
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

// same key used in Settings page
const PROFILE_STORAGE_KEY = "chequeApp_profile_v1";

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // profile + company data loaded from localStorage
  const [profile, setProfile] = useState({
    name: user?.name || "",
    companyName: user?.companyName || "",
    profileImageDataUrl: "",
    companyLogoDataUrl: "",
  });

  const role = user?.role || "Admin";
  const displayName = profile.name || user?.name || "User";

  const brandName =
    profile.companyName || user?.companyName || "Cheque Software";

  const initials =
    (displayName || "U")
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  // read from localStorage
  function loadProfileFromStorage() {
    try {
      const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (!raw) {
        setProfile((prev) => ({
          ...prev,
          name: user?.name || prev.name,
          companyName: user?.companyName || prev.companyName,
        }));
        return;
      }
      const stored = JSON.parse(raw);
      setProfile({
        name: stored.name || user?.name || "",
        companyName: stored.companyName || user?.companyName || "",
        profileImageDataUrl: stored.profileImageDataUrl || "",
        companyLogoDataUrl: stored.companyLogoDataUrl || "",
      });
    } catch {
      setProfile((prev) => ({
        ...prev,
        name: user?.name || prev.name,
        companyName: user?.companyName || prev.companyName,
      }));
    }
  }

  // initial load + whenever user object changes
  useEffect(() => {
    loadProfileFromStorage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.name, user?.companyName]);

  // listen for custom event fired from Settings after Save
  useEffect(() => {
    const handler = () => loadProfileFromStorage();
    window.addEventListener("chequeProfileUpdated", handler);
    return () => window.removeEventListener("chequeProfileUpdated", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLogout() {
    await logout();
    setUserMenuOpen(false);
    navigate("/", { replace: true });
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    const q = searchTerm.trim();
    if (!q) return;
    navigate(`/app/history?q=${encodeURIComponent(q)}`);
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

          {/* Brand: company logo + name */}
          <button
            type="button"
            className="app-brand app-brand-text"
            onClick={() => navigate("/app/dashboard")}
          >
            {profile.companyLogoDataUrl && (
              <span className="app-brand-logo-wrap">
                <img
                  src={profile.companyLogoDataUrl}
                  alt={brandName}
                  className="app-brand-logo-img"
                />
              </span>
            )}
            <span className="app-brand-title">{brandName}</span>
          </button>
        </div>

        {/* SEARCH – global search */}
        <div className="app-topbar-center">
          <form className="app-search" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              className="app-search-input"
              placeholder="Search cheques, beneficiaries…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              type="submit"
              className="app-search-icon-btn"
              aria-label="Search"
            >
              <FiSearch className="app-search-icon" />
            </button>
          </form>
        </div>

        {/* USER ICON + MENU */}
        <div className="app-topbar-right">
          <div className="app-user">
            <button
              type="button"
              className="app-user-button app-user-button-avatar"
              onClick={() => setUserMenuOpen((v) => !v)}
              aria-label="Account menu"
            >
              {profile.profileImageDataUrl ? (
                <img
                  src={profile.profileImageDataUrl}
                  alt={displayName}
                  className="app-user-avatar-img"
                />
              ) : (
                <span className="app-user-avatar-initials">
                  {initials}
                </span>
              )}
            </button>

            {userMenuOpen && (
              <div className="app-user-menu">
                <div className="app-user-menu-header">
                  <div className="app-user-menu-avatar-small">
                    {profile.profileImageDataUrl ? (
                      <img
                        src={profile.profileImageDataUrl}
                        alt={displayName}
                      />
                    ) : (
                      <span>{initials}</span>
                    )}
                  </div>
                  <div>
                    <div className="app-user-menu-name">{displayName}</div>
                    <div className="app-user-menu-role">{role}</div>
                  </div>
                </div>

                <button
                  type="button"
                  className="app-user-menu-edit"
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate("/app/settings");
                  }}
                >
                  <span>✏</span>
                  <span>Edit profile &amp; company logo</span>
                </button>

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
