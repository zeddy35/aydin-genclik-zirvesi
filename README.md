# Aydın Gençlik Zirvesi - Başvuru Sistemi

Next.js 16 + Firebase tabanlı Game Jam ve Hackathon başvuru yönetim sistemi.

## 📋 Özellikler

### Faz 1 (MVP - ✅ Tamamlandı)
- ✅ Firebase Authentication (Email/Password)
- ✅ Kullanıcı kayıt ve giriş
- ✅ Game Jam başvuru formu (Firestore entegrasyonu)
- ✅ Kullanıcı Dashboard
  - Başvuru durumu takibi
  - Admin dökümanları görüntüleme
  - Oyun yükleme (Itch.io entegrasyonu)
  - Trailer yükleme (YouTube entegrasyonu)
- ✅ Admin Panel
  - Başvuru listesi ve filtreleme
  - Başvuru onaylama/reddetme
- ✅ Middleware ile route koruması
- ✅ TypeScript tip güvenliği

### Faz 2 (✨ Devam Ediyor)
- ✅ Cloudflare R2 ile dosya yükleme (presigned URLs)
- ✅ ZIP dosya upload (Game Jam) - R2 integration
- ✅ Admin döküman download - presigned URLs
- ✅ Firestore security rules (production-ready)
- ✅ Admin custom claims setup script
- ✅ AWS SDK integration (@aws-sdk/client-s3)
- ⏳ Admin document upload UI (participants page)
- ⏳ End-to-end testing (real R2 bucket)
- ⏳ Production deployment guide

## 🎯 UI/UX Features

- **Horizontal Scroll Snap System**: 3 panel (Game Jam | Split Home | Hackathon)
- **Split-Screen Hero**: Desktop hover genişleme
- **5px Sharp Zigzag Divider**: Path-based SVG divider
- **Responsive Design**: Desktop, tablet, mobile uyumlu
- **Global Lexend Font**: Tüm typography Lexend
- **Custom Colors**: hackathon-green (#57e64c), gamejam-blue (#459ced), hackathon-purple (#9645ed)

## 🛠 Teknolojiler

- **Framework:** Next.js 16.1.6 (App Router)
- **Language:** TypeScript 5
- **Styling:** TailwindCSS 4.0
- **Auth:** Firebase Authentication
- **Database:** Firestore
- **Storage:** Cloudflare R2 (S3-compatible)
- **SDK:** AWS SDK v3 for S3 (@aws-sdk/client-s3, @aws-sdk/s3-request-presigner)
- **Font:** Lexend (all weights)
- **Build:** Turbopack

## 🚀 Kurulum

```

### 3. Firebase Projesi Oluşturma

#### 3.1 Firebase Console
1. [Firebase Console](https://console.firebase.google.com/) gidin
2. "Add Project" → Proje adı girin → Create
3. Authentication → Get Started → Email/Password → Enable

#### 3.2 Firestore Veritabanı
1. Firestore Database → Create Database
2. Start in **test mode** (geliştirme için)
3. Lokasyon seçin (eur3 - Europe)

#### 3.3 Web App Credentials
1. Project Settings → General → Your apps
2. Web app ekleyin (</> icon)
3. App nickname girin
4. Firebase SDK configuration'ı kopyalayın

#### 3.4 Service Account (Admin SDK)
1. Project Settings → Service Accounts
2. "Generate new private key" → JSON indir
3. İçeriği `.env.local` dosyasına ekleyin

### 4. Cloudflare R2 Kurulumu (Faz 2)

#### 4.1 R2 Bucket Oluşturma
1. [Cloudflare Dashboard](https://dash.cloudflare.com/) → R2 Object Storage
2. "Create bucket" → Adı girin (ör: `aydin-genclik-zirvesi`)
3. Lokasyon seçin
4. ✅ Bucket oluşturuldu

#### 4.2 R2 API Token
1. R2 → Settings → API tokens
2. "Create API token" → Adı girin
3. Permissions: "Object Read & Write"
4. TTL: Unlimited (veya istenen süre)
5. Specific bucket: Oluşturduğunuz bucket seçin
6. Token'ı ve Account ID'yi kopyalayın

#### 4.3 R2 CORS Configuration
Presigned URL'ler frontend'ten çalışması için CORS ayarlanmalı:

1. R2 → Settings → CORS
2. Aşağıdaki konfigürasyonu ekleyin:
```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://yourdomain.com"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST"
    ],
    "AllowedHeaders": [
      "*"
    ]
  }
]
```

#### 4.4 Account ID Bulma
- Account ID: Cloudflare Dashboard → R2 → Overview → "S3 API" section
- Format: Genellikle "12345abcde" gibi alphanumeric string

### 5. Environment Variables

`.env.local` dosyası oluşturun:

```env
# Firebase Client (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Firebase Admin (Private)
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQ...\n-----END PRIVATE KEY-----\n"

