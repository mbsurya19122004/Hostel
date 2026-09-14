import React, { createContext, useContext, useEffect, useState } from "react";
import * as api from "../api/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("hostelly_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) localStorage.setItem("hostelly_user", JSON.stringify(user));
    else localStorage.removeItem("hostelly_user");
  }, [user]);

  const login = (userData) => setUser(userData);

  const logoutUser = async () => {
    try {
      await api.logout();
    } catch {
      // ignore network errors on logout, clear locally regardless
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout: logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
