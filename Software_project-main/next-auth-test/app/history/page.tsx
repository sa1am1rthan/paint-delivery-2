'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card, Typography, Button } from "@material-tailwind/react";
import LoggedHeader from '../LoggedHeader';
import Footer from '../Footer';

interface CSVUpload {
    _id: string;
    filename: string;
    uploadedAt: string;
}

export default function History() {
    const [csvUploads, setCSVUploads] = useState<CSVUpload[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await fetch('/api/csv-history');
                if (!response.ok) {
                    throw new Error('Failed to fetch history');
                }
                const data = await response.json();
                setCSVUploads(data.data);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const dateBodyTemplate = (rowData: CSVUpload) => {
        return new Date(rowData.uploadedAt).toLocaleString();
    };

    const handleBackClick = () => {
        router.push('/mappg');
    };

    const handleFilenameClick = async (fileId: string) => {
        console.log('Function called with fileId:', fileId);
        try {
            console.log('Fetching data for fileId:', fileId);
            const response = await fetch(`/api/get-file-data?fileId=${fileId}`);
            
            console.log('Response received:', response.status, response.statusText);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch CSV data: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('Data received:', data);
            
            // Log specific parts of the data
            console.log('Filename:', data.filename);
            console.log('Upload date:', data.uploadedAt);
            console.log('Number of waypoints:', data.waypoints.length);
            console.log('First waypoint:', data.waypoints[0]);

            // Store the data in localStorage for use in the mappg page
            localStorage.setItem('csvData', JSON.stringify(data));

            // Route to the mappg page
            router.push(`/mappg?fileId=${fileId}`);
        } catch (error) {
            console.error('Error in handleFilenameClick:', error);
        }
    };

    const filenameBodyTemplate = (rowData: CSVUpload) => {
        return (
            <Button
                color="blue"
                variant="text"
                className="p-0 underline"
                onClick={() => handleFilenameClick(rowData._id)}
            >
                {rowData.filename}
            </Button>
        );
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <LoggedHeader />
            <div className="min-h-[calc(100vh-140px)] p-4" style={{marginTop:"70px"}}>
                <div className="mb-4">
                <Button
                        color="blue"
                        className="px-4 py-2 text-sm font-bold text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors duration-300 shadow-md"
                        onClick={handleBackClick}
                    >
                        <div style={{display:"flex"}}>
                        <svg style={{width:"20px", marginRight:"10px"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21 16.811c0 .864-.933 1.406-1.683.977l-7.108-4.061a1.125 1.125 0 0 1 0-1.954l7.108-4.061A1.125 1.125 0 0 1 21 8.689v8.122ZM11.25 16.811c0 .864-.933 1.406-1.683.977l-7.108-4.061a1.125 1.125 0 0 1 0-1.954l7.108-4.061a1.125 1.125 0 0 1 1.683.977v8.122Z" />
                        </svg>
                        <div>Back</div>
                        </div>
                    </Button>
                </div>
                <Card className="h-full w-full overflow-scroll">
                    <Typography variant="h4" color="blue-gray" className="p-4">
                        CSV Upload History
                    </Typography>
                    <DataTable value={csvUploads} paginator rows={10} dataKey="_id" 
                               emptyMessage="No CSV uploads found" className="p-datatable-sm">
                        <Column field="filename" header="Filename" body={filenameBodyTemplate} sortable></Column>
                        <Column field="uploadedAt" header="Upload Date" body={dateBodyTemplate} sortable></Column>
                    </DataTable>
                </Card>
            </div>
            <Footer />
        </>
    );
}