import React from "react";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../../auth/context/AuthContext";

interface PrivateRouteProps {
  children: ReactNode;
  roles?: string | string[]; // roles permitidos, opcional
  loginPath?: string; // ruta a login, opcional
  unauthorizedPath?: string; // ruta si no tiene rol, opcional
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  roles,
  loginPath = "/auth/login",
  unauthorizedPath = "/unauthorized",
}) => {
  const { user, loading, hasRole } = useAuthContext();
  const location = useLocation();

  if (loading) return <p>Cargando...</p>;

  // No autenticado → redirigir a login
  if (!user) {
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // Roles especificados → validar con hasRole
  if (roles && !hasRole(roles)) {
    return <Navigate to={unauthorizedPath} replace />;
  }

  // Autenticado y autorizado
  return <>{children}</>;
};

export default PrivateRoute;
