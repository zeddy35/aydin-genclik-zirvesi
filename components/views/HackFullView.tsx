"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useEasterEggs } from "@/components/EasterEggContext";
import { cn } from "@/lib/cn";

interface HackFullViewProps {
  onBack: () => void;
}

const KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];

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
      @keyframes mc-drop { 0%{transform:translateY(-28px);opacity:0} 40%{transform:translateY(0);opacity:1} 55%{transform:translateY(-6px)} 70%{transform:translateY(0)} 90%{transform:translateY(0);opacity:1} 100%{transform:translateY(0);opacity:0} }
      .mc-block { animation: mc-drop 1.8s ease forwards; position:absolute; top:-32px; right:0; pointer-events:none; }
      @keyframes mc-cell-flash { 0%,100%{opacity:1} 50%{opacity:0.4} }
      .mc-cell-flash { animation: mc-cell-flash 0.25s ease 3; }
    `;
    document.head.appendChild(style);

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Special+Elite&family=Share+Tech+Mono&family=Oswald:wght@700&display=swap";
    document.head.appendChild(link);

    const els = document.querySelectorAll(".hck-reveal");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); obs.unobserve(e.target); }
      }),
      { threshold: 0.08 }
    );
    els.forEach((el) => obs.observe(el));
    return () => { obs.disconnect(); document.head.removeChild(style); };
  }, []);
  return null;
}

const FAQ_ITEMS = [
  { q: "Takımım yok, ne yapacağım?", a: "Sorun değil. Eşleşme akışı var — rolüne göre ekip bulmana yardım ediyoruz. Tek başına gelen çok kişi oluyor.", hint: '// "İz tek başına da sürülür." — Dino' },
  { q: "Proje fikrim yok. Yine de gelebilir miyim?", a: "Evet. Problem alanları ve ipucu havuzu paylaşılacak. Mentorlar fikirleri netleştirmen için yanında.", hint: "// Bazen cevap soruda saklıdır." },
  { q: "Ne teslim etmem gerekiyor?", a: "Çalışan demo (MVP), kısa sunum ve kanıt niteliğinde ekranlar. Jüri tutarlılık, etki ve uygulanabilirliğe bakar.", hint: '// "Kanıt yoksa iddia yok." — Dino' },
  { q: "Hackathon ücretsiz mi?", a: "Evet, tamamen ücretsiz. GDG on Campus ADÜ, OTT ve HSD iş birliğiyle düzenleniyor. Sadece isteğin ve fikrin yeter.", hint: "// Erişim seviyesi: Ücretsiz." },
];

const TIMELINE = [
  { n: "01", lbl: "AÇILIŞ",  desc: "Brifing, takım eşleşmesi, hedef belirleme.",    red: false },
  { n: "02", lbl: "İNŞA",    desc: "Kod, tasarım, mentor checkpoint'leri.",           red: false },
  { n: "03", lbl: "KAPANIŞ", desc: "Pitch ve canlı demo. Jüri değerlendirmesi.",     red: true  },
];

const CHARS = [
  { img: "/dino/dino_bw.png",          name: "DEDEKTİF DİNO", org: "GDG on Campus ADÜ", red: false },
  { img: "/early-akses/early_bw.png",  name: "EARLY AKSES",   org: "Şüpheli",            red: true  },
  { img: "/beta/beta_bw.png",          name: "BETA",           org: "OTT Kulübü",         red: false },
];

export function HackFullView({ onBack }: HackFullViewProps) {
  const [openFaq,    setOpenFaq]    = useState<number | null>(null);
  const [showKonami, setShowKonami] = useState(false);
  const [showStamp,  setShowStamp]  = useState(false);
  const [stampClicks, setStampClicks] = useState(0);
  const [konamiIdx,  setKonamiIdx]  = useState(0);
  const [showMcBlock, setShowMcBlock] = useState(false);
  const [mcFlash,    setMcFlash]    = useState(false);
  const mcFireRef   = useRef(false);
  const mcTimerRef  = useRef<NodeJS.Timeout | null>(null);
  const { markEggSeen } = useEasterEggs();

  // ── Konami ──
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

  // ── Stamp (hidden trigger on file number — 5 clicks) ──
  const handleStampClick = () => {
    const next = stampClicks + 1;
    setStampClicks(next);
    if (next >= 5) {
      setStampClicks(0);
      setShowStamp(true);
      setTimeout(() => setShowStamp(false), 2600);
    }
  };

  // ── Minecraft (hover 1.5s on "Ücretsiz") ──
  const handleMcEnter = useCallback(() => {
    if (mcFireRef.current) return;
    mcTimerRef.current = setTimeout(() => {
      mcFireRef.current = true;
      setMcFlash(true);
      setTimeout(() => setMcFlash(false), 800);
      setShowMcBlock(true);
      markEggSeen("egg-minecraft");
      setTimeout(() => { setShowMcBlock(false); mcFireRef.current = false; }, 2400);
    }, 1500);
  }, [markEggSeen]);

  const handleMcLeave = useCallback(() => {
    if (mcTimerRef.current) { clearTimeout(mcTimerRef.current); mcTimerRef.current = null; }
  }, []);

  return (
    <>
      <ScrollReveal />

      {/* ── KONAMI MODAL ── */}
      {showKonami && (
        <div
          onClick={() => setShowKonami(false)}
          className="fixed inset-0 z-[9998] bg-black/95 flex flex-col items-center justify-center gap-5 p-6 cursor-pointer"
        >
          <p className="font-mono-tech text-[11px] [letter-spacing:0.3em] uppercase text-[#664]">↑↑↓↓←→←→BA</p>
          <p className="font-display text-[clamp(32px,8vw,64px)] [letter-spacing:0.1em] uppercase text-paper">Konami Kodu!</p>
          <div className="flex gap-8">
            <Image src="/dino/dino1.png" alt="Dino" width={200} height={48} className="object-contain" />
            <Image src="/beta/beta_kaban.png" alt="Beta" width={200} height={48} className="object-contain" />
          </div>
          <p className="font-special text-[15px] text-[#a09070]">Gerçek bir dedektifsin, ajan.</p>
          <div className="font-mono-tech text-[10px] [letter-spacing:0.2em] text-[#553] border border-[#332] px-3 py-1 rounded-[2px]">
            EXTRA LIFE +1
          </div>
          <p className="font-mono-tech text-[11px] text-[#443] [letter-spacing:0.2em] uppercase">[ tıkla / kapat ]</p>
        </div>
      )}

      {/* ── STAMP OVERLAY ── */}
      {showStamp && (
        <div className="fixed inset-0 z-[8000] pointer-events-none flex items-center justify-center">
          <div className="hck-stamp-anim font-display text-[clamp(36px,10vw,72px)] text-hackred border-[5px] border-hackred px-6 py-[10px] rounded-[4px] [letter-spacing:0.12em] leading-none">
            GİZLİ DOSYA
          </div>
        </div>
      )}

      {/* ── PAGE ── */}
      <div className="font-special min-h-screen w-full bg-[#080808] overflow-x-hidden">
        <div className="max-w-[1120px] mx-auto px-[clamp(16px,3vw,40px)] pt-[clamp(24px,4vw,48px)] pb-24">

          {/* TOP BAR */}
          <div className="flex items-center justify-between gap-3 mb-[clamp(20px,3vw,32px)]">
            <button
              onClick={onBack}
              className="font-mono-tech text-[11px] [letter-spacing:0.15em] uppercase text-aged bg-transparent border border-[#333] px-3 py-1.5 rounded-[4px] cursor-pointer hover:border-[#555] transition-colors"
            >
              ← Ana Ekran
            </button>
            <span className="font-mono-tech text-[10px] [letter-spacing:0.2em] text-[#444]">
              HCK-AYD-48 // GİZLİ
            </span>
          </div>

          {/* ── PAPER ── */}
          <div className="bg-paper rounded-[3px] shadow-[0_0_0_1px_#c4ab88,0_2px_4px_rgba(0,0,0,.4),0_20px_60px_rgba(0,0,0,.7)] overflow-hidden font-special">

            {/* HEADER BAND */}
            <div className="bg-ink px-8 py-4 flex flex-col gap-2.5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                {/* File number — invisible stamp easter egg trigger */}
                <button
                  onClick={handleStampClick}
                  className="bg-transparent border-none p-0 text-left cursor-default select-none"
                  tabIndex={-1}
                  aria-hidden
                >
                  <div className="font-mono-tech text-[10px] [letter-spacing:0.3em] uppercase text-[#555] mb-[2px]">Dosya No</div>
                  <div className="font-mono-tech text-[18px] [letter-spacing:0.1em] text-paper">HCK-AYD-48</div>
                </button>
                <div className="inline-flex items-center gap-[7px] bg-[rgba(155,28,28,.18)] border border-hackred px-3 py-[5px] rounded-[2px]">
                  <span className="hck-blink w-[5px] h-[5px] rounded-full bg-[#f87171] inline-block" />
                  <span className="font-mono-tech text-[11px] [letter-spacing:0.2em] uppercase text-[#f87171]">Aktif Soruşturma</span>
                </div>
              </div>

              {/* Meta facts */}
              <div className="flex items-center flex-wrap gap-x-1 gap-y-1">
                {(["Aydın", "48 Saat", "Son Başvuru: Yakında"] as string[]).map((fact, i) => (
                  <React.Fragment key={fact}>
                    {i > 0 && <span className="font-mono-tech text-[#3a3a3a] text-[11px] mx-1">·</span>}
                    <span className="font-mono-tech text-[10px] [letter-spacing:0.14em] text-[#555]">{fact}</span>
                  </React.Fragment>
                ))}
                <span className="font-mono-tech text-[#3a3a3a] text-[11px] mx-1">·</span>
                {/* Minecraft egg on "Ücretsiz" */}
                <span
                  className={cn("font-mono-tech text-[10px] [letter-spacing:0.14em] text-[#555] relative cursor-default", mcFlash && "mc-cell-flash")}
                  onMouseEnter={handleMcEnter}
                  onMouseLeave={handleMcLeave}
                >
                  Ücretsiz
                  {showMcBlock && (
                    <span className="mc-block flex flex-col items-center">
                      <svg width="20" height="20" viewBox="0 0 8 8">
                        <rect x="0" y="0" width="8" height="4" fill="#5d9e44" />
                        <rect x="0" y="4" width="8" height="4" fill="#8b6340" />
                        <rect x="0" y="0" width="2" height="2" fill="#4a8535" opacity="0.5" />
                        <rect x="4" y="1" width="2" height="1" fill="#4a8535" opacity="0.5" />
                        <rect x="2" y="5" width="2" height="2" fill="#7a5530" opacity="0.5" />
                        <rect x="5" y="6" width="2" height="1" fill="#7a5530" opacity="0.5" />
                      </svg>
                      <span className="font-special text-[9px] text-paper whitespace-nowrap mt-[2px]">Bir blok düştü! ⛏️</span>
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* ── HERO ── */}
            <div className="hck-reveal px-8 py-8 border-b border-dashed border-aged">
              <div className="font-mono-tech text-[10px] [letter-spacing:0.35em] uppercase text-[#999] mb-3">
                // Vaka Dosyası
              </div>

              <h1 className="font-display text-[clamp(40px,8vw,72px)] leading-[0.95] [letter-spacing:-0.02em] text-ink mb-1">
                Hackathon<br /><span className="text-hackred">Aydın</span>
              </h1>

              <div className="font-mono-tech text-[10px] [letter-spacing:0.2em] uppercase text-[#aaa] pt-3 mb-6">
                GDG on Campus ADÜ × Oyun ve Tasarım Topluluğu × Huawei Student Developers
              </div>

              {/* Character strip */}
              <div className="grid grid-cols-3 border border-aged rounded-[2px] overflow-hidden mb-6">
                {CHARS.map((c, i) => (
                  <div
                    key={c.name}
                    className={cn(
                      "flex flex-col items-center gap-2 px-3 py-4",
                      i > 0 && "border-l border-aged",
                      c.red ? "bg-[#f9edec]" : "bg-paper2"
                    )}
                  >
                    <div className="h-[72px] flex items-end justify-center">
                      <Image
                        src={c.img}
                        alt={c.name}
                        width={120}
                        height={72}
                        className="object-contain max-h-[72px] w-auto"
                      />
                    </div>
                    <div className="text-center">
                      <div className={cn("font-mono-tech text-[9px] [letter-spacing:0.16em] uppercase", c.red ? "text-hackred" : "text-ink")}>
                        {c.name}
                      </div>
                      <div className={cn("font-mono-tech text-[9px] mt-0.5", c.red ? "text-hackred opacity-60" : "text-[#aaa]")}>
                        {c.org}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <p className="font-special text-[15px] leading-[1.8] text-[#3d2f1f] max-w-[520px] mb-6">
                48 saatlik kesintisiz geliştirme. Fikrinden çalışan demo&apos;ya —
                jüri karşısında kanıtla.
              </p>

              <div className="flex gap-3 flex-wrap">
                <Link
                  href="/hackathon/basvur"
                  className="font-display text-[14px] [letter-spacing:0.1em] px-6 py-2.5 bg-ink text-paper rounded-[2px] no-underline inline-block hover:bg-hackred transition-colors duration-200"
                >
                  Vakaya Katıl →
                </Link>
                <Link
                  href="/hackathon/dosya"
                  className="font-display text-[14px] [letter-spacing:0.1em] px-6 py-2.5 border border-aged text-ink rounded-[2px] no-underline inline-block bg-transparent hover:border-ink transition-colors duration-200"
                >
                  Vaka Dosyası
                </Link>
              </div>
            </div>

            {/* ── SORUŞTURMA AKIŞI ── */}
            <div className="hck-reveal px-8 py-6 border-b border-dashed border-aged">
              <div className="flex items-baseline justify-between mb-5 flex-wrap gap-2">
                <h2 className="font-display text-[21px] [letter-spacing:0.06em] uppercase text-ink border-b-2 border-ink pb-[2px]">
                  Soruşturma Akışı
                </h2>
                <span className="font-mono-tech text-[11px] [letter-spacing:0.28em] uppercase text-[#aaa]">48 Saat</span>
              </div>

              {/* Desktop: 3-column grid */}
              <div className="hidden sm:grid grid-cols-3 gap-[1px] bg-aged border border-aged rounded-[2px] overflow-hidden">
                {TIMELINE.map((step) => (
                  <div key={step.n} className={cn("flex flex-col px-5 py-5", step.red ? "bg-[#fdf5f4]" : "bg-paper2")}>
                    <span className={cn(
                      "font-display text-[40px] leading-none mb-2 select-none",
                      step.red ? "text-hackred opacity-30" : "text-aged"
                    )}>
                      {step.n}
                    </span>
                    <span className={cn(
                      "font-display text-[13px] [letter-spacing:0.08em] uppercase mb-2",
                      step.red ? "text-hackred" : "text-ink"
                    )}>
                      {step.lbl}
                    </span>
                    <span className="font-special text-[13px] leading-[1.65] text-[#666]">
                      {step.desc}
                    </span>
                  </div>
                ))}
              </div>

              {/* Mobile: vertical with left border */}
              <div className="sm:hidden flex flex-col border-l-2 border-aged pl-5 gap-5">
                {TIMELINE.map((step) => (
                  <div key={step.n}>
                    <span className={cn(
                      "font-mono-tech text-[10px] [letter-spacing:0.18em] uppercase",
                      step.red ? "text-hackred" : "text-[#aaa]"
                    )}>
                      {step.n} · {step.lbl}
                    </span>
                    <p className="font-special text-[13px] leading-[1.65] text-[#555] mt-1">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── SORU ODASI ── */}
            <div className="hck-reveal px-8 py-6 border-b border-dashed border-aged">
              <div className="flex items-baseline justify-between mb-5 flex-wrap gap-2">
                <h2 className="font-display text-[21px] [letter-spacing:0.06em] uppercase text-ink border-b-2 border-ink pb-[2px]">
                  Soru Odası
                </h2>
                <span className="font-mono-tech text-[11px] [letter-spacing:0.28em] uppercase text-[#aaa]">S.S.S.</span>
              </div>
              <div className="border border-aged rounded-[2px] overflow-hidden">
                {FAQ_ITEMS.map((f, i) => (
                  <div key={f.q} className={cn("bg-paper2", i > 0 && "border-t border-aged")}>
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full text-left flex items-center justify-between gap-3 px-4 py-3.5 bg-transparent border-none cursor-pointer"
                    >
                      <span className="font-special text-[15px] text-ink">{f.q}</span>
                      <span className={cn(
                        "font-mono-tech text-[18px] inline-block transition-transform duration-200 shrink-0",
                        openFaq === i ? "text-ink rotate-45" : "text-aged"
                      )}>
                        +
                      </span>
                    </button>
                    <div className={`hck-faq-body${openFaq === i ? " open" : ""}`}>
                      <div className="font-special text-[14px] leading-[1.75] text-[#3d2f1f]">{f.a}</div>
                      <div className="font-mono-tech text-[10px] text-[#bbb] mt-1.5">{f.hint}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── FOOTER BAR ── */}
            <div className="bg-ink px-8 py-3.5 flex items-center justify-between flex-wrap gap-2">
              <span className="font-mono-tech text-[11px] [letter-spacing:0.15em] uppercase text-[#333]">
                Dosya, kanıtla kapatılır.{" "}
                <span className="text-[#444]">Erken Erişim ile değil.</span>
              </span>
              <span className="font-mono-tech text-[11px] text-[#222]">GDG × OTT × HSD // v1.0.0 // BUILD 2026</span>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
