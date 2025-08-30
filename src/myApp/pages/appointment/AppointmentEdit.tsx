import { useState, useEffect, type JSX } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Space,
  Typography,
  Row,
  Col,
  Avatar,
  Layout,
  DatePicker,
  TimePicker,
  message,
  Divider,
  AutoComplete,
  Spin
} from 'antd';
import {
  UserOutlined,  
  SaveOutlined,
  ArrowLeftOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  ExperimentOutlined,
  EditOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

import PatientService from '../../services/PatientService';
import AppointmentService from '../../services/AppointmentService';
import type { DefaultOptionType } from 'antd/es/select';
import dataCIE10 from '../../../assets/dataCIE10.json';


const { Title, Text } = Typography;
const { Content } = Layout;
const { TextArea } = Input;

// Interfaces para el tipado
interface Patient {
  id?: number;
  first_name?: string;
  last_name?: string;
  birth_date?: string; 
  age?: string;
  gender?: string;
  document_id?: string;
  marital_status?: string;
  occupation?: string;
  education?: string;
  origin?: string;
  province?: string;
  city?: string;
  neighborhood?: string;
  street?: string;
  house_number?: string;
  medical_history?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

interface Appointment {
  id?: number;
  patient_id: number;
  patient?: Patient;
  appointment_date: string;
  appointment_time: string;
  diagnosis_code?: string;
  diagnosis_description?: string;
  current_illness?: string;
  physical_examination?: string;
  temperature?: string;
  blood_pressure?: string;
  heart_rate?: string;
  oxygen_saturation?: string;
  weight?: string;
  height?: string;
  observations?: string;
  laboratory_tests?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface GetPatientsParams {
  limit: number;
  skip?: number;
}

interface AppointmentUpdateData {
  patient_id: number;
  appointment_date: string;
  appointment_time: string;
  current_illness?: string;
  physical_examination?: string;
  diagnosis_code?: string;
  diagnosis_description?: string;
  diagnosis_observations?: string;
  observations?: string;
  laboratory_tests?: string;
  temperature?: string;
  blood_pressure?: string;
  heart_rate?: string;
  oxygen_saturation?: string;
  weight?: string;
  height?: string;
}

interface FormValues {
  searchPatient: string;
  nombres: string;
  apellidos: string;
  cedula: string;
  fecha: Dayjs;
  hora: Dayjs;
  antecedentes: string;
  enfermedadActual: string;
  temperatura: string;
  presionArterial: string;
  frecuenciaCardiaca: string;
  saturacionO2: string;
  peso: string;
  talla: string;
  examenFisico: string;
  diagnostico: string;
  observacionesDiagnostico: string;
  observaciones: string;
  examenes: string;
}

interface PatientOption {
  value: string;
  label: string;
  patient: Patient;
}

interface CIE10Option {
  value: string;
  label: string;
}

export default function AppointmentEdit(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm<FormValues>();
  
  // Estados con tipado
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointment, setAppointment] = useState<Appointment | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, [id]);

  const loadInitialData = async (): Promise<void> => {
    setLoadingData(true);
    try {
      // Cargar pacientes y cita en paralelo
      const [patientsResponse, appointmentResponse] = await Promise.all([
        PatientService.getPatients({ limit: 1000 } as GetPatientsParams),
        AppointmentService.getAppointmentById(id!)
      ]);

      if (patientsResponse.success) {
        setPatients(patientsResponse.data);
      } else {
        message.error('Error al cargar los pacientes');
      }

      if (appointmentResponse.success) {
        const appointmentData: Appointment = appointmentResponse.data;
        setAppointment(appointmentData);
        
        // Buscar el paciente asociado
        const patient = patientsResponse.data?.find((p: Patient) => p.id === appointmentData.patient_id);
        if (patient) {
          setSelectedPatient(patient);
        }

        // Llenar el formulario con los datos de la cita
        form.setFieldsValue({
          searchPatient: patient ? `${patient.last_name}, ${patient.first_name} - CI: ${patient.document_id}` : '',
          nombres: patient?.first_name || '',
          apellidos: patient?.last_name || '',
          cedula: patient?.document_id || '',
          fecha: appointmentData.appointment_date ? dayjs(appointmentData.appointment_date) : undefined,
          hora: appointmentData.appointment_time ? dayjs(appointmentData.appointment_time, 'HH:mm:ss') : undefined,
          antecedentes: patient?.medical_history || 'Sin antecedentes médicos registrados',
          enfermedadActual: appointmentData.current_illness || '',
          temperatura: appointmentData.temperature || '',
          presionArterial: appointmentData.blood_pressure || '',
          frecuenciaCardiaca: appointmentData.heart_rate || '',
          saturacionO2: appointmentData.oxygen_saturation || '',
          peso: appointmentData.weight || '',
          talla: appointmentData.height ? Math.round(parseFloat(appointmentData.height) * 100).toString() : '',
          examenFisico: appointmentData.physical_examination || '',
          diagnostico: appointmentData.diagnosis_code || '',
          observacionesDiagnostico: appointmentData.diagnosis_description || '',
          observaciones: appointmentData.observations || '',
          examenes: appointmentData.laboratory_tests || ''
        });
      } else {
        message.error('Error al cargar la cita médica');
        navigate('/appointments');
      }
    } catch (error) {
      message.error('Error inesperado al cargar los datos');
      console.error('Error loading initial data:', error);
      navigate('/appointments');
    } finally {
      setLoadingData(false);
    }
  };

  const onPatientSelect = (value: string): void => {
    const patient = patients.find(p => 
      `${p.last_name}, ${p.first_name} - CI: ${p.document_id}` === value
    );
    
    if (patient) {
      setSelectedPatient(patient);
      form.setFieldsValue({
        nombres: patient.first_name,
        apellidos: patient.last_name,
        cedula: patient.document_id,
        antecedentes: patient.medical_history || 'Sin antecedentes médicos registrados'
      });
      
      message.success('Paciente cambiado. Antecedentes actualizados.');
    }
  };

  const onFinish = async (values: FormValues): Promise<void> => {
    if (!selectedPatient) {
      message.error('Debe seleccionar un paciente');
      return;
    }

    setLoading(true);
    try {
      // Preparar datos para actualizar la cita
      const appointmentData: AppointmentUpdateData = {
        patient_id: selectedPatient.id!,
        appointment_date: values.fecha.format('YYYY-MM-DD'),
        appointment_time: values.hora.format('HH:mm:ss'),
        current_illness: values.enfermedadActual,
        physical_examination: values.examenFisico,
        diagnosis_code: values.diagnostico,
        diagnosis_description: dataCIE10.find(item => item.code === values.diagnostico)?.description || '',
        diagnosis_observations: values.observacionesDiagnostico,
        observations: values.observaciones,
        laboratory_tests: values.examenes || '',
        temperature: values.temperatura,
        blood_pressure: values.presionArterial,
        heart_rate: values.frecuenciaCardiaca,
        oxygen_saturation: values.saturacionO2,
        weight: values.peso,
        height: (parseFloat(values.talla) / 100).toString(), // Convertir cm a metros
      };

      console.log('Datos de la cita a actualizar:', appointmentData);
      
      // Actualizar la cita usando el servicio
      const response: ApiResponse<Appointment> = await AppointmentService.updateAppointment(id!, appointmentData);
      
      if (response.success) {
        message.success('Cita médica actualizada exitosamente');
        // Redirigir a la lista de citas
        setTimeout(() => {
          navigate('/appointments', { replace: true });
        }, 1000); // Pequeño delay para mostrar el mensaje de éxito
      } else {
        message.error(response.message || 'Error al actualizar la cita médica');
      }
    } catch (error) {
      message.error('Error inesperado al actualizar la cita médica');
      console.error('Error updating appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  // Preparar opciones para el autocompletado de pacientes
  const patientOptions: PatientOption[] = patients.map(patient => ({
    value: `${patient.last_name}, ${patient.first_name} - CI: ${patient.document_id}`,
    label: `${patient.last_name}, ${patient.first_name} - CI: ${patient.document_id}`,
    patient: patient
  }));

  // Opciones del CIE-10
  const cie10Options: CIE10Option[] = dataCIE10
    .filter(item => item.level > 0) // Solo mostrar códigos específicos, no categorías
    .map(item => ({
      value: item.code,
      label: `${item.code} - ${item.description}`
    }));

  const goBack = (): void => {
    navigate('/appointments');
  };

  const handleCancel = (): void => {
    navigate('/appointments');
  };

  const handleReset = (): void => {
    if (appointment && selectedPatient) {
      // Restaurar valores originales
      form.setFieldsValue({
        searchPatient: `${selectedPatient.last_name}, ${selectedPatient.first_name} - CI: ${selectedPatient.document_id}`,
        nombres: selectedPatient.first_name || '',
        apellidos: selectedPatient.last_name || '',
        cedula: selectedPatient.document_id || '',
        fecha: appointment.appointment_date ? dayjs(appointment.appointment_date) : undefined,
        hora: appointment.appointment_time ? dayjs(appointment.appointment_time, 'HH:mm:ss') : undefined,
        antecedentes: selectedPatient.medical_history || 'Sin antecedentes médicos registrados',
        enfermedadActual: appointment.current_illness || '',
        temperatura: appointment.temperature || '',
        presionArterial: appointment.blood_pressure || '',
        frecuenciaCardiaca: appointment.heart_rate || '',
        saturacionO2: appointment.oxygen_saturation || '',
        peso: appointment.weight || '',
        talla: appointment.height ? Math.round(parseFloat(appointment.height) * 100).toString() : '',
        examenFisico: appointment.physical_examination || '',
        diagnostico: appointment.diagnosis_code || '',
        observacionesDiagnostico: appointment.diagnosis_description || '',
        observaciones: appointment.observations || '',
        examenes: appointment.laboratory_tests || ''
      });
      message.info('Formulario restaurado a valores originales');
    }
  };

  if (loadingData) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
        <Content style={{ padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Card style={{ textAlign: 'center', padding: '48px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px' }}>
              <Text>Cargando datos de la cita médica...</Text>
            </div>
          </Card>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <Card style={{ marginBottom: '24px' }}>
            <Row justify="space-between" align="middle">
              <Col>
                <Space>
                  <Button 
                    type="text" 
                    icon={<ArrowLeftOutlined />}
                    onClick={goBack}
                  >
                    Volver
                  </Button>
                  <Divider type="vertical" />
                  <div>
                    <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                      FENIX
                    </Title>
                    <Text style={{ color: '#722ed1', fontSize: '18px', fontWeight: 500 }}>
                      Editar Cita Médica #{id}
                    </Text>
                  </div>
                </Space>
              </Col>
              <Col>
                <Avatar
                  size={64}
                  style={{ backgroundColor: '#722ed1' }}
                  icon={<EditOutlined />}
                />
              </Col>
            </Row>
          </Card>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            size="large"
            scrollToFirstError
          >
            <Row gutter={[24, 0]}>
              {/* Información del Paciente */}
              <Col xs={24}>
                <Card title={<><UserOutlined /> Información del Paciente</>} style={{ marginBottom: '24px' }}>
                  <Row gutter={[16, 0]}>
                    <Col xs={24} lg={12}>
                      <Form.Item
                        label="Buscar Paciente"
                        name="searchPatient"
                        rules={[{ required: true, message: 'Debe seleccionar un paciente' }]}
                      >
                       <AutoComplete
                            options={patientOptions}
                            onSelect={onPatientSelect}
                            placeholder="Buscar por apellidos, nombres o cédula"
                            filterOption={(inputValue: string, option?: DefaultOptionType) =>
                              (option?.value as string).toLowerCase().includes(inputValue.toLowerCase())
                          }
                          />
                      </Form.Item>
                    </Col>
                    <Col xs={24} lg={6}>
                      <Form.Item label="Nombres" name="nombres">
                        <Input disabled placeholder="Nombres del paciente" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} lg={6}>
                      <Form.Item label="Apellidos" name="apellidos">
                        <Input disabled placeholder="Apellidos del paciente" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} lg={6}>
                      <Form.Item label="Cédula" name="cedula">
                        <Input disabled placeholder="Cédula del paciente" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} lg={6}>
                      <Form.Item
                        label="Fecha de Cita"
                        name="fecha"
                        rules={[{ required: true, message: 'Ingrese la fecha de la cita' }]}
                      >
                        <DatePicker 
                          style={{ width: '100%' }}
                          placeholder="Seleccionar fecha"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} lg={6}>
                      <Form.Item
                        label="Hora de Cita"
                        name="hora"
                        rules={[{ required: true, message: 'Ingrese la hora de la cita' }]}
                      >
                        <TimePicker 
                          style={{ width: '100%' }}
                          format="HH:mm"
                          placeholder="Seleccionar hora"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              </Col>

              {/* Anamnesis */}
              <Col xs={24}>
                <Card title={<><FileTextOutlined /> Anamnesis</>} style={{ marginBottom: '24px' }}>
                  <Row gutter={[16, 16]}>
                    <Col xs={24}>
                      <Form.Item
                        label="Antecedentes (Cargados automáticamente del paciente)"
                        name="antecedentes"
                        rules={[{ required: true, message: 'Los antecedentes son obligatorios' }]}
                      >
                        <TextArea
                          rows={4}
                          placeholder="Los antecedentes se cargan automáticamente al seleccionar un paciente..."
                          disabled
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24}>
                      <Form.Item
                        label="Enfermedad Actual"
                        name="enfermedadActual"
                        rules={[{ required: true, message: 'Ingrese la descripción de la enfermedad actual' }]}
                      >
                        <TextArea
                          rows={4}
                          placeholder="Motivo de consulta, historia de la enfermedad actual, síntomas, evolución..."
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              </Col>

              {/* Signos Vitales */}
              <Col xs={24}>
                <Card title="Signos Vitales" style={{ marginBottom: '24px' }}>
                  <Row gutter={[16, 0]}>
                    <Col xs={24} sm={12} md={8} lg={4}>
                      <Form.Item
                        label="Temperatura (°C)"
                        name="temperatura"
                        rules={[
                          { required: true, message: 'Ingrese la temperatura' },
                          { pattern: /^\d{1,2}(\.\d{1,2})?$/, message: 'Formato inválido' }
                        ]}
                      >
                        <Input placeholder="36.5" addonAfter="°C" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={4}>
                      <Form.Item
                        label="Presión Arterial"
                        name="presionArterial"
                        rules={[
                          { required: true, message: 'Ingrese la presión arterial' },
                          { pattern: /^\d{2,3}\/\d{2,3}$/, message: 'Formato: 120/80' }
                        ]}
                      >
                        <Input placeholder="120/80" addonAfter="mmHg" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={4}>
                      <Form.Item
                        label="Frecuencia Cardíaca"
                        name="frecuenciaCardiaca"
                        rules={[
                          { required: true, message: 'Ingrese la frecuencia cardíaca' },
                          { pattern: /^\d{2,3}$/, message: 'Solo números' }
                        ]}
                      >
                        <Input placeholder="78" addonAfter="lpm" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={4}>
                      <Form.Item
                        label="SpO2 (%)"
                        name="saturacionO2"
                        rules={[
                          { required: true, message: 'Ingrese la saturación de oxígeno' },
                          { pattern: /^\d{2,3}$/, message: 'Solo números' }
                        ]}
                      >
                        <Input placeholder="98" addonAfter="%" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={4}>
                      <Form.Item
                        label="Peso (kg)"
                        name="peso"
                        rules={[
                          { required: true, message: 'Ingrese el peso' },
                          { pattern: /^\d{1,3}(\.\d{1,2})?$/, message: 'Formato inválido' }
                        ]}
                      >
                        <Input placeholder="65.5" addonAfter="kg" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={4}>
                      <Form.Item
                        label="Talla (cm)"
                        name="talla"
                        rules={[
                          { required: true, message: 'Ingrese la talla' },
                          { pattern: /^\d{2,3}$/, message: 'Solo números' }
                        ]}
                      >
                        <Input placeholder="165" addonAfter="cm" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              </Col>

              {/* Examen Físico */}
              <Col xs={24} lg={12}>
                <Card title={<><MedicineBoxOutlined /> Examen Físico</>} style={{ marginBottom: '24px' }}>
                  <Form.Item
                    name="examenFisico"
                    rules={[{ required: true, message: 'Ingrese los hallazgos del examen físico' }]}
                  >
                    <TextArea
                      rows={8}
                      placeholder="Descripción del examen físico: apariencia general, signos vitales, examen por sistemas..."
                    />
                  </Form.Item>
                </Card>
              </Col>

              {/* Diagnóstico */}
              <Col xs={24} lg={12}>
                <Card title="Diagnóstico (CIE-10)" style={{ marginBottom: '24px' }}>
                  <Form.Item
                    label="Buscar Diagnóstico"
                    name="diagnostico"
                    rules={[{ required: true, message: 'Seleccione un diagnóstico' }]}
                  >
                  <Select
                    showSearch
                    placeholder="Buscar por código o descripción"
                    optionFilterProp="label"
                    options={cie10Options}
                    filterOption={(input: string, option?: DefaultOptionType) => {
                      const label = option?.label;
                      return typeof label === 'string' && label.toLowerCase().includes(input.toLowerCase());
                    }}
                  />
                  </Form.Item>
                  
                  <Form.Item
                    label="Observaciones del Diagnóstico"
                    name="observacionesDiagnostico"
                  >
                    <TextArea
                      rows={4}
                      placeholder="Observaciones adicionales sobre el diagnóstico, plan de tratamiento, recomendaciones..."
                    />
                  </Form.Item>
                </Card>
              </Col>

              {/* Observaciones */}
              <Col xs={24} lg={12}>
                <Card title="Observaciones Generales" style={{ marginBottom: '24px' }}>
                  <Form.Item
                    name="observaciones"
                    rules={[{ required: true, message: 'Ingrese las observaciones' }]}
                  >
                    <TextArea
                      rows={6}
                      placeholder="Plan de tratamiento, medicamentos prescritos, recomendaciones, seguimiento..."
                    />
                  </Form.Item>
                </Card>
              </Col>

              {/* Exámenes */}
              <Col xs={24} lg={12}>
                <Card title={<><ExperimentOutlined /> Exámenes Solicitados</>} style={{ marginBottom: '24px' }}>
                  <Form.Item
                    name="examenes"
                  >
                    <TextArea
                      rows={6}
                      placeholder="Laboratorios, imágenes, estudios especiales solicitados..."
                    />
                  </Form.Item>
                </Card>
              </Col>

              {/* Botones de Acción */}
              <Col xs={24}>
                <Card>
                  <Row justify="end" gutter={[16, 16]}>
                    <Col>
                      <Button 
                        size="large"
                        onClick={handleReset}
                      >
                        Restaurar
                      </Button>
                    </Col>
                    <Col>
                      <Button 
                        type="default" 
                        size="large"
                        onClick={handleCancel}
                      >
                        Cancelar
                      </Button>
                    </Col>
                    <Col>
                      <Button 
                        type="primary" 
                        size="large"
                        htmlType="submit"
                        loading={loading}
                        icon={<SaveOutlined />}
                        disabled={!selectedPatient}
                      >
                        Actualizar Cita
                      </Button>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </Form>
        </div>
      </Content>
    </Layout>
  );
}