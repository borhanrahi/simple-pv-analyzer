import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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

const MapContent: React.FC<{ position: L.LatLngLiteral | null, onMapClick: (e: L.LeafletMouseEvent) => void }> = ({ position, onMapClick }) => {
  const map = useMap();

  useMapEvents({
    click: onMapClick,
  });

  useEffect(() => {
    if (position) {
      map.setView(position, 13);
    }
  }, [position, map]);

  return position ? <Marker position={position} /> : null;
};

const Map: React.FC<MapProps> = ({ onLocationSelect }) => {
  const [position, setPosition] = useState<L.LatLngLiteral | null>(null);
  const [longitude, setLongitude] = useState('');
  const [latitude, setLatitude] = useState('');

  const updatePosition = (latlng: L.LatLngLiteral) => {
    setPosition(latlng);
    setLongitude(latlng.lng.toFixed(6));
    setLatitude(latlng.lat.toFixed(6));
    onLocationSelect(latlng);
  };

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    updatePosition(e.latlng);
  };

  const handleCoordinateSearch = () => {
    if (longitude && latitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        updatePosition({ lat, lng });
      }
    }
  };

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          placeholder="Longitude"
          className="p-2 mr-2 text-black border rounded"
        />
        <input
          type="text"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          placeholder="Latitude"
          className="p-2 mr-2 text-black border rounded"
        />
        <button
          onClick={handleCoordinateSearch}
          className="p-2 text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          Search Coordinates
        </button>
      </div>
      <MapContainer
        center={[23.6850, 90.3563]}
        zoom={7}
        style={{ height: '400px', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        <MapContent position={position} onMapClick={handleMapClick} />
      </MapContainer>
    </div>
  );
};

export default Map;
