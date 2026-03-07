#!/usr/bin/env node
/**
 * Kullanıcıya admin yetkisi verir (admins/{uid} dökümanı oluşturur).
 * Kullanım: node scripts/make-admin.js <email> <sifre>
 */

require('dotenv').config({ path: '.env.local' });
const https = require('https');

const email = process.argv[2];
const sifre = process.argv[3];

if (!email || !sifre) {
  console.error('❌ Kullanım: node scripts/make-admin.js <email> <sifre>');
  process.exit(1);
}

const API_KEY    = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

function request(method, url, body, token) {
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

(async () => {
  // 1. Giriş yap
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

  // 2. admins/{uid} oluştur
  const res = await request(
    'PATCH',
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/admins/${uid}`,
    { fields: { uid: { stringValue: uid }, rol: { stringValue: 'super_admin' } } },
    idToken
  );

  if (res.status === 200) {
    console.log(`✅ admins/${uid} oluşturuldu — ${email} artık admin!`);
  } else {
    console.error('❌ Hata:', JSON.stringify(res.body));
  }
  process.exit(0);
})();
