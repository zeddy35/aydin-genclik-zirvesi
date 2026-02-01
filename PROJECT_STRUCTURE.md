# Project Structure & Architecture

## Directory Layout

```
aydin-genclik-zirvesi/
├── app/                           # Next.js App Router
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx          # Login page (public)
│   │   └── register/
│   │       └── page.tsx          # Registration page (public)
│   ├── dashboard/                # Protected dashboard area
│   │   ├── layout.tsx            # Dashboard layout with sidebar
│   │   ├── status/
│   │   │   └── page.tsx          # Application status page
│   │   ├── documents/
│   │   │   └── page.tsx          # View admin documents
│   │   ├── game-submission/
│   │   │   └── page.tsx          # Game Jam: ZIP + Itch.io
│   │   └── trailer/
│   │       └── page.tsx          # Hackathon: Trailer link
│   ├── admin/                    # Protected admin area
│   │   ├── layout.tsx            # Admin layout
│   │   └── participants/
│   │       └── page.tsx          # Participant management
│   ├── gamejam/
│   │   └── basvur/
│   │       └── page.tsx          # Game Jam application form
│   ├── hackathon/
│   │   └── basvur/
│   │       └── page.tsx          # Hackathon application form
│   ├── api/                      # API routes
│   │   ├── admin/
│   │   │   ├── action/
│   │   │   │   └── route.ts      # Approve/reject endpoint
│   │   │   └── check/
│   │   │       └── route.ts      # Check admin status
│   │   ├── download/
│   │   │   └── [key]/
│   │   │       └── route.ts      # File download (Phase 2)
│   │   └── upload/
│   │       └── presigned/
│   │           └── route.ts      # Presigned upload (Phase 2)
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # React components
│   ├── auth/
│   │   ├── AuthProvider.tsx      # Auth context provider
│   │   └── ProtectedRoute.tsx    # Route protection component
│   ├── dashboard/
│   │   └── DashboardLayout.tsx   # Dashboard sidebar layout
│   ├── EasterEggProvider.tsx     # Easter egg provider
│   ├── EasterToast.tsx           # Toast notifications
│   ├── HeroExperience.tsx        # Hero section
│   ├── PanelSplit.tsx            # Split panel layout
│   ├── footer/
│   │   ├── CreditsCrawlOverlay.tsx
│   │   ├── Footer.tsx
│   │   └── StarfieldCanvas.tsx
│   ├── sections/
│   │   └── SummitInfo.tsx
│   └── views/
│       ├── HackFullView.tsx
│       └── JamFullView.tsx
├── lib/                          # Utilities and helpers
│   ├── firebase.ts               # Client Firebase config
│   ├── firebase-admin.ts         # Server Firebase admin config
│   ├── applications.ts           # Application management
│   ├── r2.ts                     # Cloudflare R2 (Phase 2)
│   ├── cn.ts                     # Classname utilities
│   └── hooks/
│       └── useAdminActions.ts    # Admin actions hook
├── types/
│   └── firestore.ts              # Firestore type definitions
├── public/                       # Static files
│   ├── logos/
│   └── site.webmanifest
├── scripts/
│   └── set-admin-claims.js       # Admin setup script
├── middleware.ts                 # Next.js middleware
├── tsconfig.json                 # TypeScript config
├── package.json                  # Dependencies
├── .env.local                    # Environment variables
├── .env.example                  # Environment template
├── next.config.ts                # Next.js config
├── postcss.config.mjs            # PostCSS config
├── tailwind.config.ts            # Tailwind config
├── eslint.config.mjs             # ESLint config
├── firestore.rules               # Firestore security rules
├── README.md                     # Main readme
├── QUICKSTART.md                 # Quick start guide
├── PHASE_1_IMPLEMENTATION.md     # Detailed implementation guide
├── TESTING_GUIDE.md              # Testing guide
├── PHASE_1_COMPLETE.md           # Completion summary
└── PROJECT_STRUCTURE.md          # This file
```

## Component Architecture

