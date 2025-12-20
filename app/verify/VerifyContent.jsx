"use client";

// app/verify/VerifyContent.tsx
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CheckIcon } from "lucide-react";

export default function VerifyContent() {
  const searchParams = useSearchParams();
  const urlCert = searchParams.get("cert");
  const [documentNumber, setDocumentNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [certificateData, setCertificateData] = useState(null);
  const isAutoVerifyMode = !!urlCert;

  useEffect(() => {
    if (isAutoVerifyMode && !showModal && !certificateData && !error) {
      setDocumentNumber(urlCert);
      handleVerification(urlCert);
    }
  }, [urlCert]);

  const handleVerification = async (certNumber) => {
    setLoading(true);
    setError("");
    setShowModal(false);
    setCertificateData(null);

    try {
      const response = await fetch(
        `/api/certificates/verify?cert=${encodeURIComponent(certNumber)}`
      );
      const data = await response.json();

      if (!data.success) {
        setError(
          data.error ||
            "Certificate not found. Please check the document number."
        );
        setLoading(false);
        return;
      }

      const cert = data.certificate;
      const formattedData = {
        deliverableId: cert.certificateNumber || certNumber,
        publishedOn: cert.createdAt
          ? new Date(cert.createdAt).toLocaleDateString("en-GB")
          : "N/A",
        name: cert.employeeName || "N/A",
        employeeId: cert.employeeId || "N/A",
        validUntil: cert.expiryDate
          ? new Date(cert.expiryDate).toLocaleDateString("en-GB")
          : "N/A",
        type: cert.courseName || cert.certificateType || "N/A",
        company: cert.company || "PRIVATE",
        trainingLocation: cert.location || "N/A",
        trainer: cert.trainerName || "N/A",
        isExpired: cert.isExpired,
      };

      setCertificateData(formattedData);
      setShowModal(true);
    } catch (err) {
      setError("Network error. Please try again later.");
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
    setError("");
    if (urlCert) {
      window.history.replaceState({}, "", "/verify");
    }
  };

  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        fontFamily: "Arial, sans-serif",
        width: "100%",
        overflowX: "hidden",
      }}
    >
      {/* Fixed Background */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: "url('/background_industry.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "right",
          backgroundRepeat: "no-repeat",
          zIndex: -1,
        }}
      />

      {/* Responsive Header */}
      <header
        style={{
          backgroundColor: "#00049E",
          padding: "12px 16px",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "flex-start",
          alignItems: "center",
          gap: "12px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            minWidth: 0,
            flex: "1 1 280px",
          }}
        >
          <img
            src="https://e-certificates.bureauveritas.com/img/fingerprint.png"
            alt="Authenticate"
            style={{
              width: isMobile ? "50px" : "70px",
              height: isMobile ? "50px" : "70px",
              objectFit: "contain",
              flexShrink: 0,
            }}
          />
          <div
            style={{
              color: "#fff",
              fontSize: isMobile ? "18px" : "28px",
              fontWeight: "normal",
              lineHeight: "1.2",
              wordBreak: "break-word",
            }}
          >
            Authenticate your document
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px 16px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ width: "100%", maxWidth: "700px" }}>
          <div className="rounded-4xl shadow-2xl overflow-hidden bg-white">
            <div>
              <img
                src="https://e-certificates.bureauveritas.com/img/content_industry_top.png"
                alt=""
                style={{ width: "100%", height: "80px", display: "block" }}
              />
            </div>
            <div
              style={{
                background: "#f6f6f6",
                padding: "16px",
              }}
            >
              <h1
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#000",
                  margin: "0 0 8px 0",
                  textAlign: isAutoVerifyMode ? "center" : "left",
                }}
              >
                {isAutoVerifyMode
                  ? loading
                    ? "Verifying certificate..."
                    : error
                    ? "Verification Failed"
                    : "Certificate Details"
                  : "Please search your e-document by filling the document number."}
              </h1>
            </div>
            <div style={{ padding: "20px" }}>
              {isAutoVerifyMode && error && (
                <div
                  style={{
                    backgroundColor: "#fee2e2",
                    color: "#991b1b",
                    padding: "16px",
                    borderRadius: "8px",
                    textAlign: "center",
                    fontSize: "16px",
                  }}
                >
                  {error}
                </div>
              )}

              {isAutoVerifyMode && loading && (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div
                    style={{
                      display: "inline-block",
                      width: "40px",
                      height: "40px",
                      border: "4px solid #f3f3f3",
                      borderTop: "4px solid #00049E",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  <style jsx>{`
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `}</style>
                </div>
              )}

              {!isAutoVerifyMode && (
                <>
                  {!error && !loading && (
                    <form onSubmit={handleSubmit}>
                      <div
                        style={{
                          display: "flex",
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          overflow: "hidden",
                          flexWrap: isMobile ? "wrap" : "nowrap",
                        }}
                      >
                        <div
                          style={{
                            backgroundColor: "#d1d5db",
                            padding: isMobile ? "6px 8px" : "8px 12px",
                            borderRight: isMobile ? "none" : "2px solid #d1d5db",
                            borderBottom: isMobile ? "2px solid #d1d5db" : "none",
                            display: "flex",
                            alignItems: "center",
                            fontSize: isMobile ? "12px" : "14px",
                            color: "#000",
                            whiteSpace: "nowrap",
                            fontWeight: isMobile ? "500" : "normal",
                          }}
                        >
                          Document number
                        </div>
                        <input
                          type="text"
                          value={documentNumber}
                          onChange={(e) => setDocumentNumber(e.target.value)}
                          required
                          style={{
                            flex: "1 1 150px",
                            padding: isMobile ? "10px 8px" : "8px 12px",
                            border: "none",
                            outline: "none",
                            fontSize: isMobile ? "15px" : "16px",
                            minWidth: 0,
                          }}
                          placeholder=""
                        />
                        <button
                          type="submit"
                          disabled={loading}
                          style={{
                            backgroundColor: "#00049E",
                            color: "#fff",
                            width: isMobile ? "36px" : "40px",
                            minWidth: isMobile ? "36px" : "40px",
                            border: "none",
                            cursor: loading ? "not-allowed" : "pointer",
                            fontSize: isMobile ? "16px" : "18px",
                            opacity: loading ? 0.6 : 1,
                          }}
                        >
                          {loading ? "..." : "🔍"}
                        </button>
                      </div>
                    </form>
                  )}

                  {!isAutoVerifyMode && error && (
                    <div
                      style={{
                        backgroundColor: "#fee2e2",
                        color: "#991b1b",
                        padding: "12px",
                        borderRadius: "6px",
                        marginTop: "20px",
                        textAlign: "center",
                      }}
                    >
                      {error}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ padding: "20px", textAlign: "center" }}>
        <a
          href="https://www.bureauveritas.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#00049E", textDecoration: "none" }}
        >
          Visit <br />
          <strong>Bureau Veritas Website</strong>
        </a>
      </footer>

      {/* Success Modal - Full width & shorter on mobile, centered everywhere */}
      {showModal && certificateData && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: isMobile ? "0" : "20px",  // No padding on mobile → full width
            boxSizing: "border-box",
          }}
          onClick={closeModal}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: isMobile ? "50px 50px 0 0" : "16px",
              width: isMobile ? "100%" : "100%",           // Full width on mobile
              maxWidth: isMobile ? "none" : "700px",        // No max width limit on mobile
              height: isMobile ? "auto" : "auto",
              maxHeight: isMobile ? "80vh" : "90vh",        // Shorter on mobile (~80% of screen)
              overflowY: "auto",
              margin: "auto",
              position: "relative",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            {/* <button
              onClick={closeModal}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "rgba(0,0,0,0.5)",
                border: "none",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                fontSize: "24px",
                color: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
              }}
              aria-label="Close"
            >
              ×
            </button> */}

            <div style={{ position: "relative" }}>
              <img
                src="https://e-certificates.bureauveritas.com/img/content_industry_top.png"
                alt=""
                style={{ width: "100%", height: "80px", display: "block" }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "40px",
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              >
                <div
                  style={{
                    border: "2px solid white",
                    borderRadius: "50%",
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: "-16px",
                    backgroundColor: "white",
                  }}
                >
                  <CheckIcon size={20} style={{ color: "green" }} />
                </div>
              </div>
            </div>

            <div
              style={{
                padding: isMobile ? "16px 24px" : "20px 30px",
                paddingBottom: isMobile ? "40px" : "40px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: isMobile ? "10px" : "16px",
                  fontSize: isMobile ? "15px" : "16px",
                  lineHeight: "1.5",
                  color: "#374151",
                }}
              >
                <div><strong>Deliverable Id :</strong><br /><span style={{ wordBreak: "break-all" }}>{certificateData.deliverableId}</span></div>
                <div><strong>Published on :</strong><br />{certificateData.publishedOn}</div>
                <div><strong>QR Code Status :</strong><br /><span>Validated</span></div>
                <div><strong>NAME :</strong><br />{certificateData.name}</div>
                <div><strong>ID :</strong><br />{certificateData.employeeId}</div>
                <div><strong>VALID UNTIL :</strong><br />{certificateData.validUntil}</div>
                <div><strong>TYPE :</strong><br />{certificateData.type}</div>
                <div><strong>COMPANY :</strong><br />{certificateData.company}</div>
                <div><strong>TRAINING LOCATION :</strong><br />{certificateData.trainingLocation}</div>
                <div><strong>TRAINER :</strong><br />{certificateData.trainer}</div>
              </div>

              <div
                style={{
                  marginTop: isMobile ? "30px" : "30px",
                  fontSize: isMobile ? "13px" : "14px",
                  color: "#666",
                  lineHeight: "1.5",
                  textAlign: "center",
                }}
              >
                For any further information on this document, please contact the
                issuer of the document.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}