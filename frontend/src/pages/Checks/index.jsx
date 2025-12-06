// frontend/src/pages/Checks/index.jsx

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCheques, deleteCheque } from "../../services/cheques";
import { useAuth } from "../../AuthContext";
import "./checks.css";

import {
  FiPlusCircle,
  FiRefreshCw,
  FiSearch,
  FiFilter,
  FiEye,
  FiEdit2,
  FiPrinter,
  FiTrash2,
} from "react-icons/fi";

/** Map bank names in DB -> bank code used by cheque_bbk.html (10 active banks) */
function getBankCodeFromRow(c) {
  if (c.bankCode) return c.bankCode;

  const name = (c.bankName || c.bank || "").toLowerCase().trim();

  // NATIONAL BANK OF BAHRAIN
  if (name.includes("national bank of bahrain") || name === "nbb")
    return "nbb";

  // AHLI UNITED
  if (name.includes("ahli united")) return "ahli_united";

  // ALSALAM
  if (name.includes("alsalam")) return "alsalam";

  // ARAB BANKING CORPORATION
  if (name.includes("arab banking")) return "abc";

  // BAHRAIN ISLAMIC BANK
  if (name.includes("islamic") && name.includes("bahrain")) return "bisb";

  // BAHRAIN DEVELOPMENT BANK
  if (name.includes("development") && name.includes("bahrain")) return "bdb";

  // CENTRAL BANK OF BAHRAIN
  if (name.includes("central bank")) return "cbb";

  // GULF INTERNATIONAL BANK
  if (name.includes("gulf international")) return "gib";

  // HSBC BAHRAIN
  if (name.includes("hsbc")) return "hsbc_bh";

  // BANK OF BAHRAIN AND KUWAIT (default)
  if (
    name.includes("bank of bahrain and kuwait") ||
    name.includes("(bbk)") ||
    name === "bbk"
  )
    return "bbk";

  // default → bbk
  return "bbk";
}

function normalizeStatus(value) {
  // TRIM so "Approved " still becomes "approved"
  return String(value || "").trim().toLowerCase();
}

function isApprovedLike(status) {
  const s = normalizeStatus(status);
  return s === "approved" || s === "printed" || s === "completed";
}

// shared style for icon-only action buttons
const iconBtnStyle = {
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: 16,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
};

