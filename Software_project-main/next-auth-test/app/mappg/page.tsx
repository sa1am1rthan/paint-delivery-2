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
import { Table, Select } from 'antd';
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

interface DeliveryData {
  name: string;
  address: string;
  city: string;
  orderNumber: string;
  contactNumber: string;
  latitude: number;
  longitude: number;
  deliveryStatus: string;
  approval?: string;
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
  const [pendingDeliveries, setPendingDeliveries] = useState<DeliveryData[]>([]);
  const [allDeliveries, setAllDeliveries] = useState<DeliveryData[]>([]);

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

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const response = await fetch('/api/get-all-data');
        if (!response.ok) {
          throw new Error('Failed to fetch deliveries');
        }
        const result = await response.json();
        
        if (Array.isArray(result.data)) {
          // Store all deliveries
          setAllDeliveries(result.data);
          
          // Filter for pending deliveries only
          const pendingOnly = result.data.filter(
            (delivery: DeliveryData) => delivery.deliveryStatus === 'pending'
          );
          setPendingDeliveries(pendingOnly);
          
          // Call getOptimizedRoute with pending deliveries only
          if (pendingOnly.length > 0) {
            getOptimizedRoute(pendingOnly);
          }
        }
      } catch (error) {
        console.error('Error fetching deliveries:', error);
      }
    };

    fetchDeliveries();
  }, []);

  // New function to fetch approval pending deliveries
  const fetchApprovalPendingDeliveries = () => {
    return allDeliveries.filter(
      (delivery: DeliveryData) => 
        delivery.deliveryStatus === 'delivered' && 
        (delivery.approval === 'no' || !delivery.approval)
    );
  };

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

  const getOptimizedRoute = async (deliveries: DeliveryData[]) => {
    console.log("Getting optimized route for pending deliveries:", deliveries);
    
    // Filter out any delivered items
    const pendingDeliveries = deliveries.filter(
      delivery => delivery.deliveryStatus !== 'delivered' 
    );
    
    // Create LatLng locations array for pending deliveries only
    const locations = pendingDeliveries.map(delivery => ({
      lat: delivery.latitude,
      lng: delivery.longitude,
      name: delivery.name,
      orderNumber: delivery.orderNumber,
      address: delivery.address,
      city: delivery.city,
      deliveryStatus: delivery.deliveryStatus
    }));

    // Add origin/destination location
    const geocoder = new google.maps.Geocoder();
    try {
      const originResult = await new Promise((resolve, reject) => {
        geocoder.geocode({ address: ORIGIN_DESTINATION_ADDRESS }, (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results) {
            resolve(results[0].geometry.location);
          } else {
            reject(status);
          }
        });
      });

      const originLocation = {
        lat: (originResult as google.maps.LatLng).lat(),
        lng: (originResult as google.maps.LatLng).lng(),
        name: 'Warehouse',
        orderNumber: 'N/A',
        address: ORIGIN_DESTINATION_ADDRESS,
        city: 'Negombo'
      };

      // Add origin to start and end of locations array
      const allLocations = [originLocation, ...locations];

      // Get distance matrix using coordinates
      const directionsService = new google.maps.DirectionsService();
      const waypoints = locations.map(location => ({
        location: new google.maps.LatLng(location.lat, location.lng),
        stopover: true
      }));

      directionsService.route(
        {
          origin: new google.maps.LatLng(originLocation.lat, originLocation.lng),
          destination: new google.maps.LatLng(originLocation.lat, originLocation.lng),
          waypoints: waypoints,
          optimizeWaypoints: true,
          travelMode: google.maps.TravelMode.DRIVING,
          drivingOptions: {
            departureTime: new Date(),
            trafficModel: google.maps.TrafficModel.BEST_GUESS,
          },
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            setDirections(result);
            
            // Get the optimized waypoint order
            const waypointOrder = result.routes[0].waypoint_order;
            
            // Create optimized route data using the waypoint order
            const optimizedData = result.routes[0].legs.map((leg, index) => {
              const currentDelivery = index < waypointOrder.length ? 
                locations[waypointOrder[index]] : 
                originLocation;
              
              const previousDelivery = index === 0 ? 
                originLocation : 
                locations[waypointOrder[index - 1]];

              return {
                key: index,
                orderNumber: currentDelivery.orderNumber,
                customerName: currentDelivery.name,
                start: `${previousDelivery.address}, ${previousDelivery.city}`,
                end: `${currentDelivery.address}, ${currentDelivery.city}`,
                distance: leg.distance?.text || 'N/A',
                duration: leg.duration?.text || 'N/A',
                deliveryStatus: currentDelivery.deliveryStatus
              };
            });

            setOptimizedRouteData(optimizedData);
            setMarkers(allLocations);
          } else {
            console.error(`Error fetching directions: ${status}`, result);
          }
        }
      );

    } catch (error) {
      console.error('Error in route optimization:', error);
    }
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

  // Add function to handle status change
  const handleStatusChange = async (value: string, record: any) => {
    try {
      const response = await fetch('/api/update-delivery-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderNumber: record.orderNumber,
          deliveryStatus: value
        }),
      });

      if (response.ok) {
        // Update both allDeliveries and optimizedRouteData states
        setAllDeliveries(prevDeliveries =>
          prevDeliveries.map(delivery =>
            delivery.orderNumber === record.orderNumber
              ? { ...delivery, deliveryStatus: value }
              : delivery
          )
        );

        setOptimizedRouteData(prevData =>
          prevData.map(item =>
            item.orderNumber === record.orderNumber
              ? { ...item, deliveryStatus: value }
              : item
          )
        );

        // If status is changed to 'delivered', update pending deliveries
        if (value === 'delivered') {
          setPendingDeliveries(prevPending =>
            prevPending.filter(delivery => delivery.orderNumber !== record.orderNumber)
          );
        }
      } else {
        console.error('Failed to update delivery status');
      }
    } catch (error) {
      console.error('Error updating delivery status:', error);
    }
  };

  // Define columns for the pending deliveries table
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'City',
      dataIndex: 'city',
      key: 'city',
    },
    {
      title: 'Order Number',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
    },
    {
      title: 'Contact Number',
      dataIndex: 'contactNumber',
      key: 'contactNumber',
    },
  ];

  // Define columns for the optimized route table
  const optimizedRouteColumns = [
    {
      title: 'Order Number',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
    },
    {
      title: 'Customer Name',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Start Location',
      dataIndex: 'start',
      key: 'start',
    },
    {
      title: 'End Location',
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
    {
      title: 'Status',
      dataIndex: 'deliveryStatus',
      key: 'deliveryStatus',
      render: (status: string, record: DeliveryData) => (
        <Select
          value={status}
          style={{ width: 120 }}
          onChange={(value) => handleStatusChange(value, record)}
          options={[
            { value: 'pending', label: 'Pending' },
            { value: 'delivered', label: 'Delivered' },
          ]}
        />
      ),
    },
  ];

  // Define columns for the pending approval table without the approval status
  const pendingApprovalColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'City',
      dataIndex: 'city',
      key: 'city',
    },
    {
      title: 'Order Number',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
    },
    {
      title: 'Contact Number',
      dataIndex: 'contactNumber',
      key: 'contactNumber',
    },
  ];

  // Function to approve all pending approvals
  const approveAllPending = async () => {
    const pendingApprovalData = fetchApprovalPendingDeliveries();
    try {
      const response = await fetch('/api/approve-deliveries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderNumbers: pendingApprovalData.map(delivery => delivery.orderNumber),
        }),
      });

      if (response.ok) {
        console.log('All pending approvals have been approved.');
        // Update allDeliveries state to reflect the changes
        setAllDeliveries(prevDeliveries =>
          prevDeliveries.map(delivery =>
            pendingApprovalData.some(pending => pending.orderNumber === delivery.orderNumber)
              ? { ...delivery, approval: 'approved' }
              : delivery
          )
        );
      } else {
        console.error('Failed to approve pending deliveries.');
      }
    } catch (error) {
      console.error('Error approving pending deliveries:', error);
    }
  };

  if (!isLoaded) return <div>Loading...</div>;

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
            <h2 className="text-xl font-bold my-4">Pending Deliveries</h2>
            <Table 
              dataSource={pendingDeliveries} 
              columns={columns} 
              rowKey="orderNumber"
            />
            <h2 className="text-xl font-bold my-4">Optimized Route</h2>
            <Table 
              dataSource={optimizedRouteData} 
              columns={optimizedRouteColumns} 
            />
            <h2 className="text-xl font-bold my-4">Pending Approval</h2>
            <Table 
              dataSource={fetchApprovalPendingDeliveries()} 
              columns={pendingApprovalColumns} 
              rowKey="orderNumber"
            />
            <Button onClick={approveAllPending} className="mt-4">
              Approve All Pending
            </Button>
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
      <Footer handleHomeClick={() => router.push('/home')} />
    </>
  );
};

export default MapComponent;
