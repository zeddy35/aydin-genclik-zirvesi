"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useEasterEggs } from "@/components/EasterEggContext";
import { cn } from "@/lib/cn";

/* ════════════════════════════════════════════════════════════════
   TYPES
════════════════════════════════════════════════════════════════ */
interface HackFullViewProps { onBack: () => void; }

interface Person {
  id:           string;
  dossierCode:  string;
  codename:     string;
  name:         string;
  role:         string;
  org?:         string;
  status:       "active" | "suspect";
  statusLabel:  string;
  description:  string;
  tags:         string[];
  image:        string;
}

/* ════════════════════════════════════════════════════════════════
   INTELLIGENCE DATA
════════════════════════════════════════════════════════════════ */
const PEOPLE: Person[] = [
  {
    id:          "dino",
    dossierCode: "HCK-AYD-01",
    codename:    "AGT-DINO",
    name:        "Dedektif Dino",
    role:        "Baş Araştırmacı",
    org:         "GDG on Campus ADÜ",
    status:      "active",
    statusLabel: "Aktif",
    description:
      "24 saatlik soruşturmanın lideri. Ekiplere rehberlik eder, mentor ağını koordine eder ve projelerin nihai değerlendirmesini yürütür. Her kritik anda sahadaki ilk ajan.",
    tags: ["Mentörlük", "Yazılım", "Liderlik"],
    image: "/dino/dino_bw.png",
  },
  {
    id:          "early",
    dossierCode: "HCK-AYD-00",
    codename:    "ŞPH-EARLY",
    name:        "Early Akses",
    role:        "Şüpheli · Vaka Merkezi",
    status:      "suspect",
    statusLabel: "Şüpheli",
    description:
      "Bu vakayı açan tetikleyici figür. Tüm ekipler 24 saat boyunca bu şüphelinin bıraktığı kanıtları analiz edecek, prototip üretecek ve jüri karşısında çözümlerini kanıtlayacak.",
    tags: ["Problem Alanı", "MVP Hedefi", "Bilinmez"],
    image: "/early-akses/early_bw.png",
  },
  {
    id:          "beta",
    dossierCode: "HCK-AYD-02",
    codename:    "AGT-BETA",
    name:        "Beta",
    role:        "Saha Ajanı",
    org:         "OTT Kulübü",
    status:      "active",
    statusLabel: "Aktif",
    description:
      "Saha operasyonlarını yürüten, ekiplerin ihtiyaçlarını karşılayan ve lojistiği koordine eden destek ajanı. Her kriz anında ilk devreye giren, kesintisiz çalışan ajan.",
    tags: ["Koordinasyon", "Lojistik", "Saha"],
    image: "/beta/beta_bw.png",
  },
  {
    id:          "panda",
    dossierCode: "HCK-AYD-03",
    codename:    "KSK-PANDA",
    name:        "Panda",
    role:        "Kazara Katılımcı",
    org:         "HSD",
    status:      "suspect",
    statusLabel: "Kazara",
    description:
      "Yanlış kapıdan girdi, bir daha çıkamadı. Her klavye sesi, her ani hareket onu irkiltiyor. Burada olmayı planlamıyordu — ama bir şekilde ekibin en kritik üyesi hâline geldi. Kendisi de nasıl olduğunu bilmiyor. Gitmek istiyor ama ayakları tutmuyor.",
    tags: ["Kaza Eseri", "Yüksek Irkilme", "HSD"],
    image: "/panda/panda_bw.png",
  },
];

/* ════════════════════════════════════════════════════════════════
   PAGE DATA
════════════════════════════════════════════════════════════════ */
const KONAMI = [
  "ArrowUp","ArrowUp","ArrowDown","ArrowDown",
  "ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a",
];

const INTEL_STATS = [
  { label: "Bölge",  value: "Aydın"      },
  { label: "Süre",   value: "24 Saat"    },
  { label: "Tarih",  value: "5–6 Mayıs"  },
  { label: "Giriş",  value: "Ücretsiz", mcEgg: true },
] as const;

const PHASES = [
  { day: "GÜN 1 · 5 MAYIS", n: "01", label: "AÇILIŞ",      note: "Brifing · takım eşleşmesi · problem alanı açıklanıyor.", accent: false },
  { day: "GÜN 1 · 5 MAYIS", n: "02", label: "İNŞA",        note: "Kod · tasarım · mentor checkpoint'leri.",                accent: false },
  { day: "GÜN 2 · 6 MAYIS", n: "03", label: "SON SPRINT",  note: "Geliştirme tamamlanıyor · prototip hazırlanıyor.",       accent: false },
  { day: "GÜN 2 · 6 MAYIS", n: "04", label: "KAPANIŞ",     note: "Demo · pitch · jüri değerlendirmesi · sonuçlar.",       accent: true  },
];

