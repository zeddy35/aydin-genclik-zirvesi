"use client";

import Link from "next/link";

const C = {
  bg:       "#070709",
  surf:     "#0c0c12",
  border:   "#1c1c28",
  borderHi: "#2a2a3a",
  red:      "#c0392b",
  redDim:   "#3a0a0a",
  redText:  "#e05050",
  gold:     "#c8a84b",
  goldDim:  "#2a1f00",
  amber:    "#d97706",
  txt:      "#ede9f8",
  txtSec:   "#918da8",
  txtMuted: "#524e68",
  txtCode:  "#3c3a52",
  green:    "#2d6a4f",
  greenText:"#52b788",
  mono:     "var(--font-share-tech-mono), monospace",
  display:  "var(--font-oswald), sans-serif",
  ui:       "var(--font-lexend), sans-serif",
} as const;

interface RouteNode {
  label: string;
  sublabel?: string;
  type: "start" | "mid" | "end";
}

const FLOW: RouteNode[] = [
  { label: "AYDIN OTOGAR", sublabel: "Şehirlerarası Terminal", type: "start" },
  { label: "1 NUMARA — BEYAZ OTOBÜs", sublabel: "Opsmall AVM tarafındaki şehiriçi durağından · 06:45 ilk sefer · ~8 dk aralık · NAKİT", type: "mid" },
  { label: "KENT MEYDANI", sublabel: "Aktarma Noktası", type: "mid" },
  { label: "ADÜ KONGRE MERKEZİ", sublabel: "Varış — Zirve Ana Alanı", type: "end" },
];

const YELLOW_BUSES = ["103","106","401","402","403","404","405","501","504"];
const WHITE_BUSES  = ["10","11","16"];

