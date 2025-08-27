// import { useState } from 'react';
// import {
//   Input,
//   Select,
//   DatePicker,
//   InputNumber,
//   Button,
//   Card,
//   Table,
//   Modal,
//   Space,
//   Typography,
//   Row,
//   Col,
//   message,
//   Popconfirm,
//   Avatar,
//   Layout,
//   Collapse,
// } from 'antd';
// import {
//   UserOutlined,
//   EnvironmentOutlined,
//   MedicineBoxOutlined,
//   PhoneOutlined,
//   HeartFilled,
//   PlusOutlined,
//   EditOutlined,
//   DeleteOutlined,
//   SaveOutlined,
//   CloseOutlined,
//   CaretRightOutlined
// } from '@ant-design/icons';

// const { TextArea } = Input;
// const { Option } = Select;
// const { Title, Text } = Typography;
// const { Content } = Layout;
// const { Panel } = Collapse;

// import { useNavigate } from "react-router-dom";


// import dataEcuador from '../../../assets/dataEcuador'; 

// export default function Patient() {

//   const navigate = useNavigate();


//   const [formData, setFormData] = useState({
//     apellidos: '',
//     nombres: '',
//     fecha: null,
//     edad: '',
//     sexo: '',
//     cedula: '',
//     estadoCivil: '',
//     ocupacion: '',
//     instruccion: '',
//     procedencia: '',
//     provincia: '',
//     ciudad: '',
//     antecedentes: '',
//     observaciones: '',
//     sectorBarrio: '',
//     calle: '',
//     numeroCasa: '',
//     contactos: []
//   });

//   const [contactoForm, setContactoForm] = useState({
//     nombre: '',
//     apellidos: '',
//     telefono: '',
//     email: '',
//     relacion: ''
//   });

//   const [editingContact, setEditingContact] = useState(null);
//   const [isContactModalOpen, setIsContactModalOpen] = useState(false);
//   const [activeKey, setActiveKey] = useState(['1']);

//   const provincias = Object.keys(dataEcuador);
//   const ciudades = formData.provincia ? dataEcuador[formData.provincia] : [];

//   const goToPatientList = () => {
//     navigate("/patientList"); // Aquí pones la ruta a la que quieres ir
//   };

//   const handleInputChange = (field, value) => {
//     setFormData(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   const handleContactInputChange = (field, value) => {
//     setContactoForm(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   const openAddContactModal = () => {
//     setContactoForm({
//       nombre: '',
//       apellidos: '',
//       telefono: '',
//       email: '',
//       relacion: ''
//     });
//     setEditingContact(null);
//     setIsContactModalOpen(true);
//   };

//   const addContact = () => {
//     if (!contactoForm.apellidos || !contactoForm.nombre || !contactoForm.telefono) {
//       message.error('Por favor complete al menos el apellido, nombre y teléfono del contacto');
//       return;
//     }

//     const newContact = {
//       id: editingContact || Date.now(),
//       ...contactoForm
//     };

//     if (editingContact) {
//       setFormData(prev => ({
//         ...prev,
//         contactos: prev.contactos.map(contact => 
//           contact.id === editingContact ? newContact : contact
//         )
//       }));
//       message.success('Contacto actualizado correctamente');
//     } else {
//       setFormData(prev => ({
//         ...prev,
//         contactos: [...prev.contactos, newContact]
//       }));
//       message.success('Contacto agregado correctamente');
//     }

//     setIsContactModalOpen(false);
//     setContactoForm({
//       nombre: '',
//       apellidos: '',
//       telefono: '',
//       email: '',
//       relacion: ''
//     });
//     setEditingContact(null);
//   };

//   const editContact = (contact) => {
//     setContactoForm({
//       nombre: contact.nombre,
//       apellidos: contact.apellidos,
//       telefono: contact.telefono,
//       email: contact.email || '',
//       relacion: contact.relacion || ''
//     });
//     setEditingContact(contact.id);
//     setIsContactModalOpen(true);
//   };

