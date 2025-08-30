import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapSection.css";


const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png", // URL de tu ícono
  iconSize: [25, 41], // Tamaño del ícono
  iconAnchor: [12, 41], // Ancla del ícono
  popupAnchor: [1, -34], // Ancla del popup
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png", // Sombra del ícono
  shadowSize: [41, 41], // Tamaño de la sombra
});

export const MapSection = () => {
  return (
    <div className="map-section">
      <h2>Conoce nuestra ubicacion</h2>
      <p>Estamos siempre cerca de ti.</p>
      <div className="map-container">
        <MapContainer center={[-0.110144, -78.295335]} zoom={16} scrollWheelZoom={true} style={{ height: "400px", width: "100%" }}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[-0.108589, -78.295066]} icon={customIcon}>
            <Popup>Nuestra ubicacion</Popup>
          </Marker>
          
        </MapContainer>
      </div>
    </div>
  );
};
