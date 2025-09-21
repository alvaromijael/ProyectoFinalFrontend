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
  Tooltip
} from 'antd';
import {
  UserOutlined,
  HeartFilled,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  MailOutlined,
  HomeOutlined
} from '@ant-design/icons';

import { useNavigate } from "react-router-dom";
import PatientService from '../../services/PatientService';
import { calculateAge } from '../patient/utils';

interface Patient {
  id?: number;
  first_name: string;
  last_name: string;
  document_id?: string;
  birth_date?: string;
  age?: number;
  gender: string;
  marital_status?: string;
  occupation?: string;
  education?: string;
  origin?: string;
  province?: string;
  city?: string;
  neighborhood?: string;
  street?: string;
  house_number?: string;
  contacts?: Array<{
    first_name: string;
    last_name: string;
    phone: string;
    email?: string;
    relationship_type: string;
  }>;
  medical_history?: string;
  notes?: string;
}

const { Title, Text } = Typography;
const { Content } = Layout;

export default function PatientManageList() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [displayedPatients, setDisplayedPatients] = useState<Patient[]>([]);
  const [searchText, setSearchText] = useState('');
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    setTableLoading(true);
    try {
      const response = await PatientService.getPatients({ limit: 1000 });
      if (response.success) {
        setPatients(response.data as Patient[]);
        setDisplayedPatients(response.data as Patient[]);
        message.success(response.message);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error('Error al cargar los pacientes');
      console.error('Error:', error);
    } finally {
      setTableLoading(false);
    }
  };


  // Función de búsqueda con validación de mínimo 3 caracteres
  const handleSearch = async (value: string) => {
    setSearchText(value);
    
    const trimmedValue = value.trim();
    
    if (trimmedValue.length >= 3) {  // Vuelve a 3 caracteres
      setSearchLoading(true);
      setTableLoading(true);
      try {
        console.log('🔍 Buscando:', trimmedValue); // Debug
        
        // Usar el servicio de búsqueda del backend
        const response = await PatientService.searchPatients(trimmedValue);
        
        console.log('📊 Respuesta del backend:', response); // Debug
        
        if (response.success) {
          // Debug: mostrar qué pacientes coinciden y por qué campo
          response.data.forEach(patient => {
            const searchTerm = trimmedValue.toLowerCase();
            const firstName = (patient.first_name || '').toLowerCase();
            const lastName = (patient.last_name || '').toLowerCase();
            const documentId = (patient.document_id || '').toLowerCase();
            
            let matchedField = '';
            if (firstName.includes(searchTerm)) matchedField += 'nombre ';
            if (lastName.includes(searchTerm)) matchedField += 'apellido ';
            if (documentId.includes(searchTerm)) matchedField += 'cédula ';
            
            console.log(`✅ ${patient.last_name}, ${patient.first_name} (${patient.document_id}) - Coincide en: ${matchedField || 'CAMPO DESCONOCIDO'}`);
          });
          
          setDisplayedPatients(response.data as Patient[]);
          
          if (response.data.length === 0) {
            message.info('No se encontraron pacientes que coincidan con la búsqueda');
          }
        } else {
          message.error(response.message);
          setDisplayedPatients(patients);
        }
      }  catch (error) {
          console.error('❌ Error completo:', error);      
        setDisplayedPatients(patients);
      } finally {
        setSearchLoading(false);
        setTableLoading(false);
      }
    } else if (trimmedValue.length === 0) {
      setDisplayedPatients(patients);
    } else {
      const localFiltered = patients.filter(patient => {
        const searchTerm = trimmedValue.toLowerCase();
        const firstName = (patient.first_name || '').toLowerCase();
        const lastName = (patient.last_name || '').toLowerCase();
        const documentId = (patient.document_id || '').toLowerCase();
        
        return firstName.includes(searchTerm) || 
               lastName.includes(searchTerm) || 
               documentId.includes(searchTerm);
      });
      
      setDisplayedPatients(localFiltered);
    }
  };

  const clearSearch = () => {
    setSearchText('');
    setDisplayedPatients(patients);
  };

  const handleEdit = (patient: Patient) => {
    navigate(`/patientManageEdit/${patient.id}`);
  };

  const handleDelete = async (patientId: number) => {
    setLoading(true);
    try {
      const response = await PatientService.deletePatient(patientId);
      if (response.success) {
        message.success(response.message);
        await loadPatients();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error('Error al eliminar el paciente');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const showPatientDetail = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsDetailModalVisible(true);
  };


 
  const columns = [
    {
      title: 'Paciente',
      key: 'patient',
      width: 250,
      render: (_: unknown, record: Patient) => (
        <Space>
          <Avatar 
            style={{ backgroundColor: record.gender === 'F' ? '#f56a00' : '#1890ff' }}
            icon={<UserOutlined />}
          />
          <div>
            <div style={{ fontWeight: 'bold' }}>
              {record.last_name}, {record.first_name}
            </div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              CI: {record.document_id || 'N/A'}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Información Personal',
      key: 'personal',
      width: 180,
      render: (_: unknown, record: Patient) => (
        <Space direction="vertical" size="small">
          <Text>
            {record.birth_date ? calculateAge(record.birth_date): 'N/A'} - 
            {record.gender === 'M' ? ' Masculino' : record.gender === 'F' ? ' Femenino' : ' N/A'}
          </Text>
          {record.birth_date && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              <CalendarOutlined /> {new Date(record.birth_date).toLocaleDateString()}
            </Text>
          )}
          {record.marital_status && (
            <Tag color={record.gender === 'M' ? 'blue' : 'pink'}>
              {record.marital_status}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Ubicación',
      key: 'location',
      width: 180,
      render: (_: unknown, record: Patient) => (
        <Space direction="vertical" size="small">
          <Text>
            <EnvironmentOutlined /> {record.province || 'N/A'}
          </Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.city || 'N/A'}
          </Text>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            <HomeOutlined /> {record.neighborhood || 'N/A'}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Educación/Procedencia',
      key: 'education',
      width: 150,
      render: (_: unknown, record: Patient) => (
        <Space direction="vertical" size="small">
          {record.education && <Tag color="green">{record.education}</Tag>}
          {record.origin && <Tag color="orange">{record.origin}</Tag>}
        </Space>
      ),
    },
    {
      title: 'Contactos',
      key: 'contactos',
      width: 100,
      align: 'center' as const,
      render: (_: unknown, record: Patient) => (
        <Tag color="purple">
          <PhoneOutlined /> {record.contacts?.length || 0}
        </Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 180,
      fixed: 'right' as const,
      render: (_: unknown, record: Patient) => (
        <Space size="small">
          <Tooltip title="Ver detalles">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => showPatientDetail(record)}
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
            title="¿Está seguro de eliminar este paciente?"
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
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5',  maxWidth: '87%'}}>
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
                  Lista de Pacientes
                </Text>
              </Col>
              <Col>
                <Space>
                  <Avatar
                    size={64}
                    style={{ backgroundColor: '#722ed1' }}
                    icon={<HeartFilled />}
                  />
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Barra de búsqueda simplificada */}
          <Card style={{ marginBottom: '24px' }}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} md={16} lg={18}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Tooltip title="Busca por nombres, apellidos o número de cédula (mínimo 3 caracteres para búsqueda en servidor)">
                    <Input
                      placeholder="Buscar por nombre, apellido o cédula (min. 3 caracteres)..."
                      prefix={<SearchOutlined />}
                      value={searchText}
                      onChange={(e) => handleSearch(e.target.value)}
                      onLoad={() => searchLoading}
                      size="large"
                      allowClear
                      onClear={clearSearch}
                    />
                  </Tooltip>
                  <Space direction="vertical" size="small" style={{ width: '100%', marginTop: '4px' }}>
                    {searchText && searchText.trim().length > 0 && searchText.trim().length < 3 && (
                      <Text type="warning" style={{ fontSize: '12px' }}>
                        ⚠️ Búsqueda local (escriba 3+ caracteres para búsqueda completa en servidor)
                      </Text>
                    )}
                    {searchText && searchText.trim().length >= 3 && (
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        🔍 Buscando en servidor: nombres, apellidos y cédulas
                      </Text>
                    )}
                  </Space>
                </Space>
              </Col>
              <Col xs={24} md={8} lg={6}>
                <Space>
                  {searchText && (
                    <Button onClick={clearSearch} size="large">
                      Limpiar Búsqueda
                    </Button>
                  )}
                  <Text type="secondary">
                    {displayedPatients.length} de {patients.length} pacientes
                    {searchText && searchText.trim().length >= 3 && ` (búsqueda en servidor: "${searchText}")`}
                    {searchText && searchText.trim().length > 0 && searchText.trim().length < 3 && ` (filtrado local: "${searchText}")`}
                  </Text>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Tabla */}
          <Card>
            <Table
              columns={columns}
              dataSource={displayedPatients}
              rowKey="id"
              loading={tableLoading}
              scroll={{ x: 1400 }}
              pagination={{
                total: displayedPatients.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} de ${total} pacientes`,
              }}
              size="middle"
            />
          </Card>

          {/* Modal de Detalles */}
          <Modal
            title={
              <Space>
                <UserOutlined style={{ color: '#1890ff' }} />
                Detalles del Paciente
              </Space>
            }
            open={isDetailModalVisible}
            onCancel={() => setIsDetailModalVisible(false)}
            width={900}
            footer={[
              <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
                Cerrar
              </Button>,
              <Button
                key="edit"
                type="primary"
                icon={<EditOutlined />}
                onClick={() => {
                  if (selectedPatient) {
                    handleEdit(selectedPatient);
                    setIsDetailModalVisible(false);
                  }
                }}
              >
                Editar Paciente
              </Button>,
            ]}
          >
            {selectedPatient && (
              <div>
                <Row gutter={[24, 16]}>
                  <Col xs={24} sm={12}>
                    <Card size="small" title="Información Personal">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text><strong>Nombres:</strong> {selectedPatient.first_name || 'N/A'}</Text>
                        <Text><strong>Apellidos:</strong> {selectedPatient.last_name || 'N/A'}</Text>
                        <Text><strong>Cédula:</strong> {selectedPatient.document_id || 'N/A'}</Text>
                        <Text><strong>Fecha de Nacimiento:</strong> {selectedPatient.birth_date || 'N/A'}</Text>
                        <Text><strong>Edad:</strong> {calculateAge(selectedPatient.birth_date || '')}</Text>
                        <Text><strong>Sexo:</strong> {selectedPatient.gender === 'M' ? 'Masculino' : selectedPatient.gender === 'F' ? 'Femenino' : 'N/A'}</Text>
                        <Text><strong>Estado Civil:</strong> {selectedPatient.marital_status || 'N/A'}</Text>
                        <Text><strong>Ocupación:</strong> {selectedPatient.occupation || 'N/A'}</Text>
                        <Text><strong>Instrucción:</strong> {selectedPatient.education || 'N/A'}</Text>
                        <Text><strong>Procedencia:</strong> {selectedPatient.origin || 'N/A'}</Text>
                      </Space>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Card size="small" title="Dirección">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text><strong>Provincia:</strong> {selectedPatient.province || 'N/A'}</Text>
                        <Text><strong>Ciudad:</strong> {selectedPatient.city || 'N/A'}</Text>
                        <Text><strong>Sector/Barrio:</strong> {selectedPatient.neighborhood || 'N/A'}</Text>
                        <Text><strong>Calle:</strong> {selectedPatient.street || 'N/A'}</Text>
                        <Text><strong>Número de Casa:</strong> {selectedPatient.house_number || 'N/A'}</Text>
                      </Space>
                    </Card>
                  </Col>
                  <Col xs={24}>
                    <Card size="small" title={`Contactos de Emergencia (${selectedPatient.contacts?.length || 0})`}>
                      {selectedPatient.contacts && selectedPatient.contacts.length > 0 ? (
                        selectedPatient.contacts.map((contact, index) => (
                          <div key={index} style={{ marginBottom: '12px', padding: '12px', background: '#f5f5f5', borderRadius: '6px' }}>
                            <Text><strong>{contact.first_name} {contact.last_name}</strong></Text>
                            <br />
                            <Space direction="vertical" size="small" style={{ marginTop: '4px' }}>
                              <Text type="secondary">
                                <PhoneOutlined /> {contact.phone}
                              </Text>
                              {contact.email && (
                                <Text type="secondary">
                                  <MailOutlined /> {contact.email}
                                </Text>
                              )}
                              <Text type="secondary">
                                <strong>Relación:</strong> {contact.relationship_type}
                              </Text>
                            </Space>
                          </div>
                        ))
                      ) : (
                        <Text type="secondary">No hay contactos registrados</Text>
                      )}
                    </Card>
                  </Col>
                </Row>
                {selectedPatient.medical_history && (
                  <Row style={{ marginTop: '16px' }}>
                    <Col xs={24}>
                      <Card size="small" title="Historia Médica">
                        <Text>{selectedPatient.medical_history}</Text>
                      </Card>
                    </Col>
                  </Row>
                )}
                {selectedPatient.notes && (
                  <Row style={{ marginTop: '16px' }}>
                    <Col xs={24}>
                      <Card size="small" title="Notas">
                        <Text>{selectedPatient.notes}</Text>
                      </Card>
                    </Col>
                  </Row>
                )}
              </div>
            )}
          </Modal>
        </div>
      </Content>
    </Layout>
  );
}