// src/pages/Approvals/index.jsx

import { useEffect, useState } from "react";
import { useAuth } from "../../AuthContext";
import {
  getPendingCheques,
  approveCheque,
  cancelCheque,
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
              Approvals are restricted to Manager / Admin. Please contact
              your administrator if you need approval rights.
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Load pending cheques (Draft / Pending)
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

  async function handleApprove(id) {
    if (!id) return;
    setApprovingId(id);
    setError("");

    try {
      const updated = await approveCheque(id);

      // remove from pending list
      setPending((curr) => curr.filter((c) => c.id !== id));

      // if the selected one is this cheque, update its status in preview
      setSelected((prev) => (prev?.id === id ? updated : prev));
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          "Unable to approve cheque. Please try again."
      );
    } finally {
      setApprovingId(null);
    }
  }

  async function handleCancel(id) {
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
      setPending((curr) => curr.filter((c) => c.id !== id));

      // if the selected one is this cheque, update its status in preview
      setSelected((prev) => (prev?.id === id ? updated : prev));
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          "Unable to cancel cheque. Please try again."
      );
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div className="dash-root">
      {/* HEADER */}
      <div className="dash-header-row">
        <div>
          <div className="dash-kicker">Approvals</div>
          <h1 className="dash-title">Pending cheque approvals</h1>
          <p className="dash-subtitle">
            Review cheques prepared by staff. Approve to allow printing, or
            cancel if something is not correct.
          </p>
        </div>
      </div>

      {/* OPTIONAL PREVIEW CARD */}
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
                    <td>{selected.date || selected.createdAt || ""}</td>
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
                    <td>{selected.status || ""}</td>
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
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((ch) => (
                    <tr key={ch.id}>
                      <td>{ch.date || ch.createdAt || ""}</td>
                      <td>
                        {ch.chequeNumber ||
                          ch.chequeNo ||
                          ch.number ||
                          ""}
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
                            gap: "6px",
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            type="button"
                            className="dash-btn dash-btn-secondary"
                            onClick={() => handleSelect(ch)}
                          >
                            View
                          </button>
                          <button
                            type="button"
                            className="dash-btn dash-btn-primary"
                            onClick={() => handleApprove(ch.id)}
                            disabled={approvingId === ch.id}
                          >
                            {approvingId === ch.id
                              ? "Approving…"
                              : "Approve"}
                          </button>
                          <button
                            type="button"
                            className="dash-btn dash-btn-secondary"
                            onClick={() => handleCancel(ch.id)}
                            disabled={cancellingId === ch.id}
                          >
                            {cancellingId === ch.id
                              ? "Cancelling…"
                              : "Cancel"}
                          </button>
                        </div>
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
