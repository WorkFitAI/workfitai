"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getCoordinates } from "@/lib/utils";

const JobLocationMap = ({ address }: { address: string }) => {
  const [position, setPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      const coords = await getCoordinates(address);

      if (coords) {
        setPosition([coords.lat, coords.lng]);
      }
    };

    fetchLocation();
  }, [address]);

  if (!position) return <p>Loading map...</p>;

  return (
    <div className="mt-5 rounded-lg overflow-hidden">
      <MapContainer
        center={position as [number, number]}
        zoom={13}
        style={{ height: "300px", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution="© OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={position as [number, number]}>
          <Popup>Company location</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default JobLocationMap;
