"use client";

import React, { useState } from "react";
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from "@react-google-maps/api";

const center = {
  lat: 6.9271,
  lng: 79.8612,
};

const mapContainerStyle = {
  width: "100%",
  height: "500px",
};

const loaderOptions = {
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  libraries: ["places", "maps"],
};

const AddWaypoints: React.FC = () => {
  const { isLoaded } = useJsApiLoader(loaderOptions);
  const [marker, setMarker] = useState<google.maps.LatLngLiteral | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [searchBox, setSearchBox] = useState<google.maps.places.Autocomplete | null>(null);

  if (!isLoaded) return <div>Loading...</div>;

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng && !marker) {
      const newMarker = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };
      
      setMarker(newMarker);
      
      console.log('Marker placed at:', {
        latitude: newMarker.lat,
        longitude: newMarker.lng
      });
    }
  };

  const handleRemoveMarker = () => {
    setMarker(null);
    console.log('Marker removed');
  };

  const onPlaceSelected = () => {
    if (searchBox) {
      const place = searchBox.getPlace();
      if (place.geometry && place.geometry.location) {
        const newLocation = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        
        // Center the map on the selected location
        map?.panTo(newLocation);
        map?.setZoom(15);
      }
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex gap-4">
        <div className="flex-grow">
          <Autocomplete
            onLoad={setSearchBox}
            onPlaceChanged={onPlaceSelected}
          >
            <input
              type="text"
              placeholder="Search for a location..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </Autocomplete>
        </div>
        <button
          onClick={handleRemoveMarker}
          disabled={!marker}
          className={`font-bold py-2 px-4 rounded transition-colors duration-200 ${
            marker 
              ? 'bg-red-500 hover:bg-red-700 text-white cursor-pointer'
              : 'bg-red-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          Remove Marker
        </button>
      </div>
      <GoogleMap
        center={center}
        zoom={12}
        mapContainerStyle={mapContainerStyle}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
        onClick={handleMapClick}
        onLoad={setMap}
      >
        {marker && <Marker position={marker} />}
      </GoogleMap>
    </div>
  );
};

export default AddWaypoints;