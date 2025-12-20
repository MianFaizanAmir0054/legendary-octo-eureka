// app/api/certificates/generate/route.js

import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
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

    // Generate numbers (exact same as before)
    const year = new Date().getFullYear();
    const randomSequence = Math.floor(100000 + Math.random() * 900000);
    const certificateNumber = `151-${year}-${randomSequence}-EN`;

    const refYear = year.toString().slice(-2);
    const refMonth = String(new Date().getMonth() + 1).padStart(2, "0");
    const refRandom = Math.floor(10000 + Math.random() * 90000);
    const referenceNumber = `JUB.IVS.${refYear}.${refMonth}.${refRandom}`;

    const verificationPin = Math.floor(100000 + Math.random() * 900000).toString();

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const verificationUrl = `${baseUrl}/verify?cert=${certificateNumber}`;

    // Generate QR Code
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    // Format dates
    const formatDate = (dateInput) => {
      if (!dateInput) return "";
      const date = new Date(dateInput);
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const issueDate = formatDate(data.issueDate) || formatDate(new Date());
    const expiryDate = formatDate(data.expiryDate) || "";

    // Create PDF document with card size (85.6mm x 54mm = 242.65 x 153.07 points)
    const pdfDoc = await PDFDocument.create();
    
    // Card dimensions in points (1mm = 2.83465 points)
    const cardWidth = 242.65;
    const cardHeight = 153.07;

    // ============= FRONT PAGE =============
    const frontPage = pdfDoc.addPage([cardWidth, cardHeight]);
    
    // Load fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Colors
    const darkBlue = rgb(0, 0.2, 0.4);
    const blue = rgb(0, 0.4, 0.8);
    const black = rgb(0, 0, 0);
    const gray = rgb(0.4, 0.4, 0.4);

    let yPos = cardHeight - 10;

    // Top Border Line
    frontPage.drawLine({
      start: { x: 0, y: yPos - 38 },
      end: { x: cardWidth, y: yPos - 38 },
      thickness: 2,
      color: black,
    });

    // Logo (Text-based) - Top Left
    frontPage.drawText('BUREAU', {
      x: 12,
      y: yPos - 15,
      size: 7,
      font: fontBold,
      color: darkBlue,
    });
    frontPage.drawText('VERITAS', {
      x: 10,
      y: yPos - 24,
      size: 7,
      font: fontBold,
      color: darkBlue,
    });
    frontPage.drawRectangle({
      x: 8,
      y: yPos - 38,
      width: 30,
      height: 14,
      borderColor: darkBlue,
      borderWidth: 1.2,
    });

    // Certificate Info - Center
    const certInfoX = 50;
    let certInfoY = yPos - 12;
    
    frontPage.drawText('Certificate No:', { x: certInfoX, y: certInfoY, size: 5.5, font: fontBold, color: black });
    frontPage.drawText(certificateNumber, { x: certInfoX + 38, y: certInfoY, size: 5.5, font: font, color: black });
    
    certInfoY -= 7;
    frontPage.drawText('EA Ref.#', { x: certInfoX, y: certInfoY, size: 5.5, font: fontBold, color: black });
    frontPage.drawText(referenceNumber, { x: certInfoX + 38, y: certInfoY, size: 5.5, font: font, color: black });
    
    certInfoY -= 7;
    frontPage.drawText('Issued On:', { x: certInfoX, y: certInfoY, size: 5.5, font: fontBold, color: black });
    frontPage.drawText(issueDate, { x: certInfoX + 38, y: certInfoY, size: 5.5, font: font, color: black });
    
    certInfoY -= 7;
    frontPage.drawText('Valid Until:', { x: certInfoX, y: certInfoY, size: 5.5, font: fontBold, color: black });
    frontPage.drawText(expiryDate, { x: certInfoX + 38, y: certInfoY, size: 5.5, font: font, color: black });

    // Photo Box - Top Right
    const photoX = cardWidth - 40;
    const photoY = yPos - 38;
    frontPage.drawRectangle({
      x: photoX,
      y: photoY,
      width: 35,
      height: 38,
      borderColor: blue,
      borderWidth: 1.5,
    });

    // Embed employee photo if provided
    if (data.employeeImage) {
      try {
        const imageBytes = data.employeeImage.split(',')[1];
        const imageBuffer = Buffer.from(imageBytes, 'base64');
        let embeddedImage;
        
        if (data.employeeImage.includes('image/png')) {
          embeddedImage = await pdfDoc.embedPng(imageBuffer);
        } else {
          embeddedImage = await pdfDoc.embedJpg(imageBuffer);
        }
        
        frontPage.drawImage(embeddedImage, {
          x: photoX + 1,
          y: photoY + 1,
          width: 33,
          height: 36,
        });
      } catch (error) {
        console.error('Error embedding image:', error);
        frontPage.drawText('PHOTO', {
          x: photoX + 8,
          y: photoY + 18,
          size: 6,
          font: fontBold,
          color: gray,
        });
      }
    } else {
      frontPage.drawText('PHOTO', {
        x: photoX + 8,
        y: photoY + 18,
        size: 6,
        font: fontBold,
        color: gray,
      });
    }

    // Personal Info Section
    yPos -= 48;
    frontPage.drawLine({
      start: { x: 0, y: yPos - 42 },
      end: { x: cardWidth, y: yPos - 42 },
      thickness: 1,
      color: black,
    });

    const infoX = 10;
    let infoY = yPos - 8;
    
    frontPage.drawText('Name:', { x: infoX, y: infoY, size: 7.5, font: fontBold, color: black });
    frontPage.drawText(data.employeeName.toUpperCase(), { x: infoX + 48, y: infoY, size: 7.5, font: fontBold, color: blue });
    
    infoY -= 10;
    frontPage.drawText('ID No:', { x: infoX, y: infoY, size: 7.5, font: fontBold, color: black });
    frontPage.drawText(data.employeeId, { x: infoX + 48, y: infoY, size: 7.5, font: font, color: black });
    
    infoY -= 10;
    frontPage.drawText('Company:', { x: infoX, y: infoY, size: 7.5, font: fontBold, color: black });
    frontPage.drawText(data.company, { x: infoX + 48, y: infoY, size: 7.5, font: font, color: black });
    
    infoY -= 10;
    frontPage.drawText('Issuance No:', { x: infoX, y: infoY, size: 7.5, font: fontBold, color: black });
    frontPage.drawText(data.issuanceNumber || '1', { x: infoX + 48, y: infoY, size: 7.5, font: font, color: black });

    // Certificate Text Section
    yPos -= 52;
    frontPage.drawLine({
      start: { x: 0, y: yPos - 16 },
      end: { x: cardWidth, y: yPos - 16 },
      thickness: 1,
      color: black,
    });

    const certText = `This certifies that the above mentioned person has successfully completed the ${data.courseName || 'BV Safety Course'}. Refer to backside for details.`;
    
    // Word wrap for certificate text
    const maxWidth = cardWidth - 20;
    const words = certText.split(' ');
    let line = '';
    let textY = yPos - 8;
    
    for (const word of words) {
      const testLine = line + word + ' ';
      const testWidth = font.widthOfTextAtSize(testLine, 5.5);
      
      if (testWidth > maxWidth && line !== '') {
        frontPage.drawText(line.trim(), { x: 10, y: textY, size: 5.5, font: font, color: black });
        line = word + ' ';
        textY -= 6.5;
      } else {
        line = testLine;
      }
    }
    if (line.trim() !== '') {
      frontPage.drawText(line.trim(), { x: 10, y: textY, size: 5.5, font: font, color: black });
    }

    // Contact Section
    yPos -= 20;
    frontPage.drawText(`For any queries: Tel. ${data.contactPhone || '013 347 9683'}`, {
      x: cardWidth / 2,
      y: yPos - 8,
      size: 4.8,
      font: font,
      color: black,
      maxWidth: cardWidth - 20,
    });
    
    const emailText = data.contactEmail || 'byjubail.admin@bureauveritas.com';
    const emailWidth = font.widthOfTextAtSize(emailText, 4.8);
    frontPage.drawText(emailText, {
      x: (cardWidth - emailWidth) / 2,
      y: yPos - 14,
      size: 4.8,
      font: font,
      color: black,
    });

    // ============= BACK PAGE =============
    const backPage = pdfDoc.addPage([cardWidth, cardHeight]);
    
    // Embed QR Code
    const qrImageBytes = qrCodeDataUrl.split(',')[1];
    const qrImageBuffer = Buffer.from(qrImageBytes, 'base64');
    const qrImage = await pdfDoc.embedPng(qrImageBuffer);
    
    const qrSize = 100;
    backPage.drawImage(qrImage, {
      x: 10,
      y: cardHeight - qrSize - 25,
      width: qrSize,
      height: qrSize,
    });

    // Right side details
    const rightX = 125;
    let rightY = cardHeight - 20;
    
    backPage.drawText('CERTIFICATE NO:', { x: rightX, y: rightY, size: 7, font: fontBold, color: black });
    rightY -= 10;
    backPage.drawText(certificateNumber, { x: rightX, y: rightY, size: 7, font: fontBold, color: blue });
    
    rightY -= 12;
    backPage.drawText('TYPE:', { x: rightX, y: rightY, size: 6, font: fontBold, color: black });
    backPage.drawText(data.certificateType || 'FIRE WATCH & STANDBY', { x: rightX + 28, y: rightY, size: 6, font: font, color: black });
    
    rightY -= 8;
    backPage.drawText('MODEL:', { x: rightX, y: rightY, size: 6, font: fontBold, color: black });
    backPage.drawText(data.model || 'Not Applicable', { x: rightX + 28, y: rightY, size: 6, font: font, color: black });
    
    rightY -= 8;
    backPage.drawText('TRAINER:', { x: rightX, y: rightY, size: 6, font: fontBold, color: black });
    backPage.drawText(data.trainerName || 'ZEESHAN KHAN', { x: rightX + 28, y: rightY, size: 6, font: font, color: black });
    
    rightY -= 8;
    backPage.drawText('LOCATION:', { x: rightX, y: rightY, size: 6, font: fontBold, color: black });
    backPage.drawText(data.location || 'JUBAIL', { x: rightX + 28, y: rightY, size: 6, font: font, color: black });

    // Disclaimer text with word wrap
    rightY -= 15;
    const disclaimerText = "This card does not relieve the operator from responsibilities related to the safe handling operation, or reliability of the listed equipment. Only contracted parties can hold Bureau Veritas liable for errors/omissions related to this card. Bureau Veritas is not liable for any mistakes, negligence, judgement or fault committed by the person holding this card. The SAG license is the client's responsibility.";
    
    const disclaimerWords = disclaimerText.split(' ');
    let disclaimerLine = '';
    const disclaimerMaxWidth = cardWidth - rightX - 10;
    
    for (const word of disclaimerWords) {
      const testLine = disclaimerLine + word + ' ';
      const testWidth = font.widthOfTextAtSize(testLine, 4.3);
      
      if (testWidth > disclaimerMaxWidth && disclaimerLine !== '') {
        backPage.drawText(disclaimerLine.trim(), { x: rightX, y: rightY, size: 4.3, font: font, color: black });
        disclaimerLine = word + ' ';
        rightY -= 5.5;
      } else {
        disclaimerLine = testLine;
      }
    }
    if (disclaimerLine.trim() !== '') {
      backPage.drawText(disclaimerLine.trim(), { x: rightX, y: rightY, size: 4.3, font: font, color: black });
    }

    // Verification footer
    backPage.drawRectangle({
      x: 0,
      y: 0,
      width: cardWidth,
      height: 18,
      color: rgb(0.98, 0.98, 0.98),
    });
    
    backPage.drawLine({
      start: { x: 0, y: 18 },
      end: { x: cardWidth, y: 18 },
      thickness: 0.5,
      color: rgb(0.87, 0.87, 0.87),
    });
    
    const verifyText1 = 'Scan QR code to verify this certificate at';
    const verifyWidth1 = font.widthOfTextAtSize(verifyText1, 4.8);
    backPage.drawText(verifyText1, {
      x: (cardWidth - verifyWidth1) / 2,
      y: 10,
      size: 4.8,
      font: fontBold,
      color: rgb(0.83, 0.18, 0.18),
    });
    
    const verifyWidth2 = font.widthOfTextAtSize(verificationUrl, 4.8);
    backPage.drawText(verificationUrl, {
      x: (cardWidth - verifyWidth2) / 2,
      y: 4,
      size: 4.8,
      font: fontBold,
      color: rgb(0.83, 0.18, 0.18),
    });

    // Generate PDF
    const pdfBytes = await pdfDoc.save();
    const pdfBase64 = Buffer.from(pdfBytes).toString('base64');

    // Save to MongoDB
    const { db } = await connectToDatabase();
    const certificateData = {
      ...data,
      certificateNumber,
      referenceNumber,
      verificationPin,
      verificationUrl,
      qrCodeData: qrCodeDataUrl,
      createdAt: new Date(),
      isActive: true,
    };

    await db.collection("certificates").insertOne(certificateData);

    // Return response
    return NextResponse.json({
      success: true,
      certificateNumber,
      referenceNumber,
      verificationPin,
      verificationUrl,
      qrCodeDataUrl,
      pdfBuffer: pdfBase64,
      message: "Certificate generated successfully in Bureau Veritas format",
    });

  } catch (error) {
    console.error("Certificate Generation Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate certificate" },
      { status: 500 }
    );
  }
}