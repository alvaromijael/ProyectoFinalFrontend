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
  Form,
  Divider,
  Alert
} from 'antd';
import {
  UserOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  CalendarOutlined,
  ClearOutlined,
  FilterOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons';

import { useNavigate } from "react-router-dom";
import AppointmentService from '../../services/AppointmentService';
import type { Appointment } from '../../services/AppointmentService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Content } = Layout;
const { RangePicker } = DatePicker;

export default function AppointmentManageList() {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // Estados
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [displayedAppointments, setDisplayedAppointments] = useState<Appointment[]>([]);
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, []);

  // Cargar todas las citas inicialmente
  const loadAppointments = async () => {
    setTableLoading(true);
    try {
      const response = await AppointmentService.getAppointments({ limit: 1000 });
      if (response.success) {
        setAppointments(response.data);
        setDisplayedAppointments(response.data);
        message.success(response.message);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error('Error al cargar las citas');
      console.error('Error:', error);
    } finally {
      setTableLoading(false);
    }
  };

  // Función de búsqueda avanzada que llama al API
  const handleAdvancedSearch = async () => {
    const trimmedSearch = searchText.trim();
    const hasDateFilter = dateRange && dateRange[0] && dateRange[1];
    
    // Si no hay filtros, mostrar todas las citas
    if (!trimmedSearch && !hasDateFilter) {
      setDisplayedAppointments(appointments);
      setHasActiveFilters(false);
      return;
    }

    setSearchLoading(true);
    setTableLoading(true);
    setHasActiveFilters(true);

    try {
      console.log('Búsqueda avanzada:', {
        query: trimmedSearch,
        start_date: hasDateFilter ? dateRange![0].format('YYYY-MM-DD') : undefined,
        end_date: hasDateFilter ? dateRange![1].format('YYYY-MM-DD') : undefined
      });

      // Preparar parámetros para el API
      const searchParams: any = {
        limit: 1000
      };

      if (trimmedSearch) {
        searchParams.query = trimmedSearch;
      }

      if (hasDateFilter) {
        searchParams.start_date = dateRange![0].format('YYYY-MM-DD');
        searchParams.end_date = dateRange![1].format('YYYY-MM-DD');
      }

      // Llamar al endpoint de búsqueda avanzada
      const response = await AppointmentService.searchAppointmentsAdvanced(searchParams);

      if (response.success) {
        setDisplayedAppointments(response.data);
        
        if (response.data.length === 0) {
          message.info('No se encontraron citas que coincidan con los criterios de búsqueda');
        } else {
          message.success(`${response.data.length} citas encontradas`);
        }
      } else {
        message.error(response.message);
        setDisplayedAppointments(appointments);
        setHasActiveFilters(false);
      }
    } catch (error) {
      console.error('Error en búsqueda avanzada:', error);
      message.error('Error al realizar la búsqueda');
      setDisplayedAppointments(appointments);
      setHasActiveFilters(false);
    } finally {
      setSearchLoading(false);
      setTableLoading(false);
    }
  };

  // Búsqueda en tiempo real solo por texto (local para menos de 3 caracteres, API para 3+)
  const handleTextSearch = async (value: string) => {
    setSearchText(value);
    const trimmedValue = value.trim();

    // Si hay rango de fechas activo, siempre usar búsqueda avanzada
    if (dateRange && dateRange[0] && dateRange[1]) {
      return; // No hacer búsqueda automática, esperar a que presione buscar
    }

    if (trimmedValue.length >= 3) {
      // Búsqueda en servidor para 3+ caracteres
      setSearchLoading(true);
      setTableLoading(true);
      setHasActiveFilters(true);

      try {
        const response = await AppointmentService.searchAppointmentsAdvanced({
          query: trimmedValue,
          limit: 1000
        });

        if (response.success) {
          setDisplayedAppointments(response.data);
        } else {
          message.error(response.message);
          setDisplayedAppointments(appointments);
          setHasActiveFilters(false);
        }
      } catch (error) {
        console.error('Error:', error);
        setDisplayedAppointments(appointments);
        setHasActiveFilters(false);
      } finally {
        setSearchLoading(false);
        setTableLoading(false);
      }
    } else if (trimmedValue.length === 0) {
      // Sin filtros, mostrar todas las citas
      setDisplayedAppointments(appointments);
      setHasActiveFilters(false);
    } else {
      // Filtro local para menos de 3 caracteres
      const localFiltered = appointments.filter(appointment => {
        const patient = appointment.patient;
        if (!patient) return false;

        const searchTerm = trimmedValue.toLowerCase();
        const firstName = (patient.first_name || '').toLowerCase();
        const lastName = (patient.last_name || '').toLowerCase();
        const documentId = (patient.document_id || '').toLowerCase();

        return firstName.includes(searchTerm) || 
               lastName.includes(searchTerm) || 
               documentId.includes(searchTerm);
      });

      setDisplayedAppointments(localFiltered);
      setHasActiveFilters(trimmedValue.length > 0);
    }
  };

  // Limpiar todos los filtros
  const clearAllFilters = () => {
    setSearchText('');
    setDateRange(null);
    setDisplayedAppointments(appointments);
    setHasActiveFilters(false);
    form.resetFields();
  };

  const goToCreateAppointment = () => {
    navigate("/manageAppointmentCreate");
  };

  const handleEdit = (appointment: Appointment) => {
    navigate(`/manageAppointmentEdit/${appointment.id}`);
  };

  const handleDelete = async (appointmentId: number) => {
    setLoading(true);
    try {
      const response = await AppointmentService.deleteAppointment(appointmentId);
      if (response.success) {
        message.success(response.message);
        await loadAppointments();
        // Reaplica filtros si están activos
        if (hasActiveFilters) {
          handleAdvancedSearch();
        }
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error('Error al eliminar la cita');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const showAppointmentDetail = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailModalVisible(true);
  };

  // Formatear fecha y hora
  const formatDateTime = (date: string, time: string) => {
    try {
      const datetime = dayjs(`${date} ${time}`);
      return datetime.format('DD/MM/YYYY HH:mm');
    } catch {
      return `${date} ${time}`;
    }
  };

  const columns = [
    {
      title: 'Paciente',
      key: 'patient',
      width: 200,
      render: (_: unknown, record: Appointment) => (
        <Space>
          <Avatar 
            style={{ backgroundColor: record.patient?.gender === 'F' ? '#f56a00' : '#1890ff' }}
            icon={<UserOutlined />}
          />
          <div>
            <div style={{ fontWeight: 'bold' }}>
              {record.patient ? `${record.patient.last_name}, ${record.patient.first_name}` : 'Sin paciente'}
            </div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              CI: {record.patient?.document_id || 'N/A'}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Fecha y Hora',
      key: 'datetime',
      width: 150,
      render: (_: unknown, record: Appointment) => (
        <Space direction="vertical" size="small">
          <Text>
            <CalendarOutlined /> {formatDateTime(record.appointment_date, record.appointment_time)}
          </Text>
          <Tag color={dayjs(record.appointment_date).isAfter(dayjs(), 'day') ? 'green' : 'orange'}>
            {dayjs(record.appointment_date).isAfter(dayjs(), 'day') ? 'Próxima' : 'Pasada'}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Diagnóstico',
      key: 'diagnosis',
      width: 250,
      render: (_: unknown, record: Appointment) => (
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
      title: 'Enfermedad Actual',
      key: 'illness',
      width: 200,
      render: (_: unknown, record: Appointment) => (
        <Text style={{ fontSize: '12px' }}>
          {record.current_illness || 'No especificada'}
        </Text>
      ),
    },
    {
      title: 'Signos Vitales',
      key: 'vitals',
      width: 150,
      render: (_: unknown, record: Appointment) => (
        <Space direction="vertical" size="small">
          {record.temperature && <Text style={{ fontSize: '11px' }}>Temp: {record.temperature}°C</Text>}
          {record.blood_pressure && <Text style={{ fontSize: '11px' }}>PA: {record.blood_pressure}</Text>}
          {record.heart_rate && <Text style={{ fontSize: '11px' }}>FC: {record.heart_rate} bpm</Text>}
        </Space>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 150,
      fixed: 'right' as const,
      render: (_: unknown, record: Appointment) => (
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
                loading={loading}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5', maxWidth: '87%' }}>
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
                  Lista de Citas Médicas
                </Text>
              </Col>
              <Col>
                <Space>
                  <Avatar
                    size={64}
                    style={{ backgroundColor: '#722ed1' }}
                    icon={<MedicineBoxOutlined />}
                  />
                  <Button
                    type="primary"
                    size="large"
                    icon={<PlusOutlined />}
                    onClick={goToCreateAppointment}
                  >
                    Nueva Cita
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Panel de Filtros Avanzados */}
          <Card style={{ marginBottom: '24px' }}>
            <Form form={form} layout="vertical">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12} lg={10}>
                  <Form.Item label="Buscar Paciente" style={{ margin: 0 }}>
                    <Tooltip title="Busca por nombres, apellidos o cédula del paciente">
                      <Input
                        placeholder="Nombre, apellido o cédula del paciente..."
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={(e) => handleTextSearch(e.target.value)}
                        size="large"
                        allowClear
                      />
                    </Tooltip>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12} lg={8}>
                  <Form.Item label="Rango de Fechas" style={{ margin: 0 }}>
                    <RangePicker
                      style={{ width: '100%' }}
                      size="large"
                      format="DD/MM/YYYY"
                      placeholder={['Fecha inicio', 'Fecha fin']}
                      value={dateRange}
                      onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={6}>
                  <Form.Item label=" " style={{ margin: 0 }}>
                    <Space>
                      <Button
                        type="primary"
                        icon={<FilterOutlined />}
                        onClick={handleAdvancedSearch}
                        loading={searchLoading}
                        size="large"
                      >
                        Buscar
                      </Button>
                      {hasActiveFilters && (
                        <Button
                          icon={<ClearOutlined />}
                          onClick={clearAllFilters}
                          size="large"
                        >
                          Limpiar
                        </Button>
                      )}
                    </Space>
                  </Form.Item>
                </Col>
              </Row>
            </Form>

            {/* Indicadores de filtros activos */}
            {hasActiveFilters && (
              <>
                <Divider style={{ margin: '16px 0 8px' }} />
                <Alert
                  type="info"
                  showIcon
                  message={
                    <Space wrap>
                      <Text>Filtros activos:</Text>
                      {searchText && <Tag color="blue">Paciente: "{searchText}"</Tag>}
                      {dateRange && (
                        <Tag color="green">
                          Fechas: {dateRange[0].format('DD/MM/YYYY')} - {dateRange[1].format('DD/MM/YYYY')}
                        </Tag>
                      )}
                      <Text type="secondary">
                        {displayedAppointments.length} de {appointments.length} citas
                      </Text>
                    </Space>
                  }
                  style={{ marginTop: '8px' }}
                />
              </>
            )}

            {/* Ayuda contextual */}
            <div style={{ marginTop: '8px' }}>
              {searchText && searchText.length > 0 && searchText.length < 3 && (
                <Text type="warning" style={{ fontSize: '12px' }}>
                  ⚠️ Búsqueda local activa (escriba 3+ caracteres para búsqueda completa en servidor)
                </Text>
              )}
              {!hasActiveFilters && (
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  💡 Tip: Use los filtros para encontrar citas específicas. La búsqueda de texto funciona desde 3 caracteres.
                </Text>
              )}
            </div>
          </Card>

          {/* Tabla de Citas */}
          <Card>
            <Table
              columns={columns}
              dataSource={displayedAppointments}
              rowKey="id"
              loading={tableLoading}
              scroll={{ x: 1200 }}
              pagination={{
                total: displayedAppointments.length,
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
                <MedicineBoxOutlined style={{ color: '#1890ff' }} />
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
                  if (selectedAppointment) {
                    handleEdit(selectedAppointment);
                    setIsDetailModalVisible(false);
                  }
                }}
              >
                Editar Cita
              </Button>,
            ]}
          >
            {selectedAppointment && (
              <div>
                <Row gutter={[24, 16]}>
                  <Col xs={24} sm={12}>
                    <Card size="small" title="Información del Paciente">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text><strong>Nombre:</strong> {selectedAppointment.patient ? `${selectedAppointment.patient.first_name} ${selectedAppointment.patient.last_name}` : 'N/A'}</Text>
                        <Text><strong>Cédula:</strong> {selectedAppointment.patient?.document_id || 'N/A'}</Text>
                        <Text><strong>Fecha y Hora:</strong> {formatDateTime(selectedAppointment.appointment_date, selectedAppointment.appointment_time)}</Text>
                      </Space>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Card size="small" title="Diagnóstico">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text><strong>Código:</strong> {selectedAppointment.diagnosis_code || 'N/A'}</Text>
                        <Text><strong>Descripción:</strong> {selectedAppointment.diagnosis_description || 'N/A'}</Text>
                        <Text><strong>Enfermedad Actual:</strong> {selectedAppointment.current_illness || 'N/A'}</Text>
                      </Space>
                    </Card>
                  </Col>
                  <Col xs={24}>
                    <Card size="small" title="Examen Físico y Observaciones">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text><strong>Examen Físico:</strong> {selectedAppointment.physical_examination || 'No realizado'}</Text>
                        <Text><strong>Observaciones:</strong> {selectedAppointment.observations || 'Sin observaciones'}</Text>
                        <Text><strong>Exámenes de Laboratorio:</strong> {selectedAppointment.laboratory_tests || 'No solicitados'}</Text>
                      </Space>
                    </Card>
                  </Col>
                  <Col xs={24}>
                    <Card size="small" title="Signos Vitales">
                      <Row gutter={[16, 8]}>
                        <Col xs={12} sm={6}>
                          <Text><strong>Temperatura:</strong> {selectedAppointment.temperature || 'N/A'}°C</Text>
                        </Col>
                        <Col xs={12} sm={6}>
                          <Text><strong>Presión Arterial:</strong> {selectedAppointment.blood_pressure || 'N/A'}</Text>
                        </Col>
                        <Col xs={12} sm={6}>
                          <Text><strong>Frecuencia Cardíaca:</strong> {selectedAppointment.heart_rate || 'N/A'} bpm</Text>
                        </Col>
                        <Col xs={12} sm={6}>
                          <Text><strong>Saturación O2:</strong> {selectedAppointment.oxygen_saturation || 'N/A'}%</Text>
                        </Col>
                        <Col xs={12} sm={6}>
                          <Text><strong>Peso:</strong> {selectedAppointment.weight || 'N/A'} kg</Text>
                        </Col>
                        <Col xs={12} sm={6}>
                          <Text><strong>Altura:</strong> {selectedAppointment.height || 'N/A'} cm</Text>
                        </Col>
                      </Row>
                    </Card>
                    <Card size="small" title="Recetas Médicas" style={{ marginTop: 16 }}>
  {selectedAppointment.recipes && selectedAppointment.recipes.length > 0 ? (
    <Table 
      dataSource={selectedAppointment.recipes} 
      pagination={false}
      size="small"
      rowKey={(_, index) => index!} 
      columns={[
        {
          title: 'Medicamento',
          dataIndex: 'medicine',
          key: 'medicine',
          width: '25%',
        },
        {
          title: 'Cantidad',
          dataIndex: 'amount',
          key: 'amount',
          width: '15%',
        },
        {
          title: 'Instrucciones',
          dataIndex: 'instructions',
          key: 'instructions',
          width: '25%',
        },
        {
          title: 'Observaciones',
          dataIndex: 'observations',
          key: 'observations',
          width: '35%',
        },
      ]}
    />
  ) : (
    <Text type="secondary">No hay recetas médicas registradas</Text>
  )}
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