// frontend/src/pages/Settings/index.jsx
import { useAuth } from "../../AuthContext";
import "./settings.css";

export default function SettingsPage() {
  const { user, theme, setTheme } = useAuth();

  const name = user?.name || "-";
  const email = user?.email || "-";
  const mobile = user?.mobile || "-";
  const role = user?.role || "Admin";

  return (
    <div className="settings-root">
      {/* HEADER */}
      <header className="settings-header">
        <div className="settings-kicker">Settings</div>
        <h1 className="settings-title">Account &amp; preferences</h1>
        <p className="settings-subtitle">
          Manage your profile details and how the cheque app looks on your
          screen.
        </p>
      </header>

      {/* GRID: PROFILE + PREFERENCES */}
      <div className="settings-grid">
        {/* PROFILE CARD */}
        <section className="settings-card">
          <h2 className="settings-card-title">Profile</h2>
          <p className="settings-card-sub">
            Your login identity inside the cheque system.
          </p>

          <table className="settings-profile-table">
            <tbody>
              <tr>
                <td className="settings-profile-label">Name</td>
                <td className="settings-profile-value">{name}</td>
              </tr>
              <tr>
                <td className="settings-profile-label">Email</td>
                <td className="settings-profile-value">{email}</td>
              </tr>
              <tr>
                <td className="settings-profile-label">Mobile</td>
                <td className="settings-profile-value">{mobile}</td>
              </tr>
              <tr>
                <td className="settings-profile-label">Role</td>
                <td className="settings-profile-value">{role}</td>
              </tr>
            </tbody>
          </table>

          <p className="settings-footnote">
            Role controls what you can do.{" "}
            <strong>Only Manager / Admin</strong> can approve or cancel
            cheques. All users can prepare and edit cheques.
          </p>
        </section>

        {/* PREFERENCES CARD */}
        <section className="settings-card">
          <h2 className="settings-card-title">Preferences</h2>
          <p className="settings-card-sub">
            Choose the look &amp; feel that is comfortable for daily use.
          </p>

          {/* THEME TOGGLE */}
          <div className="settings-group">
            <div className="settings-label">Theme</div>
            <div className="settings-theme-toggle">
              <button
                type="button"
                className={
                  "settings-pill" + (theme === "light" ? " is-active" : "")
                }
                onClick={() => setTheme("light")}
              >
                Light
              </button>
              <button
                type="button"
                className={
                  "settings-pill" + (theme === "dark" ? " is-active" : "")
                }
                onClick={() => setTheme("dark")}
              >
                Dark
              </button>
            </div>
            <p className="settings-helper">
              Theme is saved on this device and applied across the whole app.
            </p>
          </div>

          {/* CHEQUE RULES */}
          <div className="settings-group">
            <div className="settings-label">Cheque behaviour</div>
            <ul className="settings-list">
              <li>All users can prepare and edit cheques.</li>
              <li>
                <strong>Manager / Admin</strong> approve and cancel cheques in
                the Approvals section.
              </li>
              <li>
                History keeps a permanent log of all printed / approved cheques.
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
