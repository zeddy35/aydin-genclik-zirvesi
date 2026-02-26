"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useEasterEggs } from "@/components/EasterEggContext";

// ─────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────
const T = {
  bg: "#0a0a0f",
  surf: "#13111f",
  surfHigh: "#1a1730",
  border: "#1e1a2e",
  borderHigh: "#2d2848",
  text: "#e2e0f0",
  muted: "#8b85a8",
  faint: "#2e2a45",
  gold: "#d4a843",
  goldDim: "#8a6a1a",
  violet: "#7c3aed",
  violetDim: "#3b1f7a",
  violetLight: "#a78bfa",
  fn: {
    display: "'Syne', sans-serif",
    body: "'DM Sans', sans-serif",
    mono: "'Share Tech Mono', monospace",
  },
};

// ─────────────────────────────────────────────────────────────
// STANDALONE COUNTDOWN
// ─────────────────────────────────────────────────────────────
export function EventCountdown() {
  const [t, setT] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const calc = () => {
      const diff = new Date("2026-05-16T09:00:00+03:00").getTime() - Date.now();
      if (diff > 0)
        setT({
          days: Math.floor(diff / 86400000),
          hours: Math.floor((diff / 3600000) % 24),
          minutes: Math.floor((diff / 60000) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, []);

  if (!mounted) return null;

  return (
    <div style={{ background: T.bg, padding: "clamp(20px,4vw,36px) clamp(16px,3vw,32px)", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{ fontFamily: T.fn.mono, fontSize: 10, letterSpacing: "0.35em", textTransform: "uppercase", background: `linear-gradient(90deg, ${T.gold} 0%, ${T.gold} 45%, ${T.violetLight} 55%, ${T.violetLight} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
        ◈ ETKİNLİĞE GİRİŞ ◈
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap", justifyContent: "center" }}>
        {[{ v: t.days, l: "GÜN" }, { v: t.hours, l: "SAAT" }, { v: t.minutes, l: "DAKİKA" }, { v: t.seconds, l: "SANİYE" }].map(({ v, l }, i) => (
          <React.Fragment key={l}>
            {i > 0 && <div style={{ width: 1, height: 40, background: T.border, alignSelf: "center", marginBottom: 20, flexShrink: 0 }} />}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ fontFamily: T.fn.display, fontWeight: 800, fontSize: "clamp(26px,5vw,44px)", color: T.text, background: T.surf, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 18px", minWidth: 72, textAlign: "center", boxShadow: `inset 0 1px 0 rgba(255,255,255,.04), 0 0 20px rgba(124,58,237,0.08)`, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em" }}>
                {String(v).padStart(2, "0")}
              </div>
              <div style={{ fontFamily: T.fn.body, fontSize: 10, letterSpacing: "0.12em", color: T.muted, textTransform: "uppercase" }}>{l}</div>
            </div>
          </React.Fragment>
        ))}
      </div>
      <div style={{ fontFamily: T.fn.mono, fontSize: 10, letterSpacing: "0.2em", color: T.faint, textTransform: "uppercase" }}>
        16 Mayıs 2026 · Aydın Gençlik Zirvesi
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCROLL REVEAL
// ─────────────────────────────────────────────────────────────
function SummitReveal() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@400;500;600&family=Share+Tech+Mono&display=swap";
    document.head.appendChild(link);
    const els = document.querySelectorAll(".sum-reveal");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); obs.unobserve(e.target); } }),
      { threshold: 0.05 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
  return null;
}

// ─────────────────────────────────────────────────────────────
// SECTION HEADER
// ─────────────────────────────────────────────────────────────
function SumSecHeader({ title, label }: { title: string; label: string }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontFamily: T.fn.mono, fontSize: 10, letterSpacing: "0.35em", textTransform: "uppercase", color: T.muted, marginBottom: 8 }}>{label}</div>
      <h2 style={{ fontFamily: T.fn.display, fontWeight: 800, fontSize: "clamp(18px,3vw,26px)", color: T.text, margin: 0, letterSpacing: "-0.02em" }}>{title}</h2>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ORG MONOGRAMS
// ─────────────────────────────────────────────────────────────
function GDGMonogram() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" stroke={T.gold} strokeWidth="1.5" fill="none" />
      <circle cx="24" cy="24" r="16" fill="#1a1730" />
      <text x="24" y="30" textAnchor="middle" fontSize="18" fontWeight="700" fontFamily="Syne, sans-serif" fill={T.gold}>G</text>
    </svg>
  );
}

function OTTMonogram() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" stroke={T.violetLight} strokeWidth="1.5" fill="none" />
      <circle cx="24" cy="24" r="16" fill="#1a1730" />
      <text x="24" y="30" textAnchor="middle" fontSize="18" fontWeight="700" fontFamily="Syne, sans-serif" fill={T.violetLight}>O</text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// SPONSOR DATA
// ─────────────────────────────────────────────────────────────
const SPONSORS_ROW1 = [
  { id: "SP-01", name: "Sponsor Adı" }, { id: "SP-02", name: "Sponsor Adı" },
  { id: "SP-03", name: "Sponsor Adı" }, { id: "SP-04", name: "Sponsor Adı" },
  { id: "SP-05", name: "Sponsor Adı" }, { id: "SP-06", name: "Sponsor Adı" },
];
const SPONSORS_ROW2 = [
  { id: "SP-07", name: "Sponsor Adı" }, { id: "SP-08", name: "Sponsor Adı" },
  { id: "SP-09", name: "Sponsor Adı" }, { id: "SP-10", name: "Sponsor Adı" },
  { id: "SP-11", name: "Sponsor Adı" }, { id: "SP-12", name: "Sponsor Adı" },
];

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export function SummitInfo() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { markEggSeen } = useEasterEggs();

  // ── Egg 1: Portal cake ────────────────────────────────────
  const [cakeShowing, setCakeShowing] = useState(false);
  const [cakeHeadingBadge, setCakeHeadingBadge] = useState(false);
  const sponsorClicksRef = useRef<number[]>([]);
  const handleSponsorHeadingClick = useCallback(() => {
    const now = Date.now();
    const recent = [...sponsorClicksRef.current, now].filter((t) => now - t < 2000);
    sponsorClicksRef.current = recent;
    if (recent.length >= 3) {
      sponsorClicksRef.current = [];
      setCakeShowing(true);
      setCakeHeadingBadge(true);
      markEggSeen("egg-portal");
      setTimeout(() => setCakeShowing(false), 4500);
    }
  }, [markEggSeen]);

  const STATS = [
    { v: "500+", l: "Katılımcı", sub: "REGISTERED", accent: T.gold },
    { v: "50+",  l: "Takım",    sub: "SQUADS",     accent: T.violet },
    { v: "96s",  l: "Süre",     sub: "HOURS",      accent: T.gold },
    { v: "GDG×OTT", l: "Organizatörler", sub: "ORGANIZERS", accent: T.violet },
  ];

  const TIMELINE = [
    { num: "01", day: "Gün 1", mark: "T+0",  title: "Açılış & Ekip Kurma",    desc: "Katılımcılar bir araya geliyor, takımlar oluşturuluyor, tema açıklanıyor.", accent: T.gold },
    { num: "02", day: "Gün 2", mark: "T+24", title: "Geliştirme & Mentorluk", desc: "Tam kapasitede geliştirme, mentor desteği ve ara aktiviteler.", accent: T.violet },
    { num: "03", day: "Gün 3", mark: "T+48", title: "Final & Sunumlar",       desc: "Takımlar projelerini sunuyor, jüriler değerlendiriyor, kazananlar ilan ediliyor.", accent: T.gold },
    { num: "04", day: "Gün 4", mark: "T+72", title: "Kapanış & Ödüller",      desc: "Ödül töreni, networking ve kapanış. Aydın Gençlik Zirvesi resmen kapanıyor.", accent: T.violet },
  ];

  const FAQS = [
    { q: "Katılım ücretsiz mi?", a: "Evet, tamamen ücretsiz. GDG on Campus Aydın ve Oyun & Tasarım Topluluğu desteğiyle düzenleniyor." },
    { q: "Tek başıma başvurabilir miyim?", a: "Evet. Eşleşme akışı mevcut — rolüne göre ekip bulmana yardım ediyoruz." },
    { q: "Hackathon ve Game Jam aynı anda mı?", a: "Aydın Gençlik Zirvesi çatısı altında eş zamanlı ilerliyor. İstediğin etkinliği seçebilirsin." },
    { q: "Daha önce hiç katılmadım, uygun muyum?", a: "Kesinlikle. Tüm seviyelere açık. Mentorlar ve rehber içerikler her adımda yanında." },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@400;500;600&family=Share+Tech+Mono&display=swap');

        .sum-reveal { opacity:0; transform:translateY(16px); transition:opacity .55s ease,transform .55s ease; }
        .sum-reveal.in { opacity:1; transform:translateY(0); }

        .sum-stat-card { transition:transform .15s ease,border-color .15s ease,box-shadow .15s ease; cursor:default; }
        .sum-stat-card:hover { transform:translateY(-2px); box-shadow:0 4px 24px rgba(124,58,237,0.12) !important; }

        @keyframes portal-egg-in { from { transform:translateY(30px); opacity:0; } to { transform:translateY(0); opacity:1; } }
        .sum-faq-body { max-height:0; overflow:hidden; transition:max-height .3s ease,padding .2s; padding:0; }
        .sum-faq-body.open { max-height:160px; padding-bottom:16px; }
        .sum-faq-btn { cursor:pointer; transition:background .15s; background:none; }
        .sum-faq-btn:hover { background:rgba(255,255,255,0.02) !important; }

        .sum-org-card { transition:border-color .2s ease,box-shadow .2s ease; cursor:default; }
        .sum-org-card:hover { border-color:#2d2848 !important; box-shadow:0 8px 32px rgba(124,58,237,0.1) !important; }

        @keyframes sum-scroll-left  { from { transform:translateX(0) }    to { transform:translateX(-50%) } }
        @keyframes sum-scroll-right { from { transform:translateX(-50%) } to { transform:translateX(0) } }
        .sum-track-left  { animation:sum-scroll-left  30s linear infinite; display:flex; width:max-content; gap:12px; }
        .sum-track-right { animation:sum-scroll-right 30s linear infinite; display:flex; width:max-content; gap:12px; }
        .sum-carousel:hover .sum-track-left,
        .sum-carousel:hover .sum-track-right { animation-play-state:paused; }

        @media (prefers-reduced-motion: reduce) {
          .sum-reveal { opacity:1; transform:none; transition:none; }
          .sum-track-left,.sum-track-right { animation:none; }
          .sum-stat-card:hover,.sum-org-card:hover { transform:none; }
        }
      `}</style>
      <SummitReveal />

      <div style={{ background: T.bg, fontFamily: T.fn.body, width: "100%", color: T.text }}>

        {/* ── HERO STRIP ── */}
        <section className="sum-reveal" style={{ padding: "clamp(48px,8vw,88px) clamp(16px,4vw,32px) clamp(32px,5vw,56px)", textAlign: "center", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ maxWidth: 1040, margin: "0 auto" }}>
            <div style={{ fontFamily: T.fn.mono, fontSize: 11, letterSpacing: "0.35em", textTransform: "uppercase", color: T.gold, marginBottom: 18 }}>
              AYDIN GENÇLİK ZİRVESİ · 2026
            </div>
            <h1 style={{ fontFamily: T.fn.display, fontWeight: 800, fontSize: "clamp(36px,7vw,72px)", color: T.text, margin: "0 0 8px", lineHeight: 1.05, letterSpacing: "-0.03em" }}>
              İki Dünya.<br />
              <span style={{ background: `linear-gradient(135deg, ${T.gold} 0%, ${T.violetLight} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Bir Sahne.
              </span>
            </h1>
            <p style={{ fontFamily: T.fn.body, fontSize: "clamp(14px,2vw,17px)", color: T.muted, maxWidth: 560, margin: "16px auto 28px", lineHeight: 1.75 }}>
              Gençlerin teknoloji, yaratıcılık ve yenilikçiliğini sergileyebilecekleri bir platform. GDG on Campus Aydın ve OTT iş birliğiyle, iki etkinlik — bir çatı altında.
            </p>
            {/* Sub-event badges */}
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 36 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(212,168,67,0.08)", border: "1px solid rgba(212,168,67,0.3)", borderRadius: 100, padding: "8px 18px" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.gold, display: "inline-block", flexShrink: 0 }} />
                <span style={{ fontFamily: T.fn.mono, fontSize: 11, letterSpacing: "0.15em", color: T.gold, textTransform: "uppercase" }}>Hackathon</span>
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.35)", borderRadius: 100, padding: "8px 18px" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.violetLight, display: "inline-block", flexShrink: 0 }} />
                <span style={{ fontFamily: T.fn.mono, fontSize: 11, letterSpacing: "0.15em", color: T.violetLight, textTransform: "uppercase" }}>Game Jam</span>
              </div>
            </div>
            {/* Countdown */}
            <div style={{ background: T.surf, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden", maxWidth: 600, margin: "0 auto" }}>
              <EventCountdown />
            </div>
          </div>
        </section>

        {/* ── ABOUT ── */}
        <section className="sum-reveal" style={{ padding: "clamp(40px,6vw,64px) clamp(16px,4vw,32px)", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ maxWidth: 1040, margin: "0 auto" }}>
            <SumSecHeader title="Zirve Nedir?" label="◈ Genel Bakış" />
            <p style={{ fontFamily: T.fn.body, fontSize: 16, lineHeight: 1.8, color: T.muted, maxWidth: 640, marginBottom: 28 }}>
              <span style={{ color: T.text, fontWeight: 600 }}>Aydın Gençlik Zirvesi</span>, gençlerin teknoloji, yaratıcılık ve yenilikçiliğini sergileyebilecekleri bir platform. GDG on Campus Aydın ve OTT iş birliğiyle düzenlenen bu etkinlikte, Hackathon ve Game Jam eş zamanlı ilerliyor. Fikirler netleşiyor, prototipler doğuyor, gerçek çözümler ortaya çıkıyor.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 1, borderRadius: 12, overflow: "hidden", border: `1px solid ${T.border}` }}>
              <div style={{ background: T.surf, borderLeft: `3px solid ${T.gold}`, padding: "20px 22px" }}>
                <div style={{ fontFamily: T.fn.mono, fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: T.gold, marginBottom: 8 }}>HACKATHON // DOSYA</div>
                <div style={{ fontFamily: T.fn.display, fontWeight: 700, fontSize: 16, color: T.text, marginBottom: 6 }}>Kanıtın Varsa Varsın</div>
                <div style={{ fontFamily: T.fn.body, fontSize: 13, color: T.muted, lineHeight: 1.7 }}>48 saat · Teknoloji & Ürün<br />Problem → MVP → Kanıt</div>
              </div>
              <div style={{ background: T.surf, borderLeft: `3px solid ${T.violet}`, padding: "20px 22px" }}>
                <div style={{ fontFamily: T.fn.mono, fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: T.violetLight, marginBottom: 8 }}>GAME JAM // ARCADE</div>
                <div style={{ fontFamily: T.fn.display, fontWeight: 700, fontSize: 16, color: T.text, marginBottom: 6 }}>Ship It! 🎮</div>
                <div style={{ fontFamily: T.fn.body, fontSize: 13, color: T.muted, lineHeight: 1.7 }}>48 saat · Oyun & Tasarım<br />Cartoonish chaos — ama üretken.</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="sum-reveal" style={{ padding: "clamp(40px,6vw,64px) clamp(16px,4vw,32px)", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ maxWidth: 1040, margin: "0 auto" }}>
            <SumSecHeader title="Rakamlarla Zirve" label="◈ Özet Veriler" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
              {STATS.map((s) => (
                <div key={s.sub} className="sum-stat-card" style={{ background: T.surf, border: `1px solid ${T.border}`, borderRadius: 12, padding: "22px 20px 16px", position: "relative", overflow: "hidden" }}>
                  <div style={{ fontFamily: T.fn.mono, fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase", color: T.muted, marginBottom: 10 }}>{s.sub}</div>
                  <div style={{ fontFamily: T.fn.display, fontWeight: 800, fontSize: "clamp(22px,4vw,34px)", color: T.text, letterSpacing: "-0.02em", lineHeight: 1, marginBottom: 6 }}>{s.v}</div>
                  <div style={{ fontFamily: T.fn.body, fontSize: 13, color: T.muted, fontWeight: 500 }}>{s.l}</div>
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: s.accent, opacity: 0.7 }} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ORGANIZERS ── */}
        <section className="sum-reveal" style={{ padding: "clamp(40px,6vw,64px) clamp(16px,4vw,32px)", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ maxWidth: 1040, margin: "0 auto" }}>
            <SumSecHeader title="Ana Organizatörler" label="◈ Yetki Sahipleri" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
              <div className="sum-org-card" style={{ background: T.surf, border: `1px solid ${T.border}`, borderRadius: 16, padding: "28px 24px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: T.gold, opacity: 0.6 }} />
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                  <GDGMonogram />
                  <div>
                    <div style={{ fontFamily: T.fn.display, fontWeight: 700, fontSize: 16, color: T.text, marginBottom: 3 }}>GDG on Campus Aydın</div>
                    <div style={{ fontFamily: T.fn.mono, fontSize: 10, letterSpacing: "0.2em", color: T.gold, textTransform: "uppercase" }}>Google Developer Group</div>
                  </div>
                </div>
                <p style={{ fontFamily: T.fn.body, fontSize: 13, color: T.muted, lineHeight: 1.75, margin: 0 }}>
                  Google&apos;ın teknoloji topluluğu. Öğrenciler için, öğrencilerle. Yazılım, ürün geliştirme ve inovasyon odaklı etkinlikler düzenliyoruz.
                </p>
              </div>
              <div className="sum-org-card" style={{ background: T.surf, border: `1px solid ${T.border}`, borderRadius: 16, padding: "28px 24px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: T.violet, opacity: 0.6 }} />
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                  <OTTMonogram />
                  <div>
                    <div style={{ fontFamily: T.fn.display, fontWeight: 700, fontSize: 16, color: T.text, marginBottom: 3 }}>OTT</div>
                    <div style={{ fontFamily: T.fn.mono, fontSize: 10, letterSpacing: "0.2em", color: T.violetLight, textTransform: "uppercase" }}>Oyun ve Tasarım Topluluğu</div>
                  </div>
                </div>
                <p style={{ fontFamily: T.fn.body, fontSize: 13, color: T.muted, lineHeight: 1.75, margin: 0 }}>
                  Oyun geliştirme ve tasarım odaklı öğrenci kulübü. Yaratıcılığı ve teknik beceriyi buluşturarak yenilikçi projeler hayata geçiriyoruz.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── TIMELINE ── */}
        <section className="sum-reveal" style={{ padding: "clamp(40px,6vw,64px) clamp(16px,4vw,32px)", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ maxWidth: 1040, margin: "0 auto" }}>
            <SumSecHeader title="Program Akışı" label="◈ Zaman Çizelgesi" />
            <div style={{ position: "relative", paddingLeft: 28, borderLeft: `1px solid ${T.border}` }}>
              <div style={{ position: "absolute", top: 0, left: -1, bottom: 0, width: 2, background: `linear-gradient(180deg, ${T.gold} 0%, ${T.violet} 100%)`, borderRadius: 2 }} />
              {TIMELINE.map((step, i) => (
                <div key={step.num} style={{ display: "flex", gap: 18, alignItems: "flex-start", marginBottom: i < TIMELINE.length - 1 ? 28 : 0, position: "relative" }}>
                  <div style={{ position: "absolute", left: -37, top: 4, width: 20, height: 20, borderRadius: "50%", background: T.bg, border: `2px solid ${step.accent}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: step.accent }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                      <span style={{ fontFamily: T.fn.mono, fontSize: 10, letterSpacing: "0.25em", color: step.accent, textTransform: "uppercase" }}>{step.day}</span>
                      <span style={{ fontFamily: T.fn.mono, fontSize: 9, letterSpacing: "0.2em", color: T.muted, background: T.surf, border: `1px solid ${T.border}`, padding: "2px 8px", borderRadius: 4 }}>{step.mark}</span>
                    </div>
                    <div style={{ fontFamily: T.fn.display, fontWeight: 700, fontSize: 15, color: T.text, marginBottom: 4, letterSpacing: "-0.01em" }}>{step.title}</div>
                    <div style={{ fontFamily: T.fn.body, fontSize: 13, color: T.muted, lineHeight: 1.7 }}>{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SPONSOR CAROUSEL ── */}
        <section className="sum-reveal" style={{ padding: "clamp(40px,6vw,64px) 0", borderBottom: `1px solid ${T.border}`, overflow: "hidden" }}>
          <div style={{ maxWidth: 1040, margin: "0 auto", paddingLeft: "clamp(16px,4vw,32px)", paddingRight: "clamp(16px,4vw,32px)", marginBottom: 20 }}>
            <div onClick={handleSponsorHeadingClick} style={{ cursor: "default", userSelect: "none" }}>
              <SumSecHeader title={`Destekçilerimiz${cakeHeadingBadge ? " 🎂" : ""}`} label="◈ Sponsors" />
            </div>
            <div style={{ fontFamily: T.fn.mono, fontSize: 9, letterSpacing: "0.2em", color: T.muted, textTransform: "uppercase", marginTop: -16, marginBottom: 20 }}>
              // Destekçi olmak için iletişime geçin
            </div>
          </div>
          <div className="sum-carousel" style={{ overflow: "hidden", paddingBottom: 4 }}>
            <div className="sum-track-left" style={{ paddingLeft: 12 }}>
              {[...SPONSORS_ROW1, ...SPONSORS_ROW1].map((sp, i) => (
                <div key={`r1-${i}`} style={{ background: T.surf, border: `1px solid ${T.border}`, borderRadius: 8, width: 160, height: 64, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
                  <div style={{ fontFamily: T.fn.mono, fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: T.muted }}>{sp.id}</div>
                  <div style={{ fontFamily: T.fn.body, fontSize: 11, color: T.faint }}>{sp.name}</div>
                </div>
              ))}
            </div>
            <div className="sum-track-right" style={{ paddingLeft: 12, marginTop: 10 }}>
              {[...SPONSORS_ROW2, ...SPONSORS_ROW2].map((sp, i) => (
                <div key={`r2-${i}`} style={{ background: T.surf, border: `1px solid ${T.border}`, borderRadius: 8, width: 160, height: 64, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
                  <div style={{ fontFamily: T.fn.mono, fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: T.muted }}>{sp.id}</div>
                  <div style={{ fontFamily: T.fn.body, fontSize: 11, color: T.faint }}>{sp.name}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="sum-reveal" style={{ padding: "clamp(40px,6vw,64px) clamp(16px,4vw,32px)", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ maxWidth: 1040, margin: "0 auto" }}>
            <SumSecHeader title="Sık Sorulan Sorular" label="◈ SSS" />
            <div style={{ borderTop: `1px solid ${T.border}` }}>
              {FAQS.map((f, i) => (
                <div key={f.q} style={{ borderBottom: `1px solid ${T.border}` }}>
                  <button className="sum-faq-btn" onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "18px 0", border: "none", minHeight: 44 }}>
                    <span style={{ fontFamily: T.fn.body, fontSize: 15, color: T.text, fontWeight: 500, textAlign: "left" }}>{f.q}</span>
                    <span style={{ fontFamily: T.fn.mono, fontSize: 18, color: openFaq === i ? T.violetLight : T.muted, transform: openFaq === i ? "rotate(45deg)" : "none", display: "inline-block", transition: "transform .2s, color .15s", flexShrink: 0 }}>+</span>
                  </button>
                  <div className={`sum-faq-body${openFaq === i ? " open" : ""}`}>
                    <div style={{ fontFamily: T.fn.body, fontSize: 14, lineHeight: 1.75, color: T.muted }}>{f.a}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>

      {/* ── Egg 1: Portal cake toast ── */}
      {cakeShowing && (
        <div style={{
          position: "fixed", bottom: 88, right: 24, zIndex: 9000,
          background: "#1a1a0a", border: "1px solid #c9a870", borderRadius: 4,
          padding: "14px 18px", fontFamily: "'Share Tech Mono', monospace",
          fontSize: 12, color: "#c9a870", maxWidth: 240,
          boxShadow: "0 4px 24px rgba(0,0,0,0.6)",
          animation: "portal-egg-in 0.4s ease forwards",
        }}>
          UYARI: Kek gerçek değil. — GlaDOS
          <pre style={{ fontSize: 10, lineHeight: 1.4, color: "#776840", marginTop: 10, marginBottom: 0, whiteSpace: "pre" }}>{`      ___
  __|___|__
 |  KURU  |
 |_________|
    || ||`}</pre>
        </div>
      )}
    </>
  );
}
