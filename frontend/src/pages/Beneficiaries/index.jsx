// frontend/src/pages/Beneficiaries/index.jsx

import { useEffect, useMemo, useState } from "react";
import {
  listBeneficiaries,
  createBeneficiary,
  updateBeneficiary,
  deleteBeneficiary,
} from "../../services/beneficiaries";
import { useAuth } from "../../AuthContext";
import "./beneficiaries.css";

import {
  FiPlusCircle,
  FiSearch,
  FiUser,
  FiEye,
  FiEyeOff,
  FiEdit2,
  FiTrash2,
  FiRefreshCw,
} from "react-icons/fi";

const defaultForm = {
  name: "",
  alias: "",
  hideByDefault: false,
  notes: "",
};

// Normalize any backend row shape to a stable UI row
function normalizeRow(b) {
  if (!b) return null;
  const id = b.id || b._id || b.beneficiaryId || b.uuid || b.key || "";
  return {
    ...b,
    id,
    name: b.name || b.beneficiaryName || b.fullName || "",
    alias: b.alias || "",
    hideByDefault: !!(b.hideByDefault ?? b.hide_beneficiary ?? b.hideBeneficiary),
    notes: b.notes || "",
    createdAt: b.createdAt || b.created_at || b.created || null,
    createdBy: b.createdBy || b.created_by || null,
  };
}

