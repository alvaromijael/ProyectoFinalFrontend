import React from "react";
import { Row, Col, Typography, Divider } from "antd";


const { Title, Paragraph } = Typography;

const Laboratory: React.FC = () => {
  return (
    <div>
      <div style={{ padding: "3rem 2rem", backgroundColor: "#f0f4f7" }}>
        <Row gutter={[32, 32]} align="middle">
          <Col xs={24} md={12}>
            <img
              src="laboratory.jpg"
              alt="Laboratorio clínico moderno"
              style={{
                width: "100%",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                objectFit: "cover",
              }}
            />
          </Col>

          <Col xs={24} md={12}>
            <Title level={2} style={{ color: "#433683" }}>
              Laboratorio Clínico
            </Title>
            <Divider />
            <Paragraph style={{ fontSize: "16px", lineHeight: "1.8em" }}>
              Nuestro laboratorio clínico está equipado con tecnología avanzada
              para garantizar resultados precisos y confiables. Ofrecemos una
              amplia gama de pruebas diagnósticas, desde análisis de sangre y
              orina hasta estudios especializados de microbiología y bioquímica.
            </Paragraph>
            <Paragraph style={{ fontSize: "16px", lineHeight: "1.8em" }}>
              Contamos con personal altamente capacitado, protocolos de calidad
              certificados y un entorno seguro para la toma de muestras. La
              rapidez en la entrega de resultados y la confidencialidad son
              pilares de nuestro servicio.
            </Paragraph>
            <Paragraph style={{ fontSize: "16px", lineHeight: "1.8em" }}>
              Confía en nosotros para el seguimiento de tu salud con precisión y
              profesionalismo.
            </Paragraph>
          </Col>
        </Row>
      </div>
    
    </div>
  );
};

export default Laboratory;
