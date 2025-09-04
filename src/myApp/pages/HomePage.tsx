// src/components/HomePage.tsx
import React, { useState } from 'react';
import {
  Card,
  Col,
  Row,
  Typography,
  Progress,
  Timeline,
  Badge,
  List,
  Button,
  Modal,
  Input,
  Space,
  message,
} from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons';

const { Title } = Typography;

export const HomePage: React.FC = () => {
  const capacidadMaxima = 10;
  const citasHoy = 5;

  const [notas, setNotas] = useState<string[]>([
    'Revisar resultados de laboratorio',
    'Confirmar cita con paciente Pérez',
    'Actualizar historia clínica de Ramírez',
  ]);

  const [completadas, setCompletadas] = useState<string[]>([]);
  const [nuevaNota, setNuevaNota] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const citasAgenda = [
    { hora: '08:00', paciente: 'Juan Pérez' },
    { hora: '09:30', paciente: 'Ana Ramírez' },
    { hora: '11:00', paciente: 'Carlos Gómez' },
    { hora: '14:00', paciente: 'Lucía Torres' },
    { hora: '16:30', paciente: 'Pedro Sánchez' },
  ];

  const agregarNota = () => {
    if (!nuevaNota.trim()) return message.warning('La nota no puede estar vacía');
    setNotas([...notas, nuevaNota]);
    setNuevaNota('');
  };

  const completarNota = (index: number) => {
    const nota = notas[index];
    setCompletadas([...completadas, nota]);
    setNotas(notas.filter((_, i) => i !== index));
  };

  const eliminarNota = (index: number) => {
    setNotas(notas.filter((_, i) => i !== index));
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: '24px', display: 'flex', alignItems: 'center' }}>
        <CalendarOutlined style={{ marginRight: '8px' }} />
        Panel del Médico
      </Title>

      <Row gutter={[16, 16]} align="stretch">
        {/* Citas para hoy */}
        <Col xs={24} md={8}>
          <Card
            title="Citas para hoy"
            bordered={false}
            style={{
              minHeight: '320px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <Progress
                type="circle"
                percent={(citasHoy / capacidadMaxima) * 100}
                format={() => `${citasHoy} citas`}
                strokeColor="#1890ff"
              />
              <p style={{ marginTop: '12px' }}>
                Capacidad diaria estimada: {capacidadMaxima}
              </p>
            </div>
          </Card>
        </Col>

        {/* Notas por hacer */}
        <Col xs={24} md={8}>
          <Card
            title="Notas por hacer"
            bordered={false}
            extra={
              <Button icon={<EyeOutlined />} onClick={() => setModalVisible(true)}>
                Ver completadas
              </Button>
            }
            style={{
              minHeight: '320px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <Space style={{ marginBottom: '12px' }}>
                <Input
                  placeholder="Nueva nota"
                  value={nuevaNota}
                  onChange={(e) => setNuevaNota(e.target.value)}
                />
                <Button type="primary" icon={<PlusOutlined />} onClick={agregarNota}>
                  Agregar
                </Button>
              </Space>

              <List
                dataSource={notas}
                renderItem={(item, index) => (
                  <List.Item
                    actions={[
                      <Button
                        icon={<CheckCircleOutlined />}
                        type="link"
                        onClick={() => completarNota(index)}
                      />,
                      <Button icon={<EditOutlined />} type="link" disabled />,
                      <Button
                        icon={<DeleteOutlined />}
                        type="link"
                        danger
                        onClick={() => eliminarNota(index)}
                      />,
                    ]}
                  >
                    {item}
                  </List.Item>
                )}
              />
            </div>
          </Card>
        </Col>

        {/* Agenda del día */}
        <Col xs={24} md={8}>
          <Card
            title="Agenda del día"
            bordered={false}
            style={{
              minHeight: '320px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Timeline mode="left">
              {citasAgenda.map((cita, index) => (
                <Timeline.Item
                  label={cita.hora}
                  key={index}
                  dot={<ClockCircleOutlined style={{ fontSize: '16px' }} />}
                >
                  <Badge status="processing" text={cita.paciente} />
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>
      </Row>

      {/* Modal de tareas completadas */}
      <Modal
        title="Tareas completadas"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <List
          dataSource={completadas}
          renderItem={(item) => (
            <List.Item>
              <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
              {item}
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
};

export default HomePage;