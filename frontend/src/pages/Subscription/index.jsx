// frontend/src/pages/Subscription/index.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../AuthContext";
import "./subscription.css";

import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function safeParseDate(v) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}
function daysLeft(toDate) {
  if (!toDate) return null;
  const now = new Date();
  const ms = toDate.getTime() - now.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export default function SubscriptionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState(null);
  const [error, setError] = useState("");

  // modal embedded checkout state
  const [showPay, setShowPay] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [pendingSessionId, setPendingSessionId] = useState("");
  const [payLoading, setPayLoading] = useState("");

  const returnedSessionId = params.get("session_id") || "";

  const isAdmin = String(user?.role || "").toLowerCase() === "admin";

  const localFallback = useMemo(() => {
    const trialEndsAt = safeParseDate(user?.trialEndsAt) || null;
    return { trialEndsAt };
  }, [user]);

  async function loadStatus() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/subscription/status");
      setInfo(res.data);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Failed to load subscription");
    } finally {
      setLoading(false);
    }
  }

  async function confirmPayment(sessionId) {
    if (!sessionId) return;
    try {
      await api.post("/api/subscription/confirm", { session_id: sessionId });
      await loadStatus();
      // close modal on success
      setShowPay(false);
      setClientSecret("");
      setPendingSessionId("");
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Could not confirm payment");
    }
  }

  useEffect(() => {
    loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If Stripe returns with session_id in URL (return_url), confirm it
  useEffect(() => {
    if (returnedSessionId) confirmPayment(returnedSessionId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [returnedSessionId]);

  async function startEmbeddedCheckout(plan) {
    try {
      setPayLoading(plan);
      setError("");

      if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
        throw new Error("Missing VITE_STRIPE_PUBLISHABLE_KEY in frontend .env");
      }

      const res = await api.post("/api/subscription/checkout", { plan });
      const cs = res?.data?.clientSecret;
      const sid = res?.data?.sessionId;

      if (!cs || !sid) throw new Error("Stripe session not created properly");

      setClientSecret(cs);
      setPendingSessionId(sid);
      setShowPay(true);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Payment gateway error");
    } finally {
      setPayLoading("");
    }
  }

  const status = info?.status || "trial";
  const locked = status === "locked";
  const pastDue = status === "past_due";

  const trialEndDate = safeParseDate(info?.trialEndsAt) || localFallback.trialEndsAt;
  const periodEndDate = safeParseDate(info?.periodEndsAt);
  const graceEndDate = safeParseDate(info?.graceEndsAt);

  const trialDays = daysLeft(trialEndDate);
  const periodDays = daysLeft(periodEndDate);
  const graceDays = daysLeft(graceEndDate);

  return (
    <div className="sub-page">
      <div className="sub-header">
        <div>
          <h1 className="sub-title">Subscription / Billing</h1>
          <p className="sub-subtitle">Trial 10 days → Monthly BHD 5 → Yearly BHD 110</p>
        </div>

        <div className="sub-actions">
          <button className="sub-btn" onClick={() => navigate("/app/dashboard")}>
            Back to Dashboard
          </button>
          <button className="sub-btn" onClick={loadStatus}>
            Refresh Status
          </button>
        </div>
      </div>

      {loading && <div className="sub-card">Loading subscription status…</div>}
      {!loading && error && <div className="sub-alert sub-alert-error">{error}</div>}

      {!loading && !error && (
        <>
          <div className={"sub-alert " + (locked ? "sub-alert-locked" : pastDue ? "sub-alert-warn" : "sub-alert-ok")}>
            <div className="sub-alert-title">
              Status: <b>{locked ? "LOCKED" : pastDue ? "PAST DUE" : "ACTIVE"}</b>
            </div>
            <div className="sub-alert-text">{info?.reason || "—"}</div>
          </div>

          <div className="sub-grid">
            <div className="sub-card">
              <div className="sub-card-title">Your Plan</div>

              <div className="sub-kv"><span>Plan</span><b>{String(info?.plan || "trial").toUpperCase()}</b></div>
              <div className="sub-kv"><span>Trial ends</span><b>{trialEndDate ? trialEndDate.toLocaleString() : "—"}</b></div>
              <div className="sub-kv"><span>Trial days left</span><b>{trialDays == null ? "—" : Math.max(0, trialDays)}</b></div>
              <div className="sub-kv"><span>Period ends</span><b>{periodEndDate ? periodEndDate.toLocaleString() : "—"}</b></div>
              <div className="sub-kv"><span>Days left</span><b>{periodDays == null ? "—" : Math.max(0, periodDays)}</b></div>
              <div className="sub-kv"><span>Grace ends</span><b>{graceEndDate ? graceEndDate.toLocaleString() : "—"}</b></div>
              <div className="sub-kv"><span>Grace days left</span><b>{graceDays == null ? "—" : Math.max(0, graceDays)}</b></div>

              {isAdmin && <div className="sub-note">Admin is not blocked. You can test payments safely.</div>}
            </div>

            <div className="sub-card">
              <div className="sub-card-title">Pay (Inside App)</div>

              <div className="sub-plan">
                <div>
                  <div className="sub-plan-name">Monthly</div>
                  <div className="sub-plan-price">BHD 5 / month</div>
                  <div className="sub-plan-desc">Pay inside app. Stripe charges AED (your Stripe account currency).</div>
                </div>
                <button
                  className="sub-btn sub-btn-primary"
                  type="button"
                  disabled={!!payLoading}
                  onClick={() => startEmbeddedCheckout("monthly")}
                >
                  {payLoading === "monthly" ? "Opening…" : "Pay Monthly"}
                </button>
              </div>

              <div className="sub-plan">
                <div>
                  <div className="sub-plan-name">Yearly</div>
                  <div className="sub-plan-price">BHD 110 / year</div>
                  <div className="sub-plan-desc">Pay inside app. Stripe charges AED (your Stripe account currency).</div>
                </div>
                <button
                  className="sub-btn sub-btn-primary"
                  type="button"
                  disabled={!!payLoading}
                  onClick={() => startEmbeddedCheckout("yearly")}
                >
                  {payLoading === "yearly" ? "Opening…" : "Pay Yearly"}
                </button>
              </div>

              <div className="sub-instructions">
                <div className="sub-instructions-title">Notes</div>
                <ul>
                  <li>No redirect — opens inside the app.</li>
                  <li>Webhook is optional (we confirm payment from the session).</li>
                  <li>If status doesn’t update, click <b>Refresh Status</b>.</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ✅ MODAL EMBEDDED CHECKOUT (keeps layout perfect) */}
      {showPay && clientSecret && (
        <div className="sub-modal-backdrop" onMouseDown={() => setShowPay(false)}>
          <div className="sub-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="sub-modal-head">
              <div className="sub-modal-title">Complete Payment</div>
              <button
                className="sub-btn"
                onClick={() => {
                  setShowPay(false);
                  setClientSecret("");
                  setPendingSessionId("");
                }}
              >
                Close
              </button>
            </div>

            <div className="sub-modal-body">
              <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={{
                  clientSecret,
                  onComplete: () => confirmPayment(pendingSessionId),
                }}
              >
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </div>

            <div className="sub-modal-foot">
              After payment, we confirm automatically and activate your plan.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
