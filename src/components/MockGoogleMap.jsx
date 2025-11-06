import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import { MapPin, Navigation } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom marker icon with color coding
const createCustomIcon = (color = '#10b981') => {
  const colorMap = {
    'red': '#ef4444',
    'green': '#10b981',
    'blue': '#3b82f6',
    'orange': '#f97316',
    'purple': '#a855f7',
    'yellow': '#eab308',
    'gray': '#6b7280'
  }
  
  const bgColor = colorMap[color] || color
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${bgColor}; width: 36px; height: 36px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
      <div style="transform: rotate(45deg); color: white; font-size: 18px;">📍</div>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  })
}

// User location marker
const createUserIcon = () => {
  return L.divIcon({
    className: 'user-marker',
    html: `<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  })
}

function MapUpdater({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])
  return null
}

export default function MockGoogleMap({ 
  locations = [], 
  center = [34.0522, -118.2437], 
  zoom = 12, 
  onMarkerClick,
  showUserLocation = true,
  showRoute = false,
  selectedLocation = null
}) {
  const [mapCenter, setMapCenter] = useState(center)
  const [mapZoom, setMapZoom] = useState(zoom)
  const [userLocation, setUserLocation] = useState(null)
  const [route, setRoute] = useState(null)

  useEffect(() => {
    setMapCenter(center)
  }, [center])

  // Simulate user location (in a real app, this would use geolocation API)
  useEffect(() => {
    if (showUserLocation) {
      setUserLocation([center[0] + 0.01, center[1] + 0.01])
    }
  }, [center, showUserLocation])

  // Generate a simple mock route between user and selected location
  useEffect(() => {
    if (showRoute && selectedLocation && userLocation) {
      const points = generateMockRoute(
        userLocation,
        [selectedLocation.latitude, selectedLocation.longitude]
      )
      setRoute(points)
    } else {
      setRoute(null)
    }
  }, [showRoute, selectedLocation, userLocation])

  const generateMockRoute = (start, end) => {
    // Simple mock route with some intermediate points
    const points = []
    const steps = 10
    for (let i = 0; i <= steps; i++) {
      const lat = start[0] + (end[0] - start[0]) * (i / steps)
      const lng = start[1] + (end[1] - start[1]) * (i / steps)
      // Add some curve to make it look more realistic
      const curve = Math.sin((i / steps) * Math.PI) * 0.005
      points.push([lat + curve, lng + curve])
    }
    return points
  }

  const handleMarkerClick = (location) => {
    if (onMarkerClick) {
      onMarkerClick(location)
    }
  }

  const getDirections = (location) => {
    // In a real app, this would open Google Maps or similar
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`
    window.open(url, '_blank')
  }

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <MapUpdater center={mapCenter} zoom={mapZoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User location marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={createUserIcon()}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-sm">Your Location</h3>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route polyline */}
        {route && (
          <Polyline
            positions={route}
            color="#3b82f6"
            weight={4}
            opacity={0.7}
            dashArray="10, 10"
          />
        )}

        {/* Location markers */}
        {locations.map((location, index) => (
          <Marker
            key={location.id || index}
            position={[location.latitude, location.longitude]}
            icon={createCustomIcon(location.color || 'green')}
            eventHandlers={{
              click: () => handleMarkerClick(location)
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-semibold text-base mb-2">{location.name}</h3>
                {location.type && (
                  <p className="text-xs text-gray-600 capitalize mb-2 bg-gray-100 px-2 py-1 rounded inline-block">
                    {location.type.replace('_', ' ')}
                  </p>
                )}
                {location.address && (
                  <p className="text-sm text-gray-700 mb-2 flex items-start gap-1">
                    <MapPin className="w-3 h-3 mt-1 flex-shrink-0" />
                    {location.address}
                  </p>
                )}
                {location.description && (
                  <p className="text-sm text-gray-600 mb-3">{location.description}</p>
                )}
                <button
                  onClick={() => getDirections(location)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-3 rounded flex items-center justify-center gap-2 transition-colors"
                >
                  <Navigation className="w-4 h-4" />
                  Get Directions
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map legend */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg z-[1000] text-xs">
        <h4 className="font-semibold mb-2">Map Legend</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Your Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>Limited</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
            <span>Unavailable</span>
          </div>
        </div>
      </div>
    </div>
  )
}