# Cloudflare R2 (Faz 2)
CLOUDFLARE_R2_ENDPOINT=https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
CLOUDFLARE_R2_ACCESS_KEY_ID=your_r2_access_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_r2_secret_key
CLOUDFLARE_R2_BUCKET_NAME=aydin-genclik-zirvesi

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Not (Firebase Private Key):** JSON'dan kopyalarken `\n` karakterlerini olduğu gibi bırakın ve tırnak içinde kullanın.

**Not (R2 Credentials):** Cloudflare Dashboard → R2 → Settings → API tokens → Token details kopyalayın.

### 5. Development Server

```bash
npm run dev
```

Tarayıcıda açın: [http://localhost:3000](http://localhost:3000)

## 👥 Admin Kullanıcı Oluşturma (Faz 2)

### Otomatik Yöntem (Önerilen)
Custom claims script'ini kullanın:

```bash
# Önce Firebase service account JSON'ı .keys/ klasörüne koyun
# Dosya: .keys/firebase-service-account.json

# Ardından admin claims'i set edin
node scripts/set-admin-claims.js admin@example.com
```

Script çıktısı:
```
✅ User found: admin@example.com (uid: xyz123)
✅ Custom claims set: { "admin": true }
✅ Firestore user document updated: role = "admin"
Admin setup complete!
```

### Manuel Yöntem (Firebase Console)
1. Firebase Console → Firestore Database
2. `users` collection → İlgili kullanıcı dokümanı
3. `role` alanını `admin` olarak düzenleyin
4. Custom claims için: Project Settings → Service Accounts → Admin SDK → Generate key

## 📁 Proje Yapısı

```
app/
  ├── page.tsx                          # Landing page (horizontal scroll)
  ├── auth/
  │   ├── login/page.tsx                # Giriş sayfası
  │   └── register/page.tsx             # Kayıt sayfası
  ├── dashboard/                        # Kullanıcı paneli
  │   ├── layout.tsx                    # Dashboard sidebar
  │   ├── status/page.tsx               # Başvuru durumu
  │   ├── documents/page.tsx            # Admin dökümanları (download)
  │   ├── game-submission/page.tsx      # Oyun yükleme (R2 presigned)
  │   └── trailer/page.tsx              # Trailer yükleme
  ├── api/                              # API routes (Faz 2)
  │   ├── upload/
  │   │   └── presigned/route.ts        # Presigned upload URL generation
  │   └── download/
  │       └── [key]/route.ts            # Presigned download URL (auth check)
  ├── admin/
  │   ├── layout.tsx                    # Admin panel layout
  │   └── participants/page.tsx         # Katılımcı yönetimi
  ├── gamejam/basvur/page.tsx           # Game Jam başvuru formu
  └── hackathon/basvur/page.tsx         # Hackathon başvuru formu

components/
  ├── auth/
  │   ├── AuthProvider.tsx              # Auth context
  │   └── ProtectedRoute.tsx            # Route guard
  ├── HeroExperience.tsx                # Horizontal scroll container
  ├── ZigZagDivider.tsx                 # SVG divider
  └── PanelSplit.tsx                    # Split panel

lib/
  ├── firebase.ts                       # Firebase client SDK
  ├── firebase-admin.ts                 # Firebase Admin SDK
  ├── r2.ts                             # R2 presigned URL utilities (Faz 2)
  └── cn.ts                             # Utility

types/
  └── firestore.ts                      # Firestore type definitions

scripts/
  ├── set-admin-claims.js               # Admin claims automation (Faz 2)
  └── .gitkeep                          # Directory marker

middleware.ts                           # Route protection
firestore.rules                         # Firestore security rules (Faz 2)
```

## 🗄️ Firestore Collections

### `users`
```typescript
{
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: "user" | "admin";
  createdAt: string;
}
```

### `applications`
```typescript
{
  uid: string; // Document ID = User UID
  eventType: "gamejam" | "hackathon";
  status: "draft" | "submitted" | "approved" | "rejected";
  profile: {
    school: string;
    department: string;
    city: string;
  };
  eventData: GameJamEventData | HackathonEventData;
  adminDocs: AdminDocument[];
  timestamps: {
    createdAt: string;
    submittedAt?: string;
    reviewedAt?: string;
  };
}
```

### `submissions`
```typescript
{
  uid: string; // Document ID = User UID
  eventType: "gamejam" | "hackathon";
  gamejam?: {
    gameUpload?: { 
      key: string;           // R2 path (submissions/gamejam/...)
      size: number;          // File size in bytes
      uploadedAt: string;    // ISO timestamp
    };
    itchLink?: string;
  };
  hackathon?: {
    trailerUrl?: string;
  };
}
```

## 🔄 Faz 2 - API Endpoints (R2 Integration)

### Presigned Upload URL
**POST** `/api/upload/presigned`

Presigned URL oluşturur (client'ın R2'ye direkt upload yapması için).

**Request:**
```json
{
  "fileName": "my-game.zip",
  "contentType": "application/zip",
  "eventType": "gamejam"  // "gamejam" veya "admin"
}
```

**Response:**
```json
{
  "presignedUrl": "https://r2.cloudflarestorage.com/...",
  "key": "submissions/gamejam/uid-123456.zip",
  "expiresIn": 3600
}
```

**Auth:** Firebase ID Token (Bearer header) gerekli
**File Types:**
- `gamejam`: `.zip` dosyaları
- `admin`: `.pdf`, `.png`, `.jpg`, `.docx` dosyaları

**Kullanım (Frontend):**
```typescript
// 1. Presigned URL al
const response = await fetch("/api/upload/presigned", {
  method: "POST",
  headers: { "Authorization": `Bearer ${token}` },
  body: JSON.stringify({
    fileName: "game.zip",
    contentType: "application/zip",
    eventType: "gamejam"
  })
});
const { presignedUrl, key } = await response.json();

// 2. Dosyayı presigned URL'ye yükle
const uploadResponse = await fetch(presignedUrl, {
  method: "PUT",
  headers: { "Content-Type": "application/zip" },
  body: zipFile
});

// 3. Firestore'a metadata kaydet
await setDoc(doc(db, "submissions", uid), {
  gamejam: { gameUpload: { key, size: zipFile.size, uploadedAt: new Date().toISOString() } }
}, { merge: true });
```

### Presigned Download URL
**GET** `/api/download/[key]`

Presigned download URL'ye yönlendirme (autorization check ile).

**Parameters:**
- `key`: R2 object key (URL-encoded)
- `Authorization` header: Firebase ID Token (Bearer)

**Response:**
- `302 Redirect` presigned URL'ye

**Auth:** Firebase ID Token gerekli
**Access Control:**
- `admin-docs/*`: Admin rolü gerekli
- `submissions/*`: Dosya sahibi olmalısın

**Kullanım (Frontend):**
```typescript
// 1. Firestore'dan document key'i al
const doc = adminDocuments[0]; // { key: "admin-docs/..." }

// 2. Download API'ye çağrı yap
const response = await fetch(`/api/download/${encodeURIComponent(doc.key)}`, {
  headers: { "Authorization": `Bearer ${token}` }
});

// 3. Browser oto-indir yapar
window.location.href = response.url;
```

## 🧪 Test Senaryoları

### Kullanıcı Akışı
1. ✅ Kayıt ol (`/auth/register`)
2. ✅ Giriş yap (`/auth/login`)
3. ✅ Game Jam başvurusu yap (`/gamejam/basvur`)
4. ✅ Dashboard'a yönlendir (`/dashboard/status`)
5. ✅ Başvuru durumunu görüntüle
6. ✅ Itch.io linki ekle (`/dashboard/game-submission`)
7. ✅ Çıkış yap

### Admin Akışı
1. ✅ Admin hesabıyla giriş yap
2. ✅ Admin paneline git (`/admin/participants`)
3. ✅ Başvuruları filtrele (status, event type, search)
4. ✅ Başvuru onayla/reddet
5. ✅ Durum değişikliğini doğrula

## 🔒 Güvenlik (Faz 2)

### Firestore Security Rules
Production-ready rules `firestore.rules` dosyasında:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isOwner(uid) {
      return request.auth.uid == uid;
    }
    
    function hasRole(uid, role) {
      return get(/databases/$(database)/documents/users/$(uid)).data.role == role;
    }

    // Users Collection
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isOwner(userId) && request.resource.data.role == 'user';
      allow update: if isOwner(userId) || isAdmin();
    }

    // Applications Collection
    match /applications/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isOwner(userId) && request.resource.data.status == 'submitted';
      allow update: if (isOwner(userId) && resource.data.status == 'draft') || isAdmin();
    }

    // Submissions Collection
    match /submissions/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow write: if isOwner(userId);
    }
  }
}
```

**Deploy Rules:**
```bash
firebase deploy --only firestore:rules
```

### API Authentication
- Token-based: Firebase ID Token (Bearer header)
- Endpoint'ler: `/api/upload/presigned`, `/api/download/[key]`
- Verification: Admin SDK ile server-side doğrulama

### API Authorization
**Upload Endpoint** (`/api/upload/presigned`):
- Authenticated user gerekli
- File type validation: whitelist ile sadece izin verilen türler

**Download Endpoint** (`/api/download/[key]`):
- Authenticated user gerekli
- Role check: `admin-docs` → admin only
- Ownership check: `submissions/{uid}` → owner only

### R2 Access Control
- Presigned URLs: 1 saat geçerli (upload), 24 saat (download)
- Key naming: Ownership verification için UID embedded
  - `submissions/gamejam/{uid}-{timestamp}.zip`
  - `admin-docs/{uid}-{timestamp}-{randomId}.{ext}`

## 📦 Build & Deploy

### Production Build
```bash
npm run build
npm run start
```

### Deployment (Öneriler)
- **Vercel:** Automatic deployment from GitHub
- **Firebase Hosting:** 
  ```bash
  npm install -g firebase-tools
  firebase login
  firebase init hosting
  npm run build
  firebase deploy
  ```

## 🐛 Bilinen Sorunlar

1. **Middleware Deprecation Warning:** Next.js 16.1.6 "middleware" → "proxy" uyarısı (non-blocking)
2. **Admin Document Upload UI:** Participants page'de dokument upload UI henüz UI'ya integrate edilmedi (API ready)

## 🚀 Deployment (Production)

### Firestore Security Rules
```bash
firebase deploy --only firestore:rules
```

### Environment Variables (Production)
1. Cloudflare Dashboard → R2 → Real API token oluştur
2. `.env.local` değişkenleri production values ile güncelle
3. Firebase Project Settings → Service Account'tan fresh key indir

### Vercel Deployment
1. GitHub'a push et
2. Vercel → Project bağla
3. Environment variables ekle (`.env.local` değişkenleri)
4. Deploy

### Firebase Hosting (Alternative)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

### Performance Optimization
- R2 presigned URLs: 1-24 saat expiry (load'ı azaltır)
- Client-side upload: Sunucuya traffic yüklememesi
- Firestore indexes: Query performance için otomatik create

## 🧪 Test Senaryoları (Faz 2)

### Presigned Upload Test
```bash
# 1. Game Jam başvurusunda
# → Oyun ZIP yükleme (dashboard/game-submission)
# → Upload progress görmeli
# → Itch.io linki save etme devam etmeli

