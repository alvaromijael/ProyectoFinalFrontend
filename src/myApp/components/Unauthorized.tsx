import React from "react";
import { useNavigate } from "react-router-dom";

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        textAlign: "center",
        padding: "0 20px",
      }}
    >
      <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>🚫 No Autorizado</h1>
      <p style={{ fontSize: "1.2rem", marginBottom: "2rem" }}>
        No tienes permisos para acceder a esta página.
      </p>
      <button
        style={{
          padding: "10px 20px",
          fontSize: "1rem",
          cursor: "pointer",
          borderRadius: "5px",
          border: "none",
          backgroundColor: "#007bff",
          color: "#fff",
        }}
        onClick={() => navigate("/home")}
      >
        Volver al inicio
      </button>
    </div>
  );
};

export default Unauthorized;
