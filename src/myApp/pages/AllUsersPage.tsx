// import { useEffect, useState } from "react";
// import { Table, Typography, Select, message, Modal, Input, Button } from "antd";
// import { getDocs, collection, updateDoc, doc, deleteDoc } from "firebase/firestore";
// import { db } from "../../firebase/firebase";
// import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

// const { Title } = Typography;
// const { Option } = Select;

// interface UserData {
//   id: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   role: "user" | "admin" | "superadmin";
// }

// export const AllUsersPage = () => {
//   const [users, setUsers] = useState<UserData[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [isEditModalVisible, setIsEditModalVisible] = useState(false);
//   const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
//   const [updatedData, setUpdatedData] = useState({ firstName: "", lastName: "", email: "" });

//   // Estados para modal de eliminar
//   const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
//   const [userToDelete, setUserToDelete] = useState<UserData | null>(null);

//   const fetchUsers = async () => {
//     setLoading(true);
//     try {
//       const snapshot = await getDocs(collection(db, "users"));
//       const data: UserData[] = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       })) as UserData[];
//       setUsers(data);
//     } catch (error) {
//       console.error("Error al obtener usuarios:", error);
//       message.error("Error al obtener usuarios");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRoleChange = async (id: string, newRole: "user" | "admin") => {
//     try {
//       const userRef = doc(db, "users", id);
//       await updateDoc(userRef, { role: newRole });
//       message.success("Rol actualizado");
//       setUsers((prev) =>
//         prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
//       );
//     } catch (error) {
//       console.error("Error al actualizar rol:", error);
//       message.error("Error al actualizar rol");
//     }
//   };

//   // Editar usuario
//   const showEditModal = (user: UserData) => {
//     setSelectedUser(user);
//     setUpdatedData({ firstName: user.firstName, lastName: user.lastName, email: user.email });
//     setIsEditModalVisible(true);
//   };

//   const handleUpdateUser = async () => {
//     if (selectedUser) {
//       try {
//         const userRef = doc(db, "users", selectedUser.id);
//         await updateDoc(userRef, updatedData);
//         message.success("Usuario actualizado correctamente");
//         setUsers((prev) =>
//           prev.map((u) => (u.id === selectedUser.id ? { ...u, ...updatedData } : u))
//         );
//         setIsEditModalVisible(false);
//         setSelectedUser(null);
//       } catch (error) {
//         console.error("Error al actualizar usuario:", error);
//         message.error("Error al actualizar usuario");
//       }
//     }
//   };

//   // Eliminar usuario - mostrar modal
//   const showDeleteModal = (user: UserData) => {
//     setUserToDelete(user);
//     setIsDeleteModalVisible(true);
//   };

//   // Confirmar eliminación
//   const handleConfirmDelete = async () => {
//     if (!userToDelete) return;

//     try {
//       const userRef = doc(db, "users", userToDelete.id);
//       await deleteDoc(userRef);

//       message.success("Usuario eliminado correctamente");
//       setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
//     } catch (error) {
//       console.error("Error al eliminar usuario:", error);
//       message.error("Error al eliminar usuario");
//     } finally {
//       setIsDeleteModalVisible(false);
//       setUserToDelete(null);
//     }
//   };

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const columns = [
//     { title: "Nombre", dataIndex: "firstName", key: "firstName" },
//     { title: "Apellido", dataIndex: "lastName", key: "lastName" },
//     { title: "Correo", dataIndex: "email", key: "email" },
//     {
//       title: "Rol",
//       key: "role",
//       render: (record: UserData) =>
//         record.role === "superadmin" ? (
//           <span style={{ fontWeight: 600 }}>Superadmin</span>
//         ) : (
//           <Select
//             defaultValue={record.role}
//             onChange={(value) => handleRoleChange(record.id, value)}
//             style={{ width: 120 }}
//           >
//             <Option value="user">Usuario</Option>
//             <Option value="admin">Administrador</Option>
//           </Select>
//         ),
//     },
//     {
//       title: "Acciones",
//       key: "actions",
//       render: (record: UserData) => (
//         <>
//           <EditOutlined
//             style={{ cursor: "pointer", color: "#1890ff", marginRight: 16 }}
//             onClick={() => showEditModal(record)}
//           />
//           <DeleteOutlined
//             style={{ cursor: "pointer", color: "red" }}
//             onClick={() => showDeleteModal(record)}
//           />
//         </>
//       ),
//     },
//   ];

//   return (
//     <div style={{ padding: 24 }}>
//       <Title level={3}>Gestión de Usuarios</Title>
//       <Table rowKey="id" columns={columns} dataSource={users} loading={loading} pagination={{ pageSize: 10 }} />

//       {/* Modal edición */}
//       <Modal
//         title="Editar Usuario"
//         open={isEditModalVisible}
//         onCancel={() => {
//           setIsEditModalVisible(false);
//           setSelectedUser(null);
//         }}
//         footer={[
//           <Button
//             key="cancel"
//             onClick={() => {
//               setIsEditModalVisible(false);
//               setSelectedUser(null);
//             }}
//           >
//             Cancelar
//           </Button>,
//           <Button key="update" type="primary" onClick={handleUpdateUser}>
//             Guardar Cambios
//           </Button>,
//         ]}
//       >
//         <Input
//           value={updatedData.firstName}
//           onChange={(e) => setUpdatedData({ ...updatedData, firstName: e.target.value })}
//           placeholder="Nombre"
//         />
//         <Input
//           value={updatedData.lastName}
//           onChange={(e) => setUpdatedData({ ...updatedData, lastName: e.target.value })}
//           placeholder="Apellido"
//           style={{ marginTop: 10 }}
//         />
//         <Input
//           value={updatedData.email}
//           onChange={(e) => setUpdatedData({ ...updatedData, email: e.target.value })}
//           placeholder="Correo"
//           style={{ marginTop: 10 }}
//         />
//       </Modal>

//       {/* Modal confirmación eliminación */}
//       <Modal
//         title="Confirmar eliminación"
//         open={isDeleteModalVisible}
//         onCancel={() => {
//           setIsDeleteModalVisible(false);
//           setUserToDelete(null);
//         }}
//         footer={[
//           <Button
//             key="cancel"
//             onClick={() => {
//               setIsDeleteModalVisible(false);
//               setUserToDelete(null);
//             }}
//           >
//             Cancelar
//           </Button>,
//           <Button key="delete" type="primary" danger onClick={handleConfirmDelete}>
//             Eliminar
//           </Button>,
//         ]}
//       >
//         <p>
//           ¿Estás seguro que deseas eliminar al usuario{" "}
//           <b>
//             {userToDelete?.firstName} {userToDelete?.lastName}
//           </b>
//           ?
//         </p>
//       </Modal>
//     </div>
//   );
// };

// export default AllUsersPage;
