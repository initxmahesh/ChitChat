import { useState, useEffect, useCallback } from "react";
import { AuthContext } from "./AuthContext";

const API_URL = "/api/auth";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/me`, { credentials: "include" });
      if (res.ok) {
        setUser(await res.json());
      }
    } catch {
      // not authenticated
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    setUser(data);
    return data;
  };

  const register = async (fullName, username, email, password) => {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ fullName, username, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    setUser(data);
    return data;
  };

  const updateProfile = async (updates) => {
    const res = await fetch(`${API_URL}/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    setUser(data);
    return data;
  };

  const logout = async () => {
    await fetch(`${API_URL}/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  };

  const deleteAccount = async () => {
    const res = await fetch(`${API_URL}/account`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateProfile, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}
