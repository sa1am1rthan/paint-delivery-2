import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function POST(request: Request) {
    console.log('Approve deliveries API called');
    
    try {
        const { orderNumbers } = await request.json();
        console.log('Received data:', { orderNumbers });

        if (!Array.isArray(orderNumbers) || orderNumbers.length === 0) {
            console.error('Missing required fields');
            return NextResponse.json({ 
                success: false, 
                message: 'Order numbers are required and must be an array' 
            }, { status: 400 });
        }

        const client = await MongoClient.connect(process.env.MONGODB_URI as string);
        console.log('Connected to MongoDB');
        
        const db = client.db('test');
        const collection = db.collection('formUploads');

        // Log the documents we're trying to update
        const existingDocs = await collection.find({ orderNumber: { $in: orderNumbers } }).toArray();
        console.log('Existing documents:', existingDocs);

        const result = await collection.updateMany(
            { orderNumber: { $in: orderNumbers } },
            { 
                $set: { 
                    approval: 'approved',
                    updatedAt: new Date()
                } 
            }
        );

        await client.close();
        console.log('Update result:', result);

        if (result.matchedCount === 0) {
            console.error('No matching documents found');
            return NextResponse.json({ 
                success: false, 
                message: 'No deliveries found with these order numbers' 
            }, { status: 404 });
        }

        return NextResponse.json({ 
            success: true, 
            message: 'Deliveries approved successfully',
            modifiedCount: result.modifiedCount
        });

    } catch (error) {
        console.error('Error approving deliveries:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Error approving deliveries',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
} 