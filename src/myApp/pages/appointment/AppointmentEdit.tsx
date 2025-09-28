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
  EditOutlined,
  SearchOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';

import PatientService from '../../services/PatientService';
import AppointmentService, { type User } from '../../services/AppointmentService';

const { Title, Text } = Typography;
const { Content } = Layout;
const { Option } = Select;

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

interface Patient {
  id?: number;
  first_name?: string;
  last_name?: string;
  document_id?: string;
  medical_history?: string;
}

interface Appointment {
  id?: number;
  patient_id: number;
  user_id?: number;
  appointment_date: string;
  appointment_time: string;
  temperature?: string;
  blood_pressure?: string;
  heart_rate?: string;
  oxygen_saturation?: string;
  weight?: number;
  weight_unit?: string;
  height?: string;
  user?: User;
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
  temperatura: string;
  presionArterial: string;
  frecuenciaCardiaca: string;
  saturacionO2: string;
  peso: string;
  pesoUnidad: string;
  talla: string;
}

interface OriginalData {
  formData: Partial<FormValues>;
  patient: Patient;
  appointment: Appointment;
  assignedDoctor?: User;
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
  temperature: string;
  blood_pressure: string;
  heart_rate: string;
  oxygen_saturation: string;
  weight: number;
  weight_unit: string;
  height: string;
}

const WEIGHT_UNITS = [
  { value: 'kg', label: 'Kilogramos (kg)', suffix: 'kg' },
  { value: 'lb', label: 'Libras (lb)', suffix: 'lb' },
  { value: 'g', label: 'Gramos (g)', suffix: 'g' }
];