```
┌─────────────────────────────────────────────┐
│         App / Layout                        │
│         (Root provider, theme)              │
└────────────────────┬────────────────────────┘
                     │
     ┌───────────────┼───────────────┐
     │               │               │
     ▼               ▼               ▼
┌─────────┐    ┌─────────┐    ┌──────────┐
│  Auth   │    │Dashboard│    │  Admin   │
│ Pages   │    │ Pages   │    │  Pages   │
└────┬────┘    └────┬────┘    └────┬─────┘
     │              │              │
     └──────────────┼──────────────┘
                    │
            ┌───────┴────────┐
            │                │
            ▼                ▼
      ┌──────────┐    ┌──────────────┐
      │AuthProvider   │ProtectedRoute│
      └──────────┘    └──────────────┘
            │                │
            └────────┬───────┘
                     │
            ┌────────▼─────────┐
            │  Firebase Auth   │
            │  & Firestore     │
            └──────────────────┘
```

## Data Flow

### Authentication Flow
```
1. User Register/Login
   ↓
2. Firebase Auth
   ↓
3. Auth Context Updated
   ↓
4. Firestore User Doc Created
   ↓
5. Session Stored
   ↓
6. Redirected to Dashboard
```

### Application Submission Flow
```
1. User fills form
   ↓
2. Create Application (draft)
   ↓
3. Store in Firestore: applications/{uid}
   ↓
4. Redirect to submission page
   ↓
5. User adds files/links
   ↓
6. Submit for review
   ↓
7. Status changes to "submitted"
   ↓
8. Admin receives notification (Phase 2)
```

### Admin Approval Flow
```
1. Admin views participants
   ↓
2. Filter/search applications
   ↓
3. Click Approve/Reject
   ↓
4. API call with Bearer token
   ↓
5. Verify admin claim
   ↓
6. Update Firestore status
   ↓
7. User sees status change
```

## Firebase Integration

### Client SDK (CSR)
```typescript
// lib/firebase.ts
- initializeApp()
- getAuth() - Authentication
- getFirestore() - Firestore database
```

### Admin SDK (SSR)
```typescript
// lib/firebase-admin.ts
- initializeApp()
- getAuth() - User management
- getFirestore() - Database access
```

### Firestore Collections

#### users/{uid}
```
uid: string
email: string
name: string
phone: string (optional)
role: "user" | "admin"
kvkkAccepted: boolean
kvkkAcceptedAt: Timestamp
createdAt: Timestamp
updatedAt: Timestamp
```

#### applications/{uid}
```
uid: string
eventType: "gamejam" | "hackathon"
status: "draft" | "submitted" | "approved" | "rejected"
statusReason: string (optional)
profile:
  - school: string
  - department: string
  - city: string
  - grade: string (optional)
  - birthDate: string (optional)
eventData:
  (GameJamEventData | HackathonEventData)
adminDocs: AdminDocument[]
timestamps:
  - createdAt: Timestamp
  - submittedAt: Timestamp (optional)
  - reviewedAt: Timestamp (optional)
  - reviewedBy: string (optional)
```

#### submissions/{uid}
```
uid: string
eventType: "gamejam" | "hackathon"
gamejam:
  - gameUpload: { key, url, size, uploadedAt }
  - itchLink: string
hackathon:
  - trailerUrl: string
```

## API Endpoints

### Authentication
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
```

### Admin (Protected)
```
POST /api/admin/action
  - Approve/reject applications
  - Requires: Bearer token, admin claim

GET /api/admin/check
  - Verify admin status
  - Requires: Bearer token
```

### File Management (Phase 2)
```
GET /api/download/[key]
  - Download file
  - Requires: Bearer token

POST /api/upload/presigned
  - Get presigned upload URL
  - Requires: Bearer token

POST /api/r2/presign
  - Cloudflare R2 presign
  - Requires: Bearer token

POST /api/r2/commit
  - Finalize R2 upload
  - Requires: Bearer token
