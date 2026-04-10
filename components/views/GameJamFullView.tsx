"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Timer,
  Puzzle,
  Trophy,
  Gamepad2,
  Gamepad,
  Ghost,
  Zap,
  ClipboardList,
  Star,
  Search,
  Palette,
  Settings,
  Target,
  Image as ImageIcon,
  Monitor,
  Music,
  HelpCircle,
  Medal,
  Rocket,
} from "lucide-react";
import styles from "./GameJamFullView.module.css";

interface GameJamFullViewProps {
  onBack: () => void;
}

// ── PIXEL EXPLOSION (CTA bg deco only) ──
function PixelBurst({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g>
      <rect x={x - 1} y={y - 3} width="2" height="2" fill={color} opacity="0.6" />
      <rect x={x + 2} y={y - 2} width="2" height="2" fill={color} opacity="0.5" />
      <rect x={x - 3} y={y} width="2" height="2" fill={color} opacity="0.4" />
      <rect x={x + 3} y={y + 1} width="2" height="2" fill={color} opacity="0.5" />
      <rect x={x} y={y + 3} width="2" height="2" fill={color} opacity="0.6" />
    </g>
  );
}

// ── COUNTDOWN ──
function GameCountdown() {
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
    <div className={styles.countdownWrap}>
      <div className={styles.countdownLabel}>— Başlamasına Kalan —</div>
      <div className={styles.countdownUnits}>
        {[
          { v: t.days, l: "GÜN" },
          { v: t.hours, l: "SAAT" },
          { v: t.minutes, l: "DAK" },
          { v: t.seconds, l: "SN" },
        ].map(({ v, l }, i) => (
          <React.Fragment key={l}>
            {i > 0 && <span className={styles.countdownColon}>:</span>}
            <div className={styles.countdownUnit}>
              <div className={styles.countdownValue}>{String(v).padStart(2, "0")}</div>
              <div className={styles.countdownUnitLabel}>{l}</div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ── SCROLL REVEAL ──
function GJReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".gj-reveal");
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            obs.unobserve(e.target);
          }
        }),
      { threshold: 0.06 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
  return null;
}

