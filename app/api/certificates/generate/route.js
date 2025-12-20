// app/api/certificates/generate/route.js

import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { connectToDatabase } from "../../../lib/db";

export async function POST(request) {
  try {
    const data = await request.json();

    if (!data.employeeName || !data.employeeId || !data.company) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate unique numbers
    const year = new Date().getFullYear();
    const randomSeq = Math.floor(10000 + Math.random() * 90000);
    const certificateNumber = `BV-JUB-${year}-${randomSeq}`;

    const refRandom = Math.floor(100000 + Math.random() * 900000);
    const referenceNumber = `REF-${refRandom}`;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const verificationUrl = `${baseUrl}/verify?cert=${certificateNumber}`;

    // Generate real QR code
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      width: 400,
      margin: 2,
      color: { dark: "#000000", light: "#FFFFFF" },
    });

    // Save to database
    const { db } = await connectToDatabase();
    const certificateData = {
      ...data,
      certificateNumber,
      referenceNumber,
      verificationUrl,
      qrCodeDataUrl,
      createdAt: new Date(),
      isActive: true,
    };

    await db.collection("certificates").insertOne(certificateData);

    // Return only what's needed for frontend
    return NextResponse.json({
      success: true,
      certificateNumber,
      referenceNumber,
      verificationUrl,
      qrCodeDataUrl,
    });
  } catch (error) {
    console.error("Certificate Save Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save certificate" },
      { status: 500 }
    );
  }
}