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
  Tooltip,
  DatePicker,
  Descriptions
} from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  FilterOutlined,
  HeartOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  ExperimentOutlined,

} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Content } = Layout;
const { RangePicker } = DatePicker;

export default function AppointmentList() {
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      patientId: 1,
      nombres: 'María Elena',
      apellidos: 'García López',
      cedula: '1234567890',
      fecha: '2024-08-05',
      hora: '09:30',
      anamnesis: {
        antecedentes: 'Hipertensión arterial familiar, diabetes mellitus tipo 2 en madre',
        enfermedadActual: 'Paciente refiere dolor abdominal de 3 días de evolución, localizado en epigastrio, de intensidad moderada, que se irradia hacia el dorso. Asociado a náuseas y vómitos ocasionales.'
      },
      examenFisico: 'Paciente consciente, orientada, colaboradora. Mucosas húmedas, normocoloreadas. Abdomen blando, depresible, doloroso a la palpación en epigastrio, sin signos de irritación peritoneal.',
      diagnostico: {
        code: 'K29.7',
        description: 'Gastritis, no especificada'
      },
      observaciones: 'Se recomienda dieta blanda, omeprazol 20mg cada 12 horas por 7 días. Control en 1 semana.',
      examenes: 'Hemograma completo, glucosa, creatinina, ecografía abdominal',
      signosVitales: {
        temperatura: '36.5',
        presionArterial: '120/80',
        frecuenciaCardiaca: '78',
        saturacionO2: '98',
        peso: '65',
        talla: '160'
      }
    },
    {
      id: 2,
      patientId: 2,
      nombres: 'Carlos Andrés',
      apellidos: 'Rodríguez Silva',
      cedula: '0987654321',
      fecha: '2024-08-06',
      hora: '14:15',
      anamnesis: {
        antecedentes: 'Alergia a penicilina, cirugía de apendicectomía hace 5 años',
        enfermedadActual: 'Paciente masculino de 28 años que acude por presentar tos seca de 1 semana de evolución, acompañada de malestar general y febrícula vespertina.'
      },
      examenFisico: 'Buen estado general, afebril. Orofaringe eritematosa. Pulmones: murmullo vesicular conservado, no estertores. Corazón: ruidos cardíacos rítmicos, no soplos.',
      diagnostico: {
        code: 'J06.9',
        description: 'Infección aguda de las vías respiratorias superiores, no especificada'
      },
      observaciones: 'Tratamiento sintomático con paracetamol 500mg cada 8 horas, abundantes líquidos, reposo relativo.',
      examenes: 'Rx de tórax PA y lateral',
      signosVitales: {
        temperatura: '37.2',
        presionArterial: '115/75',
        frecuenciaCardiaca: '82',
        saturacionO2: '99',
        peso: '75',
        talla: '175'
      }
    },
    {
      id: 3,
      patientId: 3,
      nombres: 'Ana Lucía',
      apellidos: 'Vásquez Morales',
      cedula: '1122334455',
      fecha: '2024-08-07',
      hora: '11:00',
      anamnesis: {
        antecedentes: 'Migraña crónica, uso de anticonceptivos orales',
        enfermedadActual: 'Paciente femenina que presenta cefalea frontal pulsátil de 2 días de evolución, intensidad 8/10, asociada a fotofobia y náuseas.'
      },
      examenFisico: 'Paciente con facies álgica, consciente, orientada. Pupilas isocóricas, reactivas. Rigidez de nuca negativa. Examen neurológico sin déficit focal.',
      diagnostico: {
        code: 'G43.9',
        description: 'Migraña, no especificada'
      },
      observaciones: 'Crisis migrañosa típica. Se administra sumatriptán 50mg vía oral. Educación sobre factores desencadenantes.',
      examenes: 'No requiere estudios complementarios en esta ocasión',
      signosVitales: {
        temperatura: '36.8',
        presionArterial: '110/70',
        frecuenciaCardiaca: '88',
        saturacionO2: '97',
        peso: '58',
        talla: '162'
      }
    }
  ]);

  const [filteredAppointments, setFilteredAppointments] = useState(appointments);
  const [searchText, setSearchText] = useState('');
  const [dateFilter, setDateFilter] = useState([]);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const handleSearch = (value) => {
    setSearchText(value);
    filterAppointments(value, dateFilter);
  };

  const handleDateFilter = (dates) => {
    setDateFilter(dates);
    filterAppointments(searchText, dates);
  };

  const filterAppointments = (search, dates) => {
    let filtered = appointments;

    if (search) {
      filtered = filtered.filter(appointment => 
        appointment.apellidos.toLowerCase().includes(search.toLowerCase()) ||
        appointment.nombres.toLowerCase().includes(search.toLowerCase()) ||
        appointment.cedula.includes(search) ||
        appointment.diagnostico.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (dates && dates.length === 2) {
      filtered = filtered.filter(appointment => {
        const appointmentDate = new Date(appointment.fecha);
        return appointmentDate >= dates[0].toDate() && appointmentDate <= dates[1].toDate();
      });
    }

    setFilteredAppointments(filtered);
  };

  const clearFilters = () => {
    setSearchText('');
    setDateFilter([]);
    setFilteredAppointments(appointments);
  };

  const handleEdit = (appointment) => {
    message.info(`Editar cita: ${appointment.nombres} ${appointment.apellidos}`);
  };

  const handleDelete = (appointmentId) => {
    setAppointments(appointments.filter(a => a.id !== appointmentId));
    setFilteredAppointments(filteredAppointments.filter(a => a.id !== appointmentId));
    message.success('Cita eliminada correctamente');
  };

  const showAppointmentDetail = (appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailModalVisible(true);
  };

  const columns = [
    {
      title: 'Paciente',
      key: 'patient',
      width: 200,
      render: (_, record) => (
        <Space>
          <Avatar 
            style={{ backgroundColor: '#1890ff' }}
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
      title: 'Fecha y Hora',
      key: 'datetime',
      width: 120,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Text>
            <CalendarOutlined /> {record.fecha}
          </Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.hora}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Diagnóstico',
      key: 'diagnostico',
      width: 250,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Tag color="blue">{record.diagnostico.code}</Tag>
          <Text style={{ fontSize: '12px' }}>
            {record.diagnostico.description}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Signos Vitales',
      key: 'vitales',
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Text style={{ fontSize: '11px' }}>
            T: {record.signosVitales.temperatura}°C
          </Text>
          <Text style={{ fontSize: '11px' }}>
            TA: {record.signosVitales.presionArterial}
          </Text>
          <Text style={{ fontSize: '11px' }}>
            FC: {record.signosVitales.frecuenciaCardiaca} lpm
          </Text>
        </Space>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Ver detalles">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => showAppointmentDetail(record)}
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
            title="¿Está seguro de eliminar esta cita?"
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
                  Citas Médicas
                </Text>
              </Col>
              <Col>
                <Space>
                  <Avatar
                    size={64}
                    style={{ backgroundColor: '#722ed1' }}
                    icon={<HeartOutlined />}
                  />
                  <Button
                    type="primary"
                    size="large"
                    icon={<PlusOutlined />}
                    onClick={() => message.info('Ir a crear nueva cita')}
                  >
                    Nueva Cita
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
                  placeholder="Buscar por paciente, cédula, diagnóstico..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => handleSearch(e.target.value)}
                  size="large"
                  allowClear
                />
              </Col>
              <Col xs={24} sm={8} lg={6}>
                <RangePicker
                  placeholder={['Fecha inicio', 'Fecha fin']}
                  value={dateFilter}
                  onChange={handleDateFilter}
                  style={{ width: '100%' }}
                  size="large"
                />
              </Col>
              <Col xs={24} sm={12} lg={10}>
                <Space>
                  <Button
                    icon={<FilterOutlined />}
                    onClick={clearFilters}
                    size="large"
                  >
                    Limpiar Filtros
                  </Button>
                  <Text type="secondary">
                    {filteredAppointments.length} de {appointments.length} citas
                  </Text>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Tabla */}
          <Card>
            <Table
              columns={columns}
              dataSource={filteredAppointments}
              rowKey="id"
              scroll={{ x: 1200 }}
              pagination={{
                total: filteredAppointments.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} de ${total} citas`,
              }}
              size="middle"
            />
          </Card>

          {/* Modal de Detalles */}
          <Modal
            title={
              <Space>
                <CalendarOutlined style={{ color: '#1890ff' }} />
                Detalles de la Cita Médica
              </Space>
            }
            open={isDetailModalVisible}
            onCancel={() => setIsDetailModalVisible(false)}
            width={1000}
            footer={[
              <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
                Cerrar
              </Button>,
              <Button
                key="edit"
                type="primary"
                icon={<EditOutlined />}
                onClick={() => {
                  handleEdit(selectedAppointment);
                  setIsDetailModalVisible(false);
                }}
              >
                Editar Cita
              </Button>,
            ]}
          >
            {selectedAppointment && (
              <div>
                <Row gutter={[24, 16]}>
                  {/* Información del Paciente */}
                  <Col xs={24}>
                    <Card size="small" title="Información del Paciente">
                      <Descriptions column={3} size="small">
                        <Descriptions.Item label="Paciente">
                          {selectedAppointment.nombres} {selectedAppointment.apellidos}
                        </Descriptions.Item>
                        <Descriptions.Item label="Cédula">
                          {selectedAppointment.cedula}
                        </Descriptions.Item>
                        <Descriptions.Item label="Fecha y Hora">
                          {selectedAppointment.fecha} - {selectedAppointment.hora}
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>

                  {/* Anamnesis */}
                  <Col xs={24}>
                    <Card size="small" title={<><FileTextOutlined /> Anamnesis</>}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <div>
                          <Text strong>Antecedentes:</Text>
                          <br />
                          <Text>{selectedAppointment.anamnesis.antecedentes}</Text>
                        </div>
                        <div>
                          <Text strong>Enfermedad Actual:</Text>
                          <br />
                          <Text>{selectedAppointment.anamnesis.enfermedadActual}</Text>
                        </div>
                      </Space>
                    </Card>
                  </Col>

                  {/* Examen Físico y Diagnóstico */}
                  <Col xs={24} md={12}>
                    <Card size="small" title={<><MedicineBoxOutlined /> Examen Físico</>}>
                      <Text>{selectedAppointment.examenFisico}</Text>
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card size="small" title="Diagnóstico (CIE-10)">
                      <Space direction="vertical">
                        <Tag color="blue" style={{ fontSize: '14px', padding: '4px 8px' }}>
                          {selectedAppointment.diagnostico.code}
                        </Tag>
                        <Text>{selectedAppointment.diagnostico.description}</Text>
                      </Space>
                    </Card>
                  </Col>

                  {/* Signos Vitales */}
                  <Col xs={24}>
                    <Card size="small" title="Signos Vitales">
                      <Row gutter={[16, 8]}>
                        <Col xs={12} sm={8} md={4}>
                          <Text strong>Temperatura:</Text>
                          <br />
                          <Text>{selectedAppointment.signosVitales.temperatura}°C</Text>
                        </Col>
                        <Col xs={12} sm={8} md={4}>
                          <Text strong>Presión Arterial:</Text>
                          <br />
                          <Text>{selectedAppointment.signosVitales.presionArterial} mmHg</Text>
                        </Col>
                        <Col xs={12} sm={8} md={4}>
                          <Text strong>Frecuencia Cardíaca:</Text>
                          <br />
                          <Text>{selectedAppointment.signosVitales.frecuenciaCardiaca} lpm</Text>
                        </Col>
                        <Col xs={12} sm={8} md={4}>
                          <Text strong>SpO2:</Text>
                          <br />
                          <Text>{selectedAppointment.signosVitales.saturacionO2}%</Text>
                        </Col>
                        <Col xs={12} sm={8} md={4}>
                          <Text strong>Peso:</Text>
                          <br />
                          <Text>{selectedAppointment.signosVitales.peso} kg</Text>
                        </Col>
                        <Col xs={12} sm={8} md={4}>
                          <Text strong>Talla:</Text>
                          <br />
                          <Text>{selectedAppointment.signosVitales.talla} cm</Text>
                        </Col>
                      </Row>
                    </Card>
                  </Col>

                  {/* Observaciones y Exámenes */}
                  <Col xs={24} md={12}>
                    <Card size="small" title="Observaciones">
                      <Text>{selectedAppointment.observaciones}</Text>
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card size="small" title={<><ExperimentOutlined /> Exámenes</>}>
                      <Text>{selectedAppointment.examenes}</Text>
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