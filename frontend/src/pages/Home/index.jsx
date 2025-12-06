// frontend/src/pages/Home/index.jsx
import { Link, useNavigate } from "react-router-dom";
import "./home.css";
import FloatingTools from "../../components/FloatingTools";
import { useAuth } from "../../AuthContext";

const APP_NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", to: "/app/dashboard" },
  { key: "cheques", label: "Cheques", to: "/app/checks" },
  { key: "approvals", label: "Approvals", to: "/app/approvals" },
  { key: "history", label: "History", to: "/app/history" },
  { key: "settings", label: "Settings", to: "/app/settings" },
];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAuthed = !!user;

  const handleAppNavClick = (to) => {
    // if not logged in, always go to login
    if (!isAuthed) {
      navigate("/login");
      return;
    }
    navigate(to);
  };

  return (
    <div className="home-root">
      {/* TOP NAVBAR – branding + login */}
      <header className="home-nav">
        <div className="home-container home-nav-inner">
          {/* Brand – CHEQUE SOFTWARE text logo */}
          <Link to="/" className="home-brand">
            <div className="home-brand-mark">CS</div>
            <div className="home-brand-text-block">
              <div className="home-brand-title">CHEQUE SOFTWARE</div>
              <div className="home-brand-subtitle">
                Cloud cheque printing
              </div>
            </div>
          </Link>

          {/* Center menu – app sections (go to login if not signed in) */}
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

          {/* Right side: LOGIN link */}
          <div className="home-nav-right">
            <Link to="/login" className="home-login-link">
              LOGIN
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="home-hero">
        <div className="home-container home-hero-inner">
          <div className="home-copy">
            <p className="home-tagline">Cloud check printing software</p>
            <h1 className="home-title">
              Prepare. Approve. <span>Print.</span>
            </h1>
            <p className="home-subtitle">
              A modern, cloud-based platform for secure check preparation,
              manager approvals, automatic receivable slips and full check
              history from any device, using any bank layout or printer.
            </p>

            {/* GET STARTED → login */}
            <Link to="/login" className="home-cta">
              Get Started
            </Link>

            <p className="home-footnote">
              Works on Windows, Mac, Android and iOS. Multi-user roles for
              Admin, Manager and Staff.
            </p>
          </div>

          <div className="home-visual">
            <img
              src="/images/home-desk-printer.gif"
              alt="Check printing workspace"
              className="home-visual-img"
            />
          </div>
        </div>
      </main>

      {/* Floating WhatsApp + AI agent on home */}
      <FloatingTools />
    </div>
  );
}
