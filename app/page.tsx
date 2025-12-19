// app/page.jsx
'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold">C</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">CertifyPro</h1>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/admin"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            Digital Certificate Verification System
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Create, manage, and verify certificates with QR code authentication. 
            Trusted by organizations for secure digital credential management.
          </p>
          <div className="flex justify-center space-x-6">
            <Link
              href="/verify"
              className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-lg font-semibold shadow-lg hover:shadow-xl transition-shadow"
            >
              Verify a Certificate
            </Link>
            <Link
              href="/admin"
              className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-xl hover:bg-blue-50 text-lg font-semibold"
            >
              Admin Portal
            </Link>
          </div>
        </div>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
              <span className="text-2xl">📄</span>
            </div>
            <h3 className="text-xl font-bold mb-4">Create Certificates</h3>
            <p className="text-gray-600">
              Admin panel to issue professional certificates with unique QR codes and PINs.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="text-xl font-bold mb-4">Verify Instantly</h3>
            <p className="text-gray-600">
              Scan QR code or enter PIN to verify certificate authenticity in seconds.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-bold mb-4">Manage Database</h3>
            <p className="text-gray-600">
              View all issued certificates, track status, and manage credentials.
            </p>
          </div>
        </div>
        
        {/* Quick Links */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-8">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Link
              href="/admin"
              className="p-6 bg-blue-50 border-2 border-blue-200 rounded-xl hover:bg-blue-100 text-center"
            >
              <div className="text-3xl mb-3">👑</div>
              <h3 className="font-bold text-blue-700">Admin Portal</h3>
              <p className="text-sm text-blue-600">Create & manage certificates</p>
            </Link>
            
            <Link
              href="/verify"
              className="p-6 bg-green-50 border-2 border-green-200 rounded-xl hover:bg-green-100 text-center"
            >
              <div className="text-3xl mb-3">✓</div>
              <h3 className="font-bold text-green-700">Verify Certificate</h3>
              <p className="text-sm text-green-600">Check certificate authenticity</p>
            </Link>
            
            <Link
              href="/admin/certificates"
              className="p-6 bg-purple-50 border-2 border-purple-200 rounded-xl hover:bg-purple-100 text-center"
            >
              <div className="text-3xl mb-3">📋</div>
              <h3 className="font-bold text-purple-700">View All</h3>
              <p className="text-sm text-purple-600">Browse issued certificates</p>
            </Link>
            
            <Link
              href="/verify-details?cert=DEMO&pin=123456"
              className="p-6 bg-orange-50 border-2 border-orange-200 rounded-xl hover:bg-orange-100 text-center"
            >
              <div className="text-3xl mb-3">👁️</div>
              <h3 className="font-bold text-orange-700">View Sample</h3>
              <p className="text-sm text-orange-600">See verification example</p>
            </Link>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-16 text-center text-gray-500">
          <p>Certificate Verification System • Secure Digital Credentials</p>
          <p className="text-sm mt-2">Contact: admin@certifypro.com • +966 13 347 9683</p>
        </div>
      </div>
    </div>
  );
}