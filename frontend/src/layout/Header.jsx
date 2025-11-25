// frontend/src/layout/Header.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import "./header.css";

export default function Header({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const name = user?.name || "User";
  const firstName = name.split(" ")[0];
  const role = user?.role || "Staff";

  const initials =
    name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  const handleLogout = () => {
    setOpen(false);
    if (typeof logout === "function") {
      logout();
    }
  };

  return (
    <header className="app-header">
      {/* LEFT: burger + logo (logo only, no text) */}
      <div className="header-left">
        <button
          type="button"
          className="header-burger"
          aria-label="Toggle menu"
          onClick={onToggleSidebar}
        >
          <span />
          <span />
          <span />
        </button>

        <Link
          to="/dashboard"
          className="header-logo-link"
          aria-label="INTERMID"
        >
          <img
            src="/intermid-01.svg"
            alt="INTERMID logo"
            className="header-logo-img"
          />
        </Link>
      </div>

      {/* CENTER: rectangular search bar like example */}
      <div className="header-center">
        <div className="header-search">
          <span className="header-search-icon">🔍</span>
          <input
            type="text"
            className="header-search-input"
            placeholder="Search cheques, beneficiaries…"
          />
        </div>
      </div>

      {/* RIGHT: currency / language + user profile */}
      <div className="header-right">
        <div className="header-select-wrap">
          <select className="header-select">
            <option value="BHD">BHD</option>
          </select>
          <select className="header-select">
            <option value="en">English</option>
            <option value="ar">Arabic</option>
          </select>
        </div>

        <div className="header-user">
          <button
            type="button"
            className="header-user-btn"
            onClick={() => setOpen((v) => !v)}
          >
            <div className="header-avatar">{initials}</div>
            <div className="header-user-text">
              <div className="header-user-name">{firstName}</div>
              <div className="header-user-role">{role}</div>
            </div>
            <span className="header-caret">▾</span>
          </button>

          {open && (
            <div className="header-user-menu">
              <button
                type="button"
                className="header-user-menu-item"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
