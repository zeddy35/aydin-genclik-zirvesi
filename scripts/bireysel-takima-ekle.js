#!/usr/bin/env node
/**
 * Bireysel başvuruları takımlara ekler.
 *
 * Kullanım (tek çift):
 *   node scripts/bireysel-takima-ekle.js bireysel@mail.com kaptan@mail.com
 *
 * Kullanım (CSV dosyası — her satır: bireysel_mail,kaptan_mail):
 *   node scripts/bireysel-takima-ekle.js atamalar.csv
 */

require('dotenv').config({ path: '.env.local' });
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue }      = require('firebase-admin/firestore');
const { getAuth }                       = require('firebase-admin/auth');
const fs   = require('fs');
const path = require('path');

// ── Firebase Admin başlat ─────────────────────────────────────────────────
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}
const db   = getFirestore();
const auth = getAuth();

// ── Maile göre kullanıcı bul ──────────────────────────────────────────────
async function kullaniciBulMail(eposta) {
  const snap = await db.collection('users')
    .where('eposta', '==', eposta)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

// ── Tek atama işlemi ──────────────────────────────────────────────────────
async function ata(bireyselMail, kaptanMail) {
  console.log(`\n▶  ${bireyselMail}  →  takım kaptanı: ${kaptanMail}`);

  const [bireysel, kaptan] = await Promise.all([
    kullaniciBulMail(bireyselMail),
    kullaniciBulMail(kaptanMail),
  ]);

  if (!bireysel) {
    console.error(`   ❌ Bireysel kullanıcı bulunamadı: ${bireyselMail}`);
    return false;
  }
  if (!kaptan) {
    console.error(`   ❌ Kaptan bulunamadı: ${kaptanMail}`);
    return false;
  }
  // Her iki durumda da işlem aynı:
  // - kaptan zaten takımsa → bireysel takıma eklenir
  // - kaptan bireyselise  → kaptan takım yapılır, bireysel üye olarak eklenir

  // Bireysel başvuranı TakimUyesi olarak oluştur
  const yeniUye = {
    isim:       bireysel.isim       ?? '',
    soyisim:    bireysel.soyisim    ?? '',
    eposta:     bireysel.eposta     ?? '',
    telefon:    bireysel.telefon    ?? '',
    universite: bireysel.universite ?? '',
    bolum:      bireysel.bolum      ?? '',
  };

  // Kaptanın zaten bu üyeyi içerip içermediğini kontrol et
  const mevcutUyeler = kaptan.takimUyeleri ?? [];
  if (mevcutUyeler.some(u => u.eposta === bireyselMail)) {
    console.log(`   ℹ️  ${bireyselMail} zaten takımda, atlandı.`);
    return true;
  }

  const takimAdi = kaptan.takimAdi || `${kaptan.isim} ${kaptan.soyisim} Takımı`;

  // 1. Kaptan dökümanına üye ekle, katilimTuru'nu takım yap
  await db.collection('users').doc(kaptan.id).update({
    takimUyeleri: FieldValue.arrayUnion(yeniUye),
    katilimTuru:  'takim',
    takimAdi:     takimAdi,
    updatedAt:    new Date(),
  });

  // 2. Bireysel kullanıcının Firestore dökümanlarını sil
  await Promise.all([
    db.collection('users').doc(bireysel.id).delete(),
    db.collection('basvuru_durumlari').doc(bireysel.id).delete().catch(() => {}),
    db.collection('belgeler') // bireysel'e ait belgeleri de sil
      .where('kullaniciId', '==', bireysel.id).get()
      .then(snap => Promise.all(snap.docs.map(d => d.ref.delete())))
      .catch(() => {}),
  ]);

  // 3. Firebase Auth hesabını sil
  try {
    await auth.deleteUser(bireysel.id);
    console.log(`   🗑  Firebase Auth hesabı silindi: ${bireyselMail}`);
  } catch (e) {
    console.warn(`   ⚠️  Auth hesabı silinemedi (${e.code}): ${bireyselMail}`);
  }

  console.log(`   ✅ ${bireysel.isim} ${bireysel.soyisim} → "${takimAdi}" eklendi, user silindi.`);
  return true;
}

// ── Giriş argümanlarını çöz ───────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('❌ Kullanım:');
    console.error('   node scripts/bireysel-takima-ekle.js bireysel@mail.com kaptan@mail.com');
    console.error('   node scripts/bireysel-takima-ekle.js atamalar.csv');
    process.exit(1);
  }

  let cifter = [];

  if (args.length === 2) {
    // Tek çift
    cifter = [[args[0].trim(), args[1].trim()]];
  } else if (args.length === 1) {
    // CSV dosyası
    const dosya = path.resolve(args[0]);
    if (!fs.existsSync(dosya)) {
      console.error(`❌ Dosya bulunamadı: ${dosya}`);
      process.exit(1);
    }
    cifter = fs.readFileSync(dosya, 'utf8')
      .split('\n')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('#'))
      .map(s => s.split(',').map(x => x.trim()));

    const hatali = cifter.filter(c => c.length !== 2);
    if (hatali.length) {
      console.error('❌ CSV formatı hatalı (her satır: bireysel_mail,kaptan_mail):');
      hatali.forEach(h => console.error('  ', h.join(',')));
      process.exit(1);
    }
  } else {
    console.error('❌ Çok fazla argüman.');
    process.exit(1);
  }

  console.log(`\n🚀 ${cifter.length} atama işlenecek…`);
  let basarili = 0, basarisiz = 0;

  for (const [bireysel, kaptan] of cifter) {
    const ok = await ata(bireysel, kaptan);
    ok ? basarili++ : basarisiz++;
  }

  console.log(`\n── Sonuç ──────────────────────────────`);
  console.log(`   ✅ Başarılı : ${basarili}`);
  if (basarisiz > 0)
    console.log(`   ❌ Başarısız: ${basarisiz}`);
  console.log('');
  process.exit(basarisiz > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('❌ Beklenmeyen hata:', err.message);
  process.exit(1);
});
