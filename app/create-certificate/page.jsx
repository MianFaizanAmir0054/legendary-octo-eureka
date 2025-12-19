// app/create-certificate/page.jsx
'use client';

import CertificateDisplay from "../components/CertificateDisplay";


export default function CreateCertificatePage() {
  const certificateData = {
    // Your certificate data here
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Certificate Created Successfully</h1>
        <CertificateDisplay certificate={certificateData} showVerificationInfo={true} />
      </div>
    </div>
  );
}