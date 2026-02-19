"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface HackFullViewProps {
  onBack: () => void;
}

function nowT() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

const KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];

type Spk = "beta" | "dino" | "ee";
const LINES: Record<Spk, { t: string; m: string }[]> = {
  beta: [
    { t: "Beta Notu", m: "En iyi proje değil, en net dosya kazanır. Problem → çözüm → kanıt. ○ ×" },
    { t: "Taktik", m: "Ekran akışını tek sayfada çiz. Sonra MVP'yi sadece o akışa göre kur." },
    { t: "Uyarı", m: "○ × — gözlerim her detayı görür. Net kapsam = net zafer." },
  ],
  dino: [
    { t: "Saha Raporu", m: "Mentor checkpoint'lerinde net konuş: 1) Problem 2) MVP 3) Demo. 90 sn'de anlat. RAWR!" },
    { t: "İz Sürme", m: "Kapsamı küçült. 1 güçlü özellik + 1 sağlam demo. Jüri ikna olur." },
    { t: "Keşif", m: "Aydın'da 48 saat. Silah: kod. Ekip: sen + biz. RAWR!" },
  ],
  ee: [
    { t: "??? Gölge Fısıltı", m: "*bıyığını büker* Kanıt nerede evladım? He he he. Sahneye sür, sonra bakarsın…" },
    { t: "Tuzak", m: "10 yarım özellik, 0 sağlam demo. Jüri bayılır... *kötü güler* HE HE HE." },
    { t: "v0.0.1", m: '"Yayınla geç, sonra düzelt" benim formülüm. İşte sonucu: hiç bitmedi. *şüpheli sessizlik*' },
  ],
};

// ── SVG AVATARS ──
function DinoSVG({ size = 52 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect x="22" y="28" width="22" height="20" rx="5" fill="#6b7280" />
      <path d="M22 42 Q10 50 8 57" stroke="#6b7280" strokeWidth="5" strokeLinecap="round" />
      <rect x="30" y="11" width="18" height="15" rx="4" fill="#6b7280" />
      <text x="32" y="22" fontSize="8" fill="#f2e8d5" fontWeight="bold" fontFamily="monospace">×</text>
      <circle cx="44" cy="18" r="3" fill="#f2e8d5" /><circle cx="44" cy="18" r="1.2" fill="#111" />
      <rect x="28" y="5" width="22" height="7" rx="2" fill="#1a1209" />
      <rect x="24" y="10" width="30" height="3" rx="1.5" fill="#1a1209" />
      <rect x="28" y="7" width="22" height="2" rx="1" fill="#374151" />
      <circle cx="16" cy="42" r="5" stroke="#9ca3af" strokeWidth="2" fill="none" />
      <line x1="20" y1="46" x2="23" y2="49" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" />
      <rect x="26" y="47" width="5" height="9" rx="2.5" fill="#9ca3af" />
      <rect x="34" y="47" width="5" height="9" rx="2.5" fill="#9ca3af" />
    </svg>
  );
}

function BetaSVG({ size = 52 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path d="M14 30 Q12 50 14 60 L50 60 Q52 50 50 30 Z" fill="#374151" />
      <path d="M26 30 L32 42 L38 30" fill="#4b5563" />
      <rect x="18" y="8" width="28" height="22" rx="8" fill="#9ca3af" />
      <circle cx="25" cy="18" r="5" stroke="#1a1209" strokeWidth="2" fill="none" />
      <line x1="35" y1="14" x2="41" y2="20" stroke="#1a1209" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="41" y1="14" x2="35" y2="20" stroke="#1a1209" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M26 24 Q32 28 38 24" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <rect x="16" y="3" width="32" height="8" rx="3" fill="#0f172a" />
      <rect x="12" y="9" width="40" height="3" rx="1.5" fill="#0f172a" />
      <rect x="16" y="5.5" width="32" height="2.5" rx="1" fill="#1e293b" />
      <line x1="14" y1="36" x2="8" y2="44" stroke="#4b5563" strokeWidth="3" strokeLinecap="round" />
      <circle cx="6" cy="47" r="4" stroke="#6b7280" strokeWidth="2" fill="none" />
    </svg>
  );
}

function EESVGSmall({ size = 52 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path d="M10 32 Q8 54 12 62 L52 62 Q56 54 54 32 Z" fill="#292524" />
      <path d="M24 32 L32 44 L40 32" fill="#1c1917" />
      <ellipse cx="32" cy="18" rx="15" ry="14" fill="#d4a870" />
      <path d="M20 11 Q24 9 28 11" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
      <path d="M36 11 Q40 9 44 11" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="24" cy="17" rx="3" ry="2.2" fill="#fff" /><ellipse cx="40" cy="17" rx="3" ry="2.2" fill="#fff" />
      <circle cx="24.8" cy="17.2" r="1.4" fill="#292524" /><circle cx="40.8" cy="17.2" r="1.4" fill="#292524" />
      <path d="M18 25 Q24 21 32 23 Q40 21 46 25" stroke="#78350f" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M20 26 Q26 22 32 23 Q38 22 44 26 Q38 28 32 27 Q26 28 20 26Z" fill="#92400e" />
      <rect x="14" y="2" width="36" height="9" rx="3" fill="#1c1917" />
      <rect x="10" y="9" width="44" height="4" rx="2" fill="#1c1917" />
      <rect x="14" y="4" width="36" height="3" rx="1" fill="#7f1d1d" />
      <rect x="36" y="44" width="18" height="9" rx="2" fill="#fef3c7" opacity="0.9" />
      <text x="37" y="50" fontSize="4" fill="#92400e" fontWeight="bold" fontFamily="monospace">BETA v0.0.1</text>
    </svg>
  );
}

