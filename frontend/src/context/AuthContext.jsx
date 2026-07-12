import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")) || null);
  const [company, setCompany] = useState(() => JSON.parse(localStorage.getItem("company")) || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then(({ data }) => {
        setUser(data.data.user);
        setCompany(data.data.company);
        localStorage.setItem("user", JSON.stringify(data.data.user));
        localStorage.setItem("company", JSON.stringify(data.data.company));
      })
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
        setCompany(null);
      })
      .finally(() => setLoading(false));
  }, []);

  function persistSession({ token, user, company }) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("company", JSON.stringify(company));
    setUser(user);
    setCompany(company);
  }

  async function registerCompany(payload) {
    const { data } = await api.post("/auth/register-company", payload);
    persistSession(data.data);
    return data.data.user;
  }

  async function login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    persistSession(data.data);
    return data.data.user;
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("company");
    setUser(null);
    setCompany(null);
  }

  function hasRole(...roles) {
    return !!user && user.roles.some((r) => roles.includes(r));
  }

  return (
    <AuthContext.Provider value={{ user, company, loading, registerCompany, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);