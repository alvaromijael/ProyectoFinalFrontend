import { FacebookOutlined, YoutubeOutlined, InstagramOutlined, TwitterOutlined, LinkedinOutlined } from "@ant-design/icons";
import "./Footer.css";

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <img src="/LogoFenix-04.png" alt="Inmobilia logo" className="footer-logo" />
          
        </div>

        <div className="footer-links">
          <div className="footer-column">
            <h4>Nosotros</h4>
            <ul>
              <li>Acerca de FlatFinder</li>
              <li>Bolsa de Trabajo</li>
              <li>Contáctanos</li>
              <li>Clientes</li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Comunidades</h4>
            <ul>
              <li>Descubre comunidades</li>
              <li>Proyectos</li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Inversionistas</h4>
            <ul>
              <li>Información para inversionistas</li>
              <li>Invierte con nosotros</li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Blog</h4>
            <ul>
              <li>Artículos</li>
              <li>Contenido descargable</li>
              <li>Prensa</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>Derechos reservados 2025 Ecuacompass ®</p>
        <a href="#">Aviso de privacidad</a>
        <div className="footer-social">
          <FacebookOutlined />
          <YoutubeOutlined />
          <InstagramOutlined />
          <TwitterOutlined />
          <LinkedinOutlined />
        </div>
      </div>
    </footer>
  );
};
