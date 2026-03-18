"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import styles from "./GameJamFullView.module.css";

interface GameJamFullViewProps {
  onBack: () => void;
}

// ── PIXEL STAR DECORATION ──
function PixelStar({ size = 8, color = "#a78bfa" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" fill="none">
      <rect x="3" y="0" width="2" height="2" fill={color} />
      <rect x="3" y="6" width="2" height="2" fill={color} />
      <rect x="0" y="3" width="2" height="2" fill={color} />
      <rect x="6" y="3" width="2" height="2" fill={color} />
      <rect x="3" y="3" width="2" height="2" fill={color} />
    </svg>
  );
}

// ── CONTROLLER ICON ──
function ControllerIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="7" width="20" height="12" rx="5" fill="#7c3aed" />
      <rect x="5" y="11" width="2" height="4" rx="1" fill="#ddd6fe" />
      <rect x="4" y="12" width="4" height="2" rx="1" fill="#ddd6fe" />
      <circle cx="16" cy="12" r="1.5" fill="#34d399" />
      <circle cx="18.5" cy="13.5" r="1.5" fill="#f472b6" />
      <circle cx="13.5" cy="13.5" r="1.5" fill="#fbbf24" />
      <circle cx="16" cy="15" r="1.5" fill="#60a5fa" />
      <rect x="9" y="9" width="6" height="2" rx="1" fill="#4c1d95" />
    </svg>
  );
}

