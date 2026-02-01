"use client";

import React from "react";

export function SummitInfo() {
  return (
    <div className="w-full bg-gradient-to-br from-orange-50 to-amber-50 py-16">
      <div className="max-w-6xl mx-auto px-6">
        {/* About Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-black mb-6">Aydın Gençlik Zirvesi Nedir?</h2>
          <p className="text-lg text-zinc-700 leading-relaxed max-w-3xl">
            Aydın Gençlik Zirvesi, gençlerin teknoloji, yaratıcılık ve yenilikçiliğini gösterebilecekleri bir platform. 
            48 saat boyunca Game Jam ve Hackathon etkinliklerinde hemfikir gençler bir araya geliyor, fikirler ortaya konuyor 
            ve gerçek çözümler ürretiliyor.
          </p>
        </section>

        {/* Stats Section */}
        <section className="mb-20">
          <h3 className="text-2xl font-bold mb-8">Rakamlarla Summit</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100">
              <div className="text-3xl font-black text-purple-600 mb-2">500+</div>
              <p className="text-sm text-zinc-600">Katılımcı</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100">
              <div className="text-3xl font-black text-purple-600 mb-2">50+</div>
              <p className="text-sm text-zinc-600">Takım</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100">
              <div className="text-3xl font-black text-purple-600 mb-2">96h</div>
              <p className="text-sm text-zinc-600">Etkinlik Süresi</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100">
              <div className="text-3xl font-black text-purple-600 mb-2">$50K+</div>
              <p className="text-sm text-zinc-600">Toplam Ödül</p>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="mb-20">
          <h3 className="text-2xl font-bold mb-8">Program Akışı</h3>
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 border-l-4 border-purple-600">
              <p className="font-bold text-zinc-900">Gün 1: Açılış & Ekip Kurma</p>
              <p className="text-sm text-zinc-600 mt-1">Katılımcılar bir araya geliyor, takımlar oluşturuluyor, tema açıklanıyor.</p>
            </div>
            <div className="bg-white rounded-xl p-4 border-l-4 border-blue-600">
              <p className="font-bold text-zinc-900">Gün 2: Geliştirme & Mentorluk</p>
              <p className="text-sm text-zinc-600 mt-1">Tam kapı geliştirme hızında çalışma, mentor desteği ve ara aktiviteler.</p>
            </div>
            <div className="bg-white rounded-xl p-4 border-l-4 border-indigo-600">
              <p className="font-bold text-zinc-900">Gün 3: Final & Sunumlar</p>
              <p className="text-sm text-zinc-600 mt-1">Takımlar projelerini sunuyor, jüriler değerlendiriyor, kazananlar ilan ediliyor.</p>
            </div>
          </div>
        </section>

        {/* Sponsors Section */}
        <section className="mb-20">
          <h3 className="text-2xl font-bold mb-8">Destekçilerimiz</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl h-24 flex items-center justify-center border border-zinc-200 text-zinc-400 text-sm font-medium"
              >
                Sponsor Logo {i}
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section>
          <h3 className="text-2xl font-bold mb-8">Sık Sorulan Sorular</h3>
          <div className="space-y-3">
            {[
              { q: "Katılım ücretsiz mi?", a: "Evet, tamamen ücretsiz." },
              { q: "Tekil başvuru yapabilir miyim?", a: "Evet, kendini takıma katabilirsin veya kendi takımını oluşturabilirsin." },
              { q: "Daha önce katıldığım etkinlikten sonra başvuru yapabilir miyim?", a: "Tabii ki! Tüm gençler davetlidir." },
            ].map((faq, i) => (
              <details
                key={i}
                className="bg-white rounded-xl p-4 border border-zinc-200 cursor-pointer hover:border-purple-300 transition-colors"
              >
                <summary className="font-bold text-zinc-900">{faq.q}</summary>
                <p className="text-zinc-600 mt-3 text-sm">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
