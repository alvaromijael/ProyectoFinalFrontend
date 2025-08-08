import { Navigate } from "react-router-dom";
import { useAuthContext } from "../../auth/context/AuthContext";

import React from "react";


interface Props {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<Props> = ({ children }) => {
  const { user, loading } = useAuthContext();

  if (loading) return <p>Cargando...</p>;
  if (!user) return <Navigate to="/auth/login" replace />;

  return children;
};

export default PrivateRoute;