import { useState } from 'react';
import {
  Input,
  Select,
  Button,
  Card,
  Table,
  Space,
  Typography,
  Row,
  Col,
  Avatar,
  Layout,
  Tag,
  Popconfirm,
  Modal,
  message,
  Tooltip
} from 'antd';
import {
  UserOutlined,
  HeartFilled,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  FilterOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  MailOutlined,
  HomeOutlined
} from '@ant-design/icons';

import { useNavigate } from "react-router-dom";


const { Title, Text } = Typography;
const { Content } = Layout;
const { Option } = Select;

export default function PatientList() {

  const navigate = useNavigate();

  const [patients, setPatients] = useState([
    {
      id: 1,
      apellidos: 'García López',
      nombres: 'María Elena',
      cedula: '1234567890',
      edad: 34,
      sexo: 'F',
      fecha: '1989-03-15',
      estadoCivil: 'Casado',
      ocupacion: 'Dependiente',
      instruccion: 'Superior',
      procedencia: 'Urbana',
      provincia: 'Pichincha',
      ciudad: 'Quito',
      sectorBarrio: 'La Carolina',
      calle: 'Av. Amazonas',
      numeroCasa: '123',
      contactos: [
        { 
          nombre: 'Juan', 
          apellidos: 'García', 
          telefono: '0987654321', 
          email: 'juan.garcia@email.com',
          relacion: 'Esposo' 
        },
        { 
          nombre: 'Ana', 
          apellidos: 'López', 
          telefono: '0976543210', 
          email: 'ana.lopez@email.com',
          relacion: 'Madre' 
        }
      ]
    },
    {
      id: 2,
      apellidos: 'Rodríguez Silva',
      nombres: 'Carlos Andrés',
      cedula: '0987654321',
      edad: 28,
      sexo: 'M',
      fecha: '1995-07-22',
      estadoCivil: 'Soltero',
      ocupacion: 'Independiente',
      instruccion: 'Bachillerato',
      procedencia: 'Urbana',
      provincia: 'Guayas',
      ciudad: 'Guayaquil',
      sectorBarrio: 'Urdesa',
      calle: 'Av. Víctor Emilio Estrada',
      numeroCasa: '456',
      contactos: [
        { 
          nombre: 'Rosa', 
          apellidos: 'Silva', 
          telefono: '0965432109', 
          email: 'rosa.silva@email.com',
          relacion: 'Madre' 
        }
      ]
    },
    {
      id: 3,
      apellidos: 'Vásquez Morales',
      nombres: 'Ana Lucía',
      cedula: '1122334455',
      edad: 42,
      sexo: 'F',
      fecha: '1981-11-08',
      estadoCivil: 'Divorciado',
      ocupacion: 'Estudiante',
      instruccion: 'Superior',
      procedencia: 'Rural',
      provincia: 'Azuay',
      ciudad: 'Cuenca',
      sectorBarrio: 'El Ejido',
      calle: 'Calle Larga',
      numeroCasa: '789',
      contactos: [
        { 
          nombre: 'Pedro', 
          apellidos: 'Morales', 
          telefono: '0954321098', 
          email: 'pedro.morales@email.com',
          relacion: 'Hermano' 
        },
        { 
          nombre: 'Laura', 
          apellidos: 'Vásquez', 
          telefono: '0943210987', 
          email: 'laura.vasquez@email.com',
          relacion: 'Hija' 
        }
      ]
    }
  ]);

  const [filteredPatients, setFilteredPatients] = useState(patients);
  const [searchText, setSearchText] = useState('');
  const [sexFilter, setSexFilter] = useState('');
  const [provinceFilter, setProvinceFilter] = useState('');
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);


   const goToCreatePatient = () => {
    navigate("/createPatient"); // Aquí pones la ruta a la que quieres ir
  };


  const handleSearch = (value) => {
    setSearchText(value);
    filterPatients(value, sexFilter, provinceFilter);
  };

  const handleSexFilter = (value) => {
    setSexFilter(value);
    filterPatients(searchText, value, provinceFilter);
  };

  const handleProvinceFilter = (value) => {
    setProvinceFilter(value);
    filterPatients(searchText, sexFilter, value);
  };

  const filterPatients = (search, sex, province) => {
    let filtered = patients;

    if (search) {
      filtered = filtered.filter(patient => 
        patient.apellidos.toLowerCase().includes(search.toLowerCase()) ||
        patient.nombres.toLowerCase().includes(search.toLowerCase()) ||
        patient.cedula.includes(search) ||
        patient.ciudad.toLowerCase().includes(search.toLowerCase()) ||
        patient.sectorBarrio.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (sex) {
      filtered = filtered.filter(patient => patient.sexo === sex);
    }

    if (province) {
      filtered = filtered.filter(patient => patient.provincia === province);
    }

    setFilteredPatients(filtered);
  };

  const clearFilters = () => {
    setSearchText('');
    setSexFilter('');
    setProvinceFilter('');
    setFilteredPatients(patients);
  };

  const handleEdit = (patient) => {
    message.info(`Editar paciente: ${patient.nombres} ${patient.apellidos}`);
    // Aquí iría la lógica para abrir el formulario de edición
  };

  const handleDelete = (patientId) => {
    setPatients(patients.filter(p => p.id !== patientId));
    setFilteredPatients(filteredPatients.filter(p => p.id !== patientId));
    message.success('Paciente eliminado correctamente');
  };

  const showPatientDetail = (patient) => {
    setSelectedPatient(patient);
    setIsDetailModalVisible(true);
  };

  const provinces = [...new Set(patients.map(p => p.provincia))];

  const columns = [
    {
      title: 'Paciente',
      key: 'patient',
      width: 250,
      render: (_, record) => (
        <Space>
          <Avatar 
            style={{ backgroundColor: record.sexo === 'F' ? '#f56a00' : '#1890ff' }}
            icon={<UserOutlined />}
          />
          <div>
            <div style={{ fontWeight: 'bold' }}>
              {record.apellidos}, {record.nombres}
            </div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              CI: {record.cedula}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Información Personal',
      key: 'personal',
      width: 180,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Text>{record.edad} años - {record.sexo === 'M' ? 'Masculino' : 'Femenino'}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            <CalendarOutlined /> {record.fecha}
          </Text>
          <Tag color={record.sexo === 'M' ? 'blue' : 'pink'}>
            {record.estadoCivil}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Ubicación',
      key: 'location',
      width: 180,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Text>
            <EnvironmentOutlined /> {record.provincia}
          </Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.ciudad}
          </Text>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            <HomeOutlined /> {record.sectorBarrio}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Educación/Procedencia',
      key: 'education',
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Tag color="green">{record.instruccion}</Tag>
          <Tag color="orange">{record.procedencia}</Tag>
        </Space>
      ),
    },
  

    {
      title: 'Contactos',
      key: 'contactos',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Tag color="purple">
          <PhoneOutlined /> {record.contactos.length}
        </Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Ver detalles">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => showPatientDetail(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Editar">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              size="small"
            />
          </Tooltip>
          <Popconfirm
            title="¿Está seguro de eliminar este paciente?"
            description="Esta acción no se puede deshacer."
            onConfirm={() => handleDelete(record.id)}
            okText="Sí, eliminar"
            cancelText="Cancelar"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Eliminar">
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '24px' }}>
        <div style={{ maxWidth: '100%', margin: '0 auto' }}>
          {/* Header */}
          <Card style={{ marginBottom: '24px' }}>
            <Row justify="space-between" align="middle">
              <Col>
                <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                  FENIX
                </Title>
                <Text style={{ color: '#722ed1', fontSize: '18px', fontWeight: 500 }}>
                  Lista de Pacientes
                </Text>
              </Col>
              <Col>
                <Space>
                  <Avatar
                    size={64}
                    style={{ backgroundColor: '#722ed1' }}
                    icon={<HeartFilled />}
                  />
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={goToCreatePatient}  
               
              >
                Nuevo Paciente
            </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Filtros */}
          <Card style={{ marginBottom: '24px' }}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={12} lg={8}>
                <Input
                  placeholder="Buscar por nombre, cédula, diagnóstico, ciudad..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => handleSearch(e.target.value)}
                  size="large"
                  allowClear
                />
              </Col>
              <Col xs={24} sm={6} lg={4}>
                <Select
                  placeholder="Sexo"
                  value={sexFilter}
                  onChange={handleSexFilter}
                  style={{ width: '100%' }}
                  size="large"
                  allowClear
                >
                  <Option value="M">Masculino</Option>
                  <Option value="F">Femenino</Option>
                </Select>
              </Col>
              <Col xs={24} sm={6} lg={4}>
                <Select
                  placeholder="Provincia"
                  value={provinceFilter}
                  onChange={handleProvinceFilter}
                  style={{ width: '100%' }}
                  size="large"
                  allowClear
                >
                  {provinces.map(province => (
                    <Option key={province} value={province}>{province}</Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <Space>
                  <Button
                    icon={<FilterOutlined />}
                    onClick={clearFilters}
                    size="large"
                  >
                    Limpiar Filtros
                  </Button>
                  <Text type="secondary">
                    {filteredPatients.length} de {patients.length} pacientes
                  </Text>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Tabla */}
          <Card>
            <Table
              columns={columns}
              dataSource={filteredPatients}
              rowKey="id"
              scroll={{ x: 1400 }}
              pagination={{
                total: filteredPatients.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} de ${total} pacientes`,
              }}
              size="middle"
            />
          </Card>

          {/* Modal de Detalles */}
          <Modal
            title={
              <Space>
                <UserOutlined style={{ color: '#1890ff' }} />
                Detalles del Paciente
              </Space>
            }
            open={isDetailModalVisible}
            onCancel={() => setIsDetailModalVisible(false)}
            width={900}
            footer={[
              <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
                Cerrar
              </Button>,
              <Button
                key="edit"
                type="primary"
                icon={<EditOutlined />}
                onClick={() => {
                  handleEdit(selectedPatient);
                  setIsDetailModalVisible(false);
                }}
              >
                Editar Paciente
              </Button>,
            ]}
          >
            {selectedPatient && (
              <div>
                <Row gutter={[24, 16]}>
                  <Col xs={24} sm={12}>
                    <Card size="small" title="Información Personal">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text><strong>Nombres:</strong> {selectedPatient.nombres}</Text>
                        <Text><strong>Apellidos:</strong> {selectedPatient.apellidos}</Text>
                        <Text><strong>Cédula:</strong> {selectedPatient.cedula}</Text>
                        <Text><strong>Fecha de Nacimiento:</strong> {selectedPatient.fecha}</Text>
                        <Text><strong>Edad:</strong> {selectedPatient.edad} años</Text>
                        <Text><strong>Sexo:</strong> {selectedPatient.sexo === 'M' ? 'Masculino' : 'Femenino'}</Text>
                        <Text><strong>Estado Civil:</strong> {selectedPatient.estadoCivil}</Text>
                        <Text><strong>Ocupación:</strong> {selectedPatient.ocupacion}</Text>
                        <Text><strong>Instrucción:</strong> {selectedPatient.instruccion}</Text>
                        <Text><strong>Procedencia:</strong> {selectedPatient.procedencia}</Text>
                      </Space>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Card size="small" title="Dirección">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text><strong>Provincia:</strong> {selectedPatient.provincia}</Text>
                        <Text><strong>Ciudad:</strong> {selectedPatient.ciudad}</Text>
                        <Text><strong>Sector/Barrio:</strong> {selectedPatient.sectorBarrio}</Text>
                        <Text><strong>Calle:</strong> {selectedPatient.calle}</Text>
                        <Text><strong>Número de Casa:</strong> {selectedPatient.numeroCasa}</Text>
                      </Space>
                    </Card>
                  </Col>
                  <Col xs={24}>
                    <Card size="small" title={`Contactos de Emergencia (${selectedPatient.contactos.length})`}>
                      {selectedPatient.contactos.map((contact, index) => (
                        <div key={index} style={{ marginBottom: '12px', padding: '12px', background: '#f5f5f5', borderRadius: '6px' }}>
                          <Text><strong>{contact.nombre} {contact.apellidos}</strong></Text>
                          <br />
                          <Space direction="vertical" size="small" style={{ marginTop: '4px' }}>
                            <Text type="secondary">
                              <PhoneOutlined /> {contact.telefono}
                            </Text>
                            {contact.email && (
                              <Text type="secondary">
                                <MailOutlined /> {contact.email}
                              </Text>
                            )}
                            <Text type="secondary">
                              <strong>Relación:</strong> {contact.relacion}
                            </Text>
                          </Space>
                        </div>
                      ))}
                    </Card>
                  </Col>
                </Row>
              </div>
            )}
          </Modal>
        </div>
      </Content>
    </Layout>
  );
}