export default function UlasimDestekPage() {
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${C.bg}; color: ${C.txt}; }

        .ud-root {
          min-height: 100dvh;
          background: ${C.bg};
          font-family: ${C.ui};
          color: ${C.txt};
        }

        /* topbar */
        .ud-topbar {
          position: sticky;
          top: 0;
          z-index: 50;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          border-bottom: 1px solid ${C.border};
          background: ${C.bg};
        }

        /* hero */
        .ud-hero {
          text-align: center;
          padding: clamp(48px, 8vw, 96px) 24px clamp(32px, 5vw, 56px);
          border-bottom: 1px solid ${C.border};
          position: relative;
          overflow: hidden;
        }
        .ud-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 60% 60% at 50% 0%, ${C.redDim}88 0%, transparent 70%);
          pointer-events: none;
        }
        .ud-hero-eyebrow {
          font-family: ${C.mono};
          font-size: 9px;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: ${C.redText};
          margin-bottom: 16px;
        }
        .ud-hero-title {
          font-family: ${C.display};
          font-size: clamp(28px, 6vw, 64px);
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          line-height: 1;
          margin-bottom: 12px;
        }
        .ud-hero-sub {
          font-family: ${C.ui};
          font-size: clamp(13px, 1.2vw, 15px);
          color: ${C.txtSec};
        }

        /* layout */
        .ud-main {
          max-width: 820px;
          margin: 0 auto;
          padding: clamp(24px, 4vw, 48px) 20px clamp(48px, 6vw, 80px);
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* section card */
        .ud-card {
          border: 1px solid ${C.border};
          border-radius: 2px;
          overflow: hidden;
          background: ${C.surf};
        }
        .ud-card-header {
          background: transparent;
          border-bottom: 1px solid ${C.border};
          padding: 12px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .ud-card-label {
          font-family: ${C.mono};
          font-size: 9px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: ${C.txtCode};
        }
        .ud-card-title {
          font-family: ${C.display};
          font-size: clamp(13px, 1.4vw, 15px);
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: ${C.txt};
        }
        .ud-card-body {
          padding: 20px;
        }

        /* location grid */
        .ud-loc-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        @media (max-width: 520px) { .ud-loc-grid { grid-template-columns: 1fr; } }

        .ud-loc-item {
          border: 1px solid ${C.border};
          border-radius: 2px;
          padding: 16px;
        }
        .ud-loc-item-label {
          font-family: ${C.mono};
          font-size: 8px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: ${C.txtCode};
          margin-bottom: 6px;
        }
        .ud-loc-item-name {
          font-family: ${C.display};
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: ${C.gold};
          margin-bottom: 4px;
        }
        .ud-loc-item-addr {
          font-size: 13px;
          color: ${C.txtSec};
          margin-bottom: 14px;
          line-height: 1.5;
        }
        .ud-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          font-family: ${C.mono};
          font-size: 9px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          text-decoration: none;
          border: 1px solid;
          border-radius: 2px;
          transition: background 200ms, color 200ms;
          cursor: pointer;
        }
        .ud-btn-red {
          color: ${C.redText};
          border-color: ${C.red}55;
          background: ${C.redDim};
        }
        .ud-btn-red:hover { background: ${C.red}33; border-color: ${C.red}99; }
        .ud-btn-gold {
          color: ${C.gold};
          border-color: ${C.gold}55;
          background: ${C.goldDim};
        }
        .ud-btn-gold:hover { background: ${C.gold}22; border-color: ${C.gold}99; }

        /* flow */
        .ud-flow {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
        }
        .ud-flow-node {
          width: 100%;
          max-width: 480px;
          padding: 14px 20px;
          border-radius: 2px;
          border: 1px solid;
          text-align: center;
        }
        .ud-flow-node-title {
          font-family: ${C.display};
          font-size: clamp(13px, 1.4vw, 15px);
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .ud-flow-node-sub {
          font-family: ${C.ui};
          font-size: 12px;
          margin-top: 4px;
          line-height: 1.5;
        }
        .node-start {
          background: ${C.redDim};
          border-color: ${C.red}66;
        }
        .node-start .ud-flow-node-title { color: ${C.redText}; }
        .node-start .ud-flow-node-sub   { color: ${C.redText}88; }

        .node-mid-route {
          background: ${C.goldDim};
          border-color: ${C.gold}44;
          border-style: dashed;
        }
        .node-mid-route .ud-flow-node-title { color: ${C.gold}; }
        .node-mid-route .ud-flow-node-sub   { color: ${C.amber}99; }

        .node-mid {
          background: ${C.surf};
          border-color: ${C.border};
        }
        .node-mid .ud-flow-node-title { color: ${C.txtSec}; }
        .node-mid .ud-flow-node-sub   { color: ${C.txtMuted}; }

        .node-end {
          background: #0a1a0e;
          border-color: ${C.green}66;
        }
        .node-end .ud-flow-node-title { color: ${C.greenText}; }
        .node-end .ud-flow-node-sub   { color: ${C.greenText}88; }

        .ud-flow-arrow {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 6px 0;
          color: ${C.txtCode};
          gap: 2px;
        }
        .ud-flow-arrow-label {
          font-family: ${C.mono};
          font-size: 8px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }

        /* transfer grid */
        .ud-transfer-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 16px;
        }
        @media (max-width: 480px) { .ud-transfer-grid { grid-template-columns: 1fr; } }

        .ud-transfer-box {
          border: 1px solid ${C.border};
          border-radius: 2px;
          padding: 16px;
        }
        .ud-transfer-box-title {
          font-family: ${C.display};
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .ud-transfer-box-sub {
          font-size: 12px;
          color: ${C.txtSec};
          margin-bottom: 12px;
        }
        .ud-badge-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .ud-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 2px;
          font-family: ${C.mono};
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          min-width: 36px;
          text-align: center;
        }
        .ud-badge-gold {
          background: ${C.goldDim};
          color: ${C.gold};
          border: 1px solid ${C.gold}44;
        }
        .ud-badge-muted {
          background: ${C.border};
          color: ${C.txtSec};
          border: 1px solid ${C.borderHi};
        }

        /* info box */
        .ud-info-box {
          border-radius: 2px;
          padding: 14px 18px;
          border: 1px solid;
          font-size: 13px;
          line-height: 1.7;
        }
        .ud-info-box.red  { background: ${C.redDim}88; border-color: ${C.red}44; }
        .ud-info-box.gold { background: ${C.goldDim};  border-color: ${C.gold}44; }
        .ud-info-box ul   { padding-left: 16px; }
        .ud-info-box li   { margin-bottom: 6px; }
        .ud-info-box h4   {
          font-family: ${C.mono};
          font-size: 9px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: ${C.txtCode};
          margin-bottom: 10px;
        }

        /* track items */
        .ud-track-item {
          border-left: 3px solid;
          padding: 12px 16px;
          border-radius: 0 2px 2px 0;
          margin-bottom: 10px;
          background: ${C.bg};
        }
        .ud-track-item.white { border-color: ${C.borderHi}; }
        .ud-track-item.yellow { border-color: ${C.gold}; }
        .ud-track-item h4 {
          font-family: ${C.display};
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .ud-track-item p {
          font-size: 12px;
          color: ${C.txtSec};
          margin-bottom: 8px;
        }
        .ud-track-item.white h4 { color: ${C.txtSec}; }
        .ud-track-item.yellow h4 { color: ${C.gold}; }

        /* divider */
        .ud-divider {
          height: 1px;
          background: ${C.border};
          margin: 16px 0;
        }

        /* intro */
        .ud-intro {
          background: ${C.bg};
          border: 1px solid ${C.border};
          border-radius: 2px;
          padding: 14px 18px;
          font-size: 13px;
          line-height: 1.8;
          color: ${C.txtSec};
        }
        .ud-intro strong { color: ${C.gold}; }

        footer {
          border-top: 1px solid ${C.border};
          padding: 20px;
          text-align: center;
          font-family: ${C.mono};
          font-size: 9px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: ${C.txtCode};
        }
      `}</style>

      <div className="ud-root">

        {/* Topbar */}
        <div className="ud-topbar">
          <span style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: C.txtCode }}>
            AGZ 2026 · ULAŞIM & DESTEK
          </span>
          <Link href="/" className="ud-btn ud-btn-red" style={{ textDecoration: "none" }}>
            ← ANA SAYFA
          </Link>
        </div>

        {/* Hero */}
        <div className="ud-hero">
          <p className="ud-hero-eyebrow">AGZ 2026 · YOL HARİTASI</p>
          <h1 className="ud-hero-title">ULAŞIM REHBERİ</h1>
          <p className="ud-hero-sub">Aydın Otogar'dan ADÜ Kongre Merkezi'ne adım adım</p>
        </div>

        {/* Main content */}
        <main className="ud-main">

          {/* KONUM */}
          <div className="ud-card">
            <div className="ud-card-header">
              <span className="ud-card-label">01 //</span>
              <span className="ud-card-title">Etkinlik Konumları</span>
            </div>
            <div className="ud-card-body">
              <div className="ud-loc-grid">
                <div className="ud-loc-item">
                  <div className="ud-loc-item-label">Zirve Ana Alanı</div>
                  <div className="ud-loc-item-name">ADÜ Kongre Merkezi</div>
                  <div className="ud-loc-item-addr">Adnan Menderes Üniversitesi<br />Atatürk Kongre Merkezi, Aydın</div>
                  <a
                    className="ud-btn ud-btn-gold"
                    href="https://maps.google.com/?q=Aydın+Adnan+Menderes+Üniversitesi+Atatürk+Kongre+Merkezi"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ↗ Haritada Gör
                  </a>
                </div>
                <div className="ud-loc-item">
                  <div className="ud-loc-item-label">Varış Noktası</div>
                  <div className="ud-loc-item-name">Aydın Otogarı</div>
                  <div className="ud-loc-item-addr">Şehirlerarası Otobüs Terminali<br />Aydın Merkez</div>
                  <a
                    className="ud-btn ud-btn-gold"
                    href="https://maps.google.com/?q=Aydın+Şehirlerarası+Otobüs+Terminali"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ↗ Haritada Gör
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* ULAŞIM FLOW */}
          <div className="ud-card">
            <div className="ud-card-header">
              <span className="ud-card-label">02 //</span>
              <span className="ud-card-title">Güzergah — Otogar → ADÜ</span>
            </div>
            <div className="ud-card-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              <div className="ud-intro">
                Aydın Otogarı'na ulaştığınızda, şehirlerarası peronların bulunduğu taraftan{" "}
                (<strong>Opsmall AVM tarafı</strong>) şehiriçi otobüs kalkış noktasına geçin.
                Sabah <strong>06:45</strong> ilk seferle başlayan,{" "}
                ortalama <strong>8 dk</strong> aralıklı <strong>1 Numaralı Beyaz Otobüs</strong>&apos;e binin.{" "}
                <strong>NAKİT GEÇERLİDİR.</strong>
              </div>

              {/* Flow diagram */}
              <div className="ud-flow">
                <div className="ud-flow-node node-start">
                  <div className="ud-flow-node-title">AYDIN OTOGAR</div>
                  <div className="ud-flow-node-sub">Başlangıç noktası</div>
                </div>

                <div className="ud-flow-arrow">
                  <svg width="14" height="24" viewBox="0 0 14 24" fill="none">
                    <line x1="7" y1="0" x2="7" y2="17" stroke="currentColor" strokeWidth="1.5"/>
                    <polyline points="2,12 7,19 12,12" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
                  </svg>
                  <span className="ud-flow-arrow-label">binin</span>
                </div>

                <div className="ud-flow-node node-mid-route">
                  <div className="ud-flow-node-title">1 NUMARA — BEYAZ ŞEHİRİÇİ OTOBÜS</div>
                  <div className="ud-flow-node-sub">06:45 ilk sefer · ~8 dk aralık · Nakit ödeme</div>
                </div>

                <div className="ud-flow-arrow">
                  <svg width="14" height="24" viewBox="0 0 14 24" fill="none">
                    <line x1="7" y1="0" x2="7" y2="17" stroke="currentColor" strokeWidth="1.5"/>
                    <polyline points="2,12 7,19 12,12" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
                  </svg>
                  <span className="ud-flow-arrow-label">inin</span>
                </div>

                <div className="ud-flow-node node-mid">
                  <div className="ud-flow-node-title">KENT MEYDANI</div>
                  <div className="ud-flow-node-sub">Aktarma durağı</div>
                </div>

                <div className="ud-flow-arrow">
                  <svg width="14" height="24" viewBox="0 0 14 24" fill="none">
                    <line x1="7" y1="0" x2="7" y2="17" stroke="currentColor" strokeWidth="1.5"/>
                    <polyline points="2,12 7,19 12,12" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
                  </svg>
                  <span className="ud-flow-arrow-label">aktarma yapın</span>
                </div>

                <div className="ud-flow-node node-end">
                  <div className="ud-flow-node-title">ADÜ KONGRE MERKEZİ</div>
                  <div className="ud-flow-node-sub">Varış — Zirve Ana Alanı</div>
                </div>
              </div>

              <div className="ud-divider" />

              {/* Transfer options */}
              <div>
                <div style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: C.txtCode, marginBottom: 12 }}>
                  // KENT MEYDANI&apos;NDAN ADÜ&apos;YE AKTARMAlar
                </div>
                <div className="ud-transfer-grid">
                  <div className="ud-transfer-box">
                    <div className="ud-transfer-box-title" style={{ color: C.gold }}>Sarı Belediye Hatları</div>
                    <div className="ud-transfer-box-sub">Temassız kart geçerli</div>
                    <div className="ud-badge-row">
                      {YELLOW_BUSES.map(n => (
                        <span key={n} className="ud-badge ud-badge-gold">{n}</span>
                      ))}
                    </div>
                  </div>
                  <div className="ud-transfer-box">
                    <div className="ud-transfer-box-title" style={{ color: C.txtSec }}>Beyaz Şehiriçi Hatları</div>
                    <div className="ud-transfer-box-sub">Nakit ödeme</div>
                    <div className="ud-badge-row">
                      {WHITE_BUSES.map(n => (
                        <span key={n} className="ud-badge ud-badge-muted">{n}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* CANLI TAKİP */}
          <div className="ud-card">
            <div className="ud-card-header">
              <span className="ud-card-label">03 //</span>
              <span className="ud-card-title">Canlı Takip & Güzergah Kontrolü</span>
            </div>
            <div className="ud-card-body">
              <div className="ud-track-item white">
                <h4>Beyaz Şehiriçi Minibüsler</h4>
                <p>1, 10, 11, 16 numaralı hatlar — şehiriçi özel minibüsler</p>
              </div>
              <div className="ud-track-item yellow">
                <h4>Büyükşehir Belediyesi — Sarı Otobüsler</h4>
                <p>103, 106, 401–405, 501, 504 numaralı hatların saatleri</p>
              </div>
              <a
                className="ud-btn ud-btn-gold"
                href="https://aydin.bel.tr/mobil/detail/5257/otobus-guzergahlarimiz"
                target="_blank"
                rel="noopener noreferrer"
              >
                ↗ TÜM GÜZERGAHLARI İNCELE
              </a>
            </div>
          </div>

          {/* ÖDEME */}
          <div className="ud-card">
            <div className="ud-card-header">
              <span className="ud-card-label">04 //</span>
              <span className="ud-card-title">Ödeme Bilgileri</span>
            </div>
            <div className="ud-card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div className="ud-info-box red">
                <h4>// Beyaz Şehiriçi Minibüsler</h4>
                <p style={{ color: C.txtSec, fontSize: 13 }}>
                  Ödemeler yalnızca <strong style={{ color: C.redText }}>NAKİT</strong> para ile yapılmaktadır.
                  Kart kabul edilmez.
                </p>
              </div>
              <div className="ud-info-box gold">
                <h4>// Sarı Belediye Otobüsleri</h4>
                <p style={{ color: C.txtSec, fontSize: 13 }}>
                  Ödemeler <strong style={{ color: C.gold }}>temassız kredi / banka kartı</strong> ile yapılabilmektedir.
                  Nakit de geçerlidir.
                </p>
              </div>
            </div>
          </div>

        </main>

        <footer>
          Aydın Adnan Menderes Üniversitesi &mdash; Aydın Gençlik Zirvesi 2026
        </footer>

      </div>
    </>
  );
}