export default function AppointmentEdit(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm<FormValues>();
  
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [assignedDoctor, setAssignedDoctor] = useState<User | null>(null);
  const [searchValue, setSearchValue] = useState<string>('');
  const [patientOptions, setPatientOptions] = useState<PatientOption[]>([]);
  const [originalData, setOriginalData] = useState<OriginalData | null>(null);
  const [weightUnit, setWeightUnit] = useState<string>('kg');

  const debouncedSearchValue = useDebounce(searchValue, 500);

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

  const loadAppointmentData = async (): Promise<void> => {
    if (!id) {
      message.error('ID de cita no válido');
      navigate('/appointments');
      return;
    }

    setLoadingData(true);
    try {
      const appointmentResponse: APIResponse<Appointment> = await AppointmentService.getAppointmentById(id);
      
      if (appointmentResponse.success) {
        const appointmentData = appointmentResponse.data;

        if (appointmentData.user) {
          setAssignedDoctor(appointmentData.user);
        }

        if (appointmentData.patient_id) {
          const patientResponse: APIResponse<Patient> = await PatientService.getPatientById(appointmentData.patient_id);
          if (patientResponse.success) {
            const patient = patientResponse.data;
            setSelectedPatient(patient);
            
            const patientDisplayValue = `${patient.last_name}, ${patient.first_name} - CI: ${patient.document_id}`;

            const weightUnitValue = appointmentData.weight_unit || 'kg';
            setWeightUnit(weightUnitValue);

            const formData: Partial<FormValues> = {
              searchPatient: patientDisplayValue,
              nombres: patient.first_name || '',
              apellidos: patient.last_name || '',
              cedula: patient.document_id || '',
              fecha: appointmentData.appointment_date ? dayjs(appointmentData.appointment_date) : undefined,
              hora: appointmentData.appointment_time ? dayjs(appointmentData.appointment_time, 'HH:mm:ss') : undefined,
              temperatura: appointmentData.temperature || '',
              presionArterial: appointmentData.blood_pressure || '',
              frecuenciaCardiaca: appointmentData.heart_rate || '',
              saturacionO2: appointmentData.oxygen_saturation || '',
              peso: appointmentData.weight ? appointmentData.weight.toString() : '',
              pesoUnidad: weightUnitValue,
              talla: appointmentData.height ? Math.round(parseFloat(appointmentData.height) * 100).toString() : ''
            };
            
            const originalDataObj: OriginalData = {
              formData,
              patient,
              appointment: appointmentData,
              assignedDoctor: appointmentData.user
            };
            
            setOriginalData(originalDataObj);
            
            form.setFieldsValue(formData);
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
        cedula: patient.document_id
      });
      
      message.success('Paciente seleccionado correctamente.');
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
        return /^\d{1,6}(\.\d{1,2})?$/;
      default:
        return /^\d{1,3}(\.\d{1,2})?$/;
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

    setLoading(true);
    try {
      let heightInMeters = '';
      if (values.talla) {
        const heightInCm = parseFloat(values.talla);
        if (isNaN(heightInCm) || heightInCm <= 0) {
          message.error('Talla debe ser un número válido');
          setLoading(false);
          return;
        }
        heightInMeters = (heightInCm / 100).toString();
      }

      const weightValue = parseFloat(values.peso);
      if (isNaN(weightValue) || weightValue <= 0) {
        message.error('El peso debe ser un número válido');
        setLoading(false);
        return;
      }

      const appointmentData: AppointmentUpdateData = {
        patient_id: selectedPatient.id!,
        appointment_date: values.fecha.format('YYYY-MM-DD'),
        appointment_time: values.hora.format('HH:mm:ss'),
        temperature: values.temperatura,
        blood_pressure: values.presionArterial,
        heart_rate: values.frecuenciaCardiaca,
        oxygen_saturation: values.saturacionO2,
        weight: weightValue,
        weight_unit: values.pesoUnidad,
        height: heightInMeters
      };

      console.log('Datos de la cita a actualizar:', appointmentData);
      
      const response: APIResponse = await AppointmentService.updateAppointment(id, appointmentData);
      
      if (response.success) {
        message.success('Cita médica actualizada exitosamente');
        navigate('/appointmentList');
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
    navigate('/appointmentList');
  };

  const handleCancel = (): void => {
    navigate('/appointmentList');
  };

  const handleClear = (): void => {
    if (originalData) {
      form.setFieldsValue(originalData.formData);
      setSelectedPatient(originalData.patient);
      setAssignedDoctor(originalData.assignedDoctor || null);
      setSearchValue(originalData.formData.searchPatient || '');
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
                <Card title={<><UserOutlined /> Información del Paciente y Médico</>} style={{ marginBottom: '24px' }}>
                  <Row gutter={[24, 16]} style={{ marginBottom: '20px' }}>
                    <Col xs={24} lg={12}>
                      <Form.Item
                        label="Buscar Paciente"
                        name="searchPatient"
                        rules={[{ required: true, message: 'Debe seleccionar un paciente' }]}
                        extra="Busque por apellidos, nombres o número de cédula"
                        style={{ marginBottom: selectedPatient ? '8px' : '24px' }}
                      >
                        <AutoComplete
                          value={searchValue}
                          options={patientOptions}
                          onSearch={onPatientSearch}
                          onSelect={onPatientSelect}
                          placeholder="Escriba apellidos, nombres o cédula..."
                          size="large"
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
                              cedula: ''
                            });
                          }}
                        />
                      </Form.Item>
                      {selectedPatient && (
                        <div style={{ 
                          marginBottom: '16px',
                          padding: '12px', 
                          background: '#f6ffed', 
                          border: '1px solid #b7eb8f',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 500
                        }}>
                          <div style={{ color: '#52c41a', marginBottom: '4px' }}>
                            ✓ Paciente seleccionado
                          </div>
                          <div style={{ color: '#389e0d' }}>
                            {selectedPatient.first_name} {selectedPatient.last_name}
                          </div>
                          <div style={{ color: '#73d13d', fontSize: '12px' }}>
                            CI: {selectedPatient.document_id}
                          </div>
                        </div>
                      )}
                    </Col>

                    <Col xs={24} lg={12}>
                      <Form.Item
                        label="Médico Responsable"
                        extra="Médico asignado a esta cita (no editable)"
                      >
                        <Input
                          disabled
                          size="large"
                          value={assignedDoctor ? `Dr. ${assignedDoctor.first_name} ${assignedDoctor.last_name}` : 'No asignado'}
                          prefix={<MedicineBoxOutlined style={{ color: '#52c41a' }} />}
                          style={{ backgroundColor: '#f0f0f0', fontWeight: 500 }}
                        />
                      </Form.Item>
                      {assignedDoctor && (
                        <div style={{ 
                          marginBottom: '16px',
                          padding: '12px', 
                          background: '#e6f7ff', 
                          border: '1px solid #91d5ff',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 500
                        }}>
                          <div style={{ color: '#1890ff', marginBottom: '4px' }}>
                            👨‍⚕️ Médico asignado
                          </div>
                          <div style={{ color: '#096dd9' }}>
                            Dr. {assignedDoctor.first_name} {assignedDoctor.last_name}
                          </div>
                          <div style={{ color: '#40a9ff', fontSize: '12px' }}>
                            {assignedDoctor.email}
                          </div>
                        </div>
                      )}
                    </Col>
                  </Row>

                  <Divider style={{ margin: '20px 0' }} />

                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item label="Nombres" name="nombres">
                        <Input disabled placeholder="Nombres del paciente" style={{ backgroundColor: '#f9f9f9' }} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item label="Apellidos" name="apellidos">
                        <Input disabled placeholder="Apellidos del paciente" style={{ backgroundColor: '#f9f9f9' }} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item label="Cédula" name="cedula">
                        <Input disabled placeholder="Cédula del paciente" style={{ backgroundColor: '#f9f9f9' }} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={[16, 16]} style={{ marginTop: '8px' }}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Fecha de Cita"
                        name="fecha"
                        rules={[{ required: true, message: 'Ingrese la fecha de la cita' }]}
                      >
                        <DatePicker 
                          style={{ width: '100%' }}
                          placeholder="Seleccionar fecha"
                          format="DD/MM/YYYY"
                          size="large"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Hora de Cita"
                        name="hora"
                        rules={[{ required: true, message: 'Ingrese la hora de la cita' }]}
                      >
                        <TimePicker 
                          style={{ width: '100%' }}
                          format="HH:mm"
                          placeholder="Seleccionar hora"
                          size="large"
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