const FAQS = [
  { q: "Takımım yok, ne yapacağım?",         a: "Sorun değil. Eşleşme akışı var — rolüne göre ekip bulmana yardım ediyoruz. Tek başına gelen çok kişi oluyor." },
  { q: "Proje fikrim yok, gelebilir miyim?", a: "Evet. Problem alanları ve ipucu havuzu paylaşılacak. Mentorlar fikirleri netleştirmen için yanında." },
  { q: "Ne teslim etmem gerekiyor?",         a: "Çalışan demo (MVP), kısa sunum ve kanıt niteliğinde ekranlar. Jüri tutarlılık, etki ve uygulanabilirliğe bakar." },
  { q: "Hackathon ücretsiz mi?",             a: "Evet, tamamen ücretsiz. GDG on Campus ADÜ, OTT ve HSD iş birliğiyle düzenleniyor." },
];

/* ════════════════════════════════════════════════════════════════
   DESIGN TOKENS
════════════════════════════════════════════════════════════════ */
const C = {
  bg:          "#070709",
  surf:        "#0c0c12",
  surf2:       "#101018",
  border:      "#1c1c28",
  borderHi:    "#2a2a3a",
  red:         "#c0392b",
  redDim:      "#7a1a1a",
  redText:     "#e05050",
  amber:       "#d97706",
  amberText:   "#fbbf24",
  gold:        "#c8a84b",
  txt:         "#ede9f8",
  txtSec:      "#918da8",
  txtMuted:    "#524e68",
  txtCode:     "#3c3a52",
  ui:          "'Syne', sans-serif",
  mono:        "'Share Tech Mono', monospace",
  display:     "'Oswald', sans-serif",
} as const;

/* ════════════════════════════════════════════════════════════════
   SHARED MICRO-COMPONENTS
════════════════════════════════════════════════════════════════ */
function StatusBadge({ status, label }: { status: Person["status"]; label: string }) {
  const isActive = status === "active";
  const dot      = isActive ? C.redText  : C.amberText;
  const bg       = isActive ? "#180b0b"  : "#170e00";
  const bdr      = isActive ? "#3a1212"  : "#3a2800";
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-sm"
      style={{ background: bg, border: `1px solid ${bdr}`, padding: "3px 10px" }}
    >
      <span className="relative flex h-[5px] w-[5px] shrink-0">
        {isActive && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50"
            style={{ background: dot }} />
        )}
        <span className="relative inline-flex rounded-full h-[5px] w-[5px]" style={{ background: dot }} />
      </span>
      <span style={{ fontFamily: C.ui, fontWeight: 600, fontSize: 11, letterSpacing: "0.1em",
        textTransform: "uppercase", color: dot }}>
        {label}
      </span>
    </span>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="rounded-sm"
      style={{ fontFamily: C.ui, fontWeight: 500, fontSize: 12, color: C.txtMuted,
        background: C.surf2, border: `1px solid ${C.border}`, padding: "4px 10px" }}
    >
      {children}
    </span>
  );
}

function SectionHeader({ left, right }: { left: string; right?: string }) {
  return (
    <div className="flex items-center justify-between px-5 lg:px-6 py-3.5">
      <span style={{ fontFamily: C.ui, fontWeight: 500, fontSize: 11,
        letterSpacing: "0.16em", textTransform: "uppercase", color: C.txtCode }}>
        {left}
      </span>
      {right && (
        <span style={{ fontFamily: C.mono, fontSize: 10,
          letterSpacing: "0.16em", textTransform: "uppercase", color: C.txtCode }}>
          {right}
        </span>
      )}
    </div>
  );
}

function Divider() {
  return <div className="w-full h-px" style={{ background: C.border }} />;
}

