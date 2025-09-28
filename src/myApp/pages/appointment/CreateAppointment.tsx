import { useState, useEffect, useCallback, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
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
  PlusOutlined,
  SearchOutlined,
  
} from '@ant-design/icons';
import dayjs from 'dayjs';

import PatientService from '../../services/PatientService';
import AppointmentService, { type User } from '../../services/AppointmentService';

const { Title, Text } = Typography;
const { Content } = Layout;
const { Option } = Select;

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

interface Patient {
  id?: number;
  first_name?: string;
  last_name?: string;
  document_id?: string;
  medical_history?: string;
}

const WEIGHT_UNITS = [
  { value: 'kg', label: 'Kilogramos (kg)', suffix: 'kg' },
  { value: 'lb', label: 'Libras (lb)', suffix: 'lb' },
  { value: 'g', label: 'Gramos (g)', suffix: 'g' }
];

export default function AppointmentCreate(): JSX.Element {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [patientOptions, setPatientOptions] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [weightUnit, setWeightUnit] = useState<string>('kg');

  const debouncedSearchValue = useDebounce(searchValue, 500);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const response = await AppointmentService.getUsers();
      if (response.success && response.data) {
        setUsers(response.data);
      } else {
        message.error('Error al cargar la lista de médicos');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      message.error('Error al cargar los médicos');
    } finally {
      setUsersLoading(false);
    }
  }, [form]);

  const searchPatients = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setPatientOptions([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await PatientService.searchPatients(query, { limit: 50 });
      if (response.success && response.data) {
        const options = response.data.map((patient: Patient) => ({
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
    // Cargar usuarios al montar el componente
    loadUsers();
    
    // Establecer valores por defecto del formulario
    const now = dayjs();
    form.setFieldsValue({
      fecha: now,
      hora: now,
      temperatura: '36.5',
      presionArterial: '120/80',
      frecuenciaCardiaca: '78',
      saturacionO2: '98',
      peso: '',
      pesoUnidad: 'kg',
      talla: ''
    });
  }, [form, loadUsers]);

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
        nombres: patient.first_name || '',
        apellidos: patient.last_name || '',
        cedula: patient.document_id || ''
      });
      
      message.success('Paciente seleccionado correctamente.');
    }
  };

  const onUserSelect = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      form.setFieldsValue({ user_id: userId });
    }
  };

  const onWeightUnitChange = (value: string) => {
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

  const onFinish = async (values: any) => {
    if (!selectedPatient || !selectedPatient.id) {
      message.error('Debe seleccionar un paciente válido');
      return;
    }

    if (!values.user_id) {
      message.error('Debe seleccionar un médico');
      return;
    }

    if (!values.fecha || !values.hora) {
      message.error('Fecha y hora son obligatorias');
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

      const weightValidation = AppointmentService.validateWeight(weightValue, values.pesoUnidad);
      if (!weightValidation.isValid) {
        message.error(weightValidation.message);
        setLoading(false);
        return;
      }

      const appointmentData = {
        patient_id: selectedPatient.id,
        user_id: values.user_id,
        appointment_date: values.fecha.format('YYYY-MM-DD'),
        appointment_time: values.hora.format('HH:mm:ss'),
        temperature: values.temperatura || '',
        blood_pressure: values.presionArterial || '',
        heart_rate: values.frecuenciaCardiaca || '',
        oxygen_saturation: values.saturacionO2 || '',
        weight: weightValue,
        weight_unit: values.pesoUnidad,
        height: heightInMeters
      };

      console.log('Datos a enviar:', appointmentData);
      
      const response = await AppointmentService.createAppointment(appointmentData);
      
      if (response.success) {
        message.success('Cita médica creada exitosamente');
        navigate('/appointmentList');
      } else {
        message.error(response.message || 'Error al crear la cita médica');
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      message.error('Error inesperado al crear la cita médica');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    navigate('/appointmentList');
  };

  const handleCancel = () => {
    navigate('/appointmentList');
  };

  const handleClear = () => {
    form.resetFields();
    setSelectedPatient(null);
    setSelectedUser(null);
    setSearchValue('');
    setPatientOptions([]);
    setWeightUnit('kg');
    
    const now = dayjs();
    form.setFieldsValue({
      fecha: now,
      hora: now,
      temperatura: '36.5',
      presionArterial: '120/80',
      frecuenciaCardiaca: '78',
      saturacionO2: '98',
      pesoUnidad: 'kg'
    });
    
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
                  icon={<PlusOutlined />}
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
              {/* Información del Paciente y Médico */}
              <Col xs={24}>
                <Card title={<><UserOutlined /> Información del Paciente y Médico</>} style={{ marginBottom: '24px' }}>
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
                              cedula: ''
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
                    
                    <Col xs={24} lg={12}>
                      <Form.Item
                        label="Médico Responsable"
                        name="user_id"
                        rules={[{ required: true, message: 'Debe seleccionar un médico' }]}
                        extra="Seleccione el médico que atenderá la cita"
                        style={{ marginBottom: selectedUser ? '8px' : '24px' }}
                      >
                        <Select
                          placeholder="Seleccionar médico"
                          loading={usersLoading}
                          onChange={onUserSelect}
                          showSearch
                          size="large"
                          allowClear
                          filterOption={(input, option) => {
                            const user = users.find(u => u.id === option?.value);
                            if (!user) return false;
                            const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
                            return fullName.includes(input.toLowerCase());
                          }}
                          notFoundContent={usersLoading ? <Spin size="small" /> : 'No hay médicos disponibles'}
                        >
                          {users.filter(user => user.is_active).map(user => (
                            <Option key={user.id} value={user.id}>
                              Dr. {user.first_name} {user.last_name}
                            </Option>
                          ))}
                        </Select>
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

              {/* Botones de Acción */}
              <Col xs={24}>
                <Card>
                  <Row justify="end" gutter={[16, 16]}>
                    <Col>
                      <Button 
                        size="large"
                        onClick={handleClear}
                        disabled={loading}
                      >
                        Limpiar
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
                        disabled={!selectedPatient || !selectedUser}
                      >
                        Crear Cita
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