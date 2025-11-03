import { useState, useEffect, useCallback } from 'react';
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
  Select,
  Checkbox
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
import dayjs from 'dayjs';

import PatientService from '../../services/PatientService';
import AppointmentService from '../../services/AppointmentService';
import { contactService } from '../../services/ContactService';
import type { Patient } from '../../interfaces/Patient';
import type { Recipe } from '../../interfaces/Recipe';
import type { Appointment } from '../../interfaces/Appointment';
import type { UserData as User } from '../../interfaces/UserData';
import type { Contact } from '../../interfaces/Contact';
import RecipeTable from '../../components/RecipeTable';
import DiagnosisTable from '../../components/DiagnosisTable';

const { Title, Text } = Typography;
const { Content } = Layout;
const { TextArea } = Input;
const { Option } = Select;

import type {
  Diagnosis,
  AppointmentDiagnosis,
  APIRecipe,
  AppointmentUpdateData
} from '../../interfaces/Appointment';

interface PatientOption {
  value: string;
  label: React.ReactNode;
  patient: Patient;
}

interface FormValues {
  searchPatient: string;
  nombres: string;
  apellidos: string;
  cedula: string;
  fecha: dayjs.Dayjs;
  hora: dayjs.Dayjs;
  antecedentes: string;
  enfermedadActual: string;
  temperatura: string;
  presionArterial: string;
  frecuenciaCardiaca: string;
  saturacionO2: string;
  peso: string;
  pesoUnidad: string;
  talla: string;
  medical_preinscription?: string;
  examenFisico: string;
  observaciones: string;
  examenes?: string;
  reposo_desde?: dayjs.Dayjs;
  reposo_hasta?: dayjs.Dayjs;
  contingency_type?: string;
  has_representative?: boolean;
  representative_id?: number;
}

interface APIResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

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

const WEIGHT_UNITS = [
  { value: 'kg', label: 'Kilogramos (kg)', suffix: 'kg' },
  { value: 'lb', label: 'Libras (lb)', suffix: 'lb' },
  { value: 'g', label: 'Gramos (g)', suffix: 'g' }
];

import type { FC } from 'react';

