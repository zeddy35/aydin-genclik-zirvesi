#!/usr/bin/env node
/**
 * Tüm kullanıcı listesini tarar ve isim/email duplikasyonlarını raporlar.
 *
 * Kontrol edilen durumlar:
 *  1. Aynı email birden fazla users dökümanında
 *  2. Aynı isim+soyisim birden fazla users dökümanında
 *  3. Bir users dökümanındaki email, başka bir takımın takimUyeleri'nde de var
 *  4. Bir users dökümanındaki isim+soyisim, başka bir takımın takimUyeleri'nde de var
 *  5. Aynı takım içinde tekrar eden üye (email veya isim)
 *
 * Kullanım: node scripts/duplikasyon-kontrol.js
 */

require('dotenv').config({ path: '.env.local' });
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore }                 = require('firebase-admin/firestore');

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}
const db = getFirestore();

const norm = str => (str ?? '').trim().toLowerCase();
const ad   = u  => `${u.isim ?? ''} ${u.soyisim ?? ''}`.trim();

async function main() {
  console.log('🔍 Kullanıcılar yükleniyor…\n');
  const snap = await db.collection('users').get();
  const kullanicilar = snap.docs.map(d => ({ _uid: d.id, ...d.data() }));
  console.log(`   Toplam ${kullanicilar.length} kullanıcı bulundu.\n`);

  const sorunlar = [];

  // ── 1 & 2: users koleksiyonu kendi içinde email / isim tekrarı ────────────
  const emailIndex = {};
  const isimIndex  = {};

  for (const k of kullanicilar) {
    const email = norm(k.eposta);
    const isim  = norm(ad(k));

    if (email) {
      if (!emailIndex[email]) emailIndex[email] = [];
      emailIndex[email].push(k);
    }
    if (isim) {
      if (!isimIndex[isim]) isimIndex[isim] = [];
      isimIndex[isim].push(k);
    }
  }

  for (const [email, liste] of Object.entries(emailIndex)) {
    if (liste.length > 1) {
      sorunlar.push({
        tip: '📧 Aynı email → birden fazla user dökümanı',
        deger: email,
        satirlar: liste.map(k => `  • [${k._uid}] ${ad(k)} (${k.katilimTuru})`),
      });
    }
  }

  for (const [isim, liste] of Object.entries(isimIndex)) {
    if (liste.length > 1) {
      sorunlar.push({
        tip: '👤 Aynı isim → birden fazla user dökümanı',
        deger: isim,
        satirlar: liste.map(k => `  • [${k._uid}] ${k.eposta} (${k.katilimTuru})`),
      });
    }
  }

  // ── 3 & 4: users dökümanı aynı zamanda başka takımın üyesi mi? ────────────
  const takimlilar = kullanicilar.filter(k => (k.takimUyeleri ?? []).length > 0);

  for (const kaptan of takimlilar) {
    for (const uye of kaptan.takimUyeleri) {
      const uyeEmail = norm(uye.eposta);
      const uyeIsim  = norm(ad(uye));

      // Email eşleşmesi
      if (uyeEmail && emailIndex[uyeEmail]) {
        for (const esles of emailIndex[uyeEmail]) {
          if (esles._uid !== kaptan._uid) {
            sorunlar.push({
              tip: '⚠️  Takım üyesinin emaili ayrıca bir user dökümanında da var',
              deger: uyeEmail,
              satirlar: [
                `  • Takım: ${kaptan.takimAdi ?? ad(kaptan)} (kaptan: ${kaptan.eposta})`,
                `  • User dökümanı: [${esles._uid}] ${ad(esles)} (${esles.katilimTuru})`,
              ],
            });
          }
        }
      }

      // İsim eşleşmesi (email yoksa veya farklıysa)
      if (uyeIsim && isimIndex[uyeIsim]) {
        for (const esles of isimIndex[uyeIsim]) {
          if (esles._uid !== kaptan._uid && norm(esles.eposta) !== uyeEmail) {
            sorunlar.push({
              tip: '👥 Takım üyesinin ismi ayrıca bir user dökümanında da var (farklı email)',
              deger: uyeIsim,
              satirlar: [
                `  • Takım: ${kaptan.takimAdi ?? ad(kaptan)} (kaptan: ${kaptan.eposta})`,
                `  • User dökümanı: [${esles._uid}] ${esles.eposta} (${esles.katilimTuru})`,
              ],
            });
          }
        }
      }
    }
  }

  // ── 5: Aynı takım içinde tekrar eden üye ─────────────────────────────────
  for (const kaptan of takimlilar) {
    const uyeEmailler = {};
    const uyeIsimler  = {};

    for (const uye of kaptan.takimUyeleri) {
      const e = norm(uye.eposta);
      const i = norm(ad(uye));

      if (e) {
        if (!uyeEmailler[e]) uyeEmailler[e] = [];
        uyeEmailler[e].push(uye);
      }
      if (i) {
        if (!uyeIsimler[i]) uyeIsimler[i] = [];
        uyeIsimler[i].push(uye);
      }
    }

    for (const [e, liste] of Object.entries(uyeEmailler)) {
      if (liste.length > 1) {
        sorunlar.push({
          tip: '🔁 Aynı takım içinde tekrar eden üye (email)',
          deger: `${kaptan.takimAdi ?? ad(kaptan)} → ${e}`,
          satirlar: [`  • Kaptan: ${kaptan.eposta}`, `  • ${liste.length}x tekrar`],
        });
      }
    }

    for (const [i, liste] of Object.entries(uyeIsimler)) {
      if (liste.length > 1) {
        sorunlar.push({
          tip: '🔁 Aynı takım içinde tekrar eden üye (isim)',
          deger: `${kaptan.takimAdi ?? ad(kaptan)} → ${i}`,
          satirlar: [`  • Kaptan: ${kaptan.eposta}`, `  • ${liste.length}x tekrar`],
        });
      }
    }
  }

  // ── Rapor ─────────────────────────────────────────────────────────────────
  if (sorunlar.length === 0) {
    console.log('✅ Hiçbir duplikasyon bulunamadı!\n');
    return;
  }

  console.log(`❗ ${sorunlar.length} sorun bulundu:\n`);
  console.log('═'.repeat(60));

  for (const s of sorunlar) {
    console.log(`\n${s.tip}`);
    console.log(`   → ${s.deger}`);
    s.satirlar.forEach(l => console.log(l));
  }

  console.log('\n' + '═'.repeat(60));
  console.log(`\nToplam ${sorunlar.length} sorun.\n`);
}

main().catch(err => {
  console.error('❌ Hata:', err.message);
  process.exit(1);
});
