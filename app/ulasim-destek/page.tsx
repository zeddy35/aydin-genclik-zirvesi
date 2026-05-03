"use client";

import Link from "next/link";
import { useEffect } from "react";

/* ── Design tokens — mirrors SummitInfo ─────────────────────── */
const T = {
  bg:          "#f0edf8",
  surf:        "#faf9fd",
  surfHigh:    "#e8e4f4",
  border:      "#ddd8ef",
  borderHigh:  "#c4bce0",
  text:        "#16142a",
  muted:       "#5c5778",
  faint:       "#c0b9d8",
  sky:         "#5BC8F5",
  skyDim:      "#dff3fc",
  violet:      "#9240CC",
  violetDim:   "#6B2B98",
  violetLight: "#ede0f8",
  green:       "#1a7a4a",
  greenLight:  "#e0f5eb",
  mono:        "var(--font-share-tech-mono), monospace",
  display:     "var(--font-lexend), sans-serif",
} as const;

const YELLOW_BUSES = ["103","106","401","402","403","404","405","501","504"];
const WHITE_BUSES  = ["10","11","16"];

export default function UlasimDestekPage() {
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ud-root {
          min-height: 100dvh;
          background: ${T.bg};
          font-family: ${T.display};
          color: ${T.text};
        }

        /* ── Topbar ─────────────────────────────────────────── */
        .ud-topbar {
          position: sticky;
          top: 0;
          z-index: 50;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px;
          background: ${T.surf};
          border-bottom: 1px solid ${T.border};
        }
        .ud-topbar-brand {
          font-family: ${T.mono};
          font-size: 9px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: ${T.faint};
        }
        .ud-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 16px;
          border-radius: 999px;
          border: 1.5px solid ${T.violet}55;
          background: ${T.violetLight};
          color: ${T.violet};
          font-family: ${T.mono};
          font-size: 9px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          text-decoration: none;
          transition: background 0.2s, border-color 0.2s;
        }
        .ud-back-btn:hover {
          background: ${T.violet}18;
          border-color: ${T.violet}99;
        }

        /* ── Hero ───────────────────────────────────────────── */
        .ud-hero {
          background: ${T.surf};
          border-bottom: 1px solid ${T.border};
          padding: clamp(48px, 8vw, 88px) 24px clamp(32px, 5vw, 52px);
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .ud-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 70% 80% at 50% -10%, ${T.violet}18 0%, transparent 65%);
          pointer-events: none;
        }
        .ud-hero-eyebrow {
          font-family: ${T.mono};
          font-size: 9px;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: ${T.violet};
          margin-bottom: 14px;
        }
        .ud-hero-title {
          font-family: ${T.display};
          font-size: clamp(32px, 7vw, 72px);
          font-weight: 800;
          color: ${T.text};
          line-height: 1.05;
          margin-bottom: 12px;
          letter-spacing: -0.01em;
        }
        .ud-hero-title span {
          background: linear-gradient(135deg, ${T.violet} 0%, ${T.sky} 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .ud-hero-sub {
          font-size: clamp(14px, 1.4vw, 16px);
          color: ${T.muted};
          max-width: 480px;
          margin: 0 auto;
          line-height: 1.6;
        }

        /* ── Main layout ────────────────────────────────────── */
        .ud-main {
          max-width: 860px;
          margin: 0 auto;
          padding: clamp(28px, 5vw, 56px) 20px clamp(56px, 8vw, 96px);
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        /* ── Section header (mirrors SummitInfo) ────────────── */
        .ud-sec-hdr { margin-bottom: 20px; }
        .ud-sec-lbl {
          font-family: ${T.mono};
          font-size: 9px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: ${T.faint};
          margin-bottom: 6px;
        }
        .ud-sec-title {
          font-family: ${T.display};
          font-size: clamp(20px, 2.5vw, 26px);
          font-weight: 700;
          color: ${T.text};
          letter-spacing: -0.01em;
        }

        /* ── Card ───────────────────────────────────────────── */
        .ud-card {
          background: ${T.surf};
          border: 1px solid ${T.border};
          border-radius: 16px;
          overflow: hidden;
        }
        .ud-card-top {
          height: 3px;
          background: linear-gradient(90deg, ${T.violet}, ${T.sky});
        }
        .ud-card-top.sky {
          background: linear-gradient(90deg, ${T.sky}, ${T.violet}88);
        }
        .ud-card-top.green {
          background: linear-gradient(90deg, #2d9c6a, #5BC8F5);
        }
        .ud-card-top.amber {
          background: linear-gradient(90deg, #e69d17, ${T.violet}88);
        }
        .ud-card-body { padding: 24px; }

        /* ── Location grid ──────────────────────────────────── */
        .ud-loc-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        @media (max-width: 540px) { .ud-loc-grid { grid-template-columns: 1fr; } }

        .ud-loc-item {
          background: ${T.bg};
          border: 1px solid ${T.border};
          border-radius: 12px;
          padding: 18px;
        }
        .ud-loc-tag {
          font-family: ${T.mono};
          font-size: 8px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: ${T.faint};
          margin-bottom: 6px;
        }
        .ud-loc-name {
          font-weight: 700;
          font-size: 15px;
          color: ${T.text};
          margin-bottom: 4px;
        }
        .ud-loc-addr {
          font-size: 13px;
          color: ${T.muted};
          line-height: 1.5;
          margin-bottom: 16px;
        }

        /* ── Buttons ────────────────────────────────────────── */
        .ud-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 9px 18px;
          border-radius: 999px;
          font-family: ${T.mono};
          font-size: 9px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          text-decoration: none;
          border: 1.5px solid;
          transition: background 0.2s, border-color 0.2s, box-shadow 0.2s;
          cursor: pointer;
          font-weight: 700;
        }
        .ud-btn-violet {
          color: ${T.violet};
          border-color: ${T.violet}55;
          background: ${T.violetLight};
        }
        .ud-btn-violet:hover {
          background: ${T.violet}18;
          border-color: ${T.violet}99;
          box-shadow: 0 0 12px ${T.violet}22;
        }
        .ud-btn-sky {
          color: #1490c0;
          border-color: ${T.sky}66;
          background: ${T.skyDim};
        }
        .ud-btn-sky:hover {
          background: ${T.sky}22;
          border-color: ${T.sky};
        }

        /* ── Flow diagram ───────────────────────────────────── */
        .ud-flow {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
        }
        .ud-flow-node {
          width: 100%;
          max-width: 520px;
          padding: 16px 24px;
          border-radius: 12px;
          border: 1.5px solid;
          text-align: center;
        }
        .ud-flow-node-title {
          font-family: ${T.display};
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .ud-flow-node-sub {
          font-size: 12px;
          margin-top: 4px;
          line-height: 1.5;
        }
        .node-start {
          background: ${T.violetLight};
          border-color: ${T.violet}55;
        }
        .node-start .ud-flow-node-title { color: ${T.violet}; }
        .node-start .ud-flow-node-sub   { color: ${T.violetDim}; }

        .node-route {
          background: ${T.skyDim};
          border-color: ${T.sky}66;
          border-style: dashed;
        }
        .node-route .ud-flow-node-title { color: #1490c0; }
        .node-route .ud-flow-node-sub   { color: ${T.muted}; }

        .node-transfer {
          background: ${T.surfHigh};
          border-color: ${T.borderHigh};
        }
        .node-transfer .ud-flow-node-title { color: ${T.muted}; }
        .node-transfer .ud-flow-node-sub   { color: ${T.faint}; }

        .node-end {
          background: ${T.greenLight};
          border-color: #2d9c6a55;
        }
        .node-end .ud-flow-node-title { color: ${T.green}; }
        .node-end .ud-flow-node-sub   { color: #2d9c6a99; }

        .ud-flow-arrow {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 6px 0;
          gap: 2px;
          color: ${T.faint};
        }
        .ud-flow-arrow-label {
          font-family: ${T.mono};
          font-size: 8px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: ${T.faint};
        }

        /* ── Intro box ──────────────────────────────────────── */
        .ud-intro {
          background: ${T.violetLight};
          border: 1px solid ${T.violet}33;
          border-radius: 12px;
          padding: 16px 20px;
          font-size: 14px;
          line-height: 1.75;
          color: ${T.muted};
        }
        .ud-intro strong { color: ${T.violet}; font-weight: 700; }

        /* ── Divider ────────────────────────────────────────── */
        .ud-divider { height: 1px; background: ${T.border}; margin: 20px 0; }

        /* ── Transfer grid ──────────────────────────────────── */
        .ud-transfer-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        @media (max-width: 500px) { .ud-transfer-grid { grid-template-columns: 1fr; } }

        .ud-transfer-box {
          background: ${T.bg};
          border: 1px solid ${T.border};
          border-radius: 12px;
          padding: 18px;
        }
        .ud-transfer-box-title {
          font-family: ${T.display};
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 4px;
        }
        .ud-transfer-box-sub {
          font-size: 12px;
          color: ${T.muted};
          margin-bottom: 14px;
          font-family: ${T.mono};
          letter-spacing: 0.1em;
        }
        .ud-badge-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .ud-badge {
          display: inline-block;
          padding: 5px 12px;
          border-radius: 999px;
          font-family: ${T.mono};
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          min-width: 40px;
          text-align: center;
          border: 1.5px solid;
        }
        .ud-badge-sky {
          background: ${T.skyDim};
          color: #0d6e94;
          border-color: ${T.sky}55;
        }
        .ud-badge-muted {
          background: ${T.surfHigh};
          color: ${T.text};
          border-color: ${T.borderHigh};
        }

        /* ── Track items ────────────────────────────────────── */
        .ud-track-item {
          border-left: 3px solid;
          padding: 14px 18px;
          border-radius: 0 10px 10px 0;
          margin-bottom: 12px;
          background: ${T.bg};
        }
        .ud-track-item.white  { border-color: ${T.borderHigh}; }
        .ud-track-item.yellow { border-color: ${T.sky}; }
        .ud-track-item h4 {
          font-family: ${T.display};
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .ud-track-item.white h4  { color: ${T.text}; }
        .ud-track-item.yellow h4 { color: #0d6e94; }
        .ud-track-item p {
          font-size: 13px;
          color: ${T.muted};
          margin-bottom: 10px;
        }

        /* ── Info boxes ─────────────────────────────────────── */
        .ud-info-box {
          border-radius: 12px;
          padding: 16px 20px;
          border: 1px solid;
          margin-bottom: 10px;
        }
        .ud-info-box.violet {
          background: ${T.violetLight};
          border-color: ${T.violet}33;
        }
        .ud-info-box.sky {
          background: ${T.skyDim};
          border-color: ${T.sky}55;
        }
        .ud-info-box h4 {
          font-family: ${T.mono};
          font-size: 8px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: ${T.faint};
          margin-bottom: 10px;
        }
        .ud-info-box p {
          font-size: 14px;
          color: ${T.muted};
          line-height: 1.65;
        }
        .ud-info-box p strong.violet { color: ${T.violet}; }
        .ud-info-box p strong.sky    { color: #1490c0; }

        /* ── Footer ─────────────────────────────────────────── */
        footer {
          border-top: 1px solid ${T.border};
          padding: 24px;
          text-align: center;
          font-family: ${T.mono};
          font-size: 9px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: ${T.faint};
          background: ${T.surf};
        }

        /* ── Scroll reveal ──────────────────────────────────── */
        .ud-reveal {
          opacity: 0;
          transform: translateY(14px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .ud-reveal.in {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      {/* Scroll reveal script */}
      <RevealScript />

      <div className="ud-root">

        {/* Topbar */}
        <div className="ud-topbar">
          <span className="ud-topbar-brand">◈ AGZ 2026 · Ulaşım &amp; Destek</span>
          <Link href="/" className="ud-back-btn">← Ana Sayfa</Link>
        </div>

        {/* Hero */}
        <div className="ud-hero">
          <p className="ud-hero-eyebrow">◈ Yol Haritası &amp; Rehber</p>
          <h1 className="ud-hero-title">
            <span>Ulaşım</span><br />Rehberi
          </h1>
          <p className="ud-hero-sub">
            Aydın Otogar&apos;dan ADÜ Atatürk Kongre Merkezi&apos;ne<br />
            adım adım nasıl ulaşırsın?
          </p>
        </div>

        {/* Main */}
        <main className="ud-main">

          {/* 01 — Konum */}
          <div className="ud-card ud-reveal">
            <div className="ud-card-top" />
            <div className="ud-card-body">
              <div className="ud-sec-hdr">
                <div className="ud-sec-lbl">◈ 01 // Konum</div>
                <h2 className="ud-sec-title">Etkinlik Konumları</h2>
              </div>
              <div className="ud-loc-grid">
                <div className="ud-loc-item">
                  <div className="ud-loc-tag">Zirve Ana Alanı</div>
                  <div className="ud-loc-name">ADÜ Kongre Merkezi</div>
                  <div className="ud-loc-addr">Adnan Menderes Üniversitesi<br />Atatürk Kongre Merkezi, Aydın</div>
                  <a
                    className="ud-btn ud-btn-violet"
                    href="https://maps.google.com/?q=Aydın+Adnan+Menderes+Üniversitesi+Atatürk+Kongre+Merkezi"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ↗ Haritada Gör
                  </a>
                </div>
                <div className="ud-loc-item">
                  <div className="ud-loc-tag">Başlangıç Noktası</div>
                  <div className="ud-loc-name">Aydın Otogarı</div>
                  <div className="ud-loc-addr">Şehirlerarası Otobüs Terminali<br />Aydın Merkez</div>
                  <a
                    className="ud-btn ud-btn-violet"
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

          {/* 02 — Güzergah */}
          <div className="ud-card ud-reveal">
            <div className="ud-card-top sky" />
            <div className="ud-card-body">
              <div className="ud-sec-hdr">
                <div className="ud-sec-lbl">◈ 02 // Güzergah</div>
                <h2 className="ud-sec-title">Otogar → ADÜ Adım Adım</h2>
              </div>

              <div className="ud-intro">
                Aydın Otogarı&apos;na ulaştığında, şehirlerarası peronların bulunduğu taraftan{" "}
                (<strong>Opsmall AVM tarafı</strong>) şehiriçi otobüs kalkış noktasına geç.
                Sabah <strong>06:45</strong> ilk seferle başlayan, ortalama{" "}
                <strong>8 dk</strong> aralıklı <strong>1 Numaralı Beyaz Otobüs</strong>&apos;e bin.{" "}
                <strong>NAKİT GEÇERLİDİR.</strong>
              </div>

              <div className="ud-divider" />

              {/* Flow */}
              <div className="ud-flow">
                <div className="ud-flow-node node-start">
                  <div className="ud-flow-node-title">Aydın Otogar</div>
                  <div className="ud-flow-node-sub">Başlangıç noktası</div>
                </div>

                <div className="ud-flow-arrow">
                  <svg width="14" height="26" viewBox="0 0 14 26" fill="none">
                    <line x1="7" y1="0" x2="7" y2="19" stroke="currentColor" strokeWidth="1.5"/>
                    <polyline points="2,14 7,21 12,14" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
                  </svg>
                  <span className="ud-flow-arrow-label">bin</span>
                </div>

                <div className="ud-flow-node node-route">
                  <div className="ud-flow-node-title">1 Numara — Beyaz Şehiriçi Otobüs</div>
                  <div className="ud-flow-node-sub">06:45 ilk sefer · ~8 dk aralık · Nakit ödeme</div>
                </div>

                <div className="ud-flow-arrow">
                  <svg width="14" height="26" viewBox="0 0 14 26" fill="none">
                    <line x1="7" y1="0" x2="7" y2="19" stroke="currentColor" strokeWidth="1.5"/>
                    <polyline points="2,14 7,21 12,14" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
                  </svg>
                  <span className="ud-flow-arrow-label">in</span>
                </div>

                <div className="ud-flow-node node-transfer">
                  <div className="ud-flow-node-title">Kent Meydanı</div>
                  <div className="ud-flow-node-sub">Aktarma durağı</div>
                </div>

                <div className="ud-flow-arrow">
                  <svg width="14" height="26" viewBox="0 0 14 26" fill="none">
                    <line x1="7" y1="0" x2="7" y2="19" stroke="currentColor" strokeWidth="1.5"/>
                    <polyline points="2,14 7,21 12,14" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
                  </svg>
                  <span className="ud-flow-arrow-label">aktarma yap</span>
                </div>

                <div className="ud-flow-node node-end">
                  <div className="ud-flow-node-title">ADÜ Kongre Merkezi</div>
                  <div className="ud-flow-node-sub">Varış — Zirve Ana Alanı</div>
                </div>
              </div>

              <div className="ud-divider" />

              {/* Transfer seçenekleri */}
              <div>
                <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: T.faint, marginBottom: 12 }}>
                  // Kent Meydanı&apos;ndan ADÜ&apos;ye aktarma seçenekleri
                </div>
                <div className="ud-transfer-grid">
                  <div className="ud-transfer-box">
                    <div className="ud-transfer-box-title" style={{ color: "#0d6e94" }}>Sarı Belediye Hatları</div>
                    <div className="ud-transfer-box-sub">Temassız kart geçerli</div>
                    <div className="ud-badge-row">
                      {YELLOW_BUSES.map(n => (
                        <span key={n} className="ud-badge ud-badge-sky">{n}</span>
                      ))}
                    </div>
                  </div>
                  <div className="ud-transfer-box">
                    <div className="ud-transfer-box-title" style={{ color: T.text }}>Beyaz Şehiriçi Hatları</div>
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

          {/* 03 — Canlı Takip */}
          <div className="ud-card ud-reveal">
            <div className="ud-card-top green" />
            <div className="ud-card-body">
              <div className="ud-sec-hdr">
                <div className="ud-sec-lbl">◈ 03 // Canlı Takip</div>
                <h2 className="ud-sec-title">Güzergah &amp; Saat Bilgisi</h2>
              </div>
              <div className="ud-track-item white">
                <h4>Beyaz Şehiriçi Minibüsler</h4>
                <p>1, 10, 11, 16 numaralı hatlar — şehiriçi özel minibüsler</p>
              </div>
              <div className="ud-track-item yellow">
                <h4>Büyükşehir Belediyesi — Sarı Otobüsler</h4>
                <p>103, 106, 401–405, 501, 504 numaralı hatların saat bilgileri</p>
              </div>
              <a
                className="ud-btn ud-btn-sky"
                href="https://aydin.bel.tr/mobil/detail/5257/otobus-guzergahlarimiz"
                target="_blank"
                rel="noopener noreferrer"
              >
                ↗ Tüm Güzergahları İncele
              </a>
            </div>
          </div>

          {/* 04 — Ödeme */}
          <div className="ud-card ud-reveal">
            <div className="ud-card-top amber" />
            <div className="ud-card-body">
              <div className="ud-sec-hdr">
                <div className="ud-sec-lbl">◈ 04 // Ödeme</div>
                <h2 className="ud-sec-title">Ödeme Bilgileri</h2>
              </div>
              <div className="ud-info-box violet">
                <h4>// Beyaz Şehiriçi Minibüsler</h4>
                <p>Ödemeler yalnızca <strong className="violet">NAKİT</strong> para ile yapılmaktadır. Kart kabul edilmez.</p>
              </div>
              <div className="ud-info-box sky">
                <h4>// Sarı Belediye Otobüsleri</h4>
                <p>Ödemeler <strong className="sky">temassız kredi / banka kartı</strong> ile yapılabilmektedir. Nakit de geçerlidir.</p>
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

function RevealScript() {
  useEffect(() => {
    const els = document.querySelectorAll(".ud-reveal");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); obs.unobserve(e.target); } }),
      { threshold: 0.05 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
  return null;
}
