// app/api/certificates/route.js   ← NEW FILE
import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../lib/db';

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    const certificates = await db.collection('certificates')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Add isExpired flag and remove sensitive data
    const processedCertificates = certificates.map(cert => {
      const isExpired = cert.expiryDate && new Date(cert.expiryDate) < new Date();
      
      // Clean up the object before sending
      const { verificationPin, ...safeCert } = cert;
      
      return {
        ...safeCert,
        _id: cert._id.toString(), // Convert ObjectId to string if needed
        isExpired,
        status: isExpired ? 'expired' : (cert.isActive ? 'valid' : 'inactive')
      };
    });

    return NextResponse.json({
      success: true,
      certificates: processedCertificates
    });

  } catch (error) {
    console.error('Error fetching all certificates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch certificates' },
      { status: 500 }
    );
  }
}