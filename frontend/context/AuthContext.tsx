"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { getMe, logoutUser, refreshAccessToken } from "@/lib/api";
import { getAccessToken, setAccessToken } from "@/lib/auth";

// Access tokens expire after 15 minutes server-side; refresh well before
// that so an idle tab (e.g. its WebSocket) never sits on a dead token.
const REFRESH_INTERVAL_MS = 10 * 60 * 1000;

export type AuthUser = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  nickname?: string;
  avatar?: string;
  banner?: string;
  about_me?: string;
  birthday: string;
  is_private: boolean;
  created_at: string;
};

type AuthContextType = {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  login: async () => {},
  logout: async () => {},
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }
    getMe()
      .then(setUser)
      .catch(() => setAccessToken(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      refreshAccessToken();
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [user]);

  const login = async (token: string) => {
    setAccessToken(token);
    const me = await getMe();
    setUser(me);
  };

  const logout = async () => {
    setAccessToken(null);
    setUser(null);
    await logoutUser().catch(() => {});
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
