// frontend/src/pages/Home/index.jsx
import { Link } from "react-router-dom";
import "./home.css";
import FloatingTools from "../../components/FloatingTools"; // 👈 use existing dock

export default function Home() {
  return (
    <div className="home-root">
      {/* TOP NAVBAR – shared with login/register */}
      <header className="home-nav">
        <div className="home-container home-nav-inner">
          {/* Logo goes back to home */}
          <Link to="/" className="home-brand">
            <img
              src="/intermid-01.svg"
              alt="INTERMID"
              className="home-brand-logo"
            />
          </Link>

          {/* Center menu (static for now) */}
          <nav className="home-menu">
            <button type="button" className="home-menu-link">
              FEATURES
            </button>
            <button type="button" className="home-menu-link">
              APPROVAL FLOW
            </button>
            <button type="button" className="home-menu-link">
              CHECK LAYOUTS
            </button>
            <button type="button" className="home-menu-link">
              PRICING
            </button>
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

            {/* GET STARTED goes to login */}
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

      {/* 👇 FLOATING WHATSAPP + AI AGENT ON HOME */}
      <FloatingTools />
    </div>
  );
}
