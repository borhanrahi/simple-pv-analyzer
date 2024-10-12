import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Replace the problematic icon configuration with this:
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon.src,
  shadowUrl: iconShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
  onLocationSelect: (latlng: L.LatLngLiteral) => void;
}

const LocationMarker: React.FC<{ onSelect: (latlng: L.LatLngLiteral) => void }> = ({ onSelect }) => {
  const [position, setPosition] = useState<L.LatLngLiteral | null>(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onSelect(e.latlng);
    },
  });

  return position === null ? null : <Marker position={position}></Marker>;
};

const Map: React.FC<MapProps> = ({ onLocationSelect }) => {
  return (
    <MapContainer center={[23.6850, 90.3563]} zoom={7} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      <LocationMarker onSelect={onLocationSelect} />
    </MapContainer>
  );
};

export default Map;