const AppointmentManageEdit: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm<FormValues>();
  
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchValue, setSearchValue] = useState<string>('');
  const [patientOptions, setPatientOptions] = useState<PatientOption[]>([]);
  const [recipes, setRecipes] = useState<APIRecipe[]>([]);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [weightUnit, setWeightUnit] = useState<string>('kg');
  const [assignedDoctor, setAssignedDoctor] = useState<User | null>(null);

  const [isRepresentative, setIsRepresentative] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [selectedContact, setSelectedContact] = useState<number | null>(null);

  const debouncedSearchValue = useDebounce(searchValue, 500);

  const loadPatientContacts = useCallback(async (patientId: number) => {
    setContactsLoading(true);
    try {
      const contactsData = await contactService.getContactsByPatientId(patientId);
      setContacts(contactsData);
      
      if (contactsData.length === 0) {
        message.info('Este paciente no tiene contactos registrados');
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      message.error('Error al cargar los contactos del paciente');
      setContacts([]);
    } finally {
      setContactsLoading(false);
    }
  }, []);

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

  const convertDiagnosesToTable = (apiDiagnoses: AppointmentDiagnosis[]): Diagnosis[] => {
    console.log('Converting API diagnoses to table format:', apiDiagnoses);
    return apiDiagnoses.map((diag: AppointmentDiagnosis, index: number) => ({
      key: `diagnosis-${index}-${Date.now()}`,
      diagnosis_code: diag.diagnosis_code,
      diagnosis_description: diag.diagnosis_description,
      diagnosis_type: diag.diagnosis_type,
      diagnosis_observations: diag.diagnosis_observations || ''
    }));
  };

  const buildDiagnosesForAPI = (diagnosesTable: Diagnosis[]): AppointmentUpdateData['diagnoses'] => {
    return diagnosesTable
      .filter((diag: Diagnosis) => diag.diagnosis_code && diag.diagnosis_description)
      .map((diag: Diagnosis) => ({
        diagnosis_code: diag.diagnosis_code,
        diagnosis_description: diag.diagnosis_description,
        diagnosis_type: diag.diagnosis_type,
        diagnosis_observations: diag.diagnosis_observations
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
        console.log("AppointmenData", appointmentData)

        if (appointmentData.user) {
          setAssignedDoctor(appointmentData.user);
        }

        if (appointmentData.patient_id) {
          const patientResponse: APIResponse<Patient> = await PatientService.getPatientById(appointmentData.patient_id);
          if (patientResponse.success) {
            const patient = patientResponse.data;
            setSelectedPatient(patient);
            
            if (patient.id)
              await loadPatientContacts(patient.id);
            
            const patientDisplayValue = `${patient.last_name}, ${patient.first_name} - CI: ${patient.document_id}`;
            
            const tableDiagnoses = (appointmentData as any).diagnoses 
              ? convertDiagnosesToTable((appointmentData as any).diagnoses)
              : [];

            console.log("Tabla de dioagnsoticos", tableDiagnoses)
            
            setDiagnoses(tableDiagnoses);

            const weightUnitValue = appointmentData.weight_unit || 'kg';
            setWeightUnit(weightUnitValue);

            const hasRep = appointmentData.has_representative || false;
            const repId = appointmentData.representative_id || null;
            setIsRepresentative(hasRep);
            setSelectedContact(repId);

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
              medical_preinscription: (appointmentData as any).medical_preinscription || '',
              examenFisico: appointmentData.physical_examination || '',
              observaciones: appointmentData.observations || '',
              examenes: appointmentData.laboratory_tests || '',
              reposo_desde: appointmentData.rest_from ? dayjs(appointmentData.rest_from) : undefined,
              reposo_hasta: appointmentData.rest_to ? dayjs(appointmentData.rest_to) : undefined,
              contingency_type: (appointmentData as any).contingency_type || undefined,
              has_representative: hasRep,
              representative_id: repId ?? undefined
            };

            // ✅ SECCIÓN CORREGIDA - CARGA DE RECETAS
            let processedRecipes: Recipe[] = [];
            if (appointmentData.recipes && Array.isArray(appointmentData.recipes) && appointmentData.recipes.length > 0) {
              processedRecipes = appointmentData.recipes
                .filter((recipe: APIRecipe) => recipe && (recipe.medicine || recipe.amount || recipe.instructions || recipe.observations))
                .map((recipe: APIRecipe, index: number) => ({
                  key: `recipe-${index}-${Date.now()}`,
                  medicine: recipe.medicine ? recipe.medicine.trim() : '',
                  amount: recipe.amount ? recipe.amount.trim() : '',
                  instructions: recipe.instructions ? recipe.instructions.trim() : '',
                  lunchTime: (recipe as any).lunchTime 
                    ? (Array.isArray((recipe as any).lunchTime) 
                        ? (recipe as any).lunchTime 
                        : [(recipe as any).lunchTime]) // Convertir string a array si es necesario
                    : [], // Array vacío por defecto
                  observations: recipe.observations ? recipe.observations.trim() : ''
                }));
            }
            
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
      
      if (patient.id)
        loadPatientContacts(patient.id);
      
      message.success('Paciente seleccionado. Antecedentes cargados automáticamente.');
    }
  };

  const onRepresentativeChange = (checked: boolean) => {
    setIsRepresentative(checked);
    form.setFieldsValue({ has_representative: checked });
    
    if (!checked) {
      setSelectedContact(null);
      form.setFieldsValue({ representative_id: undefined });
    }
  };

  const onContactSelect = (contactId: number) => {
    setSelectedContact(contactId);
    form.setFieldsValue({ representative_id: contactId });
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

    if (isRepresentative && !selectedContact) {
      message.error('Debe seleccionar un contacto representante');
      return;
    }

    const validDiagnoses = diagnoses.filter((diag: Diagnosis) => diag.diagnosis_code && diag.diagnosis_description);
    if (validDiagnoses.length === 0) {
      message.error('Debe agregar al menos un diagnóstico válido');
      return;
    }

    setLoading(true);
    try {
      // ✅ SECCIÓN CORREGIDA - GUARDADO DE RECETAS
      const validRecipes = recipes.filter((recipe: Recipe) => 
        (recipe.medicine && recipe.medicine.trim()) || 
        (recipe.amount && recipe.amount.trim()) || 
        (recipe.instructions && recipe.instructions.trim()) ||
        ((recipe as any).lunchTime && Array.isArray((recipe as any).lunchTime) && (recipe as any).lunchTime.length > 0) || 
        (recipe.observations && recipe.observations.trim())
      ).map((recipe: Recipe) => ({
        medicine: recipe.medicine ? recipe.medicine.trim() : '',
        amount: recipe.amount ? recipe.amount.trim() : '',
        instructions: recipe.instructions ? recipe.instructions.trim() : '',
        lunchTime: (recipe as any).lunchTime || [], // Enviar el array completo
        observations: recipe.observations ? recipe.observations.trim() : ''
      }));

      const diagnosesArray = buildDiagnosesForAPI(diagnoses);

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
        medical_preinscription: values.medical_preinscription || '',
        contingency_type: values.contingency_type || undefined,
        has_representative: isRepresentative,
        representative_id: isRepresentative && selectedContact !== null ? selectedContact : undefined,
        diagnoses: diagnosesArray,
        recipes: validRecipes,
        rest_from: values.reposo_desde ? values.reposo_desde.format('YYYY-MM-DD') : undefined,
        rest_to: values.reposo_hasta ? values.reposo_hasta.format('YYYY-MM-DD') : undefined
      };

      console.log('Datos de la cita a actualizar:', appointmentData);
      
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
                            setContacts([]);
                            setIsRepresentative(false);
                            setSelectedContact(null);
                            form.setFieldsValue({
                              nombres: '',
                              apellidos: '',
                              cedula: '',
                              antecedentes: '',
                              has_representative: false,
                              representative_id: undefined
                            });
                          }}
                        />
                      </Form.Item>
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

                  <Divider style={{ margin: '12px 0' }} />

                  <Row gutter={[16, 16]}>
                    <Col xs={24}>
                      <Form.Item 
                        name="has_representative"
                        valuePropName="checked"
                        style={{ marginBottom: 4 }}
                      >
                        <Checkbox 
                          checked={isRepresentative}
                          onChange={(e) => onRepresentativeChange(e.target.checked)}
                          disabled={!selectedPatient || contacts.length === 0}
                          style={{ fontSize: '15px', fontWeight: 500 }}
                        >
                          ¿El paciente asiste con un representante?
                        </Checkbox>
                      </Form.Item>
                      
                      {!selectedPatient && (
                        <div style={{ 
                          marginLeft: '24px', 
                          marginBottom: '16px',
                          fontSize: '12px', 
                          color: '#8c8c8c'
                        }}>
                          Primero debe seleccionar un paciente
                        </div>
                      )}
                      
                      {selectedPatient && contacts.length === 0 && !contactsLoading && (
                        <div style={{ 
                          marginLeft: '24px',
                          marginBottom: '16px',
                          padding: '8px 12px',
                          background: '#fff7e6',
                          border: '1px solid #ffd591',
                          borderRadius: '6px',
                          fontSize: '12px',
                          color: '#d46b08'
                        }}>
                          ⚠️ Este paciente no tiene contactos registrados
                        </div>
                      )}

                      {contactsLoading && (
                        <div style={{ 
                          marginLeft: '24px',
                          marginBottom: '16px',
                          padding: '8px 12px',
                          background: '#f0f5ff',
                          border: '1px solid #adc6ff',
                          borderRadius: '6px',
                          fontSize: '12px',
                          color: '#2f54eb'
                        }}>
                          <Spin size="small" style={{ marginRight: '8px' }} />
                          Cargando contactos del paciente...
                        </div>
                      )}
                    </Col>

                    {isRepresentative && contacts.length > 0 && (
                      <Col xs={24} lg={12}>
                        <Form.Item
                          label="Seleccionar Representante"
                          name="representative_id"
                          rules={[
                            { 
                              required: isRepresentative, 
                              message: 'Debe seleccionar un representante' 
                            }
                          ]}
                          extra="Seleccione quién acompaña al paciente"
                        >
                          <Select
                            placeholder="Seleccionar contacto representante"
                            loading={contactsLoading}
                            onChange={onContactSelect}
                            showSearch
                            allowClear
                            size="large"
                            value={selectedContact}
                            filterOption={(input, option) => {
                              const contact = contacts.find(c => c.id === option?.value);
                              if (!contact) return false;
                              const fullName = `${contact.first_name} ${contact.last_name}`.toLowerCase();
                              const phone = contact.phone.toLowerCase();
                              const searchTerm = input.toLowerCase();
                              return fullName.includes(searchTerm) || phone.includes(searchTerm);
                            }}
                            notFoundContent={
                              contactsLoading ? (
                                <Spin size="small" />
                              ) : (
                                'No hay contactos disponibles'
                              )
                            }
                            optionLabelProp="label"
                          >
                            {contacts.map(contact => (
                              <Option 
                                key={contact.id} 
                                value={contact.id}
                                label={`${contact.first_name} ${contact.last_name}`}
                              >
                                <div style={{ padding: '4px 0' }}>
                                  <div style={{ 
                                    fontWeight: 600, 
                                    fontSize: '14px',
                                    color: '#262626',
                                    marginBottom: '4px'
                                  }}>
                                    {contact.first_name} {contact.last_name}
                                  </div>
                                  <div style={{ 
                                    fontSize: '12px', 
                                    color: '#8c8c8c',
                                    display: 'flex',
                                    gap: '12px',
                                    flexWrap: 'wrap'
                                  }}>
                                    {contact.relationship_type && (
                                      <span>
                                        <UserOutlined style={{ marginRight: '4px' }} />
                                        {contact.relationship_type}
                                      </span>
                                    )}
                                    <span>
                                      📞 {contact.phone}
                                    </span>
                                    {contact.document_id && (
                                      <span>
                                        🆔 CI: {contact.document_id}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                    )}
                  </Row>

                  {isRepresentative && contacts.length > 0 && (
                    <Divider style={{ margin: '12px 0' }} />
                  )}

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

              <Col xs={24}>
                <Card title={<><MedicineBoxOutlined /> Prescripción Médica</>} style={{ marginBottom: '24px' }}>
                  <Form.Item
                    label="Prescripción médica para hospitalización, cirugías u otros procedimientos"
                    name="medical_preinscription"
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

              <Col xs={24}>
                <DiagnosisTable 
                  diagnoses={diagnoses}
                  setDiagnoses={setDiagnoses}
                />
              </Col>

              <Col xs={24}>
                <RecipeTable 
                  recipes={recipes as any}
                  setRecipes={setRecipes as any}
                />
              </Col>

              <Col xs={24}>
                <Card title="Periodo de Reposo y Contingencia" style={{ marginBottom: '24px' }}>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={8}>
                      <Form.Item
                        label="Fecha Inicio Reposo"
                        name="reposo_desde"
                        rules={[
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              const hasta = getFieldValue('reposo_hasta');
                              if (!value || !hasta || !value.isAfter(hasta)) {
                                return Promise.resolve();
                              }
                              return Promise.reject('Debe ser anterior o igual a la fecha fin');
                            }
                          })
                        ]}
                      >
                        <DatePicker
                          style={{ width: '100%' }}
                          format="DD/MM/YYYY"
                          placeholder="Seleccione fecha"
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                      <Form.Item
                        label="Fecha Fin Reposo"
                        name="reposo_hasta"
                        dependencies={['reposo_desde']}
                        rules={[
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              const desde = getFieldValue('reposo_desde');
                              if (!value || !desde || !value.isBefore(desde)) {
                                return Promise.resolve();
                              }
                              return Promise.reject('Debe ser posterior o igual a la fecha inicio');
                            }
                          })
                        ]}
                      >
                        <DatePicker
                          style={{ width: '100%' }}
                          format="DD/MM/YYYY"
                          placeholder="Seleccione fecha"
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                      <Form.Item label="Días de Reposo" shouldUpdate>
                        {({ getFieldValue }) => {
                          const desde = getFieldValue('reposo_desde');
                          const hasta = getFieldValue('reposo_hasta');
                          const dias = desde && hasta && !hasta.isBefore(desde)
                            ? hasta.diff(desde, 'days') + 1 
                            : 0;
                          
                          return (
                            <Input
                              value={dias > 0 ? `${dias} día${dias > 1 ? 's' : ''}` : '-'}
                              disabled
                              style={{ color: dias > 0 ? '#52c41a' : undefined }}
                            />
                          );
                        }}
                      </Form.Item>
                    </Col>

                    <Col xs={24}>
                      <Form.Item
                        label="Tipo de Contingencia"
                        name="contingency_type"
                        extra="Seleccione el tipo de contingencia médica que aplica a este caso"
                      >
                        <Select
                          placeholder="Seleccione el tipo de contingencia"
                          size="large"
                          allowClear
                        >
                          <Option value="Enfermedad común / general">Enfermedad común / general</Option>
                          <Option value="Accidente común">Accidente común</Option>
                          <Option value="Accidente laboral">Accidente laboral</Option>
                          <Option value="Enfermedad profesional">Enfermedad profesional</Option>
                          <Option value="Maternidad / Paternidad">Maternidad / Paternidad</Option>
                          <Option value="Rehabilitación / Tratamiento continuo">Rehabilitación / Tratamiento continuo</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
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

export default AppointmentManageEdit;