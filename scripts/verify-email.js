#!/usr/bin/env node
/**
 * Kullanıcının e-posta doğrulamasını manuel olarak onaylar.
 * Kullanım: node scripts/verify-email.js <email>
 */

require('dotenv').config({ path: '.env.local' });
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

const email = process.argv[2];

if (!email) {
  console.error('❌ Kullanım: node scripts/verify-email.js <email>');
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

(async () => {
  const auth = getAuth();
  const user = await auth.getUserByEmail(email);
  await auth.updateUser(user.uid, { emailVerified: true });
  console.log(`✅ ${email} e-postası doğrulandı! (UID: ${user.uid})`);
  process.exit(0);
})().catch(err => {
  console.error('❌ Hata:', err.message);
  process.exit(1);
});
