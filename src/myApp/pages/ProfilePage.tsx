// import { useState } from "react";
// import {
//   Input,
//   Button,
//   Form,
//   Select,
//   Card,
//   Typography,
//   Modal,
// } from "antd";
// import { useAuthContext } from "@/auth/context/AuthContext";
// import { updateUserData } from "@/auth/services/AuthServices";
// import { auth } from "@/firebase/firebase";
// import {
//   reauthenticateWithCredential,
//   EmailAuthProvider,
//   updatePassword,
// } from "firebase/auth";
// import { useNavigate } from "react-router-dom";

// const { Option } = Select;
// const { Title } = Typography;

// export const ProfilePage = () => {
//   const { user, setUserContext } = useAuthContext();
//   const [loading, setLoading] = useState(false);
//   const [form] = Form.useForm();
//   const navigate = useNavigate();
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   if (!user) return <p>No hay usuario autenticado.</p>;

//   const onFinish = async (values: any) => {
//     try {
//       setLoading(true);

//       const quiereCambiarPassword =
//         values.currentPassword || values.newPassword || values.confirmPassword;

//       if (quiereCambiarPassword) {
//         if (
//           !values.currentPassword ||
//           !values.newPassword ||
//           !values.confirmPassword
//         ) {
//           form.setFields([
//             {
//               name: "currentPassword",
//               errors: ["Todos los campos de contraseña deben estar completos."],
//             },
//             {
//               name: "newPassword",
//               errors: !values.newPassword ? ["Requerido"] : [],
//             },
//             {
//               name: "confirmPassword",
//               errors: !values.confirmPassword ? ["Requerido"] : [],
//             },
//           ]);
//           setLoading(false);
//           return;
//         }

//         if (values.newPassword !== values.confirmPassword) {
//           form.setFields([
//             {
//               name: "confirmPassword",
//               errors: ["Las nuevas contraseñas no coinciden."],
//             },
//           ]);
//           setLoading(false);
//           return;
//         }

//         const currentUser = auth.currentUser;
//         if (!currentUser || !currentUser.email) {
//           setLoading(false);
//           form.setFields([
//             {
//               name: "currentPassword",
//               errors: ["Sesión inválida."],
//             },
//           ]);
//           return;
//         }

//         const credential = EmailAuthProvider.credential(
//           currentUser.email,
//           values.currentPassword
//         );

//         try {
//           await reauthenticateWithCredential(currentUser, credential);
//         } catch {
//           setLoading(false);
//           form.setFields([
//             {
//               name: "currentPassword",
//               errors: ["La contraseña actual es incorrecta."],
//             },
//           ]);
//           return;
//         }

//         await updatePassword(currentUser, values.newPassword);
//       }

//       const updatedUser = {
//         ...user,
//         firstName: values.firstName,
//         lastName: values.lastName,
//         role: user.role,
//       };

//       await updateUserData(updatedUser);
//       setUserContext(updatedUser);
//       setIsModalOpen(true);
//     } catch (error: any) {
//       console.error(error);
//       form.setFields([
//         {
//           name: "currentPassword",
//           errors: [error.message || "Error al actualizar el perfil."],
//         },
//       ]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleOk = () => {
//     setIsModalOpen(false);
//     navigate("/HomePage");
//   };

//   return (
//     <div
//       style={{
//         minHeight: "100vh",
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         background: "#f0f2f5",
//         padding: "20px",
//       }}
//     >
//       <Card
//         title={<Title level={3}>Editar Perfil</Title>}
//         bordered={false}
//         style={{
//           width: 500,
//           borderRadius: 12,
//           boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
//           backgroundColor: "#ffffff",
//         }}
//       >
//         <Form
//           form={form}
//           layout="vertical"
//           initialValues={{
//             firstName: user.firstName,
//             lastName: user.lastName,
//           }}
//           onFinish={onFinish}
//         >
//           <Form.Item
//             label="Nombre"
//             name="firstName"
//             rules={[{ required: true, message: "El nombre es obligatorio" }]}
//           >
//             <Input />
//           </Form.Item>

//           <Form.Item
//             label="Apellido"
//             name="lastName"
//             rules={[{ required: true, message: "El apellido es obligatorio" }]}
//           >
//             <Input />
//           </Form.Item>

//           {["admin", "superadmin"].includes(user.role) && (
//             <Form.Item label="Rol" name="role" initialValue={user.role}>
//               <Select disabled>
//                 <Option value="user">Usuario</Option>
//                 <Option value="admin">Administrador</Option>
//                 <Option value="superadmin">Super Administrador</Option>
//               </Select>
//             </Form.Item>
//           )}

//           <Form.Item label="Contraseña actual" name="currentPassword">
//             <Input.Password />
//           </Form.Item>

//           <Form.Item label="Nueva contraseña" name="newPassword">
//             <Input.Password />
//           </Form.Item>

//           <Form.Item
//             label="Confirmar nueva contraseña"
//             name="confirmPassword"
//             dependencies={["newPassword"]}
//           >
//             <Input.Password />
//           </Form.Item>

//           <Form.Item>
//             <Button type="primary" htmlType="submit" loading={loading} block>
//               Guardar cambios
//             </Button>
//           </Form.Item>
//         </Form>
//       </Card>

//       <Modal
//         title="Perfil actualizado"
//         open={isModalOpen}
//         onOk={handleOk}
//         cancelButtonProps={{ style: { display: "none" } }}
//       >
//         <p>Tu perfil se actualizó correctamente.</p>
//       </Modal>
//     </div>
//   );
// };