# 2. Kontrol etmek için
# → Firebase: submissions/{uid}.gamejam.gameUpload 
# → R2: submissions/gamejam/{uid}-*.zip dosyası
```

### Presigned Download Test
```bash
# 1. Admin dökümanları indir
# → Dashboard/documents sayfasında download button
# → İndir (docs kodu)

# 2. Non-owner olarak test
# → Başka user'ın submission'ını download etmeye çalış
# → 403 Forbidden hata almalı
```

### Admin Claims Test
```bash
# 1. Setup script çalıştır
node scripts/set-admin-claims.js admin@example.com

# 2. Kontrol et
# → Firebase Console → Authentication → Custom claims
# → Firestore → users/{uid} → role = "admin"

# 3. Admin panel erişim testa et
# → Admin user'la giriş yap
# → /admin/participants erişebilmeli
```

## 📝 TODO (Faz 2)

- [x] Cloudflare R2 bucket kurulumu guide
- [x] Presigned upload API endpoint (`/api/upload/presigned`)
- [x] Presigned download API endpoint (`/api/download/[key]`)
- [x] ZIP file upload (Game Jam) - UI + API integration
- [x] Admin document download - UI + API integration
- [x] Firestore security rules (production-ready)
- [x] Admin custom claims setup script (`scripts/set-admin-claims.js`)
- [x] AWS SDK integration (@aws-sdk/client-s3)
- [ ] Admin document upload UI (participants page)
- [ ] End-to-end testing (real R2 bucket + credentials)
- [ ] Production deployment guide (Vercel + Firebase Hosting)
- [ ] Email notifications (başvuru onaylandı/reddedildi)
- [ ] Rate limiting API endpoints
- [ ] Logging & monitoring

## � Route Yapısı

| Route                      | Açıklama                   | Auth  |
|----------------------------|----------------------------|-------|
| `/`                        | Landing page (3-panel)     | ❌     |
| `/auth/login`              | Giriş sayfası              | ❌     |
| `/auth/register`           | Kayıt sayfası              | ❌     |
| `/gamejam/basvur`          | Game Jam başvuru formu     | ✅     |
| `/hackathon/basvur`        | Hackathon başvuru formu    | ✅     |
| `/dashboard/status`        | Başvuru durumu             | ✅     |
| `/dashboard/documents`     | Admin dökümanları          | ✅     |
| `/dashboard/game-submission` | Oyun yükleme (Game Jam)  | ✅     |
| `/dashboard/trailer`       | Trailer (Hackathon)        | ✅     |
| `/admin/participants`      | Katılımcı yönetimi         | ✅ 👑 |

**Auth:** ✅ = Giriş gerekli | ✅ 👑 = Admin gerekli

## 🚨 Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"
→ `.env.local` dosyasında `NEXT_PUBLIC_FIREBASE_*` değişkenleri eksik

### "Failed to fetch applications"
→ Firestore Database henüz oluşturulmamış veya yanlış region

### "Middleware redirecting to login"
→ Firebase Auth session cookie henüz implement edilmedi (Faz 1'de client-side auth)

### Admin panel erişim sorunu
→ Firestore `users/{uid}` dokümanında `role: "admin"` olmalı

### R2 Upload Hatası: "The request signature we calculated does not match the signature provided"
→ Cloudflare R2 credentials yanlış veya expired
→ `.env.local` değişkenleri tekrar kontrol et

### "CORS error" presigned upload'ta
→ R2 CORS configuration eksik
→ Dashboard → R2 → Settings → CORS'a aşağıdaki config ekle:
```json
[{
  "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
  "AllowedMethods": ["GET", "PUT", "POST"],
  "AllowedHeaders": ["*"]
}]
```

### "403 Forbidden" download'ta
→ User'ın download hakı yok
→ `/api/download/[key]` authorization check başarısız
→ Firestore logs'a bak: admin olmayan user admin-docs download etmeye çalışması?

### Firestore Rules Deploy Hatası
```bash
# Hata: "Missing or insufficient permissions"
firebase deploy --only firestore:rules -v

# Çözüm: 
# 1. Firebase CLI login yenile: firebase logout && firebase login
# 2. Proje seç: firebase use --add
# 3. Tekrar deploy et
```

## 🤝 Katkıda Bulunma

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 Lisans

MIT License

---

**Faz 1 tamamlandı! 🎉 Faz 2 core infrastructure ready! 🚀**

### Faz 2 Yapılan İşler
- ✅ Cloudflare R2 bucket integration (presigned URLs)
- ✅ Game Jam ZIP upload (R2 storage)
- ✅ Admin document download (presigned URLs)
- ✅ Firestore security rules (production-ready)
- ✅ Admin custom claims setup script

### Faz 2 Devam Edecekler
- ⏳ Admin document upload UI (participants page)
- ⏳ End-to-end testing
- ⏳ Production deployment guide

Test et ve geri bildirim ver! 🎉

