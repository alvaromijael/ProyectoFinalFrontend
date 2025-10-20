import {
  LockOutlined,
  MailOutlined,
  UserOutlined,
  CalendarOutlined,
  IdcardOutlined,
  CheckCircleFilled,

} from "@ant-design/icons";
import {
  Button,
  Typography,
  Input,
  Modal,
  message,
  Progress,
  Row,
  Col,
} from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import { useState } from "react";

const { Text, Title } = Typography;

type RegisterFormData = {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  cedula: string;
  birthDate: string;
};

const validateCedulaEcuatoriana = (cedula: string): boolean => {
  if (!cedula || cedula.length !== 10) return false;
  if (!/^\d+$/.test(cedula)) return false;
  const provincia = parseInt(cedula.substring(0, 2));
  if (provincia < 1 || provincia > 24) return false;
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;
  for (let i = 0; i < 9; i++) {
    let valor = parseInt(cedula[i]) * coeficientes[i];
    if (valor >= 10) valor -= 9;
    suma += valor;
  }
  const digitoVerificador = suma % 10 === 0 ? 0 : 10 - (suma % 10);
  return digitoVerificador === parseInt(cedula[9]);
};

const getPasswordStrength = (password: string) => {
  if (!password) return { percent: 0, status: "exception", text: "" };
  let score = 0;
  if (password.length >= 8) score += 25;
  if (/[a-z]/.test(password)) score += 25;
  if (/[A-Z]/.test(password)) score += 25;
  if (/\d/.test(password)) score += 15;
  if (/[^A-Za-z0-9]/.test(password)) score += 10;
  
  if (score < 40) return { percent: score, status: "exception", text: "Débil" };
  if (score < 70) return { percent: score, status: "normal", text: "Media" };
  return { percent: score, status: "success", text: "Fuerte" };
};

