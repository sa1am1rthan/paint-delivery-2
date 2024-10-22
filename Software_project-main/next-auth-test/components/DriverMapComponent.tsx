'use client';

import React from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import LoggedHeader from '../app/LoggedHeader';
import Footer from '../app/Footer';
import Sidebar from '../app/dashboardpage/Sidebar';

const center = {
  lat: 6.9271,
  lng: 79.8612,
};

// Use the same loader options
const loaderOptions = {
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  libraries: ["places", "maps"],
};

const DriverMapComponent: React.FC = (role) => {
  const { isLoaded } = useJsApiLoader(loaderOptions);
  const state = "driver";

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <>
    <LoggedHeader /> <br/>
    <Sidebar role={role} state={state}/>
    <div style={{ height: '100vh', width: '100%' }}>
      <GoogleMap
        mapContainerStyle={{ height: '100%', width: '100%' }}
        center={center}
        zoom={10}
      >
        <Marker position={center} />
      </GoogleMap>
    </div>
    <Footer />
    </>
  );
};

export default DriverMapComponent;
