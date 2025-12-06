// src/pages/Dashboard/index.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import { getDashboardSummary } from "../../services/cheques";
import "./dashboard.css";

// Icons for header buttons and status cards
import {
  FiCheckSquare,
  FiPlusCircle,
  FiFileText,
  FiClock,
  FiCheck,
  FiPrinter,
  FiRotateCcw,
  FiSlash,
  FiUsers,
} from "react-icons/fi";

/* ---------- helpers (same logic as Cheques list) ---------- */

function normalizeStatus(value) {
  return String(value || "").trim().toLowerCase();
}

function isApprovedLike(status) {
  const s = normalizeStatus(status);
  return s === "approved" || s === "printed" || s === "completed";
}

/** Map bank names in dashboard recent rows -> bank code used by cheque templates */
function getBankCodeFromRow(row) {
  if (row.bankCode) return row.bankCode;

  const name = (row.bankName || row.bank || "").toLowerCase().trim();

  if (name.includes("national bank of bahrain") || name === "nbb") return "nbb";
  if (name.includes("ahli united")) return "ahli_united";
  if (name.includes("alsalam")) return "alsalam";
  if (name.includes("arab banking")) return "abc";
  if (name.includes("islamic") && name.includes("bahrain")) return "bisb";
  if (name.includes("development") && name.includes("bahrain")) return "bdb";
  if (name.includes("central bank")) return "cbb";
  if (name.includes("gulf international")) return "gib";
  if (name.includes("hsbc")) return "hsbc_bh";

  if (
    name.includes("bank of bahrain and kuwait") ||
    name.includes("(bbk)") ||
    name === "bbk"
  )
    return "bbk";

  return "bbk";
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const role = user?.role || "Staff";
  const canApprove = role === "Admin" || role === "Manager";

  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setBusy(true);
      setError("");

      try {
        const data = (await getDashboardSummary()) || {};
        if (mounted) setSummary(data);
      } catch (e) {
        if (mounted) {
          setError("Unable to load cheque data from server.");
          setSummary(null);
        }
      } finally {
        if (mounted) setBusy(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const s = summary || {};
  const status = s.status || s.byStatus || {};

  /* ---------- TOP INFO CARDS (no duplicate statuses) ---------- */
  const infoCards = [
    {
      key: "cheques",
      label: "Cheques in system",
      value: s.chequesCount ?? 0,
      icon: FiFileText,
      tone: "blue",
    },
    {
      key: "pendingApproval",
      label: "Pending approval",
      value: status.pendingApproval ?? 0,
      icon: FiCheckSquare,
      tone: "amber",
    },
    {
      key: "beneficiaries",
      label: "Beneficiaries",
      value: s.payeesCount ?? 0,
      icon: FiUsers,
      tone: "teal",
    },
    {
      key: "banks",
      label: "Banks / Accounts",
      value: (s.banksCount ?? 0) + (s.bankAccountsCount ?? 0),
      icon: FiPrinter,
      tone: "indigo",
    },
  ];

  /* ---------- STATUS STRIP (Pending removed – shown only above) ---------- */
  const statusCards = [
    {
      key: "draft",
      label: "Draft / Upcoming",
      value: status.draft ?? status.upcoming ?? 0,
      icon: FiClock,
      tone: "blue",
    },
    {
      key: "approved",
      label: "Approved",
      value: status.approved ?? 0,
      icon: FiCheck,
      tone: "green",
    },
    {
      key: "printed",
      label: "Printed / Issued",
      value: status.printed ?? status.issued ?? 0,
      icon: FiPrinter,
      tone: "teal",
    },
    {
      key: "returned",
      label: "Returned",
      value: status.returned ?? 0,
      icon: FiRotateCcw,
      tone: "rose",
    },
    {
      key: "stopped",
      label: "Stopped / Cancelled",
      value: status.stopped ?? status.cancelled ?? 0,
      icon: FiSlash,
      tone: "slate",
    },
  ];

  const recent = s.recent || [];

  /* ---------- Open cheque from dashboard for View / Print ---------- */
  const handleViewPrintCheque = (row) => {
    if (!row) return;
    const id = row.id || row._id;
    if (!id) {
      alert("This cheque does not have an ID.");
      return;
    }

    const approvedParam = isApprovedLike(row.status) ? "1" : "0";
    const bankCode = getBankCodeFromRow(row);

    const params = new URLSearchParams();
    params.set("id", String(id));
    params.set("bank", bankCode);
    params.set("approved", approvedParam);
    params.set("mode", "view");

    navigate(`/app/checks/new?${params.toString()}`);
  };

  return (
    <div className="dash-root">
      {/* HEADER + ACTIONS */}
      <div className="dash-header-row">
        <div>
          <h1 className="dash-title">
            Welcome back, {user?.name || "User"}
          </h1>
          <p className="dash-subtitle">
            Monitor cheque totals, approvals and printing activity in one place.
          </p>
        </div>

        <div className="dash-actions">
          {/* Quick link to Approvals – only for Manager/Admin */}
          {canApprove && (
            <button
              type="button"
              className="dash-btn dash-btn-secondary"
              onClick={() => navigate("/app/approvals")}
            >
              <FiCheckSquare className="dash-btn-icon" />
              <span>Approvals</span>
            </button>
          )}

          {/* New cheque – all roles can prepare cheques */}
          <button
            type="button"
            className="dash-btn dash-btn-primary"
            onClick={() => navigate("/app/checks/new")}
          >
            <FiPlusCircle className="dash-btn-icon" />
            <span>New cheque</span>
          </button>
        </div>
      </div>

      {/* TOP INFO CARDS */}
      <section className="dash-section">
        <div className="dash-cards-grid dash-cards-grid--info">
          {infoCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.key}
                className={`dash-card dash-card-info dash-card-info--${card.tone}`}
              >
                <div className="dash-card-info-main">
                  <div className="dash-card-info-icon">
                    <Icon />
                  </div>
                  <div>
                    <div className="dash-card-info-label">
                      {card.label}
                    </div>
                    <div className="dash-card-info-value">
                      {busy ? "…" : card.value}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* STATUS STRIP */}
      <section className="dash-section">
        <div className="dash-cards-grid dash-cards-grid--status">
          {statusCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.key}
                className={`dash-card dash-card-status dash-card-status--${card.tone}`}
              >
                <div className="dash-card-status-main">
                  <div className="dash-card-status-left">
                    <div className="dash-card-status-value">
                      {busy ? "…" : card.value}
                    </div>
                    <div className="dash-card-status-label">
                      {card.label}
                    </div>
                  </div>
                  <div className="dash-card-status-icon">
                    <Icon />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* RECENT CHEQUES TABLE */}
      <section className="dash-section">
        <div className="dash-panel">
          <div className="dash-panel-header">
            <h2>Recent cheques</h2>
            <button
              type="button"
              className="dash-link-button"
              onClick={() => navigate("/app/history")}
            >
              View full history
            </button>
          </div>

          {error && (
            <div className="dash-error" role="alert">
              {error}
            </div>
          )}

          {!error && recent.length === 0 && (
            <div className="dash-empty">No cheques yet.</div>
          )}

          {!error && recent.length > 0 && (
            <div className="dash-table-wrapper">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Cheque #</th>
                    <th>Beneficiary</th>
                    <th>Bank</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((row) => (
                    <tr key={row.id || row.number}>
                      <td>{row.date || row.createdAt}</td>
                      <td>{row.number}</td>
                      <td>{row.beneficiary}</td>
                      <td>{row.bank}</td>
                      <td>{row.amount}</td>
                      <td>{row.status}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleViewPrintCheque(row)}
                          style={{
                            border: "none",
                            background: "transparent",
                            color: "#2563eb",
                            cursor: "pointer",
                            fontSize: 12,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            padding: 0,
                          }}
                        >
                          <FiPrinter style={{ fontSize: 14 }} />
                          <span>Print</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
