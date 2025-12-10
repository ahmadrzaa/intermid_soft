// frontend/src/pages/Checks/New.jsx
import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { API_ROOT } from "../../services/api";

// Use the same backend root URL that axios uses
const API_BASE = API_ROOT;

const NewCheque = () => {
  const location = useLocation();

  // Read query params from /app/checks/new?... (coming from list)
  const query = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const idFromQuery = query.get("id") || "";
  const bankFromQuery = query.get("bank") || "";
  const approvedFromQuery = query.get("approved") || "";
  const modeFromQuery = query.get("mode") || "";

  // Build iframe URL to cheque_bbk.html
  const iframeSrc = useMemo(() => {
    const params = new URLSearchParams();

    // Only send bank if we have it (when coming from list)
    if (bankFromQuery) params.set("bank", bankFromQuery);
    if (idFromQuery) params.set("id", idFromQuery);
    if (approvedFromQuery) params.set("approved", approvedFromQuery);

    // mode: from URL, otherwise "view" when id exists, else "new"
    const mode = modeFromQuery || (idFromQuery ? "view" : "new");
    params.set("mode", mode);

    // VERY IMPORTANT: pass backend API root into the iframe
    // cheque_bbk.html JS will call: `${apiBase}/api/cheques`
    params.set("apiBase", API_BASE);

    return `/cheque_bbk.html?${params.toString()}`;
  }, [idFromQuery, bankFromQuery, approvedFromQuery, modeFromQuery]);

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Direct iframe – bank dropdown is INSIDE cheque_bbk.html only */}
      <div style={{ flex: 1 }}>
        <iframe
          title="Write Cheque"
          src={iframeSrc}
          style={{
            width: "100%",
            height: "100%",
            border: "none",
          }}
        />
      </div>
    </div>
  );
};

export default NewCheque;
