# Quick Start Guide - Phase 1

## 🚀 Getting Started (5 minutes)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Firebase

Ensure `.env.local` has your Firebase credentials:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
# ... other vars
```

### Step 3: Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000`

---

## 📋 User Workflows

### Register New Account
1. Go to `/auth/register`
2. Fill in name, email, phone
3. Set password (min 6 chars)
4. Check KVKK box
5. Click "Kayıt Ol"
6. Redirected to dashboard

### Apply for Game Jam
1. From dashboard, go to `/gamejam/basvur`
2. Fill profile (school, department, city, etc.)
3. Select roles, engine, experience, etc.
4. Click "Devam Et"
5. Go to `/dashboard/game-submission` to add game link
6. Submit from status page

### Apply for Hackathon
1. Go to `/hackathon/basvur`
2. Fill profile and hackathon info
3. Select tracks and tech stack
4. Click "Devam Et"
5. Go to `/dashboard/trailer` to add trailer link
6. Submit from status page

### Admin: Review Applications
1. Login as admin user
2. Go to `/admin/participants`
3. Filter by status, event, or search
4. Click "✅ Onayla" or "❌ Reddet"
5. Add rejection reason if rejecting
6. Status updates immediately

---

## 🔑 Key Routes

### Public Routes
- `/` - Home
- `/auth/login` - Login
- `/auth/register` - Register
- `/kvkk` - Privacy policy

### Protected Routes (Require Auth)
- `/dashboard/status` - View application status
- `/dashboard/documents` - View documents
- `/dashboard/game-submission` - Game upload (Game Jam)
- `/dashboard/trailer` - Trailer link (Hackathon)
- `/gamejam/basvur` - Game Jam application form
- `/hackathon/basvur` - Hackathon application form

### Admin Routes (Require Admin Role)
- `/admin/participants` - Review applications
- `/admin/participants/[uid]` - View application details (Phase 2)

---

## 🛠 Admin Setup

### Make User Admin

```bash
# Option 1: Use script
node scripts/set-admin-claims.js admin@example.com

# Option 2: Firebase Console
1. Go to Firebase Console → Authentication
2. Click user
3. Custom Claims: {"admin": true}
```

---

## 📊 Database Structure

### Collections

**users/{uid}** - User accounts
- uid, email, name, phone, role, kvkkAccepted, createdAt

**applications/{uid}** - Applications
- uid, eventType, status, profile, eventData, timestamps

**submissions/{uid}** - File submissions
- uid, eventType, gamejam (itchLink), hackathon (trailerUrl)

---

## 🔐 Security

### Firestore Rules (Already Deployed)
- Users read/write only their own data
- Admins read all applications
- Only admins can approve/reject
- No deletion allowed

### API Authentication
All `/api/admin/*` endpoints require Bearer token

---

## 🧪 Testing

### Quick Test Flow
1. Register: `/auth/register`
2. Create App: `/gamejam/basvur`
3. View Status: `/dashboard/status`
4. (Admin) Approve: `/admin/participants`

See `TESTING_GUIDE.md` for detailed tests

---

## 🐛 Troubleshooting

### "Can't connect to Firebase"
- Check `.env.local` configuration
- Verify internet connection
- Check Firebase project is active

### "Permission denied" errors
- Ensure Firestore rules are deployed: `firebase deploy --only firestore:rules`
- Check user is authenticated
- For admin actions, verify admin claim is set

### "Application not found"
- Check user UID matches in database
- Verify Firestore has data

---

## 📱 Mobile Responsive?

Yes! All pages are mobile-first responsive:
- Sidebar collapses on mobile
- Forms stack vertically
- Cards adjust to screen size

---

## 🚢 Deployment (Phase 2)

For now, use development server. Production deployment coming in Phase 2.

```bash
# When ready:
npm run build
firebase deploy
```

---

## 📚 Documentation

- **Full Guide:** `PHASE_1_IMPLEMENTATION.md`
- **Testing:** `TESTING_GUIDE.md`
- **This File:** Quick Start

---

## 🎯 What Works Now (Phase 1)

✅ User authentication
✅ Application creation (Game Jam + Hackathon)
✅ Dashboard with status tracking
✅ Admin panel with filtering
✅ Approve/reject applications
✅ Firestore integration
✅ Protected routes
✅ Admin role system

---

## ⏭️ Coming in Phase 2

- R2 file uploads (presigned URLs)
- Document management
- Production deployment
- Advanced filtering
- Notification system
- Email confirmations

---

## 💡 Tips

- Browser DevTools → Console to debug
- Firebase Console to inspect database
- Check `.env.local` for config issues
- Use `/api/admin/check` to verify admin status

---

## 🤝 Support

Questions? Check:
1. `TESTING_GUIDE.md` for test scenarios
2. `PHASE_1_IMPLEMENTATION.md` for architecture
3. Firebase docs: https://firebase.google.com/docs
4. Next.js docs: https://nextjs.org/docs

---

**Ready to start? Run `npm run dev`!** 🎉
