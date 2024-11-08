"use client";

import React, { useState } from "react";
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from "@react-google-maps/api";
import LoggedHeader from '../LoggedHeader';
import Footer from '../Footer';
import { Button } from "@material-tailwind/react";
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  const { isLoaded } = useJsApiLoader(loaderOptions);
  const [marker, setMarker] = useState<google.maps.LatLngLiteral | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [searchBox, setSearchBox] = useState<google.maps.places.Autocomplete | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    orderNumber: '',
    contactNumber: '',
  });

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

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUploadMarker = async () => {
    if (!marker) return;
    
    try {
      const response = await fetch('/api/upload-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          address: formData.address,
          city: formData.city,
          orderNumber: formData.orderNumber,
          contactNumber: formData.contactNumber,
          latitude: marker.lat,
          longitude: marker.lng,
          deliveryStatus: 'pending',
          approval: 'no'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to upload data');
      }

      const data = await response.json();
      console.log('Data uploaded successfully:', data);
      // Clear form and marker after successful upload
      setMarker(null);
      setFormData({
        name: '',
        address: '',
        city: '',
        orderNumber: '',
        contactNumber: '',
      });
    } catch (error) {
      console.error('Error uploading data:', error);
    }
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

  const handleBackClick = () => {
    router.push('/mappg');
  };

  return (
    <>
    <LoggedHeader />
    <div className="min-h-[calc(100vh-140px)] p-4" style={{marginTop:"70px"}}>
      <div className="mb-4">
        <Button
          onClick={handleBackClick}
          className="mt-4 flex items-center gap-2 px-6 py-3 font-sans text-xs font-bold text-center text-white uppercase align-middle transition-all rounded-lg select-none hover:bg-blue-gray-900/10 active:bg-blue-gray-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
        >
          Back
        </Button>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Customer Details Form */}
          <div className="space-y-4 bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Customer Details</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Number
              </label>
              <input
                type="text"
                name="orderNumber"
                value={formData.orderNumber}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number
              </label>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Map Section */}
          <div className="space-y-4">
            <div className="flex gap-4">
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
                onClick={handleUploadMarker}
                disabled={!marker || !formData.name || !formData.address || !formData.city || !formData.orderNumber || !formData.contactNumber}
                className={`font-bold py-2 px-4 rounded transition-colors duration-200 ${
                  marker && formData.name && formData.address && formData.city && formData.orderNumber && formData.contactNumber
                    ? 'bg-green-500 hover:bg-green-700 text-white cursor-pointer'
                    : 'bg-green-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                Upload Data
              </button>
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
        </div>
      </div>
    </div>

    <Footer />
    </>
  );
};

export default AddWaypoints;