require('dotenv').config({ path: '.env.local' });
const https = require('https');
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const UID = 'IhCfHoxbcHQsDGEqsAlNuPc6J312';

function r(method, url, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const p = new URL(url);
    const opts = {
      hostname: p.hostname,
      path: p.pathname + p.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
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

(async () => {
  const s = await r('POST',
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
    { email: 'beta@tester.com', password: '12312312A', returnSecureToken: true }
  );
  const token = s.body.idToken;
  const ts = new Date().toISOString();
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${UID}` +
    `?updateMask.fieldPaths=createdAt&updateMask.fieldPaths=updatedAt`;
  const res = await r('PATCH', url, {
    fields: {
      createdAt: { timestampValue: ts },
      updatedAt:  { timestampValue: ts },
    },
  }, token);
  console.log(res.status === 200 ? '✔ createdAt eklendi.' : '❌ ' + JSON.stringify(res.body?.error));
  process.exit(0);
})();
