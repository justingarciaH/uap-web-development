// src/lib/mongodb.ts
import mongoose from 'mongoose';

if (!process.env.MONGO_URL) {
  throw new Error('Por favor define la variable de entorno MONGO_URL en .env.local');
}

const MONGODB_URI = process.env.MONGO_URL;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Cachear la conexión en desarrollo para evitar múltiples conexiones en hot reload
declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    console.log('📦 Usando conexión existente a MongoDB');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log('🔄 Conectando a MongoDB...');
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ Conectado a MongoDB exitosamente');
      return mongoose;
    }).catch((error) => {
      console.error('❌ Error de conexión a MongoDB:', error);
      cached.promise = null; // Reset promise on error
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('❌ Error al conectar a MongoDB:', e);
    throw e;
  }

  return cached.conn;
}

export default connectDB;