import React, { useState, useEffect } from "react";
import {
  Input,
  Button,
  Form,
  Select,
  Card,
  Typography,
  Modal,
  Divider,
  Space,
  message,
  DatePicker,
} from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import axios from "axios";

import { useAuthContext } from "../../auth/context/AuthContext";
import dayjs from "dayjs";

const { Option } = Select;
const { Title, Text } = Typography;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuthContext();
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("authUser");
    const parsedUser = storedUser ? JSON.parse(storedUser) : user;
    if (parsedUser) {
      profileForm.setFieldsValue({
        firstName: parsedUser.first_name,
        lastName: parsedUser.last_name,
        birthDate: parsedUser.birth_date ? dayjs(parsedUser.birth_date) : null,
      });
    }
  }, [user]);

  const handleProfileUpdate = async (values: any) => {
    try {
      setLoadingProfile(true);
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Usuario no autenticado");

      const headers = { Authorization: `Bearer ${token}` };

      const updatedUserData = {
        first_name: values.firstName,
        last_name: values.lastName,
        birth_date: values.birthDate?.format("YYYY-MM-DD"),
        email: user?.email, 
      };

      const response = await axios.put(
        `${API_BASE_URL}/users/${user?.uid}`,
        updatedUserData,
        { headers }
      );

      const updatedUser = response.data;
      updateUser(updatedUser);
      localStorage.setItem("authUser", JSON.stringify(updatedUser));
      message.success("Datos actualizados correctamente");
    } catch (error: any) {
      console.error(error);
      message.error("Error al actualizar el perfil");
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordChange = async (values: any) => {
    try {
      setLoadingPassword(true);
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Usuario no autenticado");

      const headers = { Authorization: `Bearer ${token}` };

      if (values.newPassword !== values.confirmPassword) {
        passwordForm.setFields([
          {
            name: "confirmPassword",
            errors: ["Las nuevas contraseñas no coinciden."],
          },
        ]);
        setLoadingPassword(false);
        return;
      }

      await axios.post(
        `${API_BASE_URL}/users/change-password`,
        {
          current_password: values.currentPassword,
          new_password: values.newPassword,
        },
        { headers }
      );

      passwordForm.resetFields();
      setIsModalOpen(true);
    } catch (error: any) {
      console.error(error);
      passwordForm.setFields([
        {
          name: "currentPassword",
          errors: [
            error.response?.data?.message ||
              error.message ||
              "Error al cambiar la contraseña.",
          ],
        },
      ]);
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(to right, #e0eafc, #cfdef3)",
        padding: "40px",
      }}
    >
      <Card
        title={<Title level={3}>👤 Editar Perfil</Title>}
        bordered={false}
        style={{
          width: 600,
          borderRadius: 16,
          boxShadow: "0 12px 32px rgba(0,0,0,0.15)",
          backgroundColor: "#ffffff",
        }}
      >
        <Divider orientation="left">Información personal</Divider>
        <Form form={profileForm} layout="vertical" onFinish={handleProfileUpdate}>
          <Form.Item
            label="Nombre"
            name="firstName"
            rules={[{ required: true, message: "El nombre es obligatorio" }]}
          >
            <Input placeholder="Tu nombre" />
          </Form.Item>

          <Form.Item
            label="Apellido"
            name="lastName"
            rules={[{ required: true, message: "El apellido es obligatorio" }]}
          >
            <Input placeholder="Tu apellido" />
          </Form.Item>

          <Form.Item
            label="Fecha de nacimiento"
            name="birthDate"
            rules={[{ required: true, message: "La fecha de nacimiento es obligatoria" }]}
          >
            <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
          </Form.Item>

          {["admin", "superadmin"].includes(user?.role?.name || "") && (
            <Form.Item
              label="Rol"
              name="role"
              initialValue={user?.role?.name || ""}
            >
              <Select disabled>
                <Option value="user">Usuario</Option>
                <Option value="admin">Administrador</Option>
                <Option value="superadmin">Super Administrador</Option>
              </Select>
            </Form.Item>
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loadingProfile}
              block
              style={{ marginTop: 10 }}
            >
              Actualizar datos
            </Button>
          </Form.Item>
        </Form>

        <Divider orientation="left">Cambiar contraseña</Divider>
        <Form form={passwordForm} layout="vertical" onFinish={handlePasswordChange}>
          <Form.Item label="Contraseña actual" name="currentPassword" rules={[{ required: true }]}>
            <Input.Password placeholder="Contraseña actual" />
          </Form.Item>

          <Form.Item label="Nueva contraseña" name="newPassword" rules={[{ required: true }]}>
            <Input.Password placeholder="Nueva contraseña" />
          </Form.Item>

          <Form.Item
            label="Confirmar nueva contraseña"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[{ required: true }]}
          >
            <Input.Password placeholder="Confirmar nueva contraseña" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loadingPassword}
              block
              style={{ marginTop: 10 }}
            >
              Cambiar contraseña
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Modal
        title={
          <Space>
            <CheckCircleOutlined style={{ color: "#52c41a" }} />
            <Text strong>Contraseña actualizada</Text>
          </Space>
        }
        open={isModalOpen}
        onOk={handleOk}
        cancelButtonProps={{ style: { display: "none" } }}
      >
        <p>Tu contraseña se cambió correctamente.</p>
      </Modal>
    </div>
  );
};