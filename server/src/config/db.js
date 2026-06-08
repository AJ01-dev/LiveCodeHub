import mongoose from 'mongoose';

let memoryServer = null;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const connectDB = async () => {
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

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const conn = await mongoose.connect(uri);
  console.log(`MongoDB Connected: ${conn.connection.host}`);
  return conn;
};

export const connectDBWithRetry = async (maxAttempts = 10, delayMs = 5000) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await connectDB();
    } catch (error) {
      console.error(
        `MongoDB connection attempt ${attempt}/${maxAttempts} failed: ${error.message}`
      );
      if (attempt === maxAttempts) {
        throw error;
      }
      await sleep(delayMs);
    }
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
};
