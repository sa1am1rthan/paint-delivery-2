"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  DirectionsRenderer,
  Marker,
} from "@react-google-maps/api";
import * as XLSX from "xlsx";
import { IconButton, Drawer, Button } from "@material-tailwind/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Sidebar from '../dashboardpage/Sidebar';
import { Table } from 'antd';
import LoggedHeader from "../LoggedHeader";
import Footer from "../Footer";
import { useRouter } from 'next/navigation';

console.log('mappg/page.tsx loaded');

const center = {
  lat: 6.9271,
  lng: 79.8612,
};

// Set constant origin and destination address
const ORIGIN_DESTINATION_ADDRESS = "357 Negombo - Colombo Main Rd, Negombo 11500";
const state = "admin";

interface RouteData {
  deliveryDate: string;
  location: string;
}

// Define the loader options outside of the component
const loaderOptions = {
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  libraries: ["places", "maps"],
};

const MapComponent: React.FC = (role, state) => {
  console.log("MapComponent rendered");
  const { isLoaded } = useJsApiLoader(loaderOptions);

  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [tableData, setTableData] = useState<RouteData[]>([]);
  const [markers, setMarkers] = useState<{ lat: number; lng: number }[]>([]);
  const [optimizedRouteData, setOptimizedRouteData] = useState<any[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapSize, setMapSize] = useState({ width: "1200px", height: "500px" });
  const [fileId, setFileId] = useState<string | null>(null);
  const [csvWaypoints, setCsvWaypoints] = useState<string[]>([]);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const updateMapSize = () => {
    if (mapRef.current) {
      const width = mapRef.current.offsetWidth;
      setMapSize({ width: `${width}px`, height: "500px" });
    }
  };

  useEffect(() => {
    console.log("useEffect called");
    const params = new URLSearchParams(window.location.search);
    const id = params.get('fileId');
    console.log("FileId from URL:", id);
    if (id) {
      setFileId(id);
      // Retrieve CSV data from localStorage
      const storedData = localStorage.getItem('csvData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        console.log("Retrieved CSV data:", parsedData);
        setCsvWaypoints(parsedData.waypoints);

        // Update tableData
        const newTableData = parsedData.waypoints.map((waypoint: string, index: number) => ({
          key: index,
          deliveryDate: new Date().toISOString().split('T')[0], // You might want to adjust this if you have actual delivery dates
          location: waypoint,
        }));
        setTableData(newTableData);

        // Clear the data from localStorage after retrieving it
        localStorage.removeItem('csvData');
        
        // Call getOptimizedRoute with the retrieved waypoints
        getOptimizedRoute(parsedData.waypoints);
      }
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 960);
      updateMapSize();
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchFileFromDatabase = async (id: string) => {
    console.log("fetchFileFromDatabase called with id:", id);
    try {
      const response = await fetch(`/api/get-file-data?fileId=${id}`);
      console.log("API response received:", response.status);
      if (response.ok) {
        const fileData = await response.json();
        console.log("File data received:", fileData);
        
        if (!fileData.content) {
          console.error("File content is missing");
          return;
        }
        
        // Create a File object from the fetched data
        const blob = new Blob([atob(fileData.content)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const file = new File([blob], fileData.filename, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        
        console.log("Created File object:", file);
        
        // Call handleFileUpload with the created File object
        handleFileUpload({ target: { files: [file] } } as React.ChangeEvent<HTMLInputElement>);
      } else {
        console.error('Failed to fetch file data. Status:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Error fetching file data:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("File to upload:", file.name, file.size, file.type);
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', file);

      try {
        // Send the file to the server
        console.log("Sending file to server...");
        const response = await fetch('/api/upload-csv', {
          method: 'POST',
          body: formData,
        });

        console.log("Upload response status:", response.status);
        if (response.ok) {
          const result = await response.json();
          console.log('File uploaded successfully:', result);
          // Process the file for display
          processFileForDisplay(file);
        } else {
          console.error('Failed to upload file. Status:', response.status);
          const errorText = await response.text();
          console.error('Error response:', errorText);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    } else {
      console.error("No file selected");
    }
  };

  const processFileForDisplay = (file: File) => {
    console.log("Processing file for display:", file.name, file.size, file.type);
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      if (data) {
        console.log("File data loaded, length:", (data as ArrayBuffer).byteLength);
        try {
          const workbook = XLSX.read(data, { type: "array" });
          console.log("Workbook sheets:", workbook.SheetNames);
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json<RouteData>(sheet, { header: 1 });

          console.log("Parsed JSON data (first 5 rows):", jsonData.slice(0, 5));

          // Parse the locations starting from the second row (skip header)
          const waypoints = jsonData.slice(1).map((row: any) => row[1]); // Assuming location data is in the second column

          console.log("Extracted waypoints (first 5):", waypoints.slice(0, 5));

          setTableData(
            jsonData.slice(1).map((row: any) => ({
              deliveryDate: row[0],
              location: row[1],
            }))
          );

          // Call optimized route calculation using the waypoints
          getOptimizedRoute(waypoints);
        } catch (error) {
          console.error("Error processing file:", error);
        }
      } else {
        console.error("No data loaded from file");
      }
    };
    reader.onerror = (error) => {
      console.error("FileReader error:", error);
    };
    reader.readAsArrayBuffer(file);
  };

  const getOptimizedRoute = async (waypointArray: string[]) => {
    console.log("Getting optimized route for waypoints:", waypointArray);
    const departureTime = Math.floor(Date.now() / 1000);
    const directionsResponse = await fetch("/api/get-directions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ waypoints: waypointArray, departureTime }),
    });

    const distanceMatrixData = await directionsResponse.json();

    const tspRoute = [0];
    const visited = new Array(waypointArray.length).fill(false);
    visited[0] = true;

    for (let i = 0; i < waypointArray.length - 1; i++) {
      let last = tspRoute[tspRoute.length - 1];
      let nearest = -1;
      let nearestTime = Number.MAX_VALUE;

      distanceMatrixData.rows[last].elements.forEach(
        (element: any, index: number) => {
          if (!visited[index] && element.duration_in_traffic.value < nearestTime) {
            nearest = index;
            nearestTime = element.duration_in_traffic.value;
          }
        }
      );

      tspRoute.push(nearest);
      visited[nearest] = true;
    }

    const optimizedRoute = tspRoute.map((index) => waypointArray[index]);

    const validRoute = [ORIGIN_DESTINATION_ADDRESS, ...optimizedRoute, ORIGIN_DESTINATION_ADDRESS];

    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: ORIGIN_DESTINATION_ADDRESS,
        destination: ORIGIN_DESTINATION_ADDRESS,
        waypoints: validRoute.slice(1, -1).map((location) => ({
          location,
          stopover: true,
        })),
        travelMode: google.maps.TravelMode.DRIVING,
        drivingOptions: {
          departureTime: new Date(),
          trafficModel: google.maps.TrafficModel.BEST_GUESS,
        },
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirections(result);
          setOptimizedRouteData(
            result.routes[0].legs.map((leg, index) => ({
              key: index,
              start: leg.start_address,
              end: leg.end_address,
              distance: leg.distance?.text,
              duration: leg.duration?.text,
            }))
          );
        } else {
          console.error(`Error fetching directions: ${status}`, result);
        }
      }
    );

    // Set markers based on optimized route
    const geocoder = new google.maps.Geocoder();
    validRoute.forEach((address) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results) {
          const location = results[0].geometry.location;
          setMarkers((prevMarkers) => [...prevMarkers, { lat: location.lat(), lng: location.lng() }]);
        } else {
          console.error(`Geocoding error: ${status}`);
        }
      });
    });
  };

  const handleLogout = async () => {
    await fetch('/api/logout');
    router.push('/');
  };

  const handleHomeClick = () => {
    router.push('/admin');
  };

  const handleAddCsvClick = () => {
    fileInputRef.current?.click();
  };

  const handleFetchFile = () => {
    console.log("Fetch file button clicked");
    if (fileId) {
      fetchFileFromDatabase(fileId);
    } else {
      console.log("No fileId available");
    }
  };

  if (!isLoaded) return <div>Loading...</div>;

  const columns = [
    {
      title: 'Delivery Date',
      dataIndex: 'deliveryDate',
      key: 'deliveryDate',
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
  ];

  const optimizedRouteColumns = [
    {
      title: 'Start',
      dataIndex: 'start',
      key: 'start',
    },
    {
      title: 'End',
      dataIndex: 'end',
      key: 'end',
    },
    {
      title: 'Distance',
      dataIndex: 'distance',
      key: 'distance',
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
    },
  ];

  return (
    <>
      <LoggedHeader />
      <div className="flex h-[calc(100vh-70px)]" style={{ marginTop: "70px" }}>
        {isMobile ? (
          <div>
            <IconButton variant="text" size="lg" onClick={openDrawer}>
              {isDrawerOpen ? (
                <XMarkIcon className="h-8 w-8 stroke-2" />
              ) : (
                <Bars3Icon className="h-8 w-8 stroke-2" />
              )}
            </IconButton>
            <Drawer open={isDrawerOpen} onClose={closeDrawer}>
              <Sidebar handleLogout={handleLogout} handleAddCsvClick={handleAddCsvClick} role={role} state={state} />
            </Drawer>
          </div>
        ) : (
          <div className="flex-shrink-0">
            <Sidebar handleLogout={handleLogout} handleAddCsvClick={handleAddCsvClick} role={role} state={state} />
          </div>
        )}
        <div className="flex-grow p-4 overflow-y-auto">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx"
            style={{ display: "none" }}
          />
          {/* <button onClick={handleFetchFile}>Fetch File</button> */}
          <div className="relative flex justify-center items-center" ref={mapRef}>
            <GoogleMap
              center={center}
              zoom={12}
              mapContainerStyle={mapSize}
              options={{
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
              }}
            >
              {directions && <DirectionsRenderer directions={directions} />}
              {markers.map((marker, index) => (
                <Marker key={index} position={marker} />
              ))}
            </GoogleMap>
          </div>
          <div>
            <h2> </h2>
            <Table dataSource={tableData} columns={columns} />
            <h2>Optimized Route</h2>
            <Table dataSource={optimizedRouteData} columns={optimizedRouteColumns} />
          </div>
          {/* {csvWaypoints.length > 0 && (
            <div>
              <h2>CSV Waypoints</h2>
              <ul>
                {csvWaypoints.map((waypoint, index) => (
                  <li key={index}>{waypoint}</li>
                ))}
              </ul>
            </div>
          )} */}
        </div>
      </div>
      <Footer handleHomeClick={handleHomeClick} />
    </>
  );
};

export default MapComponent;
