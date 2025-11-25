// frontend/src/services/beneficiaries.js
// PURE JS SERVICE – connects to /api/beneficiaries

import api from "./api";

/**
 * List beneficiaries (optional params: { q, limit })
 */
export async function listBeneficiaries(params = {}) {
  const res = await api.get("/api/beneficiaries", { params });
  return res.data;
}

/**
 * Create beneficiary
 * payload: { name, alias?, hideByDefault?, notes? }
 */
export async function createBeneficiary(payload) {
  const res = await api.post("/api/beneficiaries", payload);
  return res.data;
}

/**
 * Update beneficiary
 */
export async function updateBeneficiary(id, payload) {
  const res = await api.put(`/api/beneficiaries/${id}`, payload);
  return res.data;
}

/**
 * Delete beneficiary
 */
export async function deleteBeneficiary(id) {
  const res = await api.delete(`/api/beneficiaries/${id}`);
  return res.data;
}
