import { useState, useEffect } from 'react';
import {
  Input,
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
  Descriptions,
  Spin,
  Select,
  Alert
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
  ReloadOutlined
} from '@ant-design/icons';

// Import services
import AppointmentService  from '../../../auth/services/AppointmentService';
import  Appointment  from '../../../auth/services/AppointmentService';
import PatientService from '../../../auth/services/PatientService';
import Patient  from '../../../auth/services/PatientService';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Content } = Layout;
const { RangePicker } = DatePicker;
const { Option } = Select;

export default function AppointmentList() {
  const navigator = useNavigate()
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [dateFilter, setDateFilter] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    loadAppointments();
    loadPatients();
  }, []);

  function goToCreateAppointment() {
    navigator('/appointmentCreate');
  }

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const response = await AppointmentService.getAppointments({
        skip: 0,
        limit: 1000,
        include_patient: true
      });

      if (response.success) {
        setAppointments(response.data);
        setFilteredAppointments(response.data);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error('Error al cargar las citas');
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const response = await PatientService.getPatients({
        skip: 0,
        limit: 1000
      });

      if (response.success) {
        setPatients(response.data);
      }
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
    }
  };

  // Filtrar citas
  const filterAppointments = () => {
    let filtered = appointments;

    // Filtro por texto (buscar en nombre del paciente o diagnóstico)
    if (searchText) {
      filtered = filtered.filter(appointment => {
        const patientName = appointment.patient 
          ? `${appointment.patient.first_name} ${appointment.patient.last_name}`.toLowerCase()
          : '';
        const patientDocument = appointment.patient?.document_id || '';
        const diagnosis = appointment.diagnosis_description?.toLowerCase() || '';
        
        return patientName.includes(searchText.toLowerCase()) ||
               patientDocument.includes(searchText) ||
               diagnosis.includes(searchText.toLowerCase());
      });
    }

    // Filtro por paciente específico
    if (selectedPatientId) {
      filtered = filtered.filter(appointment => 
        appointment.patient_id === selectedPatientId
      );
    }

    // Filtro por rango de fechas
    if (dateFilter && dateFilter.length === 2) {
      const startDate = dateFilter[0].format('YYYY-MM-DD');
      const endDate = dateFilter[1].format('YYYY-MM-DD');
      
      filtered = filtered.filter(appointment => {
        return appointment.appointment_date >= startDate && 
               appointment.appointment_date <= endDate;
      });
    }

    setFilteredAppointments(filtered);
  };

  // Aplicar filtros cuando cambien los valores
  useEffect(() => {
    filterAppointments();
  }, [searchText, selectedPatientId, dateFilter, appointments]);

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleDateFilter = (dates: any) => {
    setDateFilter(dates);
  };

  const handlePatientFilter = (patientId: number | null) => {
    setSelectedPatientId(patientId);
  };

  const clearFilters = () => {
    setSearchText('');
    setDateFilter([]);
    setSelectedPatientId(null);
  };

  const handleEdit = (appointment: Appointment) => {
    // Aquí podrías abrir un modal de edición o navegar a otra página
    navigator(`/appointmentEdit/${appointment.id}`);
  };

  const handleDelete = async (appointmentId: number) => {
    try {
      const response = await AppointmentService.deleteAppointment(appointmentId);
      
      if (response.success) {
        message.success('Cita eliminada correctamente');
        loadAppointments(); // Recargar la lista
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error('Error al eliminar la cita');
    }
  };

  const showAppointmentDetail = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailModalVisible(true);
  };

  const formatDateTime = (date: string, time: string) => {
    const formattedDate = new Date(date).toLocaleDateString('es-ES');
    const formattedTime = time ? time.substring(0, 5) : '';
    return { formattedDate, formattedTime };
  };

  const columns = [
    {
      title: 'Paciente',
      key: 'patient',
      width: 200,
      render: (_: any, record: Appointment) => (
        <Space>
          <Avatar 
            style={{ backgroundColor: '#1890ff' }}
            icon={<UserOutlined />}
          />
          <div>
            <div style={{ fontWeight: 'bold' }}>
              {record.patient?.last_name}, {record.patient?.first_name}
            </div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              CI: {record.patient?.document_id}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Fecha y Hora',
      key: 'datetime',
      width: 120,
      render: (_: any, record: Appointment) => {
        const { formattedDate, formattedTime } = formatDateTime(
          record.appointment_date, 
          record.appointment_time
        );
        return (
          <Space direction="vertical" size="small">
            <Text>
              <CalendarOutlined /> {formattedDate}
            </Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {formattedTime}
            </Text>
          </Space>
        );
      },
    },
    {
      title: 'Diagnóstico',
      key: 'diagnostico',
      width: 250,
      render: (_: any, record: Appointment) => (
        <Space direction="vertical" size="small">
          {record.diagnosis_code && (
            <Tag color="blue">{record.diagnosis_code}</Tag>
          )}
          <Text style={{ fontSize: '12px' }}>
            {record.diagnosis_description || 'Sin diagnóstico'}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Signos Vitales',
      key: 'vitales',
      width: 150,
      render: (_: any, record: Appointment) => (
        <Space direction="vertical" size="small">
          {record.temperature && (
            <Text style={{ fontSize: '11px' }}>
              T: {record.temperature}°C
            </Text>
          )}
          {record.blood_pressure && (
            <Text style={{ fontSize: '11px' }}>
              TA: {record.blood_pressure}
            </Text>
          )}
          {record.heart_rate && (
            <Text style={{ fontSize: '11px' }}>
              FC: {record.heart_rate} lpm
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: Appointment) => (
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
            onConfirm={() => record.id && handleDelete(record.id)}
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
                    type="default"
                    size="large"
                    icon={<ReloadOutlined />}
                    onClick={loadAppointments}
                    loading={loading}
                  >
                    Actualizar
                  </Button>
                  <Button
                    type="primary"
                    size="large"
                    icon={<PlusOutlined />}
                    onClick={() => goToCreateAppointment()}
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
              <Col xs={24} sm={12} lg={6}>
                <Input
                  placeholder="Buscar por paciente, cédula, diagnóstico..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => handleSearch(e.target.value)}
                  size="large"
                  allowClear
                />
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Select
                  placeholder="Filtrar por paciente"
                  value={selectedPatientId}
                  onChange={handlePatientFilter}
                  size="large"
                  style={{ width: '100%' }}
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)
                      ?.toLowerCase()
                      ?.indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {patients.map(patient => (
                    <Option key={patient.id} value={patient.id}>
                      {patient.last_name}, {patient.first_name} - {patient.document_id}
                    </Option>
                  ))}
                </Select>
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
              <Col xs={24} sm={12} lg={6}>
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
            <Spin spinning={loading}>
              {appointments.length === 0 && !loading ? (
                <Alert
                  message="No hay citas registradas"
                  description="Comience agregando una nueva cita médica."
                  type="info"
                  showIcon
                  style={{ margin: '40px 0' }}
                />
              ) : (
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
              )}
            </Spin>
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
                  selectedAppointment && handleEdit(selectedAppointment);
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
                          {selectedAppointment.patient?.first_name} {selectedAppointment.patient?.last_name}
                        </Descriptions.Item>
                        <Descriptions.Item label="Cédula">
                          {selectedAppointment.patient?.document_id}
                        </Descriptions.Item>
                        <Descriptions.Item label="Fecha y Hora">
                          {(() => {
                            const { formattedDate, formattedTime } = formatDateTime(
                              selectedAppointment.appointment_date,
                              selectedAppointment.appointment_time
                            );
                            return `${formattedDate} - ${formattedTime}`;
                          })()}
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>

                  {/* Historia Clínica (del paciente) */}
                  {selectedAppointment.patient?.medical_history && (
                    <Col xs={24}>
                      <Card size="small" title={<><FileTextOutlined /> Historia Médica del Paciente</>}>
                        <Text>{selectedAppointment.patient.medical_history}</Text>
                      </Card>
                    </Col>
                  )}

                  {/* Enfermedad Actual */}
                  {selectedAppointment.current_illness && (
                    <Col xs={24}>
                      <Card size="small" title="Enfermedad Actual">
                        <Text>{selectedAppointment.current_illness}</Text>
                      </Card>
                    </Col>
                  )}

                  {/* Examen Físico y Diagnóstico */}
                  <Col xs={24} md={12}>
                    <Card size="small" title={<><MedicineBoxOutlined /> Examen Físico</>}>
                      <Text>{selectedAppointment.physical_examination || 'No registrado'}</Text>
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card size="small" title="Diagnóstico (CIE-10)">
                      <Space direction="vertical">
                        {selectedAppointment.diagnosis_code && (
                          <Tag color="blue" style={{ fontSize: '14px', padding: '4px 8px' }}>
                            {selectedAppointment.diagnosis_code}
                          </Tag>
                        )}
                        <Text>{selectedAppointment.diagnosis_description || 'Sin diagnóstico'}</Text>
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
                          <Text>{selectedAppointment.temperature ? `${selectedAppointment.temperature}°C` : 'No registrado'}</Text>
                        </Col>
                        <Col xs={12} sm={8} md={4}>
                          <Text strong>Presión Arterial:</Text>
                          <br />
                          <Text>{selectedAppointment.blood_pressure ? `${selectedAppointment.blood_pressure} mmHg` : 'No registrado'}</Text>
                        </Col>
                        <Col xs={12} sm={8} md={4}>
                          <Text strong>Frecuencia Cardíaca:</Text>
                          <br />
                          <Text>{selectedAppointment.heart_rate ? `${selectedAppointment.heart_rate} lpm` : 'No registrado'}</Text>
                        </Col>
                        <Col xs={12} sm={8} md={4}>
                          <Text strong>SpO2:</Text>
                          <br />
                          <Text>{selectedAppointment.oxygen_saturation ? `${selectedAppointment.oxygen_saturation}%` : 'No registrado'}</Text>
                        </Col>
                        <Col xs={12} sm={8} md={4}>
                          <Text strong>Peso:</Text>
                          <br />
                          <Text>{selectedAppointment.weight ? `${selectedAppointment.weight} kg` : 'No registrado'}</Text>
                        </Col>
                        <Col xs={12} sm={8} md={4}>
                          <Text strong>Talla:</Text>
                          <br />
                          <Text>{selectedAppointment.height ? `${selectedAppointment.height} m` : 'No registrado'}</Text>
                        </Col>
                      </Row>
                    </Card>
                  </Col>

                  {/* Observaciones y Exámenes */}
                  <Col xs={24} md={12}>
                    <Card size="small" title="Observaciones">
                      <Text>{selectedAppointment.observations || 'Sin observaciones'}</Text>
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card size="small" title={<><ExperimentOutlined /> Exámenes de Laboratorio</>}>
                      <Text>{selectedAppointment.laboratory_tests || 'No se solicitaron exámenes'}</Text>
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