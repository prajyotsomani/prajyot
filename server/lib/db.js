import mongoose from 'mongoose';

export default async function main() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.warn('MONGODB_URI not set; skipping mongoose.connect');
        return;
    }
    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            retryWrites: true,
            connectTimeoutMS: 10000
        });
        console.log('Connected to MongoDB');
        
        // Wait for connection to be ready before accessing db
        if (mongoose.connection.readyState === 1) {
            const db = mongoose.connection.db;
            if (db) {
                const collection = db.collection('users');
                try {
                    await collection.dropIndex('emial_1');
                    console.log('Dropped incorrect emial_1 index');
                } catch (err) {
                    // Index doesn't exist, that's fine
                    console.log('Index drop skipped:', err.message);
                }
            } else {
                console.warn('Database object not available');
            }
        }
    } catch (err) {
        console.error('MongoDB connection error:', err);
        throw err;
    }
}