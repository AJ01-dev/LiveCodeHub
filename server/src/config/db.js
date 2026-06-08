import mongoose from 'mongoose';

let memoryServer = null;

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;
    const useMemoryDb =
      process.env.USE_MEMORY_DB === 'true' && process.env.NODE_ENV !== 'production';

    if (useMemoryDb) {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      uri = memoryServer.getUri('codecollab');
      console.log('Using in-memory MongoDB for development');
    } else {
      if (!uri) {
        throw new Error(
          'MONGODB_URI is required. Add your Atlas connection string in Render Environment.'
        );
      }
      if (process.env.USE_MEMORY_DB === 'true') {
        console.warn('USE_MEMORY_DB ignored in production — using MONGODB_URI');
      }
    }

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
};

export default connectDB;
