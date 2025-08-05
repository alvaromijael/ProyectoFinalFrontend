import React from "react";
import {
  LockOutlined,
  MailOutlined,
  UserOutlined,
  GoogleOutlined,
} from "@ant-design/icons";
import { Button, Card, Typography, Space, Input, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useAuthContext } from "../context/AuthContext";
import { AuthLayout } from "../component/AuthLayout";

const { Title, Text } = Typography;

type RegisterFormData = {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
};

export const RegisterPage = () => {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const navigate = useNavigate();
  const { registro, loginWithGoogleContext } = useAuthContext();

  const onSubmit = async (data: RegisterFormData) => {
    if (data.password !== data.confirmPassword) {
      message.error("Las contraseñas no coinciden");
      return;
    }

    try {
      const user = await registro(
        data.email,
        data.password,
        data.firstName,
        data.lastName,
        "user"
      );
      if (user) {
        message.success("Registro exitoso");
        navigate("/auth/login");
      }
    } catch (error) {
      console.error(error);
      message.error("Error al registrar");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const user = await loginWithGoogleContext();
      if (user) navigate("/", { replace: true });
    } catch (error) {
      console.log("Error con login de google: ", error);
    }
  };

  return (
    <AuthLayout description="Registro">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Controller
            name="firstName"
            control={control}
            rules={{ required: "Nombre requerido" }}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Nombre"
                prefix={<UserOutlined />}
                status={errors.firstName ? "error" : ""}
              />
            )}
          />
          {errors.firstName && (
            <Text type="danger">{errors.firstName.message}</Text>
          )}

          <Controller
            name="lastName"
            control={control}
            rules={{ required: "Apellido requerido" }}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Apellido"
                prefix={<UserOutlined />}
                status={errors.lastName ? "error" : ""}
              />
            )}
          />
          {errors.lastName && (
            <Text type="danger">{errors.lastName.message}</Text>
          )}

          <Controller
            name="email"
            control={control}
            rules={{
              required: "El correo es obligatorio",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Correo no válido",
              },
            }}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Correo electrónico"
                prefix={<MailOutlined />}
                status={errors.email ? "error" : ""}
              />
            )}
          />
          {errors.email && <Text type="danger">{errors.email.message}</Text>}

          <Controller
            name="password"
            control={control}
            rules={{
              required: "La contraseña es obligatoria",
              minLength: {
                value: 6,
                message: "Mínimo 6 caracteres",
              },
            }}
            render={({ field }) => (
              <Input.Password
                {...field}
                placeholder="Contraseña"
                prefix={<LockOutlined />}
                status={errors.password ? "error" : ""}
              />
            )}
          />
          {errors.password && (
            <Text type="danger">{errors.password.message}</Text>
          )}

          <Controller
            name="confirmPassword"
            control={control}
            rules={{
              required: "Confirma tu contraseña",
              validate: (value) =>
                value === watch("password") || "Las contraseñas no coinciden",
            }}
            render={({ field }) => (
              <Input.Password
                {...field}
                placeholder="Confirmar contraseña"
                prefix={<LockOutlined />}
                status={errors.confirmPassword ? "error" : ""}
              />
            )}
          />
          {errors.confirmPassword && (
            <Text type="danger">{errors.confirmPassword.message}</Text>
          )}

          <Button type="primary" htmlType="submit" block style={{ background: "#333", color: "#fff", borderRadius: "8px" }}>
            Registrarse
          </Button>

          <Button icon={<GoogleOutlined />} onClick={handleGoogleLogin} block>
            Google
          </Button>

          <Text style={{ display: "block", textAlign: "center" }}>
            ¿Ya tienes cuenta?{" "}
            <Link to="/auth/login" style={{ fontWeight: 500 }}>
              Inicia sesión
            </Link>
          </Text>
        </Space>
      </form>
    </AuthLayout>
  );
};