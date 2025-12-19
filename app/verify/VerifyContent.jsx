// app/verify/VerifyContent.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function VerifyContent() {
  const searchParams = useSearchParams();
  const urlCert = searchParams.get('cert'); // Get ?cert=... from URL

  const [documentNumber, setDocumentNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [certificateData, setCertificateData] = useState(null);

  // Auto-verify if ?cert= is present on page load
  useEffect(() => {
    if (urlCert && !showModal && !certificateData) {
      setDocumentNumber(urlCert);
      handleVerification(urlCert);
    }
  }, [urlCert]);

  const handleVerification = async (certNumber) => {
    setLoading(true);
    setError('');
    setShowModal(false);

    try {
      const response = await fetch(
        `/api/certificates/verify?cert=${encodeURIComponent(certNumber)}`
      );
      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Certificate not found. Please check the document number.');
        setLoading(false);
        return;
      }

      const cert = data.certificate;

      const formattedData = {
        deliverableId: cert.certificateNumber || certNumber,
        publishedOn: cert.createdAt
          ? new Date(cert.createdAt).toLocaleDateString('en-GB')
          : 'N/A',
        name: cert.employeeName || 'N/A',
        employeeId: cert.employeeId || 'N/A',
        validUntil: cert.expiryDate
          ? new Date(cert.expiryDate).toLocaleDateString('en-GB')
          : 'N/A',
        type: cert.courseName || cert.certificateType || 'N/A',
        company: cert.company || 'PRIVATE',
        trainingLocation: cert.location || 'N/A',
        trainer: cert.trainerName || 'N/A',
        isExpired: cert.isExpired,
      };

      setCertificateData(formattedData);
      setShowModal(true);
    } catch (err) {
      setError('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (documentNumber.trim()) {
      handleVerification(documentNumber.trim());
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setCertificateData(null);
    setError('');
    // Clear URL param after closing modal
    if (urlCert) {
      window.history.replaceState({}, '', '/verify');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {/* Fixed Background */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage:
            'ur[](https://e-certificates.bureauveritas.com/img/background-v3/background_industry.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: -1,
        }}
      />

      {/* Header */}
      <header
        style={{
          backgroundColor: '#00049E',
          padding: '20px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img
            src="https://e-certificates.bureauveritas.com/img/fingerprint.png"
            alt="Authenticate"
            style={{ width: '50px', height: '50px', objectFit: 'contain' }}
          />
          <div style={{ fontSize: '18px', color: '#fff' }}>
            <strong>Authenticate</strong>{' '}
            <span style={{ fontWeight: 'normal' }}>your document</span>
          </div>
        </div>
        <img
          src="https://www.bureauveritas.com/themes/custom/bv_bootstrap/logo.svg"
          alt="Bureau Veritas"
          style={{ height: '40px' }}
        />
      </header>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
        }}
      >
        <div style={{ width: '100%', maxWidth: '600px' }}>
          <div
            style={{
              width: '100%',
              height: '60px',
              background: 'linear-gradient(to right, #00049E, #0066cc)',
              borderTopLeftRadius: '12px',
              borderTopRightRadius: '12px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage:
                  'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)',
              }}
            />
          </div>

          <div
            style={{
              backgroundColor: '#fff',
              padding: '50px 40px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h1
                style={{
                  fontSize: '24px',
                  fontWeight: 'normal',
                  color: '#333',
                }}
              >
                Please search your e-document by filling the document number.
              </h1>
            </div>

            {error && (
              <div
                style={{
                  backgroundColor: '#f8d7da',
                  color: '#721c24',
                  padding: '12px',
                  borderRadius: '6px',
                  marginBottom: '20px',
                  textAlign: 'center',
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div
                style={{
                  display: 'flex',
                  border: '2px solid #ddd',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    backgroundColor: '#f5f5f5',
                    padding: '12px 20px',
                    borderRight: '2px solid #ddd',
                    fontSize: '14px',
                    color: '#666',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Document number
                </div>
                <input
                  type="text"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  required={!urlCert}
                  style={{
                    flex: 1,
                    padding: '12px 15px',
                    border: 'none',
                    fontSize: '16px',
                    outline: 'none',
                  }}
                  placeholder="e.g. 148-2024-024857-EN"
                />
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    backgroundColor: loading ? '#ccc' : '#00049E',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 30px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  {loading ? '...' : '🔍'}
                </button>
              </div>
            </form>
          </div>

          <div
            style={{
              width: '100%',
              height: '40px',
              background: 'linear-gradient(to right, #0066cc, #00049E)',
              borderBottomLeftRadius: '12px',
              borderBottomRightRadius: '12px',
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '20px',
          textAlign: 'center',
        }}
      >
        <a
          href="https://www.bureauveritas.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#00049E', textDecoration: 'none' }}
        >
          Visit <strong>Bureau Veritas Website</strong>
        </a>
      </footer>

      {/* Result Modal */}
      {showModal && certificateData && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={closeModal}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              maxWidth: '700px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                backgroundColor: '#00049E',
                padding: '30px',
                color: '#fff',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '60px', marginBottom: '10px' }}>✔</div>
              <p style={{ margin: '0 0 10px 0', fontSize: '16px' }}>
                Thank you for submitting your document for verification.
              </p>
              <p style={{ margin: 0, fontSize: '16px' }}>
                Please find below the answer to your request.
              </p>
            </div>

            <div style={{ padding: '30px' }}>
              <div
                style={{
                  backgroundColor: '#f8f9fa',
                  padding: '25px',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef',
                }}
              >
                <div style={{ lineHeight: '2' }}>
                  <div>
                    <strong>Deliverable Id :</strong>
                    <br />
                    {certificateData.deliverableId}
                  </div>
                  <div>
                    <strong>Published on :</strong>
                    <br />
                    {certificateData.publishedOn}
                  </div>
                  <div>
                    <strong>QR Code Status :</strong>
                    <br />
                    <span style={{ color: 'green', fontWeight: 'bold' }}>
                      Validated
                    </span>
                  </div>
                  <div>
                    <strong>NAME :</strong>
                    <br />
                    {certificateData.name}
                  </div>
                  <div>
                    <strong>ID :</strong>
                    <br />
                    {certificateData.employeeId}
                  </div>
                  <div>
                    <strong>VALID UNTIL :</strong>
                    <br />
                    {certificateData.validUntil}
                  </div>
                  <div>
                    <strong>TYPE :</strong>
                    <br />
                    {certificateData.type}
                  </div>
                  <div>
                    <strong>COMPANY :</strong>
                    <br />
                    {certificateData.company}
                  </div>
                  <div>
                    <strong>TRAINING LOCATION :</strong>
                    <br />
                    {certificateData.trainingLocation}
                  </div>
                  <div>
                    <strong>TRAINER :</strong>
                    <br />
                    {certificateData.trainer}
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: '20px',
                  fontSize: '14px',
                  color: '#666',
                  textAlign: 'center',
                }}
              >
                For any further information on this document, please contact the
                issuer of the document.
              </div>

              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <button
                  onClick={() => window.print()}
                  style={{
                    padding: '12px 30px',
                    backgroundColor: '#fff',
                    border: '2px solid #00049E',
                    color: '#00049E',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  🖨️ Print
                </button>
                <button
                  onClick={closeModal}
                  style={{
                    marginLeft: '10px',
                    padding: '12px 30px',
                    backgroundColor: '#00049E',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}