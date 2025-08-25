import { useState, useEffect } from 'react';
import {
  Input,
  Select,
  DatePicker,
  InputNumber,
  Button,
  Card,
  Table,
  Modal,
  Space,
  Typography,
  Row,
  Col,
  message,
  Popconfirm,
  Avatar,
  Layout,
  Collapse,
  Spin
} from 'antd';
import {
  UserOutlined,
  EnvironmentOutlined,
  MedicineBoxOutlined,
  PhoneOutlined,
  HeartFilled,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
  CaretRightOutlined,
  LockOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;
const { Content } = Layout;
const { Panel } = Collapse;

import { useNavigate, useParams } from "react-router-dom";
import PatientService  from '../../../auth/services/PatientService';
import PatientUpdate from '../../../auth/services/PatientService';
import  Patient  from '../../../auth/services/PatientService';
import dataEcuador from '../../../assets/dataEcuador';
import dayjs, { Dayjs } from 'dayjs';

interface ContactForm {
  id?: number;
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  relationship_type: string;
}

export default function PatientEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [formData, setFormData] = useState({
    last_name: '',
    first_name: '',
    birth_date: null as Dayjs | null,
    age: '',
    gender: '',
    document_id: '', // Este campo será inalterable
    marital_status: '',
    occupation: '',
    education: '',
    origin: '',
    province: '',
    city: '',
    medical_history: '',
    notes: '',
    neighborhood: '',
    street: '',
    house_number: '',
    contacts: [] as ContactForm[]
  });

  const [contactoForm, setContactoForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    relationship_type: ''
  });

  const [editingContact, setEditingContact] = useState<number | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [activeKey, setActiveKey] = useState(['1']);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [originalData, setOriginalData] = useState<Patient | null>(null);

  const provincias = Object.keys(dataEcuador);
  const ciudades = formData.province ? dataEcuador[formData.province] : [];

  useEffect(() => {
    if (id) {
      loadPatientData();
    }
  }, [id]);

  const loadPatientData = async () => {
    if (!id) return;
    
    setInitialLoading(true);
    try {
      const response = await PatientService.getPatientById(id);
      
      if (response.success && response.data) {
        const patient = response.data;
        setOriginalData(patient);
        
        
        setFormData({
          last_name: patient.last_name || '',
          first_name: patient.first_name || '',
          birth_date: patient.birth_date ? dayjs(patient.birth_date) : null,
          age: patient.age || '',
          gender: patient.gender || '',
          document_id: patient.document_id || '',
          marital_status: patient.marital_status || '',
          occupation: patient.occupation || '',
          education: patient.education || '',
          origin: patient.origin || '',
          province: patient.province || '',
          city: patient.city || '',
          medical_history: patient.medical_history || '',
          notes: patient.notes || '',
          neighborhood: patient.neighborhood || '',
          street: patient.street || '',
          house_number: patient.house_number || '',
          contacts: (patient.contacts || []).map((contact, index) => ({
            id: contact.id || Date.now() + index,
            first_name: contact.first_name,
            last_name: contact.last_name,
            phone: contact.phone,
            email: contact.email || '',
            relationship_type: contact.relationship_type
          }))
        });
        
        message.success('Datos del paciente cargados correctamente');
      } else {
        message.error(response.message || 'Error al cargar los datos del paciente');
        navigate('/patientList');
      }
    } catch (error) {
      message.error('Error al cargar los datos del paciente');
      console.error('Error:', error);
      navigate('/patientList');
    } finally {
      setInitialLoading(false);
    }
  };

  const goToPatientList = () => {
    navigate("/patientList");
  };

  const handleInputChange = (field: string, value: any) => {
    // Prevenir cambios en la cédula
    if (field === 'document_id') {
      message.warning('La cédula no puede ser modificada');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContactInputChange = (field: string, value: any) => {
    setContactoForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const openAddContactModal = () => {
    setContactoForm({
      first_name: '',
      last_name: '',
      phone: '',
      email: '',
      relationship_type: ''
    });
    setEditingContact(null);
    setIsContactModalOpen(true);
  };

  const addContact = () => {
    if (!contactoForm.last_name || !contactoForm.first_name || !contactoForm.phone) {
      message.error('Por favor complete al menos el apellido, nombre y teléfono del contacto');
      return;
    }

    const newContact: ContactForm = {
      id: editingContact || Date.now(),
      ...contactoForm
    };

    if (editingContact) {
      setFormData(prev => ({
        ...prev,
        contacts: prev.contacts.map(contact => 
          contact.id === editingContact ? newContact : contact
        )
      }));
      message.success('Contacto actualizado correctamente');
    } else {
      setFormData(prev => ({
        ...prev,
        contacts: [...prev.contacts, newContact]
      }));
      message.success('Contacto agregado correctamente');
    }

    setIsContactModalOpen(false);
    setContactoForm({
      first_name: '',
      last_name: '',
      phone: '',
      email: '',
      relationship_type: ''
    });
    setEditingContact(null);
  };

  const editContact = (contact: ContactForm) => {
    setContactoForm({
      first_name: contact.first_name,
      last_name: contact.last_name,
      phone: contact.phone,
      email: contact.email || '',
      relationship_type: contact.relationship_type || ''
    });
    setEditingContact(contact.id || 0);
    setIsContactModalOpen(true);
  };

  const deleteContact = (contactId: number) => {
    setFormData(prev => ({
      ...prev,
      contacts: prev.contacts.filter(contact => contact.id !== contactId)
    }));
    message.success('Contacto eliminado correctamente');
  };

  const cancelContactModal = () => {
    setEditingContact(null);
    setIsContactModalOpen(false);
    setContactoForm({
      first_name: '',
      last_name: '',
      phone: '',
      email: '',
      relationship_type: ''
    });
  };

  const handleSubmit = async () => {
    if (!id) {
      message.error('ID del paciente no encontrado');
      return;
    }

    
    if (!formData.last_name || !formData.first_name || !formData.age || !formData.gender || !formData.birth_date) {
      message.error('Por favor complete todos los campos obligatorios marcados con *');
      return;
    }

    setLoading(true);

    try {
      
      const patientData: PatientUpdate = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        birth_date: formData.birth_date.format('YYYY-MM-DD'),
        age: formData.age.toString(),
        gender: formData.gender,
        // document_id se excluye intencionalmente
        marital_status: formData.marital_status || undefined,
        occupation: formData.occupation || undefined,
        education: formData.education || undefined,
        origin: formData.origin || undefined,
        province: formData.province || undefined,
        city: formData.city || undefined,
        neighborhood: formData.neighborhood || undefined,
        street: formData.street || undefined,
        house_number: formData.house_number || undefined,
        medical_history: formData.medical_history || undefined,
        notes: formData.notes || undefined,
        contacts: formData.contacts.map(contact => ({
          first_name: contact.first_name,
          last_name: contact.last_name,
          phone: contact.phone,
          email: contact.email || undefined,
          relationship_type: contact.relationship_type
        }))
      };

      console.log('Datos a actualizar:', patientData);

      const response = await PatientService.updatePatient(id, patientData);

      if (response.success) {
        message.success(response.message);
        setTimeout(() => {
          navigate('/patientList');
        }, 1500);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error('Error al actualizar el paciente');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProvinciaChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      province: value,
      city: ''
    }));
  };

  const contactColumns = [
    {
      title: 'Apellidos',
      dataIndex: 'last_name',
      key: 'last_name',
      width: 150,
    },
    {
      title: 'Nombre',
      dataIndex: 'first_name',
      key: 'first_name',
      width: 150,
    },
    {
      title: 'Teléfono',
      dataIndex: 'phone',
      key: 'phone',
      width: 120,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      render: (text: string) => text || '-'
    },
    {
      title: 'Relación',
      dataIndex: 'relationship_type',
      key: 'relationship_type',
      width: 120,
      render: (text: string) => text || '-'
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 150,
      render: (_: any, record: ContactForm) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => editContact(record)}
            size="small"
          >
            Editar
          </Button>
          <Popconfirm
            title="¿Está seguro de que desea eliminar este contacto?"
            onConfirm={() => deleteContact(record.id!)}
            okText="Sí"
            cancelText="No"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              Eliminar
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (initialLoading) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
        <Content style={{ padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '24px' }}>
        <div style={{ maxWidth: '100%', margin: '0 auto' }}>
          {/* Header */}
          <Card style={{ marginBottom: '24px' }} size="default">
            <Row justify="space-between" align="middle">
              <Col>
                <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                  FENIX
                </Title>
                <Text style={{ color: '#722ed1', fontSize: '18px', fontWeight: 500 }}>
                  Editar Paciente
                </Text>
                {formData.document_id && (
                  <div style={{ marginTop: '8px' }}>
                    <Text type="secondary">
                      CI: {formData.document_id}
                    </Text>
                  </div>
                )}
              </Col>
              <Col>
                <Avatar
                  size={64}
                  style={{ backgroundColor: '#722ed1' }}
                  icon={<HeartFilled />}
                />
              </Col>
            </Row>
          </Card>

          {/* Acordeones */}
          <Collapse
            activeKey={activeKey}
            onChange={setActiveKey}
            expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
            style={{ marginBottom: '24px' }}
            size="large"
          >
            {/* Panel 1: Datos del Paciente */}
            <Panel
              header={
                <Space>
                  <UserOutlined style={{ color: '#1890ff' }} />
                  <Text strong>Datos del Paciente</Text>
                </Space>
              }
              key="1"
            >
              <Row gutter={[24, 16]}>
                <Col xs={24} sm={12} lg={8}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text strong>
                      Apellidos <Text type="danger">*</Text>
                    </Text>
                    <Input
                      placeholder="Ingrese los apellidos"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      size="large"
                    />
                  </Space>
                </Col>
                
                <Col xs={24} sm={12} lg={8}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text strong>
                      Nombres <Text type="danger">*</Text>
                    </Text>
                    <Input
                      placeholder="Ingrese los nombres"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      size="large"
                    />
                  </Space>
                </Col>
                
                <Col xs={24} sm={12} lg={8}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text strong>
                      <LockOutlined /> Cédula (No editable)
                    </Text>
                    <Input
                      placeholder="Cédula"
                      value={formData.document_id}
                      disabled
                      size="large"
                      style={{ 
                        backgroundColor: '#f5f5f5',
                        color: '#666',
                        cursor: 'not-allowed'
                      }}
                      addonBefore={<LockOutlined style={{ color: '#999' }} />}
                    />
                  </Space>
                </Col>
                
                <Col xs={24} sm={12} lg={8}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text strong>
                      Edad <Text type="danger">*</Text>
                    </Text>
                    <InputNumber
                      min="0"
                      max="120"
                      placeholder="Edad"
                      style={{ width: '100%' }}
                      value={formData.age}
                      onChange={(value) => handleInputChange('age', value)}
                      size="large"
                    />
                  </Space>
                </Col>

                <Col xs={24} sm={12} lg={8}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text strong>
                      Fecha de Nacimiento <Text type="danger">*</Text>
                    </Text>
                    <DatePicker
                      placeholder="Seleccione la fecha"
                      style={{ width: '100%' }}
                      format="DD/MM/YYYY"
                      value={formData.birth_date}
                      onChange={(value) => handleInputChange('birth_date', value)}
                      size="large"
                    />
                  </Space>
                </Col>
                
                <Col xs={24} sm={12} lg={8}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text strong>
                      Sexo <Text type="danger">*</Text>
                    </Text>
                    <Select
                      placeholder="Seleccionar..."
                      value={formData.gender}
                      onChange={(value) => handleInputChange('gender', value)}
                      style={{ width: '100%' }}
                      size="large"
                    >
                      <Option value="M">Masculino</Option>
                      <Option value="F">Femenino</Option>
                    </Select>
                  </Space>
                </Col>
                
                <Col xs={24} sm={12} lg={8}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text strong>Estado Civil</Text>
                    <Select
                      placeholder="Seleccionar..."
                      value={formData.marital_status}
                      onChange={(value) => handleInputChange('marital_status', value)}
                      style={{ width: '100%' }}
                      size="large"
                    >
                      <Option value="Soltero">Soltero</Option>
                      <Option value="Casado">Casado</Option>
                      <Option value="Divorciado">Divorciado</Option>
                      <Option value="Viudo">Viudo</Option>
                      <Option value="Union Libre">Unión Libre</Option>
                    </Select>
                  </Space>
                </Col>
              </Row>
            </Panel>

            {/* Panel 2: Información Adicional */}
            <Panel
              header={
                <Space>
                  <EnvironmentOutlined style={{ color: '#52c41a' }} />
                  <Text strong>Información Adicional</Text>
                </Space>
              }
              key="2"
            >
              <Row gutter={[24, 16]}>
                <Col xs={24} sm={12} lg={6}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text strong>Ocupación</Text>
                    <Select
                      placeholder="Seleccionar..."
                      value={formData.occupation}
                      onChange={(value) => handleInputChange('occupation', value)}
                      style={{ width: '100%' }}
                      size="large"
                    >
                      <Option value="Dependiente">Trabajador Dependiente</Option>
                      <Option value="Independiente">Trabajador Independiente</Option>
                      <Option value="Estudiante">Estudiante</Option>
                      <Option value="Jubilado">Jubilado</Option>
                      <Option value="Desempleado">Desempleado</Option>
                    </Select>
                  </Space>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text strong>Instrucción</Text>
                    <Select
                      placeholder="Seleccionar..."
                      value={formData.education}
                      onChange={(value) => handleInputChange('education', value)}
                      style={{ width: '100%' }}
                      size="large"
                    >
                      <Option value="Primaria">Primaria</Option>
                      <Option value="Secundaria">Secundaria</Option>
                      <Option value="Bachillerato">Bachillerato</Option>
                      <Option value="Superior">Superior</Option>
                      <Option value="Ninguna">Ninguna</Option>
                      <Option value="N/A">No Aplica</Option>
                    </Select>
                  </Space>
                </Col>
                
                <Col xs={24} sm={12} lg={6}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text strong>Procedencia</Text>
                    <Select
                      placeholder="Seleccionar..."
                      value={formData.origin}
                      onChange={(value) => handleInputChange('origin', value)}
                      style={{ width: '100%' }}
                      size="large"
                    >
                      <Option value="Urbana">Urbana</Option>
                      <Option value="Rural">Rural</Option>
                    </Select>
                  </Space>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text strong>Provincia</Text>
                    <Select
                      placeholder="Seleccionar..."
                      value={formData.province}
                      onChange={handleProvinciaChange}
                      style={{ width: '100%' }}
                      size="large"
                    >
                      {provincias.map(prov => (
                        <Option key={prov} value={prov}>{prov}</Option>
                      ))}
                    </Select>
                  </Space>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text strong>Ciudad</Text>
                    <Select
                      placeholder="Seleccionar..."
                      disabled={!formData.province}
                      value={formData.city}
                      onChange={(value) => handleInputChange('city', value)}
                      style={{ width: '100%' }}
                      size="large"
                    >
                      {ciudades.map(ciudad => (
                        <Option key={ciudad} value={ciudad}>{ciudad}</Option>
                      ))}
                    </Select>
                  </Space>
                </Col>
                
                <Col xs={24} sm={12} lg={6}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text strong>Sector o Barrio</Text>
                    <Input
                      placeholder="Ingrese el sector o barrio"
                      value={formData.neighborhood}
                      onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                      size="large"
                    />
                  </Space>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text strong>Calle</Text>
                    <Input
                      placeholder="Ingrese la calle"
                      value={formData.street}
                      onChange={(e) => handleInputChange('street', e.target.value)}
                      size="large"
                    />
                  </Space>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text strong>Número de Casa</Text>
                    <Input
                      placeholder="Ingrese el número"
                      value={formData.house_number}
                      onChange={(e) => handleInputChange('house_number', e.target.value)}
                      size="large"
                    />
                  </Space>
                </Col>
              </Row>
            </Panel>

            {/* Panel 3: Información Médica */}
            <Panel
              header={
                <Space>
                  <MedicineBoxOutlined style={{ color: '#52c41a' }} />
                  <Text strong>Información Médica</Text>
                </Space>
              }
              key="3"
            >
              <Row gutter={[24, 16]}>
                <Col xs={24} sm={12}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text strong>Antecedentes Médicos</Text>
                    <TextArea
                      value={formData.medical_history}
                      onChange={(e) => handleInputChange('medical_history', e.target.value)}
                      placeholder="Escribe los antecedentes médicos aquí..."
                      rows={4}
                    />
                  </Space>
                </Col>

                <Col xs={24} sm={12}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text strong>Observaciones</Text>
                    <TextArea
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="Información adicional..."
                      rows={4}
                    />
                  </Space>
                </Col>
              </Row>
            </Panel>

            {/* Panel 4: Contactos */}
            <Panel
              header={
                <Space>
                  <PhoneOutlined style={{ color: '#722ed1' }} />
                  <Text strong>Contactos de Emergencia</Text>
                  {formData.contacts.length > 0 && (
                    <span style={{ 
                      background: '#722ed1', 
                      color: 'white', 
                      padding: '2px 8px', 
                      borderRadius: '10px',
                      fontSize: '12px',
                      marginLeft: '8px'
                    }}>
                      {formData.contacts.length}
                    </span>
                  )}
                </Space>
              }
              key="4"
            >
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Row justify="end">
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={openAddContactModal}
                    size="large"
                    style={{ marginBottom: '16px' }}
                  >
                    Agregar Contacto
                  </Button>
                </Row>

                {formData.contacts.length > 0 ? (
                  <Table
                    columns={contactColumns}
                    dataSource={formData.contacts}
                    rowKey="id"
                    pagination={false}
                    size="middle"
                    scroll={{ x: 800 }}
                    bordered
                  />
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '60px 0', 
                    color: '#999',
                    background: '#fafafa',
                    borderRadius: '8px',
                    border: '2px dashed #d9d9d9'
                  }}>
                    <PhoneOutlined style={{ fontSize: '64px', marginBottom: '24px', color: '#d9d9d9' }} />
                    <Title level={4} type="secondary">No hay contactos agregados</Title>
                    <Text type="secondary">Haga clic en "Agregar Contacto" para añadir contactos de emergencia</Text>
                  </div>
                )}
              </Space>
            </Panel>
          </Collapse>

          {/* Botones de Acción */}
          <Row justify="end" style={{ marginTop: '24px' }}>
            <Space size="middle">
              <Button size="large" onClick={goToPatientList} disabled={loading}>
                Cancelar
              </Button>
              <Button
                type="primary"
                size="large"
                icon={<SaveOutlined />}
                onClick={handleSubmit}
                loading={loading}
              >
                Actualizar Paciente
              </Button>
            </Space>
          </Row>
        </div>

        {/* Modal para Agregar/Editar Contacto */}
        <Modal
          title={editingContact ? "Editar Contacto" : "Agregar Contacto"}
          open={isContactModalOpen}
          onCancel={cancelContactModal}
          width={800}
          footer={[
            <Button key="cancel" onClick={cancelContactModal} size="large">
              <CloseOutlined /> Cancelar
            </Button>,
            <Button
              key="submit"
              type="primary"
              icon={editingContact ? <EditOutlined /> : <PlusOutlined />}
              onClick={addContact}
              size="large"
            >
              {editingContact ? "Actualizar Contacto" : "Agregar Contacto"}
            </Button>,
          ]}
        >
          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>
                  Apellidos <Text type="danger">*</Text>
                </Text>
                <Input
                  placeholder="Apellidos"
                  value={contactoForm.last_name}
                  onChange={(e) => handleContactInputChange('last_name', e.target.value)}
                  size="large"
                />
              </Space>
            </Col>

            <Col xs={24} sm={12}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>
                  Nombre <Text type="danger">*</Text>
                </Text>
                <Input
                  placeholder="Nombre completo"
                  value={contactoForm.first_name}
                  onChange={(e) => handleContactInputChange('first_name', e.target.value)}
                  size="large"
                />
              </Space>
            </Col>

            <Col xs={24} sm={12}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>
                  Teléfono <Text type="danger">*</Text>
                </Text>
                <Input
                  placeholder="Ej: 0987654321"
                  value={contactoForm.phone}
                  onChange={(e) => handleContactInputChange('phone', e.target.value)}
                  size="large"
                />
              </Space>
            </Col>

            <Col xs={24} sm={12}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>Email</Text>
                <Input
                  placeholder="ejemplo@correo.com"
                  value={contactoForm.email}
                  onChange={(e) => handleContactInputChange('email', e.target.value)}
                  size="large"
                />
              </Space>
            </Col>

            <Col xs={24}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>Relación con el Paciente</Text>
                <Select
                  placeholder="Seleccionar..."
                  value={contactoForm.relationship_type}
                  onChange={(value) => handleContactInputChange('relationship_type', value)}
                  style={{ width: '100%' }}
                  size="large"
                >
                  <Option value="Padre">Padre</Option>
                  <Option value="Madre">Madre</Option>
                  <Option value="Esposo/a">Esposo/a</Option>
                  <Option value="Hijo/a">Hijo/a</Option>
                  <Option value="Hermano/a">Hermano/a</Option>
                  <Option value="Abuelo/a">Abuelo/a</Option>
                  <Option value="Tío/a">Tío/a</Option>
                  <Option value="Primo/a">Primo/a</Option>
                  <Option value="Amigo/a">Amigo/a</Option>
                  <Option value="Otro">Otro</Option>
                </Select>
              </Space>
            </Col>
          </Row>
        </Modal>
      </Content>
    </Layout>
  );
}