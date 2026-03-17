"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useEasterEggs } from "@/components/EasterEggContext";
import Image from "next/image";

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
  gold: "#b8891e",
  goldDim: "#8a6a1a",
  violet: "#6d28d9",
  violetDim: "#3b1f7a",
  violetLight: "#7c3aed",
  fn: {
    display: "'Syne', sans-serif",
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
const SPONSORS: { id: string; name: string; url: string; accent: string; image?: string }[] = [
  { id: "SP-01", name: "Pasaport Pizza Efeler", url: "https://www.pasaportpizza.com/", accent: T.gold, image: "/sponsors/pasaport_logo.png" },
  { id: "SP-02", name: "Romesta Coffee Co.", url: "#", accent: T.violetLight, image: "/sponsors/romesta_logo.jpg" },
  { id: "SP-03", name: "Mónet Coffee • Bakery", url: "https://www.instagram.com/monet.coffeebakery/", accent: T.gold, image: "/sponsors/monet_logo.jpg" }, 
  { id: "SP-04", name: "Pablo Artisan Coffee", url: "https://www.instagram.com/pabloartisancoffee/", accent: T.violetLight, image: "/sponsors/pablo_logo.jpg" },
  { id: "SP-05", name: "Zeybek pilav", url: "https://www.instagram.com/zeybek_pilav/", accent: T.gold, image: "/sponsors/zeybek_logo.jpeg" },
  { id: "SP-06", name: "Aydın Vardar Pastanesi", url: "#", accent: T.violetLight, image: "/sponsors/vardar_logo.jpg" },
  { id: "SP-07", name: "Lades Pilav", url: "https://www.instagram.com/ladespilav/", accent: T.gold, image: "/sponsors/lades_pilav_logo.jpg" },
  { id: "SP-08", name: "Komagene Mimar Sinan", url: "https://www.instagram.com/komagene.m.sinan/", accent: T.violetLight, image: "/sponsors/komagene_logo.jpg" },
  { id: "SP-09", name: "Sponsor Adı", url: "#", accent: T.gold },
  { id: "SP-10", name: "Sponsor Adı", url: "#", accent: T.violetLight },
  { id: "SP-11", name: "Sponsor Adı", url: "#", accent: T.gold },
  { id: "SP-12", name: "Sponsor Adı", url: "#", accent: T.violetLight },
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
    { v: "100+", l: "Katılımcı", sub: "Kayıtlı", accent: T.gold },
    { v: "20+",  l: "Takım",    sub: "Takım",     accent: T.violet },
    { v: "48",  l: "Süre",     sub: "Saat",      accent: T.gold },
    { v: "5+", l: "Konuşmacı", sub: "Konuşmacı", accent: T.violet },
  ];

  type SchedType = "info" | "talk" | "food" | "competition" | "milestone" | "presentation";
  type SchedItem = { time: string; title: string; desc?: string; type: SchedType };

  const SCHEDULE: { day1: SchedItem[]; day2: SchedItem[] } = {
    day1: [
      { time: "10:00", title: "Kayıt",                                                    type: "info" },
      { time: "10:45", title: "Sunucu ile Başlangıç",                                     type: "info" },
      { time: "11:00", title: "1. Konuşmacı",                                             type: "talk" },
      { time: "11:45", title: "Tema Açıklanışı & Başlama",                                type: "milestone" },
      { time: "12:00", title: "Hackathon & Game Jam Başlıyor", desc: "Öğle Yemeği · Network Session", type: "competition" },
      { time: "13:30", title: "2. Konuşmacı",                                             type: "talk" },
      { time: "15:00", title: "3. Konuşmacı",                                             type: "talk" },
      { time: "20:00", title: "Yarışmacı Akşam Yemeği",                                   type: "food" },
    ],
    day2: [
      { time: "02:00", title: "Gece Kırıntısı", desc: "Çorba · Soğuk Sandviç · Kumru",   type: "food" },
      { time: "08:00", title: "Kahvaltı",        desc: "Soğuk Sandviç · Kuru Pasta",      type: "food" },
      { time: "11:00", title: "4. Konuşmacı",                                             type: "talk" },
      { time: "11:45", title: "Konuşma Bitiş",                                            type: "info" },
      { time: "12:00", title: "Hackathon & Game Jam Bitiyor", desc: "Öğle Yemeği · Network Session", type: "competition" },
      { time: "13:00", title: "5. Konuşmacı & Kapanış",                                   type: "talk" },
      { time: "14:00", title: "Sunum Zamanı",                                             type: "presentation" },
      { time: "15:00", title: "Sunum Zamanı (devam)",                                     type: "presentation" },
      { time: "16:00", title: "Sunum Zamanı (devam)",                                     type: "presentation" },
      { time: "17:00", title: "Etkinlik Sonu",                                            type: "milestone" },
    ],
  };

  const FAQS = [
    { q: "Katılım ücretsiz mi?", a: "Evet, tamamen ücretsiz. GDG on Campus Aydın, Oyun & Tasarım Topluluğu ve Huawei Student Developers desteğiyle düzenleniyor." },
    { q: "Tek başıma başvurabilir miyim?", a: "Evet. Eşleşme akışı mevcut — rolüne göre ekip bulmana yardım ediyoruz." },
    { q: "Hackathon ve Game Jam aynı anda mı?", a: "Aydın Gençlik Zirvesi çatısı altında eş zamanlı ilerliyor. İstediğin etkinliği seçebilirsin." },
    { q: "Daha önce hiç katılmadım, uygun muyum?", a: "Kesinlikle. Tüm seviyelere açık. Mentorlar ve rehber içerikler her adımda yanında." },
  ];

  return (
    <>
      <SummitReveal />

      <div className="sum-root">

        {/* ── HERO STRIP ── */}
        <section className="sum-reveal sum-section--hero">
          <div className="sum-inner">
            <div className="sum-hero-eyebrow">AYDIN GENÇLİK ZİRVESİ · 2026</div>
            <h1 className="sum-hero-h1">
              Üç Dünya.<br />
              <span className="sum-hero-grad">Bir Sahne.</span>
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
                <div className="sum-about-card-body">48 saat · Web, mobil, ya da AI<br />Fikir → Prototype → Sunuş</div>
              </div>
              <div className="sum-about-card sum-about-card--jam">
                <div className="sum-about-card-eyebrow sum-about-card-eyebrow--violet">GAME JAM</div>
                <div className="sum-about-card-title">Oyun & Tasarım</div>
                <div className="sum-about-card-body">48 saat · Oyun mekanikleri & sanat<br />Konsept → Playable → Polish</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="sum-reveal sum-section">
          <div className="sum-inner">
            <SumSecHeader title="Rakamlarla Zirve" label="◈ Özet Veriler" />
            <div className="sum-stats-grid">
              {STATS.map((s) => (
                <div key={s.sub} className="sum-stat-card">
                  <div className="sum-stat-sub">{s.sub}</div>
                  <div className="sum-stat-val">{s.v}</div>
                  <div className="sum-stat-lbl">{s.l}</div>
                  <div className="sum-stat-bar" style={{ "--stat-accent": s.accent } as React.CSSProperties} />
                </div>
              ))}
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
            <p className="sum-sched-note">Etkinlik 2 gün sürmektedir · Hackathon ve Game Jam eş zamanlı ilerler</p>
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
              <SumSecHeader title={`Destekçilerimiz${cakeHeadingBadge ? " 🎂" : ""}`} label="◈ Sponsors" />
            </div>
            <div className="sum-sponsors-sub">// Destekçi olmak için iletişime geçin</div>
          </div>
          <div className="sum-carousel">
            <div className="sum-track-left">
              {[...SPONSORS, ...SPONSORS].map((sp, i) => (
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
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="3"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <path d="M21 15l-5-5L5 21"/>
                          </svg>
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
                  <button className="sum-faq-btn" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
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
