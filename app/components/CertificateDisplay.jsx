// app/components/CertificateDisplay.jsx
'use client';

import { useState } from 'react';

export default function CertificateDisplay({ certificate, showVerificationInfo = false }) {
  const [showPIN, setShowPIN] = useState(false);
  
  // Default certificate data structure
  const certData = {
    certificateNumber: certificate?.certificateNumber || '151-2025-042556-EN',
    refNumber: certificate?.refNumber || 'JUB.IVS.25.07.10332',
    issueDate: certificate?.issueDate || new Date('2025-11-03'),
    expiryDate: certificate?.expiryDate || new Date('2026-11-02'),
    employeeName: certificate?.employeeName || 'SABIR HUSSAIN DARWISH ALI',
    employeeId: certificate?.employeeId || '2620942363',
    company: certificate?.company || 'PRIVATE 1 8 2 8',
    issuanceNo: certificate?.issuanceNo || '1',
    courseName: certificate?.courseName || 'BV Safety Course',
    certificateType: certificate?.certificateType || 'FIRE WATCH & STANDBY MAN',
    model: certificate?.model || 'N/A',
    trainerName: certificate?.trainerName || 'ZEESHAN KHAN',
    location: certificate?.location || 'JUBAIL',
    qrCodeData: certificate?.qrCodeData || '',
    verificationPin: certificate?.verificationPin || '123456',
    isExpired: certificate?.isExpired || false,
    referenceNumber: certificate?.referenceNumber || 'JUB.IVS.25.07.10332',
    createdAt: certificate?.createdAt || new Date()
  };
  
  return (
    <div className="space-y-8">
      {/* Original Certificate Display (Matching PDF Format) */}
      <div className="bg-white border-2 border-gray-300 rounded-lg overflow-hidden shadow-lg">
        {/* Page 1 */}
        <div className="p-8 border-b border-gray-300">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">CERTIFICATE</h1>
            <div className="h-1 w-24 bg-blue-600 mx-auto"></div>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-gray-600">Certificate No:</p>
                <p className="text-lg font-bold">{certData.certificateNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Ref.#</p>
                <p className="text-lg font-bold">{certData.refNumber}</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-sm text-gray-600">Issued On:</p>
                <p className="font-semibold">
                  {new Date(certData.issueDate).toLocaleDateString('en-GB')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Valid Until:</p>
                <p className={`font-semibold ${certData.isExpired ? 'text-red-600' : ''}`}>
                  {certData.expiryDate 
                    ? new Date(certData.expiryDate).toLocaleDateString('en-GB')
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <div className="mb-4">
              <p className="text-sm text-gray-600">Name:</p>
              <p className="text-xl font-bold uppercase">{certData.employeeName}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">ID No:</p>
                <p className="text-lg font-semibold">{certData.employeeId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Company:</p>
                <p className="text-lg font-semibold">{certData.company}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Issuance No:</p>
              <p className="text-lg font-semibold">{certData.issuanceNo}</p>
            </div>
          </div>
          
          <div className="text-center mb-8 py-6 border-t border-b border-gray-300">
            <p className="text-lg font-semibold">
              This certifies that the above mentioned person has successfully completed the {certData.courseName}.
            </p>
            <p className="text-sm text-gray-600 mt-2">Refer to backside for details.</p>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">For any queries: Tel. 013 347 9683</p>
            <p className="text-sm text-gray-600">byjubail.admin@bureauveritas.com</p>
          </div>
        </div>
        
        {/* Page 2 */}
        <div className="p-8">
          <div className="mb-8">
            <p className="text-sm text-gray-600">CERTIFICATE NO:</p>
            <p className="text-xl font-bold uppercase mb-6">{certData.certificateNumber}</p>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">TYPE:</p>
                <p className="text-lg font-semibold uppercase">{certData.certificateType}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">MODEL:</p>
                <p className="text-lg font-semibold uppercase">{certData.model}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">TRAINER:</p>
                <p className="text-lg font-semibold uppercase">{certData.trainerName}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">LOCATION:</p>
                <p className="text-lg font-semibold uppercase">{certData.location}</p>
              </div>
            </div>
          </div>
          
          <div className="mb-8 p-4 bg-gray-50 rounded border border-gray-300">
            <p className="text-sm text-gray-700 leading-relaxed">
              This card does not relieve the operator from responsibilities related to the safe handling operation, 
              or reliability of the listed equipment. Only constructed parties can hold bureau Veritas liable for 
              errors/omissions related to this card. Bureau Veritas is not liable for any mistakes, negligence, 
              judgement or fault committed by the person holding this card. The SAG license is the client's responsibility.
            </p>
          </div>
          
          <div className="text-center">
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Scan QR code to verify this certificate at</p>
              <p className="text-sm font-semibold">https://e-certificates.bureauveritas.com</p>
            </div>
            
            <div className="inline-block p-4 bg-white border border-gray-300 rounded-lg">
              {certData.qrCodeData ? (
                <img 
                  src={certData.qrCodeData} 
                  alt="QR Code" 
                  className="w-32 h-32 mx-auto"
                />
              ) : (
                <div className="w-32 h-32 bg-gray-100 flex items-center justify-center rounded mx-auto">
                  <span className="text-gray-500">QR Code</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Verification Information (Optional) */}
      {showVerificationInfo && (
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Verification Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500">Verification Method</p>
              <p className="font-semibold">Certificate Creation</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Created On</p>
              <p className="font-semibold">{new Date().toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Verification PIN</p>
              <div className="flex items-center">
                <span className="font-mono font-bold">
                  {showPIN ? certData.verificationPin : '••••••'}
                </span>
                <button
                  onClick={() => setShowPIN(!showPIN)}
                  className="ml-2 text-blue-600 text-sm"
                >
                  {showPIN ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}