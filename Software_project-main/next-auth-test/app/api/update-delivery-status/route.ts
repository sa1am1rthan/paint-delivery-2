import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function POST(request: Request) {
    console.log('Update delivery status API called');
    
    try {
        const { orderNumber, deliveryStatus } = await request.json();
        console.log('Received data:', { orderNumber, deliveryStatus });

        if (!orderNumber || !deliveryStatus) {
            console.error('Missing required fields');
            return NextResponse.json({ 
                success: false, 
                message: 'Order number and delivery status are required' 
            }, { status: 400 });
        }

        const client = await MongoClient.connect(process.env.MONGODB_URI as string);
        console.log('Connected to MongoDB');
        
        const db = client.db('test');
        const collection = db.collection('formUploads');

        // Log the document we're trying to update
        const existingDoc = await collection.findOne({ orderNumber: orderNumber });
        console.log('Existing document:', existingDoc);

        const result = await collection.updateOne(
            { orderNumber: orderNumber },
            { 
                $set: { 
                    deliveryStatus: deliveryStatus,
                    updatedAt: new Date()
                } 
            }
        );

        await client.close();
        console.log('Update result:', result);

        if (result.matchedCount === 0) {
            console.error('No matching document found');
            return NextResponse.json({ 
                success: false, 
                message: 'No delivery found with this order number' 
            }, { status: 404 });
        }

        return NextResponse.json({ 
            success: true, 
            message: 'Delivery status updated successfully',
            result: result
        });

    } catch (error) {
        console.error('Error updating delivery status:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Error updating delivery status',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
} 