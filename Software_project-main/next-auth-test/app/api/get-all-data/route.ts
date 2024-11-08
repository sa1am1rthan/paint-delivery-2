import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function GET() {
    try {
        console.log("Fetching all form submissions...");
        
        // Log the connection string (for debugging purposes only)
        console.log("MongoDB URI:", process.env.MONGODB_URI);

        // Connect to MongoDB
        const client = await MongoClient.connect(process.env.MONGODB_URI as string);
        const db = client.db('test'); // Use your database name

        // Fetch all documents from formUploads collection
        const submissions = await db.collection('formUploads')
            .find({})
            .sort({ uploadedAt: -1 }) // Sort by upload date, newest first
            .toArray();

        // Log the fetched submissions
        console.log("Fetched submissions:", submissions);

        // Close the connection
        await client.close();

        console.log(`Successfully fetched ${submissions.length} submissions`);

        // Return the data
        return NextResponse.json({ 
            success: true, 
            data: submissions.map(submission => ({
                ...submission,
                approval: submission.approval || 'no' // Ensure approval field is included
            })),
            count: submissions.length
        }, {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });

    } catch (error) {
        console.error('Error fetching form submissions:', error);
        
        return NextResponse.json({ 
            success: false, 
            message: 'Error fetching form submissions',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { 
            status: 500 
        });
    }
}

// Optionally, add a POST method to fetch specific data based on criteria
export async function POST(request: Request) {
    try {
        const { filter = {} } = await request.json(); // Get filter criteria from request body
        
        const client = await MongoClient.connect(process.env.MONGODB_URI as string);
        const db = client.db('test');

        // Fetch documents matching the filter criteria
        const submissions = await db.collection('formUploads')
            .find(filter)
            .sort({ uploadedAt: -1 })
            .toArray();

        await client.close();

        console.log(`Successfully fetched ${submissions.length} filtered submissions`);

        return NextResponse.json({ 
            success: true, 
            data: submissions.map(submission => ({
                ...submission,
                approval: submission.approval || 'no' // Ensure approval field is included
            })),
            count: submissions.length
        });

    } catch (error) {
        console.error('Error fetching filtered submissions:', error);
        
        return NextResponse.json({ 
            success: false, 
            message: 'Error fetching filtered submissions',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { 
            status: 500 
        });
    }
}
