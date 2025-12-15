'use client';

import { useState } from 'react';

export default function CertificateSystemDemo() {
  // State for admin panel
  const [employeeName, setEmployeeName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [courseName, setCourseName] = useState('Web Development Fundamentals');
  const [issueDate, setIssueDate] = useState('');
  const [certificateId, setCertificateId] = useState('CERT-2024-001');
  const [pinCode, setPinCode] = useState('429817');
  
  // State for verification
  const [verificationId, setVerificationId] = useState('');
  const [verificationPin, setVerificationPin] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  
  // State for active tab
  const [activeTab, setActiveTab] = useState('admin');
  
  // Sample data for certificates list
  const sampleCertificates = [
    { id: 'CERT-2024-001', name: 'John Smith', course: 'Web Development', date: '2024-06-15', status: 'valid' },
    { id: 'CERT-2024-002', name: 'Sarah Johnson', course: 'Data Analysis', date: '2024-06-10', status: 'valid' },
    { id: 'CERT-2024-003', name: 'Michael Chen', course: 'Project Management', date: '2024-06-05', status: 'valid' },
  ];
  
  // Generate a new certificate
  const handleGenerateCertificate = () => {
    // Generate mock certificate ID and PIN
    const newId = `CERT-2024-${Math.floor(100 + Math.random() * 900)}`;
    const newPin = Math.floor(100000 + Math.random() * 900000).toString();
    
    setCertificateId(newId);
    setPinCode(newPin);
    
    alert(`Certificate generated!\nID: ${newId}\nPIN: ${newPin}\n\nThis is a demo. In production, this would save to the database.`);
  };
  
  // Verify a certificate
  const handleVerifyCertificate = () => {
    if (!verificationId || !verificationPin) {
      alert('Please enter both Certificate ID and PIN');
      return;
    }
    
    // Mock verification logic
    if (verificationId === 'CERT-2024-001' && verificationPin === '429817') {
      setVerificationResult({
        valid: true,
        certificate: {
          id: 'CERT-2024-001',
          name: 'John Smith',
          employeeId: 'EMP-2023-045',
          course: 'Web Development Fundamentals',
          issueDate: 'June 15, 2024',
          issuingAdmin: 'Admin User'
        }
      });
    } else {
      setVerificationResult({
        valid: false,
        error: 'Certificate not found or PIN incorrect'
      });
    }
  };
  
  // Format today's date for the date input
  const today = new Date().toISOString().split('T')[0];
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Certificate Verification System</h1>
        <p className="text-gray-600 mt-2">Secure digital certificates with QR code validation</p>
      </header>
      
      {/* Tab Navigation */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex border-b border-gray-200">
          <button
            className={`px-6 py-3 font-medium text-lg ${activeTab === 'admin' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('admin')}
          >
            Admin Panel
          </button>
          <button
            className={`px-6 py-3 font-medium text-lg ${activeTab === 'verify' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('verify')}
          >
            Verify Certificate
          </button>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto">
        {/* Admin Panel */}
        {activeTab === 'admin' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Certificate Creation Form */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Certificate</h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name</label>
                  <input
                    type="text"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter employee full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                  <input
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter employee ID"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course/Certification Name</label>
                  <select
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option>Web Development Fundamentals</option>
                    <option>Data Analysis Professional</option>
                    <option>Project Management Certification</option>
                    <option>Cybersecurity Essentials</option>
                    <option>Digital Marketing Strategy</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={issueDate || today}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="pt-4">
                  <button
                    onClick={handleGenerateCertificate}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
                  >
                    Generate Certificate
                  </button>
                </div>
              </div>
              
              {/* Generated Certificate Info */}
              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-bold text-blue-800 mb-2">Generated Certificate Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-600">Certificate ID:</div>
                  <div className="font-mono font-bold">{certificateId}</div>
                  
                  <div className="text-gray-600">Verification PIN:</div>
                  <div className="font-mono font-bold">{pinCode}</div>
                  
                  <div className="text-gray-600">QR Code:</div>
                  <div className="text-blue-600">Auto-generated with certificate</div>
                </div>
              </div>
            </div>
            
            {/* Right Column: Certificate Preview and List */}
            <div className="space-y-8">
              {/* Certificate Preview */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Certificate Preview</h2>
                
                <div className="border-2 border-gray-200 rounded-lg p-6 bg-gradient-to-br from-blue-50 to-white">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-blue-800 mb-2">Certificate of Completion</div>
                    <div className="text-gray-600">This certifies that</div>
                  </div>
                  
                  <div className="text-center my-8">
                    <div className="text-4xl font-bold text-gray-800 mb-2">{employeeName || "Employee Name"}</div>
                    <div className="text-gray-600">has successfully completed the course</div>
                    <div className="text-2xl font-semibold text-blue-700 mt-3">{courseName}</div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-10 pt-6 border-t border-gray-300">
                    <div>
                      <div className="text-sm text-gray-500">Issue Date</div>
                      <div className="font-medium">{issueDate || today}</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Certificate ID</div>
                      <div className="font-mono font-bold">{certificateId}</div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Verification PIN</div>
                      <div className="font-mono font-bold">{pinCode}</div>
                    </div>
                  </div>
                  
                  {/* QR Code Placeholder */}
                  <div className="flex justify-center mt-6">
                    <div className="w-32 h-32 border-4 border-dashed border-gray-300 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <div className="text-sm">QR Code</div>
                        <div className="text-xs">(Auto-generated)</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 text-center text-gray-500 text-sm">
                  This is a preview. The actual certificate will be available as a downloadable PDF with embedded QR code.
                </div>
              </div>
              
              {/* Recent Certificates */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Recently Issued Certificates</h2>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left p-3 text-sm font-medium text-gray-700">Certificate ID</th>
                        <th className="text-left p-3 text-sm font-medium text-gray-700">Employee</th>
                        <th className="text-left p-3 text-sm font-medium text-gray-700">Course</th>
                        <th className="text-left p-3 text-sm font-medium text-gray-700">Date</th>
                        <th className="text-left p-3 text-sm font-medium text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sampleCertificates.map((cert) => (
                        <tr key={cert.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-3 font-mono text-sm">{cert.id}</td>
                          <td className="p-3">{cert.name}</td>
                          <td className="p-3">{cert.course}</td>
                          <td className="p-3">{cert.date}</td>
                          <td className="p-3">
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                              {cert.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Verification Panel */}
        {activeTab === 'verify' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Verification Input */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Verify a Certificate</h2>
              <p className="text-gray-600 mb-8">Enter the Certificate ID and PIN, or scan the QR code to verify authenticity.</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Certificate ID</label>
                  <input
                    type="text"
                    value={verificationId}
                    onChange={(e) => setVerificationId(e.target.value)}
                    placeholder="e.g., CERT-2024-001"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">6-digit Verification PIN</label>
                  <input
                    type="text"
                    value={verificationPin}
                    onChange={(e) => setVerificationPin(e.target.value)}
                    placeholder="Enter 6-digit PIN"
                    maxLength="6"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="pt-2">
                  <button
                    onClick={handleVerifyCertificate}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
                  >
                    Verify Certificate
                  </button>
                </div>
                
                {/* QR Code Scanner Demo */}
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h3 className="font-bold text-gray-700 mb-4">Alternative: Scan QR Code</h3>
                  <div className="flex flex-col items-center">
                    <div className="w-48 h-48 border-2 border-dashed border-gray-300 flex items-center justify-center mb-4">
                      <div className="text-center text-gray-500">
                        <div className="text-4xl mb-2">📷</div>
                        <div>QR Scanner Placeholder</div>
                        <div className="text-xs mt-2">(Will activate camera in production)</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">Point your camera at the certificate's QR code</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column: Verification Results */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Verification Results</h2>
              
              {verificationResult ? (
                verificationResult.valid ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-2xl text-green-600">✓</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-green-800">Certificate Verified Successfully</h3>
                        <p className="text-green-600">This certificate is valid and authentic.</p>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-white rounded-lg border border-green-100">
                      <h4 className="font-bold text-gray-800 mb-3">Certificate Details</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-gray-600">Certificate ID:</div>
                        <div className="font-bold">{verificationResult.certificate.id}</div>
                        
                        <div className="text-gray-600">Employee Name:</div>
                        <div className="font-bold">{verificationResult.certificate.name}</div>
                        
                        <div className="text-gray-600">Employee ID:</div>
                        <div className="font-bold">{verificationResult.certificate.employeeId}</div>
                        
                        <div className="text-gray-600">Course Completed:</div>
                        <div className="font-bold">{verificationResult.certificate.course}</div>
                        
                        <div className="text-gray-600">Issue Date:</div>
                        <div className="font-bold">{verificationResult.certificate.issueDate}</div>
                        
                        <div className="text-gray-600">Issued By:</div>
                        <div className="font-bold">{verificationResult.certificate.issuingAdmin}</div>
                      </div>
                    </div>
                    
                    <div className="mt-6 text-sm text-gray-500">
                      <p>This certificate was verified on {new Date().toLocaleDateString()} and is recorded in the secure database.</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-2xl text-red-600">✗</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-red-800">Verification Failed</h3>
                        <p className="text-red-600">{verificationResult.error}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-gray-700">Possible reasons:</p>
                      <ul className="list-disc pl-5 mt-2 text-gray-600">
                        <li>Certificate ID or PIN entered incorrectly</li>
                        <li>Certificate has been revoked or expired</li>
                        <li>Certificate does not exist in our database</li>
                      </ul>
                    </div>
                    
                    <div className="mt-6">
                      <button
                        onClick={() => {
                          setVerificationId('');
                          setVerificationPin('');
                          setVerificationResult(null);
                        }}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl text-gray-400">🔍</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">No Verification Yet</h3>
                  <p className="text-gray-500">Enter a Certificate ID and PIN above to check authenticity.</p>
                  <div className="mt-6 text-sm text-gray-400">
                    <p>Try with these demo credentials:</p>
                    <p className="font-mono mt-1">ID: CERT-2024-001 | PIN: 429817</p>
                  </div>
                </div>
              )}
              
              {/* Sample Certificate Display */}
              <div className="mt-8 border-t border-gray-200 pt-6">
                <h3 className="font-bold text-gray-700 mb-4">What a Verified Certificate Looks Like</h3>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center">
                    <div className="w-16 h-16 border-2 border-green-500 flex items-center justify-center mr-4">
                      <span className="text-2xl">📄</span>
                    </div>
                    <div>
                      <div className="font-bold">Verified Certificate</div>
                      <div className="text-sm text-gray-600">Includes embedded QR code, unique ID, and verification PIN</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <footer className="mt-12 pt-6 border-t border-gray-200 text-center text-gray-500 text-sm">
        <p>Certificate Verification System • Secure digital credential platform • All rights reserved</p>
        <p className="mt-1">This is a demo interface. Actual system will include full database integration.</p>
      </footer>
    </div>
  );
}