//   const deleteContact = (contactId) => {
//     setFormData(prev => ({
//       ...prev,
//       contactos: prev.contactos.filter(contact => contact.id !== contactId)
//     }));
//     message.success('Contacto eliminado correctamente');
//   };

//   const cancelContactModal = () => {
//     setEditingContact(null);
//     setIsContactModalOpen(false);
//     setContactoForm({
//       nombre: '',
//       apellidos: '',
//       telefono: '',
//       email: '',
//       relacion: ''
//     });
//   };

//   const handleSubmit = () => {
//     if (!formData.apellidos || !formData.nombres || !formData.cedula || !formData.edad || !formData.sexo || !formData.fecha || !formData.causaEmergencia) {
//       message.error('Por favor complete todos los campos obligatorios marcados con *');
//       return;
//     }
    
//     console.log('Datos del formulario:', formData);
//     message.success('Formulario enviado exitosamente!');
//   };

//   const handleProvinciaChange = (value) => {
//     setFormData(prev => ({
//       ...prev,
//       provincia: value,
//       ciudad: ''
//     }));
//   };

//   const contactColumns = [
//     {
//       title: 'Apellidos',
//       dataIndex: 'apellidos',
//       key: 'apellidos',
//       width: 150,
//     },
//     {
//       title: 'Nombre',
//       dataIndex: 'nombre',
//       key: 'nombre',
//       width: 150,
//     },
//     {
//       title: 'Teléfono',
//       dataIndex: 'telefono',
//       key: 'telefono',
//       width: 120,
//     },
//     {
//       title: 'Email',
//       dataIndex: 'email',
//       key: 'email',
//       width: 200,
//       render: (text) => text || '-'
//     },
//     {
//       title: 'Relación',
//       dataIndex: 'relacion',
//       key: 'relacion',
//       width: 120,
//       render: (text) => text || '-'
//     },
//     {
//       title: 'Acciones',
//       key: 'actions',
//       width: 150,
//       render: (_, record) => (
//         <Space size="small">
//           <Button
//             type="link"
//             icon={<EditOutlined />}
//             onClick={() => editContact(record)}
//             size="small"
//           >
//             Editar
//           </Button>
//           <Popconfirm
//             title="¿Está seguro de que desea eliminar este contacto?"
//             onConfirm={() => deleteContact(record.id)}
//             okText="Sí"
//             cancelText="No"
//           >
//             <Button
//               type="link"
//               danger
//               icon={<DeleteOutlined />}
//               size="small"
//             >
//               Eliminar
//             </Button>
//           </Popconfirm>
//         </Space>
//       ),
//     },
//   ];

//   return (
//     <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
//       <Content style={{ padding: '24px' }}>
//         <div style={{ maxWidth: '100%', margin: '0 auto' }}>
//           {/* Header */}
//           <Card style={{ marginBottom: '24px' }} size="default">
//             <Row justify="space-between" align="middle">
//               <Col>
//                 <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
//                   FENIX
//                 </Title>
//                 <Text style={{ color: '#722ed1', fontSize: '18px', fontWeight: 500 }}>
//                   Sistema Médico
//                 </Text>
//               </Col>
//               <Col>
//                 <Avatar
//                   size={64}
//                   style={{ backgroundColor: '#722ed1' }}
//                   icon={<HeartFilled />}
//                 />
//               </Col>
//             </Row>
//           </Card>

//           {/* Acordeones */}
//           <Collapse
//             activeKey={activeKey}
//             onChange={setActiveKey}
//             expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
//             style={{ marginBottom: '24px' }}
//             size="large"
//           >
//             {/* Panel 1: Datos del Paciente */}
//             <Panel
//               header={
//                 <Space>
//                   <UserOutlined style={{ color: '#1890ff' }} />
//                   <Text strong>Datos del Paciente</Text>
//                 </Space>
//               }
//               key="1"
//             >
//               <Row gutter={[24, 16]}>
//                 <Col xs={24} sm={12} lg={8}>
//                   <Space direction="vertical" style={{ width: '100%' }}>
//                     <Text strong>
//                       Apellidos <Text type="danger">*</Text>
//                     </Text>
//                     <Input
//                       placeholder="Ingrese los apellidos"
//                       value={formData.apellidos}
//                       onChange={(e) => handleInputChange('apellidos', e.target.value)}
//                       size="large"
//                     />
//                   </Space>
//                 </Col>
                
