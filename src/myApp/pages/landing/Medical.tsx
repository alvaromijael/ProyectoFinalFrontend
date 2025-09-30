import { useState } from "react";
import {
  Card,
  Tag,
  Button,
  Rate,
  Row,
  Col,
  Typography,
  Space,
  Divider,
} from "antd";
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";

const { Title, Paragraph, Text } = Typography;

const Medical = () => {
  const [selectedSpecialty, setSelectedSpecialty] = useState("Todas");

  const doctors = [
    {
      id: 1,
      name: "Dra. Katherine Rosales",
      specialty: "Pediatría",
      image: "Katherine.png",
      experience: "8 años",
      education: "Universidad Católica del Ecuador",
      schedule: "Lun - Sab: 9:00 - 17:00",
      location: "Consultorio 201",
      phone: "+593 99 123 4567",
      email: "krosales@clinica.com",
      rating: 4.9,
      languages: ["Español", "Inglés"],
      bio: "Pediatra especializada en el cuidado integral de niños, desde recién nacidos hasta adolescentes. Comprometida con la salud y el desarrollo óptimo de sus pacientes.",
    },
    {
      id: 2,
      name: "Dr. Carlos Billi Rosales Cajas",
      specialty: "Medicina Intensivista",
      image:
        "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop",
      experience: "20 años",
      education: "Universidad de las Américas",
      schedule: "Disponibilidad 24/7",
      location: "Unidad de Cuidados Intensivos",
      phone: "+593 99 234 5678",
      email: "crosalesc@clinica.com",
      rating: 5.0,
      languages: ["Español", "Inglés"],
      bio: "Médico intensivista con amplia experiencia en el manejo de pacientes críticos. Especializado en medicina de emergencias y cuidados intensivos.",
    },
    {
      id: 3,
      name: "Dr. Carlos Rosales Carvajal",
      specialty: "Cirugía",
      image:
        "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop",
      experience: "15 años",
      education: "Pontificia Universidad Católica",
      schedule: "Lun - Vie: 8:00 - 16:00",
      location: "Consultorio 305",
      phone: "+593 99 345 6789",
      email: "crosalescar@clinica.com",
      rating: 4.8,
      languages: ["Español", "Inglés"],
      bio: "Cirujano general con expertise en procedimientos laparoscópicos y cirugía mínimamente invasiva. Dedicado a brindar atención quirúrgica de excelencia.",
    },
  ];

  const specialties = [
    "Todas",
    ...new Set(doctors.map((doc) => doc.specialty)),
  ];

  const filteredDoctors =
    selectedSpecialty === "Todas"
      ? doctors
      : doctors.filter((doc) => doc.specialty === selectedSpecialty);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
        padding: "48px 24px",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <Title level={1} style={{ fontSize: "42px", marginBottom: "8px" }}>
            Nuestro Equipo Médico
          </Title>
          <Text style={{ fontSize: "18px", color: "#64748b" }}>
            Profesionales comprometidos con tu salud y bienestar
          </Text>
        </div>

        {/* Filtros */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <Space size="middle" wrap>
            {specialties.map((specialty) => (
              <Button
                key={specialty}
                type={selectedSpecialty === specialty ? "primary" : "default"}
                size="large"
                shape="round"
                onClick={() => setSelectedSpecialty(specialty)}
                style={{
                  minWidth: "120px",
                  fontWeight: "500",
                }}
              >
                {specialty}
              </Button>
            ))}
          </Space>
        </div>

        {/* Grid de Médicos */}
        <Row gutter={[24, 24]}>
          {filteredDoctors.map((doctor) => (
            <Col xs={24} md={12} lg={8} key={doctor.id}>
              <Card
                hoverable
                cover={
                  <div
                    style={{
                      height: "280px",
                      overflow: "hidden",
                      background:
                        "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)",
                      position: "relative",
                    }}
                  >
                    <img
                      alt={doctor.name}
                      src={doctor.image}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.5s",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: "16px",
                        right: "16px",
                        background: "white",
                        padding: "4px 12px",
                        borderRadius: "20px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Rate
                        disabled
                        defaultValue={1}
                        count={1}
                        style={{ fontSize: "14px" }}
                      />
                      <Text strong>{doctor.rating}</Text>
                    </div>
                  </div>
                }
                style={{
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              >
                <Title
                  level={3}
                  style={{ marginBottom: "4px", fontSize: "24px" }}
                >
                  {doctor.name}
                </Title>

                <Tag
                  color="blue"
                  style={{
                    fontSize: "14px",
                    padding: "4px 12px",
                    marginBottom: "16px",
                  }}
                >
                  {doctor.specialty}
                </Tag>

                <Paragraph style={{ color: "#64748b", marginBottom: "24px" }}>
                  {doctor.bio}
                </Paragraph>

                <Space
                  direction="vertical"
                  size="middle"
                  style={{ width: "100%" }}
                >
                  <Space>
                    <TrophyOutlined
                      style={{ color: "#3b82f6", fontSize: "18px" }}
                    />
                    <div>
                      <Text strong style={{ display: "block" }}>
                        Experiencia
                      </Text>
                      <Text type="secondary">{doctor.experience}</Text>
                    </div>
                  </Space>

                  <Space>
                    <CalendarOutlined
                      style={{ color: "#3b82f6", fontSize: "18px" }}
                    />
                    <div>
                      <Text strong style={{ display: "block" }}>
                        Horario
                      </Text>
                      <Text type="secondary">{doctor.schedule}</Text>
                    </div>
                  </Space>

                  <Space>
                    <EnvironmentOutlined
                      style={{ color: "#3b82f6", fontSize: "18px" }}
                    />
                    <div>
                      <Text strong style={{ display: "block" }}>
                        Ubicación
                      </Text>
                      <Text type="secondary">{doctor.location}</Text>
                    </div>
                  </Space>
                </Space>

                <div style={{ marginTop: "20px", marginBottom: "20px" }}>
                  <Space size="small" wrap>
                    {doctor.languages.map((lang) => (
                      <Tag key={lang} color="processing">
                        {lang}
                      </Tag>
                    ))}
                  </Space>
                </div>

                <Divider />

                <Space
                  direction="vertical"
                  size="small"
                  style={{ width: "100%", marginBottom: "16px" }}
                >
                  <a href={`tel:${doctor.phone}`} style={{ color: "#64748b" }}>
                    <PhoneOutlined /> {doctor.phone}
                  </a>
                  <a
                    href={`mailto:${doctor.email}`}
                    style={{ color: "#64748b" }}
                  >
                    <MailOutlined /> {doctor.email}
                  </a>
                </Space>

                <Button
                  type="primary"
                  size="large"
                  block
                  style={{
                    background:
                      "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)",
                    border: "none",
                    fontWeight: "600",
                    height: "48px",
                  }}
                >
                  <Link
                    to="/appointmentList"
                    style={{ color: "white", textDecoration: "none" }}
                  >
                    
                    Agendar Cita 
                  </Link>
                </Button>
              </Card>
            </Col>
          ))}
        </Row>

        {filteredDoctors.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px" }}>
            <Text type="secondary" style={{ fontSize: "18px" }}>
              No se encontraron médicos en esta especialidad.
            </Text>
          </div>
        )}
      </div>
    </div>
  );
};

export default Medical;
