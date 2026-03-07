#!/usr/bin/env node
/**
 * Admin hesaplarını Firebase Auth'ta oluşturur ve admins/{uid} dökümanlarını yazar.
 */

require('dotenv').config({ path: '.env.local' });
const https = require('https');

const API_KEY    = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

const ADMINS = [
  { email: 'dinogdg@mail.com',  password: 'AdminDino#$26',  isim: 'Dino',  soyisim: 'GDG' },
  { email: 'betaott@mail.com',  password: 'AdminBeTa$26',   isim: 'Beta',  soyisim: 'Ott' },
  { email: 'pandahsd@mail.com', password: 'AdmiNPndDa$26',  isim: 'Panda', soyisim: 'HSD' },
];

function req(method, url, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const parsed = new URL(url);
    const opts = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const r = https.request(opts, res => {
      let raw = '';
      res.on('data', c => (raw += c));
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(raw) }));
    });
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

async function processAdmin({ email, password, isim, soyisim }) {
  // 1. Önce giriş yapmayı dene (hesap zaten varsa)
  let signIn = await req('POST',
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
    { email, password, returnSecureToken: true }
  );

  let uid, idToken;

  if (signIn.status === 200) {
    uid      = signIn.body.localId;
    idToken  = signIn.body.idToken;
    console.log(`ℹ  ${email} zaten mevcut. UID: ${uid}`);
  } else {
    // 2. Yoksa yeni hesap oluştur
    const signUp = await req('POST',
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
      { email, password, returnSecureToken: true }
    );
    if (signUp.status !== 200) {
      console.error(`❌ ${email} oluşturulamadı:`, signUp.body?.error?.message);
      return;
    }
    uid     = signUp.body.localId;
    idToken = signUp.body.idToken;
    console.log(`✔  ${email} Auth'ta oluşturuldu. UID: ${uid}`);
  }

  // 3. admins/{uid} dökümanı yaz
  const adminRes = await req('PATCH',
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/admins/${uid}`,
    { fields: {
        uid:     { stringValue: uid },
        eposta:  { stringValue: email },
        isim:    { stringValue: isim },
        soyisim: { stringValue: soyisim },
        rol:     { stringValue: 'admin' },
    }},
    idToken
  );

  if (adminRes.status === 200) {
    console.log(`✔  admins/${uid} oluşturuldu → ${email}`);
  } else {
    console.error(`❌ admins/${uid} yazılamadı:`, JSON.stringify(adminRes.body?.error));
  }
}

(async () => {
  for (const admin of ADMINS) {
    await processAdmin(admin);
  }
  console.log('\n✅ Tamamlandı!');
  process.exit(0);
})().catch(err => {
  console.error('❌ Hata:', err.message);
  process.exit(1);
});