export default function BeneficiariesPage() {
  const { user } = useAuth(); // kept (may be used later for role/permissions)

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [search, setSearch] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("all"); // all | visible | hidden

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null = create
  const [form, setForm] = useState(defaultForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // ===== LOAD LIST FROM API =====
  const refresh = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await listBeneficiaries();

      // support multiple response shapes
      const list =
        Array.isArray(data)
          ? data
          : Array.isArray(data?.beneficiaries)
          ? data.beneficiaries
          : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.data)
          ? data.data
          : [];

      const normalized = list.map(normalizeRow).filter(Boolean);

      // sort by name
      const sorted = [...normalized].sort((a, b) =>
        (a.name || "").localeCompare(b.name || "")
      );

      setRows(sorted);
    } catch (_e) {
      setLoadError("Unable to load beneficiaries from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== FILTERED LIST =====
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const vis = visibilityFilter;

    return rows.filter((b) => {
      if (vis === "visible" && b.hideByDefault) return false;
      if (vis === "hidden" && !b.hideByDefault) return false;

      if (!term) return true;

      // include extra future fields too (no harm)
      const hay = [
        b.name,
        b.alias,
        b.notes,
        b.mobile,
        b.phone,
        b.iban,
        b.accountNumber,
        b.email,
        b.createdBy?.name,
        b.createdBy?.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return hay.includes(term);
    });
  }, [rows, search, visibilityFilter]);

  // ===== FORM HELPERS =====
  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setFormError("");
    setFormOpen(true);
  };

  const openEdit = (row) => {
    const r = normalizeRow(row) || row || {};
    setEditing(r);
    setForm({
      name: r.name || "",
      alias: r.alias || "",
      hideByDefault: !!r.hideByDefault,
      notes: r.notes || "",
    });
    setFormError("");
    setFormOpen(true);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const name = (form.name || "").trim();
    if (!name) {
      setFormError("Beneficiary name is required.");
      return;
    }

    const payload = {
      name,
      alias: (form.alias || "").trim(),
      hideByDefault: !!form.hideByDefault,
      notes: (form.notes || "").trim(),
    };

    setSaving(true);
    try {
      const editId =
        (editing && (editing.id || editing._id || editing.beneficiaryId)) || "";

      if (editId) {
        await updateBeneficiary(editId, payload);
      } else {
        await createBeneficiary(payload);
      }

      await refresh();
      setFormOpen(false);
      setEditing(null);
      setForm(defaultForm);
    } catch (e2) {
      const msg =
        e2?.response?.data?.message ||
        "Unable to save beneficiary. Please try again.";
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row) => {
    const r = normalizeRow(row);
    const id = r?.id;
    if (!id) return;

    const ok = window.confirm(
      `Delete beneficiary "${r.name || "this item"}"? This cannot be undone.`
    );
    if (!ok) return;

    try {
      await deleteBeneficiary(id);
      await refresh();
    } catch (e) {
      alert(
        e?.response?.data?.message || "Unable to delete beneficiary right now."
      );
    }
  };

  // ===== UI =====
  return (
    <div className="bene-root">
      {/* HEADER */}
      <div className="bene-header-row">
        <div>
          <div className="bene-kicker">Beneficiaries</div>
          <h1 className="bene-title">Saved beneficiaries & regular suppliers</h1>
          <p className="bene-subtitle">
            Add beneficiaries once, re-use them on new cheques, and choose
            whether their name should appear or stay hidden on the printed
            cheque (for regular suppliers/customers). Everything stays stored
            for finance and audit.
          </p>
        </div>

        <div className="bene-actions">
          <button
            type="button"
            className="bene-btn bene-btn-secondary"
            onClick={refresh}
            disabled={loading}
          >
            <FiRefreshCw className="bene-btn-icon" />
            <span>{loading ? "Refreshing…" : "Refresh"}</span>
          </button>

          <button
            type="button"
            className="bene-btn bene-btn-primary"
            onClick={openCreate}
          >
            <FiPlusCircle className="bene-btn-icon" />
            <span>New beneficiary</span>
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <section className="bene-section">
        <div className="bene-toolbar">
          {/* Search */}
          <div className="bene-search">
            <FiSearch className="bene-search-icon" />
            <input
              type="text"
              placeholder="Search by name, alias, notes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Visibility filter */}
          <div className="bene-filter-group">
            <button
              type="button"
              className={
                "bene-chip" + (visibilityFilter === "all" ? " is-active" : "")
              }
              onClick={() => setVisibilityFilter("all")}
            >
              All
            </button>
            <button
              type="button"
              className={
                "bene-chip" + (visibilityFilter === "visible" ? " is-active" : "")
              }
              onClick={() => setVisibilityFilter("visible")}
            >
              <FiEye className="bene-chip-icon" />
              <span>Shown on cheque</span>
            </button>
            <button
              type="button"
              className={
                "bene-chip" + (visibilityFilter === "hidden" ? " is-active" : "")
              }
              onClick={() => setVisibilityFilter("hidden")}
            >
              <FiEyeOff className="bene-chip-icon" />
              <span>Hidden on cheque (regular)</span>
            </button>
          </div>
        </div>
      </section>

      {/* FORM PANEL */}
      {formOpen && (
        <section className="bene-section">
          <div className="bene-form-card">
            <div className="bene-form-header">
              <h2>{editing ? "Edit beneficiary" : "Add new beneficiary"}</h2>
              <button
                type="button"
                className="bene-form-close"
                onClick={() => {
                  setFormOpen(false);
                  setEditing(null);
                  setForm(defaultForm);
                  setFormError("");
                }}
              >
                ✕
              </button>
            </div>

            <form className="bene-form" onSubmit={handleSubmit} noValidate>
              <div className="bene-form-grid">
                <div className="bene-field">
                  <span className="bene-label">Name (optional on cheque)</span>
                  <div className="bene-input-line">
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="Beneficiary / supplier name"
                      required
                    />
                    <FiUser className="bene-input-icon" />
                  </div>
                  <p className="bene-help">
                    The beneficiary record needs a name, but you can choose to
                    hide it on printed cheques using the toggle below.
                  </p>
                </div>

                <div className="bene-field">
                  <span className="bene-label">Short name / Alias</span>
                  <div className="bene-input-line">
                    <input
                      type="text"
                      value={form.alias}
                      onChange={(e) => handleChange("alias", e.target.value)}
                      placeholder="Optional short label used in lists"
                    />
                  </div>
                </div>
              </div>

              <div className="bene-form-grid">
                <div className="bene-field">
                  <span className="bene-label">
                    Keep beneficiary name hidden on cheque
                  </span>
                  <label className="bene-toggle">
                    <input
                      type="checkbox"
                      checked={form.hideByDefault}
                      onChange={(e) =>
                        handleChange("hideByDefault", e.target.checked)
                      }
                    />
                    <span>
                      If enabled, this beneficiary&rsquo;s name will be hidden
                      on the printed cheque by default (recommended for regular
                      suppliers/customers). The name still stays in the system
                      for finance and audit.
                    </span>
                  </label>
                </div>
              </div>

              <div className="bene-field">
                <span className="bene-label">Internal notes</span>
                <div className="bene-input-line">
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    placeholder="Extra details for finance / audit (optional)"
                  />
                </div>
              </div>

              {formError && <div className="bene-form-error">{formError}</div>}

              <div className="bene-form-actions">
                <button
                  type="button"
                  className="bene-btn bene-btn-secondary"
                  onClick={() => {
                    setFormOpen(false);
                    setEditing(null);
                    setForm(defaultForm);
                    setFormError("");
                  }}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bene-btn bene-btn-primary"
                  disabled={saving}
                >
                  {saving ? "Saving…" : editing ? "Save changes" : "Create beneficiary"}
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* TABLE */}
      <section className="bene-section">
        <div className="bene-panel">
          <div className="bene-panel-header">
            <h2>Beneficiaries list</h2>
            <span className="bene-panel-hint">
              Showing {filtered.length} of {rows.length}
            </span>
          </div>

          {loadError && <div className="bene-error">{loadError}</div>}

          {!loadError && !loading && filtered.length === 0 && (
            <div className="bene-empty">
              No beneficiaries match the current filters.
            </div>
          )}

          <div className="bene-table-wrapper">
            <table className="bene-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Alias</th>
                  <th>Visibility</th>
                  <th>Notes</th>
                  <th>Created</th>
                  <th style={{ width: "90px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={6} className="bene-loading-cell">
                      Loading beneficiaries…
                    </td>
                  </tr>
                )}

                {!loading &&
                  filtered.map((bRaw) => {
                    const b = normalizeRow(bRaw) || bRaw;
                    const rowKey = b.id || `${b.name}-${b.createdAt || ""}`;

                    const created = b.createdAt ? new Date(b.createdAt) : null;
                    const dateStr =
                      created && !isNaN(created)
                        ? created.toISOString().slice(0, 10)
                        : "";

                    const creator =
                      b.createdBy?.name ||
                      b.createdBy?.email ||
                      b.createdBy?.role ||
                      "";

                    return (
                      <tr key={rowKey}>
                        <td>
                          <div className="bene-name-cell">
                            <span className="bene-name">{b.name || "—"}</span>
                            {creator && (
                              <span className="bene-name-sub">
                                Added by {creator}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>{b.alias || "—"}</td>
                        <td>
                          <span
                            className={
                              "bene-pill" +
                              (b.hideByDefault
                                ? " bene-pill-hidden"
                                : " bene-pill-visible")
                            }
                          >
                            {b.hideByDefault ? (
                              <>
                                <FiEyeOff className="bene-pill-icon" /> Hidden
                                on cheque (regular)
                              </>
                            ) : (
                              <>
                                <FiEye className="bene-pill-icon" /> Shown on
                                cheque
                              </>
                            )}
                          </span>
                        </td>
                        <td className="bene-notes-cell">
                          {b.notes ? b.notes : "—"}
                        </td>
                        <td>
                          <div className="bene-created-cell">
                            <span>{dateStr || "—"}</span>
                          </div>
                        </td>
                        <td>
                          <div className="bene-actions-cell">
                            <button
                              type="button"
                              className="bene-icon-btn"
                              onClick={() => openEdit(b)}
                              title="Edit"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              type="button"
                              className="bene-icon-btn bene-icon-btn-danger"
                              onClick={() => handleDelete(b)}
                              title="Delete"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
