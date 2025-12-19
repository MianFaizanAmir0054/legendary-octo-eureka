// app/api/certificates/generate/route.js
import { NextResponse } from 'next/server';
import { chromium } from 'playwright';
import QRCode from 'qrcode';
import fs from 'fs/promises';
import path from 'path';

// If you have a database connection, uncomment this
import { connectToDatabase } from '../../../lib/db';

export async function POST(request) {
  let browser;
  
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.employeeName || !data.employeeId || !data.company) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: employeeName, employeeId, or company' },
        { status: 400 }
      );
    }
    
    // Generate certificate number in exact format: 151-2025-042556-EN
    const year = new Date().getFullYear();
    const randomSequence = Math.floor(100000 + Math.random() * 900000);
    const certificateNumber = `151-${year}-${randomSequence}-EN`;
    
    // Generate reference number in format: JUB.IVS.25.07.10332
    const refYear = year.toString().slice(-2);
    const refMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const refRandom = Math.floor(10000 + Math.random() * 90000);
    const referenceNumber = `JUB.IVS.${refYear}.${refMonth}.${refRandom}`;
    
    // Generate verification PIN (6 digits)
    const verificationPin = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Create verification URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/verify?cert=${certificateNumber}`;
    
    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    // Read HTML template
    const templatePath = path.join(process.cwd(), 'templates', 'certificate-template.html');
    let html;
    
    try {
      html = await fs.readFile(templatePath, 'utf8');
    } catch (error) {
      console.error('Template file not found. Using inline template.');
      // html = getInlineTemplate();
    }
    
    // Format dates exactly as in PDF: DD/MM/YYYY
    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };
    
    // Replace all placeholders
    const replacements = {
      certificateNumber,
      referenceNumber,
      employeeName: data.employeeName.toUpperCase(),
      employeeId: data.employeeId,
      company: data.company,
      issuanceNumber: data.issuanceNumber || '1',
      issueDate: formatDate(data.issueDate) || formatDate(new Date()),
      expiryDate: formatDate(data.expiryDate),
      courseName: data.courseName || 'BV Safety Course',
      certificateType: data.certificateType || 'FIRE WATCH & STANDBY',
      model: data.model || 'Not Applicable',
      trainerName: data.trainerName || 'ZEESHAN KHAN',
      location: data.location || 'JUBAIL',
      contactPhone: data.contactPhone || '013 347 9683',
      contactEmail: data.contactEmail || 'byjubail.admin@bureauveritas.com',
      verificationUrl,
      qrCodeDataUrl,
      employeeImage: data.employeeImage || '' // Base64 image or empty
    };
    
    // Replace placeholders in HTML
    for (const [key, value] of Object.entries(replacements)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, value || '');
    }
    
    // Handle conditional image display (simple template logic)
    if (data.employeeImage) {
      html = html.replace(/{{#if employeeImage}}/g, '');
      html = html.replace(/{{else}}/g, '<!--');
      html = html.replace(/{{\/if}}/g, '-->');
    } else {
      html = html.replace(/{{#if employeeImage}}[\s\S]*?{{else}}/g, '<!--');
      html = html.replace(/{{\/if}}/g, '-->');
    }
    
    // Generate PDF using Playwright
    browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
      scale: 1,
      preferCSSPageSize: true
    });
    
    await browser.close();
    
    // Save certificate to database (uncomment if you have database setup)
    try {
      const { db } = await connectToDatabase();
      const certificateData = {
        ...data,
        certificateNumber,
        referenceNumber,
        verificationPin,
        verificationUrl,
        qrCodeData: qrCodeDataUrl,
        createdAt: new Date(),
        isActive: true
      };
      await db.collection('certificates').insertOne(certificateData);
    } catch (dbError) {
      console.error('Database save error:', dbError);
      // Continue even if database save fails
    }
    
    return NextResponse.json({
      success: true,
      certificateNumber,
      referenceNumber,
      verificationPin,
      verificationUrl,
      qrCodeDataUrl,
      pdfBuffer: pdfBuffer.toString('base64'),
      message: 'Certificate generated successfully in Bureau Veritas format'
    });
    
  } catch (error) {
    console.error('Certificate Generation Error:', error);
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate certificate' },
      { status: 500 }
    );
  }
}

// Inline template as fallback
function getInlineTemplate() {
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page { size: A4 portrait; margin: 0; }
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; color: #000; background: white; }
        .certificate-page { width: 210mm; height: 297mm; position: relative; page-break-after: always; box-sizing: border-box; }
        .page1 { padding: 50px 60px; }
        .header-section { margin-bottom: 30px; }
        .certificate-number { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
        .reference-line { font-size: 14px; margin-bottom: 15px; }
        .dates-section { text-align: right; margin-top: -40px; font-size: 14px; }
        .employee-box { border: 2px solid #000; padding: 20px 25px; margin: 40px 0 60px 0; background: #f8f8f8; display: flex; align-items: flex-start; gap: 20px; }
        .employee-photo { flex-shrink: 0; width: 100px; height: 100px; border: 2px solid #000; background: #fff; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .employee-photo img { width: 100%; height: 100%; object-fit: cover; }
        .employee-photo-placeholder { font-size: 40px; color: #ccc; }
        .employee-info { flex: 1; }
        .employee-name { font-size: 24px; font-weight: bold; margin-bottom: 15px; text-transform: uppercase; }
        .employee-details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 16px; }
        .detail-label { font-weight: bold; display: inline-block; width: 100px; }
        .certification-text { text-align: center; margin: 80px 0 100px 0; font-size: 16px; line-height: 1.6; }
        .contact-info { position: absolute; bottom: 50px; left: 60px; font-size: 14px; line-height: 1.4; }
        .page2 { padding: 40px 60px; }
        .certificate-no-header { text-align: center; margin: 40px 0 60px 0; font-size: 20px; font-weight: bold; }
        .type-details { margin: 40px 0 60px 0; }
        .type-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; font-size: 16px; }
        .type-item { margin-bottom: 25px; }
        .type-label { font-weight: bold; margin-bottom: 5px; font-size: 18px; }
        .disclaimer { font-size: 10px; line-height: 1.4; color: #333; margin: 60px 0 80px 0; border-top: 1px solid #ccc; padding-top: 15px; }
        .qr-section { text-align: center; margin: 40px 0; }
        .qr-container { display: inline-block; margin: 20px auto; padding: 15px; background: white; border: 1px solid #ccc; }
        .qr-instruction { font-size: 14px; color: #0066cc; margin-top: 15px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="certificate-page page1">
        <div class="header-section">
            <div class="certificate-number">Certificate No: {{certificateNumber}}</div>
            <div class="reference-line">Ref.# {{referenceNumber}}</div>
        </div>
        <div class="dates-section">
            <div>Issued On: {{issueDate}}</div>
            <div>Valid Until: {{expiryDate}}</div>
        </div>
        <div class="employee-box">
            <div class="employee-photo">
                {{#if employeeImage}}<img src="{{employeeImage}}" alt="Employee">{{else}}<span class="employee-photo-placeholder">👤</span>{{/if}}
            </div>
            <div class="employee-info">
                <div class="employee-name">{{employeeName}}</div>
                <div class="employee-details">
                    <div><span class="detail-label">ID No:</span> {{employeeId}}</div>
                    <div><span class="detail-label">Company:</span> {{company}}</div>
                    <div><span class="detail-label">Issuance No:</span> {{issuanceNumber}}</div>
                </div>
            </div>
        </div>
        <div class="certification-text">
            <p>This certifies that the above mentioned person has successfully</p>
            <p>completed the {{courseName}}. Refer to backside for details.</p>
        </div>
        <div class="contact-info">
            <p>For any queries: Tel. {{contactPhone}}</p>
            <p>{{contactEmail}}</p>
        </div>
    </div>
    <div class="certificate-page page2">
        <div class="certificate-no-header">CERTIFICATE NO:<br>{{certificateNumber}}</div>
        <div class="type-details">
            <div class="type-grid">
                <div class="type-item">
                    <div class="type-label">TYPE:</div>
                    <div>{{certificateType}}</div>
                </div>
                <div class="type-item">
                    <div class="type-label">MODEL:</div>
                    <div>{{model}}</div>
                </div>
                <div class="type-item">
                    <div class="type-label">TRAINER:</div>
                    <div>{{trainerName}}</div>
                </div>
                <div class="type-item">
                    <div class="type-label">LOCATION:</div>
                    <div>{{location}}</div>
                </div>
            </div>
        </div>
        <div class="disclaimer">
            This card does not relieve the operator from responsibilities related to the safe handling operation, 
            or reliability of the listed equipment. Only constructed parties can hold bureau Veritas liable for 
            errors/omissions related to this card. Bureau Veritas is not liable for any mistakes, negligence, 
            judgement or fault committed by the person holding this card. The SAG license is the client's responsibility.
        </div>
        <div class="qr-section">
            <div class="qr-container">
                <img src="{{qrCodeDataUrl}}" width="150" height="150" alt="QR Code">
            </div>
            <div class="qr-instruction">Scan QR code to verify this certificate</div>
        </div>
    </div>
</body>
</html>`;
}