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
  CalendarOutlined,
  ClearOutlined,
  FilterOutlined,
  MedicineBoxOutlined,
  LoginOutlined,
  FilePdfOutlined
} from '@ant-design/icons';

import { useNavigate } from "react-router-dom";
import AppointmentService from '../../services/AppointmentService';
import type { Appointment, UserAppointmentParams } from '../../services/AppointmentService';
import dayjs from 'dayjs';
import AppointmentPdf from './AppointmentPdf';
import { pdf } from '@react-pdf/renderer';
import RecipePdf from './RecipePDF';

const { Title, Text } = Typography;
const { Content } = Layout;
const { RangePicker } = DatePicker;

interface UserData {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role?: string;
}


export default function MyAppointmentsList() {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
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
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    initializeUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadMyAppointments();
    }
  }, [currentUser]);

  const initializeUser = () => {
    try {
      const userData = localStorage.getItem('authUser');
      if (!userData) {
        message.error('No se encontró información del usuario. Por favor, inicie sesión.');
        navigate('/login');
        return;
      }

      const user: UserData = JSON.parse(userData);
      if (!user.id) {
        message.error('Datos de usuario inválidos. Por favor, inicie sesión nuevamente.');
        navigate('/login');
        return;
      }

      setCurrentUser(user);
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
      message.error('Error al cargar datos del usuario. Por favor, inicie sesión nuevamente.');
      navigate('/login');
    }
  };

  const loadMyAppointments = async () => {
    if (!currentUser) return;

    setTableLoading(true);
    try {
      const response = await AppointmentService.getAppointmentsByUser(currentUser.id, { 
        limit: 1000,
        include_patient: true,
        include_recipes: true,
        include_diagnoses: true
      });

      if (response.success) {
        setAppointments(response.data);
        setDisplayedAppointments(response.data);
        message.success(`${response.data.length} citas cargadas`);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error('Error al cargar mis citas');
      console.error('Error:', error);
    } finally {
      setTableLoading(false);
    }
  };

  const handleExportAppointmentPDF = async (appointment: Appointment) => {
    setPdfLoading(true);
    try {
      message.loading({ content: 'Generando PDF...', key: 'pdf-generation' });
      
      const pdfDoc = (
        <AppointmentPdf
          patient={appointment.patient || {}}
          doctor={appointment.user || null}
          recipes={appointment.recipes || []}
          diagnoses={appointment.diagnoses || []}
          general={appointment}
          appointmentDate={appointment.appointment_date}
          appointmentId={appointment.id?.toString() || 'N/A'}
        />
      );

      const blob = await pdf(pdfDoc).toBlob();
      const url = URL.createObjectURL(blob);
      
      window.open(url, '_blank');
      
      message.success({ content: 'PDF generado exitosamente', key: 'pdf-generation', duration: 2 });
    } catch (error) {
      console.error('Error al generar PDF:', error);
      message.error({ content: 'Error al generar el PDF', key: 'pdf-generation', duration: 2 });
    } finally {
      setPdfLoading(false);
    }
  };


   const handleRecipePDF = async (appointment: Appointment) => {
    setPdfLoading(true);
    try {
      message.loading({ content: 'Generando PDF...', key: 'pdf-generation' });
      
      const pdfDoc = (
        <RecipePdf
          patient={appointment.patient || {}}
          doctor={appointment.user || null}
          recipes={appointment.recipes || []}
          appointmentDate={appointment.appointment_date}
          appointmentId={appointment.id?.toString() || 'N/A'}
        />
      );

      const blob = await pdf(pdfDoc).toBlob();
      const url = URL.createObjectURL(blob);
      
      window.open(url, '_blank');
      
      message.success({ content: 'PDF generado exitosamente', key: 'pdf-generation', duration: 2 });
    } catch (error) {
      console.error('Error al generar PDF:', error);
      message.error({ content: 'Error al generar el PDF', key: 'pdf-generation', duration: 2 });
    } finally {
      setPdfLoading(false);
    }
  };

  const handleAdvancedSearch = async () => {
    if (!currentUser) return;

    const trimmedSearch = searchText.trim();
    const hasDateFilter = dateRange && dateRange[0] && dateRange[1];
    
    if (!trimmedSearch && !hasDateFilter) {
      setDisplayedAppointments(appointments);
      setHasActiveFilters(false);
      return;
    }

    setSearchLoading(true);
    setTableLoading(true);
    setHasActiveFilters(true);

    try {
      const searchParams: UserAppointmentParams = {
        limit: 1000,
        include_patient: true,
        include_recipes: true,
        include_diagnoses: true
      };

      if (trimmedSearch) {
        searchParams.query = trimmedSearch;
      }

      if (hasDateFilter) {
        searchParams.start_date = dateRange![0].format('YYYY-MM-DD');
        searchParams.end_date = dateRange![1].format('YYYY-MM-DD');
      }

      const response = await AppointmentService.getAppointmentsByUser(currentUser.id, searchParams);

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

  const handleTextSearch = async (value: string) => {
    if (!currentUser) return;

    setSearchText(value);
    const trimmedValue = value.trim();

    if (dateRange && dateRange[0] && dateRange[1]) {
      return;
    }

    if (trimmedValue.length >= 3) {
      setSearchLoading(true);
      setTableLoading(true);
      setHasActiveFilters(true);

      try {
        const response = await AppointmentService.getAppointmentsByUser(currentUser.id, {
          query: trimmedValue,
          limit: 1000,
          include_patient: true,
          include_recipes: true,
          include_diagnoses: true
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
      setDisplayedAppointments(appointments);
      setHasActiveFilters(false);
    } else {
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

  const clearAllFilters = () => {
    setSearchText('');
    setDateRange(null);
    setDisplayedAppointments(appointments);
    setHasActiveFilters(false);
    form.resetFields();
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
        await loadMyAppointments();
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

  const formatDateTime = (date: string, time: string) => {
    try {
      const datetime = dayjs(`${date} ${time}`);
      return datetime.format('DD/MM/YYYY HH:mm');
    } catch {
      return `${date} ${time}`;
    }
  };

  const formatWeight = (weight?: number, unit?: string) => {
    if (!weight) return 'N/A';
    const unitDisplay = unit || 'kg';
    return `${weight} ${unitDisplay}`;
  };

  if (!currentUser) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
        <Content style={{ padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Card style={{ textAlign: 'center', padding: '48px' }}>
            <LoginOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
            <Title level={3}>Sesión Requerida</Title>
            <Text>Por favor, inicie sesión para ver sus citas médicas.</Text>
            <br />
            <Button 
              type="primary" 
              size="large" 
              style={{ marginTop: '16px' }}
              onClick={() => navigate('/login')}
            >
              Iniciar Sesión
            </Button>
          </Card>
        </Content>
      </Layout>
    );
  }

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
          {record.weight && <Text style={{ fontSize: '11px' }}>Peso: {formatWeight(record.weight, record.weight_unit)}</Text>}
        </Space>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 180,
      fixed: 'right' as const,
      render: (_: unknown, record: Appointment) => (
        <Space size="small">
         <Tooltip title="Exportar PDF CITA">
  <Button
    type="link"
    icon={<FilePdfOutlined />}
    onClick={() => handleExportAppointmentPDF(record)}
    loading={pdfLoading}
    size="small"
    style={{ color: '#ff4d4f' }}
  />
</Tooltip>

<Tooltip title="Exportar PDF Receta">
  <Button
    type="link"
    icon={<MedicineBoxOutlined />} 
    onClick={() => handleRecipePDF(record)}
    loading={pdfLoading}
    size="small"
    style={{ color: '#1890ff' }} 
  />
</Tooltip>
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
          <Card style={{ marginBottom: '24px' }}>
            <Row justify="space-between" align="middle">
              <Col>
                <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                  FENIX
                </Title>
                <Text style={{ color: '#722ed1', fontSize: '18px', fontWeight: 500 }}>
                  Mis Citas Médicas
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: '14px' }}>
                  Dr. {currentUser.first_name} {currentUser.last_name}
                </Text>
              </Col>
              <Col>
                <Space>
                  <div style={{ textAlign: 'center' }}>
                    <Avatar
                      size={64}
                      style={{ backgroundColor: '#722ed1' }}
                      icon={<MedicineBoxOutlined />}
                    />
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                      {displayedAppointments.length} citas
                    </div>
                  </div>
                </Space>
              </Col>
            </Row>
          </Card>

          <Card style={{ marginBottom: '24px' }}>
            <Form form={form} layout="vertical">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12} lg={10}>
                  <Form.Item label="Buscar en mis Pacientes" style={{ margin: 0 }}>
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

            <div style={{ marginTop: '8px' }}>
              {searchText && searchText.length > 0 && searchText.length < 3 && (
                <Text type="warning" style={{ fontSize: '12px' }}>
                  ⚠ Búsqueda local activa (escriba 3+ caracteres para búsqueda completa en servidor)
                </Text>
              )}
              {!hasActiveFilters && (
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  💡 Tip: Use los filtros para encontrar sus citas específicas. La búsqueda de texto funciona desde 3 caracteres.
                </Text>
              )}
            </div>
          </Card>

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
                showTotal: (total, range) =>` 
                  ${range[0]}-${range[1]} de ${total} mis citas`,
              }}
              size="middle"
            />
          </Card>

          <Modal
            title={
              <Space>
                <MedicineBoxOutlined style={{ color: '#1890ff' }} />
                Detalles de mi Cita Médica
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
                        <Text><strong>Doctor:</strong> {selectedAppointment.user?.last_name + " " + selectedAppointment.user?.first_name}</Text>
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
                          <Text><strong>Peso:</strong> {formatWeight(selectedAppointment.weight, selectedAppointment.weight_unit)}</Text>
                        </Col>
                        <Col xs={12} sm={6}>
                          <Text><strong>Altura:</strong> {selectedAppointment.height ? `${(parseFloat(selectedAppointment.height) * 100).toFixed(0)} cm` : 'N/A'}</Text>
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
