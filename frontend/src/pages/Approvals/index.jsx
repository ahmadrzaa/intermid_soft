// src/pages/Approvals/index.jsx

import { useEffect, useState } from "react";
import { useAuth } from "../../AuthContext";
import {
  getPendingCheques,
  approveCheque,
  cancelCheque,
  deleteCheque,
} from "../../services/cheques";

// reuse dashboard styling
import "../Dashboard/dashboard.css";

export default function ApprovalsPage() {
  const { user } = useAuth();
  const role = user?.role || "Staff";
  const allowed = role === "Manager" || role === "Admin";

  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [approvingId, setApprovingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");

  // If user is not Manager/Admin – block approvals
  if (!allowed) {
    return (
      <div className="dash-root">
        <section className="dash-section">
          <div className="dash-panel">
            <div className="dash-panel-header">
              <h2>Access denied</h2>
            </div>
            <div className="dash-empty">
              Approvals are restricted to Manager / Admin. Please contact your
              administrator if you need approval rights.
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Load pending cheques (Pending / Draft)
  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const rows = await getPendingCheques();
        if (mounted) setPending(rows);
      } catch (e) {
        if (mounted) {
          setError(
            e?.response?.data?.message ||
              "Unable to load pending cheques from server."
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  function handleSelect(ch) {
    setSelected(ch);
  }

  async function handleApprove(rawId) {
    const id = rawId;
    if (!id) return;

    setApprovingId(id);
    setError("");

    try {
      const updated = await approveCheque(id);

      // remove from pending list
      setPending((curr) =>
        curr.filter((c) => (c.id || c._id) !== id)
      );

      // if the selected one is this cheque, update its status in preview
      setSelected((prev) => {
        if (!prev) return prev;
        const prevId = prev.id || prev._id;
        return prevId === id ? updated : prev;
      });
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          "Unable to approve cheque. Please try again."
      );
    } finally {
      setApprovingId(null);
    }
  }

  async function handleCancel(rawId) {
    const id = rawId;
    if (!id) return;

    const ok = window.confirm(
      "Cancel this cheque? It will no longer be available for printing."
    );
    if (!ok) return;

    setCancellingId(id);
    setError("");

    try {
      const updated = await cancelCheque(id);

      // remove from pending list
      setPending((curr) =>
        curr.filter((c) => (c.id || c._id) !== id)
      );

      // if the selected one is this cheque, update its status in preview
      setSelected((prev) => {
        if (!prev) return prev;
        const prevId = prev.id || prev._id;
        return prevId === id ? updated : prev;
      });
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          "Unable to cancel cheque. Please try again."
      );
    } finally {
      setCancellingId(null);
    }
  }

  async function handleDelete(rawId) {
    const id = rawId;
    if (!id) return;

    const ok = window.confirm(
      "Delete this cheque permanently? This cannot be undone."
    );
    if (!ok) return;

    setDeletingId(id);
    setError("");

    try {
      await deleteCheque(id);

      // remove from pending + clear preview if same
      setPending((curr) =>
        curr.filter((c) => (c.id || c._id) !== id)
      );

      setSelected((prev) => {
        if (!prev) return prev;
        const prevId = prev.id || prev._id;
        return prevId === id ? null : prev;
      });
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          "Unable to delete cheque. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  }

  // helper to show a nice status label
  function getStatusLabel(stRaw) {
    const st = String(stRaw || "").toLowerCase();
    if (
      st === "draft" ||
      st === "pending" ||
      st === "pendingapproval" ||
      st === "pending_approval" ||
      st === "pending approval"
    ) {
      return "Pending approval";
    }
    if (st === "cancelled" || st === "stopped") {
      return "Stopped / Cancelled";
    }
    return stRaw || "";
  }

  function formatDate(raw) {
    if (!raw) return "";
    const d = new Date(raw);
    if (isNaN(d)) return raw;
    return d.toISOString().slice(0, 10);
  }

  // base style for icon buttons in Actions column
  const iconBtnBase = {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    padding: 0,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
  };

  return (
    <div className="dash-root">
      {/* HEADER */}
      <div className="dash-header-row">
        <div>
          <div className="dash-kicker">Approvals</div>
          <h1 className="dash-title">Pending cheque approvals</h1>
          <p className="dash-subtitle">
            Review cheques prepared by staff. Approve to allow printing, or
            cancel / delete if something is not correct.
          </p>
        </div>
      </div>

      {/* PREVIEW CARD – shows what user filled in */}
      {selected && (
        <section className="dash-section">
          <div className="dash-panel">
            <div className="dash-panel-header">
              <h2>Cheque preview</h2>
            </div>
            <div className="dash-table-wrapper">
              <table className="dash-table">
                <tbody>
                  <tr>
                    <th>Date</th>
                    <td>{formatDate(selected.date || selected.createdAt)}</td>
                  </tr>
                  <tr>
                    <th>Cheque #</th>
                    <td>
                      {selected.chequeNumber ||
                        selected.chequeNo ||
                        selected.number ||
                        ""}
                    </td>
                  </tr>
                  <tr>
                    <th>Bank</th>
                    <td>{selected.bankName || selected.bank || ""}</td>
                  </tr>
                  <tr>
                    <th>Amount</th>
                    <td>{selected.amount ?? ""}</td>
                  </tr>
                  <tr>
                    <th>Beneficiary</th>
                    <td>
                      {selected.hideBeneficiary
                        ? "(Hidden)"
                        : selected.beneficiaryName ||
                          selected.beneficiary ||
                          selected.payee ||
                          selected.name ||
                          ""}
                    </td>
                  </tr>
                  <tr>
                    <th>Notes / Purpose</th>
                    <td>{selected.notes || ""}</td>
                  </tr>
                  <tr>
                    <th>Prepared by</th>
                    <td>
                      {selected.createdBy?.name ||
                        selected.createdBy?.email ||
                        "-"}
                    </td>
                  </tr>
                  <tr>
                    <th>Status</th>
                    <td>{getStatusLabel(selected.status)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* APPROVALS TABLE */}
      <section className="dash-section">
        <div className="dash-panel">
          <div className="dash-panel-header">
            <h2>Pending cheques</h2>
          </div>

          {error && (
            <div className="dash-error" role="alert">
              {error}
            </div>
          )}

          {!error && loading && pending.length === 0 && (
            <div className="dash-empty">Loading pending cheques…</div>
          )}

          {!error && !loading && pending.length === 0 && (
            <div className="dash-empty">
              No cheques are waiting for approval.
            </div>
          )}

          {!error && pending.length > 0 && (
            <div className="dash-table-wrapper">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Cheque #</th>
                    <th>Beneficiary</th>
                    <th>Bank</th>
                    <th>Amount</th>
                    <th>Prepared by</th>
                    <th style={{ width: "140px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((ch) => {
                    const id = ch.id || ch._id;

                    return (
                      <tr key={id}>
                        <td>{formatDate(ch.date || ch.createdAt)}</td>
                        <td>
                          {ch.chequeNumber || ch.chequeNo || ch.number || ""}
                        </td>
                        <td>
                          {ch.hideBeneficiary
                            ? "(Hidden)"
                            : ch.beneficiaryName ||
                              ch.beneficiary ||
                              ch.payee ||
                              ch.name ||
                              ""}
                        </td>
                        <td>{ch.bankName || ch.bank || ""}</td>
                        <td>{ch.amount ?? ""}</td>
                        <td>
                          {ch.createdBy?.name || ch.createdBy?.email || "-"}
                        </td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              flexWrap: "wrap",
                              alignItems: "center",
                            }}
                          >
                            {/* View icon – show preview card */}
                            <button
                              type="button"
                              onClick={() => handleSelect(ch)}
                              style={{
                                ...iconBtnBase,
                                color: "#2563eb",
                              }}
                              title="View details"
                            >
                              {/* eye */}
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                width="16"
                                height="16"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            </button>

                            {/* Approve icon */}
                            <button
                              type="button"
                              onClick={() => handleApprove(id)}
                              disabled={approvingId === id}
                              style={{
                                ...iconBtnBase,
                                color:
                                  approvingId === id ? "#9ca3af" : "#10b981",
                              }}
                              title={
                                approvingId === id
                                  ? "Approving…"
                                  : "Approve cheque"
                              }
                            >
                              {/* check-circle */}
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                width="16"
                                height="16"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                              </svg>
                            </button>

                            {/* Cancel / stop icon */}
                            <button
                              type="button"
                              onClick={() => handleCancel(id)}
                              disabled={cancellingId === id}
                              style={{
                                ...iconBtnBase,
                                color:
                                  cancellingId === id ? "#9ca3af" : "#f97316",
                              }}
                              title={
                                cancellingId === id
                                  ? "Cancelling…"
                                  : "Cancel / stop cheque"
                              }
                            >
                              {/* slash */}
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                width="16"
                                height="16"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <circle cx="12" cy="12" r="10" />
                                <line
                                  x1="4.93"
                                  y1="4.93"
                                  x2="19.07"
                                  y2="19.07"
                                />
                              </svg>
                            </button>

                            {/* Delete icon */}
                            <button
                              type="button"
                              onClick={() => handleDelete(id)}
                              disabled={deletingId === id}
                              style={{
                                ...iconBtnBase,
                                color:
                                  deletingId === id ? "#9ca3af" : "#ef4444",
                              }}
                              title={
                                deletingId === id
                                  ? "Deleting…"
                                  : "Delete cheque"
                              }
                            >
                              {/* trash-2 */}
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                width="16"
                                height="16"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                                <path d="M10 11v6" />
                                <path d="M14 11v6" />
                                <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