function EESVGPortrait() {
  return (
    <svg width="90" height="100" viewBox="0 0 64 72" fill="none">
      <path d="M10 36 Q8 60 12 70 L52 70 Q56 60 54 36 Z" fill="#292524" />
      <path d="M24 36 L32 50 L40 36" fill="#1c1917" />
      <ellipse cx="32" cy="22" rx="17" ry="16" fill="#d4a870" />
      <path d="M19 13 Q24 10 29 13" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M35 13 Q40 10 45 13" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="24" cy="20" rx="3.5" ry="2.5" fill="#fff" /><ellipse cx="40" cy="20" rx="3.5" ry="2.5" fill="#fff" />
      <circle cx="25" cy="20.5" r="1.5" fill="#292524" /><circle cx="41" cy="20.5" r="1.5" fill="#292524" />
      <path d="M17 30 Q24 25 32 27 Q40 25 47 30" stroke="#78350f" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M19 31 Q26 26 32 27 Q38 26 45 31 Q38 34 32 33 Q26 34 19 31Z" fill="#92400e" />
      <path d="M26 36 Q32 40 38 36" stroke="#9a3412" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <rect x="12" y="2" width="40" height="11" rx="3.5" fill="#1c1917" />
      <rect x="8" y="11" width="48" height="5" rx="2.5" fill="#1c1917" />
      <rect x="12" y="5" width="40" height="4" rx="1.5" fill="#7f1d1d" />
    </svg>
  );
}

// ── SUB COMPONENTS ──
function SecHeader({ title, tag }: { title: string; tag: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 8 }}>
      <h2 style={{ fontFamily: "'Oswald',sans-serif", fontSize: 21, letterSpacing: "0.06em", textTransform: "uppercase", color: "#1a1209", borderBottom: "2px solid #1a1209", paddingBottom: 2 }}>{title}</h2>
      <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 11, letterSpacing: "0.28em", textTransform: "uppercase", color: "#aaa" }}>{tag}</span>
    </div>
  );
}

