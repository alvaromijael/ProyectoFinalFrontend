import { LockOutlined, MailOutlined, GoogleOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, Typography, Space } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { useState } from "react";

const { Title, Text } = Typography;

interface LoginFormData {
  email: string;
  password: string;
}

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogleContext } = useAuthContext();
  const [messageError, setmessageError] = useState("");
  const [form] = Form.useForm();

  const onFinish = async (values: LoginFormData) => {
    try {
      const user = await login(values.email, values.password);
      if (user) navigate("/home");
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setmessageError("Usuario o contraseña inválida");
      form.resetFields();
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const user = await loginWithGoogleContext();
      if (user) navigate("/home", { replace: true });
    } catch (error) {
      console.error("Error con login de Google:", error);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #2C2A6C, #226B6D, #D14B4B)", 
      }}
    >
      <Card
        bordered={false}
        style={{
          width: "90%",
          maxWidth: "750px",
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          background: "#f5f5f5",
          padding: "15px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Title
          level={3}
          style={{ color: "#333", marginBottom: "16px", textAlign: "center" }}
        >
          Iniciar Sesión
        </Title>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap", // Permite que los elementos se apilen en pantallas pequeñas
            justifyContent: "center",
          }}
        >
          {/* Formulario */}
          <div style={{ flex: "2 1 300px", minWidth: "300px" }}>
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Form.Item
                label={
                  <span style={{ color: "#333" }}>Correo electrónico</span>
                }
                name="email"
                rules={[
                  { required: true, message: "Por favor ingresa tu correo" },
                  { type: "email", message: "Correo inválido" },
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="correo@mail.com"
                  style={{
                    background: "#eaeaea",
                    color: "#333",
                    borderRadius: "8px",
                    border: "none",
                    padding: "8px",
                  }}
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: "#333" }}>Contraseña</span>}
                name="password"
                rules={[
                  {
                    required: true,
                    message: "Por favor ingresa tu contraseña",
                  },
                  { min: 6, message: "Debe tener al menos 6 caracteres" },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder=""
                  style={{
                    background: "#eaeaea",
                    color: "#333",
                    borderRadius: "8px",
                    border: "none",
                    padding: "8px",
                  }}
                />
              </Form.Item>

              <Form.Item>
                <Space direction="vertical" style={{ width: "100%" }}>
                  {messageError && (
                    <Text
                      type="danger"
                      style={{
                        display: "block",
                        textAlign: "center",
                        marginBottom: 10,
                        color: "#cc3333",
                      }}
                    >
                      {messageError}
                    </Text>
                  )}
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    style={{
                      background: "#333",
                      color: "#fff",
                      borderRadius: "8px",
                    }}
                  >
                    Iniciar sesión
                  </Button>
                  <Button
                    icon={<GoogleOutlined />}
                    onClick={handleGoogleLogin}
                    block
                    style={{
                      background: "#eaeaea",
                      color: "#333",
                      borderRadius: "8px",
                    }}
                  >
                    Iniciar con Google
                  </Button>
                </Space>
              </Form.Item>
            </Form>

            <Text
              style={{ display: "block", textAlign: "center", color: "#333" }}
            >
              ¿No tienes cuenta?{" "}
              <Link to="/auth/register" style={{ fontWeight: 500 }}>
                Regístrate
              </Link>
            </Text>
          </div>

          <div
            style={{
              flex: "1 1 200px",
              minWidth: "200px",
              position: "relative",
              left: "15%",
              display: "flex",
              justifyContent: "flex-end",
            }}
            className="logo-container"
          >
            <img
              src="/LogoFenix-09.png"
              alt="FlatFinder"
              style={{
                width: "200px",
                height: "200px",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};
