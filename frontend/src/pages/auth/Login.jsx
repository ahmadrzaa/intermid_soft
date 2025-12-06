// frontend/src/pages/auth/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import FloatingTools from "../../components/FloatingTools"; // floating WhatsApp + Agent

// reuse same header / fonts as Home
import "../Home/home.css";
import "./auth.css";

const APP_NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", to: "/app/dashboard" },
  { key: "cheques", label: "Cheques", to: "/app/checks" },
  { key: "approvals", label: "Approvals", to: "/app/approvals" },
  { key: "history", label: "History", to: "/app/history" },
  { key: "settings", label: "Settings", to: "/app/settings" },
];

function MarketingHeader() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAuthed = !!user;

  const handleAppNavClick = (to) => {
    if (!isAuthed) {
      navigate("/login");
      return;
    }
    navigate(to);
  };

  return (
    <header className="home-nav">
      <div className="home-container home-nav-inner">
        {/* CHEQUE SOFTWARE text logo */}
        <Link to="/" className="home-brand">
          <div className="home-brand-mark">CS</div>
          <div className="home-brand-text-block">
            <div className="home-brand-title">CHEQUE SOFTWARE</div>
            <div className="home-brand-subtitle">Cloud cheque printing</div>
          </div>
        </Link>

        {/* App nav items (if not logged in they just keep user on auth) */}
        <nav className="home-menu">
          {APP_NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              type="button"
              className="home-menu-link"
              onClick={() => handleAppNavClick(item.to)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="home-nav-right">
          {/* already on login but nice to keep link */}
          <Link to="/login" className="home-login-link">
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Login() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  // role switch – Admin / Manager / Staff
  const [activeRole, setActiveRole] = useState("Admin");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);

    try {
      await login({
        email: email.trim().toLowerCase(),
        password,
        remember,
        role: activeRole,
      });

      // go to dashboard after success
      window.location.href = "/app/dashboard";
    } catch (ex) {
      setErr(ex?.response?.data?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-root">
      <MarketingHeader />

      <main className="auth-main">
        <div className="auth-card">
          <p className="auth-heading">Log in to start printing cheques</p>

          {/* role switch pills */}
          <div className="auth-role-switch" role="tablist">
            {["Admin", "Manager", "Staff"].map((role) => (
              <button
                key={role}
                type="button"
                className={
                  "auth-role-pill" + (activeRole === role ? " is-active" : "")
                }
                onClick={() => setActiveRole(role)}
              >
                {role}
              </button>
            ))}
          </div>
          <p className="auth-role-note">
            You are logging in as <strong>{activeRole}</strong>.
          </p>

          <form className="auth-form" onSubmit={onSubmit} noValidate>
            {/* Email */}
            <div className="auth-field">
              <span className="auth-label">E-mail</span>
              <div className="input-line">
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                  inputMode="email"
                />
                <span className="input-icon-right">✉</span>
              </div>
            </div>

            {/* Password */}
            <div className="auth-field">
              <span className="auth-label">Password</span>
              <div className="input-line">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  minLength={6}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {err && <div className="auth-error">{err}</div>}

            {/* Remember + button row */}
            <div className="auth-row">
              <label className="auth-checkbox">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Remember Me</span>
              </label>

              <button
                type="submit"
                className="auth-btn auth-btn-primary"
                disabled={busy}
              >
                {busy ? "Logging in…" : "Log In"}
              </button>
            </div>
          </form>

          <button type="button" className="auth-link-button">
            Forget password ?
          </button>

          <div className="auth-separator">- OR -</div>

          <div className="auth-link-row">
            <span>Don't have an account ? </span>
            <Link to="/register">Register Now</Link>
          </div>
        </div>
      </main>

      <footer className="auth-footer">
        © {new Date().getFullYear()} Cheque Software
      </footer>

      {/* floating WhatsApp + AI Agent visible on login */}
      <FloatingTools />
    </div>
  );
}
