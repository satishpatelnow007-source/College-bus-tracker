import React, { useEffect, useRef } from 'react';

const DriverMap = ({ location, height = '400px' }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    // Load Leaflet dynamically
    const loadLeaflet = async () => {
      if (typeof window !== 'undefined' && !window.L) {
        // Load Leaflet CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        // Load Leaflet JS
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = initializeMap;
        document.head.appendChild(script);
      } else if (window.L) {
        initializeMap();
      }
    };

    const initializeMap = () => {
      if (mapRef.current && !mapInstanceRef.current) {
        // Initialize map
        mapInstanceRef.current = window.L.map(mapRef.current).setView([40.7128, -74.0060], 13);

        // Add tile layer
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: 'Kuberachar'
        }).addTo(mapInstanceRef.current);

        // Add initial marker
        if (location) {
          markerRef.current = window.L.marker([location.latitude, location.longitude])
            .addTo(mapInstanceRef.current)
            .bindPopup('Your current location');
          mapInstanceRef.current.setView([location.latitude, location.longitude], 15);
        }
      }
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && location) {
      if (markerRef.current) {
        markerRef.current.setLatLng([location.latitude, location.longitude]);
      } else {
        markerRef.current = window.L.marker([location.latitude, location.longitude])
          .addTo(mapInstanceRef.current)
          .bindPopup('Your current location');
      }
      mapInstanceRef.current.setView([location.latitude, location.longitude], 15);
    }
  }, [location]);

  return (
    <div 
      ref={mapRef} 
      style={{ 
        height, 
        width: '100%', 
        borderRadius: '10px',
        border: '2px solid #10b981'
      }}
    />
  );
};

export default DriverMap;