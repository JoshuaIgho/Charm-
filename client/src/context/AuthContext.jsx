import { createContext, useContext, useState, useEffect } from "react";
import apiService from "../services/apiService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const storedAdmin = localStorage.getItem("adminData");
    if (token && storedAdmin) setAdmin(JSON.parse(storedAdmin));
    setIsInitialized(true);
  }, []);

  const loginWithGoogle = async (idToken) => {
    const res = await apiService.googleAdminLogin(idToken);
    if (res.success) {
      setAdmin(res.admin);
      localStorage.setItem("adminToken", res.token);
      localStorage.setItem("adminData", JSON.stringify(res.admin));
    }
    return res;
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
  };

  return (
    <AuthContext.Provider value={{ admin, isInitialized, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
