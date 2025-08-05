import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapSection.css";

// Fix para los íconos de Leaflet que no cargan por defecto en React
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

export const MapSection = () => {
  return (
    <div className="map-section">
      <h2>Conoce nuestras ubicaciones</h2>
      <p>Explora en el mapa las zonas donde tenemos apartamentos disponibles.</p>
      <div className="map-container">
        <MapContainer center={[-0.188310, -78.48169]} zoom={12} scrollWheelZoom={false} style={{ height: "400px", width: "100%" }}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[19.4326, -99.1332]}>
            <Popup>CDMX - Centro</Popup>
          </Marker>
          <Marker position={[19.3910, -99.1607]}>
            <Popup>Polanco</Popup>
          </Marker>
          <Marker position={[19.4260, -99.1677]}>
            <Popup>Roma Norte</Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};
