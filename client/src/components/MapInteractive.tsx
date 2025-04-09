import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './MapInteractive.css';
import { useQuery } from '@tanstack/react-query';

const iconDefi = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/616/616408.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const iconPhoto = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/685/685655.png',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

export default function MapInteractive() {
  // Fetch challenges from API
  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ['/api/challenges'],
  });

  if (isLoading) {
    return (
      <div className="map-container">
        <h2>Carte interactive des défis</h2>
        <div className="loading-indicator">Chargement de la carte...</div>
      </div>
    );
  }

  return (
    <div className="map-container">
      <h2>Carte interactive des défis</h2>
      <MapContainer center={[48.418, -71.060]} zoom={12} scrollWheelZoom={true} style={{ height: '500px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {challenges.map((defi) => {
          const lat = parseFloat(defi.coordsLat);
          const lng = parseFloat(defi.coordsLng);
          
          if (isNaN(lat) || isNaN(lng)) return null;
          
          return (
            <Marker
              key={defi.id}
              position={[lat, lng]}
              icon={defi.type === 'photo' ? iconPhoto : iconDefi}
            >
            <Popup>
              <strong>{defi.name}</strong>
              <br />
              {defi.description}
            </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <div className="legend">
        <h3>Légende</h3>
        <p><img src="https://cdn-icons-png.flaticon.com/512/616/616408.png" width="24" /> Défi actif</p>
        <p><img src="https://cdn-icons-png.flaticon.com/512/685/685655.png" width="22" /> Lieu photo</p>
      </div>
    </div>
  );
}
