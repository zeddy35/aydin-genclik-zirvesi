"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useEasterEggs } from "@/components/EasterEggContext";
import { cn } from "@/lib/cn";

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
    <div className="flex items-baseline justify-between mb-5 flex-wrap gap-2">
      <h2 className="font-display text-[21px] [letter-spacing:0.06em] uppercase text-ink border-b-2 border-ink pb-[2px]">
        {title}
      </h2>
      <span className="font-mono-tech text-[11px] [letter-spacing:0.28em] uppercase text-[#aaa]">{tag}</span>
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
      @keyframes mc-drop { 0%{transform:translateY(-28px);opacity:0} 40%{transform:translateY(0);opacity:1} 55%{transform:translateY(-6px)} 70%{transform:translateY(0)} 90%{transform:translateY(0);opacity:1} 100%{transform:translateY(0);opacity:0} }
      .mc-block { animation: mc-drop 1.8s ease forwards; position:absolute; top:8px; right:8px; pointer-events:none; }
      @keyframes mc-cell-flash { 0%,100%{background:#e8dcc4} 50%{background:#c8a86a} }
      .mc-cell-flash { animation: mc-cell-flash 0.25s ease 3; }
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
  const { markEggSeen } = useEasterEggs();
  const mcTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [showMcBlock, setShowMcBlock] = useState(false);
  const [mcFlash, setMcFlash] = useState(false);
  const mcFireRef = useRef(false);

  const handleMcEnter = useCallback(() => {
    if (mcFireRef.current) return;
    mcTimerRef.current = setTimeout(() => {
      mcFireRef.current = true;
      setMcFlash(true);
      setTimeout(() => setMcFlash(false), 800);
      setShowMcBlock(true);
      markEggSeen("egg-minecraft");
      setTimeout(() => {
        setShowMcBlock(false);
        mcFireRef.current = false;
      }, 2400);
    }, 1500);
  }, [markEggSeen]);

  const handleMcLeave = useCallback(() => {
    if (mcTimerRef.current) { clearTimeout(mcTimerRef.current); mcTimerRef.current = null; }
  }, []);

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
          <div className="font-mono-tech text-[10px] [letter-spacing:0.2em] text-[#553] border border-[#332] px-3 py-1 rounded-[2px] mt-1">
            EXTRA LIFE +1
          </div>
          <p className="font-mono-tech text-[11px] text-[#443] [letter-spacing:0.2em] uppercase mt-2">[ tıkla / kapat ]</p>
        </div>
      )}

      {/* STAMP OVERLAY */}
      {showStamp && (
        <div className="fixed inset-0 z-[8000] pointer-events-none flex items-center justify-center">
          <div className="hck-stamp-anim font-display text-[clamp(36px,10vw,72px)] text-hackred border-[5px] border-hackred px-6 py-[10px] rounded-[4px] [letter-spacing:0.12em] leading-none">
            GİZLİ DOSYA
          </div>
        </div>
      )}

      {/* PAGE */}
      <div className="font-special min-h-screen w-full bg-[#111009] overflow-x-hidden">
        <div className="max-w-[1120px] mx-auto px-[clamp(16px,3vw,40px)] pt-[clamp(24px,4vw,48px)] pb-24">

          {/* TOP BAR */}
          <div className="flex items-center justify-between gap-3 mb-[clamp(24px,4vw,40px)]">
            <button
              onClick={onBack}
              className="font-mono-tech text-[11px] [letter-spacing:0.15em] uppercase text-aged bg-transparent border border-[#333] px-3 py-1.5 rounded-[4px] cursor-pointer"
            >
              ← Ana Ekran
            </button>
            <span className="font-mono-tech text-[10px] [letter-spacing:0.2em] text-[#555]">
              SAVE SLOT 1 // HCK-AYD-48 // GİZLİ
            </span>
          </div>

          {/* PAPER */}
          <div className="bg-paper rounded-[3px] shadow-[0_0_0_1px_#c4ab88,0_2px_4px_rgba(0,0,0,.4),0_20px_60px_rgba(0,0,0,.7)] overflow-hidden relative font-special">

            {/* HEADER BAND */}
            <div className="bg-ink px-8 py-5 flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="font-mono-tech text-[11px] [letter-spacing:0.3em] uppercase text-[#555] mb-[3px]">Dosya No</div>
                <div className="font-mono-tech text-lg [letter-spacing:0.1em] text-paper">HCK-AYD-48</div>
              </div>
              <div className="inline-flex items-center gap-[7px] bg-[rgba(155,28,28,.18)] border border-hackred px-3 py-[5px] rounded-[2px]">
                <span className="hck-blink w-[5px] h-[5px] rounded-full bg-[#f87171] inline-block" />
                <span className="font-mono-tech text-[11px] [letter-spacing:0.2em] uppercase text-[#f87171]">Aktif Soruşturma</span>
              </div>
            </div>

            {/* STAMP AREA */}
            <div className="flex items-start justify-between px-8 py-6 border-b border-dashed border-aged flex-wrap gap-3">
              <div className="flex gap-3 items-center flex-wrap">
                <button
                  onClick={handleStampClick}
                  title="Beni 5 kez tıkla 🔍"
                  className="font-display text-[23px] [letter-spacing:0.12em] border-[3px] border-[#7c2d12] text-[#7c2d12] px-3.5 py-[5px] -rotate-[5deg] opacity-75 leading-none rounded-[2px] bg-transparent cursor-pointer inline-block"
                >
                  GİZLİ DOSYA
                </button>
                <span className="font-display text-[15px] [letter-spacing:0.1em] border-2 border-[#4a7c59] text-[#4a7c59] px-2.5 py-[3px] rotate-[3deg] opacity-40 inline-block">
                  AKTİF
                </span>
              </div>
              <div className="font-mono-tech text-[10px] [letter-spacing:0.15em] leading-[1.9] text-[#888] text-right">
                <div>Son Başvuru</div>
                <div className="text-[15px] text-ink">YAKINDA</div>
                <div className="mt-1">Operasyon Süresi</div>
                <div className="text-[15px] text-ink">48 SAAT</div>
              </div>
            </div>

            {/* HERO */}
            <div className="hck-reveal px-8 py-8 border-b border-dashed border-aged">
              <div className="font-mono-tech text-[11px] [letter-spacing:0.35em] uppercase text-[#888] mb-2">
                Vaka Dosyası // İnşa Et · Sevk Et · Sun
              </div>
              <h1 className="font-display text-[clamp(44px,11vw,88px)] leading-[0.95] [letter-spacing:-0.02em] text-ink mb-1">
                Hackathon<br /><span className="text-hackred">Aydın</span>
              </h1>
              <div className="font-mono-tech text-md  [letter-spacing:0.25em] uppercase text-[#888] mb-6 pt-4">
                GDG × Oyun ve Tasarım Kulübü × HuaweI Student Developer Program
              </div>

              {/* Chars */}
              <div className="grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-[1px] border border-aged rounded-[2px] overflow-hidden mb-6">
                {[
                  { svg: <Image src="/dino/dino1.png" alt="Dedektif Dino" width={200} height={48} className="object-contain" />, name: "DEDEKTIF DINO", tag: "GDG on Campus ADÜ", red: false },
                  { svg: null, name: "VS", tag: "", red: false, sep: true },
                  { svg: <Image src="/early-akses/early_ai_hackathon.png" alt="Beta" width={263} height={48} className="object-contain" />, name: "EARLY AKSES", tag: "Şüpheli", red: true },
                  { svg: null, name: "VS", tag: "", red: false, sep: true },
                  { svg: <Image src="/beta/beta_ai_hackathon.png" alt="Beta" width={230} height={48} className="object-contain" />, name: "BETA", tag: "OTT Kulübü", red: false },
                ].map((c, i) =>
                  c.sep ? (
                    <div key={i} className="hidden items-center justify-center px-3 bg-paper2 border-r border-aged sm-flex">
                      <span className="font-display text-[11px] [letter-spacing:0.1em] text-[#bbb]">VS</span>
                    </div>
                  ) : (
                    <div
                      key={i}
                      className={cn(
                        "flex-1 flex flex-col items-center gap-1.5 px-2 py-3.5 cursor-default",
                        c.red ? "bg-[#f5e8e8]" : "bg-paper2"
                      )}
                    >
                      {c.svg}
                      <span className={cn("font-mono-tech text-[20px] [letter-spacing:0.2em] uppercase", c.red ? "text-hackred" : "text-ink")}>
                        {c.name}
                      </span>
                      <span className={cn("font-mono-tech text-[15px]", c.red ? "text-hackred" : "text-[#888]")}>
                        {c.tag}
                      </span>
                    </div>
                  )
                )}
              </div>

              <p className="font-special text-base leading-[1.75] text-[#3d2f1f] max-w-[560px] mb-[22px]">
                <strong>Beta</strong> ve <strong>Dino</strong> bir iz buldu. Ama gölgede biri var:{" "}
                <strong className="text-hackred">Early Akses</strong> — kocaman bıyığı, sinsi sırıtışı ve{" "}
                 <strong>gerçeği ortaya çıkar. 48 saat</strong> — tek operasyon penceresi.
              </p>

              <div className="flex gap-3 flex-wrap">
                <Link
                  href="/hackathon/basvur"
                  className="font-display text-[15px] [letter-spacing:0.12em] px-6 py-2.5 bg-ink text-paper rounded-[2px] no-underline inline-block"
                >
                  Vakaya Katıl →
                </Link>
                <Link
                  href="/hackathon/dosya"
                  className="font-display text-[15px] [letter-spacing:0.12em] px-6 py-2.5 border-2 border-aged text-ink rounded-[2px] no-underline inline-block bg-transparent"
                >
                  Vaka Dosyası
                </Link>
              </div>

              <p aria-hidden className="font-mono-tech text-[11px] [letter-spacing:0.15em] uppercase mt-4 text-paper select-none">
                ↑↑↓↓←→←→BA // biliyorsan biliyorsun
              </p>
            </div>

            {/* ŞÜPHELI */}
            <div className="hck-reveal px-8 py-6 border-b border-dashed border-aged">
              <SecHeader title="Şüpheli Dosyası" tag="Suspect #1" />
              <div className="grid grid-cols-[minmax(140px,180px)_1fr] gap-6">
                <div className="flex flex-col items-center gap-2 px-5 py-4 bg-paper2 border border-aged min-w-[130px] shrink-0">
                  <span className="font-mono-tech text-[10px] [letter-spacing:0.2em] uppercase text-[#888]">Fotoğraf</span>
                  <Image src="/early-akses/early_aks.svg" alt="Beta" width={230} height={48} className="object-contain" />
                  <span className="font-display text-[20px] [letter-spacing:0.06em] text-hackred">Early Akses</span>
                  <span className="font-mono-tech text-[10px] [letter-spacing:0.15em] bg-hackred text-white px-2 py-0.5 rounded-[1px]">
                    Tehlike: Yüksek
                  </span>
                  <span className="font-mono-tech text-[15px] text-[#aaa]">Yakalanamadı</span>
                </div>
                <div className="flex-1 flex flex-col gap-3.5">
                  {[
                    { label: "Alias", val: "Erken Erişim", em: false },
                    { label: "Bilinen Söylemler", val: '"Daha bitmedi ama yayınla." / "Sonra düzeltirsin." / "Demo mış gibi yap."', em: true },
                    { label: "Modus Operandi", val: "Kapsam şişirme. 5 yarım özellik, 0 sağlam kanıt. Sunumda dağılma.", em: false },
                    { label: "Panzehir", val: "1 net problem → 1 güçlü MVP → 1 keskin demo. Dino & Beta'nın kuralı.", em: false },
                  ].map((f) => (
                    <div key={f.label}>
                      <div className="font-mono-tech text-[11px] [letter-spacing:0.25em] uppercase text-[#888] border-b border-aged pb-[3px] mb-[5px]">
                        {f.label}
                      </div>
                      <div className={cn("text-[15px] leading-[1.65]", f.em ? "text-[#666] italic" : "text-[#2d1f0e]")}>
                        {f.val}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* KANIT */}
            <div className="hck-reveal px-8 py-6 border-b border-dashed border-aged">
              <SecHeader title="Kanıt Panosu" tag="Evidence Log" />
              <div className="border border-aged rounded-[2px] overflow-hidden">
                {[
                  { code: "K-01", title: "İpucu: Problem", desc: "Beta'nın kuralı: problem net değilse çözüm de net olmaz. Tek cümlede yaz — Kimi, neyi, neden çözüyoruz?", note: '// Beta: "İpucu bulanıksa, dosya dağılır."', red: false },
                  { code: "K-02", title: "İpucu: Kanıt (MVP)", desc: "Dino'nun kuralı: kanıt göster. Akış, ekran, çalışan demo. Az ama sağlam — tutarlı.", note: '// Dino: "Süs değil, iz bırak."', red: false },
                  { code: "K-03", title: "Tehdit: Erken Erişim", desc: 'Düşmanımız: yarım işi "yayınla geç" diye fısıldar. Panzehir: net kapsam + sağlam demo.', note: "⚠ Erken erişim tuzağına düşme.", red: true },
                ].map((ev, i) => (
                  <div
                    key={ev.code}
                    className={cn("flex", i > 0 && "border-t border-aged", ev.red ? "bg-[#fdf8f4]" : "bg-paper2")}
                  >
                    <div
                      className={cn(
                        "font-mono-tech text-[11px] flex items-center justify-center min-w-[40px] py-[10px] [writing-mode:vertical-rl] [letter-spacing:0.1em]",
                        ev.red ? "bg-[#7c2d12] text-paper" : "bg-ink text-aged"
                      )}
                    >
                      {ev.code}
                    </div>
                    <div className="px-4 py-3 flex-1">
                      <div className={cn("font-display text-[15px] [letter-spacing:0.06em] mb-1", ev.red ? "text-hackred" : "text-ink")}>
                        {ev.title}
                      </div>
                      <div className="font-special text-sm leading-[1.65] text-[#3d2f1f]">{ev.desc}</div>
                      <div className={cn("font-mono-tech text-[11px] mt-1.5", ev.red ? "text-hackred" : "text-[#999]")}>
                        {ev.note}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TEMEL BİLGİLER */}
            <div className="hck-reveal px-8 py-6 border-b border-dashed border-aged">
              <SecHeader title="Temel Bilgiler" tag="Case Overview" />
              <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-[1px] border border-aged bg-aged rounded-[2px] overflow-hidden">
                {([ ["Dosya Açılışı","Yakında"], ["Bölge","Aydın"], ["Süre","48 Saat"] ] as [string,string][]).map(([k,v]) => (
                  <div key={k} className="bg-paper2 px-3.5 py-3">
                    <div className="font-mono-tech text-[10px] [letter-spacing:0.2em] uppercase text-[#888] mb-1">{k}</div>
                    <div className="font-display text-base [letter-spacing:0.04em] text-ink">{v}</div>
                  </div>
                ))}
                {/* Minecraft egg cell */}
                <div
                  className={cn("bg-paper2 px-3.5 py-3 relative cursor-default", mcFlash && "mc-cell-flash")}
                  onMouseEnter={handleMcEnter}
                  onMouseLeave={handleMcLeave}
                >
                  <div className="font-mono-tech text-[10px] [letter-spacing:0.2em] uppercase text-[#888] mb-1">
                    Erişim {mcFireRef.current && <span className="ml-1">⛏️</span>}
                  </div>
                  <div className="font-display text-base [letter-spacing:0.04em] text-ink">Ücretsiz</div>
                  {!mcFireRef.current && (
                    <div className="font-mono-tech text-[9px] text-[#bbb] mt-[2px]">1.5s basılı tut ⛏️</div>
                  )}
                  {showMcBlock && (
                    <div className="mc-block">
                      <svg width="20" height="20" viewBox="0 0 8 8">
                        <rect x="0" y="0" width="8" height="4" fill="#5d9e44" />
                        <rect x="0" y="4" width="8" height="4" fill="#8b6340" />
                        <rect x="0" y="0" width="2" height="2" fill="#4a8535" opacity="0.5" />
                        <rect x="4" y="1" width="2" height="1" fill="#4a8535" opacity="0.5" />
                        <rect x="2" y="5" width="2" height="2" fill="#7a5530" opacity="0.5" />
                        <rect x="5" y="6" width="2" height="1" fill="#7a5530" opacity="0.5" />
                      </svg>
                      <div className="font-special text-[9px] text-[#3d2f1f] whitespace-nowrap mt-[2px]">Bir blok düştü! ⛏️</div>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-3.5 px-3.5 py-[11px] border-l-[3px] border-aged bg-paper2 font-special text-sm leading-[1.7] text-[#555]">
                <span className="font-mono-tech text-ink">Beta:</span> "Net problem = hızlı yön." &nbsp;·&nbsp;{" "}
                <span className="font-mono-tech text-ink">Dino:</span> "Kanıt yoksa iddia yok." &nbsp;·&nbsp;{" "}
                <span className="font-mono-tech text-hackred">Erken Erişim:</span> "Yarım iş de olur…" →{" "}
                <span className="font-mono-tech text-ink">Biz:</span> "Olmaz."
              </div>
            </div>

            {/* AJAN PROFİLLERİ */}
            <div className="hck-reveal px-8 py-6 border-b border-dashed border-aged">
              <SecHeader title="Ajan Profilleri" tag="Role Matching" />
              <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-[1px] border border-aged bg-aged rounded-[2px] overflow-hidden">
                {[
                  { badge: "Rol 01 // Dino Ekibi", title: "Kod Dedektifi", desc: "Sistemi kurar. API, veri, akış. Hatanın nerede saklandığını bulur. Herkes uyurken o çalışır.", tags: ["Back-end","Entegrasyon","Hızlı Fix"], note: "// RAWR!" },
                  { badge: "Rol 02 // Beta Ekibi", title: "UI İz Sürücü", desc: "Kullanıcıyı doğru yere götüren tasarım. Hiyerarşi, akış, etkileşim — her piksel bir ipucu.", tags: ["UI/UX","Prototip","Sunum Hissi"], note: "// ○ × ile tasarım yaparız." },
                  { badge: "Rol 03 // Beta Ekibi", title: "Ürün Analisti", desc: "Problem–çözüm uyumu. Hedef kitle + değer önerisi + ölçüm. Dosyanın omurgası.", tags: ["Ürün","Araştırma","Kapsam"], note: "// Kapsam netse, çözüm nettir." },
                  { badge: "Rol 04 // Dino Ekibi", title: "Pitch Avukatı", desc: "Jüri karşısında dosyayı kapatır. Hikâye + kanıt + net kapanış. Sözler biter, iş konuşur.", tags: ["Sunum","Demo","Hikâye"], note: "// Sonuç odaklı ol." },
                ].map((r) => (
                  <div key={r.badge} className="bg-paper2 px-4 py-3.5">
                    <div className="font-mono-tech text-[10px] [letter-spacing:0.22em] uppercase text-[#888] mb-[3px]">{r.badge}</div>
                    <div className="font-display text-[15px] [letter-spacing:0.06em] text-ink mb-1.5">{r.title}</div>
                    <div className="font-special text-sm leading-[1.6] text-[#3d2f1f] mb-2.5">{r.desc}</div>
                    <div className="flex flex-wrap gap-[5px]">
                      {r.tags.map((t) => (
                        <span
                          key={t}
                          className="font-mono-tech text-[10px] [letter-spacing:0.12em] uppercase border border-aged px-[7px] py-0.5 text-[#666] rounded-[1px]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="font-mono-tech text-[10px] text-[#aaa] mt-2">{r.note}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* SORUŞTURMA AKIŞI */}
            <div className="hck-reveal px-8 py-6 border-b border-dashed border-aged">
              <SecHeader title="Soruşturma Akışı" tag="Checkpoints" />
              <div className="border border-aged rounded-[2px] overflow-hidden">
                {[
                  { n:"01", lbl:"AÇILIŞ", speaker:"Beta Raporu", title:"Dosya Açılışı", desc:"Vaka brifingi, kurallar, hedefler. Takım eşleşmesi ve hızlı yönlendirme.", checks:["T+0: Dosya açılır","T+2: Roller netleşir","T+4: Plan çıkar"], red:false },
                  { n:"02", lbl:"İNŞA", speaker:"Dino Raporu", title:"İz Sürme (İnşa Et)", desc:"Kod, tasarım, iş modeli. Mentor checkpoint'leri ile hızlı iterasyon.", checks:["T+12: İlk prototip","T+24: Kritik kanıt","T+36: Demo hazır"], red:false },
                  { n:"03", lbl:"KAPANIŞ", speaker:"⚠ Erken Erişim Tehdidi Aktif", title:"Final Sorgu (Demo)", desc:"Pitch + canlı demo. Jüri değerlendirmesi. Dosya kapanır — ya zaferle, ya yarım işle.", checks:["T+44: Son prova","T+48: Sunum","T+48+: Sonuç"], red:true },
                ].map((tl, i) => (
                  <div key={tl.n} className={cn("flex bg-paper2", i > 0 && "border-t border-aged")}>
                    <div className="bg-ink min-w-[52px] flex flex-col items-center justify-center gap-0.5 py-4 shrink-0">
                      <span className="font-display text-[22px] text-[#444]">{tl.n}</span>
                      <span className="font-mono-tech text-[10px] [letter-spacing:0.1em] text-[#555]">{tl.lbl}</span>
                    </div>
                    <div className="px-4 py-3.5 flex-1">
                      <div className={cn("font-mono-tech text-[10px] [letter-spacing:0.2em] uppercase mb-[3px]", tl.red ? "text-hackred" : "text-[#aaa]")}>
                        {tl.speaker}
                      </div>
                      <div className="font-display text-sm [letter-spacing:0.04em] text-ink mb-[5px]">{tl.title}</div>
                      <div className="font-special text-sm leading-[1.6] text-[#3d2f1f] mb-2.5">{tl.desc}</div>
                      <div className="flex flex-wrap gap-[5px]">
                        {tl.checks.map((c) => (
                          <span key={c} className="font-mono-tech text-[11px] bg-paper border border-aged text-[#777] px-2 py-0.5 rounded-[1px]">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SORU ODASI */}
            <div className="hck-reveal px-8 py-6 border-b border-dashed border-aged">
              <SecHeader title="Soru Odası" tag="Sorgu Kaydı" />
              <div className="border border-aged rounded-[2px] overflow-hidden">
                {FAQ_ITEMS.map((f, i) => (
                  <div key={f.q} className={cn("bg-paper2", i > 0 && "border-t border-aged")}>
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full text-left flex items-center justify-between gap-3 px-4 py-3.5 bg-transparent border-none cursor-pointer"
                    >
                      <div>
                        <div className="font-mono-tech text-[10px] [letter-spacing:0.2em] uppercase text-[#aaa] mb-[3px]">{f.who}</div>
                        <div className="font-special text-[15px] text-ink">{f.q}</div>
                      </div>
                      <span
                        className={cn(
                          "font-mono-tech text-[18px] inline-block transition-transform duration-200 shrink-0",
                          openFaq === i ? "text-ink rotate-45" : "text-aged"
                        )}
                      >
                        +
                      </span>
                    </button>
                    <div className={`hck-faq-body${openFaq === i ? " open" : ""}`}>
                      <div className="font-special text-[15px] leading-[1.7] text-[#3d2f1f]">{f.a}</div>
                      <div className="font-mono-tech text-[11px] text-[#aaa] mt-1.5">{f.hint}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="hck-reveal px-8 py-6">
              <div className="grid grid-cols-[1fr_auto] gap-10 items-center justify-between">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-3 mb-3">
                    <DinoSVG size={40} />
                    <BetaSVG size={40} />
                    <div>
                      <div className="font-mono-tech text-[11px] [letter-spacing:0.2em] uppercase text-[#888]">Dino & Beta</div>
                      <div className="font-mono-tech text-[10px] text-[#aaa]">Seni bekliyor</div>
                    </div>
                  </div>
                  <div className="font-display text-[22px] [letter-spacing:0.06em] uppercase text-ink mb-2">Dosya Seni Bekliyor.</div>
                  <p className="font-special text-[15px] leading-[1.7] text-[#3d2f1f] max-w-[400px] mb-2">
                    Beta ve Dino bu soruşturmayı tek başına kapatamaz. Erken Erişim gölgede dolaşıyor.{" "}
                    <strong>Senin görevin:</strong> kanıtla, sun, dosyayı kapat.
                  </p>
                  <div className="font-mono-tech text-[11px] [letter-spacing:0.22em] uppercase text-[#888]">
                    // &quot;kanıtın varsa varsın.&quot;
                  </div>
                </div>
                <div className="flex flex-col gap-2.5 min-w-[200px] max-w-[260px]">
                  <Link
                    href="/hackathon/basvur"
                    className="font-display text-[15px] [letter-spacing:0.1em] px-5 py-[11px] bg-ink text-paper rounded-[2px] no-underline block text-center"
                  >
                    Başvuruyu Aç →
                  </Link>
                  <Link
                    href="/hackathon/dosya"
                    className="font-display text-[15px] [letter-spacing:0.1em] px-5 py-[11px] border-2 border-aged text-ink rounded-[2px] no-underline block text-center bg-transparent"
                  >
                    Vaka Dosyasını Gör
                  </Link>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="bg-ink px-8 py-3.5 flex items-center justify-between flex-wrap gap-2">
              <span className="font-mono-tech text-[11px] [letter-spacing:0.15em] uppercase text-[#333]">
                Dosya, kanıtla kapatılır. <span className="text-[#444]">Erken Erişim ile değil.</span>
              </span>
              <span className="font-mono-tech text-[11px] text-[#222]">GDG × OTT × HSD// v1.0.0 // BUILD 2026</span>
            </div>

          </div >
        </div>
      </div>

    </>
  );
}
