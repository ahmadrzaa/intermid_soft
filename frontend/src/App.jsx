// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthProvider, { useAuth } from "./AuthContext";
import "./styles/base.css";

/* Layout */
import Home from "./pages/Home";
import AppLayout from "./layout/AppLayout";

/* Auth pages */
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

/* App pages */
import Dashboard from "./pages/Dashboard";
import ChecksIndex from "./pages/Checks";
import NewCheque from "./pages/Checks/New";
import ApprovalsPage from "./pages/Approvals";
import BeneficiariesPage from "./pages/Beneficiaries";
import HistoryPage from "./pages/History";
import SettingsPage from "./pages/Settings";
import BBK from "./pages/Checks/BBK";

/* Guard */
function Private({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes – landing + auth */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected app routes under /app/* */}
          <Route
            path="/app"
            element={
              <Private>
                <AppLayout />
              </Private>
            }
          >
            {/* default /app -> /app/dashboard */}
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* Cheques */}
            <Route path="checks">
              <Route index element={<ChecksIndex />} />
              <Route path="new" element={<NewCheque />} />
            </Route>

            {/* BBK cheque page */}
            <Route path="cheques/bbk" element={<BBK />} />

            {/* Other pages */}
            <Route path="approvals" element={<ApprovalsPage />} />
            <Route path="beneficiaries" element={<BeneficiariesPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
