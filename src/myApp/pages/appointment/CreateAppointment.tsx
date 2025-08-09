import { useState } from 'react';
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
  UserOutlined,  SaveOutlined,
  ArrowLeftOutlined,
  HeartOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Content } = Layout;
const { Option } = Select;
const { TextArea } = Input;

export default function CreateAppointment() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Datos simulados de pacientes para el autocompletado
  const patients = [
    {
      id: 1,
      nombres: 'María Elena',
      apellidos: 'García López',
      cedula: '1234567890',
      fullName: 'García López, María Elena - CI: 1234567890'
    },
    {
      id: 2,
      nombres: 'Carlos Andrés',
      apellidos: 'Rodríguez Silva',
      cedula: '0987654321',
      fullName: 'Rodríguez Silva, Carlos Andrés - CI: 0987654321'
    },
    {
      id: 3,
      nombres: 'Ana Lucía',
      apellidos: 'Vásquez Morales',
      cedula: '1122334455',
      fullName: 'Vásquez Morales, Ana Lucía - CI: 1122334455'
    }
  ];

  // Datos simulados del CIE-10 (en tu aplicación real usarías dataCIE10.json)
  const cie10Data = [
    { level: 0, code: "A00-B99", description: "Ciertas enfermedades infecciosas y parasitarias" },
    { level: 1, code: "A00", description: "Cólera" },
    { level: 1, code: "A01", description: "Fiebres tifoidea y paratifoidea" },
    { level: 1, code: "A02", description: "Otras infecciones por Salmonella" },
    { level: 0, code: "C00-D48", description: "Neoplasias" },
    { level: 1, code: "C00", description: "Neoplasia maligna del labio" },
    { level: 0, code: "E00-E90", description: "Enfermedades endocrinas, nutricionales y metabólicas" },
    { level: 1, code: "E10", description: "Diabetes mellitus insulinodependiente" },
    { level: 1, code: "E11", description: "Diabetes mellitus no insulinodependiente" },
    { level: 0, code: "G00-G99", description: "Enfermedades del sistema nervioso" },
    { level: 1, code: "G43", description: "Migraña" },
    { level: 2, code: "G43.9", description: "Migraña, no especificada" },
    { level: 0, code: "I00-I99", description: "Enfermedades del sistema circulatorio" },
    { level: 1, code: "I10", description: "Hipertensión esencial (primaria)" },
    { level: 0, code: "J00-J99", description: "Enfermedades del sistema respiratorio" },
    { level: 1, code: "J06", description: "Infecciones agudas de las vías respiratorias superiores" },
    { level: 2, code: "J06.9", description: "Infección aguda de las vías respiratorias superiores, no especificada" },
    { level: 0, code: "K00-K93", description: "Enfermedades del sistema digestivo" },
    { level: 1, code: "K29", description: "Gastritis y duodenitis" },
    { level: 2, code: "K29.7", description: "Gastritis, no especificada" },
    { level: 0, code: "M00-M99", description: "Enfermedades del sistema osteomuscular" },
    { level: 1, code: "M25", description: "Otros trastornos articulares" },
    { level: 0, code: "R00-R99", description: "Síntomas, signos y hallazgos anormales clínicos" },
    { level: 1, code: "R50", description: "Fiebre, no especificada" }
  ];

  const onPatientSelect = (value, option) => {
    const patient = patients.find(p => p.fullName === value);
    if (patient) {
      setSelectedPatient(patient);
      form.setFieldsValue({
        nombres: patient.nombres,
        apellidos: patient.apellidos,
        cedula: patient.cedula
      });
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Aquí enviarías los datos al backend
      console.log('Datos de la cita:', values);
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success('Cita médica creada exitosamente');
      form.resetFields();
      setSelectedPatient(null);
    } catch (error) {
      message.error('Error al crear la cita médica');
    } finally {
      setLoading(false);
    }
  };

  const patientOptions = patients.map(patient => ({
    value: patient.fullName,
    label: patient.fullName
  }));

  const cie10Options = cie10Data
    .filter(item => item.level > 0) // Solo mostrar códigos específicos, no categorías
    .map(item => ({
      value: item.code,
      label: `${item.code} - ${item.description}`
    }));

  const goBack = () => {
    message.info('Volver a lista de citas');
    // navigate('/appointments'); // Aquí pondrías tu navegación real
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedPatient(null);
    message.info('Formulario cancelado');
    // navigate('/appointments'); // Aquí pondrías tu navegación real
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
                            option.value.toLowerCase().includes(inputValue.toLowerCase())
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
                        label="Antecedentes"
                        name="antecedentes"
                        rules={[{ required: true, message: 'Ingrese los antecedentes del paciente' }]}
                      >
                        <TextArea
                          rows={4}
                          placeholder="Antecedentes médicos, quirúrgicos, familiares, alergias, medicamentos actuales..."
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
                <Card title={<><MedicineBoxOutlined /> Examen Físico</>} style={{ marginBottom: '24px', height: '300px' }}>
                  <Form.Item
                    name="examenFisico"
                    rules={[{ required: true, message: 'Ingrese los hallazgos del examen físico' }]}
                    style={{ height: '100%' }}
                  >
                    <TextArea
                      rows={8}
                      placeholder="Descripción del examen físico: apariencia general, signos vitales, examen por sistemas..."
                      style={{ height: '200px', resize: 'none' }}
                    />
                  </Form.Item>
                </Card>
              </Col>

              {/* Diagnóstico */}
              <Col xs={24} lg={12}>
                <Card title="Diagnóstico (CIE-10)" style={{ marginBottom: '24px', height: '300px' }}>
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
                        option.label.toLowerCase().includes(input.toLowerCase())
                      }
                    />
                  </Form.Item>
                  
                  <Form.Item
                    label="Observaciones del Diagnóstico"
                    name="observacionesDiagnostico"
                  >
                    <TextArea
                      rows={6}
                      placeholder="Observaciones adicionales sobre el diagnóstico, plan de tratamiento, recomendaciones..."
                      style={{ resize: 'none' }}
                    />
                  </Form.Item>
                </Card>
              </Col>

              {/* Observaciones */}
              <Col xs={24} lg={12}>
                <Card title="Observaciones Generales" style={{ marginBottom: '24px', height: '200px' }}>
                  <Form.Item
                    name="observaciones"
                    rules={[{ required: true, message: 'Ingrese las observaciones' }]}
                    style={{ height: '100%' }}
                  >
                    <TextArea
                      rows={6}
                      placeholder="Plan de tratamiento, medicamentos prescritos, recomendaciones, seguimiento..."
                      style={{ height: '120px', resize: 'none' }}
                    />
                  </Form.Item>
                </Card>
              </Col>

              {/* Exámenes */}
              <Col xs={24} lg={12}>
                <Card title={<><ExperimentOutlined /> Exámenes Solicitados</>} style={{ marginBottom: '24px', height: '200px' }}>
                  <Form.Item
                    name="examenes"
                    style={{ height: '100%' }}
                  >
                    <TextArea
                      rows={6}
                      placeholder="Laboratorios, imágenes, estudios especiales solicitados..."
                      style={{ height: '120px', resize: 'none' }}
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