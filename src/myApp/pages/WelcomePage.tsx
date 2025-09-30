import { Button, Typography } from "antd";
import { Link } from "react-router-dom";
import "./HomePage.css";
import { MapSection } from "../components/MapSection";

const { Title, Paragraph } = Typography;

export const WelcomePage = () => {
  return (
    <>
      {/* Sección principal con texto + imagen */}
      <div className="home-container">
        <div className="home-content">
          <Title level={1} className="gradient-text">
            Tu salud
            <br />
            Renace
          </Title>
          <Paragraph className="home-description">
            Brindamos atención médica integral y especializada, con un enfoque
            humano y profesional, utilizando tecnología de vanguardia y un
            equipo multidisciplinario especializado, comprometido con la
            prevención, diagnóstico y tratamiento oportuno, para mejorar la
            calidad de vida de nuestros pacientes y sus familias.
          </Paragraph>
          <Button type="primary" size="large">
            <Link
              to="/specialities"
              style={{ color: "white", textDecoration: "none" }}
            >
              Busca tu especialidad
            </Link>
          </Button>
        </div>

        <div className="home-image">
          <img src="LogoFenix-04.png" alt="Fenix banner" />
        </div>
      </div>

      <div className="lifestyle-section">
        <div className="lifestyle-text">
          <Title level={2}>Tu salud renace</Title>
          <Paragraph>
            Ser la clínica de especialidades líder y referente en la región,
            reconocida por su excelencia médica, innovación en servicios de
            salud y un trato cercano y empático que genere confianza y bienestar
            en cada paciente.
          </Paragraph>
          <Paragraph strong style={{ color: "#888" }}>
            Conoce nuestros casos de éxito →
          </Paragraph>
          <Button type="primary" shape="round" size="large">
            Descubre comunidades
          </Button>
        </div>

        <div className="lifestyle-gallery">
          <img src="Pediatria2.jpg" alt="Estilo 1" />
          <img src="Post Base.png" alt="Estilo 2" />
          <img src="ginecologia.png" alt="Estilo 3" />
        </div>
      </div>
      <MapSection />
    </>
  );
};
