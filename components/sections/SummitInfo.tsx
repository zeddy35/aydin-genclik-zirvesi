"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useEasterEggs } from "@/components/EasterEggContext";
import Image from "next/image";
import { ImageIcon, CakeIcon } from "lucide-react";

// ─────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────
const T = {
  bg: "#f0edf8",
  surf: "#faf9fd",
  surfHigh: "#e8e4f4",
  border: "#ddd8ef",
  borderHigh: "#c4bce0",
  text: "#16142a",
  muted: "#5c5778",
  faint: "#c0b9d8",
  gold: "#5BC8F5",
  goldDim: "#3DA8D8",
  violet: "#9240CC",
  violetDim: "#6B2B98",
  violetLight: "#9240CC",
  fn: {
    display: "'Lexend', sans-serif",
    body: "'Lexend', sans-serif",
    mono: "'Share Tech Mono', monospace",
  },
};

// ─────────────────────────────────────────────────────────────
// STANDALONE COUNTDOWN
// ─────────────────────────────────────────────────────────────
export function EventCountdown() {
  const [t, setT] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const calc = () => {
      const diff = new Date("2026-05-05T09:00:00+03:00").getTime() - Date.now();
      if (diff > 0) {
        setT({
          days: Math.floor(diff / 86400000),
          hours: Math.floor((diff / 3600000) % 24),
          minutes: Math.floor((diff / 60000) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      } else {
        setStarted(true);
      }
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, []);

  if (!mounted) return null;

  if (started) {
    return (
      <div className="sum-cd">
        <div className="sum-cd-started">Etkinlik Başladı!</div>
        <div className="sum-cd-date">5 Mayıs 2026 · Aydın Gençlik Zirvesi</div>
      </div>
    );
  }

  return (
    <div className="sum-cd">
      <div className="sum-cd-eyebrow">◈ ETKINLIGE GIRIS ◈</div>
      <div className="sum-cd-date">5 Mayıs 2026 · Aydın Gençlik Zirvesi</div>
      <div className="sum-cd-units">
        {[{ v: t.days, l: "GÜN" }, { v: t.hours, l: "SAAT" }, { v: t.minutes, l: "DAKİKA" }, { v: t.seconds, l: "SANİYE" }].map(({ v, l }, i) => (
          <React.Fragment key={l}>
            {i > 0 && <div className="sum-cd-sep" />}
            <div className="sum-cd-unit">
              <div className="sum-cd-val">{String(v).padStart(2, "0")}</div>
              <div className="sum-cd-lbl">{l}</div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCROLL REVEAL
// ─────────────────────────────────────────────────────────────
function SummitReveal() {
  useEffect(() => {
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
    <div className="sum-sec-hdr">
      <div className="sum-sec-lbl">{label}</div>
      <h2 className="sum-sec-title">{title}</h2>
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
      <text x="24" y="30" textAnchor="middle" fontSize="18" fontWeight="700" fontFamily="Lexend, sans-serif" fill={T.gold}>G</text>
    </svg>
  );
}

function OTTMonogram() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" stroke={T.violetLight} strokeWidth="1.5" fill="none" />
      <circle cx="24" cy="24" r="16" fill="#1a1730" />
      <text x="24" y="30" textAnchor="middle" fontSize="18" fontWeight="700" fontFamily="Lexend, sans-serif" fill={T.violetLight}>O</text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// SPONSOR DATA
// ─────────────────────────────────────────────────────────────
const SPONSORS: { id: string; name: string; url: string; accent: string; image?: string }[] = [
  { id: "SP-01", name: "TÜBİTAK", url: "https://tubitak.gov.tr/tr", accent: T.gold, image: "/sponsors/tubitak_logo.png" },
  { id: "SP-02", name: "Gençlik ve Spor Bakanlığı", url: "https://genclikhizmetleri.gov.tr/", accent: T.violetLight, image: "/sponsors/unides_logo.svg" },
  { id: "SP-03", name: "Adnan Menderes Üniversitesi", url: "https://www.adu.edu.tr/", accent: T.gold, image: "/sponsors/adu_logo.png" },
  { id: "SP-04", name: "Unity", url: "https://unity.com/", accent: T.violetLight, image: "/sponsors/unity_logo.svg" },
];

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export function SummitInfo() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { markEggSeen } = useEasterEggs();

  // ── Egg 4: Among Us (moved from Game Jam SSS) ─────────────
  const susToggleRef = useRef<{ idx: number; count: number }>({ idx: -1, count: 0 });
  const [showSus, setShowSus] = useState(false);
  const susFireRef = useRef(false);

  const handleFaqToggle = useCallback((i: number) => {
    setOpenFaq((prev) => (prev === i ? null : i));
    const cur = susToggleRef.current;
    if (cur.idx !== i) {
      susToggleRef.current = { idx: i, count: 1 };
    } else {
      const next = cur.count + 1;
      susToggleRef.current = { idx: i, count: next };
      if (next >= 6 && !susFireRef.current) {
        susFireRef.current = true;
        setShowSus(true);
        markEggSeen("egg-amogus");
        setTimeout(() => {
          setShowSus(false);
          susFireRef.current = false;
          susToggleRef.current = { idx: -1, count: 0 };
        }, 4500);
      }
    }
  }, [markEggSeen]);

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
    { v: "100+", l: "Katılımcı", sub: "Kayıtlı", accent: T.gold },
    { v: "20+",  l: "Takım",    sub: "Takım",     accent: T.violet },
    { v: "48",  l: "Süre",     sub: "Saat",      accent: T.gold },
    { v: "5+", l: "Konuşmacı", sub: "Konuşmacı", accent: T.violet },
  ];

  type SchedType = "info" | "talk" | "food" | "competition" | "milestone" | "presentation" | "devblock";
  type SchedItem = { time: string; title: string; desc?: string; type: SchedType };

  const SCHEDULE: { day1: SchedItem[]; day2: SchedItem[] } = {
    day1: [
      { time: "10:00", title: "Check-in / Takım Eşleşmesi",                              type: "info" },
      { time: "11:00", title: "Konuşma Başlıyor", desc: "1. Konuşmacı",                  type: "talk" },
      { time: "11:45", title: "Game Jam & Hackathon Tema Açıklanışı",                     type: "milestone" },
      { time: "12:00", title: "Hackathon & Game Jam Başlangıç",                           type: "competition" },
      { time: "13:00", title: "Öğle Yemeği",                                              type: "food" },
      { time: "15:00", title: "2. Konuşmacı",                                             type: "talk" },
      { time: "16:00 – 00:00", title: "Geliştirme Saati", desc: "Takımlar projelerini geliştiriyor", type: "devblock" },
    ],
    day2: [
      { time: "00:00 – 11:00", title: "Geliştirme Saati", desc: "Takımlar projelerini geliştiriyor", type: "devblock" },
      { time: "11:00", title: "Konuşma Başlıyor", desc: "3. Konuşmacı — Berk Durmuş Bayar", type: "talk" },
      { time: "12:00", title: "Hackathon Bitiş",                                             type: "competition" },
      { time: "13:00", title: "Konuşma Başlıyor", desc: "4. Konuşmacı",      type: "talk" },
      { time: "14:00", title: "Hackathon Sunum Başlangıcı",                                  type: "presentation" },
      { time: "17:00", title: "Game Jam Bitiş",                                              type: "competition" },
      { time: "17:15", title: "Game Jam Sunum Başlangıcı",                                   type: "presentation" },
      { time: "18:30", title: "Etkinlik Sonu",                                               type: "milestone" },
    ],
  };

  const FAQS = [
    { q: "Katılım ücretsiz mi?", a: "Evet, tamamen ücretsiz. GDG on Campus Aydın, Oyun & Tasarım Topluluğu ve Huawei Student Developers desteğiyle düzenleniyor." },
    { q: "Hackathon, Game Jam ve konuşmacılar aynı anda mı?", a: "Aydın Gençlik Zirvesi çatısı altında eş zamanlı ilerliyor. İstediğin etkinliğe katılabilirsin. Sadece Jam ve Hackathon'a aynı anda başvuramazsın." },
    { q: "Daha önce hiç katılmadım, uygun muyum?", a: "Kesinlikle. Tüm seviyelere açık. Mentorlar ve rehber içerikler her adımda yanında." },
  ];

  return (
    <>
      <SummitReveal />

      <div className="sum-root">

        {/* ── HERO STRIP ── */}
        <section className="sum-reveal sum-section--hero">
          <div className="sum-inner">
            <div className="sum-hero-eyebrow">ÜÇ KULÜP, ÜÇ ETKİNLİK · 2026</div>
            <h1 className="sum-hero-h1 !text-8xl">
              Aydın<br />
              <span className="sum-hero-grad">Gençlik</span>
              <br />
              <span>Zirvesi</span>
            </h1>
            <p className="sum-hero-desc">
              Gençlerin teknoloji, yaratıcılık ve yenilikçiliğini sergileyebilecekleri bir platform. GDG on Campus Aydın, Oyun ve Tasarım Topluluğu ve Huawei Student Developers iş birliğiyle, üç etkinlik — bir çatı altında.
            </p>
            <div className="sum-hero-cd">
              <EventCountdown />
            </div>
          </div>
        </section>

        {/* ── ABOUT ── */}
        <section className="sum-reveal sum-section">
          <div className="sum-inner">
            <SumSecHeader title="Zirve Nedir?" label="◈ Genel Bakış" />
            <p className="sum-about-txt">
              <strong>Aydın Gençlik Zirvesi</strong>, teknoloji ve tasarım alanında yetkinlik geliştirmek isteyen öğrencilerin bir araya geldiği 48 saatlik yoğun üretim etkinliğidir. <strong>GDG on Campus Aydın</strong>, <strong>Oyun ve Tasarım Topluluğu</strong> ve <strong>Huawei Student Developers</strong> ortaklığında gerçekleştirilen zirvede, Hackathon ve Game Jam pist pist ilerliyor. Baştan sona mentoring, network, ve gerçek dünya tecrübesi sana kazandırıyoruz.
            </p>
            <div className="sum-about-cards">
              <div className="sum-about-card sum-about-card--hack">
                <div className="sum-about-card-eyebrow sum-about-card-eyebrow--gold">HACKATHON</div>
                <div className="sum-about-card-title">Yazılım & İnnova­syon</div>
                <div className="sum-about-card-body">26 saat · Web, mobil, ya da AI<br />Fikir → Prototype → Sunuş</div>
              </div>
              <div className="sum-about-card sum-about-card--jam">
                <div className="sum-about-card-eyebrow sum-about-card-eyebrow--violet">GAME JAM</div>
                <div className="sum-about-card-title">Oyun & Tasarım</div>
                <div className="sum-about-card-body">30 saat · Oyun mekanikleri & sanat<br />Konsept → Playable → Polish</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── ORGANIZERS ── */}
        <section className="sum-reveal sum-section">
          <div className="sum-inner">
            <SumSecHeader title="Ana Organizatörler" label="◈ Yetki Sahipleri" />
            <div className="sum-org-grid">

              {/* GDG on Campus Aydın */}
              <div className="sum-org-card" style={{ "--org-accent": T.gold } as React.CSSProperties}>
                <div className="sum-org-top-bar" />
                <div className="sum-org-inner-hdr">
                  <Image src="/logos/gdg-logo.svg" alt="GDG Logo" width={40} height={40} />
                  <div>
                    <div className="sum-org-name">GDG on Campus Aydın</div>
                    <div className="sum-org-role sum-org-role--gold">Google Developer Group</div>
                  </div>
                </div>
                <p className="sum-org-desc">
                  Google&apos;ın teknoloji topluluğu. Öğrenciler için, öğrencilerle. Yazılım, ürün geliştirme ve inovasyon odaklı etkinlikler düzenliyoruz.
                </p>
              </div>

              {/* Oyun ve Tasarım Topluluğu */}
              <div className="sum-org-card" style={{ "--org-accent": T.violet } as React.CSSProperties}>
                <div className="sum-org-top-bar" />
                <div className="sum-org-inner-hdr">
                  <Image src="/logos/ott-logo.png" alt="OTT Logo" width={40} height={40} />
                  <div>
                    <div className="sum-org-name">OTT</div>
                    <div className="sum-org-role sum-org-role--violet">Oyun ve Tasarım Topluluğu</div>
                  </div>
                </div>
                <p className="sum-org-desc">
                  Tasarım ve oyun geliştirme odaklı öğrenci kulübü. Yaratıcılığı ve teknik beceriyi buluşturarak yenilikçi projeler hayata geçiriyoruz.
                </p>
              </div>

              {/* Huawei Student Developers */}
              <div className="sum-org-card" style={{ "--org-accent": T.violetLight } as React.CSSProperties}>
                <div className="sum-org-top-bar" />
                <div className="sum-org-inner-hdr">
                  <Image src="/logos/hsd-logo.svg" alt="HSD Logo" width={40} height={40} />
                  <div>
                    <div className="sum-org-name">HSD</div>
                    <div className="sum-org-role sum-org-role--violet">HUAWEI Student Developers</div>
                  </div>
                </div>
                <p className="sum-org-desc">
                  Huawei&apos;nin öğrenci topluluğu. Teknolojiye erişimi demokratikleştirmeye ve genç yetenekleri desteklemeye odaklanıyoruz.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── SCHEDULE ── */}
        <section className="sum-reveal sum-section">
          <div className="sum-inner">
            <SumSecHeader title="Program Akışı" label="◈ Zaman Çizelgesi" />
            <p className="sum-sched-note">Etkinlik 2 gün sürmektedir · Hackathon ve Game Jam eş zamanlı başlar</p>
            <div className="sum-sched-grid">
              {([
                { label: "1. Gün", key: "day1" as const },
                { label: "2. Gün", key: "day2" as const },
              ]).map(({ label, key }) => (
                <div key={key} className="sum-sched-col">
                  <div className="sum-sched-col-label">{label}</div>
                  {SCHEDULE[key].map((item, i) => (
                    <div key={i} className={`sum-sched-row sum-sched-row--${item.type}`}>
                      <div className="sum-sched-time">{item.time}</div>
                      <div className="sum-sched-content">
                        <div className="sum-sched-title">{item.title}</div>
                        {item.desc && <div className="sum-sched-desc">{item.desc}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SPONSORS ── */}
        <section className="sum-reveal sum-section--carousel">
          <div className="sum-sponsors-hdr-wrap">
            <div onClick={handleSponsorHeadingClick} className="sum-sponsors-click">
              <SumSecHeader title={`Destekçilerimiz${cakeHeadingBadge ? <CakeIcon /> : ""}`} label="◈ Sponsors" />
            </div>
            <div className="sum-sponsors-sub">// Destekçi olmak için iletişime geçin</div>
          </div>
          <div className="sum-carousel">
            <div className="sum-track-left">
              {[...SPONSORS, ...SPONSORS, ...SPONSORS, ...SPONSORS].map((sp, i) => (
                <a
                  key={`sp-${i}`}
                  href={sp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sum-sponsor-card"
                  style={{ "--sp-accent": sp.accent } as React.CSSProperties}
                >
                  <div
                    className="sum-sponsor-image-area"
                  >
                    {sp.image ? (
                      <img
                        src={sp.image}
                        alt={sp.name}
                        className="sum-sponsor-img"
                      />
                    ) : (
                      <div className="sum-sponsor-placeholder" style={{ color: sp.accent }}>
                        <div className="sum-sponsor-placeholder-icon" style={{ border: `2px solid ${sp.accent}66` }}>
                          <ImageIcon size={32} strokeWidth={1.5} />
                        </div>
                        <span className="sum-sponsor-placeholder-text">Logo</span>
                      </div>
                    )}
                  </div>
                  <div className="sum-sponsor-name">{sp.name}</div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="sum-reveal sum-section">
          <div className="sum-inner">
            <SumSecHeader title="Sık Sorulan Sorular" label="◈ S.S.S." />
            <div className="sum-faq-list">
              {FAQS.map((f, i) => (
                <div key={f.q} className="sum-faq-item">
                  <button className="sum-faq-btn" onClick={() => handleFaqToggle(i)}>
                    <span className="sum-faq-q">{f.q}</span>
                    <span className={`sum-faq-icon${openFaq === i ? " sum-faq-icon--open" : " sum-faq-icon--closed"}`}>+</span>
                  </button>
                  <div className={`sum-faq-body${openFaq === i ? " open" : ""}`}>
                    <div className="sum-faq-ans">{f.a}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>

      {/* ── Egg 4: Among Us ── */}
      {showSus && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: '#000', zIndex: 9998, pointerEvents: 'none' }}>
          <div style={{ position: 'fixed', top: '10vh', left: 0, width: '50vw', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, pointerEvents: 'none' }}>
            <h1 style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 'clamp(20px, 4vw, 36px)', color: '#ff0000', textShadow: '0 0 60px rgba(255,0,0,1), 4px 4px 0 #000, -4px -4px 0 #000', letterSpacing: '0.15em', margin: 0, padding: '0 20px', lineHeight: 1.4, textAlign: 'center' }}>
              IMPOSTER IS SUS
            </h1>
          </div>
          <div style={{ position: 'fixed', top: '50%', left: '50vw', marginTop: '-100px', zIndex: 9999, pointerEvents: 'none', animation: 'sus-walk-left-panel 4s linear forwards' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/amongus/red-walk.gif" alt="sus" style={{ display: 'block', height: '200px', width: 'auto', imageRendering: 'pixelated', transform: 'scaleX(-1)' }} />
          </div>
          <style>{`@keyframes sus-walk-left-panel { from { transform: translateX(0) scaleX(-1); } to { transform: translateX(-50vw) scaleX(-1); } }`}</style>
        </div>
      )}

      {/* ── Egg 1: Portal cake toast ── */}
      {cakeShowing && (
        <div className="sum-egg-toast">
          UYARI: Kek gerçek değil. — GlaDOS
          <pre>{`      ___
  __|___|__
 |  KURU  |
 |_________|
    || ||`}</pre>
        </div>
      )}
    </>
  );
}
