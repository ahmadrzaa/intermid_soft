// frontend/src/AuthContext.jsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import api from "./services/api";

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export default function AuthProvider({ children }) {
  // USER + TOKEN -------------------------------------------------
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(
    () => localStorage.getItem("token") || ""
  );

  const [isAuthenticated, setAuth] = useState(() => !!(token && user));

  // THEME (light / dark) -----------------------------------------
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );

  // apply theme to <html data-theme="light|dark">
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // validate token on first mount --------------------------------
  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      if (!token) return;
      try {
        const me = await api.get("/api/auth/me").then((r) => r.data);
        if (!cancelled) {
          setUser(me);
          setAuth(true);
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          setToken("");
          setAuth(false);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
    }

    hydrate();
    return () => {
      cancelled = true;
    };
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // AUTH API ------------------------------------------------------
  // login({ email, password, remember? })
  const login = useCallback(
    async ({ email, password, remember = true }) => {
      const { token, user } = await api
        .post("/api/auth/login", { email, password })
        .then((r) => r.data);

      if (remember) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }

      setToken(token);
      setUser(user);
      setAuth(true);
      return user;
    },
    []
  );

  // register({ name, email, mobile, role, password })
  // (company is not used in backend now)
  const register = useCallback(
    async ({ name, email, mobile, role, password }) => {
      const { token, user } = await api
        .post("/api/auth/register", { name, email, mobile, role, password })
        .then((r) => r.data);

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setToken(token);
      setUser(user);
      setAuth(true);
      return user;
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken("");
    setUser(null);
    setAuth(false);
  }, []);

  return (
    <Ctx.Provider
      value={{
        user,
        token,
        isAuthenticated,
        login,
        register,
        logout,
        theme,
        setTheme,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
