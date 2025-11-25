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

  const infoCards = [
    {
      key: "cheques",
      label: "Cheques in system",
      value: s.chequesCount ?? 0,
      icon: FiFileText,
      tone: "blue",
    },
    {
      key: "pending",
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

  const statusCards = [
    {
      key: "draft",
      label: "Draft / Upcoming",
      value: status.draft ?? status.upcoming ?? 0,
      icon: FiClock,
      tone: "blue",
    },
    {
      key: "pending",
      label: "Pending approval",
      value: status.pendingApproval ?? 0,
      icon: FiCheckSquare,
      tone: "amber",
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

  return (
    <div className="dash-root">
      {/* HEADER + ACTIONS */}
      <div className="dash-header-row">
        <div>
          <div className="dash-kicker">Dashboard</div>
          <h1 className="dash-title">
            Welcome back, {user?.name || "User"}
          </h1>
          <p className="dash-subtitle">
            {canApprove
              ? "Review pending approvals and monitor all cheque activity for your company."
              : "Prepare cheques and monitor status. Approval actions are handled by your Manager/Admin."}
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
