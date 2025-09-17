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
  Modal
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons';

const { TextArea } = Input;

// Interfaz para la receta
interface Recipe {
  key: string;
  medicine: string;
  amount: string;
  instructions: string;
  observations: string;
}

// Props del componente
interface RecipeTableProps {
  recipes: Recipe[];
  setRecipes: React.Dispatch<React.SetStateAction<Recipe[]>>;
}

// Componente de la tabla de recetas
const RecipeTable: React.FC<RecipeTableProps> = ({ recipes, setRecipes }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [form] = Form.useForm();

  // Columnas de la tabla
  const columns = [
    {
      title: 'Medicamento',
      dataIndex: 'medicine',
      key: 'medicine',
      width: '25%',
      render: (text: string) => <strong>{text}</strong>
    },
    {
      title: 'Cantidad',
      dataIndex: 'amount',
      key: 'amount',
      width: '15%'
    },
    {
      title: 'Instrucciones',
      dataIndex: 'instructions',
      key: 'instructions',
      width: '25%'
    },
    {
      title: 'Observaciones',
      dataIndex: 'observations',
      key: 'observations',
      width: '25%'
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: '10%',
      render: (_: any, record: Recipe) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="¿Está seguro de eliminar esta receta?"
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

  // Abrir modal para nueva receta
  const handleAdd = () => {
    setEditingRecipe(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // Abrir modal para editar
  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    form.setFieldsValue(recipe);
    setIsModalVisible(true);
  };

  // Eliminar receta
  const handleDelete = (key: string) => {
    setRecipes(recipes.filter(recipe => recipe.key !== key));
    message.success('Receta eliminada');
  };

  // Guardar receta (nueva o editada)
  const handleSave = (values: any) => {
    if (editingRecipe) {
      // Editar receta existente
      setRecipes(recipes.map(recipe => 
        recipe.key === editingRecipe.key 
          ? { ...recipe, ...values }
          : recipe
      ));
      message.success('Receta actualizada');
    } else {
      // Agregar nueva receta
      const newRecipe: Recipe = {
        key: Date.now().toString(),
        ...values
      };
      setRecipes([...recipes, newRecipe]);
      message.success('Receta agregada');
    }
    
    setIsModalVisible(false);
    form.resetFields();
  };

  // Cancelar modal
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingRecipe(null);
  };

  return (
    <>
      {/* Tabla de recetas */}
      <Card 
        title={
          <Space>
            <MedicineBoxOutlined />
            Receta Médica
          </Space>
        }
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Agregar Medicamento
          </Button>
        }
        style={{ marginBottom: '24px' }}
      >
        <Table
          columns={columns}
          dataSource={recipes}
          pagination={false}
          size="middle"
          locale={{
            emptyText: 'No hay medicamentos en la receta. Haga clic en "Agregar Medicamento" para comenzar.'
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Modal para agregar/editar receta */}
      <Modal
        title={editingRecipe ? 'Editar Medicamento' : 'Agregar Medicamento'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
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
                label="Medicamento"
                name="medicine"
                rules={[
                  { required: true, message: 'Ingrese el nombre del medicamento' },
                  { max: 50, message: 'Máximo 50 caracteres' }
                ]}
              >
                <Input placeholder="Ej: Paracetamol 500mg" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Cantidad"
                name="amount"
                rules={[
                  { required: true, message: 'Ingrese la cantidad' },
                  { max: 30, message: 'Máximo 30 caracteres' }
                ]}
              >
                <Input placeholder="Ej: 1 tableta, 5ml" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                label="Instrucciones"
                name="instructions"
                rules={[
                  { required: true, message: 'Ingrese las instrucciones' },
                  { max: 100, message: 'Máximo 100 caracteres' }
                ]}
              >
                <Input placeholder="Ej: Cada 8 horas por 7 días" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                label="Observaciones"
                name="observations"
                rules={[
                  { max: 255, message: 'Máximo 255 caracteres' }
                ]}
              >
                <TextArea
                  rows={3}
                  placeholder="Ej: Tomar con alimentos, evitar alcohol"
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
                {editingRecipe ? 'Actualizar' : 'Agregar'}
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default RecipeTable;