// app/verify/VerifyContent.tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function VerifyContent() {
  const searchParams = useSearchParams();
  const urlCert = searchParams.get("cert"); // Get ?cert=... from URL

  const [documentNumber, setDocumentNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
    setError("");
    setShowModal(false);

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
    // Clear URL param after closing modal
    if (urlCert) {
      window.history.replaceState({}, "", "/verify");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        fontFamily: "Arial, sans-serif",
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
          backgroundImage: "url('/background_industry.jpg')", // ← Local image
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          zIndex: -1,
        }}
      />

      {/* Header */}
      <header
        style={{
          backgroundColor: "#00049E",
          padding: "10px 10px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <img
            src="https://e-certificates.bureauveritas.com/img/fingerprint.png"
            alt="Authenticate"
            style={{ width: "80px", height: "80px", objectFit: "contain" }}
          />
          <div style={{ fontSize: "30px", color: "#fff" }}>
            <span style={{ fontWeight: "normal" }}>
              Authenticate your document
            </span>
          </div>
        </div>
        {/* <img
          src="https://www.bureauveritas.com/themes/custom/bv_bootstrap/logo.svg"
          alt="Bureau Veritas"
          style={{ height: '40px' }}
        /> */}
      </header>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="flex items-center justify-center pt-0" style={{}}>
          <div className="w-full max-w-3xl">
            <div className="rounded-xl shadow-2xl overflow-hidden">
              <div className="w-full">
                <img
                  src="https://e-certificates.bureauveritas.com/img/content_industry_top.png"
                  alt=""
                  className="w-full h-[80px] block"
                />
              </div>

              <div
                className=""
                style={{
                  background: "#f6f6f6",
                }}
              >
                <h1 className="text-xl px-6 py-2 pt-4 pb-0 font-semibold text-black">
                  Please search your e-document by filling the document number.
                </h1>
              </div>

              <div className="pl-6 pt-4 pb-4 pr-6 bg-white">
                {error && (
                  <div className="bg-red-100 text-red-800 p-3 rounded-md mb-6 text-center">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="flex border border-gray-300 rounded overflow-hidden">
                    <div className="bg-gray-300 px-3 py-1 border-r-2 border-gray-300 flex items-center text-sm text-black whitespace-nowrap">
                      Document number
                    </div>
                    <input
                      type="text"
                      value={documentNumber}
                      onChange={(e) => setDocumentNumber(e.target.value)}
                      required
                      className="flex-1 px-4 py-1 text-base outline-none"
                      placeholder=""
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-[#00049E] text-xs rounded-r disabled:bg-gray-400 text-white w-10 font-bold cursor-pointer disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? "..." : "🔍"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          // backgroundColor: "rgba(255, 255, 255, 0.95)",
          padding: "20px",
        }}
      >
        <a
          href="https://www.bureauveritas.com"
          target="_blank"
          rel="noopener noreferrer"
          // style={{ color: "#00049E", textDecoration: "none" }}
        >
          Visit <br />
          <strong>Bureau Veritas Website</strong>
        </a>
      </footer>

      {/* Result Modal */}
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
            padding: "20px",
          }}
          onClick={closeModal}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              maxWidth: "700px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "30px",
                color: "#fff",
                textAlign: "center",
              }}
            >
              <div className="w-full relative">
                <img
                  src="https://e-certificates.bureauveritas.com/img/content_industry_top.png"
                  alt=""
                  className="w-full h-[80px] block"
                />
                <div className="absolute top-[58px] left-[50%] transform -translate-x-1/2">
                  <div className="border-2 border-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg -mt-8 ml-6">
                    <div style={{ fontSize: "20px", marginBottom: "0px" , color: "green" }}>
                      ✔
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: "0 30px" }}>
              <div
                style={{
                  // backgroundColor: "#f8f9fa",
                  padding: "0 25px",
                  borderRadius: "8px",
                  // border: "1px solid #e9ecef",
                }}
              >
                <div style={{ lineHeight: "2" }}>
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
                    <span style={{ color: "green", fontWeight: "bold" }}>
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
                  marginTop: "20px",
                  fontSize: "14px",
                  color: "#666",
                  paddingBottom: "20px",
                }}
              >
                For any further information on this document, please contact the
                issuer of the document.
              </div>

              {/* <div style={{ marginTop: "20px", textAlign: "center" }}>
                <button
                  onClick={() => window.print()}
                  style={{
                    padding: "12px 30px",
                    backgroundColor: "#fff",
                    border: "2px solid #00049E",
                    color: "#00049E",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  🖨️ Print
                </button>
                <button
                  onClick={closeModal}
                  style={{
                    marginLeft: "10px",
                    padding: "12px 30px",
                    backgroundColor: "#00049E",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Close
                </button>
              </div> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
