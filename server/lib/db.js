import mongoose from 'mongoose';

export default async function main() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.warn('MONGODB_URI not set; skipping mongoose.connect');
        return;
    }
    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');
        
        // Drop incorrect index if it exists
        const db = mongoose.connection.db;
        const collection = db.collection('users');
        try {
            await collection.dropIndex('emial_1');
            console.log('Dropped incorrect emial_1 index');
        } catch (err) {
            // Index doesn't exist, that's fine
        }
    } catch (err) {
        console.error('MongoDB connection error:', err);
        throw err;
    }
}