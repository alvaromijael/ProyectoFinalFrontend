// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import type { AppUser } from "../interfaces/AppUser";
import {
  loginUser,
  registerUser,
  loginWithGoogle,
} from "../services/AuthServices";
import { useNavigate } from "react-router-dom";



interface AuthContextType {
  user: AppUser | null;
  loading: boolean;

  // Auth actions
  login: (email: string, password: string) => Promise<AppUser | null>;
  registro: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: string
  ) => Promise<AppUser | null>;
  loginWithGoogleContext: () => Promise<AppUser | null>;
  logout: () => void;

  // actualizar usuario localmente (y localStorage)
  updateUser: (user: AppUser) => void;

  // utilidades
  hasRole: (roleOrRoles: string | string[]) => boolean;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Cargar usuario desde localStorage al iniciar la app
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("authUser");
      if (storedUser) {
        setUser(JSON.parse(storedUser) as AppUser);
      }
    } catch (err) {
      console.error("Error parsing stored authUser:", err);
      localStorage.removeItem("authUser");
    } finally {
      setLoading(false);
    }
  }, []);

  // ---- Auth actions ----

  const login = async (
    email: string,
    password: string
  ): Promise<AppUser | null> => {
    try {
      const { user: loggedUser, token } = await loginUser(email, password);
      if (!loggedUser || !token) throw new Error("Respuesta inválida del servidor");

      localStorage.setItem("authToken", token);
      localStorage.setItem("authUser", JSON.stringify(loggedUser));
      setUser(loggedUser);
      return loggedUser;
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
    role: string
  ): Promise<AppUser | null> => {
    try {
      const { user: newUser, token } = await registerUser(
        email,
        password,
        firstName,
        lastName,
        role
      );
      if (!newUser || !token) throw new Error("Respuesta inválida del servidor");

      localStorage.setItem("authToken", token);
      localStorage.setItem("authUser", JSON.stringify(newUser));
      setUser(newUser);
      return newUser;
    } catch (error) {
      console.error("Registro error:", error);
      return null;
    }
  };

  const loginWithGoogleContext = async (): Promise<AppUser | null> => {
    try {
      const { user: gUser, token } = await loginWithGoogle();
      if (!gUser || !token) throw new Error("Respuesta inválida del servidor");

      localStorage.setItem("authToken", token);
      localStorage.setItem("authUser", JSON.stringify(gUser));
      setUser(gUser);
      return gUser;
    } catch (error) {
      console.error("Google login error:", error);
      return null;
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    setUser(null);
    // navegar al login (o donde prefieras)
    navigate("/login");
  };

  // Actualiza el objeto user tanto en estado como en localStorage
  const updateUser = (updatedUser: AppUser) => {
    try {
      localStorage.setItem("authUser", JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error("updateUser error:", error);
    }
  };

  // ---- Utilidades ----

  const getToken = (): string | null => {
    return localStorage.getItem("authToken");
  };

  /**
   * hasRole: verifica si el usuario tiene al menos uno de los roles requeridos.
   * - roleOrRoles: "admin" || ["admin","manager"]
   * Dado que tu AppUser tiene role: { name: string } comparamos con role.name
   */
  const hasRole = (roleOrRoles: string | string[]): boolean => {
    // intenta usar estado; si está null, intenta leer localStorage (por recarga)
    const currentUser =
      user ??
      ((() => {
        try {
          const s = localStorage.getItem("authUser");
          return s ? (JSON.parse(s) as AppUser) : null;
        } catch {
          return null;
        }
      })());

    if (!currentUser || !currentUser.role) return false;

    const userRoleName = currentUser.role.name;
    const requiredRoles = Array.isArray(roleOrRoles) ? roleOrRoles : [roleOrRoles];

    return requiredRoles.some((r) => r === userRoleName);
  };

  // ---- Provider ----
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        registro,
        loginWithGoogleContext,
        logout,
        updateUser,
        hasRole,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook de consumo
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
