"use client";

export default function Loading() {
  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .l-wrap {
          animation: fadeIn 0.4s ease forwards;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background: #0a0a0f;
          gap: 28px;
        }
        .l-title {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(18px, 4vw, 26px);
          color: #d1cfe8;
          letter-spacing: 0.08em;
          margin: 0;
          text-align: center;
        }
        .l-spinner {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 2px solid #1a1a2e;
          border-top-color: #d4a843;
          animation: spin 0.8s linear infinite;
          box-shadow: 0 0 12px rgba(212, 168, 67, 0.25);
        }
      `}</style>

      <div className="l-wrap">
        <p className="l-title">AYDIN GENÇLİK ZİRVESİ</p>
        <div className="l-spinner" />
      </div>
    </>
  );
}
