// JamFullView.tsx
"use client";

import React from "react";
import Link from "next/link";

interface JamFullViewProps {
  onBack: () => void;
}

export function JamFullView({ onBack }: JamFullViewProps) {
  return (
    <div className="relative h-screen w-full overflow-y-auto bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 text-zinc-900">
      {/* Cartoonish floating shapes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-16 -left-16 h-72 w-72 rounded-full bg-purple-200/50 blur-2xl" />
        <div className="absolute top-20 -right-20 h-80 w-80 rounded-full bg-blue-200/50 blur-2xl" />
        <div className="absolute -bottom-24 left-1/4 h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl" />

        {/* Sticker dots */}
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(0,0,0,0.16) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-purple-200/60 bg-white/80 backdrop-blur">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-black text-zinc-700 hover:text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 transition-colors"
          >
            ← Ana Ekran
          </button>

          <h1 className="text-xl sm:text-2xl font-black text-transparent bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text">
            Aydın Game Jam
          </h1>

          <div className="w-24" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-12 relative">
        {/* Hero */}
        <section className="text-center mb-12 relative">
          {/* Arcade badge */}
          <div className="mx-auto mb-6 inline-flex items-center gap-3 rounded-2xl border-2 border-purple-200 bg-white px-5 py-3 shadow-sm">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border-2 border-purple-200 bg-purple-50">
              🎮
            </span>
            <span className="text-xs font-black tracking-[0.18em] text-purple-700 uppercase">
              Jam Mode • 48 Saat
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4">
            <span className="text-transparent bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text">
              Aydın Game Jam
            </span>
          </h2>

          <p className="text-base sm:text-lg text-zinc-700 max-w-2xl mx-auto mb-8 leading-relaxed">
            48 saat boyunca harika oyunlar geliştir, yetenekli takımlar kur ve fikirlerini dünyaya sun.
            Tam bir “cartoonish chaos” — ama üretken.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/gamejam/basvur"
              className="group px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black rounded-2xl
                shadow-[0_12px_30px_rgba(59,130,246,0.25)]
                hover:shadow-[0_18px_40px_rgba(147,51,234,0.25)]
                hover:-translate-y-0.5 transition-all"
            >
              <span className="relative">
                Başvur
                <span className="absolute -bottom-1 left-0 h-[3px] w-0 bg-white/90 rounded-full transition-all group-hover:w-full" />
              </span>
            </Link>

            <button
              onClick={onBack}
              className="px-8 py-3 border-2 border-purple-300 text-purple-700 font-black rounded-2xl bg-white/70
                hover:bg-purple-50 transition-all"
            >
              Detayları Gör
            </button>
          </div>
        </section>

        {/* Sticker cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            {
              icon: "⏱️",
              title: "48 Saatlik Maraton",
              desc: "Hızlı düşün, hızlı geliştir, hızlı sun. Jam ruhu: ‘ship it!’",
              accent: "from-purple-100 to-blue-100",
            },
            {
              icon: "🧩",
              title: "Takım & Roller",
              desc: "Coder, artist, designer, sound… Her rol bir ‘party member’.",
              accent: "from-blue-100 to-indigo-100",
            },
            {
              icon: "🏆",
              title: "Ödüller & Eğlence",
              desc: "Sürpriz ödüller, mini-challenge’lar, sahnede demo keyfi.",
              accent: "from-indigo-100 to-purple-100",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="relative bg-white rounded-3xl border-2 border-purple-100 p-6 shadow-sm
                hover:shadow-md hover:-translate-y-1 transition-all overflow-hidden"
            >
              <div
                className={`pointer-events-none absolute inset-0 opacity-60 bg-gradient-to-br ${f.accent}`}
              />
              <div className="relative">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-black text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-zinc-700 leading-relaxed">{f.desc}</p>
              </div>

              {/* sticker corner */}
              <div className="pointer-events-none absolute right-4 top-4 h-10 w-10 rounded-2xl border-2 border-purple-200 bg-white/70 rotate-6" />
            </div>
          ))}
        </section>

        {/* Info Grid */}
        <section className="bg-white rounded-3xl border-2 border-purple-100 p-8 shadow-sm mb-12">
          <h3 className="text-xl sm:text-2xl font-black mb-6">Temel Bilgiler</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "BAŞLAMA TARİHİ", value: "Yakında" },
              { label: "YER", value: "Aydın" },
              { label: "SÜRE", value: "48 Saat" },
              { label: "KATILIM", value: "Ücretsiz" },
            ].map((i) => (
              <div
                key={i.label}
                className="rounded-2xl border-2 border-purple-100 bg-gradient-to-br from-white to-purple-50 p-4"
              >
                <p className="text-[11px] font-black tracking-[0.18em] text-zinc-500 mb-1">
                  {i.label}
                </p>
                <p className="text-lg font-black text-zinc-900">{i.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Jam Timeline */}
        <section className="mb-12">
          <h3 className="text-xl sm:text-2xl font-black mb-6">Jam Akışı</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "1",
                title: "Theme Reveal",
                desc: "Tema açıklanır. Takımlar kurulur. Hızlı plan + scope belirleme.",
                emoji: "🎭",
              },
              {
                step: "2",
                title: "Build & Playtest",
                desc: "Oyun döngüsü kur → iterate → playtest. ‘Fun factor’ ana metrik.",
                emoji: "🧪",
              },
              {
                step: "3",
                title: "Showcase",
                desc: "Demo + kısa sunum. En yaratıcı fikir, en iyi oynanış, en iyi sanat!",
                emoji: "🎤",
              },
            ].map((t) => (
              <div
                key={t.step}
                className="relative rounded-3xl border-2 border-purple-100 bg-white p-6 shadow-sm
                  hover:shadow-md hover:-translate-y-1 transition-all overflow-hidden"
              >
                <div className="pointer-events-none absolute inset-0 opacity-60 bg-gradient-to-br from-purple-50 to-blue-50" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-black tracking-[0.18em] text-purple-700 uppercase">
                      Step {t.step}
                    </span>
                    <span className="text-2xl">{t.emoji}</span>
                  </div>
                  <h4 className="text-lg font-black mb-2">{t.title}</h4>
                  <p className="text-sm text-zinc-700 leading-relaxed">{t.desc}</p>
                </div>

                {/* cute underline */}
                <div className="pointer-events-none absolute -bottom-3 left-6 h-2 w-20 rounded-full bg-purple-200" />
              </div>
            ))}
          </div>
        </section>

        {/* CTA Footer */}
        <section className="relative rounded-3xl border-2 border-purple-100 bg-white p-8 shadow-sm overflow-hidden">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-purple-100 blur-2xl" />
          <div className="pointer-events-none absolute -left-24 -bottom-24 h-80 w-80 rounded-full bg-blue-100 blur-2xl" />

          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-black">
                Jam’e katıl, oyunu “ship” et 🚀
              </h3>
              <p className="text-sm text-zinc-700 mt-2 max-w-xl">
                Takımın yoksa sorun değil — rol seç, ekip bul, üretmeye başla.
              </p>
            </div>

            <Link
              href="/gamejam/basvur"
              className="group px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black rounded-2xl
                shadow-[0_12px_30px_rgba(59,130,246,0.25)]
                hover:shadow-[0_18px_40px_rgba(147,51,234,0.25)]
                hover:-translate-y-0.5 transition-all"
            >
              <span className="relative">
                Başvuruyu Aç
                <span className="absolute -bottom-1 left-0 h-[3px] w-0 bg-white/90 rounded-full transition-all group-hover:w-full" />
              </span>
            </Link>
          </div>
        </section>

        <div className="h-16" />
      </div>
    </div>
  );
}
