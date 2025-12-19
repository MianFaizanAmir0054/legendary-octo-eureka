// app/admin/certificates/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ViewCertificatesPage() {
  const router = useRouter();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    fetchCertificates();
  }, []);
  
  const fetchCertificates = async () => {
    try {
      const response = await fetch('/api/certificates');
      const data = await response.json();
      
      if (data.success) {
        setCertificates(data.certificates);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };
  
  const filteredCertificates = certificates.filter(cert =>
    cert.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const getStatusBadge = (certificate) => {
    if (certificate.isExpired) {
      return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Expired</span>;
    }
    if (!certificate.isActive) {
      return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Inactive</span>;
    }
    return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Active</span>;
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">All Certificates</h1>
              <p className="text-gray-600">View and manage all issued certificates</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/admin')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                + New Certificate
              </button>
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                ← Home
              </button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500">Total Certificates</p>
              <p className="text-2xl font-bold">{certificates.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {certificates.filter(c => c.isActive && !c.isExpired).length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500">Expired</p>
              <p className="text-2xl font-bold text-red-600">
                {certificates.filter(c => c.isExpired).length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500">Today</p>
              <p className="text-2xl font-bold">
                {certificates.filter(c => 
                  new Date(c.createdAt).toDateString() === new Date().toDateString()
                ).length}
              </p>
            </div>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search certificates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
              <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            </div>
            <button
              onClick={fetchCertificates}
              className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Refresh
            </button>
          </div>
        </div>
        
        {/* Certificates Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading certificates...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">{error}</div>
          ) : filteredCertificates.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No certificates found. {searchTerm && 'Try a different search.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-4 font-medium text-gray-700">Certificate No.</th>
                    <th className="text-left p-4 font-medium text-gray-700">Employee</th>
                    <th className="text-left p-4 font-medium text-gray-700">Company</th>
                    <th className="text-left p-4 font-medium text-gray-700">Course</th>
                    <th className="text-left p-4 font-medium text-gray-700">Issue Date</th>
                    <th className="text-left p-4 font-medium text-gray-700">Status</th>
                    <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCertificates.map((cert) => (
                    <tr key={cert._id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-mono text-sm">{cert.certificateNumber}</div>
                        <div className="text-xs text-gray-500">
                          {cert.certificateType}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{cert.employeeName}</div>
                        <div className="text-sm text-gray-500">ID: {cert.employeeId}</div>
                      </td>
                      <td className="p-4">
                        <div className="max-w-xs truncate">{cert.company}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">{cert.courseName}</div>
                      </td>
                      <td className="p-4">
                        <div>{new Date(cert.createdAt).toLocaleDateString()}</div>
                        {cert.expiryDate && (
                          <div className="text-xs text-gray-500">
                            Expires: {new Date(cert.expiryDate).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        {getStatusBadge(cert)}
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => window.open(`/verify-details?cert=${cert.certificateNumber}`, '_blank')}
                            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                            title="View"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => navigator.clipboard.writeText(cert.certificateNumber)}
                            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                            title="Copy Certificate No"
                          >
                            📋
                          </button>
                          <button
                            onClick={() => router.push(`/verify?cert=${cert.certificateNumber}`)}
                            className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                            title="Verify"
                          >
                            ✓
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination Info */}
          <div className="p-4 border-t border-gray-100 text-sm text-gray-500">
            Showing {filteredCertificates.length} of {certificates.length} certificates
          </div>
        </div>
        
        {/* Export Options */}
        <div className="mt-6 flex justify-end">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Export to CSV
          </button>
        </div>
      </div>
    </div>
  );
}