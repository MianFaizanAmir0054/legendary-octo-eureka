// app/api/certificates/verify/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const certificateNumber = searchParams.get('cert'); // e.g., ?cert=CERT-2024-001

    // Only certificate number is required now
    if (!certificateNumber) {
      return NextResponse.json(
        { success: false, error: 'Certificate number is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Find certificate by number and ensure it's active
    const certificate = await db.collection('certificates').findOne({
      certificateNumber: certificateNumber.trim(),
      isActive: true
    });

    if (!certificate) {
      return NextResponse.json(
        { success: false, error: 'Certificate not found or inactive' },
        { status: 404 }
      );
    }

    // Check expiration
    const isExpired = certificate.expiryDate && new Date(certificate.expiryDate) < new Date();

    // Remove sensitive fields before sending
    const { verificationPin, _id, ...safeCertificate } = certificate;

    return NextResponse.json({
      success: true,
      certificate: {
        ...safeCertificate,
        _id: _id?.toString(), // Optional: include as string if needed for frontend
        isExpired,
        status: isExpired ? 'expired' : 'valid',
      }
    });

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}