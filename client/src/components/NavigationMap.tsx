import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Clock } from 'lucide-react';

// Set Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';

interface NavigationMapProps {
  destinationAddress: string;
  destinationLat?: number;
  destinationLng?: number;
  onNavigationStart?: () => void;
}

export default function NavigationMap({ 
  destinationAddress, 
  destinationLat, 
  destinationLng,
  onNavigationStart 
}: NavigationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [route, setRoute] = useState<any>(null);
  const [distance, setDistance] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          setError('Unable to get your location. Please enable location services.');
          console.error('Geolocation error:', error);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !userLocation || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [userLocation.lng, userLocation.lat],
      zoom: 12
    });

    // Add user location marker
    new mapboxgl.Marker({ color: '#3b82f6' })
      .setLngLat([userLocation.lng, userLocation.lat])
      .setPopup(new mapboxgl.Popup().setHTML('<div>Your Location</div>'))
      .addTo(map.current);

    // Add destination marker if coordinates are provided
    if (destinationLat && destinationLng) {
      new mapboxgl.Marker({ color: '#ef4444' })
        .setLngLat([destinationLng, destinationLat])
        .setPopup(new mapboxgl.Popup().setHTML(`<div>Destination<br/>${destinationAddress}</div>`))
        .addTo(map.current);

      // Get route
      getRoute([userLocation.lng, userLocation.lat], [destinationLng, destinationLat]);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [userLocation, destinationLat, destinationLng, destinationAddress]);

  const getRoute = async (start: [number, number], end: [number, number]) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`
      );
      
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const routeData = data.routes[0];
        setRoute(routeData);
        
        // Set distance and duration
        setDistance((routeData.distance / 1609.34).toFixed(1)); // Convert meters to miles
        setDuration(String(Math.round(routeData.duration / 60))); // Convert seconds to minutes

        // Add route to map
        if (map.current) {
          if (map.current.getSource('route')) {
            map.current.removeLayer('route');
            map.current.removeSource('route');
          }

          map.current.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: routeData.geometry
            }
          });

          map.current.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#3b82f6',
              'line-width': 5,
              'line-opacity': 0.75
            }
          });

          // Fit map to show entire route
          const coordinates = routeData.geometry.coordinates;
          const bounds = new mapboxgl.LngLatBounds();
          coordinates.forEach((coord: [number, number]) => bounds.extend(coord));
          map.current.fitBounds(bounds, { padding: 50 });
        }
      }
    } catch (error) {
      console.error('Error getting route:', error);
      setError('Unable to calculate route. Please try again.');
    }
  };

  const openInMaps = () => {
    if (onNavigationStart) {
      onNavigationStart();
    }

    // Create the destination string for various map apps
    const destination = destinationLat && destinationLng 
      ? `${destinationLat},${destinationLng}` 
      : encodeURIComponent(destinationAddress);

    // Detect device and open appropriate map app
    const userAgent = navigator.userAgent;
    
    if (/iPad|iPhone|iPod/.test(userAgent)) {
      // iOS - prefer Apple Maps
      window.open(`maps://maps.google.com/maps?daddr=${destination}&amp;ll=`);
    } else if (/android/i.test(userAgent)) {
      // Android - use Google Maps
      window.open(`google.navigation:q=${destination}`);
    } else {
      // Desktop - open Google Maps in browser
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`);
    }
  };

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Navigation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={openInMaps} className="w-full">
            <Navigation className="h-4 w-4 mr-2" />
            Open in Maps App
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Navigation to Parent
          </div>
          {distance && duration && (
            <div className="flex gap-2">
              <Badge variant="outline" className="flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {distance} mi
              </Badge>
              <Badge variant="outline" className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {duration} min
              </Badge>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          <strong>Destination:</strong> {destinationAddress}
        </div>
        
        <div ref={mapContainer} className="w-full h-64 rounded-lg border" />
        
        <Button onClick={openInMaps} className="w-full" size="lg">
          <Navigation className="h-4 w-4 mr-2" />
          Start Navigation
        </Button>
      </CardContent>
    </Card>
  );
}