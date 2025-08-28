import React from "react";
import { Row, Col, Card, Typography } from "antd";


const { Title, Paragraph } = Typography;

const especialidades = [
  {
    nombre: "Medicina General",
    descripcion:
      "Atención integral para todas las edades. Evaluación, diagnóstico y seguimiento de tu salud.",
    imagen: "/images/medicina-general.jpg",
  },
  {
    nombre: "Medicina Interna",
    descripcion:
      "Diagnóstico y tratamiento de enfermedades crónicas y complejas en adultos.",
    imagen: "/images/medicina-interna.jpg",
  },
  {
    nombre: "Ginecología",
    descripcion:
      "Salud femenina, control ginecológico, planificación familiar y atención especializada.",
    imagen: "/images/ginecologia.jpg",
  },
  {
    nombre: "Pediatría",
    descripcion:
      "Cuidado médico para niños y adolescentes. Prevención, desarrollo y bienestar infantil.",
    imagen: "/images/pediatria.jpg",
  },
  {
    nombre: "Odontología",
    descripcion:
      "Salud bucal, estética dental, limpieza, ortodoncia y tratamientos especializados.",
    imagen: "/images/odontologia.jpg",
  },
  {
    nombre: "Fisioterapia",
    descripcion:
      "Rehabilitación física, recuperación postoperatoria y mejora de movilidad funcional.",
    imagen: "/images/fisioterapia.jpg",
  },
];

const EspecialidadesPage: React.FC = () => {
  return (
    <div>
      <div style={{ padding: "2rem", backgroundColor: "#f5f9fa" }}>
        <Title level={2} style={{ textAlign: "center", marginBottom: "2rem" }}>
          Especialidades Médicas
        </Title>

        <Row gutter={[24, 24]}>
          {especialidades.map((esp) => (
            <Col xs={24} sm={12} md={8} key={esp.nombre}>
              <Card
                hoverable
                cover={
                  <img
                    alt={esp.nombre}
                    src={esp.imagen}
                    style={{
                      height: "200px",
                      objectFit: "cover",
                      borderTopLeftRadius: 12,
                      borderTopRightRadius: 12,
                    }}
                  />
                }
                style={{
                  borderRadius: 12,
                  backgroundColor: "#ffffff",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
              >
                <Title level={4}>{esp.nombre}</Title>
                <Paragraph>{esp.descripcion}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
     
    </div>
  );
};

export default EspecialidadesPage;
