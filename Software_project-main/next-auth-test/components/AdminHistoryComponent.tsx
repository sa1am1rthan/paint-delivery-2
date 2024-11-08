'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card, Typography, Button } from "@material-tailwind/react";
import LoggedHeader from '../app/LoggedHeader';
import Footer from '../app/Footer';

interface DeliveryData {
    _id: string;
    name: string;
    address: string;
    city: string;
    orderNumber: string;
    contactNumber: string;
    deliveryStatus: string;
    approval: string;
    uploadedAt: string;
}

export default function History() {
    const [deliveryHistory, setDeliveryHistory] = useState<DeliveryData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await fetch('/api/get-all-data');
                if (!response.ok) {
                    throw new Error('Failed to fetch history');
                }
                const data = await response.json();
                const completedDeliveries = data.data.filter((delivery: DeliveryData) => 
                    delivery.deliveryStatus === 'delivered' && 
                    delivery.approval === 'approved'
                );
                setDeliveryHistory(completedDeliveries);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const dateBodyTemplate = (rowData: DeliveryData) => {
        return new Date(rowData.uploadedAt).toLocaleString();
    };

    const handleBackClick = () => {
        router.push('/mappg');
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <LoggedHeader />
            <div className="min-h-[calc(100vh-140px)] p-4" style={{marginTop:"70px"}}>
                <div className="mb-4 flex gap-4">
                    <Button
                        onClick={handleBackClick}
                        className="mt-4 flex items-center gap-2 px-6 py-3 font-sans text-xs font-bold text-center text-white uppercase align-middle transition-all rounded-lg select-none hover:bg-blue-gray-900/10 active:bg-blue-gray-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                    >
                        Back to Map
                    </Button>
                    
                </div>
                <Card className="h-full w-full overflow-scroll">
                    <Typography variant="h4" color="blue-gray" className="p-4">
                        Delivery History
                    </Typography>
                    <DataTable 
                        value={deliveryHistory} 
                        paginator 
                        rows={10} 
                        dataKey="_id" 
                        emptyMessage="No completed deliveries found" 
                        className="p-datatable-sm"
                    >
                        <Column field="orderNumber" header="Order Number" sortable></Column>
                        <Column field="name" header="Customer Name" sortable></Column>
                        <Column field="address" header="Address" sortable></Column>
                        <Column field="city" header="City" sortable></Column>
                        <Column field="contactNumber" header="Contact Number" sortable></Column>
                        <Column field="uploadedAt" header="Date" body={dateBodyTemplate} sortable></Column>
                    </DataTable>
                </Card>
            </div>
            <Footer />
        </>
    );
}