//                 <Col xs={24} sm={12} lg={8}>
//                   <Space direction="vertical" style={{ width: '100%' }}>
//                     <Text strong>
//                       Nombres <Text type="danger">*</Text>
//                     </Text>
//                     <Input
//                       placeholder="Ingrese los nombres"
//                       value={formData.nombres}
//                       onChange={(e) => handleInputChange('nombres', e.target.value)}
//                       size="large"
//                     />
//                   </Space>
//                 </Col>
                
//                 <Col xs={24} sm={12} lg={8}>
//                   <Space direction="vertical" style={{ width: '100%' }}>
//                     <Text strong>
//                       Cédula <Text type="danger">*</Text>
//                     </Text>
//                     <Input
//                       placeholder="Ingrese la cédula"
//                       value={formData.cedula}
//                       onChange={(e) => handleInputChange('cedula', e.target.value)}
//                       size="large"
//                     />
//                   </Space>
//                 </Col>
                
//                 <Col xs={24} sm={12} lg={8}>
//                   <Space direction="vertical" style={{ width: '100%' }}>
//                     <Text strong>
//                       Edad <Text type="danger">*</Text>
//                     </Text>
//                     <InputNumber
//                       min={0}
//                       max={120}
//                       placeholder="Edad"
//                       style={{ width: '100%' }}
//                       value={formData.edad}
//                       onChange={(value) => handleInputChange('edad', value)}
//                       size="large"
//                     />
//                   </Space>
//                 </Col>

//                 <Col xs={24} sm={12} lg={8}>
//                   <Space direction="vertical" style={{ width: '100%' }}>
//                     <Text strong>
//                       Fecha de Nacimiento <Text type="danger">*</Text>
//                     </Text>
//                     <DatePicker
//                       placeholder="Seleccione la fecha"
//                       style={{ width: '100%' }}
//                       format="DD/MM/YYYY"
//                       value={formData.fecha}
//                       onChange={(value) => handleInputChange('fecha', value)}
//                       size="large"
//                     />
//                   </Space>
//                 </Col>
                
//                 <Col xs={24} sm={12} lg={8}>
//                   <Space direction="vertical" style={{ width: '100%' }}>
//                     <Text strong>
//                       Sexo <Text type="danger">*</Text>
//                     </Text>
//                     <Select
//                       placeholder="Seleccionar..."
//                       value={formData.sexo}
//                       onChange={(value) => handleInputChange('sexo', value)}
//                       style={{ width: '100%' }}
//                       size="large"
//                     >
//                       <Option value="M">Masculino</Option>
//                       <Option value="F">Femenino</Option>
//                     </Select>
//                   </Space>
//                 </Col>
                
//                 <Col xs={24} sm={12} lg={8}>
//                   <Space direction="vertical" style={{ width: '100%' }}>
//                     <Text strong>Estado Civil</Text>
//                     <Select
//                       placeholder="Seleccionar..."
//                       value={formData.estadoCivil}
//                       onChange={(value) => handleInputChange('estadoCivil', value)}
//                       style={{ width: '100%' }}
//                       size="large"
//                     >
//                       <Option value="Soltero">Soltero</Option>
//                       <Option value="Casado">Casado</Option>
//                       <Option value="Divorciado">Divorciado</Option>
//                       <Option value="Viudo">Viudo</Option>
//                       <Option value="Union Libre">Unión Libre</Option>
//                     </Select>
//                   </Space>
//                 </Col>
//               </Row>
//             </Panel>

