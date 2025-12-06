// src/services/cheques.js
// PURE JS SERVICE FILE – no JSX allowed here.

import api from "./api";

/**
 * List cheques (optionally with filters)
 *   e.g. getCheques({ status: "pending" })
 */
export async function getCheques(params = {}) {
  // backend routes are under /api/cheques
  const res = await api.get("/api/cheques", { params });
  return res.data;
}

/**
 * Get single cheque
 */
export async function getCheque(id) {
  const res = await api.get(`/api/cheques/${id}`);
  return res.data;
}

/**
 * Create new cheque
 */
export async function createCheque(payload) {
  const res = await api.post("/api/cheques", payload);
  return res.data;
}

/**
 * Update cheque
 */
export async function updateCheque(id, payload) {
  const res = await api.put(`/api/cheques/${id}`, payload);
  return res.data;
}

/**
 * Delete cheque
 */
export async function deleteCheque(id) {
  const res = await api.delete(`/api/cheques/${id}`);
  return res.data;
}

/**
 * Approve cheque (Manager/Admin only, enforced by backend)
 */
export async function approveCheque(id) {
  const res = await api.post(`/api/cheques/${id}/approve`);
  return res.data;
}

/**
 * Cancel cheque (Manager/Admin only, enforced by backend)
 */
export async function cancelCheque(id) {
  const res = await api.post(`/api/cheques/${id}/cancel`);
  return res.data;
}

/**
 * Pending cheques for approvals
 *
 * ALWAYS fetch all from backend and filter on frontend,
 * so behaviour is identical local + Render.
 */
export async function getPendingCheques() {
  const data = await getCheques(); // no server status filter
  const list = Array.isArray(data) ? data : data?.cheques || [];

  return list.filter((ch) => {
    const st = String(ch.status || "").trim().toLowerCase();
    return (
      st === "draft" ||
      st === "pending" ||
      st === "pendingapproval" ||
      st === "pending_approval" ||
      st === "pending approval" // safety: with space
    );
  });
}

/**
 * Dashboard summary – built on frontend from /api/cheques list
 */
export async function getDashboardSummary() {
  const data = await getCheques();

  // backend may return array or { cheques: [...] }
  const list = Array.isArray(data) ? data : data?.cheques || [];

  const stats = {
    payeesCount: 0,
    banksCount: 0,
    bankAccountsCount: 0,
    chequeLayoutsCount: 0,
    chequeBooksCount: 0,
    chequesCount: 0,
    status: {
      draft: 0,
      pendingApproval: 0,
      approved: 0,
      printed: 0,
      returned: 0,
      stopped: 0,
      today: 0,
      month: 0,
    },
    recent: [],
  };

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const thisMonth = today.getMonth();
  const thisYear = today.getFullYear();

  const payeesSet = new Set();
  const banksSet = new Set();

  list.forEach((ch) => {
    stats.chequesCount += 1;

    const beneficiary =
      ch.beneficiary || ch.beneficiaryName || ch.payee || ch.name;
    if (beneficiary) payeesSet.add(String(beneficiary).trim());

    const bank = ch.bank || ch.bankName;
    if (bank) banksSet.add(String(bank).trim());

    const st = String(ch.status || "").toLowerCase();

    // PENDING APPROVAL = Pending + Draft + PendingApproval variants
    if (
      st === "draft" ||
      st === "pending" ||
      st === "pendingapproval" ||
      st === "pending_approval"
    ) {
      stats.status.draft += 1; // we reuse draft counter for "to be approved"
      stats.status.pendingApproval += 1;
    } else if (st === "approved") {
      stats.status.approved += 1;
    } else if (st === "printed" || st === "completed") {
      stats.status.printed += 1;
    } else if (st === "returned" || st === "rejected") {
      stats.status.returned += 1;
    } else if (st === "cancelled" || st === "stopped") {
      stats.status.stopped += 1;
    }

    // last activity date (printed > approved > updated > created)
    const d =
      ch.printedAt || ch.approvedAt || ch.updatedAt || ch.createdAt;
    const dt = d ? new Date(d) : null;

    if (dt && !isNaN(dt)) {
      const dayStr = dt.toISOString().slice(0, 10);
      if (dayStr === todayStr) stats.status.today += 1;
      if (dt.getFullYear() === thisYear && dt.getMonth() === thisMonth) {
        stats.status.month += 1;
      }
    }
  });

  stats.payeesCount = payeesSet.size;
  stats.banksCount = banksSet.size;

  // sort recent cheques (latest first)
  const recentSorted = [...list].sort((a, b) => {
    const da = a.updatedAt || a.createdAt;
    const db = b.updatedAt || b.createdAt;
    const daDate = da ? new Date(da) : null;
    const dbDate = db ? new Date(db) : null;

    if (daDate && dbDate) return dbDate - daDate;
    if (dbDate && !daDate) return 1;
    if (daDate && !dbDate) return -1;

    const ida = Number(a.id || 0);
    const idb = Number(b.id || 0);
    return idb - ida;
  });

  stats.recent = recentSorted.slice(0, 5).map((ch) => ({
    id: ch.id,
    date: ch.createdAt || ch.updatedAt || "",
    number: ch.chequeNumber || ch.chequeNo || ch.number || "",
    beneficiary:
      ch.beneficiary || ch.beneficiaryName || ch.payee || ch.name || "",
    bank: ch.bank || ch.bankName || "",
    amount: ch.amount ?? ch.total ?? "",
    status: ch.status || "",
  }));

  return stats;
}
// END OF FILE
