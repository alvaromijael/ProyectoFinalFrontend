import { useState, useEffect, useCallback, type JSX } from 'react';
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
  EditOutlined,
  SearchOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

import PatientService from '../../services/PatientService';
import AppointmentService from '../../services/AppointmentService';
import dataCIE10 from '../../../assets/dataCIE10.json';
import RecipeTable from '../../components/RecipeTable';

const { Title, Text } = Typography;
const { Content } = Layout;
const { TextArea } = Input;

// Función helper para debounce
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Interfaces
interface Patient {
  id?: number;
  first_name?: string;
  last_name?: string;
  document_id?: string;
  medical_history?: string;
}

interface Recipe {
  key: string;
  medicine: string;
  amount: string;
  instructions: string;
  observations: string;
}

interface Appointment {
  id?: number;
  patient_id: number;
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
  recipes?: any[];
}

export default function AppointmentEdit(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  // Estados
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [patientOptions, setPatientOptions] = useState<any[]>([]);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [originalData, setOriginalData] = useState<any>(null); // Para restaurar datos originales

  // Debounce del valor de búsqueda
  const debouncedSearchValue = useDebounce(searchValue, 500);

  // Función para buscar pacientes
  const searchPatients = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setPatientOptions([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await PatientService.searchPatients(query, { limit: 50 });
      if (response.success) {
        const options = response.data.map(patient => ({
          value: `${patient.last_name}, ${patient.first_name} - CI: ${patient.document_id}`,
          label: (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 500 }}>
                  {patient.last_name}, {patient.first_name}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  CI: {patient.document_id}
                </div>
              </div>
              <UserOutlined style={{ color: '#1890ff' }} />
            </div>
          ),
          patient: patient
        }));
        setPatientOptions(options);
      } else {
        setPatientOptions([]);
        if (query.length >= 3) {
          message.warning(`No se encontraron pacientes con: "${query}"`);
        }
      }
    } catch (error) {
      console.error('Error searching patients:', error);
      message.error('Error al buscar pacientes');
      setPatientOptions([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debouncedSearchValue) {
      searchPatients(debouncedSearchValue);
    }
  }, [debouncedSearchValue, searchPatients]);

  useEffect(() => {
    loadAppointmentData();
  }, [id]);

  const loadAppointmentData = async () => {
    setLoadingData(true);
    try {
      const appointmentResponse = await AppointmentService.getAppointmentById(id!);
      
      if (appointmentResponse.success) {
        const appointmentData = appointmentResponse.data;
        setAppointment(appointmentData);
                if (appointmentData.patient_id) {
          const patientResponse = await PatientService.getPatientById(appointmentData.patient_id);
          if (patientResponse.success) {
            const patient = patientResponse.data;
            setSelectedPatient(patient);
            
            const patientDisplayValue = `${patient.last_name}, ${patient.first_name} - CI: ${patient.document_id}`;
            
            const formData = {
              searchPatient: patientDisplayValue,
              nombres: patient.first_name || '',
              apellidos: patient.last_name || '',
              cedula: patient.document_id || '',
              fecha: appointmentData.appointment_date ? dayjs(appointmentData.appointment_date) : undefined,
              hora: appointmentData.appointment_time ? dayjs(appointmentData.appointment_time, 'HH:mm:ss') : undefined,
              antecedentes: patient.medical_history || 'Sin antecedentes médicos registrados',
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
            };

            let processedRecipes: Recipe[] = [];
            if (appointmentData.recipes && Array.isArray(appointmentData.recipes) && appointmentData.recipes.length > 0) {
              processedRecipes = appointmentData.recipes
                .filter((recipe: any) => recipe && (recipe.medicine || recipe.amount || recipe.instructions || recipe.observations))
                .map((recipe: any, index: number) => ({
                  key: `recipe-${index}-${Date.now()}`, // Clave única
                  medicine: recipe.medicine ? recipe.medicine.trim() : '',
                  amount: recipe.amount ? recipe.amount.trim() : '',
                  instructions: recipe.instructions ? recipe.instructions.trim() : '',
                  observations: recipe.observations ? recipe.observations.trim() : ''
                }));
            }
            
            setOriginalData({
              formData,
              recipes: processedRecipes,
              patient,
              appointment: appointmentData
            });
            
            form.setFieldsValue(formData);
            setRecipes(processedRecipes);
            setSearchValue(patientDisplayValue);
            message.success('Datos de la cita médica cargados correctamente');
          }
        }
      } else {
        message.error('Error al cargar la cita médica');
        navigate('/appointments');
      }
    } catch (error) {
      message.error('Error inesperado al cargar los datos');
      console.error('Error loading appointment data:', error);
      navigate('/appointments');
    } finally {
      setLoadingData(false);
    }
  };

  const onPatientSearch = (value: string) => {
    setSearchValue(value);
    if (!value) {
      setPatientOptions([]);
    }
  };

  const onPatientSelect = (value: string, option: any) => {
    const patient = option.patient;
    
    if (patient) {
      setSelectedPatient(patient);
      setSearchValue(value);
      form.setFieldsValue({
        searchPatient: value,
        nombres: patient.first_name,
        apellidos: patient.last_name,
        cedula: patient.document_id,
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
            const validRecipes = recipes.filter(recipe => 
        (recipe.medicine && recipe.medicine.trim()) || 
        (recipe.amount && recipe.amount.trim()) || 
        (recipe.instructions && recipe.instructions.trim()) || 
        (recipe.observations && recipe.observations.trim())
      ).map(recipe => ({
        medicine: recipe.medicine ? recipe.medicine.trim() : '',
        amount: recipe.amount ? recipe.amount.trim() : '',
        instructions: recipe.instructions ? recipe.instructions.trim() : '',
        observations: recipe.observations ? recipe.observations.trim() : ''
      }));

      const appointmentData = {
        patient_id: selectedPatient.id!,
        appointment_date: values.fecha.format('YYYY-MM-DD'),
        appointment_time: values.hora.format('HH:mm:ss'),
        current_illness: values.enfermedadActual,
        physical_examination: values.examenFisico,
        diagnosis_code: values.diagnostico,
        diagnosis_description: values.observacionesDiagnostico || (
          values.diagnostico ? 
          dataCIE10.find(item => item.code === values.diagnostico)?.description || '' : 
          ''
        ),
        observations: values.observaciones,
        laboratory_tests: values.examenes || '',
        temperature: values.temperatura,
        blood_pressure: values.presionArterial,
        heart_rate: values.frecuenciaCardiaca,
        oxygen_saturation: values.saturacionO2,
        weight: values.peso,
        height: values.talla ? (parseFloat(values.talla) / 100).toString() : '',
        recipes: validRecipes
      };

      console.log('Datos de la cita a actualizar:', appointmentData);
      
      const response = await AppointmentService.updateAppointment(id!, appointmentData);
      
      if (response.success) {
        message.success('Cita médica actualizada exitosamente');
        navigate('/appointments');
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error('Error inesperado al actualizar la cita médica');
      console.error('Error updating appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const cie10Options = Array.isArray(dataCIE10) 
    ? dataCIE10
        .filter(item => item && item.code && item.description && (item.level > 0))
        .map(item => ({
          value: item.code,
          label: `${item.code} - ${item.description}`
        }))
    : [];

  const goBack = () => {
    navigate('/appointments');
  };

  const handleCancel = () => {
    navigate('/appointments');
  };

  const handleClear = () => {
    if (originalData) {
      form.setFieldsValue(originalData.formData);
      setRecipes([...originalData.recipes]); 
      setSelectedPatient(originalData.patient);
      setSearchValue(originalData.formData.searchPatient);
      message.info('Formulario restaurado a valores originales');
    } else {
      loadAppointmentData();
      message.info('Formulario restaurado desde el servidor');
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
              <Col xs={24}>
                <Card title={<><UserOutlined /> Información del Paciente</>} style={{ marginBottom: '24px' }}>
                  <Row gutter={[16, 0]}>
                    <Col xs={24} lg={12}>
                      <Form.Item
                        label="Buscar Paciente"
                        name="searchPatient"
                        rules={[{ required: true, message: 'Debe seleccionar un paciente' }]}
                        extra="Busque por apellidos, nombres o número de cédula"
                      >
                        <AutoComplete
                          value={searchValue}
                          options={patientOptions}
                          onSearch={onPatientSearch}
                          onSelect={onPatientSelect}
                          placeholder="Escriba apellidos, nombres o cédula..."
                          notFoundContent={
                            searchLoading ? (
                              <div style={{ padding: '12px', textAlign: 'center' }}>
                                <Spin size="small" /> Buscando pacientes...
                              </div>
                            ) : searchValue && searchValue.length >= 2 ? (
                              <div style={{ padding: '12px', textAlign: 'center', color: '#999' }}>
                                No se encontraron pacientes
                              </div>
                            ) : searchValue && searchValue.length < 2 ? (
                              <div style={{ padding: '12px', textAlign: 'center', color: '#999' }}>
                                Escriba al menos 2 caracteres para buscar
                              </div>
                            ) : null
                          }
                          suffixIcon={searchLoading ? <Spin size="small" /> : <SearchOutlined />}
                          allowClear
                          onClear={() => {
                            setSearchValue('');
                            setPatientOptions([]);
                            setSelectedPatient(null);
                            form.setFieldsValue({
                              nombres: '',
                              apellidos: '',
                              cedula: '',
                              antecedentes: ''
                            });
                          }}
                        />
                      </Form.Item>
                      {selectedPatient && (
                        <div style={{ 
                          marginTop: '8px', 
                          padding: '8px', 
                          background: '#f6ffed', 
                          border: '1px solid #b7eb8f',
                          borderRadius: '6px',
                          fontSize: '12px',
                          color: '#52c41a'
                        }}>
                          ✓ Paciente seleccionado: {selectedPatient.first_name} {selectedPatient.last_name}
                        </div>
                      )}
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
                          format="DD/MM/YYYY"
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
                        option?.label?.toLowerCase().includes(input.toLowerCase()) || false
                      }
                      notFoundContent="No se encontraron diagnósticos"
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
              <Col xs={24}>
                <RecipeTable 
                  recipes={recipes}
                  setRecipes={setRecipes}
                />
              </Col>
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
              <Col xs={24}>
                <Card>
                  <Row justify="end" gutter={[16, 16]}>
                    <Col>
                      <Button 
                        size="large"
                        onClick={handleClear}
                        disabled={loading}
                      >
                        Restaurar
                      </Button>
                    </Col>
                    <Col>
                      <Button 
                        type="default" 
                        size="large"
                        onClick={handleCancel}
                        disabled={loading}
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