// ── PIXEL EXPLOSION ──
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
      emoji: "💻",
      title: "Geliştirici",
      desc: "Oyun motoru, kod tabanı, fizik sistemi. Unity, Godot, Pygame — seçim senin.",
      color: "#dbeafe",
      border: "#3b82f6",
      shadow: "#3b82f6",
    },
    {
      emoji: "🎨",
      title: "Sanatçı",
      desc: "Sprite, karakter, ortam. Pixel art mı? 3D mi? Her stil kabul.",
      color: "#fce7f3",
      border: "#ec4899",
      shadow: "#ec4899",
    },
    {
      emoji: "🎵",
      title: "Ses Tasarımcısı",
      desc: "SFX, müzik, atmosfer. Ses olmadan oyun yarım.",
      color: "#d1fae5",
      border: "#10b981",
      shadow: "#10b981",
    },
    {
      emoji: "🧩",
      title: "Game Designer",
      desc: "Mekanik, denge, eğlence döngüsü. Oyunun kalbi senin elinde.",
      color: "#fef3c7",
      border: "#f59e0b",
      shadow: "#f59e0b",
    },
  ];

  const FEATURES = [
    {
      icon: "⏱️",
      title: "48 Saatlik Maraton",
      desc: "Hızlı düşün, hızlı geliştir, hızlı sun. Jam ruhu: 'ship it!'",
      bullets: ["Takım kur, prototip geliştir", "48 saatte sıfırdan demo", "Her motor, her dil kabul"],
    },
    {
      icon: "🧩",
      title: "Takım & Roller",
      desc: "Coder, artist, designer, sound... Her rol bir 'party member'.",
      bullets: ["1–5 kişilik takımlar", "Solo katılım + eşleşme akışı", "Mentor & atölye desteği"],
    },
    {
      icon: "🏆",
      title: "Ödüller & Eğlence",
      desc: "Sürpriz ödüller, mini-challenge'lar, sahnede demo keyfi.",
      bullets: ["Nakit & teknik ödüller", "Anlık mini-challenge'lar", "Sahne demo sunumu"],
    },
  ];

  const FAQS = [
    {
      q: "Hangi oyun motorunu kullanabilirim?",
      a: "Unity, Godot, Pygame, GameMaker, Phaser — istediğin her şey. Kısıt yok.",
    },
    {
      q: "Takım kaç kişi olabilir?",
      a: "1-5 kişi arası. Tek başına da katılabilirsin, eşleşme akışı var.",
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
        {/* ── BG DECORATION ── */}
        <div className={styles.bgDecoration}>
          <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
            <defs>
              <radialGradient id="gj-radial1" cx="10%" cy="20%" r="50%">
                <stop offset="0%" stopColor="#ddd6fe" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#f5f3ff" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="gj-radial2" cx="90%" cy="80%" r="50%">
                <stop offset="0%" stopColor="#fce7f3" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#f5f3ff" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#gj-radial1)" />
            <rect width="100%" height="100%" fill="url(#gj-radial2)" />
            {Array.from({ length: 12 }, (_, i) =>
              Array.from({ length: 8 }, (_, j) => (
                <rect
                  key={`${i}-${j}`}
                  x={i * 120 + 40}
                  y={j * 110 + 30}
                  width="3"
                  height="3"
                  rx="1"
                  fill="#c4b5fd"
                  opacity="0.3"
                />
              ))
            )}
            <PixelBurst x={80} y={120} color="#a78bfa" />
            <PixelBurst x={340} y={60} color="#f472b6" />
            <PixelBurst x={600} y={200} color="#34d399" />
            <PixelBurst x={200} y={400} color="#fbbf24" />
          </svg>
        </div>

        <div className={styles.container}>
          {/* ── TOP NAV ── */}
          <div className={styles.topNav}>
            <div className={styles.topNavInfo}>
              <div className={styles.topNavBadge}>
                <ControllerIcon size={16} />
                <span className={styles.topNavBadgeText}>JAM MODE · 48 SAAT</span>
              </div>
              <span className={styles.topNavSubtext}>INSERT COIN TO CONTINUE</span>
            </div>
            <button onClick={onBack} className={styles.backBtn} aria-label="Geri dön">
              Geri →
            </button>
          </div>

          {/* ── HERO ── */}
          <section className={`gj-reveal ${styles.heroSection}`}>
            <div className={styles.heroIcon}>🎮</div>
            <div className={styles.heroTitleWrapper}>
              <div className={styles.heroStarTL}><PixelStar size={10} color="#f472b6" /></div>
              <div className={styles.heroStarTR}><PixelStar size={8} color="#34d399" /></div>
              <div className={styles.heroStarBL}><PixelStar size={7} color="#fbbf24" /></div>
              <h1 className={styles.heroTitle}>
                Aydın{" "}
                <span className={styles.heroTitleGradient}>Game Jam</span>
              </h1>
            </div>
            <p className={styles.heroDesc}>
              48 saat boyunca harika oyunlar geliştir, yetenekli takımlar kur ve fikirlerini
              dünyaya sun. Tam bir{" "}
              <em className={styles.heroDescEm}>"cartoonish chaos"</em>{" "}
              — ama üretken.
            </p>
            <div className={styles.heroTagline}>★ PLAYER 1 READY? ★</div>

            <div className={styles.countdownBox}>
              <GameCountdown />
            </div>

            <div className={styles.heroCta}>
              <Link href="/auth/register" className={styles.btnPrimary}>Başvur 🚀</Link>
              <button className={styles.btnOutline}>Detayları Gör</button>
            </div>
          </section>

          {/* ── FEATURE CARDS ── */}
          <section className={`gj-reveal ${styles.featureGrid}`}>
            {FEATURES.map((f) => (
              <div key={f.title} className={styles.featureCard}>
                <div className={styles.featureIcon}>{f.icon}</div>
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
                {["🎮", "🕹️", "👾"].map((e) => (
                  <span key={e} style={{ fontSize: 16 }}>{e}</span>
                ))}
              </div>
            </div>
            <div className={styles.infoGrid}>
              {[
                { label: "BAŞLAMA TARİHİ", value: "Yakında", color: "#ede9fe", border: "#c4b5fd" },
                { label: "YER",            value: "Aydın",   color: "#fce7f3", border: "#f9a8d4" },
                { label: "SÜRE",           value: "48 Saat", color: "#d1fae5", border: "#6ee7b7" },
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

          {/* ── ROLLER ── */}
          <section className={`gj-reveal ${styles.rolesSection}`}>
            <div className={styles.sectionHeaderRow}>
              <h2 className={styles.sectionTitleLg}>Takımda Rolün Ne?</h2>
              <PixelStar size={12} color="#f472b6" />
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
                  <div className={styles.roleEmoji}>{r.emoji}</div>
                  <div className={styles.roleTitle}>{r.title}</div>
                  <div className={styles.roleDesc}>{r.desc}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── GAME GENRES ── */}
          <section className={`gj-reveal ${styles.genresSection}`}>
            <div className={styles.sectionHeaderRow}>
              <h2 className={styles.sectionTitleLg}>Ne Yapabilirsin?</h2>
              <PixelStar size={10} color="#34d399" />
            </div>
            <div className={styles.genresLabel}>SELECT GENRE:</div>
            <div className={styles.genresList}>
              {[
                { label: "Platformer",    color: "#ede9fe", border: "#a78bfa", icon: "🏃" },
                { label: "Puzzle",        color: "#fce7f3", border: "#f9a8d4", icon: "🧩" },
                { label: "RPG",           color: "#d1fae5", border: "#6ee7b7", icon: "⚔️" },
                { label: "Arcade",        color: "#fef3c7", border: "#fde68a", icon: "👾" },
                { label: "Horror",        color: "#fee2e2", border: "#fca5a5", icon: "👻" },
                { label: "Endless Runner",color: "#e0f2fe", border: "#7dd3fc", icon: "🏁" },
                { label: "Visual Novel",  color: "#f3e8ff", border: "#d8b4fe", icon: "📖" },
                { label: "... Her şey!", color: "#f0fdf4", border: "#86efac", icon: "✨" },
              ].map((t) => (
                <div
                  key={t.label}
                  className={styles.genreTag}
                  style={{ "--tag-bg": t.color, "--tag-border": t.border } as React.CSSProperties}
                >
                  <span className={styles.genreTagIcon}>{t.icon}</span>
                  <span className={styles.genreTagLabel}>{t.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── TIMELINE ── */}
          <section className={`gj-reveal ${styles.timelineSection}`}>
            <div className={styles.timelineHeaderRow}>
              <h2 className={styles.sectionTitle}>Nasıl İlerler?</h2>
              <PixelStar size={10} color="#fbbf24" />
            </div>
            {[
              {
                stage: "STAGE 01", icon: "🚀", title: "Tema Açıklanır",
                desc: "Tüm takımlar aynı anda öğreniyor. Beyin fırtınası başlasın!",
                time: "T+0", color: "#ede9fe", border: "#a78bfa",
              },
              {
                stage: "STAGE 02", icon: "🛠️", title: "İnşa Et",
                desc: "Tasarım, kod, ses, sanat. 48 saat boyunca tam gaz.",
                time: "T+1 — T+46", color: "#d1fae5", border: "#6ee7b7",
              },
              {
                stage: "STAGE 03", icon: "🎮", title: "Sun & Oyna",
                desc: "Demo sunumu, jüri oylaması, ve birbirinin oyunlarını oynama zamanı!",
                time: "T+48", color: "#fce7f3", border: "#f9a8d4",
              },
            ].map((step) => (
              <div key={step.stage} className={styles.timelineStep}>
                <div
                  className={styles.timelineStepIcon}
                  style={{ "--step-bg": step.color, "--step-border": step.border } as React.CSSProperties}
                >
                  <span className={styles.timelineStepEmoji}>{step.icon}</span>
                  <span className={styles.timelineStepStage}>{step.stage}</span>
                </div>
                <div className={styles.timelineStepBody}>
                  <div className={styles.timelineStepTitleRow}>
                    <span className={styles.timelineStepTitle}>{step.title}</span>
                    <span className={styles.timelineStepTime}>{step.time}</span>
                  </div>
                  <p className={styles.timelineStepDesc}>{step.desc}</p>
                </div>
              </div>
            ))}
          </section>

          {/* ── FAQ ── */}
          <section className={`gj-reveal ${styles.faqSection}`}>
            <div className={styles.faqHeaderRow}>
              <h2 className={styles.sectionTitleLg}>❓ Quest Log</h2>
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
              <div className={styles.ctaIcon}>🎮</div>
              <h3 className={styles.ctaTitle}>48 saatin var. Ne inşa edeceksin?</h3>
              <p className={styles.ctaDesc}>
                Takımını kur, temayı bekle, oyununu yap. Kazanmak değil,{" "}
                <strong className={styles.ctaDescStrong}>üretmek</strong> burada kural.
              </p>
              <div className={styles.ctaButtons}>
                <Link href="/auth/register" className={styles.btnPrimaryWhite}>Hemen Başvur 🚀</Link>
                <button className={styles.btnOutlineDark}>Detaylar</button>
              </div>
            </div>
          </section>

          {/* ── FOOTER ── */}
          {/* Footer removed for better mobile navigation - back button is sufficient */}
        </div>
      </div>

    </>
  );
}

