import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon not showing
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapComponent = ({ cars, center = [20.5937, 78.9629], zoom = 5 }) => {
    // Default center is India

    // Filter cars that have valid lat/long
    const validCars = cars.filter(c => c.latitude && c.longitude);

    if (validCars.length === 0 && cars.length > 0) {
        // Option: Don't render map if no cars have location? 
        // Or just render empty map. Let's render map still.
    }

    return (
        <div style={{ height: '400px', width: '100%', marginBottom: '20px', borderRadius: '8px', overflow: 'hidden' }}>
            <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {validCars.map((car) => (
                    <Marker
                        key={car.id}
                        position={[car.latitude, car.longitude]}
                    >
                        <Popup>
                            <div style={{ minWidth: '150px' }}>
                                <strong>{car.brand} {car.model}</strong> <br />
                                ₹{car.pricePerDay}/day <br />
                                {car.location}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default MapComponent;