/* ════════════════════════════════════════════════════════════════
   MAIN CASE DISPLAY  (left panel — updates on card selection)
════════════════════════════════════════════════════════════════ */
function MainCaseDisplay({ person, visible }: { person: Person; visible: boolean }) {
  const suspect = person.status === "suspect";

  return (
    <div
      className="relative rounded-lg overflow-hidden"
      style={{
        background: C.surf,
        border: `1px solid ${suspect ? C.redDim : C.border}`,
        transition: "border-color 0.35s ease",
      }}
    >
      {/* Accent bar */}
      <div className="h-[2px] w-full" style={{
        background: suspect
          ? `linear-gradient(90deg, ${C.red} 0%, ${C.redDim} 60%, transparent 100%)`
          : `linear-gradient(90deg, transparent 0%, ${C.gold}44 50%, transparent 100%)`,
        transition: "background 0.35s ease",
      }} />

      {/* Animated content */}
      <div
        style={{
          opacity:    visible ? 1 : 0,
          transform:  visible ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.22s ease, transform 0.22s ease",
          padding:    "clamp(20px, 3vw, 32px)",
        }}
      >
        {/* Header row: dossier code + status */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div style={{ fontFamily: C.mono, fontSize: 11, letterSpacing: "0.18em",
              textTransform: "uppercase", color: C.txtCode, marginBottom: 4 }}>
              Dosya — {person.dossierCode}
            </div>
            <div style={{ fontFamily: C.mono, fontSize: 10, letterSpacing: "0.14em",
              textTransform: "uppercase", color: C.border }}>
              {person.codename}
            </div>
          </div>
          <StatusBadge status={person.status} label={person.statusLabel} />
        </div>

        {/* Identity block: image + name/role */}
        <div className="flex items-start gap-5 mb-6">
          {/* Mugshot */}
          <div
            className="shrink-0 rounded-lg overflow-hidden"
            style={{
              width: "clamp(72px, 12vw, 108px)",
              height: "clamp(72px, 12vw, 108px)",
              background: C.surf2,
              border: `1px solid ${suspect ? C.redDim : C.border}`,
              transition: "border-color 0.35s ease",
            }}
          >
            <Image
              src={person.image}
              alt={person.name}
              width={108}
              height={108}
              className="w-full h-full object-contain"
              style={{ opacity: suspect ? 0.8 : 0.75 }}
            />
          </div>

          {/* Name stack */}
          <div className="min-w-0 pt-1">
            <h2
              style={{
                fontFamily: C.display,
                fontSize:   "clamp(30px, 4.5vw, 58px)",
                lineHeight: 0.95,
                letterSpacing: "-0.01em",
                color: suspect ? C.redText : C.txt,
                marginBottom: 10,
                transition: "color 0.35s ease",
              }}
            >
              {person.name}
            </h2>
            <div style={{ fontFamily: C.ui, fontWeight: 500, fontSize: "clamp(13px, 1.6vw, 15px)",
              color: C.txtSec, marginBottom: 4 }}>
              {person.role}
            </div>
            {person.org && (
              <div style={{ fontFamily: C.ui, fontSize: 13, color: C.txtMuted }}>
                {person.org}
              </div>
            )}
          </div>
        </div>

        {/* Separator */}
        <div className="mb-5 h-px" style={{ background: C.border }} />

        {/* Description */}
        <p style={{
          fontFamily: C.ui,
          fontSize:   "clamp(14px, 1.5vw, 15px)",
          lineHeight: 1.85,
          color:      C.txtSec,
          marginBottom: 20,
        }}>
          {person.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {person.tags.map((t) => <Tag key={t}>{t}</Tag>)}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CHARACTER CARD  (right sidebar + mobile strip)
════════════════════════════════════════════════════════════════ */
function CharacterCard({
  person,
  isActive,
  onSelect,
  compact = false,
}: {
  person:   Person;
  isActive: boolean;
  onSelect: () => void;
  compact?: boolean;
}) {
  const suspect  = person.status === "suspect";
  const dotColor = suspect ? C.amberText : C.redText;

  /* ── Compact variant: mobile horizontal strip ── */
  if (compact) {
    return (
      <button
        onClick={onSelect}
        aria-pressed={isActive}
        className="shrink-0 text-left rounded-lg overflow-hidden transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{
          width:      192,
          fontFamily: C.ui,
          background: isActive ? (suspect ? "#130909" : "#0d0c16") : C.surf,
          border:     `1px solid ${isActive ? (suspect ? C.red : C.gold + "80") : C.border}`,
          ["--tw-ring-color" as string]: C.gold,
          ["--tw-ring-offset-color" as string]: C.bg,
        }}
      >
        {/* Active left bar */}
        {isActive && (
          <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg"
            style={{ background: suspect ? C.red : C.gold }} />
        )}
        <div className={cn("flex items-center gap-3 p-3", isActive && "pl-4")}>
          <div className="shrink-0 rounded-md overflow-hidden" style={{
            width: 44, height: 44, background: C.surf2, border: `1px solid ${C.border}`,
          }}>
            <Image src={person.image} alt={person.name} width={44} height={44}
              className="w-full h-full object-contain"
              style={{ opacity: isActive ? 0.9 : 0.55 }} />
          </div>
          <div className="min-w-0">
            <div className="truncate" style={{ fontWeight: 600, fontSize: 13,
              color: isActive ? (suspect ? C.redText : C.txt) : C.txtSec }}>
              {person.name}
            </div>
            <div className="truncate" style={{ fontSize: 11, color: C.txtMuted, marginTop: 2 }}>
              {person.role}
            </div>
          </div>
          <div className="shrink-0 rounded-full h-[5px] w-[5px] ml-auto"
            style={{ background: dotColor, opacity: isActive ? 1 : 0.35 }} />
        </div>
      </button>
    );
  }

  /* ── Full variant: desktop sidebar ── */
  return (
    <button
      onClick={onSelect}
      aria-pressed={isActive}
      className="relative w-full text-left rounded-lg overflow-hidden transition-all duration-200 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{
        fontFamily:  C.ui,
        background:  isActive ? (suspect ? "#130909" : "#0d0c16") : C.surf,
        border:      `1px solid ${isActive ? (suspect ? C.red : C.gold + "80") : C.border}`,
        boxShadow:   isActive
          ? `0 4px 24px rgba(0,0,0,0.4), inset 0 0 0 0 transparent`
          : "none",
        ["--tw-ring-color" as string]: C.gold,
        ["--tw-ring-offset-color" as string]: C.bg,
      }}
      onMouseEnter={(e) => {
        if (!isActive) (e.currentTarget as HTMLElement).style.borderColor = C.borderHi;
      }}
      onMouseLeave={(e) => {
        if (!isActive) (e.currentTarget as HTMLElement).style.borderColor = C.border;
      }}
    >
      {/* Active: vertical left accent */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg transition-opacity duration-200"
        style={{
          background: suspect ? C.red : C.gold,
          opacity:    isActive ? 1 : 0,
        }}
      />

      <div className={cn("flex items-center gap-4 p-4 lg:p-4", isActive && "pl-5")}>
        {/* Mugshot */}
        <div
          className="shrink-0 rounded-md overflow-hidden transition-transform duration-200 group-hover:scale-[1.03]"
          style={{
            width:      64,
            height:     64,
            background: C.surf2,
            border:     `1px solid ${C.border}`,
          }}
        >
          <Image
            src={person.image}
            alt={person.name}
            width={64}
            height={64}
            className="w-full h-full object-contain transition-opacity duration-200"
            style={{ opacity: isActive ? 0.9 : 0.5 }}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div
            className="truncate transition-colors duration-200"
            style={{
              fontWeight: 700,
              fontSize:   15,
              lineHeight: 1.2,
              marginBottom: 4,
              color: isActive ? (suspect ? C.redText : C.txt) : C.txtSec,
            }}
          >
            {person.name}
          </div>
          <div className="truncate" style={{ fontSize: 13, color: C.txtMuted, marginBottom: 3 }}>
            {person.role}
          </div>
          {person.org && (
            <div className="truncate" style={{ fontSize: 12, color: C.txtCode }}>
              {person.org}
            </div>
          )}
        </div>

        {/* Status dot */}
        <div
          className="shrink-0 rounded-full h-[6px] w-[6px] transition-opacity duration-200"
          style={{ background: dotColor, opacity: isActive ? 1 : 0.3 }}
        />
      </div>
    </button>
  );
}

/* ════════════════════════════════════════════════════════════════
   FAQ ITEM
════════════════════════════════════════════════════════════════ */
function FAQItem({
  item, open, onToggle,
}: {
  item: { q: string; a: string };
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b last:border-b-0" style={{ borderColor: C.border }}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-5 lg:px-6 py-4 text-left bg-transparent border-none cursor-pointer group"
      >
        <span
          className="transition-colors duration-150 group-hover:text-[#ede9f8]"
          style={{ fontFamily: C.ui, fontSize: "clamp(13px, 1.4vw, 15px)",
            lineHeight: 1.5, color: C.txtSec }}
        >
          {item.q}
        </span>
        <span
          className="shrink-0 text-[20px] leading-none transition-all duration-200"
          style={{
            fontFamily: C.ui,
            color:    open ? C.gold    : C.txtMuted,
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
          }}
        >
          +
        </span>
      </button>
      <div
        className="overflow-hidden"
        style={{
          maxHeight:  open ? "180px" : "0px",
          opacity:    open ? 1 : 0,
          transition: "max-height 0.3s ease, opacity 0.25s ease",
        }}
      >
        <p
          className="px-5 lg:px-6 pb-4"
          style={{ fontFamily: C.ui, fontSize: "clamp(13px, 1.3vw, 14px)",
            lineHeight: 1.8, color: C.txtMuted }}
        >
          {item.a}
        </p>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════ */
export function HackFullView({ onBack }: HackFullViewProps) {

  /* ── Character selection ─────────────────────────────────────── */
  const [activePerson,   setActivePerson]   = useState<Person>(PEOPLE[0]);
  const [contentVisible, setContentVisible] = useState(true);

  const handleSelect = useCallback((person: Person) => {
    if (person.id === activePerson.id) return;
    setContentVisible(false);
    setTimeout(() => {
      setActivePerson(person);
      setContentVisible(true);
    }, 170);
  }, [activePerson.id]);

  /* ── FAQ ─────────────────────────────────────────────────────── */
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  /* ── Easter eggs ─────────────────────────────────────────────── */
  const [konamiIdx,   setKonamiIdx]   = useState(0);
  const [showKonami,  setShowKonami]  = useState(false);
  const [showStamp,   setShowStamp]   = useState(false);
  const [stampClicks, setStampClicks] = useState(0);
  const [showMcBlock, setShowMcBlock] = useState(false);
  const [mcFlash,     setMcFlash]     = useState(false);
  const mcFireRef  = useRef(false);
  const mcTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { markEggSeen } = useEasterEggs();

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
    }
  };

  const handleMcEnter = useCallback(() => {
    if (mcFireRef.current) return;
    mcTimerRef.current = setTimeout(() => {
      mcFireRef.current = true;
      setMcFlash(true);
      setTimeout(() => setMcFlash(false), 700);
      setShowMcBlock(true);
      markEggSeen("egg-minecraft");
      setTimeout(() => { setShowMcBlock(false); mcFireRef.current = false; }, 2200);
    }, 1500);
  }, [markEggSeen]);

  const handleMcLeave = useCallback(() => {
    if (mcTimerRef.current) { clearTimeout(mcTimerRef.current); mcTimerRef.current = null; }
  }, []);

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <>
      {/* ─── KONAMI OVERLAY ───────────────────────────────────── */}
      {showKonami && (
        <div
          onClick={() => setShowKonami(false)}
          className="fixed inset-0 z-[9998] bg-black/95 flex flex-col items-center justify-center gap-5 p-6 cursor-pointer"
        >
          <p style={{ fontFamily: C.mono, fontSize: 10, letterSpacing: "0.3em",
            textTransform: "uppercase", color: "#4a4828" }}>↑↑↓↓←→←→BA</p>
          <p className="font-display text-[clamp(28px,7vw,56px)] tracking-[0.06em] uppercase"
            style={{ color: C.txt }}>
            Konami Kodu!
          </p>
          <div className="flex gap-8 mt-2">
            <Image src="/dino/dino1.png" alt="Dino" width={180} height={48} className="object-contain opacity-90" />
            <Image src="/beta/beta_kaban.png" alt="Beta" width={180} height={48} className="object-contain opacity-90" />
          </div>
          <p style={{ fontFamily: C.ui, fontSize: 14, color: "#7a7060" }}>
            Gerçek bir dedektifsin, ajan.
          </p>
          <div style={{ fontFamily: C.mono, fontSize: 10, letterSpacing: "0.2em",
            border: `1px solid #2a2818`, color: "#4a4828", padding: "6px 16px", borderRadius: 2 }}>
            EXTRA LIFE +1
          </div>
          <p style={{ fontFamily: C.mono, fontSize: 10, letterSpacing: "0.15em",
            textTransform: "uppercase", color: "#28261e" }}>
            [ tıkla / kapat ]
          </p>
        </div>
      )}

      {/* ─── STAMP OVERLAY ────────────────────────────────────── */}
      {showStamp && (
        <div className="fixed inset-0 z-[8000] pointer-events-none flex items-center justify-center">
          <div
            className="font-display text-[clamp(32px,9vw,64px)] tracking-[0.1em] leading-none"
            style={{
              color: C.red, border: `4px solid ${C.red}`,
              padding: "10px 24px", borderRadius: 3,
              animation: "hck-stamp 2.5s forwards", opacity: 0,
            }}
          >
            GİZLİ DOSYA
          </div>
          <style>{`
            @keyframes hck-stamp {
              0%   { opacity:0; transform:rotate(-12deg) scale(2.2); }
              15%  { opacity:0.9; transform:rotate(-12deg) scale(1); }
              80%  { opacity:0.9; transform:rotate(-12deg) scale(1); }
              100% { opacity:0; transform:rotate(-12deg) scale(1); }
            }
          `}</style>
        </div>
      )}

      {/* ─── PAGE ─────────────────────────────────────────────── */}
      <div style={{ minHeight: "100vh", background: C.bg, color: C.txt,
        fontFamily: C.ui, overflowX: "hidden" }}>

        {/* Sticky nav */}
        <nav
          className="sticky top-0 z-10 flex items-center justify-between border-b"
          style={{
            padding:         "12px clamp(16px, 3vw, 40px)",
            borderColor:     "#12121a",
            background:      "rgba(7,7,9,0.92)",
            backdropFilter:  "blur(14px)",
          }}
        >
          <button
            onClick={onBack}
            className="transition-colors duration-150 bg-transparent border-none cursor-pointer"
            style={{ fontFamily: C.ui, fontWeight: 500, fontSize: 13,
              letterSpacing: "0.04em", color: C.txtMuted }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.color = C.txtSec)}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.color = C.txtMuted)}
          >
            ← Geri
          </button>
          {/* Invisible stamp easter egg trigger */}
          <button
            onClick={handleStampClick}
            tabIndex={-1}
            aria-hidden
            className="bg-transparent border-none cursor-default select-none"
            style={{ fontFamily: C.mono, fontSize: 10, letterSpacing: "0.2em", color: C.bg }}
          >
            HCK-AYD-48
          </button>
        </nav>

        {/* Content */}
        <div
          className="mx-auto"
          style={{ maxWidth: "clamp(320px, 90vw, 1160px)", padding: "clamp(20px, 3vw, 40px) clamp(16px, 3vw, 40px)" }}
        >

          {/* ════ HERO: character dossier + selector ════════════ */}

          {/* Mobile: horizontal card strip → main content */}
          {/* Desktop: main content left | sidebar right        */}
          <div className="flex flex-col lg:flex-row-reverse gap-4 lg:gap-5 mb-4 lg:mb-5">

            {/* CHARACTER SELECTOR ─────────────────────────────── */}
            <div className="lg:w-[268px] xl:w-[296px] shrink-0">

              {/* Mobile: horizontal scroll */}
              <div
                className="lg:hidden"
                style={{ overflowX: "auto", marginLeft: "clamp(-16px, -3vw, -40px)",
                  marginRight: "clamp(-16px, -3vw, -40px)",
                  paddingLeft: "clamp(16px, 3vw, 40px)",
                  paddingRight: "clamp(16px, 3vw, 40px)",
                  paddingBottom: 6,
                  scrollbarWidth: "none",
                }}
              >
                <div className="flex gap-2.5" style={{ width: "max-content" }}>
                  {PEOPLE.map((p) => (
                    <CharacterCard
                      key={p.id}
                      person={p}
                      isActive={activePerson.id === p.id}
                      onSelect={() => handleSelect(p)}
                      compact
                    />
                  ))}
                </div>
              </div>

              {/* Desktop: vertical list */}
              <div className="hidden lg:flex flex-col gap-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span style={{ fontFamily: C.ui, fontWeight: 500, fontSize: 11,
                    letterSpacing: "0.16em", textTransform: "uppercase", color: C.txtCode }}>
                    İstihbarat Dosyası
                  </span>
                  <span style={{ fontFamily: C.mono, fontSize: 10,
                    letterSpacing: "0.14em", color: C.border }}>
                    {PEOPLE.length} AJAN
                  </span>
                </div>
                {PEOPLE.map((p) => (
                  <CharacterCard
                    key={p.id}
                    person={p}
                    isActive={activePerson.id === p.id}
                    onSelect={() => handleSelect(p)}
                  />
                ))}
                <div className="mt-1">
                  <span style={{ fontFamily: C.mono, fontSize: 10,
                    letterSpacing: "0.12em", color: C.txtCode }}>
                    GDG × OTT × HSD
                  </span>
                </div>
              </div>

            </div>

            {/* MAIN CASE DISPLAY ──────────────────────────────── */}
            <div className="flex-1 min-w-0">
              <MainCaseDisplay person={activePerson} visible={contentVisible} />
            </div>

          </div>

          {/* ════ INTEL STRIP ════════════════════════════════════ */}
          <section
            className="rounded-lg border grid grid-cols-4 overflow-hidden mb-4"
            style={{ background: C.surf, borderColor: C.border }}
          >
            {INTEL_STATS.map((item, i) => (
              <div
                key={item.label}
                className={cn(
                  "flex flex-col gap-2 relative transition-colors duration-150",
                  i > 0 && "border-l",
                  "mcEgg" in item && item.mcEgg && mcFlash && "bg-[#141008]"
                )}
                style={{
                  padding: "clamp(12px, 2vw, 20px) clamp(12px, 2vw, 24px)",
                  borderColor: C.border,
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = C.surf2;
                  if ("mcEgg" in item && item.mcEgg) handleMcEnter();
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  if ("mcEgg" in item && item.mcEgg) handleMcLeave();
                }}
              >
                <span style={{ fontFamily: C.ui, fontWeight: 500, fontSize: 11,
                  letterSpacing: "0.12em", textTransform: "uppercase", color: C.txtCode }}>
                  {item.label}
                </span>
                <span style={{ fontFamily: C.display, fontSize: "clamp(15px, 2.2vw, 22px)",
                  letterSpacing: "0.02em", color: C.txtSec }}>
                  {item.value}
                </span>
                {"mcEgg" in item && item.mcEgg && showMcBlock && (
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-10">
                    <svg width="20" height="20" viewBox="0 0 8 8">
                      <rect x="0" y="0" width="8" height="4" fill="#5d9e44" />
                      <rect x="0" y="4" width="8" height="4" fill="#8b6340" />
                    </svg>
                    <span style={{ fontFamily: C.mono, fontSize: 9, color: C.gold,
                      whiteSpace: "nowrap", marginTop: 2 }}>
                      ⛏️ blok düştü
                    </span>
                  </div>
                )}
              </div>
            ))}
          </section>

          {/* ════ PHASE TIMELINE ═════════════════════════════════ */}
          <section
            className="rounded-lg border overflow-hidden mb-4"
            style={{ background: C.surf, borderColor: C.border }}
          >
            <SectionHeader left="Soruşturma Akışı" right="5–6 Mayıs · 2 Gün" />
            <Divider />

            {/* sm+: 4-col grid with day divider row */}
            <div className="hidden sm:block">
              {/* Day labels row */}
              <div className="grid grid-cols-4 border-b" style={{ borderColor: C.border }}>
                {(["GÜN 1 · 5 MAYIS", "", "GÜN 2 · 6 MAYIS", ""] as const).map((label, i) => (
                  <div
                    key={i}
                    className={i > 0 ? "border-l" : ""}
                    style={{
                      padding: "8px clamp(16px, 2.5vw, 24px)",
                      borderColor: C.border,
                      background: i >= 2 ? "#0a0a10" : "transparent",
                    }}
                  >
                    {label && (
                      <span style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: "0.18em",
                        textTransform: "uppercase", color: C.txtCode }}>
                        {label}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              {/* Phase cards */}
              <div className="grid grid-cols-4">
                {PHASES.map((p, i) => (
                  <div
                    key={p.n}
                    className={cn(i > 0 ? "border-l" : "", "transition-colors duration-150")}
                    style={{
                      padding: "clamp(14px, 2vw, 22px) clamp(16px, 2.5vw, 24px)",
                      borderColor: C.border,
                      background: p.accent ? "#0d0a0a" : i >= 2 ? "#0a0a10" : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = p.accent ? "#120c0c" : C.surf2;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = p.accent ? "#0d0a0a" : i >= 2 ? "#0a0a10" : "transparent";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
                      <span style={{ fontFamily: C.mono, fontSize: 10, letterSpacing: "0.14em",
                        color: p.accent ? C.red : C.gold }}>
                        {p.n}
                      </span>
                      <span style={{ fontFamily: C.ui, fontWeight: 600, fontSize: 12,
                        letterSpacing: "0.1em", textTransform: "uppercase",
                        color: p.accent ? C.redText : C.txtSec }}>
                        {p.label}
                      </span>
                    </div>
                    <p style={{ fontFamily: C.ui, fontSize: 13, lineHeight: 1.7, color: C.txtMuted }}>
                      {p.note}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile: vertical with day separator */}
            <div className="sm:hidden">
              {PHASES.map((p, i) => (
                <div key={p.n}>
                  {/* Day header on first phase of each day */}
                  {(i === 0 || PHASES[i].day !== PHASES[i - 1].day) && (
                    <div className="px-5 py-2 border-b" style={{ borderColor: C.border, background: "#0a0a10" }}>
                      <span style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: "0.18em",
                        textTransform: "uppercase", color: C.txtCode }}>
                        {p.day}
                      </span>
                    </div>
                  )}
                  <div
                    className="flex items-start gap-4 border-b last:border-b-0 transition-colors duration-150"
                    style={{ padding: "14px 20px", borderColor: C.border,
                      background: p.accent ? "#0d0a0a" : "transparent" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = p.accent ? "#120c0c" : C.surf2;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = p.accent ? "#0d0a0a" : "transparent";
                    }}
                  >
                    <div>
                      <span style={{ fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em",
                        color: p.accent ? C.red : C.gold, display: "block", marginBottom: 4 }}>
                        {p.n} · {p.label}
                      </span>
                      <p style={{ fontFamily: C.ui, fontSize: 13, lineHeight: 1.7, color: C.txtMuted }}>
                        {p.note}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ════ FAQ ════════════════════════════════════════════ */}
          <section
            className="rounded-lg border overflow-hidden mb-4"
            style={{ background: C.surf, borderColor: C.border }}
          >
            <SectionHeader left="Soru Odası" />
            <Divider />

            {/* Desktop: 2-col */}
            <div className="hidden lg:grid grid-cols-2">
              <div className="border-r" style={{ borderColor: C.border }}>
                {FAQS.slice(0, 2).map((f, i) => (
                  <FAQItem key={f.q} item={f} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
                ))}
              </div>
              <div>
                {FAQS.slice(2).map((f, i) => (
                  <FAQItem key={f.q} item={f} open={openFaq === i + 2} onToggle={() => setOpenFaq(openFaq === i + 2 ? null : i + 2)} />
                ))}
              </div>
            </div>

            {/* Mobile/tablet: single col */}
            <div className="lg:hidden">
              {FAQS.map((f, i) => (
                <FAQItem key={f.q} item={f} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
              ))}
            </div>
          </section>

          {/* ════ CTA ════════════════════════════════════════════ */}
          <section className="flex flex-col sm:flex-row sm:justify-end gap-3 mb-4">
            <Link
              href="/auth/register"
              className="flex-1 flex items-center justify-center gap-2 no-underline rounded-lg transition-all duration-200"
              style={{
                fontFamily: C.display,
                fontSize:   "clamp(14px, 1.5vw, 16px)",
                letterSpacing: "0.08em",
                padding:    "clamp(13px, 1.5vw, 16px) 24px",
                color:      C.txt,
                background: "linear-gradient(135deg, #1c0e0e 0%, #2c1212 100%)",
                border:     `1px solid ${C.redDim}`,
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = C.red;
                el.style.boxShadow   = "0 0 24px rgba(192,57,43,0.2)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = C.redDim;
                el.style.boxShadow   = "none";
              }}
            >
              Vakaya Katıl
              <span style={{ color: C.red }}>→</span>
            </Link>
            <Link
              href="/hackathon/dosya"
              className="flex-1 flex items-center justify-center no-underline rounded-lg transition-all duration-200"
              style={{
                fontFamily:    C.ui,
                fontWeight:    500,
                fontSize:      13,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                padding:       "clamp(13px, 1.5vw, 16px) 24px",
                color:         C.txtMuted,
                background:    "transparent",
                border:        `1px solid ${C.border}`,
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = C.borderHi;
                el.style.color       = C.txtSec;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = C.border;
                el.style.color       = C.txtMuted;
              }}
            >
              Vaka Dosyası
            </Link>
          </section>

          {/* Footer note */}
          <p className="text-center select-none"
            style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: "0.2em",
              textTransform: "uppercase", color: C.bg, paddingBottom: 16 }}>
            Dosya kanıtla kapatılır · Erken erişim ile değil
          </p>

        </div>
      </div>
    </>
  );
}
