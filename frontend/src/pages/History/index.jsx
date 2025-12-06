// frontend/src/pages/History/index.jsx

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCheques, deleteCheque } from "../../services/cheques";
import { useAuth } from "../../AuthContext";
import "./history.css";

import {
  FiRefreshCw,
  FiDownload,
  FiPrinter,
  FiCalendar,
  FiSearch,
  FiFilter,
  FiEye,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";

/** Map bank names in DB -> bank code used by cheque templates */
function getBankCodeFromRow(c) {
  if (c.bankCode) return c.bankCode;

  const name = (c.bankName || c.bank || "").toLowerCase().trim();

  if (name.includes("national bank of bahrain") || name === "nbb")
    return "nbb";
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

function normalizeStatus(value) {
  return String(value || "").trim().toLowerCase();
}

function isApprovedLike(status) {
  const s = normalizeStatus(status);
  return s === "approved" || s === "printed" || s === "completed";
}

export default function HistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || "Staff";
  const canDelete = role === "Admin" || role === "Manager";

  const [cheques, setCheques] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // base style for tiny icon buttons in Actions col
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

  // load from API
  useEffect(() => {
    let stop = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const data = await getCheques();
        const list = Array.isArray(data) ? data : data?.cheques || [];

        if (!stop) {
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
        if (!stop) setError("Unable to load cheque history from server.");
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
      setError("Unable to refresh cheque history.");
    } finally {
      setLoading(false);
    }
  };

  // open cheque in New page with selected mode
  const openCheque = (cheque, mode) => {
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
    params.set("mode", mode); // "view" or "print"

    navigate(`/app/checks/new?${params.toString()}`);
  };

  const handleViewCheque = (cheque) => openCheque(cheque, "view");
  const handlePrintCheque = (cheque) => openCheque(cheque, "print");

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

  const handleDeleteCheque = async (cheque) => {
    if (!cheque?.id) return;
    const ok = window.confirm(
      `Delete cheque "${cheque.chequeNumber || cheque.chequeNo || ""}"? This cannot be undone.`
    );
    if (!ok) return;

    setDeletingId(cheque.id);
    try {
      await deleteCheque(cheque.id);
      setCheques((curr) => curr.filter((c) => c.id !== cheque.id));
    } catch (e) {
      alert(
        e?.response?.data?.message ||
          "Unable to delete cheque right now. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // apply filters
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const statusKey = statusFilter.toLowerCase();

    return cheques.filter((c) => {
      // date filter
      const rawDate = c.date || c.printedAt || c.approvedAt || c.createdAt;
      let dateOk = true;
      if (dateFrom || dateTo) {
        if (!rawDate) {
          dateOk = false;
        } else {
          const d = new Date(rawDate);
          if (!isNaN(d)) {
            const iso = d.toISOString().slice(0, 10);
            if (dateFrom && iso < dateFrom) dateOk = false;
            if (dateTo && iso > dateTo) dateOk = false;
          } else {
            dateOk = false;
          }
        }
      }
      if (!dateOk) return false;

      // status filter (normalize Pending / Draft)
      const raw = String(c.status || "").toLowerCase();
      let rowStatus = raw;

      if (
        raw === "pending" ||
        raw === "pendingapproval" ||
        raw === "pending_approval"
      ) {
        rowStatus = "draft"; // group as Pending approval
      }
      if (raw === "cancelled") {
        rowStatus = "stopped"; // UI uses stopped
      }

      if (statusKey !== "all" && statusKey && rowStatus !== statusKey) {
        return false;
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
        c.approvedBy?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [cheques, search, statusFilter, dateFrom, dateTo]);

  const totalCount = cheques.length;
  const filteredCount = filtered.length;

  // summary totals over filtered rows
  const summary = useMemo(() => {
    let totalAmount = 0;
    let printedCount = 0;
    let approvedCount = 0;
    let draftCount = 0; // Pending approval
    let returnedCount = 0;

    filtered.forEach((c) => {
      const amt = Number(c.amount);
      if (!isNaN(amt)) totalAmount += amt;

      const st = String(c.status || "").toLowerCase();
      if (st === "printed" || st === "completed") {
        printedCount += 1;
      } else if (st === "approved") {
        approvedCount += 1;
      } else if (
        st === "draft" ||
        st === "pending" ||
        st === "pendingapproval" ||
        st === "pending_approval"
      ) {
        draftCount += 1;
      } else if (st === "returned" || st === "rejected") {
        returnedCount += 1;
      }
    });

    return {
      totalAmount,
      printedCount,
      approvedCount,
      draftCount,
      returnedCount,
    };
  }, [filtered]);

  // CSV export for filtered rows
  const handleExportCsv = () => {
    if (!filtered.length) return;

    const header = [
      "Date",
      "ChequeNumber",
      "Beneficiary",
      "Bank",
      "AccountNumber",
      "Amount",
      "Currency",
      "Status",
      "PreparedBy",
      "ApprovedBy",
    ];

    const rows = filtered.map((c) => {
      const rawDate =
        c.date || c.printedAt || c.approvedAt || c.createdAt || "";
      const d = rawDate ? new Date(rawDate) : null;
      const dateStr = d && !isNaN(d) ? d.toISOString().slice(0, 10) : "";

      const chequeNo = c.chequeNumber || c.chequeNo || "";
      const beneficiary = c.beneficiaryName || c.beneficiary || "";
      const bank = c.bankName || c.bank || "";
      const acc = c.accountNumber || "";
      const amount = c.amount ?? "";
      const currency = c.currency || "BHD";
      const status = c.status || "";
      const preparedBy =
        c.createdBy?.name ||
        c.createdBy?.email ||
        c.createdBy?.role ||
        "";
      const approvedBy =
        c.approvedBy?.name ||
        c.approvedBy?.email ||
        c.approvedBy?.role ||
        "";

      return [
        dateStr,
        chequeNo,
        beneficiary,
        bank,
        acc,
        amount,
        currency,
        status,
        preparedBy,
        approvedBy,
      ];
    });

    const csvLines = [header, ...rows]
      .map((fields) =>
        fields
          .map((f) => {
            const v = f == null ? "" : String(f);
            if (v.includes(",") || v.includes('"') || v.includes("\n")) {
              return `"${v.replace(/"/g, '""')}"`;
            }
            return v;
          })
          .join(",")
      )
      .join("\r\n");

    const blob = new Blob([csvLines], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cheque_history.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Print summary – open new window with simple table
  const handlePrintSummary = () => {
    const win = window.open("", "_blank");
    if (!win) return;

    const rowsHtml = filtered
      .map((c) => {
        const rawDate =
          c.date || c.printedAt || c.approvedAt || c.createdAt || "";
        const d = rawDate ? new Date(rawDate) : null;
        const dateStr = d && !isNaN(d) ? d.toISOString().slice(0, 10) : "";

        const chequeNo = c.chequeNumber || c.chequeNo || "";
        const beneficiary = c.beneficiaryName || c.beneficiary || "";
        const bank = c.bankName || c.bank || "";
        const acc = c.accountNumber || "";
        const amount = c.amount ?? "";
        const status = c.status || "";

        return `<tr>
          <td>${dateStr}</td>
          <td>${chequeNo}</td>
          <td>${beneficiary}</td>
          <td>${bank}</td>
          <td>${acc}</td>
          <td>${amount}</td>
          <td>${status}</td>
        </tr>`;
      })
      .join("");

    win.document.write(`
      <html>
        <head>
          <title>Cheque history summary</title>
          <style>
            body { font-family: system-ui, -apple-system, "Segoe UI", sans-serif; padding: 16px; }
            h1 { font-size: 18px; margin-bottom: 8px; }
            p { font-size: 12px; margin: 2px 0 8px; color: #4b5563; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            th, td { padding: 4px 6px; border: 1px solid #d1d5db; text-align: left; }
            th { background: #f9fafb; }
          </style>
        </head>
        <body>
          <h1>Cheque history summary</h1>
          <p>Filtered rows: ${filtered.length}</p>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Cheque #</th>
                <th>Beneficiary</th>
                <th>Bank</th>
                <th>Account</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.focus();
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    win.document.close();
  };

  // helper: display-status (user friendly)
  function getStatusLabel(rawStatus) {
    const st = normalizeStatus(rawStatus);
    if (
      st === "draft" ||
      st === "pending" ||
      st === "pendingapproval" ||
      st === "pending_approval"
    ) {
      return "Pending approval";
    }
    if (st === "cancelled" || st === "stopped") {
      return "Stopped / Cancelled";
    }
    return rawStatus || "Draft";
  }

  function formatDate(raw) {
    if (!raw) return "";
    const d = new Date(raw);
    if (isNaN(d)) return raw;
    return d.toISOString().slice(0, 10);
  }

  return (
    <div className="history-root">
      {/* HEADER */}
      <div className="history-header-row">
        <div>
          <div className="history-kicker">History</div>
          <h1 className="history-title">Cheque history & audit trail</h1>
          <p className="history-subtitle">
            Complete record of cheques prepared, approved and printed. Filter by
            date, status and beneficiary, then export or print summary for
            audit.
          </p>
        </div>

        <div className="history-actions">
          <button
            type="button"
            className="history-btn history-btn-secondary"
            onClick={handleRefresh}
            disabled={loading}
          >
            <FiRefreshCw className="history-btn-icon" />
            <span>{loading ? "Refreshing…" : "Refresh"}</span>
          </button>

          <button
            type="button"
            className="history-btn history-btn-secondary"
            onClick={handleExportCsv}
            disabled={!filtered.length}
          >
            <FiDownload className="history-btn-icon" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            className="history-btn history-btn-primary"
            onClick={handlePrintSummary}
            disabled={!filtered.length}
          >
            <FiPrinter className="history-btn-icon" />
            <span>Print summary</span>
          </button>
        </div>
      </div>

      {/* SUMMARY STRIP */}
      <section className="history-section">
        <div className="history-summary-grid">
          <div className="history-summary-card">
            <div className="history-summary-label">Filtered cheques</div>
            <div className="history-summary-value">
              {filteredCount} <span>/ {totalCount}</span>
            </div>
          </div>

          <div className="history-summary-card">
            <div className="history-summary-label">Total amount (filtered)</div>
            <div className="history-summary-value">
              {summary.totalAmount.toLocaleString("en-BH", {
                minimumFractionDigits: 3,
                maximumFractionDigits: 3,
              })}{" "}
              <span>BHD</span>
            </div>
          </div>

          <div className="history-summary-card">
            <div className="history-summary-label">Printed</div>
            <div className="history-summary-value">
              {summary.printedCount}
            </div>
          </div>

          <div className="history-summary-card">
            <div className="history-summary-label">
              Approved (not printed)
            </div>
            <div className="history-summary-value">
              {summary.approvedCount}
            </div>
          </div>

          <div className="history-summary-card">
            <div className="history-summary-label">Pending approval</div>
            <div className="history-summary-value">
              {summary.draftCount}
            </div>
          </div>

          <div className="history-summary-card">
            <div className="history-summary-label">Returned / Rejected</div>
            <div className="history-summary-value">
              {summary.returnedCount}
            </div>
          </div>
        </div>
      </section>

      {/* FILTER BAR */}
      <section className="history-section">
        <div className="history-toolbar">
          {/* Date range */}
          <div className="history-date-group">
            <div className="history-date-field">
              <FiCalendar className="history-date-icon" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <span className="history-date-sep">to</span>
            <div className="history-date-field">
              <FiCalendar className="history-date-icon" />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          {/* Status */}
          <div className="history-filter">
            <FiFilter className="history-filter-icon" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="draft">Pending approval</option>
              <option value="approved">Approved</option>
              <option value="printed">Printed</option>
              <option value="returned">Returned</option>
              <option value="stopped">Stopped / Cancelled</option>
            </select>
          </div>

          {/* Search */}
          <div className="history-search">
            <FiSearch className="history-search-icon" />
            <input
              type="text"
              placeholder="Search by cheque #, beneficiary, bank, account…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* TABLE */}
      <section className="history-section">
        <div className="history-panel">
          <div className="history-panel-header">
            <h2>Cheque history</h2>
            <span className="history-user-hint">
              Logged in as <strong>{user?.name || "User"}</strong>{" "}
              ({user?.role || "Staff"})
            </span>
          </div>

          {error && <div className="history-error">{error}</div>}

          {!error && !loading && filtered.length === 0 && (
            <div className="history-empty">
              No cheques match the current filters.
            </div>
          )}

          <div className="history-table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Cheque #</th>
                  <th>Beneficiary</th>
                  <th>Bank</th>
                  <th>Account</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Prepared by</th>
                  <th>Approved by</th>
                  <th style={{ width: "150px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={10} className="history-loading-cell">
                      Loading cheque history…
                    </td>
                  </tr>
                )}

                {!loading &&
                  filtered.map((c) => {
                    const rawDate =
                      c.date ||
                      c.printedAt ||
                      c.approvedAt ||
                      c.createdAt ||
                      "";
                    const dateStr = formatDate(rawDate);

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

                    const preparedBy =
                      c.createdBy?.name ||
                      c.createdBy?.email ||
                      c.createdBy?.role ||
                      "—";

                    const approvedBy =
                      c.approvedBy?.name ||
                      c.approvedBy?.email ||
                      c.approvedBy?.role ||
                      "—";

                    return (
                      <tr key={c.id}>
                        <td>{dateStr}</td>
                        <td>{chequeNo}</td>
                        <td>{beneficiary}</td>
                        <td>{bank}</td>
                        <td>{account}</td>
                        <td>{amt}</td>
                        <td>{getStatusLabel(c.status)}</td>
                        <td>{preparedBy}</td>
                        <td>{approvedBy}</td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              flexWrap: "wrap",
                              alignItems: "center",
                              justifyContent: "flex-start",
                            }}
                          >
                            {/* Edit */}
                            <button
                              type="button"
                              style={{
                                ...iconBtnBase,
                                color: "#10b981",
                              }}
                              onClick={() => handleEditCheque(c)}
                              title="Edit cheque"
                            >
                              <FiEdit2 />
                            </button>

                            {/* View */}
                            <button
                              type="button"
                              style={{
                                ...iconBtnBase,
                                color: "#2563eb",
                              }}
                              onClick={() => handleViewCheque(c)}
                              title="View cheque"
                            >
                              <FiEye />
                            </button>

                            {/* Print */}
                            <button
                              type="button"
                              style={{
                                ...iconBtnBase,
                                color: "#0f766e",
                              }}
                              onClick={() => handlePrintCheque(c)}
                              title="Open in print mode"
                            >
                              <FiPrinter />
                            </button>

                            {/* Delete – only for Manager/Admin */}
                            {canDelete && (
                              <button
                                type="button"
                                style={{
                                  ...iconBtnBase,
                                  color:
                                    deletingId === c.id
                                      ? "#9ca3af"
                                      : "#ef4444",
                                }}
                                onClick={() => handleDeleteCheque(c)}
                                disabled={deletingId === c.id}
                                title={
                                  deletingId === c.id
                                    ? "Deleting…"
                                    : "Delete cheque"
                                }
                              >
                                <FiTrash2 />
                              </button>
                            )}
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
