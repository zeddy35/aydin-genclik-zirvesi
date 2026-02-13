// HackFullView.tsx
"use client";

import React from "react";
import Link from "next/link";

interface HackFullViewProps {
  onBack: () => void;
}

export function HackFullView({ onBack }: HackFullViewProps) {
  return (
    <div className="relative h-screen w-full overflow-y-auto bg-gradient-to-br from-zinc-950 via-slate-950 to-black text-white">
      {/* NOIR overlays: grain + spotlight + vignette */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Cpath d='M0 0h1v1H0zM2 2h1v1H2z' fill='%23fff' fill-opacity='0.35'/%3E%3C/svg%3E\")",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.20]"
        style={{
          backgroundImage:
            "radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.35),transparent_40%),radial-gradient(circle_at_80%_85%,rgba(255,255,255,0.18),transparent_45%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 600px at 50% 0%, transparent, rgba(0,0,0,0.65)), radial-gradient(900px 500px at 50% 100%, transparent, rgba(0,0,0,0.75))",
        }}
      />

      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-white/10 bg-black/70 backdrop-blur">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-black tracking-wide text-zinc-300 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 transition-colors"
          >
            ← ANA EKRAN
          </button>

          <h1 className="text-lg sm:text-xl font-black uppercase tracking-[0.22em] text-white">
            HackathOn Aydın
          </h1>

          <div className="w-24" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero */}
        <section className="text-center mb-14 relative">
          <div className="mx-auto mb-6 inline-flex items-center gap-3 rounded-2xl border border-white/15 bg-black/50 px-5 py-3 backdrop-blur">
            <span className="inline-block h-3 w-3 rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.45)]" />
            <span className="text-xs font-black tracking-[0.28em] text-zinc-200 uppercase">
              Noir Edition • 48 Hours
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight mb-3">
            HackathOn Aydın
          </h2>
          <p className="text-xs uppercase tracking-[0.35em] text-zinc-400 mb-6">
            Case File: Build • Ship • Present
          </p>

          <p className="text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto mb-8 leading-relaxed">
            Yenilikçi fikirlerini ürüne dönüştür, çözüm geliştir ve Aydın&apos;a teknoloji getir.
            Karanlıkta parlayan bir fikir varsa, sahne senin.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/hackathon/basvur"
              className="group px-8 py-3 bg-white text-black font-black rounded-xl
                hover:shadow-[0_18px_60px_rgba(255,255,255,0.12)]
                hover:-translate-y-0.5 transition-all ring-1 ring-white/20"
            >
              <span className="relative">
                Başvur
                <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-black transition-all group-hover:w-full" />
              </span>
            </Link>

            <button
              onClick={onBack}
              className="px-8 py-3 border border-white/20 text-white font-black rounded-xl
                hover:bg-white/5 hover:border-white/35 transition-all"
            >
              Detayları Gör
            </button>
          </div>
        </section>

        {/* Noir Divider */}
        <div className="my-10 h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        {/* Feature Panels */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {[
            {
              icon: "💡",
              title: "İnovasyon",
              desc: "Yeni fikirler, yeni çözümler. Sokağın karanlığında bile yol gösteren bir proje.",
            },
            {
              icon: "🕸️",
              title: "Hızlı Geliştirme",
              desc: "Prototipten ürüne: 48 saatte fikir → demo. Net, keskin, teslim.",
            },
            {
              icon: "🕶️",
              title: "Ağlar & Mentorluk",
              desc: "Mentorlarla birebir. Jüri karşısında güçlü anlatı ve gerçek ürün hissi.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="relative bg-zinc-950/40 border border-white/15 rounded-2xl p-6
                shadow-[0_10px_40px_rgba(0,0,0,0.45)]
                hover:border-white/30 hover:-translate-y-1 transition-all"
            >
              <div className="pointer-events-none absolute right-4 top-4 h-10 w-10 rounded-full border border-white/10
                [background:radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.14),transparent_55%)]" />
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="font-black uppercase tracking-wide text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-zinc-300 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </section>

        {/* Info Grid */}
        <section className="relative bg-zinc-950/40 border border-white/15 rounded-2xl p-8 mb-14 overflow-hidden">
          <div className="pointer-events-none absolute inset-0 opacity-[0.10]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, rgba(255,255,255,0.12) 0px, rgba(255,255,255,0.12) 1px, transparent 1px, transparent 6px)",
            }}
          />
          <h3 className="text-xl sm:text-2xl font-black uppercase tracking-wide mb-6">
            Temel Bilgiler
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
            {[
              { label: "BAŞLAMA TARİHİ", value: "Yakında" },
              { label: "YER", value: "Aydın" },
              { label: "SÜRE", value: "48 Saat" },
              { label: "KATILIM", value: "Ücretsiz" },
            ].map((i) => (
              <div key={i.label} className="rounded-xl border border-white/10 bg-black/30 p-4">
                <p className="text-[11px] font-black tracking-[0.24em] text-zinc-400 mb-1">
                  {i.label}
                </p>
                <p className="text-lg font-black text-white">{i.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Noir Timeline */}
        <section className="mb-14">
          <h3 className="text-xl sm:text-2xl font-black uppercase tracking-wide mb-6">
            Akış
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Briefing",
                desc: "Problem alanı, kurallar ve hedefler. Takım eşleşmesi + hızlı yönlendirme.",
              },
              {
                step: "02",
                title: "Build Phase",
                desc: "Kod, tasarım, iş modeli. Mentor checkpoint’leri ile hızlı iterasyon.",
              },
              {
                step: "03",
                title: "Demo Night",
                desc: "Pitch + canlı demo. Jüri değerlendirmesi ve ödül anı.",
              },
            ].map((t) => (
              <div
                key={t.step}
                className="relative rounded-2xl border border-white/15 bg-zinc-950/40 p-6
                  hover:border-white/30 hover:-translate-y-1 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black tracking-[0.35em] text-zinc-400">
                    STEP {t.step}
                  </span>
                  <span className="h-2 w-2 rounded-full bg-white/70" />
                </div>
                <h4 className="text-lg font-black uppercase tracking-wide mb-2">{t.title}</h4>
                <p className="text-sm text-zinc-300 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Footer */}
        <section className="relative rounded-2xl border border-white/15 bg-black/40 p-8 overflow-hidden">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/10 opacity-40" />
          <div className="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-full border border-white/10 opacity-30" />
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative">
            <div>
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-wide">
                Noir sahnesinde yerini al
              </h3>
              <p className="text-sm text-zinc-300 mt-2 max-w-xl">
                Takımın varsa gel. Takımın yoksa da gel — eşleşme ve rol bulma akışı var.
              </p>
            </div>
            <Link
              href="/hackathon/basvur"
              className="group px-8 py-3 bg-white text-black font-black rounded-xl
                hover:shadow-[0_18px_60px_rgba(255,255,255,0.12)]
                hover:-translate-y-0.5 transition-all ring-1 ring-white/20"
            >
              <span className="relative">
                Başvuruyu Aç
                <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-black transition-all group-hover:w-full" />
              </span>
            </Link>
          </div>
        </section>

        <div className="h-16" />
      </div>
    </div>
  );
}
