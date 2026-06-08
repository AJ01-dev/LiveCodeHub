import mongoose from 'mongoose';

let memoryServer = null;

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;

    if (process.env.USE_MEMORY_DB === 'true') {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      uri = memoryServer.getUri('codecollab');
      console.log('Using in-memory MongoDB for development');
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
