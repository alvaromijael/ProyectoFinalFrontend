import { useEffect, useState } from "react";
import { List, Typography, message, Modal, Input, Button, Row, Col, Avatar, Tag, Space, Switch, Pagination, Select } from "antd";
import axios from "axios";
import { EditOutlined, DeleteOutlined, UserOutlined, MailOutlined } from "@ant-design/icons";
import type { UserData } from "../interfaces/UserData";

const { Title } = Typography;
const { Option } = Select;

// Declarar tipo para cache global
declare global {
  interface Window {
    allUsersCache?: UserData[];
  }
}

export const AllUsersPage = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [updatedData, setUpdatedData] = useState({ 
    first_name: "", 
    last_name: "", 
    email: "",
    role: "user" as "user" | "admin",
    is_active: true
  });

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const API_URL: string = import.meta.env.VITE_API_BASE_URL;

  // GET usuarios con paginación (adaptable)
  const fetchUsers = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      // Intentar con parámetros de paginación, si el backend no los soporta, los ignora
      const response = await axios.get(`${API_URL}/users?page=${page}&limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const responseData = response.data;
      
      // Verificar si la respuesta tiene estructura de paginación
      if (responseData.total !== undefined) {
        // Backend soporta paginación
        setUsers(responseData.data);
        setTotal(responseData.total);
        setCurrentPage(page);
      } else {
        // Backend no soporta paginación - simular paginación frontend
        const allUsers = responseData.data;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedUsers = allUsers.slice(startIndex, endIndex);
        
        setUsers(paginatedUsers);
        setTotal(allUsers.length);
        setCurrentPage(page);
        
        // Guardar todos los usuarios para paginación local
        if (!window.allUsersCache) {
          window.allUsersCache = allUsers;
        }
      }
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      message.error("Error al obtener usuarios");
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambio de página (adaptable)
  const handlePageChange = (page: number, size?: number) => {
    const newPageSize = size || pageSize;
    if (size && size !== pageSize) {
      setPageSize(newPageSize);
    }
    
    // Si tenemos cache de usuarios (paginación local), usar eso
    if (window.allUsersCache && !isBackendPaginated()) {
      const startIndex = (page - 1) * newPageSize;
      const endIndex = startIndex + newPageSize;
      const paginatedUsers = window.allUsersCache.slice(startIndex, endIndex);
      
      setUsers(paginatedUsers);
      setCurrentPage(page);
      setTotal(window.allUsersCache.length);
    } else {
      // Paginación del backend
      fetchUsers(page, newPageSize);
    }
  };
  
  // Verificar si el backend soporta paginación
  const isBackendPaginated = () => {
    // Si tenemos cache, significa que estamos usando paginación local
    return !window.allUsersCache;
  };

  const getRoleTag = (role: string) => {
    // Configuración flexible para roles - fácil de extender
    const roleConfig = {
      superadmin: { color: 'purple', text: 'Superadmin', icon: '🔥' },
      admin: { color: 'blue', text: 'Administrador', icon: '⚡' },
      user: { color: 'green', text: 'Usuario', icon: '👤' },
      // Aquí se pueden agregar más roles fácilmente:
      // moderator: { color: 'orange', text: 'Moderador', icon: '🛡️' },
      // viewer: { color: 'default', text: 'Visualizador', icon: '👁️' },
    };
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.user;
    return <Tag color={config.color}>{config.icon} {config.text}</Tag>;
  };

  const getAvailableRoles = () => {
    // Retorna los roles que se pueden asignar (excluyendo superadmin)
    return [
      { value: 'user', label: '👤 Usuario' },
      { value: 'admin', label: '⚡ Administrador' },
      // Agregar más roles aquí cuando sea necesario
    ];
  };

  // Verificar si un usuario está protegido y no se puede editar/eliminar
  const isProtectedUser = (user: UserData): boolean => {
    const isProtected = user.role === 'superadmin' || user.email === 'admin@fenix.com';
    console.log(`Usuario: ${user.email}, Rol: ${user.role}, Protegido: ${isProtected}`);
    return isProtected;
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Mostrar modal de edición
  const showEditModal = (user: UserData) => {
    setSelectedUser(user);
    setUpdatedData({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role as "user" | "admin",
      is_active: user.is_active
    });
    setIsEditModalVisible(true);
  };

  // PUT editar usuario (ahora incluye rol)
  const handleUpdateUser = async () => {
    if (selectedUser) {
      try {
        const token = localStorage.getItem("authToken");
        await axios.put(`${API_URL}/users/${selectedUser.id}`, updatedData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        message.success("Usuario actualizado correctamente");
        
        // Actualizar la lista manteniendo la paginación actual
        setUsers((prev) =>
          prev.map((u) => (u.id === selectedUser.id ? { ...u, ...updatedData } : u))
        );
        
        // Actualizar cache local si existe
        if (window.allUsersCache) {
          window.allUsersCache = window.allUsersCache.map((u) => 
            u.id === selectedUser.id ? { ...u, ...updatedData } : u
          );
        }
        
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
      const token = localStorage.getItem("authToken");
      await axios.delete(`${API_URL}/users/${userToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      message.success("Usuario eliminado correctamente");
      
      // Actualizar la lista y el total
      const newUsers = users.filter((u) => u.id !== userToDelete.id);
      setUsers(newUsers);
      setTotal(prev => prev - 1);
      
      // Actualizar cache local si existe
      if (window.allUsersCache) {
        window.allUsersCache = window.allUsersCache.filter((u) => u.id !== userToDelete.id);
      }
      
      // Si la página actual queda vacía y no es la primera, ir a la página anterior
      if (newUsers.length === 0 && currentPage > 1) {
        handlePageChange(currentPage - 1, pageSize);
      }
      
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      message.error("Error al eliminar usuario");
    } finally {
      setIsDeleteModalVisible(false);
      setUserToDelete(null);
    }
  };

  useEffect(() => {
    // Limpiar cache al montar el componente
    window.allUsersCache = undefined;
    fetchUsers(1, pageSize);
  }, []);

  return (
    <div style={{ padding: 24, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={3} style={{ margin: 0 }}>Gestión de Usuarios</Title>
        <Typography.Text type="secondary">
          Total: {total} usuarios
        </Typography.Text>
      </div>
      
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: 12, 
        padding: 24,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <List
          loading={loading}
          dataSource={users}
          renderItem={(user) => (
            <List.Item
              style={{ 
                padding: '16px 0',
                borderRadius: 8,
                marginBottom: 8,
                backgroundColor: '#fafafa',
                paddingLeft: 16,
                paddingRight: 16
              }}
              actions={
                isProtectedUser(user) ? [] : [
                  <Button
                    key="edit"
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => showEditModal(user)}
                    style={{ color: '#1890ff' }}
                  >
                    Editar
                  </Button>,
                  <Button
                    key="delete"
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={() => showDeleteModal(user)}
                    style={{ color: '#ff4d4f' }}
                  >
                    Eliminar
                  </Button>
                ]
              }
            >
              <List.Item.Meta
                avatar={
                  <Avatar 
                    size={48} 
                    style={{ 
                      backgroundColor: user.is_active ? '#87d068' : '#ccc',
                      fontSize: 16,
                      fontWeight: 'bold'
                    }}
                  >
                    {getInitials(user.first_name, user.last_name)}
                  </Avatar>
                }
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Typography.Text strong style={{ fontSize: 16 }}>
                      {user.first_name} {user.last_name}
                    </Typography.Text>
                    {getRoleTag(user.role)}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 4,
                      marginLeft: 'auto'
                    }}>
                      <div style={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%', 
                        backgroundColor: user.is_active ? '#52c41a' : '#ff4d4f' 
                      }} />
                      <Typography.Text style={{ 
                        fontSize: 12,
                        color: user.is_active ? '#52c41a' : '#ff4d4f'
                      }}>
                        {user.is_active ? 'Activo' : 'Inactivo'}
                      </Typography.Text>
                    </div>
                  </div>
                }
                description={
                  <Space direction="vertical" size={4} style={{ width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <MailOutlined style={{ color: '#666', fontSize: 14 }} />
                      <Typography.Text style={{ fontSize: 14, color: '#666' }}>
                        {user.email}
                      </Typography.Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <UserOutlined style={{ color: '#666', fontSize: 14 }} />
                      <Typography.Text style={{ fontSize: 14, color: '#666' }}>
                        ID: {user.id}
                      </Typography.Text>
                    </div>
                  </Space>
                }
              />
            </List.Item>
          )}
        />

        {/* Paginación */}
        {total > 0 && (
          <div style={{ 
            marginTop: 24, 
            display: 'flex', 
            justifyContent: 'center',
            paddingTop: 16,
            borderTop: '1px solid #f0f0f0'
          }}>
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={total}
              showSizeChanger
              showQuickJumper
              showTotal={(total, range) => 
                `${range[0]}-${range[1]} de ${total} usuarios`
              }
              onChange={handlePageChange}
              onShowSizeChange={handlePageChange}
              pageSizeOptions={['10', '20', '50', '100']}
            />
          </div>
        )}

        {users.length === 0 && !loading && (
          <div style={{ textAlign: 'center', marginTop: 48, marginBottom: 24 }}>
            <Typography.Text type="secondary">No hay usuarios para mostrar</Typography.Text>
          </div>
        )}
      </div>

      {/* Modal edición */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar style={{ backgroundColor: '#87d068' }}>
              {selectedUser && getInitials(selectedUser.first_name, selectedUser.last_name)}
            </Avatar>
            <span>Editar Usuario</span>
          </div>
        }
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
        width={520}
      >
        <div style={{ padding: '16px 0' }}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                Nombre
              </label>
              <Input
                value={updatedData.first_name}
                onChange={(e) => setUpdatedData({ ...updatedData, first_name: e.target.value })}
                placeholder="Ingrese el nombre"
                prefix={<UserOutlined style={{ color: '#999' }} />}
              />
            </Col>
            <Col span={12}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                Apellido
              </label>
              <Input
                value={updatedData.last_name}
                onChange={(e) => setUpdatedData({ ...updatedData, last_name: e.target.value })}
                placeholder="Ingrese el apellido"
                prefix={<UserOutlined style={{ color: '#999' }} />}
              />
            </Col>
            <Col span={24}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                Correo Electrónico
              </label>
              <Input
                value={updatedData.email}
                onChange={(e) => setUpdatedData({ ...updatedData, email: e.target.value })}
                placeholder="correo@ejemplo.com"
                prefix={<MailOutlined style={{ color: '#999' }} />}
                type="email"
              />
            </Col>
            <Col span={12}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                Rol
              </label>
              <Select
                value={updatedData.role}
                onChange={(value) => setUpdatedData({ ...updatedData, role: value })}
                placeholder="Seleccionar rol"
                style={{ width: "100%" }}
                size="large"
              >
                {getAvailableRoles().map(role => (
                  <Option key={role.value} value={role.value}>
                    {role.label}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={12}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                Estado
              </label>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8,
                padding: '6px 0'
              }}>
                <Switch
                  checked={updatedData.is_active}
                  onChange={(checked) => setUpdatedData({ ...updatedData, is_active: checked })}
                />
                <span style={{ fontSize: 14, color: updatedData.is_active ? '#52c41a' : '#666' }}>
                  {updatedData.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </Col>
          </Row>
        </div>
      </Modal>

      {/* Modal eliminación */}
      <Modal
        title={
          <span style={{ color: '#ff4d4f' }}>
            <DeleteOutlined style={{ marginRight: 8 }} />
            Confirmar eliminación
          </span>
        }
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
            Sí, Eliminar
          </Button>,
        ]}
      >
        {userToDelete && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <Avatar 
              size={64} 
              style={{ 
                backgroundColor: '#ff7875',
                fontSize: 20,
                fontWeight: 'bold',
                marginBottom: 16
              }}
            >
              {getInitials(userToDelete.first_name, userToDelete.last_name)}
            </Avatar>
            <p style={{ fontSize: 16, marginBottom: 8 }}>
              ¿Estás seguro que deseas eliminar al usuario?
            </p>
            <Typography.Title level={5} style={{ margin: '8px 0', color: '#262626' }}>
              {userToDelete.first_name} {userToDelete.last_name}
            </Typography.Title>
            <Typography.Text type="secondary" style={{ fontSize: 14 }}>
              {userToDelete.email}
            </Typography.Text>
            <div style={{ 
              marginTop: 16, 
              padding: '8px 12px', 
              backgroundColor: '#fff2f0', 
              borderRadius: '6px',
              border: '1px solid #ffccc7'
            }}>
              <Typography.Text type="danger" style={{ fontSize: 13 }}>
                ⚠️ Esta acción no se puede deshacer
              </Typography.Text>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AllUsersPage;