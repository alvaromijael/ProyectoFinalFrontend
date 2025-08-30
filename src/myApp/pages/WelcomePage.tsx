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
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Illo
            deserunt labore inventore rerum perferendis doloribus ex officia.
            Quas tenetur expedita magni in, accusantium quam. Amet veritatis
            suscipit reiciendis temporibus placeat.
          </Paragraph>
          <Button type="primary" size="large">
            <Link
              to="/auth/register"
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
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Provident
            natus incidunt laboriosam, commodi suscipit repellat, itaque labore
            nulla dolor pariatur recusandae necessitatibus voluptate expedita
            placeat ad eum aspernatur rerum fuga.
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