//             {/* Panel 2: Información Adicional */}
//             <Panel
//               header={
//                 <Space>
//                   <EnvironmentOutlined style={{ color: '#52c41a' }} />
//                   <Text strong>Información Adicional</Text>
//                 </Space>
//               }
//               key="2"
//             >
//               <Row gutter={[24, 16]}>
//                 <Col xs={24} sm={12} lg={6}>
//                   <Space direction="vertical" style={{ width: '100%' }}>
//                     <Text strong>Ocupación</Text>
//                     <Select
//                       placeholder="Seleccionar..."
//                       value={formData.ocupacion}
//                       onChange={(value) => handleInputChange('ocupacion', value)}
//                       style={{ width: '100%' }}
//                       size="large"
//                     >
//                       <Option value="Dependiente">Trabajador Dependiente</Option>
//                       <Option value="Independiente">Trabajador Independiente</Option>
//                       <Option value="Estudiante">Estudiante</Option>
//                       <Option value="Jubilado">Jubilado</Option>
//                       <Option value="Desempleado">Desempleado</Option>
//                     </Select>
//                   </Space>
//                 </Col>

//                 <Col xs={24} sm={12} lg={6}>
//                   <Space direction="vertical" style={{ width: '100%' }}>
//                     <Text strong>Instrucción</Text>
//                     <Select
//                       placeholder="Seleccionar..."
//                       value={formData.instruccion}
//                       onChange={(value) => handleInputChange('instruccion', value)}
//                       style={{ width: '100%' }}
//                       size="large"
//                     >
//                       <Option value="Primaria">Primaria</Option>
//                       <Option value="Secundaria">Secundaria</Option>
//                       <Option value="Superior">Superior</Option>
//                       <Option value="Ninguna">Ninguna</Option>
//                       <Option value="N/A">No Aplica</Option>
//                     </Select>
//                   </Space>
//                 </Col>
                
//                 <Col xs={24} sm={12} lg={6}>
//                   <Space direction="vertical" style={{ width: '100%' }}>
//                     <Text strong>Procedencia</Text>
//                     <Select
//                       placeholder="Seleccionar..."
//                       value={formData.procedencia}
//                       onChange={(value) => handleInputChange('procedencia', value)}
//                       style={{ width: '100%' }}
//                       size="large"
//                     >
//                       <Option value="Urbana">Urbana</Option>
//                       <Option value="Rural">Rural</Option>
//                     </Select>
//                   </Space>
//                 </Col>

//                 <Col xs={24} sm={12} lg={6}>
//                   <Space direction="vertical" style={{ width: '100%' }}>
//                     <Text strong>Provincia</Text>
//                     <Select
//                       placeholder="Seleccionar..."
//                       value={formData.provincia}
//                       onChange={handleProvinciaChange}
//                       style={{ width: '100%' }}
//                       size="large"
//                     >
//                       {provincias.map(prov => (
//                         <Option key={prov} value={prov}>{prov}</Option>
//                       ))}
//                     </Select>
//                   </Space>
//                 </Col>

//                 <Col xs={24} sm={12} lg={6}>
//                   <Space direction="vertical" style={{ width: '100%' }}>
//                     <Text strong>Ciudad</Text>
//                     <Select
//                       placeholder="Seleccionar..."
//                       disabled={!formData.provincia}
//                       value={formData.ciudad}
//                       onChange={(value) => handleInputChange('ciudad', value)}
//                       style={{ width: '100%' }}
//                       size="large"
//                     >
//                       {ciudades.map(ciudad => (
//                         <Option key={ciudad} value={ciudad}>{ciudad}</Option>
//                       ))}
//                     </Select>
//                   </Space>
//                 </Col>
                
//                 <Col xs={24} sm={12} lg={6}>
//                   <Space direction="vertical" style={{ width: '100%' }}>
//                     <Text strong>Sector o Barrio</Text>
//                     <Input
//                       placeholder="Ingrese el sector o barrio"
//                       value={formData.sectorBarrio}
//                       onChange={(e) => handleInputChange('sectorBarrio', e.target.value)}
//                       size="large"
//                     />
//                   </Space>
//                 </Col>

