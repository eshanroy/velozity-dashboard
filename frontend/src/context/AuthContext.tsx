import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api, setAccessToken } from "../api/client";
import type { LoginResponse, User } from "../types/auth";

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({
  children,
}: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (
    email: string,
    password: string
  ) => {
    const response = await api.post<LoginResponse>(
      "/auth/login",
      {
        email,
        password,
      }
    );

    const { user, accessToken } = response.data;

    setUser(user);
    setToken(accessToken);
    setAccessToken(accessToken);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setUser(null);
      setToken(null);
      setAccessToken(null);
    }
  };

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const refreshResponse = await api.post<{
          accessToken: string;
        }>("/auth/refresh");

        const newAccessToken =
          refreshResponse.data.accessToken;

        setToken(newAccessToken);
        setAccessToken(newAccessToken);

        const userResponse = await api.get<{ user: User }>(
          "/user/me"
        );

        setUser(userResponse.data.user);
      } catch {
        setUser(null);
        setToken(null);
        setAccessToken(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};