function ScrollReveal() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .hck-reveal { opacity:0; transform:translateY(14px); transition: opacity .5s ease, transform .5s ease; }
      .hck-reveal.in { opacity:1; transform:translateY(0); }
      .hck-faq-body { max-height:0; overflow:hidden; transition: max-height .3s ease; padding:0 16px; }
      .hck-faq-body.open { max-height:240px; padding:0 16px 14px; }
      @keyframes hck-blink { 0%,100%{opacity:1} 50%{opacity:.2} }
      .hck-blink { animation: hck-blink 1.4s ease-in-out infinite; }
      @keyframes hck-stamp { 0%{opacity:0;transform:rotate(-12deg) scale(2)} 15%{opacity:.9;transform:rotate(-12deg) scale(1)} 80%{opacity:.9;transform:rotate(-12deg) scale(1)} 100%{opacity:0;transform:rotate(-12deg) scale(1)} }
      .hck-stamp-anim { animation: hck-stamp 2.5s forwards; }
      .hck-rlog::-webkit-scrollbar{width:3px} .hck-rlog::-webkit-scrollbar-thumb{background:#2a1f0a}
    `;
    document.head.appendChild(style);

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Special+Elite&family=Share+Tech+Mono&family=Oswald:wght@700&display=swap";
    document.head.appendChild(link);

    const els = document.querySelectorAll(".hck-reveal");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); obs.unobserve(e.target); } }),
      { threshold: 0.08 }
    );
    els.forEach((el) => obs.observe(el));
    return () => { obs.disconnect(); document.head.removeChild(style); };
  }, []);
  return null;
}

// ── MAIN ──
export function HackFullView({ onBack }: HackFullViewProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [curSpk, setCurSpk] = useState<Spk>("beta");
  const [radioOpen, setRadioOpen] = useState(true);
  const [logs, setLogs] = useState(() =>
    [
      { spk: "dino" as Spk, t: "Sinyal Alındı", m: "Ajan… dosya seni çağırıyor. Aşağı kaydır. RAWR! 🦕" },
      { spk: "beta" as Spk, t: "Dosya Açıldı", m: "Aydın'da bir iz var. Erken Erişim gölgede. Bu sefer kanıt lazım." },
      { spk: "ee" as Spk, t: "Gölge Mesaj", m: "*bıyık hışırtısı* Daha bitmeden sahneye çık… He he. 👴" },
    ].map((l) => ({ ...l, time: nowT() }))
  );
  const [konamiIdx, setKonamiIdx] = useState(0);
  const [showKonami, setShowKonami] = useState(false);
  const [showStamp, setShowStamp] = useState(false);
  const [stampClicks, setStampClicks] = useState(0);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      setKonamiIdx((idx) => {
        if (e.key === KONAMI[idx]) {
          const next = idx + 1;
          if (next === KONAMI.length) { setShowKonami(true); return 0; }
          return next;
        }
        return e.key === KONAMI[0] ? 1 : 0;
      });
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleStampClick = () => {
    const next = stampClicks + 1;
    setStampClicks(next);
    if (next >= 5) {
      setStampClicks(0);
      setShowStamp(true);
      setTimeout(() => setShowStamp(false), 2600);
      addLog();
    }
  };

  const addLog = () => {
    const pool = LINES[curSpk];
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setLogs((prev) => [{ spk: curSpk, t: pick.t, m: pick.m, time: nowT() }, ...prev]);
  };

  const spkLabel = (s: Spk) => s === "beta" ? "Beta" : s === "dino" ? "Dino" : "⚠ Erken Erişim";

  // shared style objects
  const S = {
    paper: { fontFamily: "'Special Elite',cursive", background: "#f2e8d5", borderRadius: 3, boxShadow: "0 0 0 1px #c4ab88, 0 2px 4px rgba(0,0,0,.4), 0 20px 60px rgba(0,0,0,.7)", overflow: "hidden" as const, position: "relative" as const },
    mono: { fontFamily: "'Share Tech Mono',monospace" },
    display: { fontFamily: "'Oswald',sans-serif" },
    ink: "#1a1209",
    paper2: "#e8dcc4",
    aged: "#c9b99a",
    red: "#9b1c1c",
  };

  const FAQ_ITEMS = [
    { who: "Soru #01 · Dino", q: "Takımım yok, ne yapacağım?", a: "Sorun değil. Eşleşme akışı var — rolüne göre ekip bulmana yardım ediyoruz. Tek başına gelen çok kişi oluyor. RAWR!", hint: '// Dino: "İz tek başına da sürülür."' },
    { who: "Soru #02 · Beta", q: "Proje fikrim yok. Yine de gelebilir miyim?", a: "Evet. Problem alanları ve ipucu havuzu paylaşılacak. Mentorlar fikirleri netleştirmen için yanında.", hint: "// Beta: ○ × — bazen cevap soruda saklıdır." },
    { who: "Soru #03 · Beta", q: "Erken Erişim kim? Neden düşman?", a: 'Bıyıklı amca. "Yarım işi hızlıca sahneye sür" diye fısıldar. Gerçek zafer: net kapsam + sağlam kanıt + tutarlı demo.', hint: "// Onun bıyığı kadar büyük bir tuzak." },
    { who: "Soru #04 · Dino", q: "Ne teslim etmem gerekiyor?", a: "Çalışan demo (MVP), kısa sunum, kanıt niteliğinde akış/ekranlar. Jüri tutarlılık, etki ve uygulanabilirliğe bakar.", hint: '// "Kanıt yoksa iddia yok." — Dino' },
    { who: "Soru #05 · Dino", q: "Hackathon ücretsiz mi?", a: "Evet, tamamen ücretsiz. GDG ve Oyun & Tasarım Kulübü iş birliğiyle düzenleniyor. Sadece isteğin ve fikrin yeter.", hint: "// Erişim seviyesi: Ücretsiz." },
  ];

  return (
    <>
      <ScrollReveal />

      {/* KONAMI MODAL */}
      {showKonami && (
        <div onClick={() => setShowKonami(false)} style={{ position: "fixed", inset: 0, zIndex: 9998, background: "rgba(0,0,0,.93)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: 24, cursor: "pointer" }}>
          <p style={{ ...S.mono, fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: "#664" }}>↑↑↓↓←→←→BA</p>
          <p style={{ ...S.display, fontSize: "clamp(32px,8vw,64px)", letterSpacing: "0.1em", textTransform: "uppercase", color: "#f2e8d5" }}>Konami Kodu!</p>
          <div style={{ display: "flex", gap: 32 }}><DinoSVG size={72} /><BetaSVG size={72} /></div>
          <p style={{ fontFamily: "'Special Elite',cursive", color: "#a09070", fontSize: 15 }}>Gerçek bir dedektifsin, ajan.</p>
          <p style={{ ...S.mono, fontSize: 11, color: "#443", letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 8 }}>[ tıkla / kapat ]</p>
        </div>
      )}

      {/* STAMP OVERLAY */}
      {showStamp && (
        <div style={{ position: "fixed", inset: 0, zIndex: 8000, pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="hck-stamp-anim" style={{ ...S.display, fontSize: "clamp(36px,10vw,72px)", color: S.red, border: `5px solid ${S.red}`, padding: "10px 24px", borderRadius: 4, letterSpacing: "0.12em", lineHeight: 1 }}>
            GİZLİ DOSYA
          </div>
        </div>
      )}

      {/* PAGE */}
      <div style={{ fontFamily: "'Special Elite',cursive", minHeight: "100vh", width: "100%", background: "#111009", overflowX: "hidden" }}>
        <div style={{ maxWidth: "1120px", margin: "0 auto", padding: "clamp(24px, 4vw, 48px) clamp(16px, 3vw, 40px) 96px" }}>

          {/* TOP BAR */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: "clamp(24px, 4vw, 40px)" }}>
            <button onClick={onBack} style={{ ...S.mono, fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "#c9b99a", background: "none", border: "1px solid #333", padding: "6px 12px", borderRadius: 4, cursor: "pointer" }}>
              ← Ana Ekran
            </button>
            <span style={{ ...S.mono, fontSize: 10, letterSpacing: "0.2em", color: "#555" }}>HCK-AYD-48 // GİZLİ</span>
          </div>

          {/* PAPER */}
          <div style={S.paper}>

            {/* HEADER BAND */}
            <div style={{ background: S.ink, padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ ...S.mono, fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: "#555", marginBottom: 3 }}>Dosya No</div>
                <div style={{ ...S.mono, fontSize: 18, letterSpacing: "0.1em", color: "#f2e8d5" }}>HCK-AYD-48</div>
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(155,28,28,.18)", border: `1px solid ${S.red}`, padding: "5px 12px", borderRadius: 2 }}>
                <span className="hck-blink" style={{ width: 5, height: 5, borderRadius: "50%", background: "#f87171", display: "inline-block" }} />
                <span style={{ ...S.mono, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#f87171" }}>Aktif Soruşturma</span>
              </div>
            </div>

            {/* STAMP AREA */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "24px 32px", borderBottom: `1px dashed ${S.aged}`, flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <button onClick={handleStampClick} title="Beni 5 kez tıkla 🔍" style={{ ...S.display, fontSize: 23, letterSpacing: "0.12em", border: `3px solid #7c2d12`, color: "#7c2d12", padding: "5px 14px", transform: "rotate(-5deg)", opacity: 0.75, lineHeight: 1, borderRadius: 2, background: "none", cursor: "pointer", display: "inline-block" }}>
                  GİZLİ DOSYA
                </button>
                <span style={{ ...S.display, fontSize: 15, letterSpacing: "0.1em", border: "2px solid #4a7c59", color: "#4a7c59", padding: "3px 10px", transform: "rotate(3deg)", opacity: 0.4, display: "inline-block" }}>AKTİF</span>
              </div>
              <div style={{ ...S.mono, fontSize: 10, letterSpacing: "0.15em", lineHeight: 1.9, color: "#888", textAlign: "right" }}>
                <div>Son Başvuru</div>
                <div style={{ fontSize: 15, color: S.ink }}>YAKINDA</div>
                <div style={{ marginTop: 4 }}>Operasyon Süresi</div>
                <div style={{ fontSize: 15, color: S.ink }}>48 SAAT</div>
              </div>
            </div>

            {/* HERO */}
            <div className="hck-reveal" style={{ padding: "32px 32px", borderBottom: `1px dashed ${S.aged}` }}>
              <div style={{ ...S.mono, fontSize: 11, letterSpacing: "0.35em", textTransform: "uppercase", color: "#888", marginBottom: 8 }}>Vaka Dosyası // İnşa Et · Sevk Et · Sun</div>
              <h1 style={{ ...S.display, fontSize: "clamp(44px,11vw,88px)", lineHeight: 0.95, letterSpacing: "-0.02em", color: S.ink, marginBottom: 4 }}>
                Hackathon<br /><span style={{ color: S.red }}>Aydın</span>
              </h1>
              <div style={{ ...S.mono, fontSize: 14, letterSpacing: "0.25em", textTransform: "uppercase", color: "#888", marginBottom: 24 }}>GDG × Oyun ve Tasarım Kulübü</div>

              {/* Chars */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 1, border: `1px solid ${S.aged}`, borderRadius: 2, overflow: "hidden", marginBottom: 24 }}>
                {[
                  { svg: <DinoSVG size={48} />, name: "Dino", tag: "GDG", red: false },
                  { svg: null, name: "VS", tag: "", red: false, sep: true },
                  { svg: <EESVGSmall size={48} />, name: "Early Access", tag: "Şüpheli", red: true },
                  { svg: null, name: "VS", tag: "", red: false, sep: true },
                  { svg: <BetaSVG size={48} />, name: "Beta", tag: "O&T Kulübü", red: false },
                ].map((c, i) =>
                  c.sep ? (
                    <div key={i} style={{ display: "none", alignItems: "center", justifyContent: "center", padding: "0 12px", background: S.paper2, borderRight: `1px solid ${S.aged}` }} className="sm-flex">
                      <span style={{ ...S.display, fontSize: 11, letterSpacing: "0.1em", color: "#bbb" }}>VS</span>
                    </div>
                  ) : (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "14px 8px", background: c.red ? "#f5e8e8" : S.paper2, borderRight: "none", cursor: "default" }}>
                      {c.svg}
                      <span style={{ ...S.mono, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: c.red ? S.red : S.ink }}>{c.name}</span>
                      <span style={{ ...S.mono, fontSize: 10, color: c.red ? S.red : "#888" }}>{c.tag}</span>
                    </div>
                  )
                )}
              </div>

              <p style={{ fontSize: 16, lineHeight: 1.75, color: "#3d2f1f", maxWidth: 560, marginBottom: 22 }}>
                <strong>Beta</strong> ve <strong>Dino</strong> bir iz buldu. Ama gölgede biri var:{" "}
                <strong style={{ color: S.red }}>Early Access</strong> — kocaman bıyığı, sinsi sırıtışı ve{" "}
                <em style={{ color: "#888" }}>"v0.0.1"</em> tabelasıyla dolaşıyor. O seni{" "}
                <em style={{ color: "#888" }}>"yarım işi sahneye sür"</em> diye kandırır.
                Bizim kuralımız: <strong>gerçeği ortaya çıkar. 48 saat</strong> — tek operasyon penceresi.
              </p>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link href="/hackathon/basvur" style={{ ...S.display, fontSize: 15, letterSpacing: "0.12em", padding: "10px 24px", background: S.ink, color: "#f2e8d5", borderRadius: 2, textDecoration: "none", display: "inline-block" }}>Vakaya Katıl →</Link>
                <Link href="/hackathon/dosya" style={{ ...S.display, fontSize: 15, letterSpacing: "0.12em", padding: "10px 24px", border: `2px solid ${S.aged}`, color: S.ink, borderRadius: 2, textDecoration: "none", display: "inline-block", background: "none" }}>Vaka Dosyası</Link>
              </div>

              <p aria-hidden style={{ ...S.mono, fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 16, color: "#f2e8d5", userSelect: "none" }}>↑↑↓↓←→←→BA // biliyorsan biliyorsun</p>
            </div>

            {/* ŞÜPHELI */}
            <div className="hck-reveal" style={{ padding: "24px 32px", borderBottom: `1px dashed ${S.aged}` }}>
              <SecHeader title="Şüpheli Dosyası" tag="Suspect #1" />
              <div style={{ display: "grid", gridTemplateColumns: "minmax(140px, 180px) 1fr", gap: 24, flexWrap: "wrap" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "16px 20px", background: S.paper2, border: `1px solid ${S.aged}`, minWidth: 130, flexShrink: 0 }}>
                  <span style={{ ...S.mono, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#888" }}>Fotoğraf</span>
                  <EESVGPortrait />
                  <span style={{ ...S.display, fontSize: 15, letterSpacing: "0.06em", color: S.red }}>Erken Erişim</span>
                  <span style={{ ...S.mono, fontSize: 10, letterSpacing: "0.15em", background: S.red, color: "#fff", padding: "2px 8px", borderRadius: 1 }}>Tehlike: Yüksek</span>
                  <span style={{ ...S.mono, fontSize: 10, color: "#aaa" }}>Yakalanımadı</span>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
                  {[
                    { label: "Alias", val: "Erken Erişim", em: false },
                    { label: "Bilinen Söylemler", val: '"Daha bitmedi ama yayınla." / "Sonra düzeltirsin." / "Demo mış gibi yap."', em: true },
                    { label: "Modus Operandi", val: "Kapsam şişirme. 5 yarım özellik, 0 sağlam kanıt. Sunumda dağılma.", em: false },
                    { label: "Panzehir", val: "1 net problem → 1 güçlü MVP → 1 keskin demo. Dino & Beta'nın kuralı.", em: false },
                  ].map((f) => (
                    <div key={f.label}>
                      <div style={{ ...S.mono, fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", color: "#888", borderBottom: `1px solid ${S.aged}`, paddingBottom: 3, marginBottom: 5 }}>{f.label}</div>
                      <div style={{ fontSize: 15, lineHeight: 1.65, color: f.em ? "#666" : "#2d1f0e", fontStyle: f.em ? "italic" : "normal" }}>{f.val}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* KANIT */}
            <div className="hck-reveal" style={{ padding: "24px 32px", borderBottom: `1px dashed ${S.aged}` }}>
              <SecHeader title="Kanıt Panosu" tag="Evidence Log" />
              <div style={{ border: `1px solid ${S.aged}`, borderRadius: 2, overflow: "hidden" }}>
                {[
                  { code: "K-01", title: "İpucu: Problem", desc: "Beta'nın kuralı: problem net değilse çözüm de net olmaz. Tek cümlede yaz — Kimi, neyi, neden çözüyoruz?", note: '// Beta: "İpucu bulanıksa, dosya dağılır."', red: false },
                  { code: "K-02", title: "İpucu: Kanıt (MVP)", desc: "Dino'nun kuralı: kanıt göster. Akış, ekran, çalışan demo. Az ama sağlam — tutarlı.", note: '// Dino: "Süs değil, iz bırak."', red: false },
                  { code: "K-03", title: "Tehdit: Erken Erişim", desc: 'Düşmanımız: yarım işi "yayınla geç" diye fısıldar. Panzehir: net kapsam + sağlam demo.', note: "⚠ Erken erişim tuzağına düşme.", red: true },
                ].map((ev, i) => (
                  <div key={ev.code} style={{ display: "flex", borderTop: i > 0 ? `1px solid ${S.aged}` : undefined, background: ev.red ? "#fdf8f4" : S.paper2 }}>
                    <div style={{ ...S.mono, fontSize: 11, background: ev.red ? "#7c2d12" : S.ink, color: ev.red ? "#f2e8d5" : S.aged, writingMode: "vertical-rl", display: "flex", alignItems: "center", justifyContent: "center", minWidth: 40, padding: "10px 0", letterSpacing: "0.1em" }}>{ev.code}</div>
                    <div style={{ padding: "12px 16px", flex: 1 }}>
                      <div style={{ ...S.display, fontSize: 15, letterSpacing: "0.06em", color: ev.red ? S.red : S.ink, marginBottom: 4 }}>{ev.title}</div>
                      <div style={{ fontSize: 14, lineHeight: 1.65, color: "#3d2f1f" }}>{ev.desc}</div>
                      <div style={{ ...S.mono, fontSize: 11, color: ev.red ? S.red : "#999", marginTop: 6 }}>{ev.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TEMEL BİLGİLER */}
            <div className="hck-reveal" style={{ padding: "24px 32px", borderBottom: `1px dashed ${S.aged}` }}>
              <SecHeader title="Temel Bilgiler" tag="Case Overview" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 1, border: `1px solid ${S.aged}`, background: S.aged, borderRadius: 2, overflow: "hidden" }}>
                {[["Dosya Açılışı","Yakında"],["Bölge","Aydın"],["Süre","48 Saat"],["Erişim","Ücretsiz"]].map(([k,v]) => (
                  <div key={k} style={{ background: S.paper2, padding: "12px 14px" }}>
                    <div style={{ ...S.mono, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#888", marginBottom: 4 }}>{k}</div>
                    <div style={{ ...S.display, fontSize: 16, letterSpacing: "0.04em", color: S.ink }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 14, padding: "11px 14px", borderLeft: `3px solid ${S.aged}`, background: S.paper2, fontSize: 14, lineHeight: 1.7, color: "#555" }}>
                <span style={{ ...S.mono, color: S.ink }}>Beta:</span> "Net problem = hızlı yön." &nbsp;·&nbsp;{" "}
                <span style={{ ...S.mono, color: S.ink }}>Dino:</span> "Kanıt yoksa iddia yok." &nbsp;·&nbsp;{" "}
                <span style={{ ...S.mono, color: S.red }}>Erken Erişim:</span> "Yarım iş de olur…" →{" "}
                <span style={{ ...S.mono, color: S.ink }}>Biz:</span> "Olmaz."
              </div>
            </div>

            {/* AJAN PROFİLLERİ */}
            <div className="hck-reveal" style={{ padding: "24px 32px", borderBottom: `1px dashed ${S.aged}` }}>
              <SecHeader title="Ajan Profilleri" tag="Role Matching" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 1, border: `1px solid ${S.aged}`, background: S.aged, borderRadius: 2, overflow: "hidden" }}>
                {[
                  { badge: "Rol 01 // Dino Ekibi", title: "Kod Dedektifi", desc: "Sistemi kurar. API, veri, akış. Hatanın nerede saklandığını bulur. Herkes uyurken o çalışır.", tags: ["Back-end","Entegrasyon","Hızlı Fix"], note: "// RAWR!" },
                  { badge: "Rol 02 // Beta Ekibi", title: "UI İz Sürücü", desc: "Kullanıcıyı doğru yere götüren tasarım. Hiyerarşi, akış, etkileşim — her piksel bir ipucu.", tags: ["UI/UX","Prototip","Sunum Hissi"], note: "// ○ × ile tasarım yaparız." },
                  { badge: "Rol 03 // Beta Ekibi", title: "Ürün Analisti", desc: "Problem–çözüm uyumu. Hedef kitle + değer önerisi + ölçüm. Dosyanın omurgası.", tags: ["Ürün","Araştırma","Kapsam"], note: "// Kapsam netse, çözüm nettir." },
                  { badge: "Rol 04 // Dino Ekibi", title: "Pitch Avukatı", desc: "Jüri karşısında dosyayı kapatır. Hikâye + kanıt + net kapanış. Sözler biter, iş konuşur.", tags: ["Sunum","Demo","Hikâye"], note: "// Sonuç odaklı ol." },
                ].map((r) => (
                  <div key={r.badge} style={{ background: S.paper2, padding: "14px 16px" }}>
                    <div style={{ ...S.mono, fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "#888", marginBottom: 3 }}>{r.badge}</div>
                    <div style={{ ...S.display, fontSize: 15, letterSpacing: "0.06em", color: S.ink, marginBottom: 6 }}>{r.title}</div>
                    <div style={{ fontSize: 14, lineHeight: 1.6, color: "#3d2f1f", marginBottom: 10 }}>{r.desc}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {r.tags.map((t) => <span key={t} style={{ ...S.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", border: `1px solid ${S.aged}`, padding: "2px 7px", color: "#666", borderRadius: 1 }}>{t}</span>)}
                    </div>
                    <div style={{ ...S.mono, fontSize: 10, color: "#aaa", marginTop: 8 }}>{r.note}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* SORUŞTURMA AKIŞI */}
            <div className="hck-reveal" style={{ padding: "24px 32px", borderBottom: `1px dashed ${S.aged}` }}>
              <SecHeader title="Soruşturma Akışı" tag="Checkpoints" />
              <div style={{ border: `1px solid ${S.aged}`, borderRadius: 2, overflow: "hidden" }}>
                {[
                  { n:"01", lbl:"AÇILIŞ", speaker:"Beta Raporu", title:"Dosya Açılışı", desc:"Vaka brifingi, kurallar, hedefler. Takım eşleşmesi ve hızlı yönlendirme.", checks:["T+0: Dosya açılır","T+2: Roller netleşir","T+4: Plan çıkar"], red:false },
                  { n:"02", lbl:"İNŞA", speaker:"Dino Raporu", title:"İz Sürme (İnşa Et)", desc:"Kod, tasarım, iş modeli. Mentor checkpoint'leri ile hızlı iterasyon.", checks:["T+12: İlk prototip","T+24: Kritik kanıt","T+36: Demo hazır"], red:false },
                  { n:"03", lbl:"KAPANIŞ", speaker:"⚠ Erken Erişim Tehdidi Aktif", title:"Final Sorgu (Demo)", desc:"Pitch + canlı demo. Jüri değerlendirmesi. Dosya kapanır — ya zaferle, ya yarım işle.", checks:["T+44: Son prova","T+48: Sunum","T+48+: Sonuç"], red:true },
                ].map((tl, i) => (
                  <div key={tl.n} style={{ display: "flex", borderTop: i > 0 ? `1px solid ${S.aged}` : undefined, background: S.paper2 }}>
                    <div style={{ background: S.ink, minWidth: 52, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, padding: "16px 0", flexShrink: 0 }}>
                      <span style={{ ...S.display, fontSize: 22, color: "#444" }}>{tl.n}</span>
                      <span style={{ ...S.mono, fontSize: 10, letterSpacing: "0.1em", color: "#555" }}>{tl.lbl}</span>
                    </div>
                    <div style={{ padding: "14px 16px", flex: 1 }}>
                      <div style={{ ...S.mono, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: tl.red ? S.red : "#aaa", marginBottom: 3 }}>{tl.speaker}</div>
                      <div style={{ ...S.display, fontSize: 14, letterSpacing: "0.04em", color: S.ink, marginBottom: 5 }}>{tl.title}</div>
                      <div style={{ fontSize: 14, lineHeight: 1.6, color: "#3d2f1f", marginBottom: 10 }}>{tl.desc}</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                        {tl.checks.map((c) => <span key={c} style={{ ...S.mono, fontSize: 11, background: "#f2e8d5", border: `1px solid ${S.aged}`, color: "#777", padding: "2px 8px", borderRadius: 1 }}>{c}</span>)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SORU ODASI */}
            <div className="hck-reveal" style={{ padding: "24px 32px", borderBottom: `1px dashed ${S.aged}` }}>
              <SecHeader title="Soru Odası" tag="Sorgu Kaydı" />
              <div style={{ border: `1px solid ${S.aged}`, borderRadius: 2, overflow: "hidden" }}>
                {FAQ_ITEMS.map((f, i) => (
                  <div key={f.q} style={{ borderTop: i > 0 ? `1px solid ${S.aged}` : undefined, background: S.paper2 }}>
                    <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 16px", background: "none", border: "none", cursor: "pointer" }}>
                      <div>
                        <div style={{ ...S.mono, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#aaa", marginBottom: 3 }}>{f.who}</div>
                        <div style={{ fontSize: 15, color: S.ink }}>{f.q}</div>
                      </div>
                      <span style={{ ...S.mono, fontSize: 18, color: openFaq === i ? S.ink : S.aged, transform: openFaq === i ? "rotate(45deg)" : "none", display: "inline-block", transition: "transform .2s", flexShrink: 0 }}>+</span>
                    </button>
                    <div className={`hck-faq-body${openFaq === i ? " open" : ""}`}>
                      <div style={{ fontSize: 15, lineHeight: 1.7, color: "#3d2f1f" }}>{f.a}</div>
                      <div style={{ ...S.mono, fontSize: 11, color: "#aaa", marginTop: 6 }}>{f.hint}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="hck-reveal" style={{ padding: "24px 32px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 40, alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <DinoSVG size={40} /><BetaSVG size={40} />
                    <div>
                      <div style={{ ...S.mono, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#888" }}>Dino & Beta</div>
                      <div style={{ ...S.mono, fontSize: 10, color: "#aaa" }}>Seni bekliyor</div>
                    </div>
                  </div>
                  <div style={{ ...S.display, fontSize: 22, letterSpacing: "0.06em", textTransform: "uppercase", color: S.ink, marginBottom: 8 }}>Dosya Seni Bekliyor.</div>
                  <p style={{ fontSize: 15, lineHeight: 1.7, color: "#3d2f1f", maxWidth: 400, marginBottom: 8 }}>
                    Beta ve Dino bu soruşturmayı tek başına kapatamaz. Erken Erişim gölgede dolaşıyor.{" "}
                    <strong>Senin görevin:</strong> kanıtla, sun, dosyayı kapat.
                  </p>
                  <div style={{ ...S.mono, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "#888" }}>// "kanu0131tın varsa varsın."</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 200, maxWidth: 260 }}>
                  <Link href="/hackathon/basvur" style={{ ...S.display, fontSize: 15, letterSpacing: "0.1em", padding: "11px 20px", background: S.ink, color: "#f2e8d5", borderRadius: 2, textDecoration: "none", display: "block", textAlign: "center" }}>Başvuruyu Aç →</Link>
                  <Link href="/hackathon/dosya" style={{ ...S.display, fontSize: 15, letterSpacing: "0.1em", padding: "11px 20px", border: `2px solid ${S.aged}`, color: S.ink, borderRadius: 2, textDecoration: "none", display: "block", textAlign: "center", background: "none" }}>Vaka Dosyasını Gör</Link>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div style={{ background: S.ink, padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <span style={{ ...S.mono, fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "#333" }}>Dosya, kanu0131tla kapatılır. <span style={{ color: "#444" }}>Erken Erişim ile değil.</span></span>
              <span style={{ ...S.mono, fontSize: 11, color: "#222" }}>GDG × O&T // v1.0</span>
            </div>

          </div>{/* /paper */}
        </div>
      </div>

      {/* RADIO */}
      {radioOpen ? (
        <div style={{ position: "fixed", bottom: 16, left: 12, zIndex: 500, width: 272, maxWidth: "calc(100vw - 24px)", background: "#1a1108", border: "1px solid #3a2d1a", borderRadius: 4, boxShadow: "0 8px 32px rgba(0,0,0,.7)", overflow: "hidden" }}>
          <div style={{ background: "#0d0a05", padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ ...S.mono, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#664" }}>📻 Saha Telsizi</span>
            <button onClick={() => setRadioOpen(false)} style={{ background: "none", border: "none", color: "#554", cursor: "pointer", fontSize: 14, padding: "0 4px" }}>✕</button>
          </div>
          <div style={{ display: "flex", borderBottom: "1px solid #2a1f0a" }}>
            {(["beta","dino","ee"] as Spk[]).map((s) => (
              <button key={s} onClick={() => setCurSpk(s)} style={{ flex: 1, padding: "7px 4px", background: curSpk === s ? "#2a1f0a" : "none", color: curSpk === s ? "#c9a870" : "#554", border: "none", borderRight: s !== "ee" ? "1px solid #2a1f0a" : "none", ...S.mono, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
                {s === "beta" ? "Beta" : s === "dino" ? "Dino" : "Erken E."}
              </button>
            ))}
          </div>
          <div className="hck-rlog" style={{ padding: 8, maxHeight: 150, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
            {logs.map((l, i) => (
              <div key={i} style={{ background: l.spk === "ee" ? "#120505" : "#110d04", border: `1px solid ${l.spk === "ee" ? "#3a1010" : "#221808"}`, padding: "6px 8px", borderRadius: 2 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ ...S.mono, fontSize: 10, color: "#776" }}>{spkLabel(l.spk)} — {l.t}</span>
                  <span style={{ ...S.mono, fontSize: 10, color: "#443" }}>{l.time}</span>
                </div>
                <div style={{ ...S.mono, fontSize: 11, color: "#a0906a", lineHeight: 1.5 }}>{l.m}</div>
              </div>
            ))}
          </div>
          <button onClick={addLog} style={{ ...S.mono, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", width: "calc(100% - 16px)", margin: "6px 8px 8px", background: "#c9a870", color: "#0d0a05", border: "none", padding: "8px", borderRadius: 2, cursor: "pointer" }}>Mesaj Al</button>
        </div>
      ) : (
        <button onClick={() => setRadioOpen(true)} style={{ position: "fixed", bottom: 16, left: 12, zIndex: 500, ...S.mono, fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", padding: "7px 12px", background: "#1a1108", border: "1px solid #3a2d1a", color: "#664", cursor: "pointer", borderRadius: 4 }}>📻 Radyo</button>
      )}
    </>
  );
}