
import React, { useEffect, useRef } from 'react';

const BusMap = ({ buses = [], selectedBus, height = '400px' }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const leafletScriptRef = useRef(null);

  const updateBusMarkers = () => {
    const map = mapInstanceRef.current;
    const L = window.L;

    if (!map || !L) return;

    // Remove old markers
    Object.values(markersRef.current).forEach(marker => {
      if (map.hasLayer(marker)) {
        map.removeLayer(marker);
      }
    });

    markersRef.current = {};

    // Safely handle bus data
    const safeBuses = Array.isArray(buses) ? buses : [];

    safeBuses.forEach(bus => {
      if (!bus?.location) return;

      const lat = Number(bus.location.latitude);
      const lng = Number(bus.location.longitude);

      // Validate coordinates
      if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lng) ||
        lat < -90 ||
        lat > 90 ||
        lng < -180 ||
        lng > 180
      ) {
        return;
      }

      const isSelected =
        selectedBus && selectedBus.number === bus.number;

      const isOnline = bus.status === 'Online';
      const iconColor = isOnline ? 'green' : 'red';

      const iconHtml = `
        <div style="
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
        ">🚌</div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-bus-icon',
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      const marker = L.marker([lat, lng], {
        icon: customIcon
      }).addTo(map);

      marker.bindPopup(`
        <div style="text-align: center;">
          <strong>Bus ${bus.number || 'Unknown'}</strong><br/>
          Route: ${bus.route || 'Unknown'}<br/>
          Status: <span style="color: ${iconColor};">
            ${bus.status || 'Unknown'}
          </span><br/>
          ${bus.eta ? `ETA: ${bus.eta}` : ''}
        </div>
      `);

      markersRef.current[bus.number || `bus-${lat}-${lng}`] = marker;

      if (isSelected) {
        map.setView([lat, lng], 15);
        marker.openPopup();
      }
    });

    // Fit map only when valid markers exist
    if (!selectedBus) {
      const markerList = Object.values(markersRef.current);

      if (markerList.length > 0) {
        const group = L.featureGroup(markerList);
        const bounds = group.getBounds();

        if (bounds.isValid()) {
          map.fitBounds(bounds.pad(0.1));
        }
      }
    }
  };

  useEffect(() => {
    let cancelled = false;
    let scriptElement = null;

    const initializeMap = () => {
      if (
        cancelled ||
        !mapRef.current ||
        !window.L ||
        mapInstanceRef.current
      ) {
        return;
      }

      const L = window.L;

      mapInstanceRef.current = L.map(mapRef.current).setView(
        [23.2599, 77.4126],
        12
      );

      L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '&copy; OpenStreetMap contributors'
        }
      ).addTo(mapInstanceRef.current);

      updateBusMarkers();
    };

    const loadLeaflet = () => {
      // Leaflet already loaded
      if (window.L) {
        initializeMap();
        return;
      }

      // Load CSS
      if (!document.querySelector(
        'link[href*="leaflet@1.9.4/dist/leaflet.css"]'
      )) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href =
          'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Reuse an existing script if present
      const existingScript = document.querySelector(
        'script[src*="leaflet@1.9.4/dist/leaflet.js"]'
      );

      if (existingScript) {
        scriptElement = existingScript;

        if (window.L) {
          initializeMap();
        } else {
          existingScript.addEventListener('load', initializeMap);
        }

        return;
      }

      // Load Leaflet JavaScript
      scriptElement = document.createElement('script');
      leafletScriptRef.current = scriptElement;
      scriptElement.src =
        'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      scriptElement.onload = initializeMap;
      document.body.appendChild(scriptElement);
    };

    loadLeaflet();

    return () => {
      cancelled = true;

      if (scriptElement) {
        scriptElement.removeEventListener('load', initializeMap);
      }

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      markersRef.current = {};
    };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && window.L) {
      updateBusMarkers();
    }
  }, [buses, selectedBus]);

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
