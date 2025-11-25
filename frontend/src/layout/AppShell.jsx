import Sidebar from "./Sidebar";
import "./shell.css";

export default function AppShell({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">{children}</main>
    </div>
  );
}
