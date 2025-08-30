import { useState, useEffect } from 'react';
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
  AutoComplete
} from 'antd';
import {
  UserOutlined,  
  SaveOutlined,
  ArrowLeftOutlined,
  HeartOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';

import PatientService from '../../services/PatientService';
import AppointmentService from  '../../services/AppointmentService';
import type { Patient } from  '../../services/PatientService';
import dataCIE10 from '../../../assets/dataCIE10.json';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Content } = Layout;
const { TextArea } = Input;

export default function CreateAppointment() {
  const navigate = useNavigate();

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);

  // Cargar pacientes al montar el componente
  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
     const response = await PatientService.getPatients({ limit: 1000 });
      if (response.success) {
        setPatients(response.data);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error('Error al cargar los pacientes');
      console.error('Error loading patients:', error);
    } 
  };

  const onPatientSelect = (value: string) => {
    const patient = patients.find(p => 
      `${p.last_name}, ${p.first_name} - CI: ${p.document_id}` === value
    );
    
    if (patient) {
      setSelectedPatient(patient);
      form.setFieldsValue({
        nombres: patient.first_name,
        apellidos: patient.last_name,
        cedula: patient.document_id,
        // Automáticamente llenar antecedentes con el medical_history del paciente
        antecedentes: patient.medical_history || 'Sin antecedentes médicos registrados'
      });
      
      message.success('Paciente seleccionado. Antecedentes cargados automáticamente.');
    }
  };

  const onFinish = async (values: any) => {
    if (!selectedPatient) {
      message.error('Debe seleccionar un paciente');
      return;
    }

    setLoading(true);
    try {
      // Preparar datos para crear la cita
      const appointmentData = {
        patient_id: selectedPatient.id!,
        appointment_date: values.fecha.format('YYYY-MM-DD'),
        appointment_time: values.hora.format('HH:mm:ss'),
        current_illness: values.enfermedadActual,
        physical_examination: values.examenFisico,
        diagnosis_code: values.diagnostico,
        diagnosis_description: dataCIE10.find(item => item.code === values.diagnostico)?.description || '',
        observations: values.observaciones,
        laboratory_tests: values.examenes || '',
        temperature: values.temperatura,
        blood_pressure: values.presionArterial,
        heart_rate: values.frecuenciaCardiaca,
        oxygen_saturation: values.saturacionO2,
        weight: values.peso,
        height: (parseFloat(values.talla) / 100).toString(), // Convertir cm a metros
      };

      console.log('Datos de la cita a enviar:', appointmentData);
      
      // Crear la cita usando el servicio
      const response = await AppointmentService.createAppointment(appointmentData);
      
      if (response.success) {
        message.success(response.message);
        form.resetFields();
        setSelectedPatient(null);
        // Aquí podrías redirigir o actualizar la lista
        navigate('/appointmentList');
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error('Error inesperado al crear la cita médica');
      console.error('Error creating appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  // Preparar opciones para el autocompletado de pacientes
  const patientOptions = patients.map(patient => ({
    value: `${patient.last_name}, ${patient.first_name} - CI: ${patient.document_id}`,
    label: `${patient.last_name}, ${patient.first_name} - CI: ${patient.document_id}`,
    patient: patient
  }));

  // Opciones del CIE-10
  const cie10Options = dataCIE10
    .filter(item => item.level > 0) // Solo mostrar códigos específicos, no categorías
    .map(item => ({
      value: item.code,
      label: `${item.code} - ${item.description}`
    }));

  const goBack = () => {
    
    navigate('/appointmentList');
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedPatient(null);
    message.info('Formulario cancelado');
    navigate('/appointmentList');
  };

  const handleClear = () => {
    form.resetFields();
    setSelectedPatient(null);
    message.info('Formulario limpiado');
  };

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
                      Nueva Cita Médica
                    </Text>
                  </div>
                </Space>
              </Col>
              <Col>
                <Avatar
                  size={64}
                  style={{ backgroundColor: '#722ed1' }}
                  icon={<HeartOutlined />}
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
                          filterOption={(inputValue, option) =>
                            option!.value.toLowerCase().includes(inputValue.toLowerCase())
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
                      filterOption={(input, option) =>
                        option!.label.toLowerCase().includes(input.toLowerCase())
                      }
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
                        onClick={handleClear}
                      >
                        Limpiar
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
                        Guardar Cita
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