//                 <Col xs={24} sm={12} lg={6}>
//                   <Space direction="vertical" style={{ width: '100%' }}>
//                     <Text strong>Calle</Text>
//                     <Input
//                       placeholder="Ingrese la calle"
//                       value={formData.calle}
//                       onChange={(e) => handleInputChange('calle', e.target.value)}
//                       size="large"
//                     />
//                   </Space>
//                 </Col>

//                 <Col xs={24} sm={12} lg={6}>
//                   <Space direction="vertical" style={{ width: '100%' }}>
//                     <Text strong>Número de Casa</Text>
//                     <Input
//                       placeholder="Ingrese el número"
//                       value={formData.numeroCasa}
//                       onChange={(e) => handleInputChange('numeroCasa', e.target.value)}
//                       size="large"
//                     />
//                   </Space>
//                 </Col>
//               </Row>
//             </Panel>
//           {/* Panel 3: Información Adicional */}
//             <Panel
//               header={
//                 <Space>
//                   <MedicineBoxOutlined style={{ color: '#52c41a' }} />
//                   <Text strong>Informacion Medica</Text>
//                 </Space>
//               }
//               key="3"
//             >
//               <Row gutter={[24, 16]}>
//                 <Col xs={24} sm={12} lg={6}>
//                   <Space direction="vertical" style={{ width: '100%' }}>
//                     <Text strong>Antecedentes</Text>
//                 <TextArea
//                   value={formData.antecedentes}
//                   onChange={(e) => handleInputChange('antecedentes', e.target.value)}
//                   placeholder="Escribe los antecedentes aquí..."
//                   rows={4}
//                     />

//                      <Text strong>Observaciones</Text>
//                 <TextArea
//                   value={formData.observaciones}
//                   onChange={(e) => handleInputChange('observaciones', e.target.value)}
//                   placeholder="Informacion Adicional..."
//                   rows={4}
//                     />

//                   </Space>

                  
//                 </Col>
//               </Row>
//             </Panel>
//             {/* Panel 4: Contactos */}
//             <Panel
//               header={
//                 <Space>
//                   <PhoneOutlined style={{ color: '#722ed1' }} />
//                   <Text strong>Contactos de Emergencia</Text>
//                   {formData.contactos.length > 0 && (
//                     <span style={{ 
//                       background: '#722ed1', 
//                       color: 'white', 
//                       padding: '2px 8px', 
//                       borderRadius: '10px',
//                       fontSize: '12px',
//                       marginLeft: '8px'
//                     }}>
//                       {formData.contactos.length}
//                     </span>
//                   )}
//                 </Space>
//               }
//               key="4"
//             >
//               <Space direction="vertical" size="large" style={{ width: '100%' }}>
//                 <Row justify="end">
//                   <Button
//                     type="primary"
//                     icon={<PlusOutlined />}
//                     onClick={openAddContactModal}
//                     size="large"
//                     style={{ marginBottom: '16px' }}
//                   >
//                     Agregar Contacto
//                   </Button>
//                 </Row>

//                 {formData.contactos.length > 0 ? (
//                   <Table
//                     columns={contactColumns}
//                     dataSource={formData.contactos}
//                     rowKey="id"
//                     pagination={false}
//                     size="middle"
//                     scroll={{ x: 800 }}
//                     bordered
//                   />
//                 ) : (
//                   <div style={{ 
//                     textAlign: 'center', 
//                     padding: '60px 0', 
//                     color: '#999',
//                     background: '#fafafa',
//                     borderRadius: '8px',
//                     border: '2px dashed #d9d9d9'
//                   }}>
//                     <PhoneOutlined style={{ fontSize: '64px', marginBottom: '24px', color: '#d9d9d9' }} />
//                     <Title level={4} type="secondary">No hay contactos agregados</Title>
//                     <Text type="secondary">Haga clic en "Agregar Contacto" para añadir contactos de emergencia</Text>
//                   </div>
//                 )}
//               </Space>
//             </Panel>
//           </Collapse>

