// app/admin/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GenerateCertificatePage() {
  const router = useRouter();

  // Helper: Format date to dd-mm-yyyy
  const formatDateDDMMYYYY = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Set default issue date to December 20, 2025
  const defaultIssueDate = "20-12-2025";

  const [formData, setFormData] = useState({
    employeeName: "",
    employeeId: "",
    company: "",
    issuanceNumber: "1",
    issueDate: defaultIssueDate,
    expiryDate: "", // Will be auto-filled
    courseName: "BV Safety Course",
    certificateType: "FIRE WATCH & STANDBY",
    model: "",
    trainerName: "ZEESHAN KHAN",
    location: "JUBAIL",
    contactPhone: "013 347 9683",
    contactEmail: "byjubail.admin@bureauveritas.com",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [employeeImage, setEmployeeImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Auto-calculate expiry date whenever issueDate changes
  useEffect(() => {
    const dateStr = formData.issueDate.trim();
    const match = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (match) {
      const [, day, month, year] = match.map(Number);
      const date = new Date(year, month - 1, day);
      if (!isNaN(date.getTime())) {
        date.setFullYear(date.getFullYear() + 1);
        setFormData((prev) => ({
          ...prev,
          expiryDate: formatDateDDMMYYYY(date),
        }));
        return;
      }
    }
    // If invalid format, clear expiry
    setFormData((prev) => ({ ...prev, expiryDate: "" }));
  }, [formData.issueDate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file (JPG, PNG, etc.)");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setEmployeeImage(reader.result);
        setError("");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setEmployeeImage(null);
    setImagePreview(null);
  };

  const handleGenerate = async () => {
    if (!formData.employeeName || !formData.employeeId || !formData.company) {
      setError("Please fill in all required fields: Name, ID, and Company");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/certificates/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          employeeImage: employeeImage,
        }),
      });

      const res = await response.json();

      if (!res.success) {
        throw new Error(res.error || "Failed to generate certificate");
      }

      // Use dd-mm-yyyy directly from formData
      const issueDateFormatted = formData.issueDate;
      const expiryDateFormatted = formData.expiryDate;

      generateClientSidePDF({
        ...formData,
        certificateNumber: res.certificateNumber,
        referenceNumber: res.referenceNumber,
        issueDateFormatted,
        expiryDateFormatted,
        employeeImage: employeeImage || null,
        qrCodeUrl: res.qrCodeDataUrl,
      });

      setResult({
        certificateNumber: res.certificateNumber,
        referenceNumber: res.referenceNumber,
        verificationUrl: res.verificationUrl,
        qrCodeDataUrl: res.qrCodeDataUrl,
      });
    } catch (err) {
      setError(err.message || "Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const generateClientSidePDF = (data) => {
    const {
      employeeName,
      employeeId,
      company,
      issuanceNumber = "1",
      issueDateFormatted,
      expiryDateFormatted,
      courseName = "BV Safety Course",
      certificateType = "FIRE WATCH & STANDBY",
      model = "N/A",
      trainerName = "ZEESHAN KHAN",
      location = "JUBAIL",
      contactPhone = "013 347 9683",
      contactEmail = "byjubail.admin@bureauveritas.com",
      employeeImage,
      certificateNumber,
      referenceNumber,
      qrCodeUrl,
    } = data;

    const LOGO_URL = "/bur.jpg";
    const QR_CODE_URL = qrCodeUrl;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bureau Veritas Safety Certificate</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: Arial, Helvetica, sans-serif; 
      background: white; 
      margin: 0; 
      padding: 0; 
      -webkit-print-color-adjust: exact; 
      print-color-adjust: exact; 
    }
    @page { size: 85.6mm 54mm; margin: 0; }
    .certificate-page { 
      width: 85.6mm; 
      height: 54mm; 
      position: relative; 
      background: white; 
      page-break-after: always; 
      overflow: hidden; 
    }

    /* Front Side */
    .card-front { 
      position: relative; 
      height: 100%; 
    }
    
    .bg-logo {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 40mm;
      height: 40mm;
      opacity: 0.5;
      z-index: 0;
      pointer-events: none;
    }

    .card-content { 
      position: relative; 
      z-index: 1; 
      height: 100%; 
      display: flex; 
      flex-direction: column; 
    }

    .first-row { 
      display: flex; 
      align-items: center; 
      padding: 1mm 1.5mm; 
      gap: 2mm; 
      border-bottom: 0.7mm solid #000; 
      height: 20mm; 
    }

    .top-logo { 
      width: 15mm; 
      height: auto; 
      flex-shrink: 0; 
    }

    .cert-info { 
      flex: 1; 
      display: flex; 
      flex-direction: column; 
      justify-content: center; 
      font-size: 10px; 
    }

    .cert-row { 
      display: flex; 
      gap: 2mm; 
      line-height: 1.4;
    }
    .cert-label { 
      font-weight: 700; 
      color: black; 
    }
    .cert-value { 
      font-weight: 700; 
      color: black; 
    }
    .color { 
      color: #3200fd;  
    }

    .photo { 
      width: 14mm; 
      height: 16mm; 
      border: none; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      color: #666; 
      font-size: 2mm; 
      font-weight: 700; 
      overflow: hidden;
    }
    .photo img { 
      width: 100%; 
      height: 100%; 
      object-fit: cover; 
    }

    .personal-info { 
      padding: 1.5mm 1.5mm; 
      border-bottom: 0.4mm solid #000; 
      font-size: 10px; 
      display: flex; 
      flex-direction: column; 
      justify-content: center; 
      height: 20mm; 
      gap: 2px; 
    }
    .info-item.full-width { 
      display: flex; 
      gap: 1mm; 
      align-items: center; 
    }
    .info-item-label { 
      font-weight: 700; 
      color: black; 
      flex-shrink: 0; 
      min-width: 18mm; 
    }
    .info-item-value { 
      font-weight: 700; 
      color: black; 
    }
    .name-value { 
      color: #3200fd; 
    }

    .cert-text-section { 
      padding: 1mm 1.5mm; 
      border-bottom: 0.4mm solid #000; 
      display: flex; 
      align-items: center; 
      flex: 1; 
      height: 6mm; 
    }
    .certification-text { 
      font-size: 8px; 
      font-weight: 600; 
      line-height: 1.4; 
      color: black; 
      text-align: justify; 
    }

    .contact-section { 
      text-align: center; 
      padding: 0mm; 
      font-size: 7px; 
      font-weight: 600; 
      color: black; 
      display: flex; 
      flex-direction: column; 
      justify-content: center; 
      height: 5mm; 
      line-height: 1.4; 
    }

    /* Back Side */
    .card-back { 
      display: flex; 
      flex-direction: column; 
      height: 100%; 
    }
    .back-main-content { 
      display: flex; 
      flex: 1; 
      padding: 2mm; 
    }
    .left-side { 
      width: 50%; 
      display: flex; 
      justify-content: center; 
      align-items: center; 
    }
    .qr-code { 
      width: 45mm; 
      height: 45mm; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      overflow: hidden; 
    }
    .qr-code img { 
      width: 100%; 
      height: 100%; 
      object-fit: contain; 
    }
    .right-side { 
      width: 50%; 
      padding: 3mm 1mm 0 1mm; 
      display: flex; 
      flex-direction: column; 
      overflow: hidden; 
    }
    .back-cert { 
      font-size: 10px; 
      font-weight: 700; 
      margin-bottom: 2px; 
      line-height: 1.3;
    }
    .course-field { 
      font-size: 8px; 
      margin-bottom: 1.5px; 
      display: flex; 
      gap: 1mm; 
      line-height: 1.3;
    }
    .course-label { 
      color: black; 
      font-weight: 700; 
      text-transform: uppercase; 
      flex-shrink: 0; 
      min-width: 18mm;
    }
    .course-value { 
      color: black; 
      font-weight: 600; 
      word-break: break-word; 
    }
    .disclaimer { 
      font-size: 6px; 
      font-weight: 500; 
      line-height: 1.3; 
      color: black; 
      margin-top: 3px; 
      text-align: justify; 
      flex: 1; 
    }

    .verification-footer {
      width: 100%;
      padding: 1.2mm 3mm;
      font-size: 7px;
      font-weight: 600;
      color: #d32f2f;
      text-align: center;
      line-height: 1.3;
      background: #fafafa;
    }

    @media print {
      body, html { margin: 0; padding: 0; }
      .certificate-page { margin: 0; }
    }
  </style>
</head>
<body>

  <!-- Front Side -->
  <div class="certificate-page card-front">
    <img src="${LOGO_URL}" alt="Bureau Veritas" class="bg-logo">
    <div class="card-content">
      <div class="first-row">
        <img src="${LOGO_URL}" alt="Bureau Veritas" class="top-logo">
        <div class="cert-info">
          <div style="text-align: left;">
            <div style="font-weight: 700; font-size: 10px; color: black;">Certificate No:</div>
            <div class="color" style="font-weight: 700; font-size: 10px;">${certificateNumber}</div>
          </div>

          <div class="cert-row"><span class="cert-label">Ref.#</span><span class="cert-value">${referenceNumber}</span></div>
          <div class="cert-row"><span class="cert-label">Issued On:</span><span class="cert-value">${issueDateFormatted}</span></div>
          <div class="cert-row"><span class="cert-label">Valid Until:</span><span class="cert-value">${expiryDateFormatted}</span></div>
        </div>
        <div class="photo">
          ${employeeImage ? `<img src="${employeeImage}" alt="Employee Photo">` : "PHOTO"}
        </div>
      </div>

      <div class="personal-info">
        <div class="info-item full-width"><span class="info-item-label">Name:</span><span class="info-item-value name-value">${employeeName}</span></div>
        <div class="info-item full-width"><span class="info-item-label">ID No:</span><span class="info-item-value">${employeeId}</span></div>
        <div class="info-item full-width"><span class="info-item-label">Company:</span><span class="info-item-value">${company}</span></div>
        <div class="info-item full-width"><span class="info-item-label">Issuance No:</span><span class="info-item-value">${issuanceNumber}</span></div>
      </div>

      <div class="cert-text-section">
        <div class="certification-text">
          This certifies that the above mentioned person has successfully completed the ${courseName || "specified training course"}. Refer to backside for details.
        </div>
      </div>

      <div class="contact-section">
        <span>For any queries: Tel. ${contactPhone}</span>
        <span>${contactEmail}</span>
      </div>
    </div>
  </div>

  <!-- Back Side -->
  <div class="certificate-page card-back">
    <div class="back-main-content">
      <div class="left-side">
        <div class="qr-code">
          <img src="${QR_CODE_URL}" alt="QR Code">
        </div>
      </div>
      <div class="right-side">
        <div class="back-cert">CERTIFICATE NO:<br/><span class="">${certificateNumber}</span></div>
        <div class="course-field"><div class="course-label">TYPE:</div><div class="course-value">${certificateType || "N/A"}</div></div>
        <div class="course-field"><div class="course-label">MODEL:</div><div class="course-value">${model || "N/A"}</div></div>
        <div class="course-field"><div class="course-label">TRAINER:</div><div class="course-value">${trainerName}</div></div>
        <div class="course-field"><div class="course-label">LOCATION:</div><div class="course-value">${location}</div></div>
        <div class="disclaimer">
          This card does not relieve the operator from responsibilities related to the safe handling operation, or reliability of the listed equipment. Only contracted parties can hold Bureau Veritas liable for errors/omissions related to this card. Bureau Veritas is not liable for any mistakes, negligence, judgement or fault committed by the person holding this card. The SAG license is the client's responsibility.
        </div>
      </div>
    </div>
    <div class="verification-footer">
      Scan QR code to verify this certificate at https://e-certificates.bureauveritas.com 
    </div>
  </div>

</body>
</html>`;

    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.left = "-9999px";
    iframe.style.top = "-9999px";
    iframe.style.width = "85.6mm";
    iframe.style.height = "108mm";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(htmlContent);
    doc.close();

    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 3000);
      }, 800);
    };
  };

  const handleViewAll = () => {
    router.push("/admin/certificates");
  };

  const handleReset = () => {
    setFormData({
      employeeName: "",
      employeeId: "",
      company: "",
      issuanceNumber: "1",
      issueDate: defaultIssueDate,
      expiryDate: "",
      courseName: "BV Safety Course",
      certificateType: "FIRE WATCH & STANDBY",
      model: "",
      trainerName: "ZEESHAN KHAN",
      location: "JUBAIL",
      contactPhone: "013 347 9683",
      contactEmail: "byjubail.admin@bureauveritas.com",
    });
    setResult(null);
    setError("");
    setEmployeeImage(null);
    setImagePreview(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Certificate Generator
              </h1>
              <p className="text-gray-600">
                Bureau Veritas Safety Course Certification
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => (window.location.href = "/")}
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
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Certificate Details
              </h2>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                🔄 Reset Form
              </button>
            </div>

            <div className="space-y-6">
              {/* Employee Information */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  👤 Employee Information
                </h3>

                <div className="space-y-4">
                  <div className="bg-blue-50 border-2 border-dashed border-blue-300 rounded-xl p-6">
                    <div className="flex items-start space-x-6">
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

                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Employee Photo <span className="text-blue-600">(Optional)</span>
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
                            📷 {imagePreview ? "Change Photo" : "Upload Photo"}
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
                      placeholder="Enter full name"
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

              {/* Course Information - Text Inputs */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  📚 Course Information
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Course Name <span className="text-gray-500">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        name="courseName"
                        value={formData.courseName}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., BV Safety Course"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Certificate Type <span className="text-gray-500">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        name="certificateType"
                        value={formData.certificateType}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., FIRE WATCH & STANDBY"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Model <span className="text-gray-500 text-xs">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Forklift Model 2000 or N/A"
                    />
                  </div>
                </div>
              </div>

              {/* Validity Period - dd-mm-yyyy Text Inputs */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  📅 Validity Period
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Issue Date
                    </label>
                    <input
                      type="text"
                      name="issueDate"
                      value={formData.issueDate}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="dd-mm-yyyy"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={formData.expiryDate}
                      // readOnly
                      className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                      placeholder="Auto-calculated"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Auto-calculated: 1 year from issue date
                    </p>
                  </div>
                </div>
              </div>

              {/* Training Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  🎓 Training Details
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Trainer Name
                      </label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., JUBAIL"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Phone
                      </label>
                      <input
                        type="text"
                        name="contactPhone"
                        value={formData.contactPhone}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        name="contactEmail"
                        value={formData.contactEmail}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl"
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-6 w-6 mr-3 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating Certificate...
                    </span>
                  ) : (
                    "✨ Generate Certificate"
                  )}
                </button>
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
          </div>

          {/* Right Sidebar - Results & Info */}
          <div className="space-y-6">
            {result && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center mb-4">
                  <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                    <span className="text-3xl text-white">✓</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-green-800">Certificate Generated!</h3>
                    <p className="text-green-600">PDF printed automatically</p>
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
                  {result.qrCodeDataUrl && (
                    <div className="pt-4 border-t border-gray-200 text-center">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-3">QR Code Preview</p>
                      <div className="inline-block p-3 bg-white rounded-lg border-2 border-gray-200 shadow-sm">
                        <img src={result.qrCodeDataUrl} alt="QR Code" className="w-32 h-32 mx-auto" />
                        <p className="text-xs text-gray-500 mt-2">Scan to verify certificate</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Instructions and Info Panels - unchanged */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 shadow-lg">
              <h3 className="font-bold text-blue-900 mb-4 text-lg">📋 How it Works</h3>
              <ol className="space-y-3 text-sm text-blue-800">
                <li className="flex items-start"><span className="font-bold mr-2 text-blue-600">1.</span><span>Fill in employee details</span></li>
                <li className="flex items-start"><span className="font-bold mr-2 text-blue-600">2.</span><span>Enter course info (optional fields allowed)</span></li>
                <li className="flex items-start"><span className="font-bold mr-2 text-blue-600">3.</span><span>Set issue date in dd-mm-yyyy format</span></li>
                <li className="flex items-start"><span className="font-bold mr-2 text-blue-600">4.</span><span>Click Generate → PDF prints automatically</span></li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}