export const RegisterPage = () => {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const navigate = useNavigate();
  const [passwordStrength, setPasswordStrength] = useState({ percent: 0, status: "exception" as any, text: "" });
  const passwordValue = watch("password");

  const onSubmit = async (data: RegisterFormData) => {
    if (data.password !== data.confirmPassword) {
      message.error("Las contraseñas no coinciden");
      return;
    }

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        cedula: data.cedula,
        password: data.password,
        birth_date: data.birthDate,
      });

      if (response.status === 200 || response.status === 201) {
        Modal.success({
          title: "¡Registro exitoso!",
          content: "Tu cuenta fue creada correctamente. Ahora puedes iniciar sesión.",
          onOk: () => navigate("/auth/login"),
          okText: "Iniciar sesión",
          icon: <CheckCircleFilled style={{ color: "#52c41a" }} />,
        });
      }
    } catch (error: any) {
      const backendMessage =
        error.response?.data?.detail || "Error inesperado desde el servidor.";

      Modal.error({
        title: "Error al registrar",
        content: backendMessage,
      });
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #2C2A6C, #226B6D, #D14B4B)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1100,
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          borderRadius: 24,
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          overflow: "hidden",
        }}
      >
        <Row style={{ minHeight: "85vh" }}>
          {/* COLUMNA IZQUIERDA - Hero Section */}
          <Col
            xs={24}
            lg={10}
            style={{
              background: "linear-gradient(135deg, #2C2A6C, #226B6D, #ea5153)",
              padding: "50px 40px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              color: "white",
            }}
          >
            <div>
              {/* Logo de la clínica */}
              <div style={{ marginBottom: 30, display:"flex",
              justifyContent: "center"}}>
                <img 
                  src="/LogoFenix-13.png" 
                  alt="Logo Clínica" 
                  style={{ 
                    maxWidth: "180px", 
                    height: "auto",
                    //filter: "brightness(0) invert(1)" // Hace el logo blanco
                  }} 
                />
              </div>
              
              <Title level={1} style={{ color: "white", fontSize: 42, margin: 0, fontWeight: 700 }}>
                Bienvenido
              </Title>
              <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 18, display: "block", marginTop: 12 }}>
                Únete a nuestra plataforma y comienza tu viaje hoy mismo
              </Text>
              <div style={{ marginTop: 40, opacity: 0.8 }}>
                <div style={{ marginBottom: 20, display: "flex", alignItems: "center" }}>
                  <CheckCircleFilled style={{ fontSize: 24, marginRight: 12 }} />
                  <Text style={{ color: "white", fontSize: 15 }}>Acceso instantáneo</Text>
                </div>
                <div style={{ marginBottom: 20, display: "flex", alignItems: "center" }}>
                  <CheckCircleFilled style={{ fontSize: 24, marginRight: 12 }} />
                  <Text style={{ color: "white", fontSize: 15 }}>100% seguro y confiable</Text>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <CheckCircleFilled style={{ fontSize: 24, marginRight: 12 }} />
                  <Text style={{ color: "white", fontSize: 15 }}>Soporte 24/7</Text>
                </div>
              </div>
            </div>
          </Col>

          {/* COLUMNA DERECHA - Formulario */}
          <Col xs={24} lg={14} style={{ padding: "40px 50px" }}>
            <div style={{ textAlign: "center", marginBottom: 30 }}>
              <Title level={2} style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>
                Crear Cuenta
              </Title>
              <Text type="secondary" style={{ fontSize: 14 }}>
                Completa los siguientes datos
              </Text>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <Row gutter={16}>
                <Col span={12}>
                  <Controller
                    name="firstName"
                    control={control}
                    rules={{ required: "Requerido", minLength: { value: 2, message: "Mín. 2 caracteres" } }}
                    render={({ field }) => (
                      <div style={{ marginBottom: 16 }}>
                        <Input
                          {...field}
                          size="large"
                          placeholder="Nombre"
                          prefix={<UserOutlined />}
                          status={errors.firstName ? "error" : ""}
                          style={{ borderRadius: 12, height: 48 }}
                        />
                        {errors.firstName && (
                          <Text type="danger" style={{ fontSize: 12 }}>{errors.firstName.message}</Text>
                        )}
                      </div>
                    )}
                  />
                </Col>

                <Col span={12}>
                  <Controller
                    name="lastName"
                    control={control}
                    rules={{ required: "Requerido", minLength: { value: 2, message: "Mín. 2 caracteres" } }}
                    render={({ field }) => (
                      <div style={{ marginBottom: 16 }}>
                        <Input
                          {...field}
                          size="large"
                          placeholder="Apellido"
                          prefix={<UserOutlined />}
                          status={errors.lastName ? "error" : ""}
                          style={{ borderRadius: 12, height: 48 }}
                        />
                        {errors.lastName && (
                          <Text type="danger" style={{ fontSize: 12 }}>{errors.lastName.message}</Text>
                        )}
                      </div>
                    )}
                  />
                </Col>

                <Col span={12}>
                  <Controller
                    name="email"
                    control={control}
                    rules={{
                      required: "Requerido",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Email inválido",
                      },
                    }}
                    render={({ field }) => (
                      <div style={{ marginBottom: 16 }}>
                        <Input
                          {...field}
                          size="large"
                          placeholder="Correo electrónico"
                          prefix={<MailOutlined />}
                          status={errors.email ? "error" : ""}
                          style={{ borderRadius: 12, height: 48 }}
                        />
                        {errors.email && (
                          <Text type="danger" style={{ fontSize: 12 }}>{errors.email.message}</Text>
                        )}
                      </div>
                    )}
                  />
                </Col>

                <Col span={12}>
                  <Controller
                    name="cedula"
                    control={control}
                    rules={{
                      required: "Requerido",
                      pattern: {
                        value: /^\d{10}$/,
                        message: "10 dígitos",
                      },
                      validate: (value) => validateCedulaEcuatoriana(value) || "Cédula inválida",
                    }}
                    render={({ field }) => (
                      <div style={{ marginBottom: 16 }}>
                        <Input
                          {...field}
                          size="large"
                          placeholder="Cédula"
                          prefix={<IdcardOutlined />}
                          maxLength={10}
                          status={errors.cedula ? "error" : ""}
                          style={{ borderRadius: 12, height: 48 }}
                        />
                        {errors.cedula && (
                          <Text type="danger" style={{ fontSize: 12 }}>{errors.cedula.message}</Text>
                        )}
                      </div>
                    )}
                  />
                </Col>

                <Col span={12}>
                  <Controller
                    name="birthDate"
                    control={control}
                    rules={{ required: "Requerido" }}
                    render={({ field }) => (
                      <div style={{ marginBottom: 16 }}>
                        <Input
                          {...field}
                          size="large"
                          type="date"
                          prefix={<CalendarOutlined />}
                          status={errors.birthDate ? "error" : ""}
                          style={{ borderRadius: 12, height: 48 }}
                        />
                        {errors.birthDate && (
                          <Text type="danger" style={{ fontSize: 12 }}>{errors.birthDate.message}</Text>
                        )}
                      </div>
                    )}
                  />
                </Col>

                <Col span={12}>
                  <Controller
                    name="password"
                    control={control}
                    rules={{
                      required: "Requerido",
                      minLength: { value: 6, message: "Mín. 6 caracteres" },
                    }}
                    render={({ field }) => (
                      <div style={{ marginBottom: 16 }}>
                        <Input.Password
                          {...field}
                          size="large"
                          placeholder="Contraseña"
                          prefix={<LockOutlined />}
                          status={errors.password ? "error" : ""}
                          onChange={(e) => {
                            field.onChange(e);
                            setPasswordStrength(getPasswordStrength(e.target.value));
                          }}
                          style={{ borderRadius: 12, height: 48 }}
                        />
                        {passwordValue && passwordValue.length > 0 && (
                          <Progress
                            percent={passwordStrength.percent}
                            status={passwordStrength.status}
                            showInfo={false}
                            strokeColor={
                              passwordStrength.status === "exception"
                                ? "#ff4d4f"
                                : passwordStrength.status === "normal"
                                ? "#faad14"
                                : "#52c41a"
                            }
                            size="small"
                            style={{ marginTop: 4 }}
                          />
                        )}
                        {errors.password && (
                          <Text type="danger" style={{ fontSize: 12 }}>{errors.password.message}</Text>
                        )}
                      </div>
                    )}
                  />
                </Col>

                <Col span={24}>
                  <Controller
                    name="confirmPassword"
                    control={control}
                    rules={{
                      required: "Requerido",
                      validate: (value) => value === watch("password") || "Las contraseñas no coinciden",
                    }}
                    render={({ field }) => (
                      <div style={{ marginBottom: 20 }}>
                        <Input.Password
                          {...field}
                          size="large"
                          placeholder="Confirmar contraseña"
                          prefix={<LockOutlined />}
                          status={errors.confirmPassword ? "error" : ""}
                          style={{ borderRadius: 12, height: 48 }}
                        />
                        {errors.confirmPassword && (
                          <Text type="danger" style={{ fontSize: 12 }}>{errors.confirmPassword.message}</Text>
                        )}
                      </div>
                    )}
                  />
                </Col>
              </Row>

              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                style={{
                  background: "#333",
                  border: "none",
                  borderRadius: 12,
                  height: 52,
                  fontSize: 16,
                  fontWeight: 700,
                  boxShadow: "0 8px 20px rgba(44, 42, 108, 0.5)",
                  marginBottom: 16,
                }}
              >
                Crear Cuenta
              </Button>

              <Text style={{ display: "block", textAlign: "center", fontSize: 14 }}>
                ¿Ya tienes cuenta?{" "}
                <Link to="/auth/login" style={{ fontWeight: 600, color: "#2C2A6C" }}>
                  Inicia sesión
                </Link>
              </Text>
            </form>
          </Col>
        </Row>
      </div>
    </div>
  );
};