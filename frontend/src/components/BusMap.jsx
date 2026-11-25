import React, { useEffect, useRef } from 'react';

const BusMap = ({ buses, selectedBus, height = '400px' }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});

  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window !== 'undefined' && !window.L) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

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
        mapInstanceRef.current = window.L.map(mapRef.current).setView([40.7128, -74.0060], 12);

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: 'Kuberachar'
        }).addTo(mapInstanceRef.current);

        updateBusMarkers();
      }
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current = {};
      }
    };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current) {
      updateBusMarkers();
    }
  }, [buses, selectedBus]);

  const updateBusMarkers = () => {
    if (!mapInstanceRef.current || !window.L) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => {
      mapInstanceRef.current.removeLayer(marker);
    });
    markersRef.current = {};

    // Add markers for buses with location
    buses.forEach(bus => {
      if (bus.location && bus.location.latitude && bus.location.longitude) {
        const isSelected = selectedBus && selectedBus.number === bus.number;
        const isOnline = bus.status === 'Online';
        
        // Create custom icon based on status
        const iconColor = isOnline ? 'green' : 'red';
        const iconHtml = `<div style="
          background: ${iconColor};
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
          font-weight: bold;
        ">🚌</div>`;

        const customIcon = window.L.divIcon({
          html: iconHtml,
          className: 'custom-bus-icon',
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });

        const marker = window.L.marker([bus.location.latitude, bus.location.longitude], {
          icon: customIcon
        }).addTo(mapInstanceRef.current);

        marker.bindPopup(`
          <div style="text-align: center;">
            <strong>Bus ${bus.number}</strong><br/>
            Route: ${bus.route || 'Unknown'}<br/>
            Status: <span style="color: ${iconColor};">${bus.status}</span><br/>
            ${bus.eta ? `ETA: ${bus.eta}` : ''}
          </div>
        `);

        markersRef.current[bus.number] = marker;

        // If this bus is selected, center map on it
        if (isSelected) {
          mapInstanceRef.current.setView([bus.location.latitude, bus.location.longitude], 15);
          marker.openPopup();
        }
      }
    });

    // If no bus is selected but we have buses, fit map to show all buses
    if (!selectedBus && buses.length > 0) {
      const busesWithLocation = buses.filter(bus => bus.location && bus.location.latitude && bus.location.longitude);
      if (busesWithLocation.length > 0) {
        const group = new window.L.featureGroup(Object.values(markersRef.current));
        mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
      }
    }
  };

  return (
    <div 
      ref={mapRef} 
      style={{ 
        height, 
        width: '100%', 
        borderRadius: '10px',
        border: '2px solid #3b82f6'
      }}
    />
  );
};

export default BusMap;