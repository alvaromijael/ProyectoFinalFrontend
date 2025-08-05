import { Card, Typography } from "antd";
import type { ReactNode } from "react";

const { Title } = Typography;

interface AuthLayoutProps {
  children: ReactNode;
  description?: string;
}
export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  description = "",
}) => {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f0f2f5",
        padding: "20px",
      }}
    >
      <Card
        bordered={false}
        style={{
          width: 500,
          borderRadius: 12,
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
          backgroundColor: "#ffffff",
        }}
      >
        {description && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img
              src="/logo1.png" // Asegúrate de que la ruta es correcta
              alt="Logo"
              style={{ width: "60px", height: "60px", objectFit: "contain" }}
            />
            <Title level={3} style={{ marginBottom: 0 }}>
              {description}
            </Title>
          </div>
        )}
        {children}
      </Card>
    </div>
  );
};