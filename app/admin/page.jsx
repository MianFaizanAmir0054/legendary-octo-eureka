// app/admin/page.jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GenerateCertificatePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    employeeName: '',
    employeeId: '',
    company: '',
    issuanceNumber: '1',
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    courseName: 'BV Safety Course',
    certificateType: 'FIRE WATCH & STANDBY',
    model: '',
    trainerName: 'ZEESHAN KHAN',
    location: 'JUBAIL',
    contactPhone: '013 347 9683',
    contactEmail: 'byjubail.admin@bureauveritas.com'
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [employeeImage, setEmployeeImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
                      // @ts-expect-error "km"
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file (JPG, PNG, etc.)');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setEmployeeImage(reader.result); // Base64 string
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleRemoveImage = () => {
    setEmployeeImage(null);
    setImagePreview(null);
  };
  
  const calculateExpiryDate = (issueDate) => {
    if (!issueDate) return '';
    const date = new Date(issueDate);
    date.setFullYear(date.getFullYear() + 1); // 1 year validity
    return date.toISOString().split('T')[0];
  };
  
  const handleIssueDateChange = (e) => {
    const issueDate = e.target.value;
    setFormData(prev => ({
      ...prev,
      issueDate,
      expiryDate: calculateExpiryDate(issueDate)
    }));
  };
  
  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    
    try {
      const response = await fetch('/api/certificates/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          employeeImage: employeeImage // Include base64 image
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult(data);
        
        // Download PDF automatically
        if (data.pdfBuffer) {
          const blob = new Blob(
            [Uint8Array.from(atob(data.pdfBuffer), c => c.charCodeAt(0))],
            { type: 'application/pdf' }
          );
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `Certificate_${data.certificateNumber}.pdf`;
          link.click();
          window.URL.revokeObjectURL(url);
        }
      } else {
        setError(data.error || 'Failed to generate certificate');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleViewAll = () => {
    router.push('/admin/certificates');
  };
  
  const handleReset = () => {
    setFormData({
      employeeName: '',
      employeeId: '',
      company: '',
      issuanceNumber: '1',
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      courseName: 'BV Safety Course',
      certificateType: 'FIRE WATCH & STANDBY',
      model: '',
      trainerName: 'ZEESHAN KHAN',
      location: 'JUBAIL',
      contactPhone: '013 347 9683',
      contactEmail: 'byjubail.admin@bureauveritas.com'
    });
    setResult(null);
    setError('');
    setEmployeeImage(null);
    setImagePreview(null);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Certificate Generator</h1>
              <p className="text-gray-600">Bureau Veritas Safety Course Certification</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Home
              </button>
              <button
                onClick={handleViewAll}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium shadow-sm"
              >
                📋 View All Certificates
              </button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Form - Takes 2 columns */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Certificate Details</h2>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                🔄 Reset Form
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Employee Information Section */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">👤 Employee Information</h3>
                
                <div className="space-y-4">
                  {/* Employee Photo Upload */}
                  <div className="bg-blue-50 border-2 border-dashed border-blue-300 rounded-xl p-6">
                    <div className="flex items-start space-x-6">
                      {/* Image Preview */}
                      <div className="flex-shrink-0">
                        {imagePreview ? (
                          <div className="relative">
                            <img 
                              src={imagePreview} 
                              alt="Employee" 
                              className="w-32 h-32 object-cover rounded-lg border-4 border-white shadow-lg"
                            />
                            <button
                              onClick={handleRemoveImage}
                              className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg flex items-center justify-center"
                              type="button"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center border-4 border-white shadow">
                            <span className="text-4xl text-gray-400">👤</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Upload Button */}
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Employee Photo {!imagePreview && <span className="text-blue-600">(Optional)</span>}
                        </label>
                        <p className="text-xs text-gray-600 mb-3">
                          Upload a passport-style photo (JPG, PNG - Max 5MB)
                        </p>
                        <label className="inline-block">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <span className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer inline-block font-medium">
                            📷 {imagePreview ? 'Change Photo' : 'Upload Photo'}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employee Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="employeeName"
                      value={formData.employeeName}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="Enter full name (e.g., SABIR HUSSAIN DARWISH ALI)"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ID Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="employeeId"
                        value={formData.employeeId}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 2258509"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., SAIC-JUBAIL"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Issuance No
                      </label>
                      <input
                        type="text"
                        name="issuanceNumber"
                        value={formData.issuanceNumber}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="1"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Course Information Section */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">📚 Course Information</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Course Name</label>
                      <select
                        name="courseName"
                        value={formData.courseName}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option>BV Safety Course</option>
                        <option>Fire Safety Training</option>
                        <option>First Aid Certification</option>
                        <option>Hazard Awareness</option>
                        <option>Emergency Response Training</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Certificate Type</label>
                      <select
                        name="certificateType"
                        value={formData.certificateType}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option>FIRE WATCH & STANDBY</option>
                        <option>SAFETY OFFICER</option>
                        <option>FIRE MARSHAL</option>
                        <option>EMERGENCY RESPONSE</option>
                        <option>CONFINED SPACE ENTRY</option>
                        <option>WORKING AT HEIGHT</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Model <span className="text-gray-500 text-xs">(Equipment/Vehicle Model - Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Forklift Model 2000, Crane XYZ-500, or N/A"
                    />
                  </div>
                </div>
              </div>
              
              {/* Dates Section */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">📅 Validity Period</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Issue Date</label>
                    <input
                      type="date"
                      name="issueDate"
                      value={formData.issueDate}
                      onChange={handleIssueDateChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                    <input
                      type="date"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Auto-calculated as 1 year from issue date</p>
                  </div>
                </div>
              </div>
              
              {/* Trainer & Location Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">🎓 Training Details</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Trainer Name</label>
                      <input
                        type="text"
                        name="trainerName"
                        value={formData.trainerName}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., ZEESHAN KHAN"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                      <select
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option>JUBAIL</option>
                        <option>DAMMAM</option>
                        <option>RIYADH</option>
                        <option>JEDDAH</option>
                        <option>YANBU</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                      <input
                        type="text"
                        name="contactPhone"
                        value={formData.contactPhone}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="013 347 9683"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                      <input
                        type="email"
                        name="contactEmail"
                        value={formData.contactEmail}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="byjubail.admin@bureauveritas.com"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Generate Button */}
              <div className="pt-6">
                <button
                  onClick={handleGenerate}
                  disabled={loading || !formData.employeeName || !formData.employeeId || !formData.company}
                  className={`w-full py-4 rounded-xl font-semibold text-white text-lg transition-all ${
                    loading || !formData.employeeName || !formData.employeeId || !formData.company
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-6 w-6 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating Certificate...
                    </span>
                  ) : '✨ Generate Certificate'}
                </button>
              </div>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">❌</span>
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Right: Results & Instructions */}
          <div className="space-y-6">
            {/* Success Result */}
            {result && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center mb-4">
                  <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                    <span className="text-3xl text-white">✓</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-green-800">Certificate Generated!</h3>
                    <p className="text-green-600">PDF downloaded automatically</p>
                  </div>
                </div>
                
                <div className="space-y-4 bg-white rounded-lg p-4 shadow-sm">
                  <div>
                    <label className="text-xs text-gray-500 uppercase font-semibold">Certificate Number</label>
                    <p className="font-bold text-lg text-gray-900">{result.certificateNumber}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-500 uppercase font-semibold">Reference Number</label>
                    <p className="font-bold text-lg text-gray-900">{result.referenceNumber}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-500 uppercase font-semibold">Verification PIN</label>
                    <p className="font-mono font-bold text-xl text-blue-600">{result.verificationPin}</p>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-200">
                    <label className="text-xs text-gray-500 uppercase font-semibold block mb-2">Quick Actions</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => navigator.clipboard.writeText(result.verificationPin)}
                        className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium"
                      >
                        📋 Copy PIN
                      </button>
                      <button
                        onClick={() => navigator.clipboard.writeText(result.certificateNumber)}
                        className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-sm font-medium"
                      >
                        📋 Copy Cert#
                      </button>
                      <button
                        onClick={() => navigator.clipboard.writeText(result.verificationUrl)}
                        className="col-span-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
                      >
                        🔗 Copy Verification URL
                      </button>
                      <a
                        href={result.verificationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="col-span-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium text-center"
                      >
                        🔍 Test Verification
                      </a>
                    </div>
                  </div>
                  
                  {/* QR Code Preview */}
                  {result.qrCodeDataUrl && (
                    <div className="pt-4 border-t border-gray-200 text-center">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-3">QR Code Preview</p>
                      <div className="inline-block p-3 bg-white rounded-lg border-2 border-gray-200 shadow-sm">
                        <img 
                          src={result.qrCodeDataUrl} 
                          alt="QR Code" 
                          className="w-32 h-32 mx-auto"
                        />
                        <p className="text-xs text-gray-500 mt-2">Scan to verify certificate</p>
                      </div>  
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Instructions */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 shadow-lg">
              <h3 className="font-bold text-blue-900 mb-4 text-lg">📋 How it Works</h3>
              <ol className="space-y-3 text-sm text-blue-800">
                <li className="flex items-start">
                  <span className="font-bold mr-2 text-blue-600">1.</span>
                  <span>Fill in all required employee and course details</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2 text-blue-600">2.</span>
                  <span>Click Generate Certificate button</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2 text-blue-600">3.</span>
                  <span>System generates unique certificate number, reference number, and QR code</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2 text-blue-600">4.</span>
                  <span>PDF downloads automatically with Bureau Veritas format</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2 text-blue-600">5.</span>
                  <span>Share certificate with employee</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2 text-blue-600">6.</span>
                  <span>Anyone can verify using QR code or PIN</span>
                </li>
              </ol>
            </div>
            
            {/* Certificate Format Info */}
            <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">📄 Certificate Format</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p><span className="font-semibold">• Front Page:</span> Employee details, issue/expiry dates</p>
                <p><span className="font-semibold">• Back Page:</span> Certificate type, trainer, QR code</p>
                <p><span className="font-semibold">• Format:</span> A4 size, Bureau Veritas official template</p>
                <p><span className="font-semibold">• Security:</span> Unique QR code + 6-digit PIN</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}