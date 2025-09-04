import { useEffect, useState } from "react";
import { Table, Typography, Select, message, Modal, Input, Button } from "antd";
import axios from "axios";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { UserData } from "../interfaces/UserData";

const { Title } = Typography;
const { Option } = Select;



export const AllUsersPage = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [updatedData, setUpdatedData] = useState({ first_name: "", last_name: "", email: "" });

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);

  const API_URL = "http://localhost:8000/users"; 

  // GET usuarios
  const fetchUsers = async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem("authToken");
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setUsers(response.data.data);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    message.error("Error al obtener usuarios");
  } finally {
    setLoading(false);
  }
};


  // PUT actualizar rol
  const handleRoleChange = async (id: number, newRole: "user" | "admin") => {
    try {
      await axios.put(`${API_URL}/${id}`, { role: newRole });
      message.success("Rol actualizado");
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role: newRole } : u)));
    } catch (error) {
      console.error("Error al actualizar rol:", error);
      message.error("Error al actualizar rol");
    }
  };

  // Mostrar modal de edición
  const showEditModal = (user: UserData) => {
    setSelectedUser(user);
    setUpdatedData({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
    });
    setIsEditModalVisible(true);
  };

  // PUT editar usuario
  const handleUpdateUser = async () => {
    if (selectedUser) {
      try {
        await axios.put(`${API_URL}/${selectedUser.id}`, updatedData);
        message.success("Usuario actualizado");
        setUsers((prev) =>
          prev.map((u) => (u.id === selectedUser.id ? { ...u, ...updatedData } : u))
        );
        setIsEditModalVisible(false);
        setSelectedUser(null);
      } catch (error) {
        console.error("Error al actualizar usuario:", error);
        message.error("Error al actualizar usuario");
      }
    }
  };

  // Mostrar modal de eliminación
  const showDeleteModal = (user: UserData) => {
    setUserToDelete(user);
    setIsDeleteModalVisible(true);
  };

  // DELETE usuario
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await axios.delete(`${API_URL}/${userToDelete.id}`);
      message.success("Usuario eliminado");
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      message.error("Error al eliminar usuario");
    } finally {
      setIsDeleteModalVisible(false);
      setUserToDelete(null);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const columns = [
    { title: "Nombre", dataIndex: "first_name", key: "first_name" },
    { title: "Apellido", dataIndex: "last_name", key: "last_name" },
    { title: "Correo", dataIndex: "email", key: "email" },
    {
      title: "Rol",
      key: "role",
      render: (record: UserData) =>
        record.role === "superadmin" ? (
          <span style={{ fontWeight: 600 }}>Superadmin</span>
        ) : (
          <Select
            defaultValue={record.role}
            onChange={(value) => handleRoleChange(record.id, value)}
            style={{ width: 120 }}
          >
            <Option value="user">Usuario</Option>
            <Option value="admin">Administrador</Option>
          </Select>
        ),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (record: UserData) => (
        <>
          <EditOutlined
            style={{ cursor: "pointer", color: "#1890ff", marginRight: 16 }}
            onClick={() => showEditModal(record)}
          />
          <DeleteOutlined
            style={{ cursor: "pointer", color: "red" }}
            onClick={() => showDeleteModal(record)}
          />
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Gestión de Usuarios</Title>
      <Table rowKey="id" columns={columns} dataSource={users} loading={loading} pagination={{ pageSize: 10 }} />

      {/* Modal edición */}
      <Modal
        title="Editar Usuario"
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          setSelectedUser(null);
        }}
        footer={[
          <Button key="cancel" onClick={() => setIsEditModalVisible(false)}>
            Cancelar
          </Button>,
          <Button key="update" type="primary" onClick={handleUpdateUser}>
            Guardar Cambios
          </Button>,
        ]}
      >
        <Input
          value={updatedData.first_name}
          onChange={(e) => setUpdatedData({ ...updatedData, first_name: e.target.value })}
          placeholder="Nombre"
        />
        <Input
          value={updatedData.last_name}
          onChange={(e) => setUpdatedData({ ...updatedData, last_name: e.target.value })}
          placeholder="Apellido"
          style={{ marginTop: 10 }}
        />
        <Input
          value={updatedData.email}
          onChange={(e) => setUpdatedData({ ...updatedData, email: e.target.value })}
          placeholder="Correo"
          style={{ marginTop: 10 }}
        />
      </Modal>

      {/* Modal eliminación */}
      <Modal
        title="Confirmar eliminación"
        open={isDeleteModalVisible}
        onCancel={() => {
          setIsDeleteModalVisible(false);
          setUserToDelete(null);
        }}
        footer={[
          <Button key="cancel" onClick={() => setIsDeleteModalVisible(false)}>
            Cancelar
          </Button>,
          <Button key="delete" type="primary" danger onClick={handleConfirmDelete}>
            Eliminar
          </Button>,
        ]}
      >
        <p>
          ¿Estás seguro que deseas eliminar al usuario{" "}
          <b>{userToDelete?.first_name} {userToDelete?.last_name}</b>?
        </p>
      </Modal>
    </div>
  );
};

export default AllUsersPage;
