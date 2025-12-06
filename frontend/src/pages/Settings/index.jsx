// frontend/src/pages/Settings/index.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../../AuthContext";
import "./settings.css";

const STORAGE_KEY = "chequeApp_profile_v1";

export default function SettingsPage() {
  const { user, theme, setTheme } = useAuth();

  const baseName = user?.name || "";
  const baseEmail = user?.email || "";
  const baseMobile = user?.mobile || "";
  const baseRole = user?.role || "Admin";

  const [form, setForm] = useState({
    name: baseName,
    email: baseEmail,
    mobile: baseMobile,
    address: "",
    companyName: "",
    companyAddress: "",
    companyCr: "",
    profileImageDataUrl: "",
    companyLogoDataUrl: "",
  });

  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  // load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setForm((prev) => ({
          ...prev,
          name: baseName,
          email: baseEmail,
          mobile: baseMobile,
        }));
        return;
      }
      const stored = JSON.parse(raw);
      setForm((prev) => ({
        ...prev,
        name: stored.name || baseName,
        email: baseEmail || stored.email || "",
        mobile: stored.mobile || baseMobile,
        address: stored.address || "",
        companyName: stored.companyName || "",
        companyAddress: stored.companyAddress || "",
        companyCr: stored.companyCr || "",
        profileImageDataUrl: stored.profileImageDataUrl || "",
        companyLogoDataUrl: stored.companyLogoDataUrl || "",
      }));
    } catch {
      setForm((prev) => ({
        ...prev,
        name: baseName,
        email: baseEmail,
        mobile: baseMobile,
      }));
    }
  }, [baseName, baseEmail, baseMobile]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleFileChange(e, key) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      setForm((prev) => ({ ...prev, [key]: dataUrl }));
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveImage(key) {
    setForm((prev) => ({ ...prev, [key]: "" }));
  }

  function handleResetProfile() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setForm({
          name: baseName,
          email: baseEmail,
          mobile: baseMobile,
          address: "",
          companyName: "",
          companyAddress: "",
          companyCr: "",
          profileImageDataUrl: "",
          companyLogoDataUrl: "",
        });
        return;
      }
      const stored = JSON.parse(raw);
      setForm({
        name: stored.name || baseName,
        email: baseEmail || stored.email || "",
        mobile: stored.mobile || baseMobile,
        address: stored.address || "",
        companyName: stored.companyName || "",
        companyAddress: stored.companyAddress || "",
        companyCr: stored.companyCr || "",
        profileImageDataUrl: stored.profileImageDataUrl || "",
        companyLogoDataUrl: stored.companyLogoDataUrl || "",
      });
    } catch {
      setForm({
        name: baseName,
        email: baseEmail,
        mobile: baseMobile,
        address: "",
        companyName: "",
        companyAddress: "",
        companyCr: "",
        profileImageDataUrl: "",
        companyLogoDataUrl: "",
      });
    }
  }

  function handleSaveProfile(e) {
    e.preventDefault();

    const payload = {
      name: form.name.trim(),
      email: form.email || baseEmail,
      mobile: form.mobile.trim(),
      address: form.address.trim(),
      companyName: form.companyName.trim(),
      companyAddress: form.companyAddress.trim(),
      companyCr: form.companyCr.trim(),
      profileImageDataUrl: form.profileImageDataUrl || "",
      companyLogoDataUrl: form.companyLogoDataUrl || "",
    };

    setSaving(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      // tell AppLayout to refresh logo/avatar
      window.dispatchEvent(new Event("chequeProfileUpdated"));
      setSavedMsg("Profile saved.");
      setTimeout(() => setSavedMsg(""), 2500);
    } finally {
      setSaving(false);
    }
  }

  const initials =
    (form.name || baseName || "U")
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <div className="settings-root">
      {/* HEADER */}
      <header className="settings-header">
        <div className="settings-kicker">Settings</div>
        <h1 className="settings-title">Account &amp; company profile</h1>
        <p className="settings-subtitle">
          Set up your profile, company logo and how the cheque app looks on
          your screen.
        </p>
      </header>

      {/* GRID: PROFILE + PREFERENCES */}
      <div className="settings-grid">
        {/* PROFILE + COMPANY CARD */}
        <section className="settings-card">
          <h2 className="settings-card-title">Profile &amp; company</h2>
          <p className="settings-card-sub">
            These details are used for the header and future reports. You can
            upload your photo and your company logo.
          </p>

          <form onSubmit={handleSaveProfile}>
            <div className="settings-profile-layout">
              {/* LEFT SIDE: PHOTOS */}
              <div className="settings-profile-visuals">
                {/* PROFILE IMAGE */}
                <div className="settings-avatar-block">
                  <div className="settings-avatar-preview">
                    {form.profileImageDataUrl ? (
                      <img
                        src={form.profileImageDataUrl}
                        alt="Profile"
                        className="settings-avatar-img"
                      />
                    ) : (
                      <span className="settings-avatar-initials">
                        {initials}
                      </span>
                    )}
                  </div>
                  <div className="settings-avatar-actions">
                    <label className="settings-file-btn">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleFileChange(e, "profileImageDataUrl")
                        }
                      />
                      Upload profile photo
                    </label>
                    {form.profileImageDataUrl && (
                      <button
                        type="button"
                        className="settings-link-btn"
                        onClick={() =>
                          handleRemoveImage("profileImageDataUrl")
                        }
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="settings-small-note">
                    Square image works best (e.g. 300×300).
                  </div>
                </div>

                {/* COMPANY LOGO */}
                <div className="settings-logo-block">
                  <div className="settings-logo-preview">
                    {form.companyLogoDataUrl ? (
                      <img
                        src={form.companyLogoDataUrl}
                        alt="Company logo"
                        className="settings-logo-img"
                      />
                    ) : (
                      <span className="settings-logo-placeholder">
                        Company logo
                      </span>
                    )}
                  </div>
                  <div className="settings-logo-actions">
                    <label className="settings-file-btn">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleFileChange(e, "companyLogoDataUrl")
                        }
                      />
                      Upload company logo
                    </label>
                    {form.companyLogoDataUrl && (
                      <button
                        type="button"
                        className="settings-link-btn"
                        onClick={() =>
                          handleRemoveImage("companyLogoDataUrl")
                        }
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="settings-small-note">
                    This logo will appear in the top bar (and later on
                    invoices/cheques).
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE: FIELDS */}
              <div className="settings-profile-fields">
                <div className="settings-field-group">
                  <label className="settings-field-label">Full name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="settings-field-input"
                    placeholder="Your full name"
                  />
                </div>

                <div className="settings-field-group">
                  <label className="settings-field-label">Email (login)</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email || baseEmail}
                    readOnly
                    className="settings-field-input is-readonly"
                  />
                  <div className="settings-small-note">
                    Login email is managed by your administrator.
                  </div>
                </div>

                <div className="settings-field-row-2">
                  <div className="settings-field-group">
                    <label className="settings-field-label">Mobile</label>
                    <input
                      type="text"
                      name="mobile"
                      value={form.mobile}
                      onChange={handleChange}
                      className="settings-field-input"
                      placeholder="+973…"
                    />
                  </div>
                  <div className="settings-field-group">
                    <label className="settings-field-label">Role</label>
                    <input
                      type="text"
                      value={baseRole}
                      readOnly
                      className="settings-field-input is-readonly"
                    />
                  </div>
                </div>

                <div className="settings-field-group">
                  <label className="settings-field-label">Address</label>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className="settings-field-textarea"
                    rows={2}
                    placeholder="Office address for reference"
                  />
                </div>

                <div className="settings-divider" />

                <div className="settings-section-label">Company</div>

                <div className="settings-field-group">
                  <label className="settings-field-label">Company name</label>
                  <input
                    type="text"
                    name="companyName"
                    value={form.companyName}
                    onChange={handleChange}
                    className="settings-field-input"
                    placeholder="Company name to show in header"
                  />
                </div>

                <div className="settings-field-group">
                  <label className="settings-field-label">
                    Company address
                  </label>
                  <textarea
                    name="companyAddress"
                    value={form.companyAddress}
                    onChange={handleChange}
                    className="settings-field-textarea"
                    rows={2}
                    placeholder="Address for cheques / reports"
                  />
                </div>

                <div className="settings-field-group">
                  <label className="settings-field-label">
                    CR / Registration no.
                  </label>
                  <input
                    type="text"
                    name="companyCr"
                    value={form.companyCr}
                    onChange={handleChange}
                    className="settings-field-input"
                    placeholder="Optional – company registration no."
                  />
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="settings-actions-row">
              <button
                type="submit"
                className="settings-primary-btn"
                disabled={saving}
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
              <button
                type="button"
                className="settings-secondary-btn"
                onClick={handleResetProfile}
              >
                Reset
              </button>

              {savedMsg && (
                <span className="settings-saved-msg">{savedMsg}</span>
              )}
            </div>
          </form>

          <p className="settings-footnote">
            These details are stored on this browser (local device). Later you
            can connect this page to your own backend user/profile API if you
            want central storage for multiple users.
          </p>
        </section>

        {/* PREFERENCES CARD */}
        <section className="settings-card">
          <h2 className="settings-card-title">Preferences</h2>
          <p className="settings-card-sub">
            Choose the look &amp; feel that is comfortable for daily use.
          </p>

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
