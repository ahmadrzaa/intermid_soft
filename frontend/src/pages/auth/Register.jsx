// frontend/src/pages/auth/Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import FloatingTools from "../../components/FloatingTools"; // floating WhatsApp + Agent

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
          <Link to="/login" className="home-login-link">
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Register() {
  const { register, login } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [dialCode, setDialCode] = useState("+973");
  const [mobile, setMobile] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    if (!firstName.trim() || !email.trim() || !password) {
      setErr("Please fill in all required fields.");
      return;
    }

    const name = `${firstName.trim()} ${lastName.trim()}`.trim();
    const fullMobile = mobile ? `${dialCode} ${mobile.trim()}` : "";

    setBusy(true);
    try {
      // default first user as Admin; can change later in settings
      await register({
        name,
        email: email.trim().toLowerCase(),
        mobile: fullMobile,
        company: company.trim(),
        password,
        role: "Admin",
      });

      await login({
        email: email.trim().toLowerCase(),
        password,
      });

      window.location.href = "/app/dashboard";
    } catch (ex) {
      setErr(ex?.response?.data?.message || "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-root">
      <MarketingHeader />

      <main className="auth-main">
        <div className="auth-card">
          <p className="auth-heading">Register for a new account</p>

          <form className="auth-form" onSubmit={onSubmit} noValidate>
            {/* First / last name */}
            <div className="auth-grid-2">
              <div className="auth-field">
                <span className="auth-label">First Name</span>
                <div className="input-line">
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    required
                  />
                  <span className="input-icon-right">👤</span>
                </div>
              </div>

              <div className="auth-field">
                <span className="auth-label">Last Name</span>
                <div className="input-line">
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                  />
                  <span className="input-icon-right">👤</span>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="auth-field">
              <span className="auth-label">E-mail</span>
              <div className="input-line">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  autoComplete="username"
                />
                <span className="input-icon-right">✉</span>
              </div>
            </div>

            {/* Password */}
            <div className="auth-field">
              <span className="auth-label">Choose Password</span>
              <div className="input-line">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  autoComplete="new-password"
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

            {/* Country code + mobile */}
            <div className="auth-field">
              <span className="auth-label">Mobile</span>
              <div className="auth-inline">
                <div className="input-line">
                  <select
                    value={dialCode}
                    onChange={(e) => setDialCode(e.target.value)}
                  >
                    <option value="+973">Bahrain (+973)</option>
                    <option value="+971">UAE (+971)</option>
                    <option value="+966">Saudi (+966)</option>
                  </select>
                </div>

                <div className="input-line">
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="3333 3333"
                  />
                </div>
              </div>
            </div>

            {/* Company */}
            <div className="auth-field">
              <span className="auth-label">Company name</span>
              <div className="input-line">
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Company name"
                />
                <span className="input-icon-right">🌐</span>
              </div>
            </div>

            {err && <div className="auth-error">{err}</div>}

            <button
              type="submit"
              className="auth-btn auth-btn-primary"
              disabled={busy}
            >
              {busy ? "Registering…" : "Register"}
            </button>

            <p className="auth-terms">
              By clicking Register, you agree to our{" "}
              <button type="button">Terms</button> and{" "}
              <button type="button">Privacy Policy</button>.
            </p>

            <div className="auth-separator">- OR -</div>

            <div className="auth-link-row">
              <span>Already have an account ? </span>
              <Link to="/login">Login</Link>
            </div>
          </form>
        </div>
      </main>

      <footer className="auth-footer">
        © {new Date().getFullYear()} Cheque Software
      </footer>

      {/* floating WhatsApp + AI Agent visible on register */}
      <FloatingTools />
    </div>
  );
}
