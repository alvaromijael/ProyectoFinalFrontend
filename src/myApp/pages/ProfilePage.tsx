import React, { useState, useEffect } from "react";
import {
  Input,
  Button,
  Form,
  Select,
  Card,
  Typography,
  Modal,
  Space,
  message,
  Row,
  Col,
  Avatar,
  Progress,
  Tooltip,
  Alert,
  DatePicker,
} from "antd";
import {
  CheckCircleOutlined,
  UserOutlined,
  LockOutlined,
  MailOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  InfoCircleOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useAuthContext } from "../../auth/context/AuthContext";
import dayjs from "dayjs";

const { Option } = Select;
const { Title, Text } = Typography;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getPasswordStrength = (password: string) => {
  if (!password) return { strength: 0, label: "", color: "" };
  let score = 0;
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    numbers: /\d/.test(password),
    symbols: /[^A-Za-z0-9]/.test(password),
  };
  score = Object.values(checks).filter(Boolean).length;
  if (score < 2) return { strength: 20, label: "Muy débil", color: "#ff4d4f" };
  if (score < 3) return { strength: 40, label: "Débil", color: "#fa8c16" };
  if (score < 4) return { strength: 60, label: "Media", color: "#fadb14" };
  if (score < 5) return { strength: 80, label: "Fuerte", color: "#52c41a" };
  return { strength: 100, label: "Muy fuerte", color: "#389e0d" };
};

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuthContext();
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ strength: 0, label: "", color: "" });

  useEffect(() => {
    const storedUser = localStorage.getItem("authUser");
    const parsedUser = storedUser ? JSON.parse(storedUser) : user;
    if (parsedUser) {
      profileForm.setFieldsValue({
        firstName: parsedUser.first_name,
        lastName: parsedUser.last_name,
        email: parsedUser.email,
        birthDate: parsedUser.birth_date ? dayjs(parsedUser.birth_date) : null,
        role: parsedUser.role?.name || "",
      });
    }
  }, [user, profileForm]);

  const handleProfileUpdate = async (values: any) => {
    try {
      setLoadingProfile(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        message.error("Usuario no autenticado");
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      
      // El backend requiere todos estos campos según el schema UserUpdate
      const updatedUserData = {
        first_name: values.firstName,
        last_name: values.lastName,
        email: values.email,
        role: user?.role?.name || "user",
        is_active: (user as any)?.is_active !== undefined ? (user as any).is_active : true,
        birth_date: values.birthDate ? values.birthDate.format("YYYY-MM-DD") : ((user as any)?.birth_date || null)
      };

      console.log("=== DEBUG ACTUALIZACIÓN ===");
      console.log("Usuario actual completo:", user);
      
      // El backend usa 'id' no 'uid'
      const userId = (user as any)?.id || user?.uid;
      
      if (!userId) {
        throw new Error("No se encontró el ID del usuario");
      }
      
      console.log("User ID:", userId);
      console.log("Datos enviados:", updatedUserData);
      console.log("URL completa:", `${API_BASE_URL}/users/${userId}`);

      const response = await axios.put(`${API_BASE_URL}/users/${userId}`, updatedUserData, { headers });
      
      console.log("Respuesta completa:", response.data);
      
      // El backend devuelve { message, data }, necesitamos acceder a .data
      const updatedUserFromBackend = response.data.data;
      
      // Combinar con datos existentes para mantener toda la información
      const completeUser = {
        ...user,
        ...updatedUserFromBackend,
        first_name: updatedUserFromBackend.first_name,
        last_name: updatedUserFromBackend.last_name,
        email: updatedUserFromBackend.email,
        role: {
          name: updatedUserFromBackend.role
        },
        uid: user?.uid || updatedUserFromBackend.id
      };

      updateUser(completeUser);
      localStorage.setItem("authUser", JSON.stringify(completeUser));

      message.success({
        content: response.data.message || "¡Perfil actualizado exitosamente!",
        duration: 3,
        icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      console.error("Error response:", error.response?.data);
      message.error({
        content: error.response?.data?.detail || error.response?.data?.message || "Error al actualizar el perfil. Inténtalo de nuevo.",
        duration: 4,
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordChange = async (values: any) => {
    try {
      setLoadingPassword(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        message.error("Usuario no autenticado");
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      
      console.log("=== DEBUG CAMBIO DE CONTRASEÑA ===");
      console.log("Enviando petición a:", `${API_BASE_URL}/users/change-password`);
      
      const response = await axios.post(
        `${API_BASE_URL}/users/change-password`,
        {
          current_password: values.currentPassword,
          new_password: values.newPassword,
        },
        { headers }
      );

      console.log("Respuesta del servidor:", response.data);

      passwordForm.resetFields();
      setPasswordStrength({ strength: 0, label: "", color: "" });
      setIsPasswordModalOpen(false);
      
      message.success({
        content: response.data.message || "¡Contraseña actualizada correctamente!",
        duration: 3,
        icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
      });
    } catch (error: any) {
      console.error("Error changing password:", error);
      console.error("Error response:", error.response?.data);
      
      // FastAPI devuelve el error en 'detail', no en 'message'
      const errorDetail = error.response?.data?.detail || "Error al cambiar la contraseña";
      
      // Mostrar el error en el campo de contraseña actual
      passwordForm.setFields([
        {
          name: "currentPassword",
          errors: [errorDetail],
        },
      ]);
    } finally {
      setLoadingPassword(false);
    }
  };

  const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordStrength(getPasswordStrength(e.target.value));
  };

  const getUserInitials = () => {
    const firstName = user?.firstName || "";
    const lastName = user?.lastName || "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #2C2A6C, #226B6D, #D14B4B)",
        padding: "20px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: 1000 }}>
        <Row gutter={[24, 24]} justify="center">
          {/* Tarjeta de perfil */}
          <Col xs={24} lg={8}>
            <Card
              style={{
                borderRadius: 16,
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                border: "none",
                height: "fit-content",
              }}
            >
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <Avatar
                  size={120}
                  style={{
                    backgroundColor: "#667eea",
                    fontSize: "2rem",
                    fontWeight: "bold",
                    marginBottom: 16,
                  }}
                  icon={!getUserInitials() ? <UserOutlined /> : null}
                >
                  {getUserInitials()}
                </Avatar>
                <Title level={3} style={{ margin: "16px 0 8px 0" }}>
                  {user?.firstName} {user?.lastName}
                </Title>
                <Text type="secondary" style={{ fontSize: "16px" }}>
                  <MailOutlined style={{ marginRight: 8 }} />
                  {user?.email}
                </Text>
                {(user as any)?.birth_date && (
                  <div style={{ marginTop: 12 }}>
                    <Text type="secondary" style={{ fontSize: "14px" }}>
                      <CalendarOutlined style={{ marginRight: 8 }} />
                      {dayjs((user as any).birth_date).format("DD/MM/YYYY")}
                    </Text>
                  </div>
                )}
                {user?.role && (
                  <div style={{ marginTop: 16 }}>
                    <Space>
                      <Text strong style={{ textTransform: "capitalize" }}>
                        {user.role.name === "superadmin" ? "Super Administrador" :
                          user.role.name === "admin" ? "Administrador" : "Usuario"}
                      </Text>
                    </Space>
                  </div>
                )}
                <Button
                  type="primary"
                  style={{
                    marginTop: 24,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    border: "none",
                    borderRadius: 8,
                    height: 48,
                    fontWeight: "bold",
                  }}
                  onClick={() => setIsPasswordModalOpen(true)}
                  block
                >
                  Cambiar Contraseña
                </Button>
              </div>
            </Card>
          </Col>

          {/* Formularios de información personal */}
          <Col xs={24} lg={16}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <Card
                title={
                  <Space>
                    <UserOutlined style={{ color: "#667eea" }} />
                    <span>Información Personal</span>
                  </Space>
                }
                style={{
                  borderRadius: 16,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                  border: "none",
                }}
              >
                <Form
                  form={profileForm}
                  layout="vertical"
                  onFinish={handleProfileUpdate}
                  size="large"
                >
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item label="Nombre" name="firstName" rules={[{ required: true, message: "El nombre es obligatorio" }, { min: 2, message: "Mínimo 2 caracteres" }]}>
                        <Input prefix={<UserOutlined style={{ color: "#bfbfbf" }} />} placeholder="Tu nombre" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item label="Apellido" name="lastName" rules={[{ required: true, message: "El apellido es obligatorio" }, { min: 2, message: "Mínimo 2 caracteres" }]}>
                        <Input prefix={<UserOutlined style={{ color: "#bfbfbf" }} />} placeholder="Tu apellido" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item label="Email" name="email" rules={[{ required: true, message: "El email es obligatorio" }, { type: "email", message: "Email inválido" }]}>
                        <Input prefix={<MailOutlined style={{ color: "#bfbfbf" }} />} placeholder="tu@email.com" disabled />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item 
                        label="Fecha de nacimiento" 
                        name="birthDate"
                      >
                        <DatePicker 
                          style={{ width: "100%" }} 
                          format="DD/MM/YYYY"
                          placeholder="Selecciona tu fecha"
                          suffixIcon={<CalendarOutlined style={{ color: "#bfbfbf" }} />}
                          disabledDate={(current) => current && current > dayjs().endOf('day')}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  {["admin", "superadmin"].includes(user?.role?.name || "") && (
                    <Form.Item label="Rol" name="role">
                      <Select disabled size="large">
                        <Option value="user">Usuario</Option>
                        <Option value="admin">Administrador</Option>
                        <Option value="superadmin">Super Administrador</Option>
                      </Select>
                    </Form.Item>
                  )}

                  <Form.Item style={{ marginTop: 24 }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loadingProfile}
                      size="large"
                      style={{
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        border: "none",
                        borderRadius: 8,
                        height: 48,
                        fontWeight: "bold",
                      }}
                      block
                    >
                      Actualizar Información
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Modal de Cambio de Contraseña */}
      <Modal
        title={<Space><LockOutlined style={{ color: "#667eea" }} /> Cambiar Contraseña</Space>}
        open={isPasswordModalOpen}
        onCancel={() => setIsPasswordModalOpen(false)}
        footer={null}
        centered
        style={{ borderRadius: 16 }}
      >
        <Alert
          message="Recomendaciones de seguridad"
          description="Usa una contraseña fuerte con al menos 8 caracteres, combinando mayúsculas, minúsculas, números y símbolos."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
        <Form form={passwordForm} layout="vertical" onFinish={handlePasswordChange} size="large">
          <Form.Item label="Contraseña actual" name="currentPassword" rules={[{ required: true, message: "Ingresa tu contraseña actual" }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Tu contraseña actual" iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)} />
          </Form.Item>
          <Form.Item label={<Space>Nueva contraseña<Tooltip title="Mínimo 8 caracteres con mayúsculas, minúsculas, números y símbolos"><InfoCircleOutlined /></Tooltip></Space>} name="newPassword" rules={[{ required: true, message: "Ingresa una nueva contraseña" }, { min: 8, message: "Mínimo 8 caracteres" }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Nueva contraseña" onChange={onPasswordChange} iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)} />
          </Form.Item>
          {passwordStrength.strength > 0 && (
            <div style={{ marginBottom: 16 }}>
              <Progress percent={passwordStrength.strength} strokeColor={passwordStrength.color} showInfo={false} size="small" />
              <Text style={{ color: passwordStrength.color, fontSize: "12px" }}>Fortaleza: {passwordStrength.label}</Text>
            </div>
          )}
          <Form.Item label="Confirmar nueva contraseña" name="confirmPassword" dependencies={["newPassword"]} rules={[{ required: true, message: "Confirma tu nueva contraseña" }, ({ getFieldValue }) => ({ validator(_, value) { if (!value || getFieldValue("newPassword") === value) return Promise.resolve(); return Promise.reject(new Error("Las contraseñas no coinciden")); } })]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Confirma tu nueva contraseña" iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loadingPassword} size="large" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", border: "none", borderRadius: 8, height: 48, fontWeight: "bold" }} block>
              Cambiar Contraseña
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};