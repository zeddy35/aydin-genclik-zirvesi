#!/usr/bin/env node
/**
 * Firestore'da eksik kullanıcı dökümanlarını oluşturur.
 * Admin SDK yerine Firebase REST API kullanır (service account gerektirmez).
 * Kullanım: node scripts/seed-user.js <email> <sifre>
 */

require('dotenv').config({ path: '.env.local' });
const https = require('https');

const email  = process.argv[2];
const sifre  = process.argv[3];

if (!email || !sifre) {
  console.error('❌ Kullanım: node scripts/seed-user.js <email> <sifre>');
  process.exit(1);
}

const API_KEY    = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

// ── Yardımcı: JSON yüklü HTTPS isteği ─────────────────────────────────────
function request(method, url, body, idToken) {
  return new Promise((resolve, reject) => {
    const data   = body ? JSON.stringify(body) : null;
    const parsed = new URL(url);
    const opts   = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const req = https.request(opts, res => {
      let raw = '';
      res.on('data', c => (raw += c));
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(raw) }));
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

// ── Firestore REST: döküman var mı? ───────────────────────────────────────
async function docExists(idToken, collection, docId) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collection}/${docId}`;
  const res = await request('GET', url, null, idToken);
  return res.status === 200;
}

// ── Firestore REST: döküman yaz (PATCH = create or overwrite) ─────────────
async function setDoc(idToken, collection, docId, fields) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collection}/${docId}`;
  const res = await request('PATCH', url, { fields }, idToken);
  if (res.status !== 200) throw new Error(JSON.stringify(res.body));
}

// ── Firestore değer sarmalayıcıları ───────────────────────────────────────
const sv = v => {
  if (v === null)            return { nullValue: null };
  if (typeof v === 'string') return { stringValue: v };
  if (typeof v === 'boolean')return { booleanValue: v };
  if (typeof v === 'number') return { integerValue: String(v) };
  if (Array.isArray(v))      return { arrayValue: { values: v.map(sv) } };
  return { stringValue: String(v) };
};

async function seedUser() {
  // 1. E-posta/şifreyle giriş yap, idToken al
  console.log(`🔑  ${email} ile giriş yapılıyor…`);
  const signIn = await request(
    'POST',
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
    { email, password: sifre, returnSecureToken: true }
  );
  if (signIn.status !== 200) {
    console.error('❌ Giriş başarısız:', signIn.body?.error?.message);
    process.exit(1);
  }
  const { idToken, localId: uid } = signIn.body;
  console.log(`✔  Giriş başarılı. UID: ${uid}`);

  // 2. users/{uid}
  const userExists = await docExists(idToken, 'users', uid);
  if (!userExists) {
    await setDoc(idToken, 'users', uid, {
      uid:               sv(uid),
      isim:              sv('Beta'),
      soyisim:           sv('Tester'),
      eposta:            sv(email),
      telefon:           sv('05000000000'),
      universite:        sv('Test Üniversitesi'),
      bolum:             sv('Test Bölümü'),
      etkinlikTuru:      sv('hackathon'),
      katilimTuru:       sv('bireysel'),
      takimAdi:          sv(null),
      takimUyeleri:      sv([]),
      motivasyon:        sv('Test kullanıcısı — admin tarafından manuel oluşturuldu.'),
      deneyimSeviyesi:   sv('orta'),
      rol:               sv(['gelistirici']),
      dahaOnceKatildi:   sv(false),
      dahaOnceHangi:     sv(null),
      neOgrenmekIstiyor: sv(null),
      projeFikri:        sv(null),
      createdAt:         { timestampValue: new Date().toISOString() },
      updatedAt:         { timestampValue: new Date().toISOString() },
    });
    console.log(`✔  users/${uid} oluşturuldu.`);
  } else {
    console.log(`ℹ  users/${uid} zaten mevcut, atlandı.`);
  }

  // 3. basvuru_durumlari/{uid}
  const basvuruExists = await docExists(idToken, 'basvuru_durumlari', uid);
  if (!basvuruExists) {
    await setDoc(idToken, 'basvuru_durumlari', uid, {
      kullaniciId:      sv(uid),
      durum:            sv('beklemede'),
      adminNotu:        sv(null),
      adminGizliNot:    sv(null),
      guncelleyenAdmin: sv(null),
    });
    console.log(`✔  basvuru_durumlari/${uid} oluşturuldu.`);
  } else {
    console.log(`ℹ  basvuru_durumlari/${uid} zaten mevcut, atlandı.`);
  }

  console.log('\n✅ Tamamlandı!');
  process.exit(0);
}

seedUser().catch(err => {
  console.error('❌ Hata:', err.message);
  process.exit(1);
});
