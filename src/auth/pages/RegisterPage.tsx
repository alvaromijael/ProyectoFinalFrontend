import {
  LockOutlined,
  MailOutlined,
  UserOutlined,
  GoogleOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import {
  Button,
  Typography,
  Space,
  Input,
  Modal,
  message,
} from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import { AuthLayout } from "../component/AuthLayout";

const { Text } = Typography;

type RegisterFormData = {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  birthDate: string;
};

export const RegisterPage = () => {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const navigate = useNavigate();

  const onSubmit = async (data: RegisterFormData) => {
    if (data.password !== data.confirmPassword) {
      message.error("Las contraseñas no coinciden");
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:8000/auth/register", {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        password: data.password,
        birth_date: data.birthDate,
      });

      if (response.status === 200 || response.status === 201) {
        Modal.success({
          title: "¡Registro exitoso 🎉!",
          content: "Tu cuenta fue creada correctamente. Ahora puedes iniciar sesión.",
          onOk: () => navigate("/auth/login"),
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
            name="birthDate"
            control={control}
            rules={{ required: "Fecha de nacimiento requerida" }}
            render={({ field }) => (
              <Input
                {...field}
                type="date"
                placeholder="Fecha de nacimiento"
                prefix={<CalendarOutlined />}
                status={errors.birthDate ? "error" : ""}
              />
            )}
          />
          {errors.birthDate && (
            <Text type="danger">{errors.birthDate.message}</Text>
          )}

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
            Registrarte
          </Button>

          <Button icon={<GoogleOutlined />} block>
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