export default function ChequesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [cheques, setCheques] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Load from API
  useEffect(() => {
    let stop = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const data = await getCheques();
        const list = Array.isArray(data) ? data : data?.cheques || [];
        if (!stop) {
          // sort latest first (createdAt or date)
          const sorted = [...list].sort((a, b) => {
            const da = a.createdAt || a.date;
            const db = b.createdAt || b.date;
            const daDate = da ? new Date(da) : null;
            const dbDate = db ? new Date(db) : null;

            if (daDate && dbDate) return dbDate - daDate;
            if (dbDate && !daDate) return 1;
            if (daDate && !dbDate) return -1;
            return 0;
          });
          setCheques(sorted);
        }
      } catch (e) {
        if (!stop) {
          setError("Unable to load cheques from server.");
        }
      } finally {
        if (!stop) setLoading(false);
      }
    }

    load();
    return () => {
      stop = true;
    };
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getCheques();
      const list = Array.isArray(data) ? data : data?.cheques || [];
      const sorted = [...list].sort((a, b) => {
        const da = a.createdAt || a.date;
        const db = b.createdAt || b.date;
        const daDate = da ? new Date(da) : null;
        const dbDate = db ? new Date(db) : null;

        if (daDate && dbDate) return dbDate - daDate;
        if (dbDate && !daDate) return 1;
        if (daDate && !dbDate) return -1;
        return 0;
      });
      setCheques(sorted);
    } catch (e) {
      setError("Unable to refresh cheques.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const statusKey = statusFilter.toLowerCase();

    return cheques.filter((c) => {
      const rowStatus = normalizeStatus(c.status);

      // status filter with small logic:
      if (statusKey !== "all" && statusKey) {
        if (statusKey === "draft") {
          // treat Draft + Pending + PendingApproval together
          const isDraftLike = [
            "draft",
            "pending",
            "pending_approval",
            "pendingapproval",
            "pending approval", // extra safety
          ].includes(rowStatus);
          if (!isDraftLike) return false;
        } else if (statusKey === "stopped") {
          // Stopped / Cancelled group
          const isStoppedLike =
            rowStatus === "stopped" ||
            rowStatus === "cancelled" ||
            rowStatus.includes("stopped") ||
            rowStatus.includes("cancelled");
          if (!isStoppedLike) return false;
        } else {
          if (rowStatus !== statusKey) return false;
        }
      }

      if (!term) return true;

      const haystack = [
        c.chequeNumber,
        c.chequeNo,
        c.bankName,
        c.bank,
        c.accountNumber,
        c.beneficiaryName,
        c.beneficiary,
        c.notes,
        c.createdBy?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [cheques, search, statusFilter]);

  const totalCount = cheques.length;
  const filteredCount = filtered.length;

  /** VIEW only (read-only) */
  const handleViewCheque = (cheque) => {
    if (!cheque) return;
    const id = cheque.id || cheque._id;
    if (!id) {
      alert("This cheque does not have an ID.");
      return;
    }

    const approvedParam = isApprovedLike(cheque.status) ? "1" : "0";
    const bankCode = getBankCodeFromRow(cheque);

    const params = new URLSearchParams();
    params.set("id", String(id));
    params.set("bank", bankCode);
    params.set("approved", approvedParam);
    params.set("mode", "view");

    navigate(`/app/checks/new?${params.toString()}`);
  };

  /** PRINT mode */
  const handlePrintCheque = (cheque) => {
    if (!cheque) return;
    const id = cheque.id || cheque._id;
    if (!id) {
      alert("This cheque does not have an ID.");
      return;
    }

    const approvedParam = isApprovedLike(cheque.status) ? "1" : "0";
    const bankCode = getBankCodeFromRow(cheque);

    const params = new URLSearchParams();
    params.set("id", String(id));
    params.set("bank", bankCode);
    params.set("approved", approvedParam);
    params.set("mode", "print");

    navigate(`/app/checks/new?${params.toString()}`);
  };

  /** EDIT mode */
  const handleEditCheque = (cheque) => {
    if (!cheque) return;
    const id = cheque.id || cheque._id;
    if (!id) {
      alert("This cheque does not have an ID.");
      return;
    }

    const approvedParam = isApprovedLike(cheque.status) ? "1" : "0";
    const bankCode = getBankCodeFromRow(cheque);

    const params = new URLSearchParams();
    params.set("id", String(id));
    params.set("bank", bankCode);
    params.set("approved", approvedParam);
    params.set("mode", "edit");

    navigate(`/app/checks/new?${params.toString()}`);
  };

  /** DELETE cheque */
  const handleDeleteCheque = async (cheque) => {
    if (!cheque) return;
    const id = cheque.id || cheque._id;
    const chequeNo = cheque.chequeNumber || cheque.chequeNo || id;
    if (!id) {
      alert("This cheque does not have an ID.");
      return;
    }

    const ok = window.confirm(
      `Delete cheque "${chequeNo}"? This cannot be undone.`
    );
    if (!ok) return;

    try {
      await deleteCheque(id);
      // remove from local list
      setCheques((prev) =>
        prev.filter((row) => (row.id || row._id) !== id)
      );
    } catch (e) {
      alert(
        e?.response?.data?.message ||
          "Unable to delete cheque right now."
      );
    }
  };

  return (
    <div className="checks-root">
      {/* HEADER */}
      <div className="checks-header-row">
        <div>
          <div className="checks-kicker">Cheques</div>
          <h1 className="checks-title">All cheques in the system</h1>
          <p className="checks-subtitle">
            View all cheques prepared by your team. Drafts, approved and printed
            cheques appear here. Approvals remain restricted to Manager/Admin.
          </p>
        </div>

        <div className="checks-actions">
          <button
            type="button"
            className="checks-btn checks-btn-secondary"
            onClick={handleRefresh}
            disabled={loading}
          >
            <FiRefreshCw className="checks-btn-icon" />
            <span>{loading ? "Refreshing…" : "Refresh"}</span>
          </button>

          <button
            type="button"
            className="checks-btn checks-btn-primary"
            onClick={() => navigate("/app/checks/new")}
          >
            <FiPlusCircle className="checks-btn-icon" />
            <span>New cheque</span>
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <section className="checks-section">
        <div className="checks-toolbar">
          <div className="checks-filter">
            <FiFilter className="checks-filter-icon" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="draft">Draft / Pending approval</option>
              <option value="approved">Approved</option>
              <option value="printed">Printed</option>
              <option value="returned">Returned</option>
              <option value="stopped">Stopped / Cancelled</option>
            </select>
          </div>

          <div className="checks-search">
            <FiSearch className="checks-search-icon" />
            <input
              type="text"
              placeholder="Search by cheque #, bank, beneficiary, account…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="checks-count">
            {filteredCount} of {totalCount} cheques
          </div>
        </div>
      </section>

      {/* TABLE */}
      <section className="checks-section">
        <div className="checks-panel">
          <div className="checks-panel-header">
            <h2>Cheques list</h2>
            <span className="checks-user-hint">
              Logged in as <strong>{user?.name || "User"}</strong>{" "}
              ({user?.role || "Staff"})
            </span>
          </div>

          {error && <div className="checks-error">{error}</div>}

          {!error && !loading && filtered.length === 0 && (
            <div className="checks-empty">
              No cheques found. Try changing filters or create a new cheque.
            </div>
          )}

          <div className="checks-table-wrapper">
            <table className="checks-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Cheque #</th>
                  <th>Beneficiary</th>
                  <th>Bank / Company</th>
                  <th>Account</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Prepared by</th>
                  {/* wider column so icons stay on one line */}
                  <th style={{ width: "160px", minWidth: "160px" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={9} className="checks-loading-cell">
                      Loading cheques…
                    </td>
                  </tr>
                )}

                {!loading &&
                  filtered.map((c) => {
                    const dateStr =
                      c.date ||
                      (c.createdAt
                        ? new Date(c.createdAt).toISOString().slice(0, 10)
                        : "");

                    const chequeNo = c.chequeNumber || c.chequeNo || "—";
                    const beneficiary =
                      c.beneficiaryName || c.beneficiary || "—";
                    const bank = c.bankName || c.bank || "—";
                    const account = c.accountNumber || "—";
                    const amt =
                      typeof c.amount === "number"
                        ? c.amount.toLocaleString("en-BH", {
                            minimumFractionDigits: 3,
                            maximumFractionDigits: 3,
                          })
                        : c.amount || "—";

                    const rawStatus = c.status || "Draft";
                    const statusNorm = normalizeStatus(rawStatus);
                    let friendlyStatus = rawStatus;

                    if (
                      [
                        "draft",
                        "pending",
                        "pending_approval",
                        "pendingapproval",
                        "pending approval", // extra safety
                      ].includes(statusNorm)
                    ) {
                      friendlyStatus = "Pending approval";
                    } else if (
                      ["stopped", "cancelled"].includes(statusNorm)
                    ) {
                      friendlyStatus = "Stopped / Cancelled";
                    }

                    const preparedBy =
                      c.createdBy?.name ||
                      c.createdBy?.email ||
                      c.createdBy?.role ||
                      "—";

                    return (
                      <tr key={c.id || c._id || chequeNo}>
                        <td>{dateStr}</td>
                        <td>{chequeNo}</td>
                        <td>{beneficiary}</td>
                        <td>{bank}</td>
                        <td>{account}</td>
                        <td>{amt}</td>
                        <td>{friendlyStatus}</td>
                        <td>{preparedBy}</td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              flexWrap: "nowrap",
                              justifyContent: "flex-start",
                            }}
                          >
                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() => handleEditCheque(c)}
                              style={{ ...iconBtnStyle, color: "#10b981" }}
                              title="Edit cheque"
                            >
                              <FiEdit2 />
                            </button>

                            {/* View */}
                            <button
                              type="button"
                              onClick={() => handleViewCheque(c)}
                              style={{ ...iconBtnStyle, color: "#2563eb" }}
                              title="View cheque"
                            >
                              <FiEye />
                            </button>

                            {/* Print */}
                            <button
                              type="button"
                              onClick={() => handlePrintCheque(c)}
                              style={{ ...iconBtnStyle, color: "#0f766e" }}
                              title="Print cheque"
                            >
                              <FiPrinter />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => handleDeleteCheque(c)}
                              style={{ ...iconBtnStyle, color: "#dc2626" }}
                              title="Delete cheque"
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
