// frontend/src/layout/Header.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import "./header.css";

export default function Header({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");

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

  const companyName = user?.companyName || "Cheque Software";

  const handleLogout = () => {
    setOpen(false);
    if (typeof logout === "function") {
      logout();
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = term.trim();
    if (!q) return;
    navigate(`/history?q=${encodeURIComponent(q)}`);
  };

  return (
    <header className="app-header">
      {/* LEFT: burger + brand text */}
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
          aria-label={companyName}
        >
          <span className="header-logo-text">{companyName}</span>
        </Link>
      </div>

      {/* CENTER: search */}
      <div className="header-center">
        <form className="header-search" onSubmit={handleSearchSubmit}>
          <span className="header-search-icon">🔍</span>
          <input
            type="text"
            className="header-search-input"
            placeholder="Search cheques, beneficiaries…"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
        </form>
      </div>

      {/* RIGHT: user section stays same */}
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
