// // lib/db.js
// import { MongoClient } from 'mongodb';

// const MONGODB_URI = process.env.MONGODB_URI;
// const MONGODB_DB = process.env.MONGODB_DB;

// let cached = global.mongo;
// if (!cached) {
//   cached = global.mongo = { conn: null, promise: null };
// }

// export async function connectToDatabase() {
//   if (cached.conn) return cached.conn;
  
//   if (!cached.promise) {
//     cached.promise = MongoClient.connect(MONGODB_URI).then((client) => {
//       return {
//         client,
//         db: client.db(MONGODB_DB),
//       };
//     });
//   }
  
//   cached.conn = await cached.promise;
//   return cached.conn;
// }

// app/lib/db.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  console.warn('MongoDB URI not found. Database features will be disabled.');
  // Return mock connection for development without DB
  clientPromise = Promise.resolve({
    db: () => ({
      collection: () => ({
        insertOne: async () => ({ insertedId: 'mock-id' }),
        findOne: async () => null,
        find: () => ({
          toArray: async () => []
        })
      })
    })
  });
} else {
  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable to preserve the connection
    // across module reloads caused by HMR (Hot Module Replacement)
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    // In production mode, create a new connection
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
}

/**
 * Connect to MongoDB database
 * @returns {Promise<{db: Db, client: MongoClient}>}
 */
export async function connectToDatabase() {
  try {
    const client = await clientPromise;
    const db = client.db('certificates');
    return { db, client };
  } catch (error) {
    console.error('Database connection error:', error);
    throw new Error('Failed to connect to database');
  }
}

/**
 * Get certificates collection
 * @returns {Promise<Collection>}
 */
export async function getCertificatesCollection() {
  const { db } = await connectToDatabase();
  return db.collection('certificates');
}

/**
 * Save certificate to database
 * @param {Object} certificateData - Certificate data to save
 * @returns {Promise<Object>} Inserted certificate document
 */
export async function saveCertificate(certificateData) {
  try {
    const collection = await getCertificatesCollection();
    
    // Prepare data for storage
    const dataToSave = {
      ...certificateData,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };
    
    // If employeeImage is too large for MongoDB (16MB limit),
    // you might want to store it separately or skip it
    if (dataToSave.employeeImage && dataToSave.employeeImage.length > 10 * 1024 * 1024) {
      console.warn('Employee image too large, storing without image');
      delete dataToSave.employeeImage;
    }
    
    const result = await collection.insertOne(dataToSave);
    return { success: true, insertedId: result.insertedId };
  } catch (error) {
    console.error('Error saving certificate:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Find certificate by certificate number and PIN
 * @param {string} certificateNumber - Certificate number
 * @param {string} pin - Verification PIN
 * @returns {Promise<Object|null>} Certificate document or null
 */
export async function findCertificate(certificateNumber, pin) {
  try {
    const collection = await getCertificatesCollection();
    const certificate = await collection.findOne({
      certificateNumber,
      verificationPin: pin,
      isActive: true
    });
    return certificate;
  } catch (error) {
    console.error('Error finding certificate:', error);
    return null;
  }
}

/**
 * Get all certificates
 * @param {Object} filter - Optional filter
 * @param {Object} options - Query options (limit, sort, etc.)
 * @returns {Promise<Array>} Array of certificates
 */
export async function getAllCertificates(filter = {}, options = {}) {
  try {
    const collection = await getCertificatesCollection();
    const certificates = await collection
      .find(filter)
      .sort(options.sort || { createdAt: -1 })
      .limit(options.limit || 100)
      .toArray();
    return certificates;
  } catch (error) {
    console.error('Error getting certificates:', error);
    return [];
  }
}

/**
 * Update certificate status
 * @param {string} certificateNumber - Certificate number
 * @param {boolean} isActive - Active status
 * @returns {Promise<Object>} Update result
 */
export async function updateCertificateStatus(certificateNumber, isActive) {
  try {
    const collection = await getCertificatesCollection();
    const result = await collection.updateOne(
      { certificateNumber },
      { 
        $set: { 
          isActive,
          updatedAt: new Date()
        } 
      }
    );
    return { success: true, modifiedCount: result.modifiedCount };
  } catch (error) {
    console.error('Error updating certificate:', error);
    return { success: false, error: error.message };
  }
}