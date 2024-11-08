import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function POST(request: Request) {
    try {
        const data = await request.json();

        // Connect to MongoDB
        const client = await MongoClient.connect(process.env.MONGODB_URI as string);
        const db = client.db('test'); // Use your database name

        // Insert the new document into the formUploads collection
        const result = await db.collection('formUploads').insertOne({
            ...data,
            approval: data.approval || 'no', // Ensure approval field is included
            uploadedAt: new Date() // Add a timestamp for when the data was uploaded
        });

        // Close the connection
        await client.close();

        console.log('Data uploaded successfully:', result);

        return NextResponse.json({ 
            success: true, 
            message: 'Data uploaded successfully',
            data: { insertedId: result.insertedId } // Use insertedId instead of ops
        }, {
            status: 201,
            headers: {
                'Content-Type': 'application/json',
            },
        });

    } catch (error) {
        console.error('Error uploading data:', error);
        
        return NextResponse.json({ 
            success: false, 
            message: 'Error uploading data',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { 
            status: 500 
        });
    }
}

// Optional: GET method to retrieve form submissions
export async function GET() {
    try {
        console.log("Fetching form submissions...");
        const client = await MongoClient.connect(process.env.MONGODB_URI as string);
        const db = client.db('test');

        const submissions = await db.collection('formUploads')
            .find({})
            .sort({ uploadedAt: -1 })
            .toArray();

        await client.close();

        return NextResponse.json({ 
            success: true, 
            data: submissions 
        });

    } catch (error) {
        console.error('Error fetching form submissions:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Error fetching form submissions' 
        }, { status: 500 });
    }
}