// ── MAIN ──
export function GameJamFullView({ onBack }: GameJamFullViewProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleFaqToggle = useCallback((i: number) => {
    setOpenFaq((prev) => (prev === i ? null : i));
  }, []);

  const ROLES = [
    {
      Icon: Monitor,
      title: "Geliştirici",
      desc: "Oyun motoru, kod tabanı, fizik sistemi. Unity, Godot, Pygame — seçim senin.",
      color: "#dbeafe",
      border: "#3b82f6",
      shadow: "#3b82f6",
    },
    {
      Icon: Palette,
      title: "Sanatçı",
      desc: "Sprite, karakter, ortam. Pixel art mı? 3D mi? Her stil kabul.",
      color: "#fce7f3",
      border: "#ec4899",
      shadow: "#ec4899",
    },
    {
      Icon: Music,
      title: "Ses Tasarımcısı",
      desc: "SFX, müzik, atmosfer. Ses olmadan oyun yarım.",
      color: "#d1fae5",
      border: "#10b981",
      shadow: "#10b981",
    },
    {
      Icon: Puzzle,
      title: "Game Designer",
      desc: "Mekanik, denge, eğlence döngüsü. Oyunun kalbi senin elinde.",
      color: "#fef3c7",
      border: "#f59e0b",
      shadow: "#f59e0b",
    },
  ];

  const FEATURES = [
    {
      Icon: Timer,
      title: "30 Saatlik Maraton",
      desc: "Hızlı düşün, hızlı geliştir, hızlı sun. Jam ruhu: 'ship it!'",
      bullets: ["Takım kur, prototip geliştir", "30 saatte sıfırdan demo", "Her motor, her dil kabul"],
    },
    {
      Icon: Puzzle,
      title: "Takım & Roller",
      desc: "Coder, artist, designer, sound... Her rol bir 'party member'.",
      bullets: ["1–4 kişilik takımlar", "Solo katılım + eşleşme akışı", "Mentor & atölye desteği"],
    },
    {
      Icon: Trophy,
      title: "Ödüller & Eğlence",
      desc: "Sürpriz ödüller, mini-challenge'lar, sahnede demo keyfi.",
      bullets: ["Nakit & teknik ödüller", "Anlık mini-challenge'lar", "Sahne demo sunumu"],
    },
  ];

  const CRITERIA = [
    { Icon: Palette,    title: "Yaratıcılık & Özgünlük", desc: "Tema nasıl yorumlandı? Fikir ne kadar özgün ve cesur?", score: "25 PT" },
    { Icon: Settings,   title: "Teknik Uygulama",         desc: "Oyun çalışıyor mu? Mekanikler tutarlı mı? Bug oranı?",  score: "25 PT" },
    { Icon: Gamepad2,   title: "Oynanabilirlik & Eğlence", desc: "Demo keyifli mi? Oynamaya devam ettiriyor mu?",         score: "25 PT" },
    { Icon: Target,     title: "Temaya Uyum",              desc: "Tema ne kadar iyi ve özgün biçimde işlendi?",           score: "15 PT" },
    { Icon: ImageIcon,  title: "Sunum & Görsel",           desc: "Görsel bütünlük, ses tasarımı ve genel atmosfer.",      score: "10 PT" },
  ];

  const FAQS = [
    {
      q: "Hangi oyun motorunu kullanabilirim?",
      a: "Unity, Godot, Pygame, GameMaker, Phaser — istediğin her şey. Kısıt yok.",
    },
    {
      q: "Takım kaç kişi olabilir?",
      a: "1-4 kişi arası. Tek başına da katılabilirsin, eşleşme akışı var.",
    },
    {
      q: "Tema ne zaman açıklanıyor?",
      a: "Jam başlangıcında tüm takımlara aynı anda duyurulacak. Sürpriz!",
    },
    {
      q: "Önceden oyun geliştirebilir miyim?",
      a: "Hayır. Tema açıklandıktan sonra sıfırdan başlanmalı. Assets hazır olabilir.",
    },
    {
      q: "Deneyimim yok, katılabilir miyim?",
      a: "Kesinlikle. Mentor desteği, atölye ve rehber içerikler mevcut olacak.",
    },
  ];

  return (
    <>
      <GJReveal />

      <div className={styles.wrapper}>
        {/* ── STICKY BACK BUTTON ── */}
        <div className={styles.topNav}>
          <button onClick={onBack} className={styles.backBtn} aria-label="Geri dön">
            <ArrowLeft size={15} strokeWidth={2.5} />
            Geri
          </button>
        </div>

        <div className={styles.container}>

          {/* ── HERO ── */}
          <section className={`gj-reveal ${styles.heroSection}`}>
            <div className={styles.heroTitleWrapper}>
              <div className={styles.heroStarTL}><Star size={10} fill="#f472b6" color="#f472b6" /></div>
              <div className={styles.heroStarTR}><Star size={8} fill="#34d399" color="#34d399" /></div>
              <div className={styles.heroStarBL}><Star size={7} fill="#fbbf24" color="#fbbf24" /></div>
              <h1 className={styles.heroTitlePixel}>
                Game Jam Aydın
              </h1>
            </div>
            <div className={styles.heroTagline}>★ PLAYER 1 READY? ★</div>

            <div className={styles.countdownBox}>
              <GameCountdown />
            </div>
          </section>

          {/* ── FEATURE CARDS ── */}
          <section className={`gj-reveal ${styles.featureGrid}`}>
            {FEATURES.map((f) => (
              <div key={f.title} className={styles.featureCard}>
                <div className={styles.featureIcon}><f.Icon size={28} strokeWidth={1.5} /></div>
                <div className={styles.featureTitle}>{f.title}</div>
                <div className={styles.featureDesc}>{f.desc}</div>
                <ul className={styles.featureBullets}>
                  {f.bullets.map((b) => (
                    <li key={b} className={styles.featureBulletItem}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>

          {/* ── TEMEL BİLGİLER ── */}
          <section className={`gj-reveal ${styles.infoSection}`}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Temel Bilgiler</h2>
              <div className={styles.infoEmojis}>
                <Gamepad2 size={16} color="#7c3aed" />
                <Gamepad size={16} color="#7c3aed" />
                <Ghost size={16} color="#7c3aed" />
              </div>
            </div>
            <div className={styles.infoGrid}>
              {[
                { label: "BAŞLAMA TARİHİ", value: "5 Mayıs", color: "#ede9fe", border: "#c4b5fd" },
                { label: "YER",            value: "Aydın",   color: "#fce7f3", border: "#f9a8d4" },
                { label: "SÜRE",           value: "30 Saat", color: "#d1fae5", border: "#6ee7b7" },
                { label: "KATILIM",        value: "Ücretsiz",color: "#fef3c7", border: "#fde68a" },
              ].map((item) => (
                <div
                  key={item.label}
                  className={styles.infoCard}
                  style={{ "--card-bg": item.color, "--card-border": item.border } as React.CSSProperties}
                >
                  <div className={styles.infoCardLabel}>{item.label}</div>
                  <div className={styles.infoCardValue}>{item.value}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── NEDİR? ── */}
          <section className={`gj-reveal ${styles.whatIsSection}`}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Game Jam Nedir?</h2>
              <div className={styles.infoEmojis}>
                <Gamepad2 size={16} color="#7c3aed" />
                <Zap size={16} color="#7c3aed" />
                <Gamepad size={16} color="#7c3aed" />
              </div>
            </div>
            <p className={styles.whatIsText}>
              Aydın Game Jam, belirlenen bir tema etrafında 30 saat içinde sıfırdan oyun geliştirdiğin yaratıcı bir etkinliktir. Tek başına ya da 5 kişilik bir ekiple katılabilirsin. Önemli olan bitmemiş ama çalışan bir prototip ortaya çıkarmak; mükemmel değil, gerçek.
            </p>
            <p className={styles.whatIsText}>
              Tema başlangıçta açıklanır; o andan itibaren fikirler, kodlar ve pikseller birbirini kovalamaya başlar. Mentor desteği, atölyeler ve birlikte üretmenin enerjisiyle dolu bir hafta sonu seni bekliyor.
            </p>
          </section>

          {/* ── KURALLAR ── */}
          <section className={`gj-reveal ${styles.rulesSection}`}>
            <div className={styles.sectionHeaderRow}>
              <h2 className={styles.sectionTitleLg} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ClipboardList size={22} color="#7c3aed" /> Kurallar
              </h2>
              <Star size={10} fill="#a78bfa" color="#a78bfa" />
            </div>
            <div className={styles.rulesList}>
              {[
                { n: "01", text: "Oyun, tema açıklandıktan sonra sıfırdan geliştirilmelidir. Önceden yapılmış oyunlar kabul edilmez." },
                { n: "02", text: "Takımlar 1–4 kişiden oluşabilir. Solo katılım tamamen serbesttir." },
                { n: "03", text: "Her oyun motoru, programlama dili ve araç seti kabul edilir. Kısıt yok." },
                { n: "04", text: "Daha önce hazırlanmış asset'ler (ses, grafik, font vb.) kullanılabilir; ancak hazır oyun tabanları kullanılamaz." },
                { n: "05", text: "Jam'e katılan herkes diğer takımların oyunlarına saygı göstermeli; yapıcı geri bildirim kültürü esastır." },
                { n: "06", text: "Süre dolduğunda yapılan son build geçerli sayılır. Teslim linki zamanında paylaşılmalıdır." },
              ].map((r) => (
                <div key={r.n} className={styles.rulesItem}>
                  <span className={styles.rulesNum}>{r.n}</span>
                  <span className={styles.rulesText}>{r.text}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── JÜRİLER ── */}
          <section className={`gj-reveal ${styles.jurySection}`}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Jüriler</h2>
              <div className={styles.infoEmojis}>
                <Star size={16} color="#7c3aed" />
                <Search size={16} color="#7c3aed" />
                <Trophy size={16} color="#7c3aed" />
              </div>
            </div>
            <div className={styles.juryGrid}>
              {[0, 1, 2].map((i) => (
                <div key={i} className={styles.juryCard}>
                  <div className={styles.juryAvatar}>?</div>
                  <div className={styles.juryName}>— Yakında —</div>
                  <div className={styles.juryRole}>Açıklanacak</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── DEĞERLENDİRME KRİTERLERİ ── */}
          <section className={`gj-reveal ${styles.criteriaSection}`}>
            <div className={styles.sectionHeaderRow}>
              <h2 className={styles.sectionTitleLg} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Medal size={22} color="#7c3aed" /> Değerlendirme Kriterleri
              </h2>
              <Star size={10} fill="#fbbf24" color="#fbbf24" />
            </div>
            <div className={styles.criteriaGrid}>
              {CRITERIA.map((c) => (
                <div key={c.title} className={styles.criteriaCard}>
                  <div className={styles.criteriaIcon}><c.Icon size={22} strokeWidth={1.5} /></div>
                  <div className={styles.criteriaTitleRow}>
                    <span className={styles.criteriaTitle}>{c.title}</span>
                    <span className={styles.criteriaScore}>{c.score}</span>
                  </div>
                  <p className={styles.criteriaDesc}>{c.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── ROLLER ── */}
          <section className={`gj-reveal ${styles.rolesSection}`}>
            <div className={styles.sectionHeaderRow}>
              <h2 className={styles.sectionTitleLg}>Takımda Rolün Ne?</h2>
              <Star size={12} fill="#f472b6" color="#f472b6" />
            </div>
            <div className={styles.rolesGrid}>
              {ROLES.map((r) => (
                <div
                  key={r.title}
                  className={styles.roleCard}
                  style={{
                    "--role-bg": r.color,
                    "--role-border": r.border,
                    "--role-shadow": r.shadow,
                  } as React.CSSProperties}
                >
                  <span className={styles.equipBadge}>[ EQUIP ]</span>
                  <div className={styles.roleEmoji}><r.Icon size={32} strokeWidth={1.5} color={r.border} /></div>
                  <div className={styles.roleTitle}>{r.title}</div>
                  <div className={styles.roleDesc}>{r.desc}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── FAQ ── */}
          <section className={`gj-reveal ${styles.faqSection}`}>
            <div className={styles.faqHeaderRow}>
              <h2 className={styles.sectionTitleLg} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <HelpCircle size={22} color="#7c3aed" /> Quest Log
              </h2>
              <div className={styles.faqHeaderLabel}>AKLINDAKI SORULAR</div>
            </div>
            <div className={styles.faqList}>
              {FAQS.map((f, i) => (
                <div key={f.q} className={styles.faqItem}>
                  <button onClick={() => handleFaqToggle(i)} className={styles.faqBtn}>
                    <span className={styles.faqQuestion}>{f.q}</span>
                    <span className={`${styles.faqArrow}${openFaq === i ? ` ${styles.faqArrowOpen}` : ""}`}>+</span>
                  </button>
                  <div className={`${styles.faqBody}${openFaq === i ? ` ${styles.faqBodyOpen}` : ""}`}>
                    <div className={styles.faqAnswer}>{f.a}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── CTA BANNER ── */}
          <section className={`gj-reveal ${styles.ctaBanner}`}>
            <div className={styles.ctaScanline} />
            <div className={styles.ctaBgDeco}>
              <svg width="100%" height="100%">
                {Array.from({ length: 18 }, (_, i) => (
                  <rect
                    key={i}
                    x={(i * 52) % 800}
                    y={(i * 31) % 160}
                    width="4"
                    height="4"
                    rx="1"
                    fill="#ffffff"
                    opacity={0.04 + (i % 3) * 0.03}
                  />
                ))}
                <PixelBurst x={50}  y={40} color="#ddd6fe" />
                <PixelBurst x={750} y={30} color="#f9a8d4" />
                <PixelBurst x={400} y={20} color="#6ee7b7" />
              </svg>
            </div>
            <div className={styles.ctaContent}>
              <div className={styles.ctaIcon}><Gamepad2 size={36} strokeWidth={1.5} color="white" /></div>
              <h3 className={styles.ctaTitle}>30 saatin var. Ne inşa edeceksin?</h3>
              <p className={styles.ctaDesc}>
                Takımını kur, temayı bekle, oyununu yap. Kazanmak değil,{" "}
                <strong className={styles.ctaDescStrong}>üretmek</strong> burada kural.
              </p>
              <div className={styles.ctaButtons}>
                <Link href="/auth/register" className={styles.btnPrimaryWhite}>
                  Hemen Başvur <Rocket size={16} />
                </Link>
              </div>
            </div>
          </section>

        </div>
      </div>

    </>
  );
}
