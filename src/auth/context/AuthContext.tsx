import React, { createContext, useContext, useState, useEffect } from "react";
import type { AppUser } from "../interfaces/AppUser";
import { loginUser,  registerUser,
  loginWithGoogle } from "../services/AuthServices";
import { useNavigate } from "react-router-dom";



interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AppUser | null>;
  registro: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: string,
  ) => Promise<AppUser | null>;
  loginWithGoogleContext: () => Promise<AppUser | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const storedUser = localStorage.getItem("authUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<AppUser | null> => {
    try {
      const { user, token } = await loginUser(email, password);
      localStorage.setItem("authToken", token);
      localStorage.setItem("authUser", JSON.stringify(user));
      setUser(user);
      return user;
    } catch (error) {
      console.error("Login error:", error);
      return null;
    }
  };

  const registro = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: string,
  ): Promise<AppUser | null> => {
    try {
      const { user, token } = await registerUser(
        email,
        password,
        firstName,
        lastName,
        role,
      );
      localStorage.setItem("authToken", token);
      localStorage.setItem("authUser", JSON.stringify(user));
      setUser(user);
      return user;
    } catch (error) {
      console.error("Registro error:", error);
      return null;
    }
  };

  const loginWithGoogleContext = async (): Promise<AppUser | null> => {
    try {
      const { user, token } = await loginWithGoogle();
      localStorage.setItem("authToken", token);
      localStorage.setItem("authUser", JSON.stringify(user));
      setUser(user);
      return user;
    } catch (error) {
      console.error("Google login error:", error);
      return null;
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, registro, loginWithGoogleContext, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};