//           {/* Botones de Acción */}
//           <Row justify="end" style={{ marginTop: '24px' }}>
//             <Space size="middle">
//               <Button size="large" onClick={goToPatientList}>
//                 Cancelar
//               </Button>
//               <Button
//                 type="primary"
//                 size="large"
//                 icon={<SaveOutlined />}
//                 onClick={handleSubmit}
//               >
//                 Guardar Paciente
//               </Button>
//             </Space>
//           </Row>
//         </div>

//         {/* Modal para Agregar/Editar Contacto */}
//         <Modal
//           title={editingContact ? "Editar Contacto" : "Agregar Contacto"}
//           open={isContactModalOpen}
//           onCancel={cancelContactModal}
//           width={800}
//           footer={[
//             <Button key="cancel" onClick={cancelContactModal} size="large">
//               <CloseOutlined /> Cancelar
//             </Button>,
//             <Button
//               key="submit"
//               type="primary"
//               icon={editingContact ? <EditOutlined /> : <PlusOutlined />}
//               onClick={addContact}
//               size="large"
//             >
//               {editingContact ? "Actualizar Contacto" : "Agregar Contacto"}
//             </Button>,
//           ]}
//         >
//           <Row gutter={[24, 16]}>
//             <Col xs={24} sm={12}>
//               <Space direction="vertical" style={{ width: '100%' }}>
//                 <Text strong>
//                   Apellidos <Text type="danger">*</Text>
//                 </Text>
//                 <Input
//                   placeholder="Apellidos"
//                   value={contactoForm.apellidos}
//                   onChange={(e) => handleContactInputChange('apellidos', e.target.value)}
//                   size="large"
//                 />
//               </Space>
//             </Col>

//             <Col xs={24} sm={12}>
//               <Space direction="vertical" style={{ width: '100%' }}>
//                 <Text strong>
//                   Nombre <Text type="danger">*</Text>
//                 </Text>
//                 <Input
//                   placeholder="Nombre completo"
//                   value={contactoForm.nombre}
//                   onChange={(e) => handleContactInputChange('nombre', e.target.value)}
//                   size="large"
//                 />
//               </Space>
//             </Col>

//             <Col xs={24} sm={12}>
//               <Space direction="vertical" style={{ width: '100%' }}>
//                 <Text strong>
//                   Teléfono <Text type="danger">*</Text>
//                 </Text>
//                 <Input
//                   placeholder="Ej: 0987654321"
//                   value={contactoForm.telefono}
//                   onChange={(e) => handleContactInputChange('telefono', e.target.value)}
//                   size="large"
//                 />
//               </Space>
//             </Col>

//             <Col xs={24} sm={12}>
//               <Space direction="vertical" style={{ width: '100%' }}>
//                 <Text strong>Email</Text>
//                 <Input
//                   placeholder="ejemplo@correo.com"
//                   value={contactoForm.email}
//                   onChange={(e) => handleContactInputChange('email', e.target.value)}
//                   size="large"
//                 />
//               </Space>
//             </Col>

//             <Col xs={24}>
//               <Space direction="vertical" style={{ width: '100%' }}>
//                 <Text strong>Relación con el Paciente</Text>
//                 <Select
//                   placeholder="Seleccionar..."
//                   value={contactoForm.relacion}
//                   onChange={(value) => handleContactInputChange('relacion', value)}
//                   style={{ width: '100%' }}
//                   size="large"
//                 >
//                   <Option value="Padre">Padre</Option>
//                   <Option value="Madre">Madre</Option>
//                   <Option value="Esposo/a">Esposo/a</Option>
//                   <Option value="Hijo/a">Hijo/a</Option>
//                   <Option value="Hermano/a">Hermano/a</Option>
//                   <Option value="Abuelo/a">Abuelo/a</Option>
//                   <Option value="Tío/a">Tío/a</Option>
//                   <Option value="Primo/a">Primo/a</Option>
//                   <Option value="Amigo/a">Amigo/a</Option>
//                   <Option value="Otro">Otro</Option>
//                 </Select>
//               </Space>
//             </Col>
//           </Row>
//         </Modal>
//       </Content>
//     </Layout>
//   );
// }