```

## Type Definitions

### Enums
```typescript
EventType = "gamejam" | "hackathon"
ApplicationStatus = "draft" | "submitted" | "approved" | "rejected"
UserRole = "user" | "admin"
```

### Main Types
```typescript
User - User profile with auth info
Application - Application form + status
Submission - File submissions (ZIP, trailer)
AdminDocument - Admin-uploaded documents
GameJamEventData - Game Jam specific fields
HackathonEventData - Hackathon specific fields
```

## Styling Approach

### Framework
- **Tailwind CSS** for utility-first CSS
- **PostCSS** for CSS processing
- **Responsive** design with mobile-first approach

### Color Scheme
- **Primary:** Purple (#9333ea)
- **Game Jam:** Purple/Blue accent
- **Hackathon:** Gray/Black accent
- **Success:** Green (#22c55e)
- **Error:** Red (#ef4444)
- **Background:** Gray (#f9fafb)

### Components
- Rounded corners (lg, xl)
- Shadows for depth
- Consistent spacing (4px grid)
- Hover/focus states on interactions

## State Management

### Global State (Auth)
```typescript
// AuthContext
- user: User (Firebase Auth)
- userDoc: FirestoreUser (Firestore)
- loading: boolean
- signOut: () => Promise<void>
```

### Local State (Pages)
```typescript
// Example: Application Form
- formData: ApplicationData
- loading: boolean
- error: string
- success: boolean
```

## Security Architecture

### Authentication
1. Firebase Auth (email/password)
2. Custom JWT tokens
3. Session persistence

### Authorization
1. User role check (user vs admin)
2. Custom claims (admin flag)
3. Firestore rules enforcement

### Data Protection
1. User can only access own data
2. Admin can read all data
3. Sensitive operations require verification
4. API endpoints validate tokens

### API Security
```
Request → Verify Token → Check Admin Claim → Execute → Response
```

## Error Handling

### Client-Side
```typescript
try {
  // Operation
} catch (error) {
  if (error.code === 'auth/user-not-found') {
    // Handle specific error
  } else {
    // Handle generic error
  }
}
```

### Server-Side
```typescript
// API routes
try {
  // Operation
} catch (error) {
  return NextResponse.json(
    { error: error.message },
    { status: 500 }
  );
}
```

### User Feedback
- Toast notifications
- Alert dialogs
- Inline error messages
- Loading states

## Performance Optimizations

### Frontend
- React memo for component memoization
- Lazy loading for routes
- Image optimization
- CSS code splitting

### Backend
- Firestore index optimization
- Query caching where applicable
- Efficient API responses

### Deployment (Phase 2)
- CDN for static assets
- Database replication
- Edge caching

## Testing Strategy

### Unit Tests
- Component rendering
- Utility functions
- Type checking (TypeScript)

### Integration Tests
- Authentication flow
- Application creation
- Admin operations

### E2E Tests
- Full user workflows
- Admin workflows
- Error scenarios

See `TESTING_GUIDE.md` for detailed test cases.

## Development Workflow

### Local Development
```bash
npm run dev                    # Start dev server
npm run build                  # Test production build
npm run lint                   # Check code quality
```

### Version Control
```
main branch - production
dev branch - development
feature branches - new features
```

### Deployment
```bash
firebase deploy                # Deploy all
firebase deploy --only firestore:rules  # Rules only
```

## Dependencies

### Core
- `next: 16.1.6` - React framework
- `react: 19.2.3` - UI library
- `firebase: ^12.8.0` - Auth + Firestore
- `firebase-admin: ^13.6.0` - Server SDK

### Styling
- `tailwindcss: ^4` - CSS framework
- `@tailwindcss/postcss: ^4` - Tailwind plugins

### Development
- `typescript: ^5` - Type safety
- `eslint: ^9` - Linting
- `postcss` - CSS processing

## File Size Reference

```
app/ - ~2.5 MB (pages and routes)
components/ - ~800 KB
lib/ - ~500 KB
public/ - ~1 MB
Total: ~5 MB (before build optimization)
```

## Scalability Considerations

### Current (Phase 1)
- Single region Firestore
- Basic security rules
- Simple authentication

### Phase 2+
- Multi-region replication
- Advanced security rules
- Role-based access control
- Event-based processing
- Caching layer

## Monitoring & Logging (Phase 2)

### What to track
- User registration/login rates
- Application submission rate
- Admin action frequency
- API error rates
- Firestore quota usage

### Tools
- Firebase Analytics
- Cloud Logging
- Error tracking (Sentry/similar)
- Performance monitoring

---

This document is a reference for the project structure and should be updated as the project evolves.

Last Updated: February 2026
Phase: 1
