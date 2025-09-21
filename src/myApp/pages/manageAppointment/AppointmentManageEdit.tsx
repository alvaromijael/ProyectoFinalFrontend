import { useState, useEffect, useCallback, type JSX } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Form,
  Input,
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
  Spin,
  Select
} from 'antd';
import {
  UserOutlined,  
  SaveOutlined,
  ArrowLeftOutlined,
  FileTextOutlined,
  ExperimentOutlined,
  EditOutlined,
  SearchOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';

import PatientService from '../../services/PatientService';
import AppointmentService from '../../services/AppointmentService';
import RecipeTable from '../../components/RecipeTable';
import DiagnosisTable from '../../components/DiagnosisTable';

const { Title, Text } = Typography;
const { Content } = Layout;
const { TextArea } = Input;
const { Option } = Select;

export interface Diagnosis {
  key: string;
  diagnosis_code: string;
  diagnosis_description: string;
  diagnosis_type: 'primary' | 'secondary';
  observations: string;
}

// Custom hook for debounce with proper typing
const useDebounce = (value: string, delay: number): string => {
  const [debouncedValue, setDebouncedValue] = useState<string>(value);

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
  lunchTime: string;
  observations: string;
}

interface AppointmentDiagnosis {
  id?: number;
  diagnosis_code: string;
  diagnosis_description: string;
  diagnosis_type: 'primary' | 'secondary';
}

interface APIRecipe {
  medicine?: string;
  amount?: string;
  instructions?: string;
  lunchTime?: string;
  observations?: string;
}

interface Appointment {
  id?: number;
  patient_id: number;
  appointment_date: string;
  appointment_time: string;
  current_illness?: string;
  physical_examination?: string;
  temperature?: string;
  blood_pressure?: string;
  heart_rate?: string;
  oxygen_saturation?: string;
  weight?: number; // Cambio: number en lugar de string
  weight_unit?: string; // Nuevo campo
  height?: string;
  observations?: string;
  laboratory_tests?: string;
  medical_preinscription?: string; // CORREGIDO: nombre consistente
  recipes?: APIRecipe[];
  diagnoses?: AppointmentDiagnosis[];
}

interface PatientOption {
  value: string;
  label: JSX.Element;
  patient: Patient;
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
  pesoUnidad: string; // Nuevo campo
  talla: string;
  medical_preinscription: string; 
  examenFisico: string;
  observaciones: string;
  examenes: string;
}

interface OriginalData {
  formData: Partial<FormValues>;
  recipes: Recipe[];
  patient: Patient;
  appointment: Appointment;
  diagnoses: Diagnosis[];
}

interface APIResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

interface AppointmentUpdateData {
  patient_id: number;
  appointment_date: string;
  appointment_time: string;
  current_illness: string;
  physical_examination: string;
  observations: string;
  laboratory_tests: string;
  temperature: string;
  blood_pressure: string;
  heart_rate: string;
  oxygen_saturation: string;
  weight: number; // Cambio: number en lugar de string
  weight_unit: string; // Nuevo campo
  height: string;
  medical_preinscription: string; // CORREGIDO: nombre consistente
  diagnoses: Array<{
    diagnosis_code: string;
    diagnosis_description: string;
    diagnosis_type: 'primary' | 'secondary';
  }>;
  recipes: Array<{
    medicine: string;
    amount: string;
    instructions: string;
    observations: string;
  }>;
}

// Opciones de unidades de peso
const WEIGHT_UNITS = [
  { value: 'kg', label: 'Kilogramos (kg)', suffix: 'kg' },
  { value: 'lb', label: 'Libras (lb)', suffix: 'lb' },
  { value: 'g', label: 'Gramos (g)', suffix: 'g' }
];

export default function AppointmentManageEdit(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm<FormValues>();
  
  // Estados con tipos específicos
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchValue, setSearchValue] = useState<string>('');
  const [patientOptions, setPatientOptions] = useState<PatientOption[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [originalData, setOriginalData] = useState<OriginalData | null>(null);
  const [weightUnit, setWeightUnit] = useState<string>('kg');

  // Debounce del valor de búsqueda
  const debouncedSearchValue = useDebounce(searchValue, 500);

  // Función para buscar pacientes con tipos apropiados
  const searchPatients = useCallback(async (query: string): Promise<void> => {
    if (!query || query.length < 2) {
      setPatientOptions([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response: APIResponse<Patient[]> = await PatientService.searchPatients(query, { limit: 50 });
      if (response.success) {
        const options: PatientOption[] = response.data.map((patient: Patient) => ({
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

  // Función para convertir diagnósticos de la API a formato de tabla
  const convertDiagnosesToTable = (apiDiagnoses: AppointmentDiagnosis[]): Diagnosis[] => {
    return apiDiagnoses.map((diag: AppointmentDiagnosis, index: number) => ({
      key: `diagnosis-${index}-${Date.now()}`,
      diagnosis_code: diag.diagnosis_code,
      diagnosis_description: diag.diagnosis_description,
      diagnosis_type: diag.diagnosis_type,
      observations: ''
    }));
  };

  // Función para convertir diagnósticos de tabla a formato API
  const buildDiagnosesForAPI = (diagnosesTable: Diagnosis[]): AppointmentUpdateData['diagnoses'] => {
    return diagnosesTable
      .filter((diag: Diagnosis) => diag.diagnosis_code && diag.diagnosis_description)
      .map((diag: Diagnosis) => ({
        diagnosis_code: diag.diagnosis_code,
        diagnosis_description: diag.diagnosis_description,
        diagnosis_type: diag.diagnosis_type
      }));
  };

  const loadAppointmentData = async (): Promise<void> => {
    if (!id) {
      message.error('ID de cita no válido');
      navigate('/manageAppointmentList');
      return;
    }

    setLoadingData(true);
    try {
      const appointmentResponse: APIResponse<Appointment> = await AppointmentService.getAppointmentById(id);
      
      if (appointmentResponse.success) {
        const appointmentData = appointmentResponse.data;
        
        console.log('Appointment data loaded:', appointmentData);
        console.log('Medical preinscription value:', appointmentData.medical_preinscription);

        if (appointmentData.patient_id) {
          const patientResponse: APIResponse<Patient> = await PatientService.getPatientById(appointmentData.patient_id);
          if (patientResponse.success) {
            const patient = patientResponse.data;
            setSelectedPatient(patient);
            
            const patientDisplayValue = `${patient.last_name}, ${patient.first_name} - CI: ${patient.document_id}`;
            
            const tableDiagnoses = appointmentData.diagnoses 
              ? convertDiagnosesToTable(appointmentData.diagnoses)
              : [];
            
            setDiagnoses(tableDiagnoses);

            // Establecer unidad de peso
            const weightUnitValue = appointmentData.weight_unit || 'kg';
            setWeightUnit(weightUnitValue);

            const formData: Partial<FormValues> = {
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
              peso: appointmentData.weight ? appointmentData.weight.toString() : '',
              pesoUnidad: weightUnitValue,
              talla: appointmentData.height ? Math.round(parseFloat(appointmentData.height) * 100).toString() : '',
              medical_preinscription: appointmentData.medical_preinscription || '', // CORREGIDO
              examenFisico: appointmentData.physical_examination || '',
              observaciones: appointmentData.observations || '',
              examenes: appointmentData.laboratory_tests || ''
            };

            console.log('Form data to set:', formData);
            console.log('Medical preinscription in formData:', formData.medical_preinscription);

            let processedRecipes: Recipe[] = [];
            if (appointmentData.recipes && Array.isArray(appointmentData.recipes) && appointmentData.recipes.length > 0) {
              processedRecipes = appointmentData.recipes
                .filter((recipe: APIRecipe) => recipe && (recipe.medicine || recipe.amount || recipe.instructions || recipe.observations))
                .map((recipe: APIRecipe, index: number) => ({
                  key: `recipe-${index}-${Date.now()}`,
                  medicine: recipe.medicine ? recipe.medicine.trim() : '',
                  amount: recipe.amount ? recipe.amount.trim() : '',
                  instructions: recipe.instructions ? recipe.instructions.trim() : '',
                  lunchTime: recipe.lunchTime ? recipe.lunchTime.trim() : '', 
                  observations: recipe.observations ? recipe.observations.trim() : ''
                }));
            }
            
            const originalDataObj: OriginalData = {
              formData,
              recipes: processedRecipes,
              patient,
              appointment: appointmentData,
              diagnoses: tableDiagnoses
            };
            
            setOriginalData(originalDataObj);
            
            form.setFieldsValue(formData);
            setRecipes(processedRecipes);
            setSearchValue(patientDisplayValue);
            
            setTimeout(() => {
              console.log('Current form values:', form.getFieldsValue());
              console.log('Medical preinscription field value:', form.getFieldValue('medical_preinscription'));
            }, 100);
            
            message.success('Datos de la cita médica cargados correctamente');
          }
        }
      } else {
        message.error('Error al cargar la cita médica');
        navigate('/manageAppointmentList');
      }
    } catch (error) {
      message.error('Error inesperado al cargar los datos');
      console.error('Error loading appointment data:', error);
      navigate('/manageAppointmentList');
    } finally {
      setLoadingData(false);
    }
  };

  const onPatientSearch = (value: string): void => {
    setSearchValue(value);
    if (!value) {
      setPatientOptions([]);
    }
  };

  const onPatientSelect = (value: string, option: PatientOption): void => {
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

  const onWeightUnitChange = (value: string): void => {
    setWeightUnit(value);
    form.setFieldsValue({ pesoUnidad: value });
  };

  const getWeightSuffix = (): string => {
    const unit = WEIGHT_UNITS.find(u => u.value === weightUnit);
    return unit ? unit.suffix : 'kg';
  };

  const getWeightPlaceholder = (): string => {
    switch (weightUnit) {
      case 'kg':
        return '65.5';
      case 'lb':
        return '144.4';
      case 'g':
        return '3200';
      default:
        return '65.5';
    }
  };

  const getWeightValidationPattern = (): RegExp => {
    switch (weightUnit) {
      case 'g':
        return /^\d{1,6}(\.\d{1,2})?$/; // Para gramos (hasta 6 dígitos)
      default:
        return /^\d{1,3}(\.\d{1,2})?$/; // Para kg y lb
    }
  };

  const onFinish = async (values: FormValues): Promise<void> => {
    if (!selectedPatient) {
      message.error('Debe seleccionar un paciente');
      return;
    }

    if (!id) {
      message.error('ID de cita no válido');
      return;
    }

    // Validar que hay al menos un diagnóstico válido
    const validDiagnoses = diagnoses.filter((diag: Diagnosis) => diag.diagnosis_code && diag.diagnosis_description);
    if (validDiagnoses.length === 0) {
      message.error('Debe agregar al menos un diagnóstico válido');
      return;
    }

    setLoading(true);
    try {
      const validRecipes = recipes.filter((recipe: Recipe) => 
        (recipe.medicine && recipe.medicine.trim()) || 
        (recipe.amount && recipe.amount.trim()) || 
        (recipe.instructions && recipe.instructions.trim()) ||
        (recipe.lunchTime && recipe.lunchTime.trim()) || 
        (recipe.observations && recipe.observations.trim())
      ).map((recipe: Recipe) => ({
        medicine: recipe.medicine ? recipe.medicine.trim() : '',
        amount: recipe.amount ? recipe.amount.trim() : '',
        instructions: recipe.instructions ? recipe.instructions.trim() : '',
        lunchTime:  recipe.lunchTime ? recipe.lunchTime.trim() : '',
        observations: recipe.observations ? recipe.observations.trim() : ''
      }));

      // Preparar los diagnósticos para la API
      const diagnosesArray = buildDiagnosesForAPI(diagnoses);

      // Validar peso
      const weightValue = parseFloat(values.peso);
      if (isNaN(weightValue) || weightValue <= 0) {
        message.error('El peso debe ser un número válido');
        setLoading(false);
        return;
      }

      // Validar peso según unidad usando el servicio
      const weightValidation = AppointmentService.validateWeight(weightValue, values.pesoUnidad);
      if (!weightValidation.isValid) {
        message.error(weightValidation.message);
        setLoading(false);
        return;
      }

      const appointmentData: AppointmentUpdateData = {
        patient_id: selectedPatient.id!,
        appointment_date: values.fecha.format('YYYY-MM-DD'),
        appointment_time: values.hora.format('HH:mm:ss'),
        current_illness: values.enfermedadActual,
        physical_examination: values.examenFisico,
        observations: values.observaciones,
        laboratory_tests: values.examenes || '',
        temperature: values.temperatura,
        blood_pressure: values.presionArterial,
        heart_rate: values.frecuenciaCardiaca,
        oxygen_saturation: values.saturacionO2,
        weight: weightValue,
        weight_unit: values.pesoUnidad,
        height: values.talla ? (parseFloat(values.talla) / 100).toString() : '',
        medical_preinscription: values.medical_preinscription || '', // CORREGIDO
        diagnoses: diagnosesArray,
        recipes: validRecipes
      };

      console.log('Datos de la cita a actualizar:', appointmentData);
      console.log('Medical preinscription a enviar:', appointmentData.medical_preinscription);
      
      const response: APIResponse = await AppointmentService.updateAppointment(id, appointmentData);
      
      if (response.success) {
        message.success('Cita médica actualizada exitosamente');
        navigate('/manageAppointmentList');
      } else {
        message.error(response.message || 'Error al actualizar la cita');
      }
    } catch (error) {
      message.error('Error inesperado al actualizar la cita médica');
      console.error('Error updating appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const goBack = (): void => {
    navigate('/manageAppointmentList');
  };

  const handleCancel = (): void => {
    navigate('/manageAppointmentList');
  };

  const handleClear = (): void => {
    if (originalData) {
      console.log('Restoring original data:', originalData.formData);
      form.setFieldsValue(originalData.formData);
      setRecipes([...originalData.recipes]); 
      setSelectedPatient(originalData.patient);
      setSearchValue(originalData.formData.searchPatient || '');
      setDiagnoses([...originalData.diagnoses]);
      setWeightUnit(originalData.formData.pesoUnidad || 'kg');
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
                    <Col xs={24} sm={12} md={6} lg={3}>
                      <Form.Item
                        label="Unidad de Peso"
                        name="pesoUnidad"
                        rules={[{ required: true, message: 'Seleccione unidad' }]}
                      >
                        <Select
                          value={weightUnit}
                          onChange={onWeightUnitChange}
                          placeholder="Unidad"
                        >
                          {WEIGHT_UNITS.map(unit => (
                            <Option key={unit.value} value={unit.value}>
                              {unit.label}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6} lg={3}>
                      <Form.Item
                        label={`Peso (${getWeightSuffix()})`}
                        name="peso"
                        rules={[
                          { required: true, message: 'Ingrese el peso' },
                          { pattern: getWeightValidationPattern(), message: 'Formato inválido' }
                        ]}
                      >
                        <Input 
                          placeholder={getWeightPlaceholder()} 
                          addonAfter={getWeightSuffix()} 
                        />
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
              
              <Col xs={24} lg={12}>
                <Card title={<><FileTextOutlined /> Examen Físico</>} style={{ marginBottom: '24px' }}>
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
                <Card title="Observaciones Generales" style={{ marginBottom: '24px' }}>
                  <Form.Item
                    name="observaciones"
                    rules={[{ required: true, message: 'Ingrese las observaciones' }]}
                  >
                    <TextArea
                      rows={8}
                      placeholder="Plan de tratamiento, medicamentos prescritos, recomendaciones, seguimiento..."
                    />
                  </Form.Item>
                </Card>
              </Col>

              {/* Prescripción Médica */}
              <Col xs={24}>
                <Card title={<><MedicineBoxOutlined /> Prescripción Médica</>} style={{ marginBottom: '24px' }}>
                  <Form.Item
                    label="Prescripción médica para hospitalización, cirugías u otros procedimientos"
                    name="medical_preinscription" // CORREGIDO: nombre consistente
                    extra="Campo opcional para prescripciones médicas especiales"
                  >
                    <TextArea
                      rows={6}
                      placeholder="Escriba aquí la prescripción médica para hospitalización, cirugías u otros procedimientos médicos especiales..."
                      showCount
                      maxLength={2000}
                    />
                  </Form.Item>
                </Card>
              </Col>

              {/* Tabla de Diagnósticos */}
              <Col xs={24}>
                <DiagnosisTable 
                  diagnoses={diagnoses}
                  setDiagnoses={setDiagnoses}
                />
              </Col>

              <Col xs={24}>
                <RecipeTable 
                  recipes={recipes}
                  setRecipes={setRecipes}
                />
              </Col>
              
              <Col xs={24}>
                <Card title={<><ExperimentOutlined /> Exámenes Solicitados</>} style={{ marginBottom: '24px' }}>
                  <Form.Item
                    label="Laboratorios, imágenes y estudios especiales"
                    name="examenes"
                    extra="Detalle los exámenes de laboratorio, imágenes y estudios especiales solicitados"
                  >
                    <TextArea
                      rows={6}
                      placeholder="Laboratorios, imágenes, estudios especiales solicitados..."
                      showCount
                      maxLength={1500}
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