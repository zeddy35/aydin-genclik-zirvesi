#!/usr/bin/env node

/**
 * Firebase Custom Claims Setup Script
 * 
 * Usage: node scripts/set-admin-claims.js <email>
 * 
 * This script sets admin custom claims for a Firebase user
 * to enable admin panel access without relying on Firestore.
 */

const admin = require("firebase-admin");
const path = require("path");

// Initialize Firebase Admin
const serviceAccountPath = path.join(
  __dirname,
  "../.keys/firebase-service-account.json"
);

try {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} catch (error) {
  console.error("❌ Error loading service account key.");
  console.error(
    "   Make sure to save your Firebase service account to: .keys/firebase-service-account.json"
  );
  process.exit(1);
}

const email = process.argv[2];

if (!email) {
  console.error("❌ Usage: node scripts/set-admin-claims.js <email>");
  console.error("   Example: node scripts/set-admin-claims.js admin@example.com");
  process.exit(1);
}

// Validate email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  console.error("❌ Invalid email format");
  process.exit(1);
}

async function setAdminClaims() {
  try {
    // 1. Find user by email
    console.log(`🔍 Finding user with email: ${email}`);
    const user = await admin.auth().getUserByEmail(email);
    console.log(`✅ Found user: ${user.uid}`);

    // 2. Set custom claims
    console.log(`⚙️  Setting admin custom claims...`);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log(`✅ Custom claims set for ${user.uid}`);

    // 3. Update Firestore user document
    console.log(`📝 Updating Firestore user document...`);
    const userRef = admin.firestore().collection("users").doc(user.uid);
    await userRef.set(
      {
        role: "admin",
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    console.log(`✅ Firestore user document updated`);

    console.log(`\n✨ Admin setup complete for ${email}`);
    console.log(`   User ID: ${user.uid}`);
    console.log(`\n⚠️  Note: User must sign out and back in for claims to take effect.`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

setAdminClaims();
