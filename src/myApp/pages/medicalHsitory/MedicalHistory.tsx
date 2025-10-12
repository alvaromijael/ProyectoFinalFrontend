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
  message,
  Tooltip,
  Modal
} from 'antd';
import {
  UserOutlined,
  HeartFilled,
  SearchOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  HomeOutlined,
  FileTextOutlined,
  DownloadOutlined
} from '@ant-design/icons';

import PatientService from '../../services/PatientService';
import { calculateAge } from '../patient/utils';

import type { Patient } from '../../interfaces/Patient';

const { Title, Text } = Typography;
const { Content } = Layout;

export default function MedicalHistory() {

  const [patients, setPatients] = useState<Patient[]>([]);
  const [displayedPatients, setDisplayedPatients] = useState<Patient[]>([]);
  const [searchText, setSearchText] = useState('');
  const [tableLoading, setTableLoading] = useState(false);
  const [generatingPdfId, setGeneratingPdfId] = useState<number | null>(null);
  const [pdfModalVisible, setPdfModalVisible] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string>('');
  const [currentPdfFilename, setCurrentPdfFilename] = useState<string>('');

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

  const handleSearch = async (value: string) => {
    setSearchText(value);
    
    const trimmedValue = value.trim();
    
    if (trimmedValue.length >= 3) {  
      setTableLoading(true);
      try {
        const response = await PatientService.searchPatients(trimmedValue);
        
        if (response.success) {
          setDisplayedPatients(response.data as Patient[]);
          
          if (response.data.length === 0) {
            message.info('No se encontraron pacientes que coincidan con la búsqueda');
          }
        } else {
          message.error(response.message);
          setDisplayedPatients(patients);
        }
      } catch (error) {
        console.error('Error:', error);      
        setDisplayedPatients(patients);
      } finally {
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

  const handleGenerateMedicalHistory = async (patientId: number) => {
    setGeneratingPdfId(patientId);
    try {
      const response = await PatientService.generateMedicalHistory(patientId);
      
      if (response.success && response.data) {
        message.success('Historial médico generado exitosamente');
        
        const byteCharacters = atob(response.data.pdf_base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        
        setCurrentPdfUrl(url);
        setCurrentPdfFilename(response.data.filename);
        setPdfModalVisible(true);
      } else {
        message.error(response.message || 'Error al generar el historial médico');
      }
    } catch (error) {
      message.error('Error al generar el historial médico');
      console.error('Error:', error);
    } finally {
      setGeneratingPdfId(null);
    }
  };

  const handleDownloadPdf = () => {
    const link = document.createElement('a');
    link.href = currentPdfUrl;
    link.download = currentPdfFilename;
    link.click();
    message.success('Descargando historial médico...');
  };

  const handleClosePdfModal = () => {
    if (currentPdfUrl) {
      window.URL.revokeObjectURL(currentPdfUrl);
    }
    setPdfModalVisible(false);
    setCurrentPdfUrl('');
    setCurrentPdfFilename('');
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
      width: 150,
      fixed: 'right' as const,
      render: (_: unknown, record: Patient) => (
        <Tooltip title="Generar Historial Médico">
          <Button
            type="primary"
            icon={<FileTextOutlined />}
            onClick={() => record.id && handleGenerateMedicalHistory(record.id)}
            loading={generatingPdfId === record.id}
            size="small"
          >
            Historial
          </Button>
        </Tooltip>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5', maxWidth: '87%'}}>
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
                  Historial Médico de Pacientes
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

          {/* Barra de búsqueda */}
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

          {/* Modal para visualizar PDF */}
          <Modal
            title={
              <Space>
                <FileTextOutlined style={{ color: '#1890ff' }} />
                Historial Médico - {currentPdfFilename}
              </Space>
            }
            open={pdfModalVisible}
            onCancel={handleClosePdfModal}
            width="90%"
            style={{ top: 20 }}
            footer={[
              <Button key="close" onClick={handleClosePdfModal}>
                Cerrar
              </Button>,
              <Button
                key="download"
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleDownloadPdf}
              >
                Descargar PDF
              </Button>,
            ]}
          >
            <div style={{ height: '75vh' }}>
              {currentPdfUrl && (
                <iframe
                  src={currentPdfUrl}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                  }}
                  title="Historial Médico PDF"
                />
              )}
            </div>
          </Modal>
        </div>
      </Content>
    </Layout>
  );
}