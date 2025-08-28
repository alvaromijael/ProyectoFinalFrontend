// AboutClinicPage.tsx
import React from 'react';
import { Layout, Typography, Row, Col, Image, Card } from 'antd';


const { Content } = Layout;
const { Title, Paragraph } = Typography;

const AboutUs: React.FC = () => {
  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#ebf4f6' }}>
      

      <Content style={{ padding: '2rem' }}>
        {/* Hero */}
        <Card
          style={{ marginBottom: '2rem' }}
          cover={
            <Image
              src="https://es.vecteezy.com/foto/15173394-interior-del-gabinete-de-la-clinica-moderna-con-equipo-medico"
              alt="Imagen clínica"
              preview={false}
              style={{ height: 300, objectFit: 'cover' }}
            />
          }
        >
          <Title level={2}>Bienvenidos a Clínica Fenix</Title>
          <Paragraph>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vitae sapien nec justo
            tincidunt fermentum. Integer vel orci nec nulla facilisis tincidunt.
          </Paragraph>
        </Card>

        {/* Trayectoria */}
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={12}>
            <Image
              src="https://www.ylab.es/proyectos-de-arquitectura-e-interiorismo/arquitectura-corporativa/diseno-interior-clinica-odontologica-acevedo.html"
              alt="Trayectoria clínica"
              preview={false}
              style={{ width: '100%', borderRadius: 8 }}
            />
          </Col>
          <Col xs={24} md={12}>
            <Title level={3}>Nuestra Trayectoria</Title>
            <Paragraph>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse potenti.
              Curabitur euismod, justo a facilisis fermentum, lorem sapien tincidunt lorem,
              nec tincidunt sapien sapien nec sapien.
            </Paragraph>
          </Col>
        </Row>

        {/* Galería */}
        <div style={{ marginTop: '3rem' }}>
          <Title level={3}>Instalaciones</Title>
          <Row gutter={[16, 16]}>
            {[1, 2, 3].map((i) => (
              <Col xs={24} sm={12} md={8} key={i}>
                <Card
                  hoverable
                  cover={
                    <Image
                      src="https://www.shutterstock.com/es/search/cl%C3%ADnica-moderna?image_type=illustration"
                      alt={`Imagen ${i}`}
                      preview={false}
                      style={{ height: 200, objectFit: 'cover' }}
                    />
                  }
                >
                  <Paragraph>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  </Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </Content>
      
    </Layout>
   
  );
};

export default AboutUs;