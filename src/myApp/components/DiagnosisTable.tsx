import { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Table,
  Space,
  Row,
  Col,
  message,
  Popconfirm,
  Modal,
  Select,
  Tag
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons';
import dataCIE10 from '../../assets/dataCIE10.json';

const { TextArea } = Input;

export interface Diagnosis {
  key: string;
  diagnosis_code: string;
  diagnosis_description: string;
  diagnosis_type: 'primary' | 'secondary';
  diagnosis_observations: string;
}

interface DiagnosisTableProps {
  diagnoses: Diagnosis[];
  setDiagnoses: React.Dispatch<React.SetStateAction<Diagnosis[]>>;
}

const DiagnosisTable: React.FC<DiagnosisTableProps> = ({ diagnoses, setDiagnoses }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingDiagnosis, setEditingDiagnosis] = useState<Diagnosis | null>(null);
  const [form] = Form.useForm();

  const cie10Options = Array.isArray(dataCIE10) 
    ? dataCIE10
        .filter(item => item && item.code && item.description && (item.level > 0))
        .map(item => ({
          value: item.code,
          label: `${item.code} - ${item.description}`,
          description: item.description
        }))
    : [];

  const columns = [
    {
      title: 'Tipo',
      dataIndex: 'diagnosis_type',
      key: 'diagnosis_type',
      width: '15%',
      render: (type: string, _: any, index: number) => (
        <Tag color={type === 'primary' ? 'red' : 'blue'}>
          {type === 'primary' ? 'Principal' : `Secundario #${index}`}
        </Tag>
      )
    },
    {
      title: 'Código CIE-10',
      dataIndex: 'diagnosis_code',
      key: 'diagnosis_code',
      width: '20%',
      render: (text: string) => <strong>{text}</strong>
    },
    {
      title: 'Descripción',
      dataIndex: 'diagnosis_description',
      key: 'diagnosis_description',
      width: '30%'
    },
    {
      title: 'Observaciones',
      dataIndex: 'diagnosis_observations',
      key: 'diagnosis_observations',
      width: '25%'
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: '10%',
      render: (_: any, record: Diagnosis) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="¿Está seguro de eliminar este diagnóstico?"
            onConfirm={() => handleDelete(record.key)}
            okText="Sí"
            cancelText="No"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const handleAdd = () => {
    setEditingDiagnosis(null);
    form.resetFields();
    const defaultType = diagnoses.length === 0 ? 'primary' : 'secondary';
    form.setFieldsValue({ diagnosis_type: defaultType });
    setIsModalVisible(true);
  };

  const handleEdit = (diagnosis: Diagnosis) => {
    setEditingDiagnosis(diagnosis);
    form.setFieldsValue(diagnosis);
    setIsModalVisible(true);
  };

  const handleDelete = (key: string) => {
    const newDiagnoses = diagnoses.filter(diagnosis => diagnosis.key !== key);
    
    if (newDiagnoses.length > 0) {
      const deletedDiagnosis = diagnoses.find(d => d.key === key);
      if (deletedDiagnosis?.diagnosis_type === 'primary') {
        newDiagnoses[0] = { ...newDiagnoses[0], diagnosis_type: 'primary' };
      }
    }
    
    setDiagnoses(newDiagnoses);
    message.success('Diagnóstico eliminado');
  };

  const handleSave = (values: any) => {
    if (editingDiagnosis) {
      setDiagnoses(diagnoses.map(diagnosis => 
        diagnosis.key === editingDiagnosis.key 
          ? { ...diagnosis, ...values }
          : diagnosis
      ));
      message.success('Diagnóstico actualizado');
    } else {
      const newDiagnosis: Diagnosis = {
        key: Date.now().toString(),
        ...values
      };
      
      if (values.diagnosis_type === 'primary') {
        const updatedDiagnoses = diagnoses.map(d => 
          d.diagnosis_type === 'primary' 
            ? { ...d, diagnosis_type: 'secondary' as const }
            : d
        );
        setDiagnoses([...updatedDiagnoses, newDiagnosis]);
      } else {
        setDiagnoses([...diagnoses, newDiagnosis]);
      }
      
      message.success('Diagnóstico agregado');
    }
    
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingDiagnosis(null);
  };

  const handleCIE10Change = (value: string) => {
    const cie10Item = cie10Options.find(option => option.value === value);
    if (cie10Item) {
      form.setFieldsValue({
        diagnosis_code: value,
        diagnosis_description: cie10Item.description
      });
    }
  };

  return (
    <>
      <Card 
        title={
          <Space>
            <MedicineBoxOutlined />
            Diagnósticos (CIE-10)
          </Space>
        }
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Agregar Diagnóstico
          </Button>
        }
        style={{ marginBottom: '24px' }}
      >
        <Table
          columns={columns}
          dataSource={diagnoses}
          pagination={false}
          size="middle"
          locale={{
            emptyText: 'No hay diagnósticos agregados. Haga clic en "Agregar Diagnóstico" para comenzar.'
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      <Modal
        title={editingDiagnosis ? 'Editar Diagnóstico' : 'Agregar Diagnóstico'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          size="large"
        >
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Código CIE-10"
                name="diagnosis_code"
                rules={[
                  { required: true, message: 'Seleccione un código CIE-10' }
                ]}
              >
                <Select
                  placeholder="Buscar código CIE-10"
                  showSearch
                  onChange={handleCIE10Change}
                  options={cie10Options}
                  filterOption={(input, option) =>
                    option?.label?.toLowerCase().includes(input.toLowerCase()) || false
                  }
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Tipo de Diagnóstico"
                name="diagnosis_type"
                rules={[
                  { required: true, message: 'Seleccione el tipo de diagnóstico' }
                ]}
              >
                <Select placeholder="Seleccionar tipo">
                  <Select.Option value="primary">Principal</Select.Option>
                  <Select.Option value="secondary">Secundario</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                label="Descripción"
                name="diagnosis_description"
                rules={[
                  { required: true, message: 'Ingrese la descripción del diagnóstico' },
                  { max: 200, message: 'Máximo 200 caracteres' }
                ]}
              >
                <Input 
                  placeholder="Descripción del diagnóstico"
                  disabled={form.getFieldValue('diagnosis_code')}
                />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                label="Observaciones"
                name="observations"
                rules={[
                  { max: 500, message: 'Máximo 500 caracteres' }
                ]}
              >
                <TextArea
                  rows={3}
                  placeholder="Observaciones específicas del diagnóstico..."
                  showCount
                  maxLength={500}
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row justify="end" gutter={[8, 0]} style={{ marginTop: '16px' }}>
            <Col>
              <Button onClick={handleCancel}>
                Cancelar
              </Button>
            </Col>
            <Col>
              <Button type="primary" htmlType="submit">
                {editingDiagnosis ? 'Actualizar' : 'Agregar'}
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default DiagnosisTable;